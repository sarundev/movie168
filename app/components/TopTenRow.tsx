"use client";

import { useRef } from "react";
import type { Movie } from "../data/movies";

const qualityColors: Record<string, string> = {
  "4K": "#1d4ed8",
  FHD: "#b45309",
  HD: "#15803d",
};

interface TopTenRowProps {
  title?: string;
  movies: Movie[];
}

export default function TopTenRow({ title = "Top 10 This Week", movies }: TopTenRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    rowRef.current?.scrollBy({ left: dir === "left" ? -900 : 900, behavior: "smooth" });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-7 rounded-full shrink-0"
            style={{ background: "linear-gradient(to bottom, #c9a835, #8a6e1a)" }}
          />
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: "#f0f0f0" }}>
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <a href="/movies" className="text-xs font-medium mr-1 transition-colors" style={{ color: "#777" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#c9a835")}
            onMouseLeave={e => (e.currentTarget.style.color = "#777")}>
            View All
          </a>
          {["left", "right"].map((dir) => (
            <button
              key={dir}
              onClick={() => scroll(dir as "left" | "right")}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-70"
              style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.3)", color: "#c9a835" }}
              aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable numbered cards */}
      <div
        ref={rowRef}
        className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
      >
        {movies.slice(0, 10).map((movie, idx) => {
          const qColor = qualityColors[movie.quality] ?? qualityColors["HD"];
          const rank = idx + 1;
          return (
            <a
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="group shrink-0 relative cursor-pointer"
              style={{ width: "220px", height: "300px" }}
            >
              {/* Giant rank number (behind) */}
              <div
                className="absolute left-0 bottom-6 select-none pointer-events-none"
                style={{
                  fontSize: "155px",
                  fontWeight: 900,
                  lineHeight: 1,
                  WebkitTextStroke: "3px rgba(201,168,53,0.35)",
                  color: "transparent",
                  zIndex: 1,
                  fontFamily: "var(--font-geist-sans), Arial Black, sans-serif",
                  letterSpacing: "-0.05em",
                }}
              >
                {rank}
              </div>

              {/* Movie poster — offset right, on top of number */}
              <div
                className="absolute right-0 top-0 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105"
                style={{
                  width: "155px",
                  height: "300px",
                  background: movie.gradient,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                  zIndex: 2,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 8px 32px rgba(201,168,53,0.3), 0 0 0 1.5px rgba(201,168,53,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 20px rgba(0,0,0,0.6)";
                }}
              >
                {/* Poster image */}
                {movie.image && (
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}

                {/* Vignette */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                  }}
                />

                {/* Quality badge */}
                <span
                  className="absolute bottom-2 left-2 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider"
                  style={{ background: qColor, color: "white", zIndex: 3 }}
                >
                  {movie.quality === "4K" ? "4K" : movie.quality}
                </span>

                {/* Hover play */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(201,168,53,0.9)", boxShadow: "0 0 24px rgba(201,168,53,0.5)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d0d12">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
