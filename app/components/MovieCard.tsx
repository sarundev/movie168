"use client";

import { getMovieRating, type ApiMovie } from "../lib/api";

const qualityColors: Record<string, string> = {
  "4K": "#1d4ed8",
  FHD: "#b45309",
  HD: "#15803d",
  CAM: "#6b7280",
};

const badgeColors: Record<string, string> = {
  NEW: "#c9a835",
  HOT: "#e50914",
  TOP: "#7c3aed",
};

export default function MovieCard({ movie }: { movie: ApiMovie }) {
  const quality  = movie.quality ?? "HD";
  const qColor   = qualityColors[quality] ?? qualityColors["HD"];
  const duration = movie.runtime_minutes
    ? `${Math.floor(movie.runtime_minutes / 60)}h ${movie.runtime_minutes % 60}m`
    : "";
  const year     = movie.release_year ?? (movie.release_date ? new Date(movie.release_date).getFullYear() : 0);
  const image    = movie.poster_url ?? movie.thumbnail_url ?? movie.backdrop_url;
  const genres   = (movie.genres ?? []).map(g => typeof g === "string" ? g : g.name);
  const { average: rating } = getMovieRating(movie);
  const gradient = movie.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)";

  return (
    <div className="group shrink-0 cursor-pointer" style={{ width: "230px" }}>
      {/* Poster */}
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.04] group-hover:z-10"
        style={{
          width: "230px",
          height: "330px",
          background: gradient,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.55)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 8px 32px rgba(201,168,53,0.3), 0 0 0 1.5px rgba(201,168,53,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 4px 16px rgba(0,0,0,0.55)";
        }}
      >
        {image && (
          <img
            src={image}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 45%, transparent 100%)",
          }}
        />

        {movie.badge && (
          <span
            className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded tracking-widest"
            style={{ background: badgeColors[movie.badge] ?? "#c9a835", color: "white" }}
          >
            {movie.badge}
          </span>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider"
            style={{ background: qColor, color: "white" }}
          >
            {quality === "4K" ? "4K ULTRA HD" : quality === "FHD" ? "FHD 1080P" : quality === "HD" ? "HD 720P" : quality}
          </span>
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 opacity-0 group-hover:opacity-100 transition-all duration-250"
          style={{ background: "rgba(0,0,0,0.58)" }}
        >
          <button
            className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: "rgba(201,168,53,0.94)", boxShadow: "0 0 28px rgba(201,168,53,0.5)" }}
            aria-label={`Play ${movie.title}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0d0d12">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" fill="#c9a835" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-sm font-bold">{(rating ?? 0).toFixed(1)}</span>
            {duration && <span className="text-zinc-400 text-xs">{duration}</span>}
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center px-3">
            {genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", color: "#ddd" }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2.5 px-0.5">
        <p
          className="text-md font-semibold leading-snug line-clamp-1 transition-colors group-hover:text-amber-400"
          style={{ color: "#e5e5e5" }}
        >
          {movie.title}
        </p>
        <div className="relative flex gap-2 pt-2">
          <p className="text-white text-xs bg-gray-800 px-2 py-0.5 rounded-sm flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {year || "—"}
          </p>
          {duration && (
            <p className="text-white text-xs bg-gray-800 px-2 py-0.5 rounded-sm flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {duration}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
