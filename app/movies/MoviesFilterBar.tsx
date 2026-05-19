"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SORTS = [
  { label: "Newest First",  key: "newest"  },
  { label: "Highest Rated", key: "rating"  },
  { label: "Title A–Z",     key: "alpha"   },
  { label: "Oldest First",  key: "oldest"  },
];

interface Genre { id: number; name: string; slug: string }

export default function MoviesFilterBar({
  genreList = [],
  qualityList = [],
  initialGenre = "",
  initialQuality = "",
  initialSort = "newest",
  initialSearch = "",
  hasFilters = false,
  sidebar = false,
}: {
  genreList?: Genre[];
  qualityList?: string[];
  initialGenre?: string;
  initialQuality?: string;
  initialSort?: string;
  initialSearch?: string;
  hasFilters?: boolean;
  sidebar?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const genre = searchParams.get("genre") ?? initialGenre;
  const quality = searchParams.get("quality") ?? initialQuality;
  const sort = searchParams.get("sort") ?? initialSort;
  const search = searchParams.get("q") ?? initialSearch;

  const [searchInput, setSearchInput] = useState(search);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const buildHref = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const p = new URLSearchParams();
      const g = overrides.genre !== undefined ? overrides.genre : genre;
      const q = overrides.quality !== undefined ? overrides.quality : quality;
      const s = overrides.sort !== undefined ? overrides.sort : sort;
      const sq = overrides.q !== undefined ? overrides.q : search;
      if (s && s !== "newest") p.set("sort", s);
      if (g) p.set("genre", g);
      if (q) p.set("quality", q);
      if (sq?.trim()) p.set("q", sq.trim());
      const qs = p.toString();
      return `/movies${qs ? `?${qs}` : ""}`;
    },
    [genre, quality, sort, search],
  );

  const navigate = useCallback(
    (overrides: Record<string, string | undefined>) => {
      router.push(buildHref(overrides));
    },
    [router, buildHref],
  );

  // Debounced search navigation
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput !== search) {
        navigate({ q: searchInput });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedGenreName = genreList.find((g) => g.slug === genre)?.name ?? genre;

  // ── Search bar + mobile filter toggle (shown in header slot) ──────────
  if (!sidebar) {
    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-3">
          <div className="relative flex w-full sm:w-48 gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search movies..."
                className="pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-zinc-600 outline-none w-full"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.3)", color: "#c9a835" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="8" x2="20" y1="12" y2="12" />
                <line x1="12" x2="20" y1="18" y2="18" />
              </svg>
              Filter
            </button>
          </div>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => navigate({ sort: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc" }}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key} style={{ background: "#1a1a24", color: "#ccc" }}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active filter tags */}
        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs" style={{ color: "#666" }}>Active:</span>
            {genre && (
              <span
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(201,168,53,0.12)", border: "1px solid rgba(201,168,53,0.3)", color: "#c9a835" }}
              >
                {selectedGenreName}
                <button onClick={() => navigate({ genre: "" })} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            {quality && (
              <span
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(201,168,53,0.12)", border: "1px solid rgba(201,168,53,0.3)", color: "#c9a835" }}
              >
                {quality}
                <button onClick={() => navigate({ quality: "" })} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            {search.trim() && (
              <span
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(201,168,53,0.12)", border: "1px solid rgba(201,168,53,0.3)", color: "#c9a835" }}
              >
                &quot;{search}&quot;
                <button onClick={() => { setSearchInput(""); navigate({ q: "" }); }} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearchInput(""); navigate({ genre: "", quality: "", q: "" }); }}
              className="text-xs transition-colors"
              style={{ color: "#666" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e50914")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
            >
              Clear all
            </button>
          </div>
        )}
      </>
    );
  }

  // ── Sidebar version ──────────────────────────────────────────────────

  /* Mobile overlay */
  const content = (
    <>
      {/* Genre filter */}
      <div className="mb-4 lg:mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-2 lg:mb-3" style={{ color: "#c9a835" }}>Genre</h3>

        <div className="flex flex-wrap gap-1.5 lg:hidden">
          <button
            onClick={() => navigate({ genre: "" })}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={{
              background: !genre ? "rgba(201,168,53,0.18)" : "rgba(255,255,255,0.06)",
              color: !genre ? "#c9a835" : "#888",
              border: !genre ? "1px solid rgba(201,168,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            All
          </button>
          {genreList.map((g) => (
            <button
              key={g.id}
              onClick={() => navigate({ genre: genre === g.slug ? "" : g.slug })}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: genre === g.slug ? "rgba(201,168,53,0.18)" : "rgba(255,255,255,0.06)",
                color: genre === g.slug ? "#c9a835" : "#888",
                border: genre === g.slug ? "1px solid rgba(201,168,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex flex-col gap-1">
          <button
            onClick={() => navigate({ genre: "" })}
            className="text-left px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              background: !genre ? "rgba(201,168,53,0.12)" : "transparent",
              color: !genre ? "#c9a835" : "#888",
              borderLeft: !genre ? "2px solid #c9a835" : "2px solid transparent",
            }}
          >
            All Genres
          </button>
          {genreList.map((g) => (
            <button
              key={g.id}
              onClick={() => navigate({ genre: genre === g.slug ? "" : g.slug })}
              className="text-left px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: genre === g.slug ? "rgba(201,168,53,0.12)" : "transparent",
                color: genre === g.slug ? "#c9a835" : "#888",
                borderLeft: genre === g.slug ? "2px solid #c9a835" : "2px solid transparent",
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quality filter */}
      <div className="mb-4 lg:mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-2 lg:mb-3" style={{ color: "#c9a835" }}>Quality</h3>

        <div className="flex flex-wrap gap-1.5 lg:hidden">
          <button
            onClick={() => navigate({ quality: "" })}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={{
              background: !quality ? "rgba(201,168,53,0.18)" : "rgba(255,255,255,0.06)",
              color: !quality ? "#c9a835" : "#888",
              border: !quality ? "1px solid rgba(201,168,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            All
          </button>
          {qualityList.map((q) => (
            <button
              key={q}
              onClick={() => navigate({ quality: quality === q ? "" : q })}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: quality === q ? "rgba(201,168,53,0.18)" : "rgba(255,255,255,0.06)",
                color: quality === q ? "#c9a835" : "#888",
                border: quality === q ? "1px solid rgba(201,168,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex flex-col gap-1">
          <button
            onClick={() => navigate({ quality: "" })}
            className="text-left px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              background: !quality ? "rgba(201,168,53,0.12)" : "transparent",
              color: !quality ? "#c9a835" : "#888",
              borderLeft: !quality ? "2px solid #c9a835" : "2px solid transparent",
            }}
          >
            All Quality
          </button>
          {qualityList.map((q) => (
            <button
              key={q}
              onClick={() => navigate({ quality: quality === q ? "" : q })}
              className="text-left px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: quality === q ? "rgba(201,168,53,0.12)" : "transparent",
                color: quality === q ? "#c9a835" : "#888",
                borderLeft: quality === q ? "2px solid #c9a835" : "2px solid transparent",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{content}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setSidebarOpen(false)} />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 overflow-y-auto p-6"
            style={{ background: "#0d0d12", borderRight: "1px solid rgba(201,168,53,0.15)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold" style={{ color: "#c9a835" }}>Filters</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-xl" style={{ color: "#888" }}>×</button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
