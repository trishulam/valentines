'use client';

import { LoveCardData } from "@/types/valentines";

interface LoveCardProps {
  card: LoveCardData | null;
  floating?: boolean;
}

const toneClass: Record<LoveCardData["tone"], string> = {
  romantic: "from-rose-100/90 to-pink-100/80",
  playful: "from-fuchsia-100/90 to-rose-100/80",
  poetic: "from-purple-100/90 to-rose-100/80",
  warm: "from-orange-100/90 to-rose-100/80",
};

export const LoveCard = ({ card, floating }: LoveCardProps) => {
  if (!card) return null;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border-2 border-rose-200/50 bg-white/20 p-7 shadow-[0_0_40px_rgba(251,113,133,0.25)] backdrop-blur-lg ${
        floating ? "animate-valentine-pop" : ""
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${toneClass[card.tone]} opacity-90`}
      />
      <div className="pointer-events-none absolute -right-1 -top-1 text-5xl opacity-70">💌</div>
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">Love note</p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-rose-900">{card.title}</h3>
        <p className="mt-4 text-base leading-relaxed text-rose-900">{card.message}</p>
      </div>
    </section>
  );
};
