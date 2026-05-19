"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getMovieRating, type ApiMovie } from "../lib/api";

export type { ApiMovie };

const AUTO_PLAY_MS = 5000;

function toSlide(m: ApiMovie) {
  const { average } = getMovieRating(m);
  return {
    id:          m.id,
    slug:        m.slug,
    title:       m.title,
    year:        m.release_year ?? (m.release_date ? new Date(m.release_date).getFullYear() : 0),
    genres:      (m.genres ?? []).map(g => (typeof g === "string" ? g : g.name)),
    quality:     (m.quality ?? "HD") as "4K" | "FHD" | "HD",
    image:       m.backdrop_url ?? m.poster_url ?? m.thumbnail_url ?? "",
    description: m.overview ?? "",
    rating:      average,
    access_type: m.access_type ?? "free",
  };
}

type Slide = ReturnType<typeof toSlide>;

export default function HeroSlider({ initialMovies = [] }: { initialMovies?: ApiMovie[] }) {
  const [slides]  = useState<Slide[]>(() => initialMovies.map(toSlide));
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = slides.length;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total < 2) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total);
    }, AUTO_PLAY_MS);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    resetTimer();
  }, [resetTimer]);


  if (!total) return null;

  const slide = slides[current];
  const nextIdx = (current + 1) % total;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(300px, 42vw, 600px)", background: "#0d0d12" }}
    >
      {/* All slide containers stay in DOM so opacity transitions work smoothly.
          Images only mount for current + next — avoids loading all upfront. */}
      {slides.map((s, i) => {
        const isCurrent  = i === current;
        const loadImage  = isCurrent || (total > 1 && i === nextIdx);
        return (
          <div
            key={s.id}
            aria-hidden={!isCurrent}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: isCurrent ? 1 : 0 }}
          >
            {loadImage && s.image && (
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-top"
                quality={85}
              />
            )}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: [
                  "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 65%, transparent 100%)",
                  "linear-gradient(to top,   rgba(0,0,0,0.55) 0%, transparent 35%)",
                ].join(", "),
              }}
            />
          </div>
        );
      })}

      {/* Text content */}
      <div
        className="absolute inset-0 flex flex-col justify-end"
        style={{ padding: "0 clamp(18px, 5vw, 56px) clamp(36px, 5vw, 52px)", zIndex: 2 }}
      >
        <div style={{ maxWidth: "min(520px, 55%)" }}>
          <h1
            className="font-black text-white leading-tight"
            style={{
              fontSize: "clamp(20px, 3.2vw, 40px)",
              textShadow: "0 2px 14px rgba(0,0,0,0.85)",
              marginBottom: "0.4em",
            }}
          >
            {slide.title}
          </h1>

          {slide.description && (
            <p
              className="text-white/80 leading-snug"
              style={{
                fontSize: "clamp(11px, 1.2vw, 14px)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                marginBottom: "1.2em",
                textShadow: "0 1px 8px rgba(0,0,0,0.8)",
              }}
            >
              {slide.description}
            </p>
          )}

          <Link
            href={`/movie/${slide.slug}`}
            className="inline-flex items-center gap-2 font-bold text-white rounded-full transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              padding: "0.5em 1.4em",
              fontSize: "clamp(11px, 1.2vw, 14px)",
              boxShadow: "0 4px 18px rgba(249,115,22,0.45)",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            មើលឥឡូវ
          </Link>
        </div>
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5"
          style={{ bottom: "clamp(8px, 2vw, 16px)", zIndex: 3 }}
        >
          {slides.map((_, i) => {
            const active = i === current;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  height: 6,
                  width: active ? 22 : 6,
                  borderRadius: 9999,
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                  background: active ? "#f97316" : "rgba(255,255,255,0.35)",
                  transition: "width 0.35s ease, background 0.35s ease",
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
