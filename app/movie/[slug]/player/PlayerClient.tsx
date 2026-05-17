"use client";

import { useState } from "react";
import type { ApiMovieSource } from "../../../lib/api";
import { buildPlaybackUrl } from "../../../lib/player";

export default function PlayerClient({
  sources,
  initialSourceId,
  movieTitle,
  sessionToken,
  movieSlug,
}: {
  sources: ApiMovieSource[];
  initialSourceId: number | null;
  movieTitle: string;
  sessionToken: string | null;
  movieSlug: string;
}) {
  const activeSource =
    sources.find(s => s.is_default && s.can_watch) ??
    sources.find(s => s.can_watch) ??
    null;

  const [selectedId, setSelectedId] = useState<number | null>(initialSourceId);

  const current =
    selectedId != null
      ? (sources.find(s => s.id === selectedId) ?? activeSource)
      : activeSource;

  const embedUrl = sessionToken
    ? buildPlaybackUrl({ sessionToken, movieSlug, sourceId: current?.id })
    : null;

  return (
    <>
      {/* Iframe */}
      <div className="relative w-full rounded-none sm:rounded-2xl overflow-hidden"
        style={{ aspectRatio: "16/9", background: "#111" }}>
        {embedUrl ? (
          <iframe
            key={current?.id ?? embedUrl}
            src={embedUrl}
            title={movieTitle}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            style={{ border: "none" }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <p className="text-sm" style={{ color: "#555" }}>មិនទាន់មាន Session Token។</p>
          </div>
        )}
      </div>

      {/* Source selector */}
      {sources.filter(s => s.can_watch).length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mt-4 px-4 sm:px-0">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#555" }}>
            Sources:
          </span>
          {sources.filter(s => s.can_watch).map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{
                background: current?.id === s.id ? "rgba(201,168,53,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${current?.id === s.id ? "rgba(201,168,53,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: current?.id === s.id ? "#c9a835" : "#888",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
