const PLAYER_BASE =
  (process.env.NEXT_PUBLIC_PLAYER_URL ?? "https://streaming-iframe.vercel.app/embed/movies").replace(/\/$/, "");

export function buildPlaybackUrl({
  sessionToken,
  movieSlug,
  sourceId,
  startSeconds,
}: {
  sessionToken: string;
  movieSlug: string;
  sourceId?: number | null;
  startSeconds?: number | null;
}): string {
  const url = new URL(`${PLAYER_BASE}/${movieSlug}`);
  url.searchParams.set("token", sessionToken);
  if (sourceId) url.searchParams.set("source", String(sourceId));
  if (startSeconds && startSeconds > 0) {
    url.searchParams.set("start", String(startSeconds));
    url.searchParams.set("resume", String(startSeconds));
    url.searchParams.set("watched_seconds", String(startSeconds));
  }
  return url.toString();
}
