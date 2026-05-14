import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import MovieRow from "./components/MovieRow";
import TopTenRow from "./components/TopTenRow";
import GenreGrid from "./components/GenreGrid";
import ContinueWatching from "./components/ContinueWatching";
import Footer from "./components/Footer";
import { trendingMovies, newReleases, actionMovies, topRated, horrorMovies } from "./data/movies";

const genres = ["All", "Action", "Drama", "Sci-Fi", "Horror", "Comedy", "Romance", "Thriller", "Animation", "Fantasy"];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      {/* Full-width hero slider */}
      <div className="pt-24">
        <HeroSlider />
      </div>


      {/* Genre filter bar — sticky below navbar */}
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

      {/* ── Content sections ── */}
      <div className="px-4 sm:px-6 lg:px-12 pt-10 space-y-12">

        {/* Trending Now */}
        <MovieRow title="Trending Now" movies={trendingMovies} />

        {/* New Releases */}
        <MovieRow title="New Releases" movies={newReleases} />

        {/* Browse by Genre */}
        {/* <GenreGrid /> */}

        {/* Action & Adventure */}
        <MovieRow title="Action &amp; Adventure" movies={actionMovies} />

        {/* Horror */}
        <MovieRow title="Horror &amp; Suspense" movies={horrorMovies} />

      </div>

      {/* Continue Watching */}
      {/* <ContinueWatching movies={trendingMovies.slice(0, 6)} /> */}

      {/* Top Rated All Time */}
      <div className="px-4 sm:px-6 lg:px-12 pb-6">
        <MovieRow title="Top Rated All Time" movies={topRated} />
      </div>

      {/* Gold divider */}
      <div className="gold-divider mx-4 sm:mx-6 lg:mx-12 mb-2" />

      <Footer />
    </div>
  );
}
