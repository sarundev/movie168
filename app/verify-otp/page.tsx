"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyLoginCodeAction, resendLoginCodeAction } from "../actions/auth-actions";
import { useAuth } from "../context/AuthContext";

function VerifyOtpForm() {
  const params        = useSearchParams();
  const challengeToken = params.get("challenge") ?? "";
  const email          = params.get("email") ?? "";
  const nextUrl        = params.get("next") ?? "/";

  const { syncFromCookie } = useAuth();

  const [code,      setCode]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 4) { setError("សូមបញ្ចូលលេខកូដ"); return; }
    setLoading(true);
    setError(null);

    const res = await verifyLoginCodeAction({ challenge_token: challengeToken, otp: code });
    setLoading(false);

    if (!res.ok) {
      setError(res.message ?? "លេខកូដមិនត្រឹមត្រូវ");
      return;
    }

    syncFromCookie();
    window.location.href = nextUrl;
  }

  async function handleResend() {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);
    const res = await resendLoginCodeAction(challengeToken);
    setResending(false);
    if (res.ok) {
      setSuccess(res.message ?? "លេខកូដថ្មីត្រូវបានផ្ញើ");
      setCountdown(60);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(res.message ?? "មិនអាចផ្ញើម្ដងទៀតបាន");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#0d0d12" }}>
      <a href="/" className="flex items-center gap-2 mb-10">
        <span className="font-black text-2xl tracking-widest" style={{ color: "#e8c84a" }}>168</span>
        <span className="font-black text-2xl tracking-widest text-green-500">KH</span>
      </a>

      <div className="w-full max-w-sm rounded-2xl p-7"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 16px 64px rgba(0,0,0,0.6)" }}>

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5 mx-auto"
          style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.25)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>

        <h1 className="text-xl font-black mb-1 text-center" style={{ color: "#f0f0f0" }}>បញ្ជាក់អ៊ីម៉ែល</h1>
        <p className="text-sm mb-6 text-center" style={{ color: "#555" }}>
          យើងបានផ្ញើលេខកូដទៅ{" "}
          <span className="font-semibold" style={{ color: "#bbb" }}>{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>
              លេខកូដបញ្ជាក់
            </label>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              required
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-center tracking-widest font-bold"
              style={{
                background:  "rgba(255,255,255,0.05)",
                border:      "1.5px solid rgba(255,255,255,0.09)",
                color:       "#f0f0f0",
                caretColor:  "#c9a835",
                fontSize:    "1.2rem",
                letterSpacing: "0.3em",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,53,0.5)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-xs" style={{ color: "#ef4444" }}>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="text-xs" style={{ color: "#22c55e" }}>{success}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all"
            style={{
              background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(90deg,#c9a835,#8b6914)",
              color:      loading ? "#444" : "#0d0d12",
              boxShadow:  loading ? "none" : "0 4px 20px rgba(201,168,53,0.35)",
              cursor:     loading ? "not-allowed" : "pointer",
            }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                កំពុងផ្ទៀងផ្ទាត់...
              </span>
            ) : "បញ្ជាក់"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="text-sm transition-colors"
            style={{ color: countdown > 0 ? "#444" : "#c9a835", cursor: countdown > 0 ? "default" : "pointer" }}>
            {resending ? "កំពុងផ្ញើ..." : countdown > 0 ? `ផ្ញើម្ដងទៀត (${countdown}s)` : "ផ្ញើលេខកូដម្ដងទៀត"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <a href="/login" className="text-xs hover:underline" style={{ color: "#555" }}>
            ← ត្រឡប់ចូលគណនី
          </a>
        </div>
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: "#444" }}>
        © 2026 168KH · ការប្រើប្រាស់ស្ថិតក្រោមការការពារ
      </p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
