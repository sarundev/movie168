import { getMovieRating, type ApiMovie } from "../lib/api";

interface SeriesRowProps {
  title: string;
  series: ApiMovie[];
  viewAllHref?: string;
}

const qualityBg: Record<string, string> = { "4K": "#1d4ed8", FHD: "#b45309", HD: "#15803d" };
const badgeBg:   Record<string, string> = { NEW: "#c9a835", HOT: "#e50914", TOP: "#7c3aed" };

export default function SeriesRow({ title, series, viewAllHref = "/series" }: SeriesRowProps) {
  return (
    <div>
      {/* ── Section header ── */}
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
          className="text-xs font-semibold transition-colors"
          style={{ color: "#c9a835" }}
        >
          View All →
        </a>
      </div>

      {/* ── Mobile: horizontal scroll (small cards) ── */}
      <div className="sm:hidden flex gap-3 overflow-x-auto hide-scrollbar pb-3">
        {series.map(s => {
          const quality = s.quality ?? "HD";
          const qColor = qualityBg[quality] ?? "#15803d";
          const image = s.poster_url ?? s.thumbnail_url ?? s.backdrop_url;
          const gradient = s.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)";
          return (
            <a
              key={s.id}
              href={`/tv-shows/${s.slug}`}
              className="group shrink-0 cursor-pointer"
              style={{ width: "120px" }}
            >
              {/* Poster */}
              <div
                className="relative rounded-lg overflow-hidden"
                style={{
                  width: "120px",
                  height: "172px",
                  background: gradient,
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.6)",
                }}
              >
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 50%)" }}
                />

                {s.badge && (
                  <span
                    className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest"
                    style={{ background: badgeBg[s.badge] ?? "#c9a835", color: "white" }}
                  >
                    {s.badge}
                  </span>
                )}

                <span
                  className="absolute bottom-1.5 left-1.5 text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide"
                  style={{ background: qColor, color: "white" }}
                >
                  {quality}
                </span>

                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity duration-150"
                  style={{ background: "rgba(0,0,0,0.45)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(201,168,53,0.92)", boxShadow: "0 0 20px rgba(201,168,53,0.5)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0d0d12">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-1.5 px-0.5">
                <p
                  className="text-[11px] font-semibold line-clamp-2 leading-tight transition-colors group-hover:text-amber-400"
                  style={{ color: "#e5e5e5" }}
                >
                  {s.title}
                </p>
                {s.release_year && (
                  <p className="text-[10px] mt-0.5" style={{ color: "#666" }}>
                    {s.release_year}
                  </p>
                )}
              </div>
            </a>
          );
        })}

        <a
          href={viewAllHref}
          className="shrink-0 flex flex-col items-center justify-center gap-2 rounded-lg transition-colors"
          style={{
            width: "120px",
            height: "172px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,53,0.2)",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(201,168,53,0.12)", border: "1px solid rgba(201,168,53,0.3)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: "#c9a835" }}>
            View All
          </span>
        </a>
      </div>

      {/* ── Desktop: horizontal scroll (large cards) ── */}
      <div className="hidden sm:flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4">
        {series.map(s => {
          const quality = s.quality ?? "HD";
          const qColor = qualityBg[quality] ?? "#15803d";
          const image = s.poster_url ?? s.thumbnail_url ?? s.backdrop_url;
          const gradient = s.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)";
          const { average: rating } = getMovieRating(s);
          const genres = (s.genres ?? []).map(g => typeof g === "string" ? g : g.name);
          const year = s.release_year ?? (s.release_date ? new Date(s.release_date).getFullYear() : null);
          return (
            <a
              key={s.id}
              href={`/tv-shows/${s.slug}`}
              className="group shrink-0 cursor-pointer"
              style={{ width: "230px" }}
            >
              {/* Poster */}
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.04] group-hover:z-10 shadow-[0_4px_16px_rgba(0,0,0,0.55)] group-hover:shadow-[0_8px_32px_rgba(201,168,53,0.3),0_0_0_1.5px_rgba(201,168,53,0.4)]"
                style={{
                  width: "230px",
                  height: "330px",
                  background: gradient,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.2) 45%,transparent 100%)" }}
                />

                {s.badge && (
                  <span
                    className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded tracking-widest"
                    style={{ background: badgeBg[s.badge] ?? "#c9a835", color: "white" }}
                  >
                    {s.badge}
                  </span>
                )}

                <span
                  className="absolute bottom-2 left-2 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider"
                  style={{ background: qColor, color: "white" }}
                >
                  {quality === "4K" ? "4K ULTRA HD" : quality === "FHD" ? "FHD 1080P" : "HD 720P"}
                </span>

                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 opacity-0 group-hover:opacity-100 transition-all duration-250"
                  style={{ background: "rgba(0,0,0,0.58)" }}
                >
                  <button
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ background: "rgba(201,168,53,0.94)", boxShadow: "0 0 28px rgba(201,168,53,0.5)" }}
                    aria-label={`Play ${s.title}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0d0d12">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>

                  {rating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <svg width="13" height="13" fill="#c9a835" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white text-sm font-bold">{rating.toFixed(1)}</span>
                    </div>
                  )}

                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center px-3">
                      {genres.slice(0, 2).map(g => (
                        <span
                          key={g}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", color: "#ddd" }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2.5 px-0.5">
                <p
                  className="text-sm font-semibold leading-snug line-clamp-1 transition-colors group-hover:text-amber-400"
                  style={{ color: "#e5e5e5" }}
                >
                  {s.title}
                </p>
                {year && (
                  <p className="text-xs mt-0.5" style={{ color: "#777" }}>
                    {year}
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
