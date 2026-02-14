'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FlowerRain } from "@/components/valentines/flower-rain";
import { GoodbyeScreen } from "@/components/valentines/goodbye-screen";
import { KissesOverlay } from "@/components/valentines/kisses-overlay";
import { LandingScreen } from "@/components/valentines/landing-screen";
import { LoveCard } from "@/components/valentines/love-card";
import { MemoryGallery } from "@/components/valentines/memory-gallery";
import { SurpriseMode } from "@/components/valentines/surprise-mode";
import { VoicePill } from "@/components/valentines/voice-pill";
import { useValentineVoiceAgent } from "@/hooks/useValentineVoiceAgent";
import { letterExcerpts, memoryGalleryImages } from "@/lib/valentines/context";
import { QuizPanel } from "@/components/valentines/quiz-panel";
import {
  KissBurst,
  LoveCardData,
  QuizCard,
  SurpriseType,
  ValentineUIState,
} from "@/types/valentines";

const INITIAL_STATE: ValentineUIState = {
  activeCard: null,
  kissBursts: [],
  bouquet: {
    visible: false,
    bouquetType: "classic",
    note: null,
    key: 0,
  },
  flowerRain: {
    active: false,
    intensity: 12,
    until: null,
  },
  memoryGallery: {
    visible: false,
  },
  surprise: {
    active: false,
    surpriseType: "moonlit",
    message: null,
    excerpts: [],
    key: 0,
  },
  quiz: {
    active: false,
    cards: [],
    currentIndex: 0,
    isFlipped: false,
  },
};

