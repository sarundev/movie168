import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

const cookieOpts = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

const readableCookieOpts = {
  ...cookieOpts,
  httpOnly: false as const,
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/?auth_error=Missing Google login code", request.url)
    );
  }

  try {
    const res = await fetch(`${API_URL}/auth/google/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data?.token) {
      return NextResponse.redirect(
        new URL(
          `/?auth_error=${encodeURIComponent(data?.message ?? "Google login failed")}`,
          request.url
        )
      );
    }

    const response = NextResponse.redirect(new URL("/", request.url));

    response.cookies.set("access_token", data.token, cookieOpts);
    response.cookies.set("auth_user", JSON.stringify(data.user), readableCookieOpts);
    response.cookies.set("auth_device", JSON.stringify(data.device), readableCookieOpts);

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/?auth_error=Google login failed", request.url)
    );
  }
}
