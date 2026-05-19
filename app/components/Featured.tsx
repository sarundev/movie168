import { getMovieRating, type ApiMovie } from "../lib/api";

const qualityStyle: Record<string, { bg: string }> = {
  "4K": { bg: "#1d4ed8" },
  FHD: { bg: "#b45309" },
  HD:  { bg: "#15803d" },
  CAM: { bg: "#6b7280" },
};

const badgeStyle: Record<string, string> = {
  NEW: "#c9a835",
  HOT: "#e50914",
  TOP: "#7c3aed",
};

export default function Featured({ movies }: { movies: ApiMovie[] }) {
  if (movies.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-12 pt-20 pb-8">
      {/* 3-column featured grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {movies.map((movie, idx) => {
          const quality = movie.quality ?? "HD";
          const qs = qualityStyle[quality] ?? qualityStyle["HD"];
          const image = movie.poster_url ?? movie.thumbnail_url ?? movie.backdrop_url;
          const gradient = movie.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)";
          const { average: rating } = getMovieRating(movie);
          const year = movie.release_year ?? (movie.release_date ? new Date(movie.release_date).getFullYear() : null);
          const duration = movie.runtime_minutes
            ? `${Math.floor(movie.runtime_minutes / 60)}h ${movie.runtime_minutes % 60}m`
            : "";
          const genres = (movie.genres ?? []).map(g => typeof g === "string" ? g : g.name);
          const isCenter = idx === 1;
          return (
            <a
              key={movie.id}
              href={`/movie/${movie.slug}`}
              className={`group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ${
                isCenter ? "sm:-mt-3 sm:mb-3" : ""
              }`}
              style={{
                aspectRatio: "16/9",
                background: gradient,
                border: isCenter
                  ? "1px solid rgba(201,168,53,0.4)"
                  : "1px solid rgba(201,168,53,0.1)",
                boxShadow: isCenter
                  ? "0 0 0 1px rgba(201,168,53,0.2), 0 8px 32px rgba(0,0,0,0.6)"
                  : "0 4px 20px rgba(0,0,0,0.5)",
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
                    style={{ background: badgeStyle[movie.badge] ?? "#c9a835", color: "white" }}
                  >
                    {movie.badge}
                  </span>
                )}
                <span
                  className="text-[11px] font-black px-2 py-1 rounded tracking-wider"
                  style={{ background: qs.bg, color: "white" }}
                >
                  {quality}
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-1">
                  {movie.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs" style={{ color: "#aaa" }}>
                    {year && <span>{year}</span>}
                    {duration && (
                      <>
                        <span className="w-1 h-1 rounded-full" style={{ background: "#c9a835" }} />
                        <span>{duration}</span>
                      </>
                    )}
                    {rating > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full" style={{ background: "#c9a835" }} />
                        <div className="flex items-center gap-1">
                          <svg width="11" height="11" fill="#c9a835" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span style={{ color: "#c9a835" }} className="font-semibold">{rating.toFixed(1)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #c9a835, #8a6e1a)", color: "#0d0d12" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Watch Now
                  </button>
                </div>

                {/* Genre tags */}
                {genres.length > 0 && (
                  <div className="flex gap-1.5 mt-2.5">
                    {genres.slice(0, 3).map((g) => (
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
                )}
              </div>

              {/* Hover play overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(0,0,0,0.28)" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(201,168,53,0.9)", boxShadow: "0 0 40px rgba(201,168,53,0.5)" }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#0d0d12">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
