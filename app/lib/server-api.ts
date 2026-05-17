import { cookies } from "next/headers";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

interface ServerApiOptions {
  method?: string;
  body?: string;
  withAuth?: boolean;
  headers?: Record<string, string>;
}

export async function serverApi<T = Record<string, unknown>>(
  path: string,
  options: ServerApiOptions = {},
): Promise<T> {
  const url = `${BASE}/api${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (options.withAuth) {
    const store = await cookies();
    const token = store.get("auth_token")?.value;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body,
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: { status?: number; message?: string; errors?: unknown } = {
      status: res.status,
      message: (json as { message?: string }).message ?? `HTTP ${res.status}`,
      errors: (json as { errors?: unknown }).errors,
    };
    throw err;
  }

  return json as T;
}
