import { tool } from '@openai/agents';
import { z } from 'zod';
import { playToolCue } from '@/lib/audio';
import type { DeepDiveActions } from '@/types/deepdive';

export const createGenerateDeepDiveTool = (
  actions: DeepDiveActions,
  setContentView: (view: 'flashcards' | 'visualization' | 'deepdive') => void
) =>
  tool({
    name: 'generate_deep_dive',
    description:
      'Generate a comprehensive deep dive on a topic, including both a visualization image and a detailed overview text (max 100 words). The topic parameter should include all relevant context - if the user refers to what they drew on the canvas, include that context in the topic description. Use this when the user asks for a deep dive, comprehensive overview, or detailed explanation.',
    parameters: z.object({
      topic: z
        .string()
        .min(2, 'Topic must be at least 2 characters')
        .describe(
          'The topic for the deep dive with all relevant context. If the user refers to what they drew on the canvas, include that context in the topic description (e.g., "photosynthesis, focusing on the chloroplast structure the student drew" or "the mitosis diagram shown on the canvas"). Include any conversation context that would help generate a better deep dive.'
        ),
    }),
    execute: async ({ topic }) => {
      console.log('[deepdive] generate_deep_dive tool invoked', {
        topicLength: topic.length,
        topicPreview: topic.substring(0, 100),
      });

      try {
        // Switch to deep dive view immediately
        setContentView('deepdive');
        actions.setMode('generating');

        const response = await fetch('/api/generate-deep-dive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic }),
        });

        const payload = await response.json();

        if (!response.ok || payload.success === false) {
          console.error('[deepdive] API error response:', {
            status: response.status,
            payload,
          });
          throw new Error(payload.error ?? 'Unable to generate deep dive');
        }

        const { imageData, overviewText } = payload;

        // Update state with both image and text
        actions.setDeepDive(imageData, overviewText, topic);
        actions.setMode('ready');

        console.log('[deepdive] generation success', {
          imageDataLength: imageData.length,
          overviewTextLength: overviewText.length,
        });

        const result = {
          success: true,
          message: `I've generated a deep dive on ${topic}. The visualization and overview are ready. Click the "Copy to Clipboard" button to copy the combined image, then paste it on the canvas with Cmd+V (Mac) or Ctrl+V (Windows).`,
        };

        playToolCue(result);
        return result;
      } catch (error) {
        actions.setMode('idle');
        const reason =
          error instanceof Error ? error.message : 'Unknown deep dive generation error';

        console.error('[deepdive] generation failed', {
          error: reason,
          topicLength: topic.length,
        });

        const result = {
          success: false,
          message: `I couldn't generate the deep dive: ${reason}`,
        };
        playToolCue(result);
        return result;
      }
    },
  });

