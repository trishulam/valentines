'use client';

import { QuizState } from "@/types/valentines";
import { cn } from "@/lib/utils";

interface QuizPanelProps {
  quiz: QuizState;
  onFlip: () => void;
  onNext: () => void;
  onEnd: () => void;
}

export const QuizPanel = ({ quiz, onFlip, onNext, onEnd }: QuizPanelProps) => {
  if (!quiz.active || quiz.cards.length === 0) return null;

  const card = quiz.cards[quiz.currentIndex];
  const isLast = quiz.currentIndex >= quiz.cards.length - 1;

  return (
    <div className="flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Card */}
      <div className="relative h-56 w-full max-w-sm perspective-1200">
        <div
          className={cn(
            "relative h-full w-full rounded-2xl transition-transform duration-500 ease-out transform-style-3d",
            quiz.isFlipped ? "rotate-y-180" : "rotate-y-0",
          )}
        >
          {/* Front — Question */}
          <article className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-rose-300/40 bg-gradient-to-br from-rose-50/95 to-fuchsia-50/90 p-6 shadow-xl shadow-rose-500/10 backface-hidden backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-400">
              {quiz.currentIndex + 1} / {quiz.cards.length}
            </p>
            <p className="text-center text-lg font-semibold leading-relaxed text-rose-950/80">
              {card.question}
            </p>
            <p className="mt-auto text-[10px] text-rose-400/60">Tap flip to reveal</p>
          </article>

          {/* Back — Answer */}
          <article className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-fuchsia-300/50 bg-gradient-to-br from-fuchsia-100/95 to-rose-100/90 p-6 shadow-xl shadow-fuchsia-500/10 rotate-y-180 backface-hidden backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-500">
              Answer
            </p>
            <p className="text-center text-lg font-semibold leading-relaxed text-fuchsia-950/80">
              {card.answer}
            </p>
          </article>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onFlip}
          className="rounded-xl border border-rose-300/40 bg-white/80 px-5 py-2.5 text-sm font-semibold text-rose-600 shadow-md backdrop-blur-sm transition-all hover:bg-rose-50 hover:shadow-lg active:scale-95"
        >
          {quiz.isFlipped ? "Hide" : "Flip"}
        </button>

        {!isLast && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-xl border border-fuchsia-300/40 bg-gradient-to-r from-rose-500/90 to-fuchsia-500/90 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            Next &rarr;
          </button>
        )}

        <button
          type="button"
          onClick={onEnd}
          className="rounded-xl border border-rose-200/40 bg-white/60 px-4 py-2.5 text-xs font-medium text-rose-400/80 shadow-sm backdrop-blur-sm transition-all hover:bg-rose-50 hover:text-rose-500 active:scale-95"
        >
          End Quiz
        </button>
      </div>
    </div>
  );
};
