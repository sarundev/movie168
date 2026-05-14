"use client";

import { useRef, useEffect } from "react";
import MovieCard from "./MovieCard";
import type { Movie } from "../data/movies";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  viewAllHref?: string;
}

const qualityBg: Record<string, string> = { "4K": "#1d4ed8", FHD: "#b45309", HD: "#15803d" };
const badgeBg:   Record<string, string> = { NEW: "#c9a835", HOT: "#e50914", TOP: "#7c3aed" };

const MOBILE_LIMIT = 6;

export default function MovieRow({ title, movies, viewAllHref = "/movies" }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    const STEP = 320;
    const DELAY = 3000;
    intervalRef.current = setInterval(() => {
      if (paused.current || !rowRef.current) return;
      const el = rowRef.current;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollBy({ left: atEnd ? -el.scrollWidth : STEP, behavior: "smooth" });
    }, DELAY);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const mobileMovies = movies.slice(0, MOBILE_LIMIT);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3 sm:mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-7 rounded-full shrink-0"
            style={{ background: "linear-gradient(to bottom, #c9a835, #8a6e1a)" }}
          />
          <h2 className="text-base sm:text-xl font-bold tracking-tight" style={{ color: "#f0f0f0" }}>
            {title}
          </h2>
        </div>
        {/* View all — mobile only */}
        <a
          href={viewAllHref}
          className="sm:hidden text-xs font-semibold transition-colors"
          style={{ color: "#c9a835" }}
        >
          View All →
        </a>
      </div>

      {/* ── Mobile: 3-column grid ── */}
      <div className="sm:hidden grid grid-cols-3 gap-2">
        {mobileMovies.map(movie => {
          const qColor = qualityBg[movie.quality] ?? "#15803d";
          const qualityLabel =
            movie.quality === "4K"  ? "4K ULTRA HD" :
            movie.quality === "FHD" ? "FHD 1080P"   :
            movie.quality === "HD"  ? "HD 720P"     : movie.quality;

          return (
            <a key={movie.id} href={`/movie/${movie.id}`} className="group cursor-pointer">
              {/* Poster */}
              <div
                className="relative rounded-lg overflow-hidden"
                style={{
                  width: "100%",
                  aspectRatio: "2/3",
                  background: movie.gradient,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                {movie.image && (
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="lazy"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                {/* Bottom vignette */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 45%)" }}
                />
                {/* Badge top-right */}
                {movie.badge && (
                  <span
                    className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest"
                    style={{ background: badgeBg[movie.badge] ?? "#c9a835", color: "white" }}
                  >
                    {movie.badge}
                  </span>
                )}
                {/* Quality bottom-left */}
                <span
                  className="absolute bottom-1.5 left-1.5 font-black rounded tracking-wide"
                  style={{
                    background: qColor,
                    color: "white",
                    fontSize: "clamp(7px, 1.8vw, 10px)",
                    padding: "2px 5px",
                  }}
                >
                  {qualityLabel}
                </span>
              </div>

              {/* Info */}
              <div className="mt-1.5 px-0.5">
                <p
                  className="font-semibold line-clamp-2 leading-tight transition-colors group-hover:text-amber-400"
                  style={{ color: "#e5e5e5", fontSize: "clamp(10px, 2.8vw, 13px)" }}
                >
                  {movie.title}
                </p>
                <p className="mt-0.5" style={{ color: "#666", fontSize: "clamp(9px, 2.4vw, 11px)" }}>
                  {movie.year}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* ── Desktop: horizontal scroll ── */}
      <div
        ref={rowRef}
        className="hidden sm:flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
      >
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
