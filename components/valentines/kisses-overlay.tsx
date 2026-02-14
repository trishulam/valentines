'use client';

import { KissBurst } from "@/types/valentines";

interface KissesOverlayProps {
  bursts: KissBurst[];
}

const KISS_EMOJI = "💋";

export const KissesOverlay = ({ bursts }: KissesOverlayProps) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bursts.map((burst) => {
        const count = Math.min(burst.count, 24);
        return Array.from({ length: count }).map((_, i) => {
          const left = ((i * 17 + burst.createdAt * 0.001) % 97) + 2;
          const top = ((i * 23 + burst.createdAt * 0.002) % 93) + 3;
          const size = 64 + (i % 5) * 20;
          const delay = (i % 5) * 120;
          return (
            <span
              key={`${burst.id}-${i}`}
              className="absolute animate-valentine-kiss-stamp"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                fontSize: `${size}px`,
                animationDelay: `${delay}ms`,
              }}
            >
              {KISS_EMOJI}
            </span>
          );
        });
      })}
    </div>
  );
};
