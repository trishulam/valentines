'use client';

import { useCallback, useEffect, useState } from "react";
import { letterExcerpts } from "@/lib/valentines/context";

// Pick 6 short, punchy excerpts for the landing rotation
const LANDING_EXCERPTS = [
  "You were written for me. By something higher.",
  "This isn't just love. It's destined. Fated. Sacred.",
  "I LOVE YOU. In ways this world can't measure.",
  "That was the night you told me you loved me. I already did.",
  "You broke through walls I swore no one would ever cross.",
  "Wherever life takes us, I will be there. Beside you.",
  "You empower me, Babloo. To build. To lead. To dream.",
  "Waking up next to you, just holding hands, felt like love.",
];

interface LandingScreenProps {
  onConnect: () => void;
}

export const LandingScreen = ({ onConnect }: LandingScreenProps) => {
  const [excerptIndex, setExcerptIndex] = useState(0);
  const [excerptVisible, setExcerptVisible] = useState(true);

  // Rotate excerpts every 4 seconds with a fade transition
  useEffect(() => {
    const fadeOut = setInterval(() => {
      setExcerptVisible(false);
      setTimeout(() => {
        setExcerptIndex((prev) => (prev + 1) % LANDING_EXCERPTS.length);
        setExcerptVisible(true);
      }, 600);
    }, 4000);

    return () => clearInterval(fadeOut);
  }, []);

  // Floating hearts data (stable)
  const hearts = Array.from({ length: 18 }).map((_, i) => ({
    symbol: ["♥", "♡", "✦"][i % 3],
    left: `${3 + (i * 37) % 94}%`,
    delay: `${(i * 1.3) % 8}s`,
    duration: `${8 + (i % 5) * 2}s`,
    size: `${9 + (i % 4) * 4}px`,
    opacity: 0.08 + (i % 4) * 0.04,
  }));

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-valentine-gradient px-6">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-[25%] h-[40vh] w-[40vh] rounded-full bg-rose-500/[0.07] blur-[100px]" />
        <div className="absolute bottom-[20%] right-[15%] h-[30vh] w-[30vh] rounded-full bg-fuchsia-400/[0.06] blur-[80px]" />
      </div>

      {/* Floating hearts */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {hearts.map((h, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: h.left,
              bottom: "-20px",
              animationName: "surpriseDrift",
              animationDuration: h.duration,
              animationDelay: h.delay,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationFillMode: "both",
              fontSize: h.size,
              color: `rgba(251, 113, 133, ${h.opacity})`,
            }}
          >
            {h.symbol}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-rose-300/50">
            Happy Valentine&apos;s Day
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-white/90 sm:text-5xl">
            For My Pondati
          </h1>
          <p className="mt-2 text-sm tracking-wide text-rose-200/40">
            from your Krishna
          </p>
        </div>

        {/* Rotating excerpt */}
        <div className="h-16 max-w-sm">
          <p
            className="text-center font-serif text-[15px] italic leading-relaxed text-rose-200/60 transition-all duration-500"
            style={{
              opacity: excerptVisible ? 1 : 0,
              transform: excerptVisible ? "translateY(0)" : "translateY(6px)",
            }}
          >
            &ldquo;{LANDING_EXCERPTS[excerptIndex]}&rdquo;
          </p>
        </div>

        {/* Connect button */}
        <button
          type="button"
          onClick={onConnect}
          className="group relative mt-2"
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-3 animate-valentine-pulse rounded-full bg-rose-500/10 blur-xl" />

          <div className="relative flex items-center gap-3 rounded-full border border-rose-200/25 bg-white/[0.07] px-10 py-4 shadow-2xl shadow-rose-900/20 backdrop-blur-md transition-all duration-300 group-hover:border-rose-200/40 group-hover:bg-white/[0.12] group-hover:shadow-rose-500/20 group-active:scale-[0.97]">
            {/* Pulsing heart */}
            <span className="text-lg text-rose-400/80 transition-transform duration-300 group-hover:scale-110">
              &#10084;
            </span>
            <span className="text-lg font-medium tracking-widest text-white/85">
              Connect
            </span>
          </div>
        </button>

        {/* Subtle hint */}
        <p className="mt-1 text-[11px] text-rose-300/25">
          tap to begin
        </p>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-rose-400/20" />
        <span className="text-[10px] text-rose-400/20">&#10084;</span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-rose-400/20" />
      </div>
    </div>
  );
};
