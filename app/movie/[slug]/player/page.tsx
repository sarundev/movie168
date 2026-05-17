import { fetchMovieDetail, canWatchMovie, type ApiMovie } from "../../../lib/api";
import { getServerUser } from "../../../lib/server-auth";
import { serverApi } from "../../../lib/server-api";
import { allMovies } from "../../../data/movies";
import PlayerClient from "./PlayerClient";

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
    quality: (found.quality === "CAM" ? "HD" : found.quality) as ApiMovie["quality"],
    release_year: found.year,
    sources: [],
    comments_count: 0,
  } as ApiMovie;
}

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const initialSourceId = sp.source ? Number(sp.source) : null;

  const user = await getServerUser();

  let movie: ApiMovie | null = null;
  try {
    movie = await fetchMovieDetail(slug, user?.token);
  } catch {
    movie = staticFallback(slug);
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#000" }}>
        <p className="text-sm" style={{ color: "#ef4444" }}>រឿងមិនត្រូវបានរកឃើញ</p>
        <a href="/" className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(255,255,255,0.08)", color: "#888" }}>← ទំព័រដើម</a>
      </div>
    );
  }

  const canWatch         = canWatchMovie(movie);
  const requiresPurchase = movie.purchase?.requires_purchase ?? movie.requires_purchase ?? false;
  const sources          = movie.sources ?? [];

  const sessionToken = movie.playback_session_token ?? null;

  // Record view when user actually reaches the player — most reliable tracking point
  if (canWatch && user) {
    serverApi(`/movies/${movie.id}/view`, { method: "POST", withAuth: true }).catch(() => {});
  }

  // Access wall
  if (!canWatch) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#000" }}>
        <div className="flex items-center gap-3 px-4 sm:px-8 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <a href={`/movie/${slug}`}
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "#ddd" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            ត្រឡប់
          </a>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p className="text-sm text-center" style={{ color: "#888" }}>
            {!user
              ? "សូមចូលគណនីដើម្បីមើលរឿងនេះ"
              : requiresPurchase
                ? `ទិញ ${movie.price ?? ""} ${movie.currency ?? "USD"} ដើម្បីមើល`
                : "អ្នកមិនទាន់មានសិទ្ធិមើលរឿងនេះ"}
          </p>
          {!user ? (
            <a href={`/login?next=/movie/${slug}/player`}
              className="px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "rgba(201,168,53,0.12)", border: "1px solid rgba(201,168,53,0.35)", color: "#c9a835" }}>
              ចូលគណនី
            </a>
          ) : requiresPurchase ? (
            <a href={`/movie/${slug}`}
              className="px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "rgba(201,168,53,0.12)", border: "1px solid rgba(201,168,53,0.35)", color: "#c9a835" }}>
              ទិញ / ចូលជាសមាជិក VIP
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#000" }}>
      {/* Back link */}
      <div className="flex items-center gap-3 px-4 sm:px-8 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <a href={`/movie/${slug}`}
          className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "#ddd" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          ត្រឡប់
        </a>
        {movie.title && (
          <>
            <span style={{ color: "#333" }}>/</span>
            <span className="text-sm truncate" style={{ color: "#888" }}>{movie.title}</span>
          </>
        )}
      </div>

      {/* Player + source selector (client interactive) */}
      <div className="flex-1 flex items-center justify-center px-0 sm:px-6 py-4 sm:py-8">
        <div className="w-full max-w-6xl">
          <PlayerClient
            sources={sources}
            initialSourceId={initialSourceId}
            movieTitle={movie.title}
            sessionToken={sessionToken}
            movieSlug={slug}
            movieId={movie.id}
          />

          {/* Movie info */}
          <div className="px-4 sm:px-0 mt-5">
            <h1 className="text-lg font-black" style={{ color: "#f0f0f0" }}>{movie.title}</h1>
            {movie.overview && (
              <p className="text-sm leading-relaxed mt-2" style={{ color: "#666" }}>{movie.overview}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
