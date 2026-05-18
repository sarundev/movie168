"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchMovies, fetchMovieFilters, getMovieRating, type ApiMovie, type ApiGenre } from "../lib/api";

const SORTS = [
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


interface DisplayMovie {
  id: number;
  slug: string;
  title: string;
  originalTitle?: string;
  year: number;
  rating: number;
  quality: string;
  badge?: string;
  price?: number;
  gradient: string;
  image?: string;
}

function toDisplay(m: ApiMovie): DisplayMovie {
  const { average } = getMovieRating(m);
  return {
    id:            m.id,
    slug:          m.slug,
    title:         m.title,
    originalTitle: m.original_title,
    year:          m.release_year ?? (m.release_date ? new Date(m.release_date).getFullYear() : 0),
    rating:        average,
    quality:       m.quality ?? "HD",
    badge:         m.badge,
    price:         m.price,
    gradient:      m.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)",
    image:         m.poster_url ?? m.thumbnail_url ?? m.backdrop_url,
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
  const searchParams = useSearchParams();

  // Filter state — initialised from URL params so navbar links work
  const [genre,       setGenre]       = useState(searchParams.get("genre") ?? "");
  const [quality,     setQuality]     = useState(searchParams.get("quality") ?? "");
  const [sort,        setSort]        = useState(searchParams.get("sort") ?? "newest");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [search,      setSearch]      = useState(searchParams.get("q") ?? "");

  // Movies state
  const [movies,      setMovies]      = useState<DisplayMovie[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters from API
  const [genreList,   setGenreList]   = useState<ApiGenre[]>([]);
  const [qualityList, setQualityList] = useState<string[]>([]);

  const loaderRef = useRef<HTMLDivElement>(null);

  // Load filter options once on mount
  useEffect(() => {
    fetchMovieFilters().then((f) => {
      setGenreList(f.genres);
      setQualityList(f.qualities.map((q) => q.value));
    }).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const buildParams = useCallback((pg: number) => {
    const p: Record<string, string> = { page: String(pg), per_page: "24" };
    if (sort !== "newest") p.sort = sort;
    if (genre)   p.genre   = genre;
    if (quality) p.quality = quality;
    if (search.trim()) p.search = search.trim();
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

  // Infinite scroll
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

  // Client-side sort supplement for already-loaded data
  const displayed = useMemo(() => {
    const list = [...movies];
    if (sort === "alpha")  list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "oldest") list.sort((a, b) => a.year - b.year);
    return list;
  }, [movies, sort]);

  const selectedGenreName = genreList.find(g => g.slug === genre)?.name ?? genre;

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

          {/* Search + filter toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="relative flex w-full sm:w-48 gap-2">
              <div className="relative flex-1">
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
        </div>

        {/* Active filters */}
        {(genre || quality || search.trim()) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs" style={{ color:"#666" }}>Active:</span>
            {genre && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                {selectedGenreName}
                <button onClick={() => setGenre("")} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            {quality && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                {quality}
                <button onClick={() => setQuality("")} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            {search.trim() && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                &quot;{search}&quot;
                <button onClick={() => { setSearchInput(""); setSearch(""); }} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            <button onClick={() => { setGenre(""); setQuality(""); setSearchInput(""); setSearch(""); }}
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
        <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block lg:shrink-0`} style={{ minWidth: "160px" }}>

          {/* Genre filter */}
          <div className="mb-4 lg:mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 lg:mb-3" style={{ color:"#c9a835" }}>Genre</h3>

            {/* Mobile: pill buttons */}
            <div className="flex flex-wrap gap-1.5 lg:hidden">
              <button onClick={() => setGenre("")}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: !genre ? "rgba(201,168,53,0.18)" : "rgba(255,255,255,0.06)",
                  color: !genre ? "#c9a835" : "#888",
                  border: !genre ? "1px solid rgba(201,168,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
                }}>
                All
              </button>
              {genreList.map(g => (
                <button key={g.id} onClick={() => setGenre(g.slug)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: genre === g.slug ? "rgba(201,168,53,0.18)" : "rgba(255,255,255,0.06)",
                    color: genre === g.slug ? "#c9a835" : "#888",
                    border: genre === g.slug ? "1px solid rgba(201,168,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  }}>
                  {g.name}
                </button>
              ))}
            </div>

            {/* Desktop: list */}
            <div className="hidden lg:flex flex-col gap-1">
              <button onClick={() => setGenre("")}
                className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                style={{
                  background: !genre ? "rgba(201,168,53,0.12)" : "transparent",
                  color: !genre ? "#c9a835" : "#888",
                  borderLeft: !genre ? "2px solid #c9a835" : "2px solid transparent",
                }}>
                All Genres
              </button>
              {genreList.map(g => (
                <button key={g.id} onClick={() => setGenre(g.slug)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: genre === g.slug ? "rgba(201,168,53,0.12)" : "transparent",
                    color: genre === g.slug ? "#c9a835" : "#888",
                    borderLeft: genre === g.slug ? "2px solid #c9a835" : "2px solid transparent",
                  }}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quality filter */}
          <div className="mb-4 lg:mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 lg:mb-3" style={{ color:"#c9a835" }}>Quality</h3>

            <div className="flex flex-wrap gap-1.5 lg:hidden">
              <button onClick={() => setQuality("")}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: !quality ? "rgba(201,168,53,0.18)" : "rgba(255,255,255,0.06)",
                  color: !quality ? "#c9a835" : "#888",
                  border: !quality ? "1px solid rgba(201,168,53,0.5)" : "1px solid rgba(255,255,255,0.1)",
                }}>
                All
              </button>
              {qualityList.map(q => (
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
              <button onClick={() => setQuality("")}
                className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                style={{
                  background: !quality ? "rgba(201,168,53,0.12)" : "transparent",
                  color: !quality ? "#c9a835" : "#888",
                  borderLeft: !quality ? "2px solid #c9a835" : "2px solid transparent",
                }}>
                All Quality
              </button>
              {qualityList.map(q => (
                <button key={q} onClick={() => setQuality(q)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: quality === q ? "rgba(201,168,53,0.12)" : "transparent",
                    color: quality === q ? "#c9a835" : "#888",
                    borderLeft: quality === q ? "2px solid #c9a835" : "2px solid transparent",
                  }}>
                  {q}
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
              <button onClick={() => { setGenre(""); setQuality(""); setSearchInput(""); setSearch(""); }}
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
                  const { label: qLabel } = qualityInfo(movie.quality);
                  return (
                    <a key={movie.id} href={`/movie/${movie.slug}`} className="group cursor-pointer block">
                      <div
                        className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.03]"
                        style={{
                          aspectRatio: "2/3",
                          background: movie.gradient,
                          boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(201,168,53,0.3), 0 0 0 1.5px rgba(201,168,53,0.45)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.6)"; }}
                      >
                        {/* Poster image */}
                        {movie.image && (
                          <img src={movie.image} alt={movie.title}
                            className="absolute inset-0 w-full h-full object-cover object-top"
                            loading="lazy"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        )}

                        {/* Bottom gradient overlay */}
                        <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.4) 40%,transparent 65%)" }} />

                        {/* Top-left: price badge */}
                        {movie.price && movie.price > 0 ? (
                          <span className="absolute top-2 left-2 font-black rounded-md leading-none"
                            style={{ fontSize:"clamp(8px,1.9vw,11px)", padding:"3px 7px", background:"#e50914", color:"white", letterSpacing:"0.02em" }}>
                            ${movie.price}
                          </span>
                        ) : movie.badge ? (
                          <span className="absolute top-2 left-2 font-black rounded-md leading-none"
                            style={{ fontSize:"clamp(8px,1.9vw,11px)", padding:"3px 7px", background: badgeBg[movie.badge] ?? "#c9a835", color:"white" }}>
                            {movie.badge}
                          </span>
                        ) : null}

                        {/* Top-right: quality badge */}
                        <span className="absolute top-2 right-2 font-black rounded-md leading-none"
                          style={{ fontSize:"clamp(8px,1.9vw,11px)", padding:"3px 7px", background: qColor, color:"white" }}>
                          {qLabel}
                        </span>

                        {/* Bottom info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 px-2 pb-2.5 pt-6">
                          <p className="font-bold line-clamp-1 leading-snug"
                            style={{ color:"#ffffff", fontSize:"clamp(9px,2.6vw,13px)" }}>
                            {movie.title}
                          </p>
                          {movie.originalTitle && movie.originalTitle !== movie.title && (
                            <p className="line-clamp-1 leading-snug mt-0.5"
                              style={{ color:"rgba(255,255,255,0.6)", fontSize:"clamp(8px,2.2vw,11px)" }}>
                              {movie.originalTitle}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span style={{ color:"#aaa", fontSize:"clamp(8px,2vw,10px)" }}>
                              {movie.year || ""}
                            </span>
                            {movie.rating > 0 && (
                              <span className="flex items-center gap-0.5" style={{ color:"#f5c518", fontSize:"clamp(8px,2vw,10px)" }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="#f5c518"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                {movie.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hover play button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ background:"rgba(0,0,0,0.35)" }}>
                          <div className="w-11 h-11 rounded-full flex items-center justify-center"
                            style={{ background:"rgba(201,168,53,0.92)", boxShadow:"0 0 24px rgba(201,168,53,0.55)" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d0d12">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

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
