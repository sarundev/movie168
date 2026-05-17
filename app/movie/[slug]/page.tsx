import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMovieDetail, fetchComments, type ApiMovie } from "../../lib/api";
import { getServerUser } from "../../lib/server-auth";
import { allMovies } from "../../data/movies";
import MovieDetailClient from "./MovieDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const movie = await fetchMovieDetail(slug);
    const image = movie.backdrop_url ?? movie.poster_url ?? movie.thumbnail_url;
    return {
      title: `${movie.title} — 168NET`,
      description: movie.overview ?? `Watch ${movie.title} online in HD on 168NET.`,
      openGraph: {
        title: movie.title,
        description: movie.overview ?? "",
        images: image ? [{ url: image, width: 1280, height: 720, alt: movie.title }] : [],
        type: "video.movie",
      },
    };
  } catch {
    return { title: "168NET — Movie" };
  }
}

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
  const user = await getServerUser();

  let movie: ApiMovie | null = null;
  try {
    movie = await fetchMovieDetail(slug, user?.token);
  } catch {
    movie = staticFallback(slug);
  }

  if (!movie) notFound();

  const initialComments = await fetchComments(movie.id).catch(() => []);

  return (
    <MovieDetailClient
      movie={movie}
      slug={slug}
      user={user}
      initialComments={initialComments}
      sessionToken={movie.playback_session_token ?? null}
    />
  );
}
