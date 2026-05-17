"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/app/lib/server-api";

export type ActionResult<T = unknown> = {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
  errors?: unknown;
};

type ApiActionError = {
  status?: number;
  message?: string;
  errors?: Record<string, string[]>;
};

function isApiError(e: unknown): e is ApiActionError {
  return typeof e === "object" && e !== null;
}

function extractMessage(error: unknown, fallback: string): string {
  if (!isApiError(error)) return fallback;
  const errs = error.errors ?? {};
  return (
    Object.values(errs).flat()[0] ??
    error.message ??
    fallback
  );
}

// ─── Movie purchase ───────────────────────────────────────────────────────────

export async function preparePurchaseKhqrAction(
  movieSlug: string,
): Promise<ActionResult<{ payment_url?: string; transaction_id?: string; payment_id?: number; amount?: number; currency?: string }>> {
  try {
    const data = await serverApi(`/movies/${encodeURIComponent(movieSlug)}/pay-khqr`, {
      method: "POST",
      withAuth: true,
    });
    revalidatePath(`/movie/${movieSlug}`);
    return { ok: true, data };
  } catch (error) {
    const e = isApiError(error) ? error : null;
    return { ok: false, status: e?.status, message: extractMessage(error, "Could not create KHQR payment."), errors: e?.errors };
  }
}

export async function purchaseWithBalanceAction(
  movieSlug: string,
): Promise<ActionResult> {
  try {
    const data = await serverApi(`/movies/${encodeURIComponent(movieSlug)}/purchase-with-balance`, {
      method: "POST",
      withAuth: true,
    });
    revalidatePath(`/movie/${movieSlug}`);
    return { ok: true, message: (data as { message?: string }).message ?? "Movie unlocked!", data };
  } catch (error) {
    const e = isApiError(error) ? error : null;
    return { ok: false, status: e?.status, message: extractMessage(error, "Could not purchase with balance."), errors: e?.errors };
  }
}

// ─── Credits ──────────────────────────────────────────────────────────────────

export async function getCreditBalanceAction(): Promise<ActionResult<{ balance?: number; credits?: number }>> {
  try {
    const data = await serverApi("/me/balance", { withAuth: true });
    return { ok: true, data };
  } catch (error) {
    const e = isApiError(error) ? error : null;
    return { ok: false, status: e?.status, message: extractMessage(error, "Could not load balance."), errors: e?.errors };
  }
}

export async function createCreditTopUpAction(
  credits: number,
): Promise<ActionResult<{ payment_url?: string; transaction_id?: string; payment_id?: number; amount?: number; currency?: string }>> {
  try {
    const data = await serverApi("/me/credits/pay-khqr", {
      method: "POST",
      withAuth: true,
      body: JSON.stringify({ credits }),
    });
    return { ok: true, data };
  } catch (error) {
    const e = isApiError(error) ? error : null;
    return { ok: false, status: e?.status, message: extractMessage(error, "Could not create top-up payment."), errors: e?.errors };
  }
}

// ─── Payment status polling ───────────────────────────────────────────────────

export async function checkPaymentStatusAction(
  transactionId: string,
): Promise<ActionResult<{ status?: string; paid_at?: string | null }>> {
  try {
    const data = await serverApi(`/payments/${transactionId}/status`, { withAuth: true });
    return { ok: true, data };
  } catch (error) {
    const e = isApiError(error) ? error : null;
    return { ok: false, status: e?.status, message: extractMessage(error, "Could not check payment status."), errors: e?.errors };
  }
}

// ─── Ratings & comments ───────────────────────────────────────────────────────

export async function submitRatingAction(
  movieId: number,
  movieSlug: string,
  rating: number,
): Promise<ActionResult> {
  try {
    const data = await serverApi(`/movies/${movieId}/rating`, {
      method: "POST",
      withAuth: true,
      body: JSON.stringify({ rating }),
    });
    revalidatePath(`/movie/${movieSlug}`);
    return { ok: true, message: (data as { message?: string }).message ?? "Rating submitted.", data };
  } catch (error) {
    const e = isApiError(error) ? error : null;
    return { ok: false, status: e?.status, message: extractMessage(error, "Failed to submit rating."), errors: e?.errors };
  }
}

export async function submitCommentAction(
  movieId: number,
  movieSlug: string,
  body: string,
  parentId?: number | null,
): Promise<ActionResult> {
  try {
    const data = await serverApi(`/movies/${movieId}/comments`, {
      method: "POST",
      withAuth: true,
      body: JSON.stringify({ body, parent_id: parentId ?? null }),
    });
    revalidatePath(`/movie/${movieSlug}`);
    return { ok: true, data };
  } catch (error) {
    const e = isApiError(error) ? error : null;
    return { ok: false, status: e?.status, message: extractMessage(error, "Failed to submit comment."), errors: e?.errors };
  }
}

export async function reactCommentAction(
  commentId: number,
  movieSlug: string,
  type: "like" | "dislike",
): Promise<ActionResult> {
  try {
    const data = await serverApi(`/comments/${commentId}/reaction`, {
      method: "POST",
      withAuth: true,
      body: JSON.stringify({ type }),
    });
    revalidatePath(`/movie/${movieSlug}`);
    return { ok: true, data };
  } catch (error) {
    const e = isApiError(error) ? error : null;
    return { ok: false, status: e?.status, message: extractMessage(error, "Could not react to comment."), errors: e?.errors };
  }
}

export async function removeCommentReactionAction(
  commentId: number,
  movieSlug: string,
): Promise<ActionResult> {
  try {
    const data = await serverApi(`/comments/${commentId}/reaction`, {
      method: "DELETE",
      withAuth: true,
    });
    revalidatePath(`/movie/${movieSlug}`);
    return { ok: true, data };
  } catch (error) {
    const e = isApiError(error) ? error : null;
    return { ok: false, status: e?.status, message: extractMessage(error, "Could not remove reaction."), errors: e?.errors };
  }
}
