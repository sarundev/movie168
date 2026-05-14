"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ─── Plans ──────────────────────────────────────────── */
const PLANS = [
  { id: "1m",  label: "1 ខែ",   price: 3,  usd: "$3",  khr: "12,000 ៛", popular: false, features: ["HD 1080p", "រឿងទាំងអស់", "1 ឧបករណ៍"] },
  { id: "3m",  label: "3 ខែ",   price: 8,  usd: "$8",  khr: "32,000 ៛", popular: true,  features: ["4K Ultra HD", "រឿងទាំងអស់", "2 ឧបករណ៍", "គ្មានការផ្សាយ"] },
  { id: "12m", label: "12 ខែ",  price: 25, usd: "$25", khr: "100,000 ៛", popular: false, features: ["4K Ultra HD", "រឿងទាំងអស់", "4 ឧបករណ៍", "គ្មានការផ្សាយ", "ទាញយកបានក្រៅបណ្ដាញ"] },
];

const PAYMENT_METHODS = [
  { id: "khqr", label: "KHQR",      icon: "khqr" },
  { id: "aba",  label: "ABA Bank",  icon: "aba"  },
  { id: "acleda", label: "ACLEDA", icon: "acleda" },
];

const QR_IMG = "https://khdiamond.net/wp-content/uploads/2026/05/khqr-sample.png";
const TIMER_SECS = 300;

/* ─── Helpers ────────────────────────────────────────── */
function fmtTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

