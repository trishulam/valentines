'use client';

import { useGestureState } from '@/hooks/useGestureState';

export default function GestureStatus() {
  const { state } = useGestureState();

  // Always visible - show gesture label when available
  if (!state || !state.gesture_label) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-white/90 border border-brand-gray-medium/20 text-brand-gray-dark shadow-sm">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-gray-medium" />
        {state.gesture_label}
      </div>
    </div>
  );
}

