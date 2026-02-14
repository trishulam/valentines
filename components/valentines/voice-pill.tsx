'use client';

import { VoiceStatus } from "@/types/valentines";

interface VoicePillProps {
  status: VoiceStatus;
  error: string | null;
  isMicMuted: boolean;
  onDisconnect: () => void;
  onToggleMic: () => void;
}

export const VoicePill = ({
  status,
  error,
  isMicMuted,
  onDisconnect,
  onToggleMic,
}: VoicePillProps) => {
  const isConnected = status === "connected";
  const isBusy = status === "requesting-permission" || status === "connecting";

  return (
    <div className="absolute right-4 top-4 z-30 flex flex-col items-end gap-2">
      {error && (
        <div className="rounded-lg border border-red-300/50 bg-red-500/20 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-4 py-2 backdrop-blur-md">
        <span
          className={`h-2 w-2 rounded-full ${
            isConnected ? (isMicMuted ? "bg-amber-400" : "bg-emerald-400") : "bg-rose-400"
          }`}
        />
        <span className="text-sm text-white/90">
          {isBusy ? "Connecting..." : isConnected ? "Connected" : status}
        </span>
        {isConnected && (
          <>
            <button
              type="button"
              onClick={onToggleMic}
              className="rounded-full border border-white/30 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10"
            >
              {isMicMuted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="rounded-full border border-white/30 px-2 py-0.5 text-xs text-white/90 hover:bg-white/10"
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
};
