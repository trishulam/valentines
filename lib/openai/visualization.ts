import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface GenerateVisualizationInput {
  imageDescription: string;
  canvasImageData?: string; // Base64 data URL - provided by tool when includeCanvasImage was true
}

export interface GenerateVisualizationResult {
  imageData: string; // Base64 data URL
}

/**
 * Extract base64 string from data URL
 */
function extractBase64FromDataUrl(dataUrl: string): string {
  // Remove data URL prefix (e.g., "data:image/png;base64,")
  return dataUrl.includes(',') 
    ? dataUrl.split(',')[1] 
    : dataUrl;
}

export async function generateVisualization({
  imageDescription,
  canvasImageData,
}: GenerateVisualizationInput): Promise<GenerateVisualizationResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    let contents: string | Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;

    if (canvasImageData) {
      // With canvas image - following Gemini example format
      const base64Image = extractBase64FromDataUrl(canvasImageData);
      contents = [
        { text: imageDescription },
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image,
          },
        },
      ];
    } else {
      // Without canvas image - just text prompt
      contents = imageDescription;
    }

    // Following Gemini example exactly
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: contents,
    });

    // Debug: Log response structure to understand actual format
    console.log('[visualization] Gemini API response structure:', {
      hasResponse: !!response,
      responseKeys: response ? Object.keys(response) : [],
      responseType: typeof response,
      responseString: JSON.stringify(response).substring(0, 500),
    });

    // Following Gemini example: response.parts (using type assertion to match example)
    const responseWithParts = response as any;
    
    // Check multiple possible response structures
    let parts: any[] | undefined;
    
    if (responseWithParts.parts) {
      parts = responseWithParts.parts;
    } else if (responseWithParts.candidates?.[0]?.content?.parts) {
      parts = responseWithParts.candidates[0].content.parts;
    } else if (responseWithParts.response?.parts) {
      parts = responseWithParts.response.parts;
    }
    
    if (!parts || parts.length === 0) {
      console.error('[visualization] No parts found in response:', {
        response: JSON.stringify(response).substring(0, 1000),
      });
      throw new Error('No response data returned from API');
    }

    // Loop through parts to find inlineData (image) - following Gemini example exactly
    for (const part of parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        // Convert to data URL format for easy display
        const imageDataUrl = `data:image/png;base64,${imageData}`;
        return {
          imageData: imageDataUrl,
        };
      }
    }

    throw new Error('No image data (inlineData) returned from API');
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Failed to generate visualization: ${error.message}`
        : 'Failed to generate visualization'
    );
  }
}

