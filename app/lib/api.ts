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
  purchase?: { is_purchased: boolean; can_watch: boolean; requires_purchase: boolean; available_payment_methods?: string[] };
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
  trailer_url?: string;
  trailers?: { id: number; url: string; label?: string }[];
  sources?: ApiMovieSource[];
  subtitles?: unknown[];
  comments_count?: number;
  related_movies?: ApiMovie[];
  playback_session_token?: string;

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
  const isPurchased = m.purchase?.is_purchased ?? m.is_purchased ?? false;
  if (isPurchased) return true;
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

export interface ApiEpisode {
  id: number;
  title: string;
  slug?: string;
  overview?: string;
  episode_number: number;
  season_number: number;
  runtime_minutes?: number | null;
  air_date?: string;
  thumbnail_url?: string;
  poster_url?: string;
}

export interface ApiSeason {
  id: number;
  season_number: number;
  title?: string;
  overview?: string;
  poster_url?: string;
  air_date?: string;
  episodes_count: number;
  episodes: ApiEpisode[];
}

export interface ApiTvShow {
  id: number;
  slug: string;
  title: string;
  original_title?: string;
  overview?: string;
  poster_url?: string;
  backdrop_url?: string;
  thumbnail_url?: string;
  release_year?: number;
  quality?: string;
  age_rating?: string | null;
  rating?: { average: number | null; count: number };
  vote_average?: number | null;
  vote_count?: number;
  genres?: { id: number; name: string; slug?: string }[];
  people?: { id: number; name: string; slug?: string; profile_url?: string; role_type?: string; character_name?: string }[];
  seasons: ApiSeason[];
  seasons_count: number;
  episodes_count: number;
  access_type?: string;
  requires_purchase?: boolean;
  can_watch_public?: boolean;
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
  avatar_url?: string;
  role?: string;
  telegram_username?: string | null;
  preferred_locale?: string;
  is_active?: boolean;
  plan?: string;
  plan_expires_at?: string;
  balance?: number;
  credit_balance?: number;
  total_watched?: number;
  total_purchases?: number;
  member_since?: string;
  email_verified_at?: string;
  created_at?: string;
}

export interface ApiPublicSettings {
  site_name?: string;
  currency?: string;
  plans?: { id: string; label: string; price: number; features: string[] }[];
}

export interface ApiGenre {
  id: number;
  name: string;
  slug: string;
}

