import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import MovieRow from "./components/MovieRow";
import GenreGrid from "./components/GenreGrid";
import Footer from "./components/Footer";
import { fetchTrendingMovies, fetchMovies, fetchSliderMovies, fetchMovieFilters, type ApiMovie } from "./lib/api";

// How many genre rows to show on the homepage
const MAX_GENRE_ROWS = 5;

export default async function Home() {
  // Step 1 — fetch base data + genre list in parallel
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
  const genreBar  = allGenres;

  // Step 2 — pick genres and fetch movies for each in parallel
  const selectedGenres = allGenres.slice(0, MAX_GENRE_ROWS);

  const genreMovieResults = await Promise.allSettled(
    selectedGenres.map((g) => fetchMovies({ genre: g.slug, per_page: "20" }))
  );

  // Pair each genre with its movies, drop genres that returned nothing
  const genreRows: { name: string; slug: string; movies: ApiMovie[] }[] = selectedGenres
    .map((g, i) => ({
      name:   g.name,
      slug:   g.slug,
      movies: genreMovieResults[i].status === "fulfilled"
        ? (genreMovieResults[i] as PromiseFulfilledResult<ApiMovie[]>).value
        : [],
    }))
    .filter((r) => r.movies.length > 0);

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      <div className="relative pt-16 md:pt-24">
        <HeroSlider initialMovies={sliders} />
      </div>

      {/* Genre filter bar — all genres from API */}
      {genreBar.length > 0 && (
        <div
          className="top-14 z-40 px-4 sm:px-6 lg:px-12 py-3 flex items-center gap-2.5 overflow-x-auto hide-scrollbar"
          style={{
            background: "rgba(13,13,18,0.95)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(201,168,53,0.1)",
          }}
        >
          <a
            href="/movies"
            className="shrink-0 px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12", boxShadow: "0 2px 12px rgba(201,168,53,0.3)" }}
          >
            All
          </a>
          {genreBar.map((g) => (
            <a
              key={g.id}
              href={`/movies?genre=${g.slug}`}
              className="shrink-0 px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#888" }}
            >
              {g.name}
            </a>
          ))}
        </div>
      )}

      {/* Content rows */}
      <div className="px-4 sm:px-6 lg:px-12 pt-2 space-y-6">

        {/* Fixed rows */}
        {newRels.length > 0 && (
          <div style={{ background: "rgba(13,13,18,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
            <MovieRow title="New Releases" movies={newRels} viewAllHref="/movies?sort=newest" />
          </div>
        )}
        {trending.length > 0 && (
          <div style={{ background: "rgba(13,13,18,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
            <MovieRow title="Trending Now" movies={trending} viewAllHref="/movies?sort=popular" />
          </div>
        )}

        {/* Dynamic genre rows from API */}
        {genreRows.map((row) => (
          <div key={row.slug} style={{ background: "rgba(13,13,18,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
            <MovieRow
              title={row.name}
              movies={row.movies}
              viewAllHref={`/movies?genre=${row.slug}`}
            />
          </div>
        ))}

        {/* Top Rated always at the bottom */}
        {top.length > 0 && (
          <div style={{ background: "rgba(13,13,18,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
            <MovieRow title="Top Rated" movies={top} viewAllHref="/movies?sort=rating" />
          </div>
        )}

        {/* <div className="pt-4">
          <GenreGrid />
        </div> */}
      </div>

      <div className="gold-divider mx-4 sm:mx-6 lg:mx-12 mt-12 mb-2" />
      <Footer />
    </div>
  );
}
