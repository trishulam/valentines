'use client';

import { useEffect, useMemo, useRef, useState } from "react";

interface FloatingPhoto {
  src: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  z: number;
  swayDuration: number;
  swayAmount: number;
}

const TOTAL_VISIBLE = 15_000;
const STAGGER = 350;

interface MemoryGalleryProps {
  visible: boolean;
  images: string[];
  onClose: () => void;
}

export const MemoryGallery = ({
  visible,
  images,
  onClose,
}: MemoryGalleryProps) => {
  const [phase, setPhase] = useState<"hidden" | "entering" | "fading">("hidden");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const photos: FloatingPhoto[] = useMemo(() => {
    if (!images.length) return [];
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    return shuffled.map((src, i) => ({
      src,
      x: 3 + Math.random() * 72,
      y: 3 + Math.random() * 60,
      rotation: -14 + Math.random() * 28,
      scale: 0.6 + Math.random() * 0.35,
      delay: i * STAGGER,
      z: 10 + i,
      swayDuration: 4 + Math.random() * 3,
      swayAmount: 3 + Math.random() * 5,
    }));
  }, [images]);

  useEffect(() => {
    if (visible) {
      setPhase("entering");

      const lastIn = photos.length * STAGGER;
      const fadeAt = Math.max(lastIn + 2500, TOTAL_VISIBLE - 3500);

      timerRef.current = setTimeout(() => {
        setPhase("fading");
        timerRef.current = setTimeout(() => {
          setPhase("hidden");
          onClose();
        }, 3500);
      }, fadeAt);
    } else {
      setPhase("hidden");
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, photos.length, onClose]);

  if (!visible && phase === "hidden") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden transition-opacity duration-[3500ms]"
      style={{ opacity: phase === "fading" ? 0 : 1 }}
    >
      {/* Warm ambient tint behind the photos */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{ opacity: phase !== "hidden" ? 1 : 0 }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute left-1/3 top-1/3 h-[50vh] w-[50vh] rounded-full bg-rose-500/[0.06] blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[35vh] w-[35vh] rounded-full bg-fuchsia-400/[0.05] blur-[80px]" />
      </div>

      {photos.map((photo, i) => (
        <div
          key={`${photo.src}-${i}`}
          className="absolute"
          style={{
            left: `${photo.x}%`,
            top: `${photo.y}%`,
            zIndex: photo.z,
            opacity: phase !== "hidden" ? 1 : 0,
            transform: `
              rotate(${photo.rotation}deg)
              scale(${phase !== "hidden" ? photo.scale : 0.2})
            `,
            transition: `opacity 1.2s ease ${photo.delay}ms, transform 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${photo.delay}ms`,
          }}
        >
          <div
            className="relative"
            style={{
              animation: phase === "entering"
                ? `sway ${photo.swayDuration}s ease-in-out ${photo.delay + 1200}ms infinite alternate`
                : "none",
            }}
          >
            {/* Polaroid card */}
            <div
              className="overflow-hidden rounded-lg bg-white/95 shadow-[0_4px_30px_rgba(0,0,0,0.25)]"
              style={{
                width: "clamp(90px, 16vw, 160px)",
                padding: "5px 5px 20px 5px",
              }}
            >
              <img
                src={photo.src}
                alt=""
                className="aspect-[4/5] w-full rounded-[3px] object-cover"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement!.style.display = "none";
                }}
              />
            </div>
            {/* Soft glow */}
            <div className="absolute -inset-3 -z-10 rounded-2xl bg-rose-300/[0.07] blur-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
};
