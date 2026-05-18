"use client";

import { useState } from "react";

interface Trailer {
  id: number;
  url: string;
  label?: string;
}

function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m =
    url.match(/[?&]v=([^&#]+)/) ??
    url.match(/youtu\.be\/([^?&#]+)/) ??
    url.match(/embed\/([^?&#]+)/);
  return m ? m[1] : null;
}

function embedUrl(url: string | null | undefined): string {
  if (!url) return "about:blank";
  const id = youtubeId(url);
  if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  return url;
}

function thumbUrl(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

export default function TrailerSection({ trailers }: { trailers: Trailer[] }) {
  const [active, setActive] = useState<Trailer | null>(null);

  const validTrailers = trailers.filter(t => t.url);
  if (!validTrailers.length) return null;

  return (
    <>
      {/* ── Trailer cards ── */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Section header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-1 h-5 rounded-full"
            style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }}
          />
          <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>
            Trailer
          </h2>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-semibold ml-1"
            style={{ background: "rgba(201,168,53,0.12)", color: "#c9a835", border: "1px solid rgba(201,168,53,0.25)" }}
          >
            {validTrailers.length}
          </span>
        </div>

        {/* Scrollable trailer row */}
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {validTrailers.map((t, i) => {
            const thumb = thumbUrl(t.url);
            const label = t.label ?? `Trailer ${i + 1}`;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                className="group shrink-0 flex flex-col gap-2 text-left"
                style={{ width: "clamp(200px, 30vw, 280px)" }}
              >
                {/* Thumbnail */}
                <div
                  className="relative w-full overflow-hidden rounded-xl"
                  style={{
                    aspectRatio: "16/9",
                    background: "#0d0d12",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.55)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "box-shadow 0.25s ease, transform 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.boxShadow = "0 8px 28px rgba(201,168,53,0.3), 0 0 0 1.5px rgba(201,168,53,0.4)";
                    el.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.boxShadow = "0 4px 18px rgba(0,0,0,0.55)";
                    el.style.transform = "scale(1)";
                  }}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={label}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(135deg,#1e1b4b,#0d0d12)" }}
                    />
                  )}

                  {/* Dark overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "rgba(0,0,0,0.32)" }}
                  />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
                      style={{
                        width: "46px",
                        height: "46px",
                        background: "rgba(201,168,53,0.93)",
                        boxShadow: "0 0 24px rgba(201,168,53,0.55)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d0d12">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>

                  {/* Duration/label pill */}
                  <div className="absolute bottom-2 left-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(0,0,0,0.72)",
                        color: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      Trailer
                    </span>
                  </div>
                </div>

                {/* Label */}
                <p
                  className="text-xs font-semibold leading-snug line-clamp-1 px-0.5 transition-colors group-hover:text-amber-400"
                  style={{ color: "#bbb" }}
                >
                  {label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Modal ── */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full"
            style={{ maxWidth: "860px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActive(null)}
              className="absolute -top-10 right-0 flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              បិទ
            </button>

            {/* Label */}
            <p className="text-sm font-bold mb-3 px-0.5" style={{ color: "#f0f0f0" }}>
              {active.label ?? "Trailer"}
            </p>

            {/* iframe */}
            <div
              className="w-full overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "16/9",
                boxShadow: "0 24px 72px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)",
              }}
            >
              <iframe
                src={embedUrl(active.url)}
                title={active.label ?? "Trailer"}
                className="w-full h-full"
                style={{ border: "none" }}
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>

            {/* Other trailers */}
            {validTrailers.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {validTrailers.map((t, i) => {
                  const thumb = thumbUrl(t.url);
                  const isActive = t.id === active.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActive(t)}
                      className="shrink-0 relative overflow-hidden rounded-lg transition-all"
                      style={{
                        width: "100px",
                        aspectRatio: "16/9",
                        background: "#0d0d12",
                        outline: isActive ? "2px solid #c9a835" : "1px solid rgba(255,255,255,0.1)",
                        opacity: isActive ? 1 : 0.65,
                      }}
                    >
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={t.label ?? `Trailer ${i + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