/* ─── Step indicator ─────────────────────────────────── */
function Steps({ step }: { step: number }) {
  const labels = ["ជ្រើសរើសគម្រោង", "វិធីបង់ប្រាក់", "ស្កេន QR", "បញ្ជាក់"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {labels.map((label, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all"
                style={{
                  background: done ? "#c9a835" : active ? "rgba(201,168,53,0.15)" : "rgba(255,255,255,0.06)",
                  border: active ? "2px solid #c9a835" : done ? "2px solid #c9a835" : "2px solid rgba(255,255,255,0.1)",
                  color: done ? "#0d0d12" : active ? "#c9a835" : "#555",
                }}
              >
                {done
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : idx}
              </div>
              <span className="text-[10px] mt-1 whitespace-nowrap hidden sm:block"
                style={{ color: active ? "#c9a835" : done ? "#888" : "#444" }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className="w-10 sm:w-16 h-px mx-1 mb-4 sm:mb-0"
                style={{ background: done ? "#c9a835" : "rgba(255,255,255,0.08)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function DepositPage() {
  const [step, setStep]         = useState(1);
  const [plan, setPlan]         = useState("3m");
  const [method, setMethod]     = useState("khqr");
  const [timer, setTimer]       = useState(TIMER_SECS);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied]     = useState(false);
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  /* countdown only on step 3 */
  useEffect(() => {
    if (step === 3) {
      setTimer(TIMER_SECS);
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) { clearInterval(intervalRef.current!); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [step]);

  const selectedPlan = PLANS.find((p) => p.id === plan)!;

  function copyAmount() {
    navigator.clipboard.writeText(selectedPlan.price.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── Step 1: Choose plan ── */
  const Step1 = (
    <div>
      <h2 className="text-lg font-black mb-6 text-center" style={{ color: "#f0f0f0" }}>ជ្រើសរើសគម្រោងសមាជិកភាព</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className="relative rounded-2xl p-5 text-left transition-all"
            style={{
              background: plan === p.id ? "rgba(201,168,53,0.1)" : "rgba(255,255,255,0.03)",
              border: plan === p.id ? "2px solid #c9a835" : "2px solid rgba(255,255,255,0.07)",
              boxShadow: plan === p.id ? "0 0 24px rgba(201,168,53,0.12)" : "none",
            }}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12" }}>
                ពេញនិយម
              </span>
            )}
            <p className="text-base font-black mb-1" style={{ color: plan === p.id ? "#c9a835" : "#f0f0f0" }}>{p.label}</p>
            <p className="text-2xl font-black" style={{ color: "#c9a835" }}>{p.usd}</p>
            <p className="text-xs mb-4" style={{ color: "#555" }}>{p.khr}</p>
            <ul className="flex flex-col gap-1.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "#aaa" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <button onClick={() => setStep(2)}
        className="w-full py-3.5 rounded-xl font-black text-sm tracking-wider transition-all"
        style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.3)" }}>
        បន្ត →
      </button>
    </div>
  );

  /* ── Step 2: Payment method ── */
  const Step2 = (
    <div>
      <h2 className="text-lg font-black mb-2 text-center" style={{ color: "#f0f0f0" }}>ជ្រើសរើសវិធីបង់ប្រាក់</h2>
      <p className="text-center text-sm mb-6" style={{ color: "#666" }}>
        គម្រោង <span style={{ color: "#c9a835" }}>{selectedPlan.label}</span> — {selectedPlan.usd}
      </p>
      <div className="flex flex-col gap-3 mb-8">
        {PAYMENT_METHODS.map((m) => (
          <button key={m.id} onClick={() => setMethod(m.id)}
            className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all"
            style={{
              background: method === m.id ? "rgba(201,168,53,0.1)" : "rgba(255,255,255,0.03)",
              border: method === m.id ? "2px solid #c9a835" : "2px solid rgba(255,255,255,0.07)",
            }}>
            {/* Icon placeholder */}
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
              style={{ background: m.id === "khqr" ? "#c0392b" : m.id === "aba" ? "#1a3c6e" : "#1a6e3c", color: "white" }}>
              {m.id === "khqr" ? "KH" : m.id === "aba" ? "ABA" : "ACL"}
            </div>
            <span className="flex-1 font-semibold text-sm" style={{ color: "#ddd" }}>{m.label}</span>
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: method === m.id ? "#c9a835" : "#444" }}>
              {method === m.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#c9a835" }} />}
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep(1)}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888" }}>
          ← ត្រឡប់
        </button>
        <button onClick={() => setStep(3)}
          className="flex-1 py-3.5 rounded-xl font-black text-sm transition-all"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.3)" }}>
          បន្ត →
        </button>
      </div>
    </div>
  );

  /* ── Step 3: QR scan ── */
  const Step3 = (
    <div>
      <h2 className="text-lg font-black mb-1 text-center" style={{ color: "#f0f0f0" }}>ស្កេន QR Code ដើម្បីបង់ប្រាក់</h2>
      <p className="text-center text-sm mb-6" style={{ color: "#666" }}>
        សូមបង់ <span className="font-black" style={{ color: "#c9a835" }}>{selectedPlan.usd} ({selectedPlan.khr})</span> តាម KHQR
      </p>

      {/* Amount chip */}
      <div className="flex justify-center mb-5">
        <button onClick={copyAmount}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all"
          style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.3)", color: "#c9a835" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          {copied ? "បានចម្លង!" : `ចម្លងចំនួន ${selectedPlan.usd}`}
        </button>
      </div>

      {/* QR card */}
      <div className="flex justify-center mb-6">
        <div className="rounded-2xl overflow-hidden p-4"
          style={{ background: "white", width: 220, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
          {/* KHQR header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full" style={{ background: "#c0392b" }} />
              <span className="font-black text-sm" style={{ color: "#c0392b" }}>KHQR</span>
            </div>
            <span className="text-[10px] font-semibold" style={{ color: "#444" }}>KhDiamondD</span>
          </div>
          {/* QR code */}
          <div className="flex items-center justify-center rounded-xl overflow-hidden"
            style={{ background: "#f5f5f5", width: "100%", aspectRatio: "1/1" }}>
            <img
              src={QR_IMG}
              alt="KHQR"
              className="w-full h-full object-contain"
              onError={(e) => {
                const el = e.currentTarget.parentElement!;
                el.innerHTML = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill="#ccc"/><rect x="16" y="5" width="3" height="3" fill="#ccc"/><rect x="16" y="16" width="3" height="3" fill="#ccc"/><rect x="5" y="16" width="3" height="3" fill="#ccc"/></svg>`;
              }}
            />
          </div>
          <p className="text-center text-xs mt-2 font-semibold" style={{ color: "#888" }}>USD · {selectedPlan.usd}</p>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={timer < 60 ? "#ef4444" : "#c9a835"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span className="text-sm font-black tabular-nums" style={{ color: timer < 60 ? "#ef4444" : "#c9a835" }}>
          {timer > 0 ? fmtTime(timer) : "ផុតកំណត់"}
        </span>
        <span className="text-xs" style={{ color: "#555" }}>នាទីនៃការផុតកំណត់</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${(timer / TIMER_SECS) * 100}%`,
            background: timer < 60 ? "#ef4444" : "linear-gradient(90deg,#c9a835,#8b6914)",
          }} />
      </div>

      <p className="text-center text-xs mb-6" style={{ color: "#555" }}>
        បន្ទាប់ពីស្កេន QR រួច សូមចុចប៊ូតុងខាងក្រោម ដើម្បីបញ្ជាក់ការបង់ប្រាក់
      </p>

      <div className="flex gap-3">
        <button onClick={() => setStep(2)}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888" }}>
          ← ត្រឡប់
        </button>
        <button onClick={() => setStep(4)}
          disabled={timer === 0}
          className="flex-1 py-3.5 rounded-xl font-black text-sm transition-all"
          style={{
            background: timer === 0 ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg,#c9a835,#8b6914)",
            color: timer === 0 ? "#555" : "#0d0d12",
            boxShadow: timer === 0 ? "none" : "0 4px 20px rgba(201,168,53,0.3)",
            cursor: timer === 0 ? "not-allowed" : "pointer",
          }}>
          ខ្ញុំបានបង់ប្រាក់រួច ✓
        </button>
      </div>
    </div>
  );

  /* ── Step 4: Confirmation ── */
  const Step4 = (
    <div className="flex flex-col items-center py-6">
      {/* Success ring */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "3px solid rgba(34,197,94,0.4)",
            boxShadow: "0 0 40px rgba(34,197,94,0.2)",
          }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ border: "3px solid #22c55e" }} />
      </div>

      <h2 className="text-xl font-black mb-2" style={{ color: "#f0f0f0" }}>កំពុងផ្ទៀងផ្ទាត់</h2>
      <p className="text-sm text-center mb-6" style={{ color: "#666" }}>
        យើងបានទទួលការស្នើសុំរបស់អ្នក<br />
        VIP <span style={{ color: "#c9a835" }}>{selectedPlan.label}</span> នឹងដំណើរការក្នុង 1–15 នាទី
      </p>

      {/* Summary card */}
      <div className="w-full rounded-2xl p-5 mb-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          ["គម្រោង", `${selectedPlan.label} (${selectedPlan.usd})`],
          ["វិធីបង់ប្រាក់", PAYMENT_METHODS.find(m => m.id === method)?.label ?? ""],
          ["ស្ថានភាព", "កំពុងផ្ទៀងផ្ទាត់"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-sm" style={{ color: "#666" }}>{k}</span>
            <span className="text-sm font-semibold" style={{ color: k === "ស្ថានភាព" ? "#f59e0b" : "#ddd" }}>{v}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center mb-6" style={{ color: "#555" }}>
        ប្រសិនបើ VIP មិនត្រូវបានបើកក្នុង 15 នាទី<br />
        សូមទំនាក់ទំនងផ្ទាល់តាម Telegram
      </p>

      <div className="flex gap-3 w-full">
        <a href="/profile"
          className="flex-1 py-3.5 rounded-xl font-bold text-sm text-center transition-all"
          style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.3)", color: "#c9a835" }}>
          មើលគណនី
        </a>
        <a href="/"
          className="flex-1 py-3.5 rounded-xl font-black text-sm text-center transition-all"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.3)" }}>
          ទំព័រដើម
        </a>
      </div>
    </div>
  );

  const stepContent = [Step1, Step2, Step3, Step4][step - 1];

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      {/* Page header */}
      <div className="px-4 sm:px-6 lg:px-12 pt-28 pb-4">
        <div className="flex items-center gap-2 text-xs mb-1 max-w-2xl mx-auto" style={{ color: "#555" }}>
          <a href="/" style={{ color: "#666" }} className="hover:text-amber-400 transition-colors">ទំព័រដើម</a>
          <span>/</span>
          <span style={{ color: "#c9a835" }}>បញ្ជូលទឹកប្រាក់</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black max-w-2xl mx-auto" style={{ color: "#f0f0f0" }}>
          វេទិកាបញ្ជូលទឹកប្រាក់
        </h1>
      </div>

      <div className="px-4 sm:px-6 pb-20 pt-8 max-w-2xl mx-auto">
        <Steps step={step} />

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
          }}
        >
          {stepContent}
        </div>

        {/* Security note */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-xs" style={{ color: "#555" }}>ការទូទាត់ត្រូវបានធានាសុវត្ថិភាព · SSL Encrypted</span>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
