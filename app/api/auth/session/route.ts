import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "auth_token";
const USER_COOKIE  = "auth_user";
const MAX_AGE      = 60 * 60 * 24 * 30;

const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge:   MAX_AGE,
  path:     "/",
};

export async function GET() {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json(null);
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json(null);
  try {
    return NextResponse.json({ ...JSON.parse(raw), token: "__server__" });
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  const { token, user } = await req.json() as {
    token: string;
    user: { id?: number; name: string; email: string };
  };

  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, token, cookieOpts);
  res.cookies.set(USER_COOKIE, JSON.stringify({ id: user.id, name: user.name, email: user.email }), cookieOpts);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(TOKEN_COOKIE);
  res.cookies.delete(USER_COOKIE);
  return res;
}
