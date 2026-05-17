import { cookies } from "next/headers";

export interface ServerUser {
  id?: number;
  name: string;
  email: string;
  token: string;
}

export async function getServerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("auth_token")?.value ?? null;
}

export async function getServerUser(): Promise<ServerUser | null> {
  const store = await cookies();
  const token = store.get("auth_token")?.value;
  if (!token) return null;
  const raw = store.get("auth_user")?.value;
  if (!raw) return { name: "", email: "", token };
  try {
    return { ...JSON.parse(raw), token };
  } catch {
    return { name: "", email: "", token };
  }
}
