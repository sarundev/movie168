import { fetchMovies, fetchMovieFilters } from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SeriesFilterBar from "./SeriesFilterBar";
import SeriesGrid from "./SeriesGrid";
import Link from "next/link";

export default async function SeriesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await props.searchParams;
  const genre = typeof sp.genre === "string" ? sp.genre : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const search = typeof sp.q === "string" ? sp.q : "";

  const params: Record<string, string> = { page: "1", per_page: "24", type: "series" };
  if (sort !== "newest") params.sort = sort;
  if (genre) params.genre = genre;
  if (search.trim()) params.search = search.trim();

  const [seriesResult, filtersResult] = await Promise.allSettled([
    fetchMovies(params),
    fetchMovieFilters(),
  ]);

  const initialSeries = seriesResult.status === "fulfilled" ? seriesResult.value : [];
  const genreList = filtersResult.status === "fulfilled" ? filtersResult.value.genres : [];

  const hasFilters = !!(genre || search.trim());

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-12 pt-20 pb-6" style={{ borderBottom:"1px solid rgba(201,168,53,0.1)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1" style={{ color:"#666" }}>
              <Link href="/" style={{ color:"#888" }} className="hover:text-amber-400 transition-colors">Home</Link>
              <span>/</span>
              <span style={{ color:"#c9a835" }}>TV Series</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color:"#f0f0f0" }}>TV Series</h1>
          </div>
        </div>
        <SeriesFilterBar
          genreList={genreList}
          initialGenre={genre}
          initialSort={sort}
          initialSearch={search}
          hasFilters={hasFilters}
        />
      </div>
      <div className="flex px-4 sm:px-6 lg:px-12 py-8 gap-8">
        <aside className="hidden lg:block shrink-0" style={{ width:"180px" }}>
          <SeriesFilterBar
            genreList={genreList}
            initialGenre={genre}
            initialSort={sort}
            initialSearch={search}
            hasFilters={hasFilters}
            sidebar
          />
        </aside>
        <div className="flex-1 min-w-0">
          <SeriesGrid
            initialSeries={initialSeries}
            initialGenre={genre}
            initialSort={sort}
            initialSearch={search}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
