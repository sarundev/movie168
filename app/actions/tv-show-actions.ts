"use server";

import { serverApi } from "@/app/lib/server-api";

export type ActionResult<T = unknown> = {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
  errors?: unknown;
};

type ApiActionError = { status?: number; message?: string; errors?: Record<string, string[]> };

function isApiError(e: unknown): e is ApiActionError {
  return typeof e === "object" && e !== null;
}

export interface EpisodePlayerData {
  can_watch: boolean;
  requires_purchase: boolean;
  playback_session_token?: string;
  episode?: {
    id: number;
    title: string;
    episode_number: number;
    season_number: number;
    overview?: string;
    runtime_minutes?: number | null;
    poster_url?: string;
    backdrop_url?: string;
  };
  movie?: { id: number; title: string; slug: string };
}

export async function fetchEpisodePlayerAction(
  tvSlug: string,
  seasonNumber: number,
  episodeNumber: number,
): Promise<ActionResult<EpisodePlayerData>> {
  try {
    const data = await serverApi<{ data: EpisodePlayerData } | EpisodePlayerData>(
      `/tv-shows/${tvSlug}/seasons/${seasonNumber}/episodes/${episodeNumber}/player`,
      { withAuth: true },
    );
    const payload = (data as { data: EpisodePlayerData }).data ?? (data as EpisodePlayerData);
    return { ok: true, data: payload };
  } catch (error: unknown) {
    const e = isApiError(error) ? error : null;
    return {
      ok: false,
      status: e?.status,
      message: e?.message ?? "Could not load episode player.",
      errors: e?.errors,
    };
  }
}
