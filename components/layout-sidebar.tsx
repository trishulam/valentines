'use client';

import { useCallback, useMemo, useState } from "react";

import VoiceAgent from "@/components/voice-agent";
import { FlashcardPanel } from "@/components/flashcard-panel";
import { VisualizationPanel } from "@/components/visualization-panel";
import { DeepDivePanel } from "@/components/deepdive-panel";
import GestureStatus from "@/components/gesture-status";
import AnnotationStatus from "@/components/annotation-status";
import MicStatus from "@/components/mic-status";
import Canvas from "@/components/canvas";
import {
  Flashcard,
  FlashcardSessionState,
} from "@/types/flashcard";
import {
  VisualizationState,
  VisualizationActions,
} from "@/types/visualization";
import {
  DeepDiveState,
  DeepDiveActions,
} from "@/types/deepdive";

type ContentView = 'flashcards' | 'visualization' | 'deepdive';

const INITIAL_FLASHCARD_STATE: FlashcardSessionState = {
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  mode: "idle",
  generatedAt: null,
};

const INITIAL_VISUALIZATION_STATE: VisualizationState = {
  imageData: null,
  description: null,
  generatedAt: null,
  mode: 'idle',
};

const INITIAL_DEEPDIVE_STATE: DeepDiveState = {
  imageData: null,
  overviewText: null,
  topic: null,
  generatedAt: null,
  mode: 'idle',
};

export default function LayoutSidebar() {
  const [currentContentView, setCurrentContentView] = useState<ContentView>('flashcards');
  const [flashcardSession, setFlashcardSession] = useState<FlashcardSessionState>(
    INITIAL_FLASHCARD_STATE,
  );
  const [visualizationState, setVisualizationState] = useState<VisualizationState>(
    INITIAL_VISUALIZATION_STATE,
  );
  const [deepDiveState, setDeepDiveState] = useState<DeepDiveState>(
    INITIAL_DEEPDIVE_STATE,
  );

  const handleSetCards = useCallback((cards: Flashcard[]) => {
    setFlashcardSession({
      cards,
      currentIndex: 0,
      isFlipped: false,
      mode: cards.length > 0 ? "reviewing" : "idle",
      generatedAt: cards.length > 0 ? new Date() : null,
    });
  }, []);

  const handleSetMode = useCallback(
    (mode: FlashcardSessionState["mode"]) => {
      setFlashcardSession((prev) => ({
        ...prev,
        mode,
      }));
    },
    [],
  );

  const handleFlipCard = useCallback(() => {
    setFlashcardSession((prev) => ({
      ...prev,
      isFlipped: !prev.isFlipped,
    }));
  }, []);

  const handleNextCard = useCallback(() => {
    setFlashcardSession((prev) => {
      if (prev.currentIndex >= prev.cards.length - 1) {
        return prev; // Already at last card
      }
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        isFlipped: false, // Reset flip when changing cards
      };
    });
  }, []);

  const handlePreviousCard = useCallback(() => {
    setFlashcardSession((prev) => {
      if (prev.currentIndex === 0) {
        return prev; // Already at first card
      }
      return {
        ...prev,
        currentIndex: prev.currentIndex - 1,
        isFlipped: false, // Reset flip when changing cards
      };
    });
  }, []);

  const flashcardActions = useMemo(
    () => ({
      setCards: handleSetCards,
      setMode: handleSetMode,
      flipCard: handleFlipCard,
      nextCard: handleNextCard,
      previousCard: handlePreviousCard,
    }),
    [handleSetCards, handleSetMode, handleFlipCard, handleNextCard, handlePreviousCard],
  );

  const handleSetVisualization = useCallback((imageData: string, description: string) => {
    setVisualizationState({
      imageData,
      description,
      generatedAt: new Date(),
      mode: 'ready',
    });
  }, []);

  const handleSetVisualizationMode = useCallback(
    (mode: VisualizationState['mode']) => {
      setVisualizationState((prev) => ({
        ...prev,
        mode,
      }));
    },
    []
  );

  const handleClearVisualization = useCallback(() => {
    setVisualizationState(INITIAL_VISUALIZATION_STATE);
  }, []);

  const visualizationActions = useMemo(
    () => ({
      setVisualization: handleSetVisualization,
      setMode: handleSetVisualizationMode,
      clearVisualization: handleClearVisualization,
    }),
    [handleSetVisualization, handleSetVisualizationMode, handleClearVisualization]
  );

  const handleSetDeepDive = useCallback((imageData: string, overviewText: string, topic: string) => {
    setDeepDiveState({
      imageData,
      overviewText,
      topic,
      generatedAt: new Date(),
      mode: 'ready',
    });
  }, []);

  const handleSetDeepDiveMode = useCallback(
    (mode: DeepDiveState['mode']) => {
      setDeepDiveState((prev) => ({
        ...prev,
        mode,
      }));
    },
    []
  );

  const handleClearDeepDive = useCallback(() => {
    setDeepDiveState(INITIAL_DEEPDIVE_STATE);
  }, []);

  const deepDiveActions = useMemo(
    () => ({
      setDeepDive: handleSetDeepDive,
      setMode: handleSetDeepDiveMode,
      clearDeepDive: handleClearDeepDive,
    }),
    [handleSetDeepDive, handleSetDeepDiveMode, handleClearDeepDive]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="w-1/3 border-r border-brand-gray-medium/20 bg-white overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Top header with MindPad logo and status indicators */}
          <div className="flex items-center justify-between gap-4">
            <img 
              src="/logo.png" 
              alt="MindPad" 
              className="h-16 w-64 object-contain"
            />
            <div className="flex items-center gap-2">
              <MicStatus />
              <AnnotationStatus />
              <GestureStatus />
            </div>
          </div>

          {/* Voice Agent Component */}
          <VoiceAgent
            flashcardSession={flashcardSession}
            flashcardActions={flashcardActions}
            visualizationState={visualizationState}
            visualizationActions={visualizationActions}
            deepDiveState={deepDiveState}
            deepDiveActions={deepDiveActions}
            setContentView={setCurrentContentView}
          />

          <div className="rounded-2xl border border-brand-gray-medium/20 bg-white/85 p-6 shadow-md shadow-brand-gray-medium/5 backdrop-blur">
            {currentContentView === 'flashcards' ? (
              <FlashcardPanel
                key={
                  flashcardSession.generatedAt
                    ? flashcardSession.generatedAt.toISOString()
                    : "idle"
                }
                cards={flashcardSession.cards}
                mode={flashcardSession.mode}
                currentIndex={flashcardSession.currentIndex}
                isFlipped={flashcardSession.isFlipped}
                flipCard={handleFlipCard}
                nextCard={handleNextCard}
                previousCard={handlePreviousCard}
              />
            ) : currentContentView === 'visualization' ? (
              <VisualizationPanel visualization={visualizationState} />
            ) : (
              <DeepDivePanel deepDive={deepDiveState} />
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Canvas />
      </main>
    </div>
  );
}

