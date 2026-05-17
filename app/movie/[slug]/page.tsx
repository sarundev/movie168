import { notFound } from "next/navigation";
import { fetchMovieDetail } from "../../lib/api";
import { allMovies } from "../../data/movies";
import type { ApiMovie } from "../../lib/api";
import MovieDetailClient from "./MovieDetailClient";

function staticFallback(slug: string): ApiMovie | null {
  const numericId = parseInt(slug, 10);
  const found = allMovies.find(
    mv => mv.slug === slug || (!isNaN(numericId) && mv.id === numericId)
  );
  if (!found) return null;
  return {
    id: found.id,
    slug: found.slug ?? String(found.id),
    title: found.title,
    overview: found.description ?? "",
    quality: found.quality === "CAM" ? "HD" : found.quality,
    badge: found.badge,
    release_year: found.year,
    release_date: found.releaseDate ?? `${found.year}-01-01`,
    runtime_minutes: null,
    rating: found.rating,
    genres: found.genres.map((name, i) => ({ id: i + 1, name, slug: name.toLowerCase() })),
    casts: (found.cast ?? []).map((name, i) => ({ id: i + 1, name })),
    poster_url: found.image ?? undefined,
    backdrop_url: undefined,
    sources: [],
    comments_count: 0,
  } as ApiMovie;
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let movie: ApiMovie | null = null;
  try {
    movie = await fetchMovieDetail(slug);
  } catch {
    movie = staticFallback(slug);
  }

  if (!movie) notFound();

  return <MovieDetailClient movie={movie} slug={slug} />;
}
