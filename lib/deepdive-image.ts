'use client';

/**
 * Generates a combined image (visualization + overview text) as a data URL.
 * Used for copying the deep dive to clipboard.
 * @param imageData - Base64 data URL of the visualization image
 * @param overviewText - Text to render below the image
 * @returns Promise resolving to the combined image as a data URL
 */
export async function generateCombinedDeepDiveImage(
  imageData: string,
  overviewText: string
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('generateCombinedDeepDiveImage must run in the browser');
  }

  // Load the image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Failed to load image'));
    el.src = imageData;
  });

  const padding = 24;
  const maxWidth = 800;
  const imgWidth = Math.min(img.width, maxWidth);
  const scale = imgWidth / img.width;
  const imgHeight = img.height * scale;

  // Create canvas for text measurement
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) throw new Error('Could not get canvas context');

  const fontSize = 14;
  const lineHeight = 1.4;
  const font = `${fontSize}px system-ui, -apple-system, sans-serif`;
  measureCtx.font = font;

  const textMaxWidth = imgWidth - padding * 2;
  const lines: string[] = [];
  const paragraphs = overviewText.split(/\n\n+/);

  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const { width } = measureCtx.measureText(testLine);
      if (width > textMaxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    lines.push(''); // paragraph gap
  }

  const textHeight = lines.length * fontSize * lineHeight;

  const canvas = document.createElement('canvas');
  canvas.width = imgWidth + padding * 2;
  canvas.height = imgHeight + padding + textHeight + padding;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const bg = '#ffffff';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, padding, padding, imgWidth, imgHeight);

  ctx.fillStyle = '#374151';
  ctx.font = font;
  ctx.textBaseline = 'top';

  let y = imgHeight + padding * 2;
  for (const line of lines) {
    ctx.fillText(line, padding, y, textMaxWidth);
    y += fontSize * lineHeight;
  }

  return canvas.toDataURL('image/png');
}
