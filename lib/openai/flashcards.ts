import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { flashcardSetSchema, FlashcardSet } from "@/types/flashcard";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a senior instructional designer helping a teacher create study flashcards.
Always:
- Ground content in the provided lecture context when available.
- Keep language concise, clear, and classroom-friendly.
- Include accurate citations in "source" when the lecture context references a module/slide/reading.
- Avoid inventing facts or sources beyond the supplied context.`;

export interface GenerateFlashcardsInput {
  topic: string;
  focus?: string;
  lectureContext?: string | null;
}

export interface GenerateFlashcardsResult {
  flashcards: FlashcardSet["flashcards"];
}

export async function generateFlashcards({
  topic,
  focus,
  lectureContext,
}: GenerateFlashcardsInput): Promise<GenerateFlashcardsResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const contextualPromptParts = [
    `Topic: ${topic}`,
    focus ? `Focus: ${focus}` : null,
    lectureContext ? `Lecture context:\n${lectureContext}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await openai.responses.parse({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Create 3-6 high quality study flashcards.\n\n${contextualPromptParts}`,
        },
      ],
      text: {
        format: zodTextFormat(flashcardSetSchema, "flashcards"),
      },
      temperature: 0.7,
    });

    const parsed = response.output_parsed;
    const validated = flashcardSetSchema.parse(parsed);

    return {
      flashcards: validated.flashcards,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Failed to generate flashcards: ${error.message}`
        : "Failed to generate flashcards"
    );
  }
}

