import { API } from "../config";

// ─── Shared types ────────────────────────────────────────────────────────────

export interface ApiMovieSource {
  id: number;
  source_type: string;
  label: string;
  quality: string;
  is_default: boolean;
  can_watch: boolean;
  embed_url?: string;
}

export interface ApiMovie {
  id: number;
  uuid?: string;
  slug: string;
  title: string;
  original_title?: string;
  overview?: string;
  type?: "movie" | "series";
  status?: string;
  access_type?: string;
  price?: number;
  currency?: string;
  poster_url?: string;
  backdrop_url?: string;
  thumbnail_url?: string;
  release_date?: string;
  release_year?: number;
  runtime_minutes?: number | null;
  original_language?: string;
  country_code?: string;
  quality?: string;
  age_rating?: string | null;

  // Detail endpoint — nested rating object
  rating?: { average: number; count: number; my_rating: number | null } | number;

  // List endpoints — flat rating fields
  vote_average?: number;
  vote_count?: number;
  popularity?: number;

  // Detail endpoint — nested flags/purchase
  flags?: { is_featured: boolean; is_slider: boolean; is_trending: boolean };
  purchase?: { is_purchased: boolean; can_watch: boolean; requires_purchase: boolean };
  user_state?: { is_favorited: boolean; watch_progress: unknown };

  // List endpoints — flat flags
  is_featured?: boolean;
  is_slider?: boolean;
  is_trending?: boolean;
  has_ready_source?: boolean;
  is_purchased?: boolean;
  can_watch?: boolean;
  requires_purchase?: boolean;

  genres?: { id: number; name: string; slug?: string }[];
  casts?: { id: number; name: string; role?: string; profile_url?: string }[];
  trailers?: { id: number; url: string; label?: string }[];
  sources?: ApiMovieSource[];
  subtitles?: unknown[];
  comments_count?: number;
  related_movies?: ApiMovie[];

  // fallback fields
  badge?: string;
  gradient?: string;
}

// Normalise rating from either the nested detail shape or flat list shape
export function getMovieRating(m: ApiMovie): { average: number; count: number } {
  if (m.rating && typeof m.rating === "object") {
    return { average: m.rating.average, count: m.rating.count };
  }
  return {
    average: m.vote_average ?? (typeof m.rating === "number" ? m.rating : 0),
    count:   m.vote_count   ?? 0,
  };
}

// Normalise can_watch from either nested purchase or flat field
export function canWatchMovie(m: ApiMovie): boolean {
  return m.purchase?.can_watch ?? m.can_watch ?? true;
}

export interface ApiComment {
  id: number;
  user: { id: number; name: string; avatar?: string };
  body: string;
  likes_count: number;
  dislikes_count: number;
  my_reaction?: "like" | "dislike" | null;
  replies?: ApiComment[];
  created_at: string;
}

export interface ApiPlaybackSession {
  token: string;
  stream_url?: string;
  embed_url?: string;
  expires_at: string;
}

export interface ApiProgress {
  position: number;
  duration: number;
  percent: number;
  completed: boolean;
}

export interface ApiPurchase {
  id: number;
  movie: ApiMovie;
  purchased_at: string;
}

export interface ApiWatchHistory {
  id: number;
  movie: ApiMovie;
  progress?: number;
  watched_at: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  plan?: string;
  plan_expires_at?: string;
  balance?: number;
  total_watched?: number;
  total_purchases?: number;
  member_since?: string;
}

export interface ApiPublicSettings {
  site_name?: string;
  currency?: string;
  plans?: { id: string; label: string; price: number; features: string[] }[];
}

// ─── API error ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ─── Core fetcher ────────────────────────────────────────────────────────────

// In-memory cache for client-side requests (server-side uses Next.js Data Cache)
const _cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 300_000; // 5 minutes

async function req<T>(
  url: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const isGet = !options.method || options.method.toUpperCase() === "GET";
  const isClient = typeof window !== "undefined";
  const cacheKey = isGet && !token && isClient ? url : null;

  if (cacheKey) {
    const hit = _cache.get(cacheKey);
    if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data as T;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Server-side GET requests use Next.js Data Cache (revalidate every 5 min)
  const nextOptions = isGet && !isClient ? { next: { revalidate: 300 } } : {};

  const res = await fetch(url, { ...options, headers, ...nextOptions });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d?.message ?? msg; } catch {}
    throw new ApiError(msg, res.status);
  }
  const data = await res.json() as T;
  if (cacheKey) _cache.set(cacheKey, { data, ts: Date.now() });
  return data;
}

// ─── Movies ──────────────────────────────────────────────────────────────────

export async function fetchMovies(params?: Record<string, string>): Promise<ApiMovie[]> {
  const url = params
    ? `${API.movies.list}?${new URLSearchParams(params)}`
    : API.movies.list;
  const data = await req<{ data: ApiMovie[] } | ApiMovie[]>(url);
  return Array.isArray(data) ? data : (data as { data: ApiMovie[] }).data ?? [];
}

