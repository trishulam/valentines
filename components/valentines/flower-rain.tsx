'use client';

interface FlowerRainProps {
  active: boolean;
  intensity: number;
}

const YELLOW_FLOWER = "🌼";

export const FlowerRain = ({ active, intensity }: FlowerRainProps) => {
  if (!active) return null;

  const petals = Array.from({ length: intensity });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((_, i) => {
        const left = (i * 41) % 100;
        const delay = (i % 11) * 160;
        const duration = 4200 + (i % 7) * 500;
        const size = 24 + (i % 4) * 4;

        return (
          <div
            key={`petal-${i}`}
            className="absolute top-[-12%] animate-valentine-fall"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}ms`,
              animationDuration: `${duration}ms`,
            }}
          >
            <span
              className="opacity-90"
              style={{ fontSize: `${size}px` }}
            >
              {YELLOW_FLOWER}
            </span>
          </div>
        );
      })}
    </div>
  );
};
