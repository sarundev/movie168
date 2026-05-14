"use client";

import { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { allMovies } from "../data/movies";

const GENRES   = ["All","Action","Drama","Sci-Fi","Horror","Comedy","Romance","Thriller","Animation","Fantasy","Crime","History"];
const QUALITIES: Array<"All"|"4K"|"FHD"|"HD"> = ["All","4K","FHD","HD"];
const SORTS     = [
  { label: "Newest First",    key: "newest"  },
  { label: "Highest Rated",   key: "rating"  },
  { label: "Title A–Z",       key: "alpha"   },
  { label: "Oldest First",    key: "oldest"  },
];

const qualityBg: Record<string, string> = { "4K":"#1d4ed8", FHD:"#b45309", HD:"#15803d" };
const badgeBg:   Record<string, string> = { NEW:"#c9a835", HOT:"#e50914", TOP:"#7c3aed", AWARD:"#065f46" };

export default function MoviesPage() {
  const [genre,   setGenre]   = useState("All");
  const [quality, setQuality] = useState<"All"|"4K"|"FHD"|"HD">("All");
  const [sort,    setSort]    = useState("newest");
  const [search,  setSearch]  = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...allMovies];
    if (search.trim())  list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    if (genre !== "All")   list = list.filter(m => m.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
    if (quality !== "All") list = list.filter(m => m.quality === quality);
    if (sort === "newest") list.sort((a, b) => b.year - a.year);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "alpha")  list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "oldest") list.sort((a, b) => a.year - b.year);
    return list;
  }, [genre, quality, sort, search]);

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      {/* Page header */}
      <div
        className="px-4 sm:px-6 lg:px-12 pt-20 pb-6"
        style={{ borderBottom: "1px solid rgba(201,168,53,0.1)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "#666" }}>
              <a href="/" style={{ color: "#888" }} className="hover:text-amber-400 transition-colors">Home</a>
              <span>/</span>
              <span style={{ color: "#c9a835" }}>Movies</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "#f0f0f0" }}>
              All Movies
            </h1>
            <p className="text-sm mt-1" style={{ color: "#666" }}>
              {filtered.length} titles available
            </p>
          </div>

          {/* Search + sort */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search movies..."
                className="pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-zinc-600 outline-none w-48"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#aaa" }}
            >
              {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background:"rgba(201,168,53,0.1)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="6" y2="6"/><line x1="8" x2="20" y1="12" y2="12"/><line x1="12" x2="20" y1="18" y2="18"/>
              </svg>
              Filter
            </button>
          </div>
        </div>

        {/* Active filters */}
        {(genre !== "All" || quality !== "All") && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs" style={{ color:"#666" }}>Active:</span>
            {genre !== "All" && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                {genre}
                <button onClick={() => setGenre("All")} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            {quality !== "All" && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background:"rgba(201,168,53,0.12)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                {quality}
                <button onClick={() => setQuality("All")} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
            <button onClick={() => { setGenre("All"); setQuality("All"); }} className="text-xs transition-colors" style={{ color:"#666" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e50914")}
              onMouseLeave={e => (e.currentTarget.style.color = "#666")}>
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex px-4 sm:px-6 lg:px-12 py-8 gap-8">

        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} lg:block shrink-0`}
          style={{ width: "200px" }}
        >
          {/* Genre filter */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#c9a835" }}>Genre</h3>
            <div className="flex flex-col gap-1">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: genre === g ? "rgba(201,168,53,0.12)" : "transparent",
                    color: genre === g ? "#c9a835" : "#888",
                    borderLeft: genre === g ? "2px solid #c9a835" : "2px solid transparent",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Quality filter */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#c9a835" }}>Quality</h3>
            <div className="flex flex-col gap-1">
              {QUALITIES.map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: quality === q ? "rgba(201,168,53,0.12)" : "transparent",
                    color: quality === q ? "#c9a835" : "#888",
                    borderLeft: quality === q ? "2px solid #c9a835" : "2px solid transparent",
                  }}
                >
                  {q === "All" ? "All Quality" : q}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Movie grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="text-5xl">🎬</div>
              <p className="text-lg font-semibold" style={{ color:"#555" }}>No movies found</p>
              <button onClick={() => { setGenre("All"); setQuality("All"); setSearch(""); }}
                className="px-6 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background:"linear-gradient(135deg,#c9a835,#8a6e1a)", color:"#0d0d12" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))" }}>
              {filtered.map(movie => {
                const qColor = qualityBg[movie.quality] ?? "#15803d";
                return (
                  <a
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    className="group cursor-pointer"
                  >
                    {/* Poster */}
                    <div
                      className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.04]"
                      style={{
                        width: "100%",
                        aspectRatio: "2/3",
                        background: movie.gradient,
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(201,168,53,0.28), 0 0 0 1.5px rgba(201,168,53,0.4)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.5)"; }}
                    >
                      {movie.image && (
                        <img src={movie.image} alt={movie.title}
                          className="absolute inset-0 w-full h-full object-cover" loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      )}
                      <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.15) 50%,transparent 100%)" }} />
                      {movie.badge && (
                        <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded tracking-widest"
                          style={{ background: badgeBg[movie.badge] ?? "#c9a835", color:"white" }}>
                          {movie.badge}
                        </span>
                      )}
                      <span className="absolute bottom-2 left-2 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider"
                        style={{ background: qColor, color:"white" }}>
                        {movie.quality === "4K" ? "4K" : movie.quality}
                      </span>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background:"rgba(0,0,0,0.55)" }}>
                        <div className="w-13 h-13 rounded-full flex items-center justify-center"
                          style={{ background:"rgba(201,168,53,0.9)", boxShadow:"0 0 24px rgba(201,168,53,0.5)" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d0d12">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    {/* Info below */}
                    <div className="mt-2 px-0.5">
                      <p className="text-sm font-semibold line-clamp-1 transition-colors group-hover:text-amber-400" style={{ color:"#e5e5e5" }}>
                        {movie.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs" style={{ color:"#666" }}>{movie.year}</span>
                        <span className="text-xs" style={{ color:"#444" }}>•</span>
                        <svg width="10" height="10" fill="#c9a835" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span className="text-xs font-semibold" style={{ color:"#c9a835" }}>{movie.rating}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