export async function fetchFeaturedMovies(): Promise<ApiMovie[]> {
  const data = await req<{ data: ApiMovie[] } | ApiMovie[]>(API.movies.featured);
  return Array.isArray(data) ? data : (data as { data: ApiMovie[] }).data ?? [];
}

export async function fetchSliderMovies(): Promise<ApiMovie[]> {
  const data = await req<{ data: ApiMovie[] } | ApiMovie[]>(API.movies.sliders);
  return Array.isArray(data) ? data : (data as { data: ApiMovie[] }).data ?? [];
}

export async function fetchTrendingMovies(): Promise<ApiMovie[]> {
  const data = await req<{ data: ApiMovie[] } | ApiMovie[]>(API.movies.trending);
  return Array.isArray(data) ? data : (data as { data: ApiMovie[] }).data ?? [];
}

export async function fetchMovieDetail(slug: string): Promise<ApiMovie> {
  const data = await req<{ data: ApiMovie } | ApiMovie>(API.movies.detail(slug));
  return (data as { data: ApiMovie }).data ?? (data as ApiMovie);
}

export async function fetchMoviePlayer(slug: string, token: string): Promise<{ url?: string }> {
  return req<{ url?: string }>(API.movies.player(slug), {}, token);
}

export async function fetchComments(movieId: number | string): Promise<ApiComment[]> {
  const data = await req<{ data: ApiComment[] } | ApiComment[]>(API.movies.comments(movieId));
  return Array.isArray(data) ? data : (data as { data: ApiComment[] }).data ?? [];
}

export async function postComment(
  movieId: number | string,
  body: string,
  token: string,
  parentId?: number,
): Promise<ApiComment> {
  const payload: Record<string, unknown> = { body };
  if (parentId) payload.parent_id = parentId;
  const data = await req<{ data: ApiComment } | ApiComment>(
    API.movies.comments(movieId),
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
  return (data as { data: ApiComment }).data ?? (data as ApiComment);
}

export async function rateMovie(
  movieId: number | string,
  rating: number,
  token: string,
): Promise<void> {
  await req(API.movies.rating(movieId), { method: "POST", body: JSON.stringify({ rating }) }, token);
}

export async function reactComment(
  commentId: number | string,
  reaction: "like" | "dislike",
  token: string,
): Promise<void> {
  await req(API.comments.reaction(commentId), { method: "POST", body: JSON.stringify({ reaction }) }, token);
}

export async function removeCommentReaction(commentId: number | string, token: string): Promise<void> {
  await req(API.comments.reaction(commentId), { method: "DELETE" }, token);
}

export async function reportContent(
  payload: { type: "movie" | "comment"; target_id: number; reason: string },
  token: string,
): Promise<void> {
  await req(API.reports, { method: "POST", body: JSON.stringify(payload) }, token);
}

// ─── Me ──────────────────────────────────────────────────────────────────────

export async function fetchMe(token: string): Promise<ApiUser> {
  const data = await req<{ data: ApiUser } | ApiUser>(API.me.profile, {}, token);
  return (data as { data: ApiUser }).data ?? (data as ApiUser);
}

export async function fetchMyPurchases(token: string): Promise<ApiPurchase[]> {
  const data = await req<{ data: ApiPurchase[] } | ApiPurchase[]>(API.me.purchases, {}, token);
  return Array.isArray(data) ? data : (data as { data: ApiPurchase[] }).data ?? [];
}

export async function fetchWatchHistory(token: string): Promise<ApiWatchHistory[]> {
  const data = await req<{ data: ApiWatchHistory[] } | ApiWatchHistory[]>(API.me.watchHistory, {}, token);
  return Array.isArray(data) ? data : (data as { data: ApiWatchHistory[] }).data ?? [];
}

export async function preparePurchase(movieId: number | string, token: string): Promise<{ payment_url?: string; qr_data?: string }> {
  return req(API.movies.purchase(movieId), { method: "POST" }, token);
}

// ─── Playback ────────────────────────────────────────────────────────────────

export async function createPlaybackSession(movieId: number | string, token: string): Promise<ApiPlaybackSession> {
  const data = await req<{ data: ApiPlaybackSession } | ApiPlaybackSession>(
    API.playback.createSession(movieId),
    { method: "POST" },
    token,
  );
  return (data as { data: ApiPlaybackSession }).data ?? (data as ApiPlaybackSession);
}

export async function fetchPlaybackProgress(token: string, authToken: string): Promise<ApiProgress> {
  const data = await req<{ data: ApiProgress } | ApiProgress>(
    API.playback.progress(token),
    {},
    authToken,
  );
  return (data as { data: ApiProgress }).data ?? (data as ApiProgress);
}

export async function updatePlaybackProgress(
  sessionToken: string,
  position: number,
  authToken: string,
): Promise<void> {
  await req(
    API.playback.progress(sessionToken),
    { method: "POST", body: JSON.stringify({ position }) },
    authToken,
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function fetchPublicSettings(): Promise<ApiPublicSettings> {
  const data = await req<{ data: ApiPublicSettings } | ApiPublicSettings>(API.settings.public);
  return (data as { data: ApiPublicSettings }).data ?? (data as ApiPublicSettings);
}
