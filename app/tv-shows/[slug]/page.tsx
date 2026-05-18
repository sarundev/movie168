import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchTvShow } from "../../lib/api";
import { getServerUser } from "../../lib/server-auth";
import TvShowClient from "./TvShowClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const show = await fetchTvShow(slug);
    const image = show.backdrop_url ?? show.poster_url ?? show.thumbnail_url;
    return {
      title: `${show.title} — 168NET`,
      description: show.overview ?? `Watch ${show.title} online on 168NET.`,
      openGraph: {
        title: show.title,
        description: show.overview ?? "",
        images: image ? [{ url: image, width: 1280, height: 720, alt: show.title }] : [],
      },
    };
  } catch {
    return { title: "168NET — TV Show" };
  }
}

export default async function TvShowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getServerUser();

  let show;
  try {
    show = await fetchTvShow(slug, user?.token);
  } catch {
    notFound();
  }

  if (!show) notFound();

  return <TvShowClient show={show} slug={slug} user={user} />;
}
