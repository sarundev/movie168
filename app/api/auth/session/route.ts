import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE = "auth_token";
const USER_COOKIE  = "auth_user";
const MAX_AGE      = 60 * 60 * 24 * 30; // 30 days

const cookieOpts = (httpOnly: boolean) => ({
  httpOnly,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge:   MAX_AGE,
  path:     "/",
});

export async function POST(req: NextRequest) {
  const { token, user } = await req.json() as {
    token: string;
    user: { id?: number; name: string; email: string };
  };

  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, token, cookieOpts(true));
  res.cookies.set(USER_COOKIE,  JSON.stringify({ id: user.id, name: user.name, email: user.email }), cookieOpts(false));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(TOKEN_COOKIE);
  res.cookies.delete(USER_COOKIE);
  return res;
}
