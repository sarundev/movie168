"use client";

import { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { seriesList } from "../data/movies";

const GENRES   = ["All","Crime","Drama","Fantasy","Sci-Fi","Horror","Comedy","Action","History","Mystery","Thriller"];
const STATUSES = ["All","Ongoing","Completed"];
const SORTS    = [
  { label: "Highest Rated",  key: "rating"  },
  { label: "Newest First",   key: "newest"  },
  { label: "Most Episodes",  key: "episodes" },
  { label: "Title A–Z",      key: "alpha"   },
];

const qualityBg: Record<string, string> = { "4K":"#1d4ed8", FHD:"#b45309", HD:"#15803d" };
const badgeBg:   Record<string, string> = { NEW:"#c9a835", HOT:"#e50914", TOP:"#7c3aed" };

export default function SeriesPage() {
  const [genre,  setGenre]  = useState("All");
  const [status, setStatus] = useState("All");
  const [sort,   setSort]   = useState("rating");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = [...seriesList];
    if (search.trim())    list = list.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));
    if (genre !== "All")  list = list.filter(s => s.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
    if (status !== "All") list = list.filter(s => s.status === status);
    if (sort === "rating")   list.sort((a, b) => b.rating - a.rating);
    else if (sort === "newest")   list.sort((a, b) => b.year - a.year);
    else if (sort === "episodes") list.sort((a, b) => b.episodes - a.episodes);
    else if (sort === "alpha")    list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [genre, status, sort, search]);

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      {/* Page header */}
      <div className="px-4 sm:px-6 lg:px-12 pt-20 pb-6" style={{ borderBottom:"1px solid rgba(201,168,53,0.1)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1" style={{ color:"#666" }}>
              <a href="/" style={{ color:"#888" }} className="hover:text-amber-400 transition-colors">Home</a>
              <span>/</span>
              <span style={{ color:"#c9a835" }}>TV Series</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color:"#f0f0f0" }}>TV Series</h1>
            <p className="text-sm mt-1" style={{ color:"#666" }}>{filtered.length} series available</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search series..." className="pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-zinc-600 outline-none w-44"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#aaa" }}>
              {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex px-4 sm:px-6 lg:px-12 py-8 gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block shrink-0" style={{ width:"200px" }}>
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#c9a835" }}>Genre</h3>
            <div className="flex flex-col gap-1">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)} className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{ background: genre===g?"rgba(201,168,53,0.12)":"transparent", color:genre===g?"#c9a835":"#888", borderLeft:genre===g?"2px solid #c9a835":"2px solid transparent" }}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#c9a835" }}>Status</h3>
            <div className="flex flex-col gap-1">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatus(s)} className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{ background:status===s?"rgba(201,168,53,0.12)":"transparent", color:status===s?"#c9a835":"#888", borderLeft:status===s?"2px solid #c9a835":"2px solid transparent" }}>
                  {s === "All" ? "All Status" : s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Series grid */}
        <div className="flex-1 min-w-0">
          <div className="grid gap-5" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))" }}>
            {filtered.map(series => {
              const qColor = qualityBg[series.quality] ?? "#15803d";
              return (
                <div key={series.id} className="group cursor-pointer">
                  {/* Poster */}
                  <div
                    className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.04]"
                    style={{ aspectRatio:"2/3", background:series.gradient, border:"1px solid rgba(255,255,255,0.06)", boxShadow:"0 4px 14px rgba(0,0,0,0.5)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 8px 28px rgba(201,168,53,0.28), 0 0 0 1.5px rgba(201,168,53,0.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 14px rgba(0,0,0,0.5)"; }}
                  >
                    {series.image && (
                      <img src={series.image} alt={series.title}
                        className="absolute inset-0 w-full h-full object-cover" loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.78) 0%,transparent 55%)" }} />
                    {/* Status chip */}
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: series.status==="Ongoing"?"rgba(34,197,94,0.2)":"rgba(99,102,241,0.2)", color:series.status==="Ongoing"?"#4ade80":"#a5b4fc", border:`1px solid ${series.status==="Ongoing"?"rgba(74,222,128,0.3)":"rgba(165,180,252,0.3)"}` }}>
                      {series.status}
                    </span>
                    {series.badge && (
                      <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded tracking-widest"
                        style={{ background: badgeBg[series.badge] ?? "#c9a835", color:"white" }}>
                        {series.badge}
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider"
                      style={{ background: qColor, color:"white" }}>
                      {series.quality}
                    </span>
                    {/* Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background:"rgba(0,0,0,0.55)" }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background:"rgba(201,168,53,0.9)", boxShadow:"0 0 24px rgba(201,168,53,0.5)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d0d12"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="mt-2 px-0.5">
                    <p className="text-sm font-semibold line-clamp-1 transition-colors group-hover:text-amber-400" style={{ color:"#e5e5e5" }}>
                      {series.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-xs" style={{ color:"#666" }}>{series.year}</span>
                      <span className="text-xs" style={{ color:"#444" }}>•</span>
                      <span className="text-xs" style={{ color:"#666" }}>S{series.seasons} · {series.episodes} eps</span>
                      <span className="text-xs" style={{ color:"#444" }}>•</span>
                      <div className="flex items-center gap-0.5">
                        <svg width="10" height="10" fill="#c9a835" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <span className="text-xs font-semibold" style={{ color:"#c9a835" }}>{series.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
