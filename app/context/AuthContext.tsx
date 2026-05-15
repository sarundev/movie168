"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API } from "../config";

const STORAGE_KEY = "auth_user";

/* Build a stable device name + fingerprint from browser info */
function getDeviceName(): string {
  if (typeof navigator === "undefined") return "Unknown Device";
  const ua = navigator.userAgent;
  const browser =
    /Chrome/.test(ua) && !/Edg/.test(ua) ? "Chrome"
    : /Firefox/.test(ua) ? "Firefox"
    : /Safari/.test(ua) && !/Chrome/.test(ua) ? "Safari"
    : /Edg/.test(ua) ? "Edge"
    : "Browser";
  const os =
    /iPhone|iPad/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
    : /Mac/.test(ua) ? "MacBook"
    : /Win/.test(ua) ? "Windows"
    : /Linux/.test(ua) ? "Linux"
    : "Device";
  return `${browser} on ${os}`;
}

function getDeviceFingerprint(): string {
  if (typeof navigator === "undefined") return "unknown-device";
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("|");
  /* simple djb2 hash → hex string (no crypto API needed) */
  let h = 5381;
  for (let i = 0; i < raw.length; i++) h = (h * 33) ^ raw.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, "0") + "-device-fingerprint";
}

export interface AuthUser {
  id?: number;
  name: string;
  email: string;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  /* restore session on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.auth.login, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body:    JSON.stringify({
          email,
          password,
          device_name:        getDeviceName(),
          device_fingerprint: getDeviceFingerprint(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "ចូលគណនីមិនបានសำរេច");
      const authUser: AuthUser = {
        id:    data.user?.id,
        name:  data.user?.name  ?? email.split("@")[0],
        email: data.user?.email ?? email,
        token: data.token ?? data.access_token ?? "",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ចូលគណនីមិនបានសំរេច");
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, passwordConfirmation: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.auth.register, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body:    JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          device_name:           getDeviceName(),
          device_fingerprint:    getDeviceFingerprint(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "ចុះឈ្មោះមិនបានសំរេច");
      const authUser: AuthUser = {
        id:    data.user?.id,
        name:  data.user?.name  ?? name,
        email: data.user?.email ?? email,
        token: data.token ?? data.access_token ?? "",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ចុះឈ្មោះមិនបានសំរេច");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.token) {
        await fetch(API.auth.logout, {
          method:  "POST",
          headers: {
            Authorization:  `Bearer ${user.token}`,
            Accept:         "application/json",
            "Content-Type": "application/json",
          },
        });
      }
    } catch {}
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setLoading(false);
    window.location.href = "/";
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
