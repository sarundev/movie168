import { fetchMovieFilters } from "../lib/api";
import Navbar from "./Navbar";

export default async function NavbarWrapper() {
  const filters = await fetchMovieFilters().catch(() => ({ genres: [], countries: [], qualities: [] }));
  return (
    <Navbar
      initialGenres={filters.genres}
      initialCountries={filters.countries}
    />
  );
}
