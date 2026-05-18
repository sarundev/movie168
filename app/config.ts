const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const R = `${BASE}/api`;

export const API = {
  auth: {
    login:    `${R}/auth/login`,
    register: `${R}/auth/register`,
    logout:   `${R}/auth/logout`,
  },

  movies: {
    list:     `${R}/movies`,
    featured: `${R}/movies/featured`,
    sliders:  `${R}/movies/sliders`,
    trending: `${R}/movies/trending`,
    detail:   (slug: string | number) => `${R}/movies/${slug}`,
    player:   (slug: string | number) => `${R}/movies/${slug}/player`,
    comments: (id:   string | number) => `${R}/movies/${id}/comments`,
    rating:   (id:   string | number) => `${R}/movies/${id}/rating`,
    purchase: (id:   string | number) => `${R}/movies/${id}/purchase/prepare`,
  },

  tvShows: {
    detail:        (slug: string) => `${R}/tv-shows/${slug}`,
    episodePlayer: (tvSlug: string, season: number, episode: number) =>
      `${R}/tv-shows/${tvSlug}/seasons/${season}/episodes/${episode}/player`,
  },

  comments: {
    reply:    (id: string | number) => `${R}/comments/${id}/reply`,
    reaction: (id: string | number) => `${R}/comments/${id}/reaction`,
  },

  me: {
    profile:      `${R}/me`,
    avatar:       `${R}/me/profile/avatar`,
    balance:      `${R}/me/balance`,
    purchases:    `${R}/me/purchases`,
    watchHistory: `${R}/me/watch-history`,
  },

  filters: `${R}/movie-filters`,

  settings: {
    public: `${R}/settings/public`,
  },

  payment: {
    create:     `${R}/payway/create-payment`,
    khqrCreate: `${R}/khqrpay/create-payment`,
    status:     (transactionId: string) => `${R}/payments/${transactionId}/status`,
    callback:   `${R}/payway/callback`,
  },

  reports: `${R}/reports`,
} as const;

export default BASE;
