"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchMovies, fetchMovieFilters, getMovieRating, type ApiMovie, type ApiGenre } from "../lib/api";

const qualityBg: Record<string, string> = { "4K":"#1d4ed8", FHD:"#b45309", HD:"#15803d" };
const badgeBg:   Record<string, string> = { NEW:"#c9a835", HOT:"#e50914", TOP:"#7c3aed" };

interface DisplaySeries {
  id: number;
  slug: string;
  title: string;
  year: number;
  rating: number;
  quality: string;
  badge?: string;
  image?: string;
  type: string;
}

function toDisplay(m: ApiMovie): DisplaySeries {
  const { average } = getMovieRating(m);
  return {
    id:      m.id,
    slug:    m.slug,
    title:   m.title,
    year:    m.release_year ?? (m.release_date ? new Date(m.release_date).getFullYear() : 0),
    rating:  average,
    quality: m.quality ?? "HD",
    badge:   m.badge,
    image:   m.poster_url ?? m.thumbnail_url ?? m.backdrop_url,
    type:    m.type ?? "series",
  };
}

function CardSkeleton() {
  return (
    <div>
      <div className="rounded-xl animate-pulse" style={{ aspectRatio:"2/3", background:"rgba(255,255,255,0.06)" }} />
      <div className="mt-2 space-y-1">
        <div className="h-3 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.06)", width:"80%" }} />
        <div className="h-2.5 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.04)", width:"50%" }} />
      </div>
    </div>
  );
}

