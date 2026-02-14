'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { SurpriseState } from "@/types/valentines";

const MUSIC_SRC = "/valentines/audio/othaiyadi-pathayila.mp3";
const FADE_DURATION = 2500;
const LINE_DELAY = 1400;

interface SurpriseModeProps {
  surprise: SurpriseState;
  onClose: () => void;
}

export const SurpriseMode = ({ surprise, onClose }: SurpriseModeProps) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [letterRevealed, setLetterRevealed] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ---- Music ----
  const fadeInMusic = useCallback(() => {
    try {
      const audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;
      audio.play().catch(() => {});
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const p = Math.min(elapsed / FADE_DURATION, 1);
        audio.volume = p * 0.4;
        if (p < 1) fadeRef.current = requestAnimationFrame(tick);
      };
      fadeRef.current = requestAnimationFrame(tick);
    } catch { /* no file — graceful */ }
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

  // ---- Animation stages ----
  useEffect(() => {
    if (!surprise.active) {
      setVisibleLines(0);
      setLetterRevealed(false);
      setOverlayVisible(false);
      fadeOutMusic();
      return;
    }
    requestAnimationFrame(() => setOverlayVisible(true));
    const t0 = setTimeout(() => fadeInMusic(), 300);
    const t1 = setTimeout(() => setLetterRevealed(true), 1200);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, [surprise.active, surprise.key, fadeInMusic, fadeOutMusic]);

  // Reveal lines one by one
  useEffect(() => {
    if (!letterRevealed || !surprise.active) return;
    const total = (surprise.excerpts ?? []).length;
    if (total === 0 || visibleLines >= total) return;
    const timer = setTimeout(() => setVisibleLines((p) => p + 1), LINE_DELAY);
    return () => clearTimeout(timer);
  }, [letterRevealed, visibleLines, surprise.active, surprise.excerpts]);

  // Auto-scroll as new lines appear
  useEffect(() => {
    if (scrollRef.current && visibleLines > 0) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [visibleLines]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const handleClose = useCallback(() => {
    fadeOutMusic();
    onClose();
  }, [fadeOutMusic, onClose]);

  if (!surprise.active) return null;

  const excerpts = surprise.excerpts ?? [];
  const allRevealed = visibleLines >= excerpts.length;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center overflow-hidden transition-all duration-[1500ms]"
      style={{
        backgroundColor: overlayVisible ? "rgba(8, 1, 12, 0.88)" : "transparent",
        backdropFilter: overlayVisible ? "blur(20px)" : "blur(0px)",
      }}
    >
      {/* ---- Ambient light ---- */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[2500ms]"
        style={{ opacity: overlayVisible ? 1 : 0 }}
      >
        <div className="absolute left-[15%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-rose-500/[0.08] blur-[100px]" />
        <div className="absolute bottom-[15%] right-[10%] h-[30vh] w-[30vh] rounded-full bg-fuchsia-400/[0.06] blur-[80px]" />
        <div className="absolute left-[50%] top-[60%] h-[25vh] w-[25vh] -translate-x-1/2 rounded-full bg-pink-300/[0.05] blur-[70px]" />
      </div>

      {/* ---- Floating hearts ---- */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-[3000ms]"
        style={{ opacity: letterRevealed ? 1 : 0 }}
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: `${4 + Math.random() * 92}%`,
              bottom: "-24px",
              animationName: "surpriseDrift",
              animationDuration: `${7 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 8}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationFillMode: "both",
              fontSize: `${8 + Math.random() * 10}px`,
              color: `rgba(251, 113, 133, ${0.1 + Math.random() * 0.15})`,
            }}
          >
            {["♥", "♡"][i % 2]}
          </span>
        ))}
      </div>

      {/* ---- Letter ---- */}
      <div
        className="relative z-10 flex w-full max-w-sm flex-col items-center px-4 transition-all duration-[1200ms] ease-out"
        style={{
          opacity: letterRevealed ? 1 : 0,
          transform: letterRevealed ? "translateY(0) scale(1)" : "translateY(40px) scale(0.96)",
        }}
      >
        <div
          className="animate-surprise-glow w-full overflow-hidden rounded-[28px] border border-white/[0.08]"
          style={{
            background: "linear-gradient(170deg, rgba(255,252,253,0.97) 0%, rgba(254,242,244,0.96) 40%, rgba(253,240,245,0.95) 100%)",
            maxHeight: "75vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Fixed top section */}
          <div className="shrink-0 px-7 pt-8 pb-0">
            {/* Wax seal */}
            <div className="relative mx-auto mb-5 flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-[-6px] rounded-full bg-rose-400/15 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-rose-600 to-rose-800 shadow-md shadow-rose-600/25 ring-2 ring-rose-300/20">
                <span className="font-serif text-base font-bold text-rose-50">V</span>
              </div>
            </div>

            {/* Agent message */}
            {surprise.message && (
              <p
                className="mb-4 text-center font-serif text-[15px] italic leading-[1.7] text-rose-800/75 transition-opacity duration-700"
                style={{ opacity: letterRevealed ? 1 : 0, transitionDelay: "500ms" }}
              >
                &ldquo;{surprise.message}&rdquo;
              </p>
            )}

            {/* Divider */}
            <div className="mx-auto flex items-center gap-2.5 pb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-300/30 to-transparent" />
              <span className="text-[10px] text-rose-300/40">&#10084;&#65039;</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-300/30 to-transparent" />
            </div>
          </div>

          {/* Scrollable excerpts area */}
          <div
            ref={scrollRef}
            className="scrollbar-hide flex-1 overflow-y-auto overscroll-contain px-7 pb-6"
            style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }}
          >
            <div className="space-y-5">
              {excerpts.map((excerpt, i) => (
                <div
                  key={`${surprise.key}-${i}`}
                  className="transition-all ease-out"
                  style={{
                    opacity: i < visibleLines ? 1 : 0,
                    transform: i < visibleLines ? "translateY(0)" : "translateY(14px)",
                    filter: i < visibleLines ? "blur(0px)" : "blur(3px)",
                    transitionDuration: "900ms",
                  }}
                >
                  <div className={i < visibleLines ? "animate-surprise-shimmer rounded-lg px-1 py-1.5" : "px-1 py-1.5"}>
                    <p className="text-center font-serif text-[13.5px] leading-[1.85] text-rose-900/70">
                      {excerpt}
                    </p>
                  </div>

                  {i < excerpts.length - 1 && i < visibleLines - 1 && (
                    <div className="mt-4 flex justify-center gap-1.5">
                      <span className="inline-block h-1 w-1 rounded-full bg-rose-300/30" />
                      <span className="inline-block h-1 w-1 rounded-full bg-rose-300/20" />
                      <span className="inline-block h-1 w-1 rounded-full bg-rose-300/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Signature */}
            <div
              className="mt-7 pb-2 transition-all duration-[1200ms] ease-out"
              style={{
                opacity: allRevealed ? 1 : 0,
                transform: allRevealed ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <div className="mx-auto mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200/30 to-transparent" />
              </div>
              <p className="text-center text-[10px] font-medium tracking-[0.25em] text-rose-400/50">
                FOREVER & ONLY YOURS
              </p>
              <p className="mt-1.5 text-center font-serif text-lg font-bold italic text-rose-600/65">
                Vamsi
              </p>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="mt-7 rounded-full border border-rose-300/15 bg-white/[0.07] px-8 py-3 text-[13px] font-medium tracking-wide text-rose-200/80 shadow-lg shadow-rose-900/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:text-rose-100 active:scale-95"
          style={{
            opacity: allRevealed ? 1 : 0,
            pointerEvents: allRevealed ? "auto" : "none",
            transition: "opacity 1s ease, background 0.3s, color 0.3s, transform 0.15s",
          }}
        >
          Close with Love
        </button>
      </div>
    </div>
  );
};
