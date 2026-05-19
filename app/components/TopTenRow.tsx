import Link from "next/link";
import type { ApiMovie } from "../lib/api";

const qualityColors: Record<string, string> = {
  "4K": "#1d4ed8",
  FHD: "#b45309",
  HD: "#15803d",
};

interface TopTenRowProps {
  title?: string;
  movies: ApiMovie[];
}

export default function TopTenRow({ title = "Top 10 This Week", movies }: TopTenRowProps) {
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
        <Link
          href="/movies"
          className="text-xs font-medium transition-colors hover:text-[#c9a835]"
          style={{ color: "#777" }}
        >
          View All
        </Link>
      </div>

      {/* Scrollable numbered cards — CSS-only horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth pb-4">
        {movies.slice(0, 10).map((movie, idx) => {
          const quality = movie.quality ?? "HD";
          const qColor = qualityColors[quality] ?? qualityColors["HD"];
          const rank = idx + 1;
          const image = movie.poster_url ?? movie.thumbnail_url ?? movie.backdrop_url;
          const gradient = movie.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)";
          return (
            <a
              key={movie.id}
              href={`/movie/${movie.slug}`}
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
                className="absolute right-0 top-0 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_32px_rgba(201,168,53,0.3)] group-hover:border-[rgba(201,168,53,0.4)]"
                style={{
                  width: "155px",
                  height: "300px",
                  background: gradient,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                  zIndex: 2,
                }}
              >
                {/* Poster image */}
                {image && (
                  <img
                    src={image}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
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
                  {quality}
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
