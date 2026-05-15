"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import MovieRow from "./components/MovieRow";
import Footer from "./components/Footer";
import { trendingMovies, newReleases, actionMovies, topRated, horrorMovies, type Movie } from "./data/movies";
import { fetchTrendingMovies, fetchMovies, getMovieRating, type ApiMovie } from "./lib/api";

const genres = ["All", "Action", "Drama", "Sci-Fi", "Horror", "Comedy", "Romance", "Thriller", "Animation", "Fantasy"];

function apiToMovie(m: ApiMovie): Movie {
  const { average: ratingVal } = getMovieRating(m);

  return {
    id: m.id,
    slug: m.slug,
    title: m.title,
    year: m.release_year ?? (m.release_date ? new Date(m.release_date).getFullYear() : 0),
    releaseDate: m.release_date,
    rating: ratingVal,
    duration: m.runtime_minutes
      ? `${Math.floor(m.runtime_minutes / 60)}h ${m.runtime_minutes % 60}m`
      : "",
    genres: (m.genres ?? []).map(g => (typeof g === "string" ? g : g.name)),
    gradient: m.gradient ?? "linear-gradient(135deg,#1e1b4b,#0d0d12)",
    quality: (m.quality as Movie["quality"]) ?? "HD",
    badge: m.badge,
    description: m.overview,
    cast: (m.casts ?? []).map(c => c.name),
    image: m.poster_url ?? m.thumbnail_url ?? m.backdrop_url,
  };
}

function RowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shrink-0 rounded-xl animate-pulse"
          style={{ width: 160, height: 240, background: "rgba(255,255,255,0.06)" }} />
      ))}
    </div>
  );
}

export default function Home() {
  const [newRels, setNewRels] = useState<Movie[]>(newReleases);
  const [trending, setTrending] = useState<Movie[]>(trendingMovies);
  const [action, setAction] = useState<Movie[]>(actionMovies);
  const [horror, setHorror] = useState<Movie[]>(horrorMovies);
  const [top, setTop] = useState<Movie[]>(topRated);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [trendData, newestData, actionData, horrorData, topData] = await Promise.allSettled([
          fetchTrendingMovies(),
          fetchMovies({ sort: "newest", per_page: "20" }),
          fetchMovies({ genre: "action", per_page: "20" }),
          fetchMovies({ genre: "horror", per_page: "20" }),
          fetchMovies({ sort: "rating", per_page: "20" }),
        ]);

        if (cancelled) return;

        if (trendData.status === "fulfilled" && trendData.value.length)
          setTrending(trendData.value.map(apiToMovie));
        if (newestData.status === "fulfilled" && newestData.value.length)
          setNewRels(newestData.value.map(apiToMovie));
        if (actionData.status === "fulfilled" && actionData.value.length)
          setAction(actionData.value.map(apiToMovie));
        if (horrorData.status === "fulfilled" && horrorData.value.length)
          setHorror(horrorData.value.map(apiToMovie));
        if (topData.status === "fulfilled" && topData.value.length)
          setTop(topData.value.map(apiToMovie));
      } catch {
        /* keep static fallback */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      <div className="pt-24">
        <HeroSlider />
      </div>

      {/* Genre filter bar */}
      <div
        className="sticky top-14 z-40 px-4 sm:px-6 lg:px-12 py-3 flex items-center gap-2.5 overflow-x-auto hide-scrollbar"
        style={{
          background: "rgba(13,13,18,0.95)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(201,168,53,0.1)",
        }}
      >
        {genres.map((g, i) => (
          <a
            key={g}
            href={i === 0 ? "/movies" : `/movies?genre=${g.toLowerCase()}`}
            className="shrink-0 px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all hover:opacity-90"
            style={
              i === 0
                ? { background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12", boxShadow: "0 2px 12px rgba(201,168,53,0.3)" }
                : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#888" }
            }
          >
            {g}
          </a>
        ))}
      </div>

      {/* Content rows */}
      <div className="px-4 sm:px-6 lg:px-12 pt-10 space-y-12">
        {loading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : (
          <>
            <MovieRow title="New Releases" movies={newRels} />
            <MovieRow title="Trending Now" movies={trending} />
            <MovieRow title="Action & Adventure" movies={action} />
            <MovieRow title="Horror & Suspense" movies={horror} />
            <MovieRow title="Top Rated" movies={top} />
          </>
        )}
      </div>

      <div className="gold-divider mx-4 sm:mx-6 lg:mx-12 mt-12 mb-2" />
      <Footer />
    </div>
  );
}
