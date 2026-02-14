'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

import { buildValentineInstructions } from "@/lib/valentines/prompt";
import {
  createGiveBouquetTool,
  createSendKissesTool,
  createShowLoveCardTool,
  createShowMemoryGalleryTool,
  createStartFlowerRainTool,
  createTriggerSurpriseModeTool,
  createStartQuizTool,
  createGetQuizCardTool,
  createFlipQuizCardTool,
  createNextQuizCardTool,
  createEndQuizTool,
} from "@/lib/valentines-tools";
import { ValentineUIActions, VoiceStatus } from "@/types/valentines";

interface EphemeralKeyResponse {
  ephemeralKey: string;
  expiresAt: string;
}

const TOKEN_ENDPOINT = "/api/voice/token";

export const useValentineVoiceAgent = (uiActions: ValentineUIActions) => {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isMicrophoneReady, setIsMicrophoneReady] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const showLoveCardTool = useMemo(
    () => createShowLoveCardTool(uiActions),
    [uiActions],
  );
  const sendKissesTool = useMemo(
    () => createSendKissesTool(uiActions),
    [uiActions],
  );
  const giveBouquetTool = useMemo(
    () => createGiveBouquetTool(uiActions),
    [uiActions],
  );
  const startFlowerRainTool = useMemo(
    () => createStartFlowerRainTool(uiActions),
    [uiActions],
  );
  const showMemoryGalleryTool = useMemo(
    () => createShowMemoryGalleryTool(uiActions),
    [uiActions],
  );
  const triggerSurpriseModeTool = useMemo(
    () => createTriggerSurpriseModeTool(uiActions),
    [uiActions],
  );
  const startQuizTool = useMemo(
    () => createStartQuizTool(uiActions),
    [uiActions],
  );
  const getQuizCardTool = useMemo(
    () => createGetQuizCardTool(uiActions),
    [uiActions],
  );
  const flipQuizCardTool = useMemo(
    () => createFlipQuizCardTool(uiActions),
    [uiActions],
  );
  const nextQuizCardTool = useMemo(
    () => createNextQuizCardTool(uiActions),
    [uiActions],
  );
  const endQuizTool = useMemo(
    () => createEndQuizTool(uiActions),
    [uiActions],
  );

  const disconnectAgent = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.close();
      } catch (err) {
        console.error("[valentine-voice-agent] error closing session:", err);
      }
    }
    sessionRef.current = null;
    setStatus("idle");
    setExpiresAt(null);
    setIsMicMuted(false);
  }, []);

  const toggleMic = useCallback(() => {
    if (!sessionRef.current || status !== "connected") return;

    try {
      const session = sessionRef.current as unknown as { muted?: boolean; mute: (v: boolean) => void };
      const nextMutedState = !(session.muted ?? false);
      session.mute(nextMutedState);
      setIsMicMuted(nextMutedState);
    } catch (err) {
      console.error("[valentine-voice-agent] mic toggle error:", err);
    }
  }, [status]);

  const connectAgent = useCallback(async () => {
    if (status === "connecting" || status === "connected") return;

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

      const instructions = buildValentineInstructions();
      console.log("[valentine-voice-agent] instructions length:", instructions.length);

      const agent = new RealtimeAgent({
        name: "Krishna Radha Valentine Agent",
        voice: "cedar",
        instructions,
        tools: [
          showLoveCardTool,
          sendKissesTool,
          giveBouquetTool,
          startFlowerRainTool,
          showMemoryGalleryTool,
          triggerSurpriseModeTool,
          startQuizTool,
          getQuizCardTool,
          flipQuizCardTool,
          nextQuizCardTool,
          endQuizTool,
        ],
      });

      console.log("[valentine-voice-agent] agent tools:", agent.tools.map((t) => t.name));

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

      // --- Error & debug listeners ---
      session.on("error", (evt: unknown) => {
        console.error("[valentine-voice-agent] session error:", evt);
      });

      session.on("agent_start", () => {
        console.log("[valentine-voice-agent] agent_start (model is responding)");
      });

      session.on("agent_end", (_ctx: unknown, _agent: unknown, text: string) => {
        console.log("[valentine-voice-agent] agent_end, text:", text?.slice(0, 120));
      });

      session.on("agent_tool_start", (_ctx: unknown, _agent: unknown, tool: { name: string }) => {
        console.log("[valentine-voice-agent] tool_start:", tool?.name);
      });

      session.on("agent_tool_end", (_ctx: unknown, _agent: unknown, tool: { name: string }, result: string) => {
        console.log("[valentine-voice-agent] tool_end:", tool?.name, result?.slice(0, 80));
      });

      session.on("transport_event", (evt: { type: string }) => {
        // Log session.updated and errors only to avoid noise
        if (evt?.type === "session.updated" || evt?.type === "error") {
          console.log("[valentine-voice-agent] transport:", evt.type, evt);
        }
      });

      await session.connect({ apiKey: ephemeralKey });

      const sessionAny = session as unknown as { muted?: boolean };
      setIsMicMuted(sessionAny.muted ?? false);

      sessionRef.current = session;
      setExpiresAt(new Date(expiresAtIso));
      setStatus("connected");

      console.log("[valentine-voice-agent] connected — sending initial greeting trigger");

      // --- Trigger the agent to proactively greet Vanya ---
      session.sendMessage(
        "You just connected with Vanya. Greet her warmly and call send_kisses immediately.",
      );

    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to voice agent";
      setError(message);
      setStatus("error");
      console.error("[valentine-voice-agent] connection error:", message);
    }
  }, [
    giveBouquetTool,
    sendKissesTool,
    showLoveCardTool,
    showMemoryGalleryTool,
    startFlowerRainTool,
    status,
    triggerSurpriseModeTool,
    startQuizTool,
    getQuizCardTool,
    flipQuizCardTool,
    nextQuizCardTool,
    endQuizTool,
  ]);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        try {
          sessionRef.current.close();
        } catch (err) {
          console.error("[valentine-voice-agent] cleanup error:", err);
        }
      }
    };
  }, []);

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

export type UseValentineVoiceAgentReturn = ReturnType<typeof useValentineVoiceAgent>;
