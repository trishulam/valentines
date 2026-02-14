'use client';

import { useMemo, useState } from "react";
import Image from "next/image";

import { BouquetState } from "@/types/valentines";

interface BouquetStageProps {
  bouquet: BouquetState;
}

const bouquetPath: Record<BouquetState["bouquetType"], string> = {
  classic: "/valentines/sprites/bouquet-1.png",
  royal: "/valentines/sprites/bouquet-2.png",
  lotus: "/valentines/sprites/bouquet-1.png",
};

const fallbackEmoji: Record<BouquetState["bouquetType"], string> = {
  classic: "💐",
  royal: "🌹",
  lotus: "🪷",
};

export const BouquetStage = ({ bouquet }: BouquetStageProps) => {
  const [missing, setMissing] = useState(false);
  const path = useMemo(() => bouquetPath[bouquet.bouquetType], [bouquet.bouquetType]);

  if (!bouquet.visible) return null;

  return (
    <div className="animate-valentine-pop rounded-2xl border border-white/35 bg-white/15 p-4 text-center shadow-lg backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-rose-100/90">Bouquet for you</p>
      <div className="mt-2 flex items-center justify-center">
        {!missing ? (
          <Image
            src={path}
            alt="Bouquet"
            width={112}
            height={112}
            unoptimized
            onError={() => setMissing(true)}
            className="h-28 w-28 object-contain drop-shadow-xl"
          />
        ) : (
          <span className="text-6xl">{fallbackEmoji[bouquet.bouquetType]}</span>
        )}
      </div>
      {bouquet.note && (
        <p className="mt-2 text-sm text-rose-100">{bouquet.note}</p>
      )}
    </div>
  );
};
