import OpenAI from "openai";

import { generateVisualization } from "@/lib/openai/visualization";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OVERVIEW_SYSTEM_PROMPT = `You are a teaching assistant.
Generate a concise deep-dive overview for a student.
Rules:
- Maximum 100 words
- Clear and practical language
- Include key ideas, one real-world link, and one takeaway
- No markdown headings
- Return plain text only`;

export interface GenerateDeepDiveInput {
  topic: string;
}

export interface GenerateDeepDiveResult {
  imageData: string;
  overviewText: string;
}

async function generateOverviewText(topic: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: OVERVIEW_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Topic: ${topic}`,
      },
    ],
    temperature: 0.6,
  });

  const text = response.output_text?.trim();
  if (!text) {
    throw new Error("No overview text returned from OpenAI");
  }

  return text;
}

export async function generateDeepDive({
  topic,
}: GenerateDeepDiveInput): Promise<GenerateDeepDiveResult> {
  if (!topic || topic.trim().length < 2) {
    throw new Error("Topic must be at least 2 characters");
  }

  try {
    const [visualization, overviewText] = await Promise.all([
      generateVisualization({
        imageDescription: `Educational deep-dive diagram for: ${topic}. Make it clear, labeled, and classroom friendly.`,
      }),
      generateOverviewText(topic),
    ]);

    return {
      imageData: visualization.imageData,
      overviewText,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Failed to generate deep dive: ${error.message}`
        : "Failed to generate deep dive"
    );
  }
}

