'use client';

import { useGestureState } from '@/hooks/useGestureState';

export default function MicStatus() {
  const { state } = useGestureState();

  // Always show the component, display mic mute status
  const isMicMuted = state?.mic_muted ?? false;

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition-all ${
        isMicMuted 
          ? 'bg-brand-orange-dark/20 text-brand-orange-dark border border-brand-orange-dark/20' 
          : 'bg-brand-orange-light/20 text-brand-orange-dark border border-brand-orange-light/20'
      }`}>
        <span className={`inline-flex h-2 w-2 rounded-full transition-all ${
          isMicMuted ? 'bg-brand-orange-dark shadow-sm shadow-brand-orange-dark/50' : 'bg-brand-orange-light shadow-sm shadow-brand-orange-light/50'
        }`} />
        Mic: {isMicMuted ? 'Muted' : 'On'}
      </div>
    </div>
  );
}

