"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchMovies, getMovieRating, type ApiMovie } from "../lib/api";

const GENRES   = ["All","Action","Drama","Sci-Fi","Horror","Comedy","Romance","Thriller","Animation","Fantasy","Crime","History"];
const QUALITIES: Array<"All"|"4K"|"FHD"|"HD"> = ["All","4K","FHD","HD"];
const SORTS     = [
  { label: "Newest First",  key: "newest"  },
  { label: "Highest Rated", key: "rating"  },
  { label: "Title A–Z",     key: "alpha"   },
  { label: "Oldest First",  key: "oldest"  },
];

const qualityBg: Record<string, string> = { "4K":"#1d4ed8", FHD:"#b45309", HD:"#15803d" };
const badgeBg:   Record<string, string> = { NEW:"#c9a835", HOT:"#e50914", TOP:"#7c3aed", AWARD:"#065f46" };

function qualityInfo(q: string): { label: string; sub: string } {
  if (q === "4K")  return { label: "4K",  sub: "ULTRA HD" };
  if (q === "FHD") return { label: "FHD", sub: "1080P" };
  if (q === "HD")  return { label: "HD",  sub: "720P" };
  return { label: q, sub: "" };
}

function fmtDate(releaseDate?: string, year?: number): string {
  if (releaseDate) {
    const d = new Date(releaseDate + "T00:00:00");
    const m = ["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];
    return `${m[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}, ${d.getFullYear()}`;
  }
  return year ? String(year) : "";
}

interface DisplayMovie {
  id: number;
  slug: string;
  title: string;
  year: number;
  releaseDate?: string;
  rating: number;
  genres: string[];
  quality: string;
  badge?: string;
  gradient: string;
  image?: string;
}

function toDisplay(m: ApiMovie): DisplayMovie {
  const { average } = getMovieRating(m);
  return {
    id:          m.id,
    slug:        m.slug,
    title:       m.title,
    year:        m.release_year ?? (m.release_date ? new Date(m.release_date).getFullYear() : 0),
    releaseDate: m.release_date,
    rating:      average,
    genres:      (m.genres ?? []).map(g => typeof g === "string" ? g : g.name),
    quality:     m.quality ?? "HD",
    badge:       m.badge,
    gradient:    m.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)",
    image:       m.poster_url ?? m.thumbnail_url ?? m.backdrop_url,
  };
}

function MovieCardSkeleton() {
  return (
    <div>
      <div className="rounded-lg sm:rounded-xl animate-pulse" style={{ aspectRatio:"2/3", background:"rgba(255,255,255,0.06)" }} />
      <div className="mt-1.5 space-y-1">
        <div className="h-3 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.06)", width:"80%" }} />
        <div className="h-2.5 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.04)", width:"50%" }} />
      </div>
    </div>
  );
}

