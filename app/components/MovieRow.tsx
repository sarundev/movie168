"use client";

import { useRef, useEffect } from "react";
import MovieCard from "./MovieCard";
import { getMovieRating, type ApiMovie } from "../lib/api";

interface MovieRowProps {
  title: string;
  movies: ApiMovie[];
  viewAllHref?: string;
}

const qualityBg: Record<string, string> = { "4K": "#1d4ed8", FHD: "#b45309", HD: "#15803d" };
const badgeBg: Record<string, string> = { NEW: "#c9a835", HOT: "#e50914", TOP: "#7c3aed" };

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

  if (movies.length === 0) return null;

  const mobileMovies = movies.slice(0, MOBILE_LIMIT);

  return (
    <div>
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
        <a
          href={viewAllHref}
          className="sm:hidden text-xs font-semibold transition-colors"
          style={{ color: "#c9a835" }}
        >
          View All →
        </a>
      </div>

      {/* Mobile: 3-column grid */}
      <div className="sm:hidden grid grid-cols-3 gap-2">
        {mobileMovies.map(movie => {
          const quality  = movie.quality ?? "HD";
          const qColor   = qualityBg[quality] ?? "#15803d";
          const duration = movie.runtime_minutes
            ? `${Math.floor(movie.runtime_minutes / 60)}h ${movie.runtime_minutes % 60}m`
            : "";
          const year     = movie.release_year ?? (movie.release_date ? new Date(movie.release_date).getFullYear() : 0);
          const image    = movie.poster_url ?? movie.thumbnail_url ?? movie.backdrop_url;
          const gradient = movie.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)";

          return (
            <a key={movie.id} href={`/movie/${movie.slug}`} className="group cursor-pointer">
              <div
                className="relative rounded-lg overflow-hidden"
                style={{
                  width: "100%",
                  aspectRatio: "2/3",
                  background: gradient,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                {image && (
                  <img
                    src={image}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="lazy"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 45%)" }}
                />
                {movie.badge && (
                  <span
                    className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest"
                    style={{ background: badgeBg[movie.badge] ?? "#c9a835", color: "white" }}
                  >
                    {movie.badge}
                  </span>
                )}
                <span
                  className="absolute bottom-1.5 left-1.5 font-black rounded tracking-wide"
                  style={{
                    background: qColor, color: "white",
                    fontSize: "clamp(7px, 1.8vw, 10px)", padding: "2px 5px",
                  }}
                >
                  {quality === "4K" ? "4K" : quality === "FHD" ? "FHD" : quality}
                </span>
              </div>

              <div className="mt-1.5 px-0.5">
                <p
                  className="font-semibold line-clamp-2 leading-tight transition-colors group-hover:text-amber-400"
                  style={{ color: "#e5e5e5", fontSize: "clamp(10px, 2.8vw, 13px)" }}
                >
                  {movie.title}
                </p>
                <div className="relative flex gap-2 pt-2">
                  <p className="text-white text-xs bg-gray-800 px-1 py-0.5 rounded-sm flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {year || "—"}
                  </p>
                  {duration && (
                    <p className="text-white text-xs bg-gray-800 px-1 py-0.5 rounded-sm flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {duration}
                    </p>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Desktop: horizontal scroll */}
      <div
        ref={rowRef}
        className="hidden sm:flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
      >
        {movies.map(movie => (
          <a key={movie.id} href={`/movie/${movie.slug}`} className="shrink-0">
            <MovieCard movie={movie} />
          </a>
        ))}
      </div>
    </div>
  );
}
