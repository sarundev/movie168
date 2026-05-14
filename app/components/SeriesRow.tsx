"use client";

import { useRef, useEffect } from "react";
import type { Series } from "../data/movies";

interface SeriesRowProps {
  title: string;
  series: Series[];
  viewAllHref?: string;
}

const qualityBg: Record<string, string> = { "4K": "#1d4ed8", FHD: "#b45309", HD: "#15803d" };
const badgeBg:   Record<string, string> = { NEW: "#c9a835", HOT: "#e50914", TOP: "#7c3aed" };

export default function SeriesRow({ title, series, viewAllHref = "/series" }: SeriesRowProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef  = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    const STEP = 320;
    const DELAY = 3000;
    intervalRef.current = setInterval(() => {
      if (paused.current || !desktopRef.current) return;
      const el = desktopRef.current;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollBy({ left: atEnd ? -el.scrollWidth : STEP, behavior: "smooth" });
    }, DELAY);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

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
      <div
        ref={mobileRef}
        className="sm:hidden flex gap-3 overflow-x-auto hide-scrollbar pb-3"
      >
        {series.map(s => {
          const qColor = qualityBg[s.quality] ?? "#15803d";
          return (
            <a
              key={s.id}
              href={`/series/${s.id}`}
              className="group shrink-0 cursor-pointer"
              style={{ width: "120px" }}
            >
              {/* Poster */}
              <div
                className="relative rounded-lg overflow-hidden"
                style={{
                  width: "120px",
                  height: "172px",
                  background: s.gradient,
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.6)",
                }}
              >
                {s.image && (
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="lazy"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                {/* Vignette */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 50%)" }}
                />

                {/* Status chip — top left */}
                <span
                  className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-tight"
                  style={{
                    background: s.status === "Ongoing" ? "rgba(34,197,94,0.22)" : "rgba(99,102,241,0.22)",
                    color: s.status === "Ongoing" ? "#4ade80" : "#a5b4fc",
                    border: `1px solid ${s.status === "Ongoing" ? "rgba(74,222,128,0.35)" : "rgba(165,180,252,0.35)"}`,
                  }}
                >
                  {s.status === "Ongoing" ? "ON AIR" : "DONE"}
                </span>

                {/* Badge — top right */}
                {s.badge && (
                  <span
                    className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest"
                    style={{ background: badgeBg[s.badge] ?? "#c9a835", color: "white" }}
                  >
                    {s.badge}
                  </span>
                )}

                {/* Quality — bottom left */}
                <span
                  className="absolute bottom-1.5 left-1.5 text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide"
                  style={{ background: qColor, color: "white" }}
                >
                  {s.quality}
                </span>

                {/* Rating — bottom right */}
                <span
                  className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5"
                >
                  <svg width="8" height="8" fill="#c9a835" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[9px] font-bold" style={{ color: "#c9a835" }}>{s.rating}</span>
                </span>

                {/* Tap overlay */}
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

              {/* Info below */}
              <div className="mt-1.5 px-0.5">
                <p
                  className="text-[11px] font-semibold line-clamp-2 leading-tight transition-colors group-hover:text-amber-400"
                  style={{ color: "#e5e5e5" }}
                >
                  {s.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "#666" }}>
                  S{s.seasons} · {s.episodes} eps
                </p>
              </div>
            </a>
          );
        })}

        {/* View All card */}
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
      <div
        ref={desktopRef}
        className="hidden sm:flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
      >
        {series.map(s => {
          const qColor = qualityBg[s.quality] ?? "#15803d";
          return (
            <a
              key={s.id}
              href={`/series/${s.id}`}
              className="group shrink-0 cursor-pointer"
              style={{ width: "230px" }}
            >
              {/* Poster */}
              <div
                className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.04] group-hover:z-10"
                style={{
                  width: "230px",
                  height: "330px",
                  background: s.gradient,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.55)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 8px 32px rgba(201,168,53,0.3), 0 0 0 1.5px rgba(201,168,53,0.4)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.55)";
                }}
              >
                {s.image && (
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.2) 45%,transparent 100%)" }}
                />

                {/* Status chip */}
                <span
                  className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: s.status === "Ongoing" ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.2)",
                    color: s.status === "Ongoing" ? "#4ade80" : "#a5b4fc",
                    border: `1px solid ${s.status === "Ongoing" ? "rgba(74,222,128,0.3)" : "rgba(165,180,252,0.3)"}`,
                  }}
                >
                  {s.status}
                </span>

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
                  {s.quality === "4K" ? "4K ULTRA HD" : s.quality === "FHD" ? "FHD 1080P" : "HD 720P"}
                </span>

                {/* Hover overlay */}
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

                  <div className="flex items-center gap-1.5">
                    <svg width="13" height="13" fill="#c9a835" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white text-sm font-bold">{s.rating}</span>
                    <span className="text-zinc-400 text-xs">S{s.seasons} · {s.episodes} eps</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-center px-3">
                    {s.genres.slice(0, 2).map(g => (
                      <span
                        key={g}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", color: "#ddd" }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ color: "#c9a835", border: "1px solid rgba(201,168,53,0.45)", background: "rgba(201,168,53,0.1)" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    My List
                  </button>
                </div>
              </div>

              {/* Title & meta */}
              <div className="mt-2.5 px-0.5">
                <p
                  className="text-sm font-semibold leading-snug line-clamp-1 transition-colors group-hover:text-amber-400"
                  style={{ color: "#e5e5e5" }}
                >
                  {s.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#777" }}>
                  {s.year} · S{s.seasons} · {s.episodes} eps
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
