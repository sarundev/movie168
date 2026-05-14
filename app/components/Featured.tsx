"use client";

import { useState } from "react";
import { featuredMovies } from "../data/movies";

const CARDS_PER_PAGE = 3;
const totalPages = Math.ceil(featuredMovies.length / CARDS_PER_PAGE);

const qualityStyle: Record<string, { bg: string }> = {
  "4K": { bg: "#1d4ed8" },
  FHD: { bg: "#b45309" },
  HD: { bg: "#15803d" },
  CAM: { bg: "#6b7280" },
};

const badgeStyle: Record<string, string> = {
  NEW: "#c9a835",
  HOT: "#e50914",
  TOP: "#7c3aed",
};

export default function Featured() {
  const [page, setPage] = useState(0);
  const visible = featuredMovies.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  return (
    <section className="px-4 sm:px-6 lg:px-12 pt-20 pb-8">
      {/* 3-column featured grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {visible.map((movie, idx) => {
          const qs = qualityStyle[movie.quality] ?? qualityStyle["HD"];
          const isCenter = idx === 1;
          return (
            <div
              key={movie.id}
              className={`group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ${
                isCenter ? "sm:-mt-3 sm:mb-3" : ""
              }`}
              style={{
                aspectRatio: "16/9",
                background: movie.gradient,
                border: isCenter
                  ? "1px solid rgba(201,168,53,0.4)"
                  : "1px solid rgba(201,168,53,0.1)",
                boxShadow: isCenter
                  ? "0 0 0 1px rgba(201,168,53,0.2), 0 8px 32px rgba(0,0,0,0.6)"
                  : "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              {/* Grain */}
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />

              {/* Dark overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)",
                }}
              />

              {/* Top badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {movie.badge && (
                  <span
                    className="text-[11px] font-black px-2.5 py-1 rounded tracking-widest"
                    style={{
                      background: badgeStyle[movie.badge] ?? "#c9a835",
                      color: "white",
                    }}
                  >
                    {movie.badge}
                  </span>
                )}
                <span
                  className="text-[11px] font-black px-2 py-1 rounded tracking-wider"
                  style={{ background: qs.bg, color: "white" }}
                >
                  {movie.quality}
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-1">
                  {movie.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs" style={{ color: "#aaa" }}>
                    <span>{movie.year}</span>
                    <span className="w-1 h-1 rounded-full" style={{ background: "#c9a835" }} />
                    <span>{movie.duration}</span>
                    <span className="w-1 h-1 rounded-full" style={{ background: "#c9a835" }} />
                    <div className="flex items-center gap-1">
                      <svg width="11" height="11" fill="#c9a835" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span style={{ color: "#c9a835" }} className="font-semibold">{movie.rating}</span>
                    </div>
                  </div>

                  <button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #c9a835, #8a6e1a)",
                      color: "#0d0d12",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Watch Now
                  </button>
                </div>

                {/* Genre tags */}
                <div className="flex gap-1.5 mt-2.5">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#bbb",
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover play overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(0,0,0,0.28)" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(201,168,53,0.9)",
                    boxShadow: "0 0 40px rgba(201,168,53,0.5)",
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#0d0d12">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-5">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === page ? "28px" : "8px",
              height: "7px",
              background: i === page ? "#c9a835" : "rgba(255,255,255,0.18)",
            }}
            aria-label={`Page ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
