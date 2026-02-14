'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  RealtimeAgent,
  RealtimeSession,
} from "@openai/agents/realtime";

import {
  createGenerateFlashcardsTool,
  createGetCurrentFlashcardTool,
  createFlipFlashcardTool,
  createNextFlashcardTool,
  createPreviousFlashcardTool,
} from "@/lib/flashcard-tools";
import { createGetCanvasSnapshotTool } from "@/lib/canvas-tools";
import {
  createGenerateVisualizationTool,
  createShowFlashcardsTool,
} from "@/lib/visualization-tools";
import { createGenerateDeepDiveTool } from "@/lib/deepdive-tools";
import { canvasEditorRef } from "@/components/canvas";
import { useGestureState } from "@/hooks/useGestureState";
import { FlashcardSessionState, FlashcardActions } from "@/types/flashcard";
import { VisualizationState, VisualizationActions } from "@/types/visualization";
import { DeepDiveState, DeepDiveActions } from "@/types/deepdive";

type VoiceStatus =
  | "idle"
  | "requesting-permission"
  | "connecting"
  | "connected"
  | "error";

interface EphemeralKeyResponse {
  ephemeralKey: string;
  expiresAt: string;
}


const TOKEN_ENDPOINT = "/api/voice/token";

export const useVoiceAgent = (
  flashcardSession: FlashcardSessionState,
  flashcardActions: FlashcardActions,
  visualizationState: VisualizationState,
  visualizationActions: VisualizationActions,
  deepDiveState: DeepDiveState,
  deepDiveActions: DeepDiveActions,
  setContentView: (view: 'flashcards' | 'visualization' | 'deepdive') => void,
) => {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const flashcardSessionRef = useRef<FlashcardSessionState>(flashcardSession);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isMicrophoneReady, setIsMicrophoneReady] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const { setCards, setMode, flipCard, nextCard, previousCard } = flashcardActions;

  // Update ref whenever flashcardSession changes
  useEffect(() => {
    flashcardSessionRef.current = flashcardSession;
  }, [flashcardSession]);

  const generateFlashcardsTool = useMemo(
    () =>
      createGenerateFlashcardsTool(
        {
          setCards,
          setMode,
          flipCard,
          nextCard,
          previousCard,
        },
        setContentView
      ),
    [setCards, setMode, flipCard, nextCard, previousCard, setContentView],
  );

  const getCurrentFlashcardTool = useMemo(
    () => createGetCurrentFlashcardTool(() => flashcardSessionRef.current),
    [],
  );

  const flipFlashcardTool = useMemo(
    () => createFlipFlashcardTool(flipCard),
    [flipCard],
  );

  const nextFlashcardTool = useMemo(
    () => createNextFlashcardTool(nextCard),
    [nextCard],
  );

  const previousFlashcardTool = useMemo(
    () => createPreviousFlashcardTool(previousCard),
    [previousCard],
  );

  const getCanvasSnapshotTool = useMemo(
    () => createGetCanvasSnapshotTool(() => canvasEditorRef.current),
    [],
  );

  const generateVisualizationTool = useMemo(
    () =>
      createGenerateVisualizationTool(
        () => canvasEditorRef.current,
        visualizationActions,
        setContentView
      ),
    [visualizationActions, setContentView]
  );

  const showFlashcardsTool = useMemo(
    () => createShowFlashcardsTool(setContentView),
    [setContentView]
  );

  const generateDeepDiveTool = useMemo(
    () =>
      createGenerateDeepDiveTool(
        deepDiveActions,
        setContentView
      ),
    [deepDiveActions, setContentView]
  );

  // PHASE 2: Toggle microphone mute/unmute
  const toggleMic = useCallback(() => {
    if (!sessionRef.current || status !== "connected") {
      console.warn("[voice-agent] Cannot toggle mic: session not connected");
      return;
    }
    
    try {
      const session = sessionRef.current as any;
      const currentMuted = session.muted || false;
      const newMutedState = !currentMuted;
      
      // Use mute(boolean) API - confirmed from Phase 1 testing
      session.mute(newMutedState);
      
      // Update local state
      setIsMicMuted(newMutedState);
      
      console.log(`[voice-agent] Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
    } catch (err) {
      console.error("[voice-agent] Error toggling microphone:", err);
    }
  }, [status]);

  // PHASE 4: Subscribe to gesture state and sync mic mute/unmute
  const { state: gestureState } = useGestureState();
  
  useEffect(() => {
    // Only sync if session is connected and gesture state has mic_muted
    if (!sessionRef.current || status !== "connected" || gestureState?.mic_muted === undefined) {
      return;
    }
    
    try {
      const session = sessionRef.current as any;
      const currentMuted = session.muted || false;
      const gestureMicMuted = gestureState.mic_muted;
      
      // Only toggle if state differs (prevent duplicate toggles)
      if (gestureMicMuted !== currentMuted) {
        session.mute(gestureMicMuted);
        setIsMicMuted(gestureMicMuted);
        console.log(`[voice-agent] Mic synced from gesture state: ${gestureMicMuted ? 'muted' : 'unmuted'}`);
      }
    } catch (err) {
      console.error("[voice-agent] Error syncing mic from gesture state:", err);
    }
  }, [gestureState?.mic_muted, status]);

  const disconnectAgent = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.close();
      } catch (err) {
        console.error("Error closing session:", err);
      }
    }
    sessionRef.current = null;
    setMode("idle");
    setStatus("idle");
    setExpiresAt(null);
    setIsMicMuted(false); // Reset mute state on disconnect
    console.log("[voice-agent] session disconnected");
  }, [setMode]);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        try {
          sessionRef.current.close();
        } catch (err) {
          console.error("Error closing session on cleanup:", err);
        }
      }
      setMode("idle");
      console.log("[voice-agent] cleanup triggered, session closed");
    };
  }, [setMode]);

  const connectAgent = useCallback(async () => {
    if (status === "connecting" || status === "connected") {
      return;
    }

    setStatus("requesting-permission");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setIsMicrophoneReady(true);

      setStatus("connecting");

      const tokenResponse = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to obtain ephemeral key");
      }

      const { ephemeralKey, expiresAt: expiresAtIso } =
        (await tokenResponse.json()) as EphemeralKeyResponse;

      const deckSummary = flashcardSession.cards.length
        ? `There are currently ${flashcardSession.cards.length} flashcards loaded.`
        : "There are currently no flashcards loaded.";

      const agent = new RealtimeAgent({
        name: "MindPad Voice Agent",
        instructions: `You are a helpful teaching assistant. Always respond in English.

RESPONSE STYLE:
- After tool calls (flashcards, visualization, deep dive, canvas): Keep responses under 15 words. Be concise and direct.
- During discussions or explanations: You can provide longer, detailed responses as needed to help learning.
- Examples of concise tool responses:
  * "Generated 5 flashcards on photosynthesis. Ready to review?"
  * "Visualization ready. Want to discuss or generate flashcards?"
  * "Deep dive complete! What would you like to discuss?"
  * "I see a diagram of photosynthesis. What would you like to know?"

FLASHCARD MANAGEMENT:
- ONLY generate flashcards when the user explicitly asks for them or agrees to generate flashcards.
- Do NOT suggest or automatically generate flashcards unless the user requests it.
- When the user asks for flash cards, call "generate_flashcards" with the requested topic (and focus if provided).
- After generating flashcards, respond concisely: "Generated X flashcards on [topic]. Ready to review?" (under 15 words)
- If the tool fails, apologize and ask whether they'd like to try another topic.

FLASHCARD NAVIGATION:
- To understand what flashcard the user is viewing, call "get_current_flashcard_context" to get current card information.
- When the user asks to flip the card, show the answer, or reveal the answer, call "flip_flashcard".
- When the user asks to go to the next card, move forward, or see the next one, call "next_flashcard".
- When the user asks to go back, see the previous card, or go to the previous one, call "previous_flashcard".

FLASHCARD GUIDANCE:
- After calling "get_current_flashcard_context", use the information to guide discussion about the current flashcard.
- If the card is NOT flipped (showing question), you can discuss the topic, provide hints, and expand on concepts, but DO NOT reveal the exact answer.
- If the card IS flipped (showing answer), you can discuss the answer openly and compare student responses to it.
- Always be encouraging and educational in your responses.

CANVAS AWARENESS:
- ONLY call "get_canvas_snapshot" when the user explicitly refers to what they drew, asks about the canvas based on their drawing, or asks you to analyze/understand what they drew.
- Examples of when to call: "What did I draw?", "Can you see what's on the canvas?", "Based on what I drew, can you tell me what you understood?", "What's on the canvas?"
- Do NOT call this tool proactively or automatically - only when the user explicitly asks about the canvas or refers to their drawing.
- Optionally include "conversationContext" parameter with a brief summary of what you've been discussing if it might help understand the drawing.
- Example: If discussing photosynthesis, include conversationContext: "We've been discussing photosynthesis, including chloroplasts and light reactions".
- Use the canvas description to understand what's on the canvas and respond accordingly.
- If the canvas is empty, inform the user that nothing is drawn yet.

VISUALIZATION GENERATION:
- When the user asks for an image, illustration, diagram, or visual aid, call "generate_visualization" with:
  - imageDescription: A very detailed, comprehensive description (include style, subject matter, composition, colors, specific details)
  - includeCanvasImage: Set to true ONLY if the user's drawing on the canvas is relevant (e.g., "enhance my drawing", "improve what I sketched", "add details to my canvas", "make this look more professional")
- You only need to pass these two parameters - the tool handles canvas capture internally.
- If includeCanvasImage is true, the tool will automatically capture the canvas and use images.edit() to enhance it.
- If includeCanvasImage is false, the tool will use images.generate() to create a new image from scratch.
- After generating, respond concisely: "Visualization ready. Want to discuss or generate flashcards?" (under 15 words)
- When the user wants to see flashcards again, call "show_flashcards" to switch back.

DEEP DIVE GENERATION:
- When the user asks for a "deep dive", comprehensive overview, or detailed explanation of a topic, call "generate_deep_dive" with:
  - topic: The topic name with all relevant context. If the user refers to what they drew on the canvas, include that context in the topic description (e.g., "photosynthesis, focusing on the chloroplast structure the student drew" or "the mitosis diagram shown on the canvas"). Include any conversation context that would help generate a better deep dive.
- The tool will generate both a visualization image and a detailed overview text (max 100 words) in parallel.
- After generating, respond concisely: "Deep dive complete! What would you like to discuss?" (under 15 words)
- Then offer: "I can generate flashcards to test your learning on this topic."
- When the user wants to see flashcards again, call "show_flashcards" to switch back.

ERROR HANDLING:
- If any tool fails, apologize and suggest trying again.
- If there are no flashcards loaded, suggest generating some first.

${deckSummary}`,
        tools: [
          generateFlashcardsTool,
          getCurrentFlashcardTool,
          flipFlashcardTool,
          nextFlashcardTool,
          previousFlashcardTool,
          getCanvasSnapshotTool,
          generateVisualizationTool,
          showFlashcardsTool,
          generateDeepDiveTool,
        ],
      });

      const session = new RealtimeSession(agent, {
        model: "gpt-realtime",
        config: {
          turnDetection: {
            type: "semantic_vad",
            eagerness: "low",
            createResponse: true,
            interruptResponse: true,
          },
        },
      });

      await session.connect({ apiKey: ephemeralKey });

      // Initialize mute state from session
      const sessionAny = session as any;
      const initialMutedState = sessionAny.muted || false;
      setIsMicMuted(initialMutedState);

      sessionRef.current = session;
      setExpiresAt(new Date(expiresAtIso));
      setStatus("connected");
      setMode("idle");
      console.log("[voice-agent] session connected", {
        cardCount: flashcardSession.cards.length,
        toolNames: agent.tools.map((t) => t.name),
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to connect to voice agent";
      setError(message);
      setStatus("error");
      setMode("idle");
      console.error("[voice-agent] connection error", { error: message });
    }
  }, [
    flashcardSession,
    generateFlashcardsTool,
    getCurrentFlashcardTool,
    flipFlashcardTool,
    nextFlashcardTool,
    previousFlashcardTool,
    getCanvasSnapshotTool,
    generateVisualizationTool,
    showFlashcardsTool,
    generateDeepDiveTool,
    setMode,
    status,
  ]);

  return {
    session: sessionRef.current,
    status,
    error,
    expiresAt,
    isMicrophoneReady,
    isMicMuted,
    connectAgent,
    disconnectAgent,
    toggleMic,
  };
};

export type UseVoiceAgentReturn = ReturnType<typeof useVoiceAgent>;