export default function SeriesPage() {
  const searchParams = useSearchParams();

  const [genre,       setGenre]       = useState(searchParams.get("genre") ?? "");
  const [sort,        setSort]        = useState(searchParams.get("sort") ?? "newest");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [search,      setSearch]      = useState(searchParams.get("q") ?? "");

  const [series,      setSeries]      = useState<DisplaySeries[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [genreList,   setGenreList]   = useState<ApiGenre[]>([]);

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMovieFilters().then((f) => setGenreList(f.genres)).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const buildParams = useCallback((pg: number) => {
    const p: Record<string, string> = { page: String(pg), per_page: "24", type: "series" };
    if (sort !== "newest") p.sort = sort;
    if (genre)             p.genre = genre;
    if (search.trim())     p.search = search.trim();
    return p;
  }, [sort, genre, search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    setHasMore(true);

    fetchMovies(buildParams(1))
      .then(data => {
        if (cancelled) return;
        setSeries(data.map(toDisplay));
        setHasMore(data.length === 24);
      })
      .catch(() => { if (!cancelled) setSeries([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [buildParams]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await fetchMovies(buildParams(nextPage));
      setSeries(prev => [...prev, ...data.map(toDisplay)]);
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

  const selectedGenreName = genreList.find(g => g.slug === genre)?.name ?? genre;

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      {/* Page header */}
      <div className="px-4 mt-8 sm:px-6 lg:px-12 pt-20 pb-6" style={{ borderBottom:"1px solid rgba(201,168,53,0.1)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1" style={{ color:"#666" }}>
              <a href="/" style={{ color:"#888" }} className="hover:text-amber-400 transition-colors">Home</a>
              <span>/</span>
              <span style={{ color:"#c9a835" }}>TV Series</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color:"#f0f0f0" }}>TV Series</h1>
            <p className="text-sm mt-1" style={{ color:"#666" }}>
              {loading ? "Loading…" : `${series.length}${hasMore ? "+" : ""} series`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Search series..."
                className="pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-zinc-600 outline-none w-44"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#aaa" }}>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
              <option value="title">Title A–Z</option>
            </select>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background:"rgba(201,168,53,0.1)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" x2="20" y1="6" y2="6"/><line x1="8" x2="20" y1="12" y2="12"/><line x1="12" x2="20" y1="18" y2="18"/>
              </svg>
              Filter
            </button>
          </div>
        </div>

        {/* Active filters */}
        {(genre || search.trim()) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs" style={{ color:"#666" }}>Active:</span>
            {genre && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                {selectedGenreName}
                <button onClick={() => setGenre("")} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            {search.trim() && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                &quot;{search}&quot;
                <button onClick={() => { setSearchInput(""); setSearch(""); }} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            <button onClick={() => { setGenre(""); setSearchInput(""); setSearch(""); }}
              className="text-xs transition-colors" style={{ color:"#666" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e50914")}
              onMouseLeave={e => (e.currentTarget.style.color = "#666")}>
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex px-4 sm:px-6 lg:px-12 py-8 gap-8">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block shrink-0`} style={{ width:"180px" }}>
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#c9a835" }}>Genre</h3>
            <div className="flex flex-col gap-1">
              <button onClick={() => setGenre("")}
                className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                style={{ background:!genre?"rgba(201,168,53,0.12)":"transparent", color:!genre?"#c9a835":"#888", borderLeft:!genre?"2px solid #c9a835":"2px solid transparent" }}>
                All Genres
              </button>
              {genreList.map(g => (
                <button key={g.id} onClick={() => setGenre(g.slug)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{ background:genre===g.slug?"rgba(201,168,53,0.12)":"transparent", color:genre===g.slug?"#c9a835":"#888", borderLeft:genre===g.slug?"2px solid #c9a835":"2px solid transparent" }}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Series grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid gap-4 grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8">
              {Array.from({ length: 24 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : series.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="text-5xl">📺</div>
              <p className="text-lg font-semibold" style={{ color:"#555" }}>No series found</p>
              <button onClick={() => { setGenre(""); setSearchInput(""); setSearch(""); }}
                className="px-6 py-2 rounded-lg text-sm font-semibold"
                style={{ background:"linear-gradient(135deg,#c9a835,#8a6e1a)", color:"#0d0d12" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8">
                {series.map(s => {
                  const qColor = qualityBg[s.quality] ?? "#15803d";
                  const href = s.type === "series" ? `/tv-shows/${s.slug}` : `/movie/${s.slug}`;
                  return (
                    <a key={s.id} href={href} className="group cursor-pointer">
                      <div
                        className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.04]"
                        style={{ aspectRatio:"2/3", background:"linear-gradient(135deg,#1e1b4b,#0d0d12)", border:"1px solid rgba(255,255,255,0.06)", boxShadow:"0 4px 14px rgba(0,0,0,0.5)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 8px 28px rgba(201,168,53,0.28), 0 0 0 1.5px rgba(201,168,53,0.4)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 14px rgba(0,0,0,0.5)"; }}
                      >
                        {s.image && (
                          <img src={s.image} alt={s.title}
                            className="absolute inset-0 w-full h-full object-cover" loading="lazy"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.78) 0%,transparent 55%)" }} />
                        {s.badge && (
                          <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded tracking-widest"
                            style={{ background: badgeBg[s.badge] ?? "#c9a835", color:"white" }}>
                            {s.badge}
                          </span>
                        )}
                        <span className="absolute bottom-2 left-2 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider"
                          style={{ background: qColor, color:"white" }}>
                          {s.quality}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ background:"rgba(0,0,0,0.55)" }}>
                          <div className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background:"rgba(201,168,53,0.9)", boxShadow:"0 0 24px rgba(201,168,53,0.5)" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d0d12"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 px-0.5">
                        <p className="text-sm font-semibold line-clamp-2 leading-tight transition-colors group-hover:text-amber-400" style={{ color:"#e5e5e5" }}>
                          {s.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs" style={{ color:"#666" }}>{s.year || ""}</span>
                          {s.rating > 0 && (
                            <>
                              <span className="text-xs" style={{ color:"#444" }}>•</span>
                              <div className="flex items-center gap-0.5">
                                <svg width="10" height="10" fill="#c9a835" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                <span className="text-xs font-semibold" style={{ color:"#c9a835" }}>{s.rating.toFixed(1)}</span>
                              </div>
                            </>
                          )}
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
