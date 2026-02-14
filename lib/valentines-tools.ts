import { tool } from "@openai/agents";
import { z } from "zod";

import { playToolCue } from "@/lib/audio";
import { ValentineUIActions, QuizCard } from "@/types/valentines";

const MAX_KISSES = 30;
const MAX_FLOWER_RAIN_SECONDS = 16;
const MAX_FLOWER_RAIN_INTENSITY = 36;

export const createShowLoveCardTool = (actions: ValentineUIActions) =>
  tool({
    name: "show_love_card",
    description:
      "Show a love note card to Vanya. YOU write the title and message in Vamsi's voice — sweet, personal, addressed to her (Babloo, pondati, kutty). Pass the strings you write.",
    parameters: z.object({
      title: z.string().describe("Short title you write, e.g. 'For my Radha'"),
      message: z.string().describe("1-2 sentences you write — your own words, in your voice"),
    }),
    execute: async ({ title, message }) => {
      actions.setLoveCard({ title, message, tone: "romantic" });
      const result = { success: true, message: "Love card displayed" };
      playToolCue(result);
      return result;
    },
  });

export const createSendKissesTool = (actions: ValentineUIActions) =>
  tool({
    name: "send_kisses",
    description:
      "Send kisses to Vanya — playful affection. Use when she speaks, when you respond warmly, or when the moment is romantic. Give kisses freely.",
    parameters: z.object({
      count: z.number().describe("Number of kisses to send, e.g. 5"),
    }),
    execute: async ({ count }) => {
      actions.clearLoveCard();
      const safeCount = Math.max(1, Math.min(count || 6, MAX_KISSES));
      actions.addKissBurst({ count: safeCount, style: "classic" });
      const result = { success: true, message: "Kisses sent" };
      playToolCue(result);
      return result;
    },
  });

export const createGiveBouquetTool = (actions: ValentineUIActions) =>
  tool({
    name: "give_bouquet",
    description:
      "Gift flowers to Vanya — triggers flower rain. Use when celebrating, reminiscing, or when she shares something. Give flowers proactively.",
    parameters: z.object({
      note: z.string().describe("A short sweet note to go with the bouquet"),
    }),
    execute: async ({ note }) => {
      actions.clearLoveCard();
      actions.setBouquet("classic", note || undefined);
      actions.startFlowerRain(24, 10);
      const result = { success: true, message: "Bouquet gifted" };
      playToolCue(result);
      return result;
    },
  });

export const createStartFlowerRainTool = (actions: ValentineUIActions) =>
  tool({
    name: "start_flower_rain",
    description:
      "Start flower rain for Vanya — a celebratory moment. Use for special romantic moments.",
    parameters: z.object({
      intensity: z.number().describe("How many flowers per second, e.g. 16"),
      seconds: z.number().describe("How long the rain lasts, e.g. 7"),
    }),
    execute: async ({ intensity, seconds }) => {
      actions.clearLoveCard();
      actions.startFlowerRain(
        Math.min(Math.max(intensity || 16, 4), MAX_FLOWER_RAIN_INTENSITY),
        Math.min(Math.max(seconds || 7, 2), MAX_FLOWER_RAIN_SECONDS),
      );
      const result = { success: true, message: "Flower rain started" };
      playToolCue(result);
      return result;
    },
  });

export const createShowMemoryGalleryTool = (actions: ValentineUIActions) =>
  tool({
    name: "show_memory_gallery",
    description:
      "Show Vanya the photo gallery — journey down memory lane with your pics together. Use when she asks for memories, when reminiscing, or to surprise her.",
    parameters: z.object({}),
    execute: async () => {
      actions.clearLoveCard();
      actions.showMemoryGallery();
      const result = { success: true, message: "Memory gallery displayed" };
      playToolCue(result);
      return result;
    },
  });

