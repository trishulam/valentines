import { tool } from "@openai/agents";
import { z } from "zod";

import type { Flashcard, FlashcardSessionState, FlashcardActions } from "@/types/flashcard";
import { playToolCue } from "@/lib/audio";

export const createGenerateFlashcardsTool = (
  actions: FlashcardActions,
  setContentView: (view: 'flashcards' | 'visualization') => void
) =>
  tool({
    name: "generate_flashcards",
    description: "Generate a deck of study flashcards for a requested topic.",
    parameters: z.object({
      topic: z
        .string()
        .min(2, "Topic should be at least two characters long."),
      focus: z
        .string()
        .min(2, "Focus should be at least two characters long.")
        .optional(),
    }),
    execute: async ({ topic, focus }) => {
      console.log(
        "[flashcards] generate_flashcards tool invoked",
        JSON.stringify({ topic, focus }),
      );

      try {
        // Switch to flashcards view immediately to show loading state
        setContentView('flashcards');
        actions.setMode("generating");

        const response = await fetch("/api/generate-flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, focus }),
        });

        const payload = await response.json();

        if (!response.ok || payload.success === false) {
          throw new Error(payload.error ?? "Unable to generate flashcards");
        }

        const flashcards: Flashcard[] = payload.flashcards;
        actions.setCards(flashcards);
        actions.setMode("reviewing");

        console.log(
          "[flashcards] generation success",
          JSON.stringify({
            count: flashcards.length,
            titles: flashcards.map((card) => card.title),
          }),
        );

        const result = {
          success: true,
          message: `Generated ${flashcards.length} flashcards on ${topic}.`,
        };

        playToolCue(result);
        return result;
      } catch (error) {
        actions.setMode("idle");
        const reason =
          error instanceof Error ? error.message : "Unknown generation error";

        console.error(
          "[flashcards] generation failed",
          JSON.stringify({ topic, focus, error: reason }),
        );

        const result = {
          success: false,
          message: `I couldn't generate flashcards: ${reason}`,
        };
        playToolCue(result);
        return result;
      }
    },
  });

export const createGetCurrentFlashcardTool = (
  getFlashcardSession: () => FlashcardSessionState,
) =>
  tool({
    name: "get_current_flashcard_context",
    description: "Get information about the current flashcard being reviewed. Use this to understand what flashcard the user is looking at, so you can provide relevant guidance and discussion.",
    parameters: z.object({}),
    execute: async () => {
      console.log("[flashcards] get_current_flashcard_context tool invoked");

      const flashcardSession = getFlashcardSession();

      if (flashcardSession.cards.length === 0) {
        return {
          success: false,
          available: false,
          message: "No flashcards are currently loaded.",
        };
      }

      const currentCard = flashcardSession.cards[flashcardSession.currentIndex];
      const position = `${flashcardSession.currentIndex + 1} of ${flashcardSession.cards.length}`;

      const result = {
        success: true,
        available: true,
        title: currentCard.title,
        question: currentCard.question,
        coreIdea: currentCard.coreIdea,
        isFlipped: flashcardSession.isFlipped,
        answer: flashcardSession.isFlipped ? currentCard.answer : "[hidden - do not reveal]",
        position: position,
        source: currentCard.source || null,
        message: `Current flashcard: "${currentCard.title}" (${position}). ${flashcardSession.isFlipped ? "Answer is revealed." : "Showing question side."}`,
      };

      console.log("[flashcards] context retrieved", JSON.stringify(result));
      return result;
    },
  });

export const createFlipFlashcardTool = (flipCard: () => void) =>
  tool({
    name: "flip_flashcard",
    description: "Flip the current flashcard to show or hide the answer. Use this when the user asks to see the answer or flip the card.",
    parameters: z.object({}),
    execute: async () => {
      console.log("[flashcards] flip_flashcard tool invoked");

      try {
        flipCard();
        const result = {
          success: true,
          message: "Card flipped.",
        };
        playToolCue(result);
        return result;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown error";
        console.error("[flashcards] flip failed", reason);
        const result = {
          success: false,
          message: `Could not flip card: ${reason}`,
        };
        playToolCue(result);
        return result;
      }
    },
  });

export const createNextFlashcardTool = (nextCard: () => void) =>
  tool({
    name: "next_flashcard",
    description: "Navigate to the next flashcard in the deck. Use this when the user wants to move forward or go to the next card.",
    parameters: z.object({}),
    execute: async () => {
      console.log("[flashcards] next_flashcard tool invoked");

      try {
        nextCard();
        const result = {
          success: true,
          message: "Moved to next card.",
        };
        playToolCue(result);
        return result;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown error";
        console.error("[flashcards] next failed", reason);
        const result = {
          success: false,
          message: `Could not move to next card: ${reason}`,
        };
        playToolCue(result);
        return result;
      }
    },
  });

export const createPreviousFlashcardTool = (previousCard: () => void) =>
  tool({
    name: "previous_flashcard",
    description: "Navigate to the previous flashcard in the deck. Use this when the user wants to go back or see the previous card.",
    parameters: z.object({}),
    execute: async () => {
      console.log("[flashcards] previous_flashcard tool invoked");

      try {
        previousCard();
        const result = {
          success: true,
          message: "Moved to previous card.",
        };
        playToolCue(result);
        return result;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown error";
        console.error("[flashcards] previous failed", reason);
        const result = {
          success: false,
          message: `Could not move to previous card: ${reason}`,
        };
        playToolCue(result);
        return result;
      }
    },
  });

