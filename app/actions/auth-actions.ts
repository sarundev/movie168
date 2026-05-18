"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { serverApi } from "@/app/lib/server-api";

export type ActionResult<T = unknown> = {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
  errors?: Record<string, string[]> | null;
};

type ApiActionError = { status?: number; message?: string; errors?: Record<string, string[]> }

type AuthPayload = {
  token?: string;
  access_token?: string;
  user?: { id: number; name: string; email: string };
};

function isApiError(e: unknown): e is ApiActionError {
  return typeof e === "object" && e !== null;
}

function toApiActionError(e: unknown): ApiActionError {
  if (isApiError(e)) return e;
  return { message: String(e) };
}

function extractMessage(error: unknown, fallback: string): string {
  if (!isApiError(error)) return fallback;
  return Object.values(error.errors ?? {}).flat()[0] ?? error.message ?? fallback;
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

async function setAuthCookies(token: string, user: { id?: number; name: string; email: string }) {
  const store = await cookies();
  store.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  store.set("auth_user", JSON.stringify({ id: user.id, name: user.name, email: user.email }), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(payload: {
  email: string;
  password: string;
  device_name?: string;
  device_fingerprint?: string;
}): Promise<ActionResult<{
  requires_otp?: boolean;
  challenge_token?: string;
  user?: { id: number; name: string; email: string };
}>> {
  try {
    console.log("[loginAction] payload:", { email: payload.email, device_name: payload.device_name });

    const data = await serverApi<AuthPayload & {
      requires_otp?: boolean;
      challenge_token?: string;
      email?: string;
      expires_in_seconds?: number;
      message?: string;
    }>("/auth/login", {
      method: "POST",
      withAuth: false,
      body: JSON.stringify(payload),
    });

    console.log("[loginAction] response:", JSON.stringify(data, null, 2));

    const token = data.token ?? data.access_token;
    if (token && data.user) {
      console.log("[loginAction] login successful, user:", data.user.email);
      await setAuthCookies(token, data.user);
      revalidatePath("/");
      return { ok: true, message: data.message ?? "Login successful.", data: { user: data.user } };
    }

    if (data.requires_otp) {
      console.log("[loginAction] OTP required — challenge_token:", data.challenge_token);
      return { ok: true, message: "A login code has been sent to your email.", data: { requires_otp: true, challenge_token: data.challenge_token } };
    }

    console.warn("[loginAction] no token or user in response — keys:", Object.keys(data));
    return { ok: false, message: data.message ?? "Login failed." };
  } catch (error: unknown) {
    console.error("[loginAction] error:", error);
    const apiError = toApiActionError(error);

    return {
      ok: false,
      status: apiError.status,
      message: extractMessage(error, "Login failed."),
      errors: apiError.errors ?? null,
    };
  }
}

// ─── OTP verification ─────────────────────────────────────────────────────────

export async function verifyLoginCodeAction(payload: {
  challenge_token: string;
  otp: string;
}): Promise<ActionResult> {
  try {
    const data = await serverApi<AuthPayload & { message?: string }>(
      "/auth/login/verify-code",
      {
        method: "POST",
        withAuth: false,
        body: JSON.stringify(payload),
      }
    );

    const token = data.token ?? data.access_token;
    if (token && data.user) {
      await setAuthCookies(token, data.user);
    }

    revalidatePath("/");

    return {
      ok: true,
      message: data.message ?? "Login successful.",
      data,
    };
  } catch (error: unknown) {
    const apiError = toApiActionError(error);

    return {
      ok: false,
      status: apiError.status,
      message: apiError.message ?? "Login code verification failed.",
      errors: apiError.errors ?? null,
    };
  }
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export async function resendLoginCodeAction(
  challengeToken: string,
): Promise<ActionResult> {
  try {
    const data = await serverApi<{ message?: string }>("/auth/login/resend-code", {
      method: "POST",
      withAuth: false,
      body: JSON.stringify({ challenge_token: challengeToken }),
    });

    return {
      ok: true,
      message: data.message ?? "A new login code has been sent.",
      data,
    };
  } catch (error: unknown) {
    const apiError = toApiActionError(error);
    return {
      ok: false,
      status: apiError.status,
      message: apiError.message ?? "Could not resend login code.",
      errors: apiError.errors ?? null,
    };
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(payload: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
  device_fingerprint?: string;
}): Promise<ActionResult<{
  requires_otp?: boolean;
  challenge_token?: string;
  email?: string;
  expires_in_seconds?: number;
  user?: { id: number; name: string; email: string };
}>> {
  try {
    console.log("[registerAction] payload:", { name: payload.name, email: payload.email, device_name: payload.device_name });

    const data = await serverApi<{
      token?: string;
      access_token?: string;
      user?: { id: number; name: string; email: string };
      message?: string;
      requires_otp?: boolean;
      challenge_token?: string;
      email?: string;
      expires_in_seconds?: number;
    }>("/auth/register", {
      method: "POST",
      withAuth: false,
      body: JSON.stringify(payload),
    });

    console.log("[registerAction] response:", JSON.stringify(data, null, 2));

    // If backend returns token directly (no OTP required)
    const token = data.token ?? data.access_token;
    if (token && data.user) {
      console.log("[registerAction] token received — logged in as:", data.user.email);
      await setAuthCookies(token, data.user);
      revalidatePath("/");
      return { ok: true, message: data.message ?? "Registration successful.", data: { user: data.user } };
    }

    if (data.requires_otp && data.challenge_token) {
      console.log("[registerAction] OTP required — challenge_token:", data.challenge_token);
    } else {
      console.warn("[registerAction] unexpected response — no token and no OTP challenge. Keys:", Object.keys(data));
    }

    return {
      ok: true,
      message: data.message ?? "Registration code sent to your email.",
      data: {
        requires_otp: data.requires_otp,
        challenge_token: data.challenge_token,
        email: data.email,
        expires_in_seconds: data.expires_in_seconds,
      },
    };
  } catch (error: unknown) {
    console.error("[registerAction] error:", error);
    const apiError = toApiActionError(error);
    return {
      ok: false,
      status: apiError.status,
      message: extractMessage(error, "Registration failed."),
      errors: apiError.errors ?? null,
    };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<ActionResult> {
  try {
    await serverApi("/auth/logout", {
      method: "POST",
      withAuth: true,
    });
  } catch {
    // Still clear cookies even if backend token is already expired.
  }

  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("auth_user");

  revalidatePath("/");

  return { ok: true, message: "Logout successful." };
}
