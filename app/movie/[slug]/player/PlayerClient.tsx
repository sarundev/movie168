"use client";

import { useState, useEffect, useRef } from "react";
import type { ApiMovieSource } from "../../../lib/api";
import { buildPlaybackUrl, PLAYER_ORIGIN } from "../../../lib/player";
import { trackMovieViewAction, saveWatchProgressAction } from "../../../actions/movie-actions";
import { useAuth } from "../../../context/AuthContext";

type PlayerMessage = {
  source: string;
  type: "MOVIE_PLAY" | "MOVIE_PROGRESS" | "MOVIE_ENDED";
  currentTime?: number;
  duration?: number;
};

export default function PlayerClient({
  sources,
  initialSourceId,
  movieTitle,
  sessionToken,
  movieSlug,
  movieId,
}: {
  sources: ApiMovieSource[];
  initialSourceId: number | null;
  movieTitle: string;
  sessionToken: string | null;
  movieSlug: string;
  movieId: number;
}) {
  const { user } = useAuth();

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

  const hasTrackedViewRef = useRef(false);
  const lastSavedSecondRef = useRef(0);
  const elapsedSecondsRef = useRef(0);

  // postMessage tracking — fires if the player implements the AISAKI_ART_PLAYER protocol
  useEffect(() => {
    if (!embedUrl) return;

    hasTrackedViewRef.current = false;
    lastSavedSecondRef.current = 0;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== PLAYER_ORIGIN) return;
      const data = event.data as PlayerMessage;
      if (!data || typeof data !== "object") return;
      if (data.source !== "AISAKI_ART_PLAYER") return;

      if (data.type === "MOVIE_PLAY") {
        if (hasTrackedViewRef.current) return;
        hasTrackedViewRef.current = true;
        trackMovieViewAction(movieId).catch(() => {});
        return;
      }

      if (data.type === "MOVIE_PROGRESS") {
        if (!user) return;
        const watchedSeconds = Math.floor(Number(data.currentTime ?? 0));
        const durationSeconds = Math.floor(Number(data.duration ?? 0));
        if (!durationSeconds || watchedSeconds < 1) return;
        if (watchedSeconds - lastSavedSecondRef.current < 10) return;
        lastSavedSecondRef.current = watchedSeconds;
        saveWatchProgressAction({ movieId, watchedSeconds, durationSeconds }).catch(() => {});
        return;
      }

      if (data.type === "MOVIE_ENDED") {
        if (!user) return;
        const durationSeconds = Math.floor(Number(data.duration ?? 0));
        if (!durationSeconds) return;
        saveWatchProgressAction({ movieId, watchedSeconds: durationSeconds, durationSeconds }).catch(() => {});
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [embedUrl, movieId, user]);

  // Time-based fallback using the existing playback session progress endpoint
  useEffect(() => {
    if (!sessionToken || !user) return;

    elapsedSecondsRef.current = 0;

    const tick = setInterval(() => {
      elapsedSecondsRef.current += 10;

      // If the player never emitted MOVIE_PLAY, track the view after 10 s as a fallback.
      if (elapsedSecondsRef.current === 10 && !hasTrackedViewRef.current) {
        hasTrackedViewRef.current = true;
        trackMovieViewAction(movieId).catch(() => {});
      }
    }, 10_000);

    const save = setInterval(() => {
      const position = elapsedSecondsRef.current;
      if (position < 10) return;
      saveWatchProgressAction({ movieId, watchedSeconds: position, durationSeconds: 0 }).catch(() => {});
    }, 30_000);

    return () => {
      clearInterval(tick);
      clearInterval(save);
      const position = elapsedSecondsRef.current;
      if (position >= 10) {
        saveWatchProgressAction({ movieId, watchedSeconds: position, durationSeconds: 0 }).catch(() => {});
      }
    };
  }, [sessionToken, user, movieId]);

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
