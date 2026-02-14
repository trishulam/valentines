'use client';

import { VoiceStatus } from "@/types/valentines";

const statusText: Record<VoiceStatus, string> = {
  idle: "Idle",
  "requesting-permission": "Requesting microphone",
  connecting: "Connecting",
  connected: "Connected",
  error: "Error",
};

const statusStyles: Record<VoiceStatus, string> = {
  idle: "bg-white/30 text-white",
  "requesting-permission": "bg-pink-300/40 text-white",
  connecting: "bg-pink-400/40 text-white",
  connected: "bg-rose-400/40 text-white",
  error: "bg-red-400/50 text-white",
};

interface VoiceControlProps {
  status: VoiceStatus;
  error: string | null;
  isMicrophoneReady: boolean;
  isMicMuted: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMic: () => void;
}

export const VoiceControl = ({
  status,
  error,
  isMicrophoneReady,
  isMicMuted,
  onConnect,
  onDisconnect,
  onToggleMic,
}: VoiceControlProps) => {
  const isConnected = status === "connected";
  const isBusy = status === "requesting-permission" || status === "connecting";

  return (
    <section className="rounded-2xl border border-white/30 bg-white/10 p-5 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Talk to me</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
          {statusText[status]}
        </span>
      </div>

      <p className="mb-4 text-sm text-rose-50/90">
        Start a warm Krishna-Radha themed conversation filled with your shared memories.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={isConnected ? onDisconnect : onConnect}
          className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Connecting..." : isConnected ? "Disconnect" : "Start Voice"}
        </button>

        <button
          type="button"
          disabled={!isConnected}
          onClick={onToggleMic}
          className="rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Mic {isMicMuted ? "Muted" : "On"}
        </button>
      </div>

      <div className="mt-3 text-xs text-rose-100/90">
        Microphone: {isMicrophoneReady ? "granted" : "not granted yet"}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}
    </section>
  );
};
