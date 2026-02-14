'use client';

import { useCallback, useEffect, useRef, useState } from "react";

// Hand-picked tender closing lines
const GOODBYE_LINES = [
  "Until stars forget to shine, until time chooses to rest...",
  "I will love you — madly, unshakably, eternally.",
  "Wherever life takes us, I will be there. Beside you.",
  "Not ahead. Not above. But beside you. Loving you. Holding you. Being yours.",
  "Always your Krishna. Always your Purusha. Always your Vamsi.",
  "Forever and only yours.",
];

interface GoodbyeScreenProps {
  onComplete: () => void;
}

const MUSIC_SRC = "/valentines/audio/ending.mp3";
const FADE_DURATION = 3000;

export const GoodbyeScreen = ({ onComplete }: GoodbyeScreenProps) => {
  const [phase, setPhase] = useState<"entering" | "lines" | "sign" | "fading">("entering");
  const [visibleLines, setVisibleLines] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);

  // Music fade helpers
  const fadeInMusic = useCallback(() => {
    try {
      const audio = new Audio(MUSIC_SRC);
      audio.loop = false;
      audio.volume = 0;
      audioRef.current = audio;
      audio.play().catch(() => {});
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / FADE_DURATION, 1);
        audio.volume = p * 0.5;
        if (p < 1) fadeRef.current = requestAnimationFrame(tick);
      };
      fadeRef.current = requestAnimationFrame(tick);
    } catch { /* graceful */ }
  }, []);

  const fadeOutMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const vol = audio.volume;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / FADE_DURATION, 1);
      audio.volume = vol * (1 - p);
      if (p < 1) fadeRef.current = requestAnimationFrame(tick);
      else { audio.pause(); audioRef.current = null; }
    };
    fadeRef.current = requestAnimationFrame(tick);
  }, []);

  // Orchestrate animation stages
  useEffect(() => {
    // Start music as overlay fades in
    fadeInMusic();
    // Let music breathe for 2s before text starts
    const t1 = setTimeout(() => setPhase("lines"), 2000);
    return () => clearTimeout(t1);
  }, [fadeInMusic]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  // Reveal goodbye lines one by one
  useEffect(() => {
    if (phase !== "lines") return;
    if (visibleLines >= GOODBYE_LINES.length) {
      // All lines shown, pause before signature
      const t = setTimeout(() => setPhase("sign"), 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleLines((p) => p + 1), 2000);
    return () => clearTimeout(t);
  }, [phase, visibleLines]);

  // After signature, hold then fade out with music
  useEffect(() => {
    if (phase !== "sign") return;
    const t = setTimeout(() => {
      fadeOutMusic();
      setPhase("fading");
      setTimeout(onComplete, 3000);
    }, 5000);
    return () => clearTimeout(t);
  }, [phase, onComplete, fadeOutMusic]);

  // Floating hearts
  const hearts = Array.from({ length: 14 }).map((_, i) => ({
    symbol: ["♥", "♡"][i % 2],
    left: `${5 + (i * 31) % 90}%`,
    delay: `${(i * 0.9) % 6}s`,
    duration: `${7 + (i % 4) * 2}s`,
    size: `${8 + (i % 3) * 3}px`,
    opacity: 0.06 + (i % 3) * 0.03,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-[2500ms]"
      style={{
        backgroundColor: phase === "fading" ? "transparent" : "rgba(8, 1, 12, 0.92)",
        backdropFilter: phase === "fading" ? "blur(0px)" : "blur(20px)",
        opacity: phase === "entering" ? 0 : phase === "fading" ? 0 : 1,
      }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[30%] top-[30%] h-[35vh] w-[35vh] rounded-full bg-rose-500/[0.06] blur-[90px]" />
        <div className="absolute bottom-[25%] right-[25%] h-[25vh] w-[25vh] rounded-full bg-fuchsia-400/[0.05] blur-[70px]" />
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
      <div className="relative z-10 flex max-w-sm flex-col items-center px-6">
        {/* Goodbye lines */}
        <div className="space-y-4">
          {GOODBYE_LINES.map((line, i) => (
            <p
              key={i}
              className="text-center font-serif text-[15px] italic leading-[1.8] text-rose-200/70 transition-all duration-[1200ms] ease-out"
              style={{
                opacity: i < visibleLines ? 1 : 0,
                transform: i < visibleLines ? "translateY(0)" : "translateY(10px)",
                filter: i < visibleLines ? "blur(0px)" : "blur(3px)",
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Signature + heart */}
        <div
          className="mt-10 flex flex-col items-center gap-2 transition-all duration-[1500ms] ease-out"
          style={{
            opacity: phase === "sign" || phase === "fading" ? 1 : 0,
            transform: phase === "sign" || phase === "fading" ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
          }}
        >
          <div className="mx-auto mb-2 flex items-center gap-2.5">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-rose-300/20" />
            <span className="text-sm text-rose-400/30">&#10084;</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-rose-300/20" />
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-rose-400/40">
            Your Purusha, Your Krishna
          </p>
          <p className="font-serif text-xl font-bold italic text-rose-300/60">
            Vamsi
          </p>
        </div>
      </div>
    </div>
  );
};
