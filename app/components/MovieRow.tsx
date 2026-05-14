"use client";

import { useRef, useEffect } from "react";
import MovieCard from "./MovieCard";
import type { Movie } from "../data/movies";

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir === "left" ? -1040 : 1040, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const STEP = 320;
    const DELAY = 3000;

    intervalRef.current = setInterval(() => {
      if (paused.current || !rowRef.current) return;
      const el = rowRef.current;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: STEP, behavior: "smooth" });
      }
    }, DELAY);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Gold left border bar */}
          <div
            className="w-1.5 h-7 rounded-full shrink-0"
            style={{ background: "linear-gradient(to bottom, #c9a835, #8a6e1a)" }}
          />
          <h2
            className="text-lg sm:text-xl font-bold tracking-tight"
            style={{ color: "#f0f0f0" }}
          >
            {title}
          </h2>
        </div>
        {/* view all */}
        {/* <div className="flex items-center gap-2.5">
          <a
            href="#"
            className="text-xs font-medium mr-1 transition-colors"
            style={{ color: "#777" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a835")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
          >
            View All
          </a>
   
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-70"
            style={{
              background: "rgba(201,168,53,0.1)",
              border: "1px solid rgba(201,168,53,0.3)",
              color: "#c9a835",
            }}
            aria-label="Scroll left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-70"
            style={{
              background: "rgba(201,168,53,0.1)",
              border: "1px solid rgba(201,168,53,0.3)",
              color: "#c9a835",
            }}
            aria-label="Scroll right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div> */}
      </div>

      {/* Scrollable cards */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
