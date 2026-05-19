import { fetchMovies, fetchMovieFilters } from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MoviesFilterBar from "./MoviesFilterBar";
import MoviesGrid from "./MoviesGrid";
import Link from "next/link";

export default async function MoviesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await props.searchParams;
  const genre = typeof sp.genre === "string" ? sp.genre : "";
  const quality = typeof sp.quality === "string" ? sp.quality : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const search = typeof sp.q === "string" ? sp.q : "";

  const params: Record<string, string> = { page: "1", per_page: "24" };
  if (sort !== "newest") params.sort = sort;
  if (genre) params.genre = genre;
  if (quality) params.quality = quality;
  if (search.trim()) params.search = search.trim();

  const [moviesResult, filtersResult] = await Promise.allSettled([
    fetchMovies(params),
    fetchMovieFilters(),
  ]);
  const initialMovies = moviesResult.status === "fulfilled" ? moviesResult.value : [];
  const genreList = filtersResult.status === "fulfilled" ? filtersResult.value.genres : [];
  const qualityList = filtersResult.status === "fulfilled"
    ? filtersResult.value.qualities.map((q) => q.value)
    : [];

  const hasFilters = !!(genre || quality || search.trim());

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-12 pt-20 pb-6" style={{ borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "#666" }}>
              <Link href="/" style={{ color: "#888" }} className="hover:text-amber-400 transition-colors">Home</Link>
              <span>/</span>
              <span style={{ color: "#c9a835" }}>Movies</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "#f0f0f0" }}>All Movies</h1>
          </div>
        </div>
        <MoviesFilterBar
          genreList={genreList}
          qualityList={qualityList}
          initialGenre={genre}
          initialQuality={quality}
          initialSort={sort}
          initialSearch={search}
          hasFilters={hasFilters}
        />
      </div>
      <div className="flex flex-col lg:flex-row px-4 sm:px-6 lg:px-12 py-8 gap-6 lg:gap-8">
        <aside className="hidden lg:block lg:shrink-0" style={{ minWidth: "160px" }}>
          <MoviesFilterBar
            genreList={genreList}
            qualityList={qualityList}
            initialGenre={genre}
            initialQuality={quality}
            initialSort={sort}
            initialSearch={search}
            hasFilters={hasFilters}
            sidebar
          />
        </aside>
        <div className="flex-1 min-w-0">
          <MoviesGrid
            initialMovies={initialMovies}
            initialGenre={genre}
            initialQuality={quality}
            initialSort={sort}
            initialSearch={search}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
