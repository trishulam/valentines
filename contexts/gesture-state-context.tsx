'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { GestureState } from '@/lib/gesture-state';

interface GestureStateContextValue {
  state: GestureState | null;
  isConnected: boolean;
  error: string | null;
}

const GestureStateContext = createContext<GestureStateContextValue | undefined>(undefined);

export function GestureStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GestureState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Single EventSource connection shared across all components
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      try {
        const eventSource = new EventSource('/api/gesture-stream');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          if (isMounted) {
            setIsConnected(true);
            setError(null);
            reconnectAttemptsRef.current = 0;
            if (process.env.NODE_ENV === 'development') {
              console.log('[GestureStateProvider] SSE connected');
            }
          }
        };

        eventSource.onmessage = (event) => {
          if (isMounted) {
            try {
              const data: GestureState = JSON.parse(event.data);
              setState(data);
            } catch (err) {
              console.error('[GestureStateProvider] Error parsing SSE message:', err);
              setError('Failed to parse gesture state');
            }
          }
        };

        eventSource.onerror = () => {
          if (isMounted) {
            setIsConnected(false);
            
            // Only attempt reconnect if we haven't exceeded max attempts
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
              const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
              reconnectAttemptsRef.current++;
              
              if (process.env.NODE_ENV === 'development') {
                console.log(`[GestureStateProvider] SSE error, reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
              }
              
              reconnectTimeoutRef.current = setTimeout(() => {
                if (isMounted) {
                  connect();
                }
              }, delay);
            } else {
              setError('Failed to connect to gesture stream');
              if (process.env.NODE_ENV === 'development') {
                console.error('[GestureStateProvider] Max reconnect attempts reached');
              }
            }
          }
        };
      } catch (err) {
        if (isMounted) {
          setError('Failed to create EventSource');
          setIsConnected(false);
        }
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <GestureStateContext.Provider value={{ state, isConnected, error }}>
      {children}
    </GestureStateContext.Provider>
  );
}

export function useGestureState() {
  const context = useContext(GestureStateContext);
  
  if (context === undefined) {
    throw new Error('useGestureState must be used within a GestureStateProvider');
  }
  
  return context;
}

