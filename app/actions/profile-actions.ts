"use server";

import { cookies } from "next/headers";
import { serverApi } from "@/app/lib/server-api";
import type { ApiUser, ApiPurchase, ApiWatchHistory } from "@/app/lib/api";

export type ActionResult<T = unknown> = {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
};
type ApiActionError = { status?: number; message?: string };
function toError(e: unknown): ApiActionError {
  return typeof e === "object" && e !== null ? (e as ApiActionError) : { message: String(e) };
}
export async function fetchProfileAction(): Promise<ActionResult<ApiUser>> {
  try {
    const raw = await serverApi<{ data: ApiUser } | ApiUser>("/me", { withAuth: true });
    const data = (raw as { data: ApiUser }).data ?? (raw as ApiUser);
    return { ok: true, data };
  } catch (e) {
    const err = toError(e);
    return { ok: false, status: err.status, message: err.message ?? "Could not load profile." };
  }
}
export async function fetchWatchHistoryAction(): Promise<ActionResult<ApiWatchHistory[]>> {
  try {
    const raw = await serverApi<{ data: ApiWatchHistory[] } | ApiWatchHistory[]>(
      "/me/watch-history",
      { withAuth: true },
    );
    const data = Array.isArray(raw) ? raw : (raw as { data: ApiWatchHistory[] }).data ?? [];
    return { ok: true, data };
  } catch (e) {
    const err = toError(e);
    return { ok: false, status: err.status, message: err.message ?? "Could not load watch history." };
  }
}
export async function fetchMyPurchasesAction(): Promise<ActionResult<ApiPurchase[]>> {
  try {
    const raw = await serverApi<{ data: ApiPurchase[] } | ApiPurchase[]>(
      "/me/purchases",
      { withAuth: true },
    );
    const data = Array.isArray(raw) ? raw : (raw as { data: ApiPurchase[] }).data ?? [];
    return { ok: true, data };
  } catch (e) {
    const err = toError(e);
    return { ok: false, status: err.status, message: err.message ?? "Could not load purchases." };
  }
}
export async function updatePasswordAction(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string,
): Promise<ActionResult> {
  try {
    const profile = await serverApi<{ data: { name: string } } | { name: string }>("/me", { withAuth: true });
    const name = (profile as { data: { name: string } }).data?.name ?? (profile as { name: string }).name;

    const data = await serverApi("/me/profile", {
      method: "PUT",
      withAuth: true,
      body: JSON.stringify({
        name,
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      }),
    });
    return { ok: true, message: (data as { message?: string }).message ?? "Password updated." };
  } catch (e) {
    const err = toError(e);
    return { ok: false, status: err.status, message: err.message ?? "Could not update password." };
  }
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult<{ avatar?: string; avatar_url?: string }>> {
  const store = await cookies();
  const token = store.get("auth_token")?.value;
  if (!token) return { ok: false, status: 401, message: "Not authenticated." };

  const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

  try {
    const res = await fetch(`${BASE}/api/me/profile/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: formData,
    });
    const json = await res.json().catch(() => ({})) as Record<string, unknown>;
    if (!res.ok) {
      return { ok: false, status: res.status, message: (json.message as string) ?? `HTTP ${res.status}` };
    }
    const inner = (json.data as { avatar?: string; avatar_url?: string } | undefined) ?? json as { avatar?: string; avatar_url?: string };
    return { ok: true, data: { avatar_url: inner.avatar_url, avatar: inner.avatar } };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
  }
}
