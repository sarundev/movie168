import Link from "next/link";
import NavbarWrapper from "./components/NavbarWrapper";
import HeroSlider from "./components/HeroSlider";
import MovieRow from "./components/MovieRow";
import Footer from "./components/Footer";
import { fetchTrendingMovies, fetchMovies, fetchSliderMovies, fetchMovieFilters, type ApiMovie, type ApiGenre } from "./lib/api";

const MAX_GENRE_ROWS = 5;

// Streams in after the above-the-fold content is already painted
async function GenreRows({ genres }: { genres: ApiGenre[] }) {
  const results = await Promise.allSettled(
    genres.map(g => fetchMovies({ genre: g.slug, per_page: "20" }))
  );

  const rows: { name: string; slug: string; movies: ApiMovie[] }[] = genres
    .map((g, i) => ({
      name:   g.name,
      slug:   g.slug,
      movies: results[i].status === "fulfilled"
        ? (results[i] as PromiseFulfilledResult<ApiMovie[]>).value
        : [],
    }))
    .filter(r => r.movies.length > 0);

  return (
    <>
      {rows.map(row => (
        <div key={row.slug} style={{ background: "rgba(13,13,18,0.95)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
          <MovieRow title={row.name} movies={row.movies} viewAllHref={`/movies?genre=${row.slug}`} />
        </div>
      ))}
    </>
  );
}

export default async function Home() {
  // All above-the-fold data fetched in one parallel batch — genres come here too
  const [sliderResult, trendingResult, newRelsResult, topResult, filtersResult] =
    await Promise.allSettled([
      fetchSliderMovies(),
      fetchTrendingMovies(),
      fetchMovies({ sort: "newest", per_page: "20" }),
      fetchMovies({ sort: "rating", per_page: "20" }),
      fetchMovieFilters(),
    ]);

  const sliders  = sliderResult.status  === "fulfilled" ? sliderResult.value  : [];
  const trending = trendingResult.status === "fulfilled" ? trendingResult.value : [];
  const newRels  = newRelsResult.status  === "fulfilled" ? newRelsResult.value  : [];
  const top      = topResult.status      === "fulfilled" ? topResult.value      : [];
  const allGenres = filtersResult.status === "fulfilled" ? filtersResult.value.genres : [];

  const selectedGenres = allGenres.slice(0, MAX_GENRE_ROWS);
  const firstHeroImage = sliders[0]?.backdrop_url ?? sliders[0]?.poster_url ?? sliders[0]?.thumbnail_url;

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      {/* Preload hero image: browser fetches it from HTML before JS hydrates the client component */}
      {firstHeroImage && (() => {
        const enc = encodeURIComponent(firstHeroImage);
        const srcSet = [640, 828, 1080, 1920].map(w => `/_next/image?url=${enc}&w=${w}&q=85 ${w}w`).join(", ");
        return <link rel="preload" as="image" imageSrcSet={srcSet} imageSizes="100vw" />;
      })()}
      <NavbarWrapper />

      {/* Hero — above the fold, renders immediately */}
      <div className="relative pt-16 md:pt-24">
        <HeroSlider initialMovies={sliders} />
      </div>

      {/* Genre filter bar */}
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

      {/* Content rows */}
      <div className="px-4 sm:px-6 lg:px-12 pt-2 space-y-6">

        {/* Above-the-fold rows — available immediately */}
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

        {/* Genre rows stream in without blocking the above content */}
        {selectedGenres.length > 0 && (
          <GenreRows genres={selectedGenres} />
        )}

        {/* Top Rated */}
        {top.length > 0 && (
          <div style={{ background: "rgba(13,13,18,0.95)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
            <MovieRow title="Top Rated" movies={top} viewAllHref="/movies?sort=rating" />
          </div>
        )}
      </div>

      <div className="gold-divider mx-4 sm:mx-6 lg:mx-12 mt-12 mb-2" />
      <Footer />
    </div>
  );
}
