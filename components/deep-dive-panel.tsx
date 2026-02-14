'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// Dummy data for testing
const DUMMY_DEEP_DIVE = {
  id: 'dummy-1',
  imageDescription: 'Educational diagram showing the process of photosynthesis',
  topicDescription: 'A comprehensive deep dive into photosynthesis',
  imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop', // Stub image
  markdownContent: `# Photosynthesis: A Comprehensive Deep Dive

## Overview

Photosynthesis is the fundamental process by which plants, algae, and certain bacteria convert light energy into chemical energy stored in glucose molecules. This process is essential for life on Earth as it produces oxygen and forms the base of most food chains.

## Key Components

### 1. Chloroplasts
Chloroplasts are the organelles where photosynthesis occurs. They contain:
- **Thylakoids**: Membrane-bound compartments containing chlorophyll
- **Stroma**: The fluid-filled space surrounding thylakoids
- **Chlorophyll**: The green pigment that captures light energy

### 2. The Two Main Stages

#### Light-Dependent Reactions
These reactions occur in the thylakoid membranes and require light:

\`\`\`typescript
// Simplified representation
function lightDependentReactions(lightEnergy: Light) {
  const water = splitWater(lightEnergy);
  const oxygen = water.oxygen;
  const electrons = water.electrons;
  const ATP = generateATP(electrons);
  const NADPH = generateNADPH(electrons);
  
  return { oxygen, ATP, NADPH };
}
\`\`\`

**Key Products:**
- ATP (Adenosine Triphosphate)
- NADPH (Nicotinamide Adenine Dinucleotide Phosphate)
- Oxygen (O₂) - released as byproduct

#### Light-Independent Reactions (Calvin Cycle)
These reactions occur in the stroma and don't require direct light:

| Step | Process | Input | Output |
|------|---------|-------|--------|
| Carbon Fixation | CO₂ combines with RuBP | CO₂, RuBP | 3-PGA |
| Reduction | ATP and NADPH used | ATP, NADPH, 3-PGA | G3P |
| Regeneration | RuBP regenerated | G3P | RuBP |

## Chemical Equation

The overall equation for photosynthesis is:

\`\`\`
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂
\`\`\`

## Factors Affecting Photosynthesis

1. **Light Intensity**: More light generally increases rate (up to saturation point)
2. **Carbon Dioxide Concentration**: Higher CO₂ increases rate
3. **Temperature**: Optimal around 25-30°C for most plants
4. **Water Availability**: Essential for the process

## Real-World Applications

### Agricultural Implications
- Understanding photosynthesis helps optimize crop yields
- Greenhouse management uses controlled light and CO₂
- Crop rotation maintains soil nutrients

### Environmental Impact
- Forests act as carbon sinks through photosynthesis
- Ocean phytoplankton produce ~50% of Earth's oxygen
- Climate change affects photosynthetic rates globally

## Advanced Concepts

### C3 vs C4 vs CAM Plants

**C3 Plants** (e.g., wheat, rice):
- Most common type
- First product is 3-carbon compound
- Less efficient in hot, dry conditions

**C4 Plants** (e.g., corn, sugarcane):
- More efficient in hot conditions
- Use spatial separation of processes
- Better water efficiency

**CAM Plants** (e.g., cacti, pineapples):
- Open stomata at night
- Store CO₂ for daytime use
- Extremely water-efficient

## Conclusion

Photosynthesis is not just a biological process—it's the foundation of life on Earth. Understanding its mechanisms helps us:
- Improve agricultural practices
- Address climate change
- Develop sustainable energy solutions
- Appreciate the complexity of nature

## References

- Module 3: Cellular Processes
- Lecture Slide 12: Photosynthesis Overview
- Textbook Chapter 8: Energy and Metabolism`,
  generatedAt: new Date().toISOString(),
};

interface DeepDivePanelProps {
  deepDives?: Array<typeof DUMMY_DEEP_DIVE>;
  currentDeepDiveId?: string | null;
  mode?: 'idle' | 'generating' | 'viewing';
}

export const DeepDivePanel = ({
  deepDives = [DUMMY_DEEP_DIVE],
  currentDeepDiveId = DUMMY_DEEP_DIVE.id,
  mode = 'viewing',
}: DeepDivePanelProps) => {
  const currentDeepDive = deepDives.find((d) => d.id === currentDeepDiveId);

  if (mode === 'generating') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-brand-gray-medium/20 bg-white/80 p-6 text-sm text-brand-gray-medium">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-gray-medium/30 border-t-brand-gray-dark" />
        <span>Generating deep dive report…</span>
      </div>
    );
  }

  if (!currentDeepDive) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-brand-gray-medium/20 bg-white/60 p-6 text-center text-sm text-brand-gray-medium">
        <p>No deep dive reports generated yet.</p>
        <p className="mt-2 text-xs">
          Connect the voice agent and say "Generate a deep dive on [topic]"
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Image Section */}
      <div className="mb-4 flex-shrink-0">
        <img
          src={currentDeepDive.imageUrl}
          alt={currentDeepDive.imageDescription}
          className="w-full rounded-lg border border-brand-gray-medium/20 object-cover shadow-sm"
          style={{ maxHeight: '300px' }}
        />
      </div>

      {/* Markdown Content Section - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              // Custom styling for code blocks
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <div className="my-4 overflow-hidden rounded-lg border border-brand-gray-medium/20 bg-white">
                    <div className="border-b border-brand-gray-medium/20 bg-brand-gray-medium/5 px-4 py-2 text-xs font-medium text-brand-gray-medium">
                      {match[1]}
                    </div>
                    <pre className="overflow-x-auto p-4">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code
                    className="rounded bg-brand-gray-medium/10 px-1.5 py-0.5 text-xs font-mono text-brand-gray-dark"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // Custom styling for tables
              table: ({ children }) => (
                <div className="my-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-gray-medium/20 border border-brand-gray-medium/20">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-white">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-brand-gray-medium/20 bg-white">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-white">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray-medium">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-gray-dark">
                  {children}
                </td>
              ),
              // Custom styling for headings
              h1: ({ children }) => (
                <h1 className="mb-4 mt-6 text-2xl font-bold text-brand-gray-dark first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mb-3 mt-5 text-xl font-semibold text-brand-gray-dark">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-2 mt-4 text-lg font-semibold text-brand-gray-dark">
                  {children}
                </h3>
              ),
              // Custom styling for lists
              ul: ({ children }) => (
                <ul className="my-3 ml-6 list-disc space-y-1 text-brand-gray-medium">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="my-3 ml-6 list-decimal space-y-1 text-brand-gray-medium">
                  {children}
                </ol>
              ),
              // Custom styling for paragraphs
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed text-brand-gray-medium">{children}</p>
              ),
              // Custom styling for blockquotes
              blockquote: ({ children }) => (
                <blockquote className="my-4 border-l-4 border-brand-gray-medium/30 bg-white pl-4 italic text-brand-gray-medium">
                  {children}
                </blockquote>
              ),
            }}
          >
            {currentDeepDive.markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

