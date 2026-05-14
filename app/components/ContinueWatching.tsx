"use client";

import type { Movie } from "../data/movies";

export default function ContinueWatching({ movies }: { movies: Movie[] }) {
  return (
    <div className="px-4 sm:px-6 lg:px-12 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-7 rounded-full shrink-0"
            style={{ background: "linear-gradient(to bottom, #c9a835, #8a6e1a)" }}
          />
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: "#f0f0f0" }}>
            Continue Watching
          </h2>
        </div>
        <a
          href="#"
          className="text-xs font-medium"
          style={{ color: "#777" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a835")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
        >
          View All
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="shrink-0 w-72 sm:w-80 cursor-pointer group"
          >
            {/* Landscape thumbnail */}
            <div
              className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.03]"
              style={{
                aspectRatio: "16/9",
                background: movie.gradient,
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.55)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 8px 32px rgba(201,168,53,0.25), 0 0 0 1.5px rgba(201,168,53,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 16px rgba(0,0,0,0.55)";
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

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                }}
              />

              {/* Play on hover */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(201,168,53,0.92)",
                    boxShadow: "0 0 28px rgba(201,168,53,0.5)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d0d12">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <div
                  className="h-full rounded-r-full"
                  style={{
                    background: "linear-gradient(to right, #c9a835, #e2be50)",
                    width: `${25 + (movie.id % 6) * 12}%`,
                  }}
                />
              </div>
            </div>

            {/* Info below */}
            <div className="mt-2.5 px-0.5">
              <p
                className="text-sm font-semibold line-clamp-1 transition-colors group-hover:text-amber-400"
                style={{ color: "#e5e5e5" }}
              >
                {movie.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#666" }}>
                {movie.duration} remaining
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
