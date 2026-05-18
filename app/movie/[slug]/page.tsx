import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMovieDetail, fetchComments, fetchMe, canWatchMovie } from "../../lib/api";
import { getServerUser } from "../../lib/server-auth";
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

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getServerUser();

  let movie;
  try {
    movie = await fetchMovieDetail(slug, user?.token);
  } catch {
    notFound();
  }

  if (!movie) notFound();

  const requiresPurchase = !canWatchMovie(movie) &&
    (movie.purchase?.requires_purchase ?? movie.requires_purchase ?? false);

  const [initialComments, sessionToken, userCreditBalance] = await Promise.all([
    fetchComments(movie.id).catch(() => []),
    Promise.resolve(
      canWatchMovie(movie) ? (movie.playback_session_token ?? null) : null
    ),
    requiresPurchase && user?.token
      ? fetchMe(user.token).then(u => u.credit_balance ?? u.balance ?? 0).catch(() => 0)
      : Promise.resolve(0),
  ]);

  return (
    <MovieDetailClient
      movie={movie}
      slug={slug}
      user={user}
      initialComments={initialComments}
      sessionToken={sessionToken}
      userCreditBalance={userCreditBalance}
    />
  );
}
