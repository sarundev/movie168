"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { fetchMovies, getMovieRating, type ApiMovie } from "../lib/api";

const qualityBg: Record<string, string> = { "4K": "#1d4ed8", FHD: "#b45309", HD: "#15803d" };
const badgeBg: Record<string, string> = { NEW: "#c9a835", HOT: "#e50914", TOP: "#7c3aed", AWARD: "#065f46" };

function qualityInfo(q: string): { label: string; sub: string } {
  if (q === "4K") return { label: "4K", sub: "ULTRA HD" };
  if (q === "FHD") return { label: "FHD", sub: "1080P" };
  if (q === "HD") return { label: "HD", sub: "720P" };
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
    id: m.id,
    slug: m.slug,
    title: m.title,
    originalTitle: m.original_title,
    year: m.release_year ?? (m.release_date ? new Date(m.release_date).getFullYear() : 0),
    rating: average,
    quality: m.quality ?? "HD",
    badge: m.badge,
    price: m.price,
    gradient: m.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)",
    image: m.poster_url ?? m.thumbnail_url ?? m.backdrop_url,
  };
}

function MovieCardSkeleton() {
  return (
    <div>
      <div className="rounded-lg sm:rounded-xl animate-pulse" style={{ aspectRatio: "2/3", background: "rgba(255,255,255,0.06)" }} />
      <div className="mt-1.5 space-y-1">
        <div className="h-3 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)", width: "80%" }} />
        <div className="h-2.5 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)", width: "50%" }} />
      </div>
    </div>
  );
}

export default function MoviesGrid({
  initialMovies = [],
  initialGenre = "",
  initialQuality = "",
  initialSort = "newest",
  initialSearch = "",
}: {
  initialMovies?: ApiMovie[];
  initialGenre?: string;
  initialQuality?: string;
  initialSort?: string;
  initialSearch?: string;
}) {
  const searchParams = useSearchParams();

  const genre = searchParams.get("genre") ?? initialGenre;
  const quality = searchParams.get("quality") ?? initialQuality;
  const sort = searchParams.get("sort") ?? initialSort;
  const search = searchParams.get("q") ?? initialSearch;

  const [movies, setMovies] = useState<DisplayMovie[]>(() => initialMovies.map(toDisplay));
  const [loading, setLoading] = useState(initialMovies.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialMovies.length === 24);

  const loaderRef = useRef<HTMLDivElement>(null);
  const hasInitialData = useRef(initialMovies.length > 0);

  const buildParams = useCallback(
    (pg: number) => {
      const p: Record<string, string> = { page: String(pg), per_page: "24" };
      if (sort !== "newest") p.sort = sort;
      if (genre) p.genre = genre;
      if (quality) p.quality = quality;
      if (search.trim()) p.search = search.trim();
      return p;
    },
    [sort, genre, quality, search],
  );

  // Reset and reload when filters change (skip initial fetch — data from server)
  useEffect(() => {
    if (hasInitialData.current) {
      hasInitialData.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);
    setPage(1);
    setHasMore(true);

    fetchMovies(buildParams(1))
      .then((data) => {
        if (cancelled) return;
        setMovies(data.map(toDisplay));
        setHasMore(data.length === 24);
      })
      .catch(() => {
        if (!cancelled) setMovies([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [buildParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await fetchMovies(buildParams(nextPage));
      setMovies((prev) => [...prev, ...data.map(toDisplay)]);
      setPage(nextPage);
      setHasMore(data.length === 24);
    } catch {}
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, buildParams]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Client-side sort supplement for already-loaded data
  const displayed = useMemo(() => {
    const list = [...movies];
    if (sort === "alpha") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "oldest") list.sort((a, b) => a.year - b.year);
    return list;
  }, [movies, sort]);

  return (
    <>
      <p className="text-sm mb-3" style={{ color: "#666" }}>
        {loading ? "Loading…" : `${displayed.length}${hasMore ? "+" : ""} titles`}
      </p>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-5xl">🎬</div>
          <p className="text-lg font-semibold" style={{ color: "#555" }}>
            No movies found
          </p>
          <Link
            href="/movies"
            className="px-6 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12" }}
          >
            Clear Filters
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-4">
            {displayed.map((movie) => {
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
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 8px 30px rgba(201,168,53,0.3), 0 0 0 1.5px rgba(201,168,53,0.45)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.6)";
                    }}
                  >
                    {movie.image && (
                      <Image
                        src={movie.image}
                        alt={movie.title}
                        fill
                        sizes="(max-width:640px) 33vw, (max-width:1024px) 16vw, 12vw"
                        className="object-cover object-top"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}

                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.4) 40%,transparent 65%)",
                      }}
                    />

                    {movie.price && movie.price > 0 ? (
                      <span
                        className="absolute top-2 left-2 font-black rounded-md leading-none"
                        style={{
                          fontSize: "clamp(8px,1.9vw,11px)",
                          padding: "3px 7px",
                          background: "#e50914",
                          color: "white",
                          letterSpacing: "0.02em",
                        }}
                      >
                        ${movie.price}
                      </span>
                    ) : movie.badge ? (
                      <span
                        className="absolute top-2 left-2 font-black rounded-md leading-none"
                        style={{
                          fontSize: "clamp(8px,1.9vw,11px)",
                          padding: "3px 7px",
                          background: badgeBg[movie.badge] ?? "#c9a835",
                          color: "white",
                        }}
                      >
                        {movie.badge}
                      </span>
                    ) : null}

                    <span
                      className="absolute top-2 right-2 font-black rounded-md leading-none"
                      style={{
                        fontSize: "clamp(8px,1.9vw,11px)",
                        padding: "3px 7px",
                        background: qColor,
                        color: "white",
                      }}
                    >
                      {qLabel}
                    </span>

                    <div className="absolute bottom-0 left-0 right-0 px-2 pb-2.5 pt-6">
                      <p
                        className="font-bold line-clamp-1 leading-snug"
                        style={{ color: "#ffffff", fontSize: "clamp(9px,2.6vw,13px)" }}
                      >
                        {movie.title}
                      </p>
                      {movie.originalTitle && movie.originalTitle !== movie.title && (
                        <p
                          className="line-clamp-1 leading-snug mt-0.5"
                          style={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: "clamp(8px,2.2vw,11px)",
                          }}
                        >
                          {movie.originalTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span style={{ color: "#aaa", fontSize: "clamp(8px,2vw,10px)" }}>
                          {movie.year || ""}
                        </span>
                        {movie.rating > 0 && (
                          <span
                            className="flex items-center gap-0.5"
                            style={{ color: "#f5c518", fontSize: "clamp(8px,2vw,10px)" }}
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="#f5c518">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            {movie.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: "rgba(0,0,0,0.35)" }}
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(201,168,53,0.92)",
                          boxShadow: "0 0 24px rgba(201,168,53,0.55)",
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d0d12">
                          <polygon points="5 3 19 12 5 21 5 3" />
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
              <svg
                className="animate-spin"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c9a835"
                strokeWidth="2.5"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
          </div>
        </>
      )}
    </>
  );
}
