'use client';

import { MemoryCarouselState } from "@/types/valentines";

interface MemoryCarouselProps {
  carousel: MemoryCarouselState;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

export const MemoryCarousel = ({
  carousel,
  onNext,
  onPrevious,
  onClose,
}: MemoryCarouselProps) => {
  if (!carousel.visible || !carousel.items.length) return null;

  const current = carousel.items[carousel.currentIndex];

  return (
    <section className="rounded-2xl border border-white/30 bg-white/10 p-5 shadow-lg backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Memory carousel</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-white/40 px-2 py-1 text-xs text-white hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <article className="rounded-xl border border-white/35 bg-white/15 p-4">
        <h4 className="text-sm font-semibold text-white">{current.title}</h4>
        <p className="mt-2 text-sm text-rose-100/90">{current.description}</p>
      </article>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="rounded-lg border border-white/35 px-3 py-1.5 text-xs text-white hover:bg-white/10"
        >
          Previous
        </button>

        <p className="text-xs text-rose-100/90">
          {carousel.currentIndex + 1} / {carousel.items.length}
        </p>

        <button
          type="button"
          onClick={onNext}
          className="rounded-lg border border-white/35 px-3 py-1.5 text-xs text-white hover:bg-white/10"
        >
          Next
        </button>
      </div>
    </section>
  );
};
