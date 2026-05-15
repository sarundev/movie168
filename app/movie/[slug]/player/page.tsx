"use client";

import { useState, useEffect, use } from "react";
import { fetchMovieDetail, type ApiMovie } from "../../../lib/api";

export default function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  // Read ?source=<id> from URL
  const initialSourceId = typeof window !== "undefined"
    ? Number(new URLSearchParams(window.location.search).get("source")) || null
    : null;

  const [movie,            setMovie]           = useState<ApiMovie | null>(null);
  const [loading,          setLoading]         = useState(true);
  const [error,            setError]           = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(initialSourceId);

  useEffect(() => {
    let cancelled = false;
    fetchMovieDetail(slug)
      .then(m => { if (!cancelled) setMovie(m); })
      .catch(e => { if (!cancelled) setError((e instanceof Error ? e.message : null) ?? "ចូលមើលបរាជ័យ"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
      <svg className="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#000" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p className="text-sm text-center px-6" style={{ color: "#ef4444" }}>{error}</p>
      <a href={`/movie/${slug}`} className="px-6 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: "rgba(255,255,255,0.08)", color: "#888" }}>← ត្រឡប់</a>
    </div>
  );

  const sources = movie?.sources ?? [];
  const activeSource = sources.find(s => s.is_default && s.can_watch) ?? sources.find(s => s.can_watch) ?? null;
  const currentSource = selectedSourceId != null
    ? (sources.find(s => s.id === selectedSourceId) ?? activeSource)
    : activeSource;
  const embedUrl = currentSource?.embed_url ?? null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#000" }}>
      {/* Back link */}
      <div className="flex items-center gap-3 px-4 sm:px-8 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <a href={`/movie/${slug}`}
          className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "#ddd" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          ត្រឡប់
        </a>
        {movie?.title && (
          <>
            <span style={{ color: "#333" }}>/</span>
            <span className="text-sm truncate" style={{ color: "#888" }}>{movie.title}</span>
          </>
        )}
      </div>

      {/* Player */}
      <div className="flex-1 flex items-center justify-center px-0 sm:px-6 py-4 sm:py-8">
        <div className="w-full max-w-6xl">
          <div className="relative w-full rounded-none sm:rounded-2xl overflow-hidden"
            style={{ aspectRatio: "16/9", background: "#111" }}>
            {embedUrl ? (
              <iframe
                src={embedUrl}
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
                <p className="text-sm" style={{ color: "#555" }}>មិនទាន់មាន Embed URL។</p>
              </div>
            )}
          </div>

          {/* Movie info + source selector */}
          {movie && (
            <div className="px-4 sm:px-0 mt-5">
              <h1 className="text-lg font-black" style={{ color: "#f0f0f0" }}>{movie.title}</h1>
              {movie.overview && (
                <p className="text-sm leading-relaxed mt-2" style={{ color: "#666" }}>{movie.overview}</p>
              )}

              {/* Source selector */}
              {sources.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#555" }}>
                    Sources:
                  </span>
                  {sources.filter(s => s.can_watch).map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSourceId(s.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                      style={{
                        background: currentSource?.id === s.id ? "rgba(201,168,53,0.15)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${currentSource?.id === s.id ? "rgba(201,168,53,0.5)" : "rgba(255,255,255,0.1)"}`,
                        color: currentSource?.id === s.id ? "#c9a835" : "#888",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
