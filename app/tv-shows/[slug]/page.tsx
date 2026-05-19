import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { fetchTvShow } from "../../lib/api";
import { getServerUser } from "../../lib/server-auth";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EpisodePlayer from "./EpisodePlayer";

const getTvShowMeta = cache((slug: string) => fetchTvShow(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const show = await getTvShowMeta(slug);
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
    show = user?.token
      ? await fetchTvShow(slug, user.token)
      : await getTvShowMeta(slug);
  } catch {
    notFound();
  }

  if (!show) notFound();

  return (
    <div className="min-h-screen" style={{ background: "#111116" }}>
      <Navbar />
      <EpisodePlayer show={show} slug={slug} user={user} />
      <div className="mx-4 sm:mx-6 lg:mx-12 mb-2" style={{ height: 1, background: "rgba(201,168,53,0.12)" }} />
      <Footer />
    </div>
  );
}
