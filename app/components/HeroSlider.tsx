"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSliderMovies, getMovieRating, type ApiMovie } from "../lib/api";

const AUTO_PLAY_MS = 5000;

function toSlide(m: ApiMovie) {
  const { average } = getMovieRating(m);
  return {
    id:          m.id,
    slug:        m.slug,
    title:       m.title,
    original_title: m.original_title ?? "",
    year:        m.release_year ?? (m.release_date ? new Date(m.release_date).getFullYear() : 0),
    genres:      (m.genres ?? []).map(g => (typeof g === "string" ? g : g.name)),
    quality:     (m.quality ?? "HD") as "4K" | "FHD" | "HD",
    image:       m.backdrop_url ?? m.poster_url ?? m.thumbnail_url,
    rating:      average,
    access_type: m.access_type ?? "free",
  };
}

type Slide = ReturnType<typeof toSlide>;

const qualityColor: Record<string, string> = {
  "4K": "#1d4ed8",
  FHD:  "#b45309",
  HD:   "#15803d",
};

const cardGradients = [
  "linear-gradient(135deg,#1e1b4b 0%,#0d0d12 100%)",
  "linear-gradient(135deg,#3b0764 0%,#0d0d12 100%)",
  "linear-gradient(135deg,#14201f 0%,#0d0d12 100%)",
  "linear-gradient(135deg,#1c1a14 0%,#0d0d12 100%)",
  "linear-gradient(135deg,#1a0d0d 0%,#0d0d12 100%)",
  "linear-gradient(135deg,#0d1a1a 0%,#0d0d12 100%)",
];

function SlideCard({ slide }: { slide: Slide }) {
  return (
    <a
      href={`/movie/${slide.slug}`}
      className="group block rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
      style={{
        background: cardGradients[slide.id % cardGradients.length],
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "19/8" }}>
        {slide.image && (
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-8"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))" }} />

        <div className="absolute top-2.5 right-2.5">
          <span style={{
            background: qualityColor[slide.quality] ?? "#15803d",
            color: "white", fontSize: "9px", fontWeight: 800,
            padding: "2px 7px", borderRadius: "4px", letterSpacing: "0.06em",
          }}>
            {slide.quality}
          </span>
        </div>

        {slide.rating > 0 && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
              borderRadius: "6px", padding: "2px 7px" }}>
            <svg width="10" height="10" viewBox="0 0 20 20" fill="#c9a835">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span style={{ color: "#c9a835", fontSize: "10px", fontWeight: 700 }}>
              {slide.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="font-black leading-tight truncate"
            style={{ color: "#f0f0f0", fontSize: "clamp(12px,2vw,15px)" }}>
            {slide.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {slide.year > 0 && (
              <span style={{ color: "#888", fontSize: "11px" }}>{slide.year}</span>
            )}
            {slide.genres.length > 0 && (
              <span style={{ color: "#666", fontSize: "11px" }}>
                · {slide.genres.slice(0, 2).join(" / ")}
              </span>
            )}
            {slide.access_type === "free" && (
              <span style={{
                background: "rgba(34,197,94,0.15)", color: "#4ade80",
                fontSize: "9px", fontWeight: 700, padding: "1px 6px",
                borderRadius: "4px", border: "1px solid rgba(34,197,94,0.25)",
              }}>
                FREE
              </span>
            )}
          </div>
        </div>

        <span
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg group-hover:brightness-110"
          style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)",
            color: "#0d0d12", whiteSpace: "nowrap",
            boxShadow: "0 2px 10px rgba(201,168,53,0.35)" }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          មើលឥឡូវ
        </span>
      </div>
    </a>
  );
}

export default function HeroSlider() {
  const [slides,  setSlides]  = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchSliderMovies()
      .then(data => { if (data.length) setSlides(data.map(toSlide)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Detect mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const total = slides.length;

  // Auto-play: advance by 1 on mobile, by 3 on desktop
  const next = useCallback(() => {
    setCurrent(c => {
      const step = isMobile ? 1 : 3;
      return (c + step) % (total || 1);
    });
  }, [isMobile, total]);

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(t);
  }, [next, total]);

  if (loading) {
    return (
      <section className="px-4 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <div style={{ aspectRatio: "19/8" }} />
              <div className="p-3 space-y-2">
                <div className="h-4 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", width: "60%" }} />
                <div className="h-3 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!total) return null;

  // Desktop: show 3 slides starting at current (wrapping)
  // Mobile: show 1 slide (current)
  const desktopSlides = [0, 1, 2].map(i => slides[(current + i) % total]);
  const mobileSlide   = slides[current % total];

  return (
    <section className="px-4 py-5">
      {/* Desktop grid — 3 columns */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {desktopSlides.map((slide, i) => (
          <SlideCard key={`${slide.id}-${i}`} slide={slide} />
        ))}
      </div>

      {/* Mobile — 1 card at a time */}
      <div className="sm:hidden">
        <SlideCard key={mobileSlide.id} slide={mobileSlide} />
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-4">
          {slides.map((_, i) => {
            // active dot: on desktop, highlight the group of 3
            const isActive = isMobile
              ? i === current % total
              : i === current % total || i === (current + 1) % total || i === (current + 2) % total;
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  height: "6px",
                  width: isActive ? "20px" : "6px",
                  borderRadius: "9999px",
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "#c9a835" : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
