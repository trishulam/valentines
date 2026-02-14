'use client';

import Image from "next/image";

import { MemoryItem } from "@/types/valentines";

interface MemoryCardProps {
  memory: MemoryItem;
  total: number;
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

export const MemoryCard = ({
  memory,
  total,
  currentIndex,
  onNext,
  onPrevious,
  onClose,
}: MemoryCardProps) => {
  const hasImage = memory.imagePath;

  return (
    <div className="animate-valentine-pop rounded-2xl border-2 border-rose-200/40 bg-white/15 p-5 shadow-[0_0_30px_rgba(251,113,133,0.2)] backdrop-blur-lg">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-rose-200/90">Memory</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs text-white/80 hover:bg-white/10"
        >
          Close
        </button>
      </div>

      {hasImage && (
        <div className="relative mb-3 aspect-video overflow-hidden rounded-xl">
          <Image
            src={memory.imagePath!}
            alt={memory.title}
            fill
            unoptimized
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <h3 className="text-base font-semibold text-white">{memory.title}</h3>
      <p className="mt-2 text-sm text-rose-100/90">{memory.description}</p>

      {total > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="rounded-lg border border-white/30 px-3 py-1.5 text-xs text-white hover:bg-white/10"
          >
            Previous
          </button>
          <span className="text-xs text-rose-100/80">
            {currentIndex + 1} / {total}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg border border-white/30 px-3 py-1.5 text-xs text-white hover:bg-white/10"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
