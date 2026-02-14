'use client';

import { useGestureState } from '@/hooks/useGestureState';

export default function AnnotationStatus() {
  const { state } = useGestureState();

  // Always show the component, display annotation status
  const isAnnotationOn = state?.annotation_mode ?? false;

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition-all ${
        isAnnotationOn 
          ? 'bg-brand-orange-light/20 text-brand-orange-dark border border-brand-orange-light/20' 
          : 'bg-brand-gray-medium/20 text-brand-gray-medium border border-brand-gray-medium/20'
      }`}>
        <span className={`inline-flex h-2 w-2 rounded-full transition-all ${
          isAnnotationOn ? 'bg-brand-orange-light shadow-sm shadow-brand-orange-light/50' : 'bg-brand-gray-medium/60'
        }`} />
        Annotation: {isAnnotationOn ? 'On' : 'Off'}
      </div>
    </div>
  );
}

