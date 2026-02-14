// lib/gesture-state.ts

export interface GestureState {
  mode: 0 | 1;
  annotation_mode: boolean;
  hand_sign_id: number;
  gesture_label: string | null;
  flag: boolean;
  timestamp: number;
  current_tool?: 'select' | 'draw' | 'eraser' | null;
  mic_muted?: boolean;
}

// Singleton state
let currentState: GestureState | null = null;

// Single subscriber (SSE endpoint)
let subscriber: ((state: GestureState) => void) | null = null;

/**
 * Update the current gesture state
 * Called by POST endpoint when Python sends update
 */
export function updateState(newState: GestureState): void {
  currentState = newState;
  
  // Notify SSE subscriber if exists
  if (subscriber) {
    try {
      subscriber(newState);
    } catch (error) {
      // Handle subscriber error (e.g., client disconnected)
      console.error('Error notifying subscriber:', error);
      subscriber = null;
    }
  }
}

/**
 * Get current state
 * Called by SSE endpoint to send initial state
 */
export function getState(): GestureState | null {
  return currentState;
}

/**
 * Subscribe to state changes
 * Called by SSE endpoint when client connects
 * Returns unsubscribe function
 */
export function subscribe(callback: (state: GestureState) => void): () => void {
  // Disconnect previous client if exists
  if (subscriber) {
    subscriber = null;
  }
  
  subscriber = callback;
  
  // Send current state immediately if available
  if (currentState) {
    try {
      callback(currentState);
    } catch (error) {
      console.error('Error sending initial state:', error);
      subscriber = null;
    }
  }
  
  // Return unsubscribe function
  return () => {
    if (subscriber === callback) {
      subscriber = null;
    }
  };
}

