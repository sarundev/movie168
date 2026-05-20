"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { loginAction, verifyLoginCodeAction } from "../actions/auth-actions";

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
  const raw = [navigator.userAgent, navigator.language, screen.width, screen.height, new Date().getTimezoneOffset()].join("|");
  let h = 5381;
  for (let i = 0; i < raw.length; i++) h = (h * 33) ^ raw.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, "0") + "-device-fingerprint";
}

export default function LoginForm() {
  const { refreshUser } = useAuth();
  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [otp,            setOtp]            = useState("");
  const [showPw,         setShowPw]         = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [requiresOtp,    setRequiresOtp]    = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(data => {
      if (data) window.location.href = new URLSearchParams(window.location.search).get("redirect") ?? "/";
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (requiresOtp && challengeToken) {
      const res = await verifyLoginCodeAction({ challenge_token: challengeToken, otp });
      if (!res.ok) { setError(res.message ?? "លេខកូដមិនត្រឹមត្រូវ ឬផុតកំណត់"); setLoading(false); return; }
      await refreshUser();
      window.location.href = new URLSearchParams(window.location.search).get("redirect") ?? "/";
      return;
    }

    const res = await loginAction({ email, password, device_name: getDeviceName(), device_fingerprint: getDeviceFingerprint() });
    if (!res.ok) { setError(res.message ?? "ចូលគណនីមិនបានសំរេច"); setLoading(false); return; }
    if (res.data?.requires_otp) { setChallengeToken(res.data.challenge_token ?? null); setRequiresOtp(true); setLoading(false); return; }
    await refreshUser();
    window.location.href = new URLSearchParams(window.location.search).get("redirect") ?? "/";
  }

  function handleGoogleLogin() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const redirect = new URLSearchParams(window.location.search).get("redirect") ?? "/";
    window.location.href = `${apiUrl}/api/auth/google/redirect?redirect=${encodeURIComponent(redirect)}`;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#0d0d12" }}>
      <Link href="/" className="flex items-center gap-2 mb-10">
        <span className="font-black text-2xl tracking-widest" style={{ color: "#e8c84a" }}>168</span>
        <span className="font-black text-2xl tracking-widest text-green-500">KH</span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl p-7"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 16px 64px rgba(0,0,0,0.6)" }}>
        <h1 className="text-xl font-black mb-1" style={{ color: "#f0f0f0" }}>ចូលគណនី</h1>
        <p className="text-sm mb-6" style={{ color: "#555" }}>
          មិនទាន់មានគណនី?{" "}
          <a href="/register" style={{ color: "#c9a835" }} className="font-semibold hover:underline">ចុះឈ្មោះ</a>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>អ៊ីម៉ែល</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#555" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.09)", color: "#f0f0f0", caretColor: "#c9a835" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,53,0.5)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold" style={{ color: "#888" }}>ពាក្យសម្ងាត់</label>
              <a href="/forgot-password" className="text-xs hover:underline" style={{ color: "#666" }}>ភ្លេចពាក្យសម្ងាត់?</a>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#555" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input type={showPw ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.09)", color: "#f0f0f0", caretColor: "#c9a835" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,53,0.5)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#555" }}>
                {showPw ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {requiresOtp && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg mb-3"
                style={{ background: "rgba(201,168,53,0.08)", border: "1px solid rgba(201,168,53,0.25)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <span className="text-xs" style={{ color: "#c9a835" }}>លេខកូដត្រូវបានផ្ញើទៅអ៊ីម៉ែលរបស់អ្នក</span>
              </div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>លេខកូដបញ្ជាក់</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={8} required autoFocus placeholder="123456"
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-center tracking-widest font-bold"
                style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.09)", color: "#f0f0f0", caretColor: "#c9a835", fontSize: "1.1rem", letterSpacing: "0.25em" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,53,0.5)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-xs" style={{ color: "#ef4444" }}>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all mt-1"
            style={{ background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(90deg,#c9a835,#8b6914)", color: loading ? "#444" : "#0d0d12", boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,53,0.35)", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                កំពុងចូល...
              </span>
            ) : requiresOtp ? "បញ្ជាក់លេខកូដ" : "ចូលគណនី"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <span className="text-xs" style={{ color: "#444" }}>ឬ</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>

        <button type="button" onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 mb-3"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          ចូលដោយ Google
        </button>

        <Link href="/" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#777" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          ត្រឡប់ទំព័រដើម
        </Link>
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: "#444" }}>© 2026 168KH · ការប្រើប្រាស់ស្ថិតក្រោមការការពារ</p>
    </div>
  );
}
