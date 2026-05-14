"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { featuredMovies } from "../data/movies";

const GAP = 16;
const PEEK_RATIO = 0.07;
const MOBILE_BREAKPOINT = 640;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const total = featuredMovies.length;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  const isMobile = containerWidth > 0 && containerWidth < MOBILE_BREAKPOINT;
  const visibleCards = isMobile ? 1 : 3;
  const peek = containerWidth ? Math.min(isMobile ? 28 : 90, containerWidth * PEEK_RATIO) : 70;
  const cardWidth = containerWidth
    ? Math.floor((containerWidth - peek * 2 - GAP * (visibleCards - 1)) / visibleCards)
    : 300;
  const cardHeight = Math.round(cardWidth * (isMobile ? 0.56 : 0.62));

  const goTo = useCallback((idx: number) => setCurrent((idx + total) % total), [total]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  // Extended array with 1 clone before and 2 clones after for seamless peek
  const ext = [featuredMovies[total - 1], ...featuredMovies, featuredMovies[0], featuredMovies[1]];
  const extCurrent = current + 1; // +1 because of the clone before

  const trackOffset = containerWidth > 0
    ? peek - extCurrent * (cardWidth + GAP)
    : 0;

  return (
    <section
      className="grid grid-cols-12 sm:block"
      style={{
        width: "100%",
        background: "#0e0e14",
        paddingBottom: "28px",
      }}
    >
      {/* Cards track */}
      <div
        ref={containerRef}
        className="col-span-12"
        style={{
          overflow: "hidden",
          paddingTop: "20px",
          paddingBottom: "6px",
          visibility: containerWidth > 0 ? "visible" : "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: `${GAP}px`,
            transform: `translateX(${trackOffset}px)`,
            transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            willChange: "transform",
          }}
        >
          {ext.map((movie, i) => {
            const realIdx = (i - 1 + total) % total;
            return (
              <div
                key={`${movie.id}-${i}`}
                onClick={() => goTo(realIdx)}
                style={{
                  flexShrink: 0,
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  borderRadius: "10px",
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {/* Gradient background fallback */}
                <div
                  style={{ position: "absolute", inset: 0, background: movie.gradient }}
                />

                {/* Poster image */}
                {movie.image && (
                  <img
                    src={movie.image}
                    alt={movie.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}

                {/* Dark overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.1) 75%, transparent 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 40%)",
                  }}
                />

                {/* Top-left: Movie title */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "12px",
                    right: "52px",
                  }}
                >
                  <h3
                    style={{
                      color: "white",
                      fontWeight: "900",
                      fontSize: `${Math.max(13, Math.min(22, cardWidth * 0.052))}px`,
                      lineHeight: 1.15,
                      textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {movie.title}
                  </h3>
                </div>

                {/* Top-right: Quality badge */}
                <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                  <span
                    style={{
                      background:
                        movie.quality === "4K"
                          ? "#1d4ed8"
                          : movie.quality === "FHD"
                          ? "#b45309"
                          : "#15803d",
                      color: "white",
                      fontSize: "9px",
                      fontWeight: "800",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {movie.quality}
                  </span>
                </div>

                {/* Bottom bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    gap: "8px",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        color: "#e5e5e5",
                        fontWeight: "600",
                        fontSize: `${Math.max(10, Math.min(13, cardWidth * 0.032))}px`,
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {movie.genres.slice(0, 2).join(" / ")} – {movie.title}
                    </p>
                    <p
                      style={{
                        color: "#888",
                        fontSize: "11px",
                        marginTop: "2px",
                      }}
                    >
                      {movie.year}
                    </p>
                  </div>

                  <a
                    href={`/movie/${movie.id}`}
                    style={{
                      flexShrink: 0,
                      background: "#f97316",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "5px 11px",
                      borderRadius: "5px",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    រឿងចុំ
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation dots */}
      <div
        className="col-span-12"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        {featuredMovies.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              height: "8px",
              width: i === current ? "28px" : "8px",
              borderRadius: "9999px",
              background:
                i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}
