import { tool } from '@openai/agents';
import { z } from 'zod';
import type { Editor } from '@tldraw/tldraw';
import { captureCanvasScreenshot } from '@/lib/canvas-snapshot';
import { playToolCue } from '@/lib/audio';
import type { VisualizationActions } from '@/types/visualization';

export const createGenerateVisualizationTool = (
  getCanvasEditor: () => Editor | null,
  actions: VisualizationActions,
  setContentView: (view: 'flashcards' | 'visualization') => void
) =>
  tool({
    name: 'generate_visualization',
    description:
      'Generate an educational visualization image for the student. Use this when the user asks for an image, illustration, diagram, or visual aid. If includeCanvasImage is true, the tool will capture the current canvas and use it as input to edit/enhance it. If false, generates a new image from scratch.',
    parameters: z.object({
      imageDescription: z
        .string()
        .min(20, 'Image description must be at least 20 characters and very detailed')
        .describe(
          'A very detailed, comprehensive description of the image to generate or how to edit the canvas image. Include style, subject matter, composition, colors, and any specific details. If includeCanvasImage is true, describe how to modify/enhance the canvas. Example: "Add the logo to the woman\'s top, as if stamped into the fabric" or "A children\'s book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter, soft pastel colors, friendly cartoon style, warm lighting"'
        ),
      includeCanvasImage: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          'If true, the tool will automatically capture the current canvas image and use it as input for image editing/enhancement. Set to true when the user\'s drawing on the canvas is relevant to the visualization (e.g., "enhance my drawing", "improve what I sketched", "add details to my canvas"). If false or omitted, generates a completely new image from scratch. The agent only needs to pass true/false - the tool handles all canvas capture internally.'
        ),
    }),
    execute: async ({ imageDescription, includeCanvasImage }) => {
      console.log('[visualization] generate_visualization tool invoked', {
        descriptionLength: imageDescription.length,
        includeCanvasImage,
      });

      try {
        // Set generating mode
        actions.setMode('generating');
        setContentView('visualization');

        // Tool handles canvas capture internally based on boolean parameter
        // Agent only passes the boolean - tool does the work
        let canvasImageData: string | undefined;

        if (includeCanvasImage) {
          // Tool captures canvas screenshot internally
          const editor = getCanvasEditor();
          if (!editor) {
            throw new Error('Canvas is not available. Please ensure the canvas is loaded.');
          }

          try {
            // Tool captures canvas - agent doesn't need to handle this
            canvasImageData = await captureCanvasScreenshot(editor);
            console.log('[visualization] Canvas captured internally by tool', {
              dataLength: canvasImageData.length,
            });
          } catch (error) {
            const reason = error instanceof Error ? error.message : 'Unknown error';
            console.warn('[visualization] Failed to capture canvas, proceeding without it', {
              error: reason,
            });
            // Graceful fallback: generate new image instead of failing
            canvasImageData = undefined;
          }
        }

        // Tool sends captured canvas data (if any) to API
        // API will use images.edit() if canvasImageData exists, else images.generate()
        const requestBody: {
          imageDescription: string;
          canvasImageData?: string;
        } = {
          imageDescription,
        };
        
        // Only include canvasImageData if it exists (don't send null)
        if (canvasImageData) {
          requestBody.canvasImageData = canvasImageData;
        }
        
        console.log('[visualization] Sending request to API:', {
          imageDescriptionLength: imageDescription.length,
          imageDescriptionPreview: imageDescription.substring(0, 50),
          hasCanvasImageData: !!canvasImageData,
          canvasImageDataLength: canvasImageData?.length,
        });
        
        const response = await fetch('/api/generate-visualization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const payload = await response.json();

        if (!response.ok || payload.success === false) {
          console.error('[visualization] API error response:', {
            status: response.status,
            payload,
          });
          throw new Error(payload.error ?? 'Unable to generate visualization');
        }

        const imageData: string = payload.imageData;

        // Update state
        actions.setVisualization(imageData, imageDescription);
        actions.setMode('ready');

        console.log('[visualization] generation success', {
          imageDataLength: imageData.length,
          usedCanvas: !!canvasImageData,
        });

        const result = {
          success: true,
          message: `I've ${canvasImageData ? 'enhanced' : 'generated'} a visualization for you. Click the "Copy to Clipboard" button to copy it, then paste it on the canvas with Cmd+V (Mac) or Ctrl+V (Windows).`,
        };

        playToolCue(result);
        return result;
      } catch (error) {
        actions.setMode('idle');
        const reason =
          error instanceof Error ? error.message : 'Unknown visualization generation error';

        console.error('[visualization] generation failed', {
          error: reason,
          descriptionLength: imageDescription.length,
          includeCanvasImage,
        });

        const result = {
          success: false,
          message: `I couldn't generate the visualization: ${reason}`,
        };
        playToolCue(result);
        return result;
      }
    },
  });

// Tool to switch back to flashcards
export const createShowFlashcardsTool = (
  setContentView: (view: 'flashcards' | 'visualization') => void
) =>
  tool({
    name: 'show_flashcards',
    description:
      'Switch the sidebar view back to showing flashcards. Use this when the user wants to see flashcards again or go back to reviewing flashcards.',
    parameters: z.object({}),
    execute: async () => {
      console.log('[visualization] show_flashcards tool invoked');

      try {
        setContentView('flashcards');
        const result = {
          success: true,
          message: 'Switched back to flashcards view.',
        };
        playToolCue(result);
        return result;
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown error';
        console.error('[visualization] show_flashcards failed', reason);
        const result = {
          success: false,
          message: `Could not switch to flashcards: ${reason}`,
        };
        playToolCue(result);
        return result;
      }
    },
  });