export const ValentineShell = () => {
  const [uiState, setUiState] = useState<ValentineUIState>(INITIAL_STATE);
  const uiStateRef = useRef(uiState);
  useEffect(() => { uiStateRef.current = uiState; }, [uiState]);
  const [isConnected, setIsConnected] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);

  const uiActions = useMemo(
    () => ({
      setLoveCard: (card: LoveCardData) => {
        setUiState((prev) => ({ ...prev, activeCard: card }));
      },
      clearLoveCard: () => {
        setUiState((prev) => ({ ...prev, activeCard: null }));
      },
      addKissBurst: (burst: Omit<KissBurst, "id" | "createdAt">) => {
        setUiState((prev) => ({
          ...prev,
          kissBursts: [
            ...prev.kissBursts,
            {
              ...burst,
              id: `kiss-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              createdAt: Date.now(),
            },
          ],
        }));
      },
      removeKissBurst: (id: string) => {
        setUiState((prev) => ({
          ...prev,
          kissBursts: prev.kissBursts.filter((burst) => burst.id !== id),
        }));
      },
      setBouquet: (bouquetType: import("@/types/valentines").BouquetType, note?: string) => {
        setUiState((prev) => ({
          ...prev,
          bouquet: {
            visible: true,
            bouquetType,
            note: note ?? null,
            key: prev.bouquet.key + 1,
          },
        }));
      },
      clearBouquet: () => {
        setUiState((prev) => ({ ...prev, bouquet: { ...prev.bouquet, visible: false } }));
      },
      startFlowerRain: (intensity: number, seconds: number) => {
        setUiState((prev) => ({
          ...prev,
          flowerRain: {
            active: true,
            intensity,
            until: Date.now() + seconds * 1000,
          },
        }));
      },
      stopFlowerRain: () => {
        setUiState((prev) => ({
          ...prev,
          flowerRain: { ...prev.flowerRain, active: false, until: null },
        }));
      },
      showMemoryGallery: () => {
        setUiState((prev) => ({
          ...prev,
          memoryGallery: { visible: true },
        }));
      },
      hideMemoryGallery: () => {
        setUiState((prev) => ({
          ...prev,
          memoryGallery: { visible: false },
        }));
      },
      triggerSurprise: (surpriseType: SurpriseType, message?: string) => {
        // Pick 4 random letter excerpts, shuffled
        const shuffled = [...letterExcerpts].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, 4);
        setUiState((prev) => ({
          ...prev,
          surprise: {
            active: true,
            surpriseType,
            message: message ?? "You are deeply loved, now and always.",
            excerpts: picked,
            key: prev.surprise.key + 1,
          },
        }));
      },
      clearSurprise: () => {
        setUiState((prev) => ({
          ...prev,
          surprise: { ...prev.surprise, active: false, excerpts: [] },
        }));
      },
      startQuiz: (cards: QuizCard[]) => {
        setUiState((prev) => ({
          ...prev,
          quiz: { active: true, cards, currentIndex: 0, isFlipped: false },
        }));
      },
      flipQuizCard: () => {
        setUiState((prev) => ({
          ...prev,
          quiz: { ...prev.quiz, isFlipped: !prev.quiz.isFlipped },
        }));
      },
      nextQuizCard: () => {
        setUiState((prev) => {
          const next = Math.min(prev.quiz.currentIndex + 1, prev.quiz.cards.length - 1);
          return {
            ...prev,
            quiz: { ...prev.quiz, currentIndex: next, isFlipped: false },
          };
        });
      },
      getQuizCard: () => uiStateRef.current.quiz,
      endQuiz: () => {
        setUiState((prev) => ({
          ...prev,
          quiz: { active: false, cards: [], currentIndex: 0, isFlipped: false },
        }));
      },
    }),
    [],
  );

  const {
    status,
    error,
    isMicrophoneReady,
    isMicMuted,
    connectAgent,
    disconnectAgent,
    toggleMic,
  } = useValentineVoiceAgent(uiActions);

  const handleConnect = useCallback(() => {
    connectAgent();
    setIsConnected(true);
  }, [connectAgent]);

  const handleDisconnect = useCallback(() => {
    disconnectAgent();
    setShowGoodbye(true);
  }, [disconnectAgent]);

  const handleGoodbyeComplete = useCallback(() => {
    setShowGoodbye(false);
    setIsConnected(false);
    setUiState(INITIAL_STATE);
  }, []);

  useEffect(() => {
    if (!uiState.kissBursts.length) return;
    const timers = uiState.kissBursts.map((burst) =>
      window.setTimeout(() => uiActions.removeKissBurst(burst.id), 4100),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [uiActions, uiState.kissBursts]);

  useEffect(() => {
    if (!uiState.flowerRain.active || !uiState.flowerRain.until) return;
    const msLeft = uiState.flowerRain.until - Date.now();
    if (msLeft <= 0) {
      uiActions.stopFlowerRain();
      return;
    }
    const timer = window.setTimeout(() => uiActions.stopFlowerRain(), msLeft);
    return () => window.clearTimeout(timer);
  }, [uiActions, uiState.flowerRain.active, uiState.flowerRain.until]);

  const closeSurprise = useCallback(() => uiActions.clearSurprise(), [uiActions]);

  if (!isConnected) {
    return <LandingScreen onConnect={handleConnect} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-valentine-gradient">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-rose-900/40 via-fuchsia-800/35 to-purple-950/55" />

      <FlowerRain active={uiState.flowerRain.active} intensity={uiState.flowerRain.intensity} />
      <KissesOverlay bursts={uiState.kissBursts} />
      <SurpriseMode surprise={uiState.surprise} onClose={closeSurprise} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <VoicePill
          status={status}
          error={error}
          isMicMuted={isMicMuted}
          onDisconnect={handleDisconnect}
          onToggleMic={toggleMic}
        />

        <main className="relative flex-1">
          {uiState.activeCard && (
            <div className="absolute left-1/2 top-1/3 z-20 w-full max-w-md -translate-x-1/2 px-4">
              <LoveCard card={uiState.activeCard} floating />
            </div>
          )}

          {uiState.quiz.active && (
            <div className="absolute left-1/2 top-1/4 z-20 w-full max-w-md -translate-x-1/2 px-4">
              <QuizPanel
                quiz={uiState.quiz}
                onFlip={uiActions.flipQuizCard}
                onNext={uiActions.nextQuizCard}
                onEnd={uiActions.endQuiz}
              />
            </div>
          )}

          <MemoryGallery
            visible={uiState.memoryGallery.visible}
            images={memoryGalleryImages}
            onClose={uiActions.hideMemoryGallery}
          />
        </main>
      </div>

      {showGoodbye && <GoodbyeScreen onComplete={handleGoodbyeComplete} />}
    </div>
  );
};