export const createTriggerSurpriseModeTool = (actions: ValentineUIActions) =>
  tool({
    name: "trigger_surprise_mode",
    description:
      "Open a love letter surprise for Vanya — an envelope unfolds and reveals real excerpts from your letters to her one by one. Your message appears as the opening line. Use for big romantic moments, dramatic confessions, or when you want to make her cry happy tears. Save this for special moments — don't overuse.",
    parameters: z.object({
      message: z.string().describe("A short personal line that opens the letter, e.g. 'Babloo, do you know how much you mean to me?' or 'Pondati, let me remind you of something...'"),
    }),
    execute: async ({ message }) => {
      actions.clearLoveCard();
      actions.triggerSurprise("moonlit", message);
      const result = { success: true, message: "Love letter surprise activated — envelope unfolds with your real letter excerpts." };
      playToolCue(result);
      return result;
    },
  });

// ─── Quiz tools ───

export const createStartQuizTool = (actions: ValentineUIActions) =>
  tool({
    name: "start_love_quiz",
    description:
      "Start a love quiz for Vanya! Generate 3-5 fun questions about your relationship (Malaviya Hall, ECR, nicknames, inside jokes, future plans). Each card has a question and answer. Be playful and sweet. Start this proactively during conversation to surprise her.",
    parameters: z.object({
      cards: z.string().describe(
        'JSON array of quiz cards. Each card: {"question":"...","answer":"..."}. Example: [{"question":"Where was our first date?","answer":"The magical ECR ride!"},{"question":"What do I call you when you do fake anger?","answer":"Drama queen Babloo!"}]. Generate 3-5 fun relationship questions.'
      ),
    }),
    execute: async ({ cards: cardsJson }) => {
      actions.clearLoveCard();
      try {
        const parsed: QuizCard[] = JSON.parse(cardsJson);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error("Empty cards");
        }
        actions.startQuiz(parsed);
        const result = { success: true, message: `Quiz started with ${parsed.length} cards! Ask her the first question.` };
        playToolCue(result);
        return result;
      } catch {
        const result = { success: false, message: "Failed to parse quiz cards" };
        playToolCue(result);
        return result;
      }
    },
  });

export const createGetQuizCardTool = (actions: ValentineUIActions) =>
  tool({
    name: "get_quiz_card",
    description:
      "Get the current quiz card info — question, answer, whether it's flipped, and position. Use this to know what Vanya is looking at.",
    parameters: z.object({}),
    execute: async () => {
      const state = actions.getQuizCard();
      if (!state.active || state.cards.length === 0) {
        return { success: false, message: "No quiz is active." };
      }
      const card = state.cards[state.currentIndex];
      return {
        success: true,
        question: card.question,
        answer: state.isFlipped ? card.answer : "[hidden — not flipped yet]",
        isFlipped: state.isFlipped,
        position: `${state.currentIndex + 1} of ${state.cards.length}`,
      };
    },
  });

export const createFlipQuizCardTool = (actions: ValentineUIActions) =>
  tool({
    name: "flip_quiz_card",
    description:
      "Flip the current quiz card to reveal or hide the answer. Use when Vanya guesses or asks for the answer.",
    parameters: z.object({}),
    execute: async () => {
      actions.flipQuizCard();
      const result = { success: true, message: "Quiz card flipped." };
      playToolCue(result);
      return result;
    },
  });

export const createNextQuizCardTool = (actions: ValentineUIActions) =>
  tool({
    name: "next_quiz_card",
    description:
      "Move to the next quiz card. Use after discussing the current card's answer.",
    parameters: z.object({}),
    execute: async () => {
      actions.nextQuizCard();
      const result = { success: true, message: "Moved to next quiz card." };
      playToolCue(result);
      return result;
    },
  });

export const createEndQuizTool = (actions: ValentineUIActions) =>
  tool({
    name: "end_quiz",
    description:
      "End the love quiz. Use when all cards are done or Vanya wants to stop.",
    parameters: z.object({}),
    execute: async () => {
      actions.endQuiz();
      const result = { success: true, message: "Quiz ended." };
      playToolCue(result);
      return result;
    },
  });
