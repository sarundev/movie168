import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchMovieDetail, fetchComments, fetchMe, canWatchMovie, getMovieRating, type ApiMovie } from "../../lib/api";
import { getServerUser } from "../../lib/server-auth";
import { buildPlaybackUrl } from "../../lib/player";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MovieRow from "../../components/MovieRow";
import TrailerSection from "../../components/TrailerSection";
import StarRating from "./StarRating";
import PurchaseButton from "./PurchaseButton";
import CommentSection from "./CommentSection";
import ReportModal from "./ReportModal";

const qualityBg: Record<string, string> = { "4K": "#1d4ed8", FHD: "#b45309", HD: "#15803d" };

const mockCastColors = [
  "linear-gradient(135deg,#7c2d12,#c2410c)",
  "linear-gradient(135deg,#1e1b4b,#4c1d95)",
  "linear-gradient(135deg,#064e3b,#15803d)",
  "linear-gradient(135deg,#701a75,#9d174d)",
  "linear-gradient(135deg,#0c4a6e,#0369a1)",
  "linear-gradient(135deg,#92400e,#b45309)",
];

const getMovieMeta = cache((slug: string) => fetchMovieDetail(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const movie = await getMovieMeta(slug);
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

  return (
    <div className="min-h-screen md:pt-4 pt-20" style={{ background: "#111116" }}>
      <Navbar />
      <MovieDetailShell slug={slug} />
      <div className="gold-divider mx-4 sm:mx-6 lg:mx-12 mb-2" />
      <Footer />
    </div>
  );
}

async function MovieDetailShell({ slug }: { slug: string }) {
  const user = await getServerUser();
  const token = user?.token ?? null;

  let movie;
  try {
    movie = token
      ? await fetchMovieDetail(slug, token)
      : await getMovieMeta(slug);
  } catch {
    return null;
  }

  if (!movie) return null;

  // Hero data
  const poster = movie.backdrop_url ?? movie.poster_url ?? movie.thumbnail_url;
  const canWatch = canWatchMovie(movie);
  const sessionToken = canWatch ? (movie.playback_session_token ?? null) : null;
  const isPurchased = movie.purchase?.is_purchased ?? movie.is_purchased ?? false;
  const requiresPurchaseFull = !isPurchased && (movie.purchase?.requires_purchase ?? movie.requires_purchase ?? false);
  const paymentMethods = movie.purchase?.available_payment_methods ?? [];
  const canBuyCredit = paymentMethods.includes("credit");
  const canBuyBalance = paymentMethods.includes("balance");
  const defaultSource = movie.sources?.find(s => s.is_default && s.can_watch)
    ?? movie.sources?.find(s => s.can_watch);

  const miniPoster = movie.poster_url ?? movie.thumbnail_url;
  const qColor = qualityBg[movie.quality ?? ""] ?? "#15803d";
  const { average: ratingAvg, count: ratingCount } = getMovieRating(movie);
  const movieGenres = movie.genres ?? [];
  const castNames: string[] = (movie.casts ?? []).map(c => c.name);
  const releaseYear = movie.release_year
    ?? (movie.release_date ? new Date(movie.release_date).getFullYear() : undefined);
  const runtimeText = movie.runtime_minutes
    ? `${Math.floor(movie.runtime_minutes / 60)}h ${movie.runtime_minutes % 60}m` : undefined;
  const related: ApiMovie[] = movie.related_movies ?? [];
  const sidebarMovies: ApiMovie[] = related.length > 0
    ? [...related].sort((a, b) => {
        const ra = typeof a.rating === "object" ? (a.rating?.average ?? 0) : (a.vote_average ?? 0);
        const rb = typeof b.rating === "object" ? (b.rating?.average ?? 0) : (b.vote_average ?? 0);
        return rb - ra;
      }).slice(0, 10)
    : [];
  const initialMyRating = typeof movie.rating === "object" ? (movie.rating?.my_rating ?? 0) : 0;

  return (
    <>
      <div style={{ background: "#000", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <link rel="preload" as="image" href={poster} fetchPriority="high" />
        <div className="relative w-full mx-auto" style={{ maxWidth: "1350px", aspectRatio: "16/9" }}>
          {poster && (
            <img
              src={poster}
              alt=""
              fetchPriority="high"
              loading="eager"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.35)" }}
            />
          )}
          {sessionToken && user ? (
            <iframe
              src={buildPlaybackUrl({ sessionToken, movieSlug: slug, sourceId: defaultSource?.id })}
              title={movie.title}
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : (
            <PurchaseButton
              slug={slug}
              movieTitle={movie.title}
              requiresPurchase={requiresPurchaseFull}
              price={movie.price}
              canBuyCredit={canBuyCredit}
              canBuyBalance={canBuyBalance}
              isLoggedIn={!!user}
            />
          )}
        </div>
      </div>
      <div className="px-3 sm:px-5 lg:px-10 pb-16" style={{ marginTop: "-2px" }}>
        <div className="flex flex-col lg:flex-row gap-6 max-w-screen-xl mx-auto">

          <div className="flex-1 min-w-0 space-y-4">

            {!user && (
              <div className="rounded-xl px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Link href={`/login?redirect=/movie/${slug}/player${defaultSource ? `?source=${defaultSource.id}` : ""}`}
                  className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12",
                    boxShadow: "0 4px 16px rgba(201,168,53,0.3)", touchAction: "manipulation" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  ចុចមើលរឿង
                </Link>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span className="text-xs" style={{ color: "#666" }}>
                    ត្រូវការ <Link href={`/login?redirect=/movie/${slug}`} className="hover:underline" style={{ color: "#c9a835" }}>ចូលគណនី</Link> ដើម្បីមើល
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-4">
                <div className="relative rounded-lg overflow-hidden shrink-0"
                  style={{ width: "90px", aspectRatio: "2/3", background: "#2a2a35" }}>
                  {miniPoster && (
                    <img
                      src={miniPoster}
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  {movie.quality && (
                    <span className="absolute bottom-1 left-1 text-[8px] font-black px-1 py-0.5 rounded"
                      style={{ background: qColor, color: "white" }}>{movie.quality}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="font-black text-white leading-tight mb-1" style={{ fontSize: "clamp(1.1rem,3vw,1.5rem)" }}>
                    {movie.title}
                  </h1>
                  {movie.original_title && (
                    <p className="text-xs mb-2 truncate" style={{ color: "#666" }}>{movie.original_title}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-3" style={{ color: "#666" }}>
                    {releaseYear && <span>{releaseYear}</span>}
                    {movie.country_code && <><span>•</span><span>{movie.country_code}</span></>}
                    {runtimeText && <><span>•</span><span>{runtimeText}</span></>}
                    {movie.age_rating && <><span>•</span><span style={{ color: "#ef4444" }}>{movie.age_rating}</span></>}
                  </div>

                  {ratingAvg != null && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-black" style={{ color: "#c9a835" }}>
                        {Number(ratingAvg).toFixed(1)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <svg key={n} width="11" height="11" viewBox="0 0 20 20"
                            fill={n <= Math.round(ratingAvg!) ? "#c9a835" : "rgba(255,255,255,0.15)"}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      {ratingCount != null && (
                        <span className="text-xs" style={{ color: "#555" }}>{ratingCount} votes</span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {movieGenres.map(g => (
                      <a key={g.id} href={`/movies?genre=${g.slug ?? g.name.toLowerCase()}`}
                        className="text-[11px] px-2.5 py-0.5 rounded transition-colors hover:text-amber-400"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa" }}>
                        {g.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <ReportModal movieId={movie.id} token={token} />
                <div className="flex-1" />
                <span className="text-xs" style={{ color: "#444" }}>{movie.comments_count ?? 0} comments</span>
              </div>
            </div>

            {movie.overview && (
              <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                  <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>សង្ខេប</h2>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#999" }}>{movie.overview}</p>
              </div>
            )}

            <TrailerSection
              trailers={
                movie.trailers?.length
                  ? movie.trailers
                  : movie.trailer_url
                    ? [{ id: 0, url: movie.trailer_url, label: "Trailer" }]
                    : []
              }
              movieTitle={movie.title}
              posterFallback={movie.backdrop_url ?? movie.poster_url ?? movie.thumbnail_url}
            />

            {castNames.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                  <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>តារា</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {castNames.map((name: string, i: number) => (
                    <div key={name} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black transition-all group-hover:scale-110"
                        style={{ background: mockCastColors[i % mockCastColors.length], color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                        {name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] text-center w-16 line-clamp-2 group-hover:text-amber-400 transition-colors" style={{ color: "#777" }}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                movie.type        && { label: "ប្រភេទ",   value: movie.type === "movie" ? "រឿង" : "រឿងភ្លើង" },
                releaseYear       && { label: "ឆ្នាំ",     value: String(releaseYear) },
                runtimeText       && { label: "រយៈពេល",   value: runtimeText },
                movie.country_code && { label: "ប្រទេស",   value: movie.country_code },
                movie.access_type && { label: "ការចូលមើល", value: movie.access_type === "free" ? "ឥតគិតថ្លៃ" : `$${movie.price ?? "—"}` },
              ].filter(Boolean).map(row => {
                const { label, value } = row as { label: string; value: string };
                return (
                  <div key={label} className="flex items-center py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span className="text-xs w-28 shrink-0 font-medium" style={{ color: "#555" }}>{label}</span>
                    <span className="text-sm" style={{ color: "#bbb" }}>{value}</span>
                  </div>
                );
              })}
            </div>

            <StarRating
              movieId={movie.id}
              slug={slug}
              initialMyRating={initialMyRating}
              token={token}
            />

            <AsyncComments
              movieId={movie.id}
              slug={slug}
              token={token}
              userName={user?.name ?? ""}
            />

            {related.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <MovieRow title="ដូចគ្នា KH" movies={related} />
              </div>
            )}
          </div>

          <div className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-20 rounded-xl overflow-hidden" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                  <h3 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>ចំណាត់ថ្នាក់ទំព 10 ប្រចាំសប្តាហ៍</h3>
                </div>
              </div>
              <div className="lg:hidden flex overflow-x-auto gap-3 px-3 py-3 hide-scrollbar">
                {sidebarMovies.map(m => (
                  <a key={m.id} href={`/movie/${m.slug}`}
                    className="flex flex-col shrink-0 gap-1.5 group" style={{ touchAction: "manipulation" }}>
                    <div className="relative rounded-lg overflow-hidden"
                      style={{ width: "68px", height: "95px", background: "#2a2a35" }}>
                      {(m.poster_url ?? m.thumbnail_url) && (
                        <img src={m.poster_url ?? m.thumbnail_url} alt={m.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      )}
                    </div>
                    <p className="text-[10px] text-center leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors"
                      style={{ color: "#bbb", width: "68px" }}>{m.title}</p>
                  </a>
                ))}
              </div>
              <div className="hidden lg:block">
                {sidebarMovies.map(m => (
                  <a key={m.id} href={`/movie/${m.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors group hover:bg-[rgba(255,255,255,0.04)]"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="relative rounded-lg overflow-hidden shrink-0"
                      style={{ width: "56px", height: "78px", background: "#2a2a35" }}>
                      {(m.poster_url ?? m.thumbnail_url) && (
                        <img src={m.poster_url ?? m.thumbnail_url} alt={m.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors"
                        style={{ color: "#ddd" }}>{m.title}</p>
                      <p className="text-[10px] mt-1" style={{ color: "#555" }}>{m.release_year ?? ""}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

async function AsyncComments({ movieId, slug, token, userName }: { movieId: number; slug: string; token: string | null; userName: string }) {
  const initialComments = await fetchComments(movieId).catch(() => []);
  return (
    <CommentSection
      movieId={movieId}
      slug={slug}
      initialComments={initialComments}
      token={token}
      userName={userName}
    />
  );
}