export interface ApiMovieFilters {
  genres: ApiGenre[];
  countries: { label: string; value: string }[];
  qualities: { label: string; value: string }[];
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
// Filter/genre data changes rarely — cache for 10 min. Movie lists cache for 2 min.
const CACHE_TTL_LONG  = 600_000; // 10 min  — filters, genres, countries
const CACHE_TTL_SHORT = 120_000; // 2 min   — movie lists, detail pages

function getCacheTtl(url: string): number {
  if (url.includes("/filters") || url.includes("/genres")) return CACHE_TTL_LONG;
  return CACHE_TTL_SHORT;
}

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
    if (hit && Date.now() - hit.ts < getCacheTtl(url)) return hit.data as T;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Authenticated server-side requests: never cache (user-specific).
  // Public server-side GETs: Next.js Data Cache with tiered TTLs.
  const nextRevalidate = url.includes("/sliders") || url.includes("/filters") || url.includes("/genres")
    ? 3600   // 1 hour — rarely-changing catalogue data
    : url.includes("/trending") || url.includes("/featured")
    ? 300    // 5 min — popularity scores update more often
    : 600;   // 10 min — standard movie lists
  const nextOptions: RequestInit = isGet && !isClient
    ? (token ? { cache: "no-store" } : { next: { revalidate: nextRevalidate } })
    : {};

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

export async function fetchMovieDetail(slug: string, token?: string): Promise<ApiMovie> {
  const url = token
    ? `${API.movies.detail(slug)}?include_state=true&include_playback=true`
    : API.movies.detail(slug);
  const data = await req<{ data: ApiMovie } | ApiMovie>(url, {}, token);
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
  await req(API.comments.reaction(commentId), { method: "POST", body: JSON.stringify({ type: reaction }) }, token);
}

export async function removeCommentReaction(commentId: number | string, token: string): Promise<void> {
  await req(API.comments.reaction(commentId), { method: "DELETE" }, token);
}

export async function replyComment(
  commentId: number | string,
  body: string,
  token: string,
): Promise<ApiComment> {
  const data = await req<{ data: ApiComment } | ApiComment>(
    API.comments.reply(commentId),
    { method: "POST", body: JSON.stringify({ body }) },
    token,
  );
  return (data as { data: ApiComment }).data ?? (data as ApiComment);
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

export async function fetchCreditBalance(token: string): Promise<{ balance: number; credits: number }> {
  const data = await req<{ data?: { balance?: number; credits?: number }; balance?: number; credits?: number }>(
    API.me.balance, {}, token,
  );
  const inner = (data as { data?: { balance?: number; credits?: number } }).data ?? data;
  return {
    balance: inner.balance ?? 0,
    credits: inner.credits ?? inner.balance ?? 0,
  };
}

export async function fetchMyPurchases(token: string): Promise<ApiPurchase[]> {
  const data = await req<{ data: ApiPurchase[] } | ApiPurchase[]>(API.me.purchases, {}, token);
  return Array.isArray(data) ? data : (data as { data: ApiPurchase[] }).data ?? [];
}

export async function uploadAvatar(file: File, token: string): Promise<ApiUser> {
  const form = new FormData();
  form.append("avatar", file);
  const res = await fetch(API.me.avatar, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: form,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d?.message ?? msg; } catch {}
    throw new ApiError(msg, res.status);
  }
  const data = await res.json() as { data: ApiUser } | ApiUser;
  return (data as { data: ApiUser }).data ?? (data as ApiUser);
}

export async function fetchWatchHistory(token: string): Promise<ApiWatchHistory[]> {
  const data = await req<{ data: ApiWatchHistory[] } | ApiWatchHistory[]>(API.me.watchHistory, {}, token);
  return Array.isArray(data) ? data : (data as { data: ApiWatchHistory[] }).data ?? [];
}

export async function preparePurchase(movieId: number | string, token: string): Promise<{ payment_url?: string; qr_data?: string }> {
  return req(API.movies.purchase(movieId), { method: "POST" }, token);
}

// ─── TV Shows ────────────────────────────────────────────────────────────────

export async function fetchTvShow(slug: string, token?: string): Promise<ApiTvShow> {
  const data = await req<{ data: ApiTvShow } | ApiTvShow>(API.tvShows.detail(slug), {}, token);
  return (data as { data: ApiTvShow }).data ?? (data as ApiTvShow);
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export async function fetchMovieFilters(): Promise<ApiMovieFilters> {
  const data = await req<{ data: ApiMovieFilters }>(API.filters);
  return data.data;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function fetchPublicSettings(): Promise<ApiPublicSettings> {
  const data = await req<{ data: ApiPublicSettings } | ApiPublicSettings>(API.settings.public);
  return (data as { data: ApiPublicSettings }).data ?? (data as ApiPublicSettings);
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface ApiPaymentCreate {
  payment_url?: string;
  qr_data?: string;
  transaction_id?: string;
}

export interface ApiPaymentStatus {
  transaction_id: string;
  status: "pending" | "success" | "failed" | "expired";
  amount?: number;
  currency?: string;
  paid_at?: string | null;
}

export async function createPaywayPayment(
  payload: Record<string, unknown>,
  token: string,
): Promise<ApiPaymentCreate> {
  const data = await req<{ data: ApiPaymentCreate } | ApiPaymentCreate>(
    API.payment.create,
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
  return (data as { data: ApiPaymentCreate }).data ?? (data as ApiPaymentCreate);
}

export async function createKhqrPayment(
  payload: Record<string, unknown>,
  token: string,
): Promise<ApiPaymentCreate> {
  const data = await req<{ data: ApiPaymentCreate } | ApiPaymentCreate>(
    API.payment.khqrCreate,
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
  return (data as { data: ApiPaymentCreate }).data ?? (data as ApiPaymentCreate);
}

export async function fetchPaymentStatus(
  transactionId: string,
  token: string,
): Promise<ApiPaymentStatus> {
  const data = await req<{ data: ApiPaymentStatus } | ApiPaymentStatus>(
    API.payment.status(transactionId),
    {},
    token,
  );
  return (data as { data: ApiPaymentStatus }).data ?? (data as ApiPaymentStatus);
}