export default function MoviesPage() {
  const [movies,      setMovies]      = useState<DisplayMovie[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [genre,       setGenre]       = useState("All");
  const [quality,     setQuality]     = useState<"All"|"4K"|"FHD"|"HD">("All");
  const [sort,        setSort]        = useState("newest");
  const [searchInput, setSearchInput] = useState("");
  const [search,      setSearch]      = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Debounce search input by 400ms to avoid firing API on every keystroke
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const buildParams = useCallback((pg: number) => {
    const p: Record<string, string> = { page: String(pg), per_page: "24" };
    if (sort !== "newest") p.sort = sort;
    if (genre !== "All")   p.genre = genre.toLowerCase();
    if (quality !== "All") p.quality = quality;
    if (search.trim())     p.search = search.trim();
    return p;
  }, [sort, genre, quality, search]);

  // Reset and reload when filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    setHasMore(true);

    fetchMovies(buildParams(1))
      .then(data => {
        if (cancelled) return;
        setMovies(data.map(toDisplay));
        setHasMore(data.length === 24);
      })
      .catch(() => { if (!cancelled) setMovies([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [buildParams]);

  // Infinite scroll — load next page
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await fetchMovies(buildParams(nextPage));
      setMovies(prev => [...prev, ...data.map(toDisplay)]);
      setPage(nextPage);
      setHasMore(data.length === 24);
    } catch {}
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, buildParams]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Client-side sort (supplements server sort for already-loaded data)
  const displayed = useMemo(() => {
    const list = [...movies];
    if (sort === "alpha")  list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "oldest") list.sort((a, b) => a.year - b.year);
    return list;
  }, [movies, sort]);

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      {/* Page header */}
      <div className="px-4 sm:px-6 lg:px-12 pt-20 pb-6" style={{ borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "#666" }}>
              <a href="/" style={{ color: "#888" }} className="hover:text-amber-400 transition-colors">Home</a>
              <span>/</span>
              <span style={{ color: "#c9a835" }}>Movies</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "#f0f0f0" }}>All Movies</h1>
            <p className="text-sm mt-1" style={{ color: "#666" }}>
              {loading ? "Loading…" : `${displayed.length}${hasMore ? "+" : ""} titles`}
            </p>
          </div>

          {/* Search + sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="relative flex just w-full sm:w-48">
              <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search movies..."
                className="pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-zinc-600 outline-none w-full"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}
              />
              </div>
<div className="relative">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
                style={{ background:"rgba(201,168,53,0.1)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="6" y2="6"/><line x1="8" x2="20" y1="12" y2="12"/><line x1="12" x2="20" y1="18" y2="18"/>
                </svg>
                Filter
              </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#aaa" }}
              >
                {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select> */}
              
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(genre !== "All" || quality !== "All" || search.trim()) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs" style={{ color:"#666" }}>Active:</span>
            {genre !== "All" && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                {genre}
                <button onClick={() => setGenre("All")} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            {quality !== "All" && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                {quality}
                <button onClick={() => setQuality("All")} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            {search.trim() && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                "{search}"
                <button onClick={() => { setSearchInput(""); setSearch(""); }} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            <button onClick={() => { setGenre("All"); setQuality("All"); setSearchInput(""); setSearch(""); }}
              className="text-xs transition-colors" style={{ color:"#666" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e50914")}
              onMouseLeave={e => (e.currentTarget.style.color = "#666")}>
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row px-4 sm:px-6 lg:px-12 py-8 gap-6 lg:gap-8">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block lg:shrink-0`}>
          {/* Genre filter */}
          <div className="mb-4 lg:mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 lg:mb-3" style={{ color:"#c9a835" }}>Genre</h3>
            <div className="flex flex-wrap gap-1.5 lg:hidden">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: genre === g ? "rgba(201,168,53,0.18)" : "rgba(255,255,255,0.06)",
                    color: genre === g ? "#c9a835" : "#888",
                    border: genre === g ? "1px solid rgba(201,168,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  }}>
                  {g}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex flex-col gap-1">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: genre === g ? "rgba(201,168,53,0.12)" : "transparent",
                    color: genre === g ? "#c9a835" : "#888",
                    borderLeft: genre === g ? "2px solid #c9a835" : "2px solid transparent",
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Quality filter */}
          <div className="mb-4 lg:mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 lg:mb-3" style={{ color:"#c9a835" }}>Quality</h3>
            <div className="flex flex-wrap gap-1.5 lg:hidden">
              {QUALITIES.map(q => (
                <button key={q} onClick={() => setQuality(q)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: quality === q ? "rgba(201,168,53,0.18)" : "rgba(255,255,255,0.06)",
                    color: quality === q ? "#c9a835" : "#888",
                    border: quality === q ? "1px solid rgba(201,168,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  }}>
                  {q}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex flex-col gap-1">
              {QUALITIES.map(q => (
                <button key={q} onClick={() => setQuality(q)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: quality === q ? "rgba(201,168,53,0.12)" : "transparent",
                    color: quality === q ? "#c9a835" : "#888",
                    borderLeft: quality === q ? "2px solid #c9a835" : "2px solid transparent",
                  }}>
                  {q === "All" ? "All Quality" : q}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Movie grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-4">
              {Array.from({ length: 24 }).map((_, i) => <MovieCardSkeleton key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="text-5xl">🎬</div>
              <p className="text-lg font-semibold" style={{ color:"#555" }}>No movies found</p>
              <button onClick={() => { setGenre("All"); setQuality("All"); setSearchInput(""); setSearch(""); }}
                className="px-6 py-2 rounded-lg text-sm font-semibold"
                style={{ background:"linear-gradient(135deg,#c9a835,#8a6e1a)", color:"#0d0d12" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-4">
                {displayed.map(movie => {
                  const qColor = qualityBg[movie.quality] ?? "#15803d";
                  const { label: qLabel, sub: qSub } = qualityInfo(movie.quality);
                  const dateText = fmtDate(movie.releaseDate, movie.year);
                  return (
                    <a key={movie.id} href={`/movie/${movie.slug}`} className="group cursor-pointer">
                      <div
                        className="relative rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.03]"
                        style={{
                          aspectRatio: "2/3",
                          background: movie.gradient,
                          border: "1px solid rgba(255,255,255,0.06)",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(201,168,53,0.28), 0 0 0 1.5px rgba(201,168,53,0.4)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.5)"; }}
                      >
                        {movie.image && (
                          <img src={movie.image} alt={movie.title}
                            className="absolute inset-0 w-full h-full object-cover object-top"
                            loading="lazy"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        )}

                        <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 45%)" }} />

                        <div className="absolute top-1.5 left-1.5 font-black rounded leading-none"
                          style={{ fontSize:"clamp(7px,1.8vw,9px)", padding:"2px 5px", background:"rgba(0,0,0,0.55)", color:"#c9a835" }}>
                          168
                        </div>

                        {movie.badge && (
                          <span className="absolute top-1.5 right-1.5 font-black rounded tracking-widest"
                            style={{ fontSize:"clamp(7px,1.8vw,9px)", padding:"2px 5px", background: badgeBg[movie.badge] ?? "#c9a835", color:"white" }}>
                            {movie.badge}
                          </span>
                        )}

                        <div className="absolute bottom-1.5 left-1.5 flex items-center rounded overflow-hidden">
                          <span className="font-black" style={{ fontSize:"clamp(7px,1.8vw,9px)", padding:"2px 5px", background: qColor, color:"white" }}>
                            {qLabel}
                          </span>
                          {qSub && (
                            <span className="font-black" style={{ fontSize:"clamp(7px,1.8vw,9px)", padding:"2px 5px", background:"rgba(0,0,0,0.82)", color:"#ccc" }}>
                              {qSub}
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ background:"rgba(0,0,0,0.5)" }}>
                          <div className="w-11 h-11 rounded-full flex items-center justify-center"
                            style={{ background:"rgba(201,168,53,0.9)", boxShadow:"0 0 24px rgba(201,168,53,0.5)" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d0d12">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="mt-1.5 px-0.5">
                        <p className="font-semibold line-clamp-2 leading-tight transition-colors group-hover:text-amber-400"
                          style={{ color:"#e5e5e5", fontSize:"clamp(10px,2.8vw,13px)" }}>
                          {movie.title}
                        </p>
                        <p className="mt-0.5" style={{ color:"#777", fontSize:"clamp(9px,2.3vw,11px)" }}>
                          {dateText}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={loaderRef} className="h-16 flex items-center justify-center mt-4">
                {loadingMore && (
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
