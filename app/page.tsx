import { Suspense } from "react";
import Link from "next/link";
import NavbarWrapper from "./components/NavbarWrapper";
import HeroSlider from "./components/HeroSlider";
import MovieRow from "./components/MovieRow";
import Footer from "./components/Footer";
import { fetchTrendingMovies, fetchMovies, fetchSliderMovies, fetchMovieFilters, type ApiMovie } from "./lib/api";

const MAX_GENRE_ROWS = 5;

async function HeroSliderSection() {
  const sliders = await fetchSliderMovies().catch(() => []);
  const firstHeroImage = sliders[0]?.backdrop_url ?? sliders[0]?.poster_url ?? sliders[0]?.thumbnail_url;
  return (
    <>
      {firstHeroImage && (() => {
        const enc = encodeURIComponent(firstHeroImage);
        const srcSet = [640, 828, 1080, 1920].map(w => `/_next/image?url=${enc}&w=${w}&q=85 ${w}w`).join(", ");
        return <link rel="preload" as="image" imageSrcSet={srcSet} imageSizes="100vw" />;
      })()}
      <HeroSlider initialMovies={sliders} />
    </>
  );
}

async function HomeContent() {
  const [trendingResult, newRelsResult, topResult, filtersResult] =
    await Promise.allSettled([
      fetchTrendingMovies(),
      fetchMovies({ sort: "newest", per_page: "20" }),
      fetchMovies({ sort: "rating", per_page: "20" }),
      fetchMovieFilters(),
    ]);

  const trending = trendingResult.status === "fulfilled" ? trendingResult.value : [];
  const newRels  = newRelsResult.status  === "fulfilled" ? newRelsResult.value  : [];
  const top      = topResult.status      === "fulfilled" ? topResult.value      : [];
  const allGenres = filtersResult.status === "fulfilled" ? filtersResult.value.genres : [];
  const selectedGenres = allGenres.slice(0, MAX_GENRE_ROWS);

  const genreResults = await Promise.allSettled(
    selectedGenres.map(g => fetchMovies({ genre: g.slug, per_page: "20" }))
  );

  const genreRows: { name: string; slug: string; movies: ApiMovie[] }[] = selectedGenres
    .map((g, i) => ({
      name:   g.name,
      slug:   g.slug,
      movies: genreResults[i].status === "fulfilled"
        ? (genreResults[i] as PromiseFulfilledResult<ApiMovie[]>).value
        : [],
    }))
    .filter(r => r.movies.length > 0);

  return (
    <>
      {allGenres.length > 0 && (
        <div
          className="sticky top-14 z-40 px-4 sm:px-6 lg:px-12 py-3 flex items-center gap-2.5 overflow-x-auto hide-scrollbar"
          style={{
            background: "#0d0d12",
            borderBottom: "1px solid rgba(201,168,53,0.1)",
          }}
        >
          <Link
            href="/movies"
            className="shrink-0 px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12", boxShadow: "0 2px 12px rgba(201,168,53,0.3)" }}
          >
            All
          </Link>
          {allGenres.map(g => (
            <Link
              key={g.id}
              href={`/movies?genre=${g.slug}`}
              className="shrink-0 px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#888" }}
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-12 pt-2 space-y-6">
        {newRels.length > 0 && (
          <div style={{ background: "rgba(13,13,18,0.95)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
            <MovieRow title="New Releases" movies={newRels} viewAllHref="/movies?sort=newest" />
          </div>
        )}
        {trending.length > 0 && (
          <div style={{ background: "rgba(13,13,18,0.95)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
            <MovieRow title="Trending Now" movies={trending} viewAllHref="/movies?sort=popular" />
          </div>
        )}
        {genreRows.map(row => (
          <div key={row.slug} style={{ background: "rgba(13,13,18,0.95)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
            <MovieRow title={row.name} movies={row.movies} viewAllHref={`/movies?genre=${row.slug}`} />
          </div>
        ))}
        {top.length > 0 && (
          <div style={{ background: "rgba(13,13,18,0.95)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
            <MovieRow title="Top Rated" movies={top} viewAllHref="/movies?sort=rating" />
          </div>
        )}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <NavbarWrapper />

      <div className="relative pt-16 md:pt-24">
        <Suspense fallback={<div style={{ height: "clamp(300px, 42vw, 600px)", background: "#0d0d12" }} />}>
          <HeroSliderSection />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>

      <div className="gold-divider mx-4 sm:mx-6 lg:mx-12 mt-12 mb-2" />
      <Footer />
    </div>
  );
}
