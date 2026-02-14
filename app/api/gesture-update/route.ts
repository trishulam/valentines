import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateState } from '@/lib/gesture-state';

// Request validation schema
const requestSchema = z.object({
  mode: z.union([z.literal(0), z.literal(1)]),
  annotation_mode: z.boolean(),
  hand_sign_id: z.number().int().min(0).max(9),
  gesture_label: z.string().nullable(),
  flag: z.boolean(),
  timestamp: z.number().optional(),
  current_tool: z.enum(['select', 'draw', 'eraser']).nullable().optional(),
  mic_muted: z.boolean().optional(),
});

type RequestBody = z.infer<typeof requestSchema>;

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    const json = await request.json();
    body = requestSchema.parse(json);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.errors.map((err) => err.message).join(', ')
        : 'Invalid request body';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }

  try {
    // Update in-memory state (will notify SSE subscriber)
    updateState({
      mode: body.mode,
      annotation_mode: body.annotation_mode,
      hand_sign_id: body.hand_sign_id,
      gesture_label: body.gesture_label,
      flag: body.flag,
      timestamp: body.timestamp ?? Date.now() / 1000,
      current_tool: body.current_tool ?? null,
      mic_muted: body.mic_muted ?? false,
    });

    const timestamp2 = new Date().toISOString();
    console.log(`[${timestamp2}] State updated:`, {
      mode: body.mode,
      annotation_mode: body.annotation_mode,
      hand_sign_id: body.hand_sign_id,
      gesture_label: body.gesture_label,
      current_tool: body.current_tool,
    });

    return NextResponse.json({
      success: true,
      message: 'State updated',
    });
  } catch (error) {
    console.error('Error updating gesture state:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update state',
      },
      { status: 500 }
    );
  }
}

