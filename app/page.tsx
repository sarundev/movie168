import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import MovieRow from "./components/MovieRow";
import Footer from "./components/Footer";
import { trendingMovies, newReleases, actionMovies, topRated, horrorMovies, type Movie } from "./data/movies";
import { fetchTrendingMovies, fetchMovies, fetchSliderMovies, getMovieRating, type ApiMovie } from "./lib/api";

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

export default async function Home() {
  // All fetches run in parallel on the server — page HTML arrives pre-rendered
  const [sliderMovies, trendingData, newRelsData, actionData, horrorData, topData] =
    await Promise.allSettled([
      fetchSliderMovies(),
      fetchTrendingMovies(),
      fetchMovies({ sort: "newest", per_page: "20" }),
      fetchMovies({ genre: "action", per_page: "20" }),
      fetchMovies({ genre: "horror", per_page: "20" }),
      fetchMovies({ sort: "rating", per_page: "20" }),
    ]);

  const resolve = <T,>(result: PromiseSettledResult<T[]>, fallback: T[]): T[] =>
    result.status === "fulfilled" && result.value.length ? result.value : fallback;

  const sliders  = resolve(sliderMovies,  [] as ApiMovie[]);
  const trending = resolve(trendingData,  [] as ApiMovie[]).map(apiToMovie);
  const newRels  = resolve(newRelsData,   [] as ApiMovie[]).map(apiToMovie);
  const action   = resolve(actionData,    [] as ApiMovie[]).map(apiToMovie);
  const horror   = resolve(horrorData,    [] as ApiMovie[]).map(apiToMovie);
  const top      = resolve(topData,       [] as ApiMovie[]).map(apiToMovie);

  // Use static fallback data when API has no results
  const trendingMoviesDisplay = trending.length  ? trending  : trendingMovies;
  const newRelsDisplay        = newRels.length   ? newRels   : newReleases;
  const actionDisplay         = action.length    ? action    : actionMovies;
  const horrorDisplay         = horror.length    ? horror    : horrorMovies;
  const topDisplay            = top.length       ? top       : topRated;

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      <div className="relative pt-16 md:pt-24">
        <HeroSlider initialMovies={sliders} />
      </div>

      {/* Genre filter bar */}
      <div
        className="top-14 z-40 px-4 sm:px-6 lg:px-12 py-3 flex items-center gap-2.5 overflow-x-auto hide-scrollbar"
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

      {/* Content rows — pre-rendered on server, no loading flash */}
      <div className="px-4 sm:px-6 lg:px-12 pt-2 space-y-6">
        <div className="re" style={{ background: "rgba(13,13,18,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
          <MovieRow title="New Releases" movies={newRelsDisplay} />
        </div>
        <div className="relative" style={{ background: "rgba(13,13,18,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
          <MovieRow title="Trending Now" movies={trendingMoviesDisplay} />
        </div>
        <div className="relative" style={{ background: "rgba(13,13,18,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
          <MovieRow title="Action & Adventure" movies={actionDisplay} />
        </div>
        <div className="relative" style={{ background: "rgba(13,13,18,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
          <MovieRow title="Horror & Suspense" movies={horrorDisplay} />
        </div>
        <div className="relative" style={{ background: "rgba(13,13,18,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
          <MovieRow title="Top Rated" movies={topDisplay} />
        </div>
      </div>

      <div className="gold-divider mx-4 sm:mx-6 lg:mx-12 mt-12 mb-2" />
      <Footer />
    </div>
  );
}
