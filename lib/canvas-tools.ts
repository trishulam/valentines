import { tool } from '@openai/agents';
import { z } from 'zod';
import type { Editor } from '@tldraw/tldraw';
import { captureCanvasScreenshot } from '@/lib/canvas-snapshot';
import { playToolCue } from '@/lib/audio';

export const createGetCanvasSnapshotTool = (
  getCanvasEditor: () => Editor | null
) =>
  tool({
    name: 'get_canvas_snapshot',
    description:
      'Get a description of what is drawn on the canvas. Call this only when the user explicitly asks about the canvas, what they drew, or wants you to analyze their drawing. Returns a text description of the canvas content.',
    parameters: z.object({
      conversationContext: z
        .string()
        .optional()
        .describe(
          'Optional brief summary of what you have been discussing, to help interpret the drawing (e.g. "We have been discussing photosynthesis")'
        ),
    }),
    execute: async ({ conversationContext }) => {
      try {
        const editor = getCanvasEditor();
        if (!editor) {
          const result = { success: false, message: 'Canvas is not available.' };
          playToolCue(result);
          return result;
        }

        const imageData = await captureCanvasScreenshot(editor);

        const response = await fetch('/api/canvas/describe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData,
            conversationContext: conversationContext || undefined,
          }),
        });

        const payload = await response.json();

        if (!response.ok || payload.success === false) {
          throw new Error(payload.error ?? 'Failed to describe canvas');
        }

        const result = {
          success: true,
          message: 'Canvas described.',
          description: payload.description,
        };
        playToolCue(result);
        return result;
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : 'Failed to describe canvas';
        const result = {
          success: false,
          message: reason,
        };
        playToolCue(result);
        return result;
      }
    },
  });
