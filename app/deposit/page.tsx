"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ─── Data ───────────────────────────────────────────── */
const PLANS = [
  {
    id: "1m", label: "1 ខែ", price: 3, usd: "$3", khr: "12,000",
    badge: "", color: "#888",
    features: ["HD 1080p", "រឿងទាំងអស់", "1 ឧបករណ៍"],
  },
  {
    id: "3m", label: "3 ខែ", price: 8, usd: "$8", khr: "32,000",
    badge: "ពេញនិយម", color: "#c9a835",
    features: ["4K Ultra HD", "រឿងទាំងអស់", "2 ឧបករណ៍", "គ្មានការផ្សាយ"],
  },
  {
    id: "12m", label: "12 ខែ", price: 25, usd: "$25", khr: "100,000",
    badge: "សន្សំបំផុត", color: "#a855f7",
    features: ["4K Ultra HD", "រឿងទាំងអស់", "4 ឧបករណ៍", "គ្មានការផ្សាយ", "Download ក្រៅ"],
  },
];

const TOPUP_PRESETS = [1, 2, 5, 10, 20, 50];

const METHODS = [
  { id: "khqr",   label: "KHQR",     bg: "#c0392b", abbr: "KH"  },
  { id: "aba",    label: "ABA Bank", bg: "#1a3c6e", abbr: "ABA" },
  { id: "acleda", label: "ACLEDA",   bg: "#1a6e3c", abbr: "ACL" },
];

const QR_IMG     = "https://khdiamond.net/wp-content/uploads/2026/05/khqr-sample.png";
const TIMER_SECS = 300;
const RATE       = 4000;

/* ─── Helpers ────────────────────────────────────────── */
function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}
function toKhr(n: number) { return (n * RATE).toLocaleString(); }

/* ─── Step bar ───────────────────────────────────────── */
function StepBar({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center mb-7">
      {labels.map((lb, i) => {
        const n = i + 1, done = n < step, active = n === step;
        return (
          <div key={lb} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
                style={{
                  background: done ? "#c9a835" : active ? "rgba(201,168,53,0.16)" : "rgba(255,255,255,0.05)",
                  border:     done || active ? "2px solid #c9a835" : "2px solid rgba(255,255,255,0.09)",
                  color:      done ? "#0d0d12" : active ? "#c9a835" : "#444",
                }}>
                {done ? "✓" : n}
              </div>
              <span className="text-[9px] whitespace-nowrap hidden sm:block"
                style={{ color: active ? "#c9a835" : done ? "#666" : "#333" }}>{lb}</span>
            </div>
            {i < labels.length - 1 && (
              <div className="w-8 sm:w-12 h-px mx-1 mb-3 sm:mb-0"
                style={{ background: done ? "#c9a835" : "rgba(255,255,255,0.07)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── QR card (shared) ───────────────────────────────── */
function QrCard({ amount, isTopup }: { amount: string; isTopup: boolean }) {
  return (
    <div className="flex justify-center">
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "white", width: 220, boxShadow: "0 12px 48px rgba(0,0,0,0.7)" }}>
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#c0392b" }}>
          <span className="font-black text-sm text-white tracking-wider">KHQR</span>
          <span className="ml-auto text-[10px] text-red-200 font-semibold">Movie168</span>
        </div>
        <div className="p-3">
          <div className="rounded-xl overflow-hidden" style={{ background: "#f8f8f8", aspectRatio: "1/1" }}>
            <img src={QR_IMG} alt="QR" className="w-full h-full object-contain"
              onError={(e) => {
                const el = e.currentTarget.parentElement!;
                el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#bbb;font-size:11px">QR Code</div>';
              }} />
          </div>
          <p className="text-center text-[11px] mt-2 font-semibold" style={{ color: "#999" }}>
            {isTopup ? "USD" : "VIP"} · {amount}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function DepositPage() {
  /* tab: "member" | "topup" */
  const [tab, setTab]       = useState<"member" | "topup">("member");

  /* membership flow */
  const [mStep,   setMStep]   = useState(1);
  const [plan,    setPlan]    = useState("3m");
  const [mMethod, setMMethod] = useState("khqr");
  const [mTimer,  setMTimer]  = useState(TIMER_SECS);
  const [mCopied, setMCopied] = useState(false);

  /* topup flow */
  const [tStep,   setTStep]   = useState(1);
  const [amount,  setAmount]  = useState(5);
  const [custom,  setCustom]  = useState("");
  const [tMethod, setTMethod] = useState("khqr");
  const [tTimer,  setTTimer]  = useState(TIMER_SECS);
  const [tCopied, setTCopied] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selPlan   = PLANS.find((p) => p.id === plan)!;
  const finalAmt  = custom ? Math.max(0, Number(custom)) : amount;
  const validAmt  = finalAmt >= 1 && finalAmt <= 500;

  /* timer for QR steps */
  const isQrStep = (tab === "member" && mStep === 3) || (tab === "topup" && tStep === 3);
  useEffect(() => {
    if (!isQrStep) return;
    const setter = tab === "member" ? setMTimer : setTTimer;
    setter(TIMER_SECS);
    timerRef.current = setInterval(() => {
      setter((t) => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isQrStep, tab]);

  function switchTab(t: "member" | "topup") {
    setTab(t);
    setMStep(1); setTStep(1);
    setMCopied(false); setTCopied(false);
  }

  /* ── copy helpers ── */
  function mCopy() { navigator.clipboard.writeText(selPlan.price.toString()); setMCopied(true); setTimeout(() => setMCopied(false), 2000); }
  function tCopy() { navigator.clipboard.writeText(String(finalAmt)); setTCopied(true); setTimeout(() => setTCopied(false), 2000); }

  /* ════════════════════════════════════════════════════
     MEMBERSHIP STEPS
  ════════════════════════════════════════════════════ */
  const MStep1 = (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {PLANS.map((p) => {
          const sel = plan === p.id;
          return (
            <button key={p.id} onClick={() => setPlan(p.id)}
              className="relative rounded-2xl p-4 text-left transition-all"
              style={{
                background: sel ? "rgba(201,168,53,0.1)" : "rgba(255,255,255,0.03)",
                border:     sel ? "2px solid #c9a835" : "2px solid rgba(255,255,255,0.07)",
                boxShadow:  sel ? "0 0 20px rgba(201,168,53,0.15)" : "none",
              }}>
              {p.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{
                    background: p.id === "12m" ? "linear-gradient(90deg,#a855f7,#7c3aed)" : "linear-gradient(90deg,#c9a835,#8b6914)",
                    color: "#fff",
                  }}>
                  {p.badge}
                </span>
              )}
              <p className="font-black text-sm mb-1 mt-1" style={{ color: sel ? "#c9a835" : "#ddd" }}>{p.label}</p>
              <p className="text-2xl font-black" style={{ color: "#c9a835" }}>{p.usd}</p>
              <p className="text-[11px] mb-3" style={{ color: "#555" }}>{p.khr} ៛</p>
              <ul className="flex flex-col gap-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[11px]" style={{ color: "#888" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
      <button onClick={() => setMStep(2)}
        className="w-full py-4 rounded-xl font-black text-sm tracking-wide"
        style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.35)" }}>
        ជ្រើស {selPlan.label} · {selPlan.usd} →
      </button>
    </div>
  );

  const MStep2 = (
    <div>
      <p className="text-center text-sm mb-5" style={{ color: "#666" }}>
        គម្រោង <span className="font-black" style={{ color: "#c9a835" }}>{selPlan.label}</span> — {selPlan.usd}
      </p>
      <div className="flex flex-col gap-3 mb-6">
        {METHODS.map((m) => (
          <button key={m.id} onClick={() => setMMethod(m.id)}
            className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all"
            style={{
              background: mMethod === m.id ? "rgba(201,168,53,0.09)" : "rgba(255,255,255,0.03)",
              border:     mMethod === m.id ? "2px solid #c9a835" : "2px solid rgba(255,255,255,0.07)",
            }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-black"
              style={{ background: m.bg, color: "white" }}>{m.abbr}</div>
            <span className="flex-1 font-semibold text-sm" style={{ color: "#ddd" }}>{m.label}</span>
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: mMethod === m.id ? "#c9a835" : "#444" }}>
              {mMethod === m.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#c9a835" }} />}
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setMStep(1)} className="flex-1 py-3.5 rounded-xl font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#666" }}>← ត្រឡប់</button>
        <button onClick={() => setMStep(3)} className="flex-1 py-4 rounded-xl font-black text-sm"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.35)" }}>ស្កេន QR →</button>
      </div>
    </div>
  );

  const MStep3 = (
    <div>
      <p className="text-center text-sm mb-3" style={{ color: "#666" }}>
        <span className="font-black" style={{ color: "#c9a835" }}>{selPlan.usd} ({selPlan.khr} ៛)</span>
      </p>
      <div className="flex justify-center mb-3">
        <button onClick={mCopy}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all"
          style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.25)", color: "#c9a835" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          {mCopied ? "បានចម្លង ✓" : `ចម្លង ${selPlan.usd}`}
        </button>
      </div>
      <div className="mb-4"><QrCard amount={selPlan.usd} isTopup={false} /></div>
      <div className="flex items-center justify-center gap-2 mb-2">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={mTimer < 60 ? "#ef4444" : "#c9a835"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span className="font-black tabular-nums text-sm" style={{ color: mTimer < 60 ? "#ef4444" : "#c9a835" }}>
          {mTimer > 0 ? fmt(mTimer) : "ផុតកំណត់"}
        </span>
        <span className="text-xs" style={{ color: "#444" }}>នៅសល់</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${(mTimer / TIMER_SECS) * 100}%`, background: mTimer < 60 ? "#ef4444" : "linear-gradient(90deg,#c9a835,#8b6914)" }} />
      </div>
      <div className="flex gap-3">
        <button onClick={() => setMStep(2)} className="flex-1 py-3.5 rounded-xl font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#666" }}>← ត្រឡប់</button>
        <button onClick={() => setMStep(4)} disabled={mTimer === 0}
          className="flex-1 py-4 rounded-xl font-black text-sm transition-all"
          style={{
            background: mTimer === 0 ? "rgba(255,255,255,0.04)" : "linear-gradient(90deg,#c9a835,#8b6914)",
            color:      mTimer === 0 ? "#333" : "#0d0d12",
            boxShadow:  mTimer === 0 ? "none" : "0 4px 20px rgba(201,168,53,0.35)",
            cursor:     mTimer === 0 ? "not-allowed" : "pointer",
          }}>
          បានបង់ប្រាក់ ✓
        </button>
      </div>
    </div>
  );

  const MStep4 = (
    <div className="flex flex-col items-center py-4">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.12)", border: "3px solid rgba(34,197,94,0.35)", boxShadow: "0 0 40px rgba(34,197,94,0.2)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ border: "3px solid #22c55e" }} />
      </div>
      <h2 className="text-lg font-black mb-1" style={{ color: "#f0f0f0" }}>ស្នើសុំបានទទួល</h2>
      <p className="text-sm text-center mb-5" style={{ color: "#555" }}>
        VIP <span className="font-black" style={{ color: "#c9a835" }}>{selPlan.label}</span> នឹងដំណើរការក្នុង 1–15 នាទី
      </p>
      <div className="w-full rounded-2xl overflow-hidden mb-5"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        {([
          ["គម្រោង", `${selPlan.label} (${selPlan.usd})`, "#c9a835"],
          ["វិធីបង់ប្រាក់", METHODS.find((m) => m.id === mMethod)?.label ?? "", "#ddd"],
          ["ស្ថានភាព", "កំពុងផ្ទៀងផ្ទាត់", "#f59e0b"],
        ] as [string, string, string][]).map(([k, v, c]) => (
          <div key={k} className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span className="text-xs" style={{ color: "#555" }}>{k}</span>
            <span className="text-xs font-semibold" style={{ color: c }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => setMStep(1)}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm text-center"
          style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.25)", color: "#c9a835" }}>
          ជ្រើសម្ដងទៀត
        </button>
        <a href="/" className="flex-1 py-3.5 rounded-xl font-black text-sm text-center"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.3)" }}>
          ទំព័រដើម
        </a>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════
     TOP-UP STEPS
  ════════════════════════════════════════════════════ */
  const TStep1 = (
    <div>
      <p className="text-center text-[11px] mb-4" style={{ color: "#555" }}>$1 = {RATE.toLocaleString()} ៛</p>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {TOPUP_PRESETS.map((n) => {
          const sel = !custom && amount === n;
          return (
            <button key={n} onClick={() => { setAmount(n); setCustom(""); }}
              className="rounded-xl py-3.5 flex flex-col items-center transition-all"
              style={{
                background: sel ? "rgba(201,168,53,0.14)" : "rgba(255,255,255,0.04)",
                border:     sel ? "2px solid #c9a835" : "2px solid rgba(255,255,255,0.07)",
                boxShadow:  sel ? "0 0 14px rgba(201,168,53,0.2)" : "none",
              }}>
              <span className="font-black text-sm" style={{ color: sel ? "#c9a835" : "#ccc" }}>${n}</span>
              <span className="text-[10px] mt-0.5" style={{ color: "#555" }}>{toKhr(n)} ៛</span>
            </button>
          );
        })}
      </div>
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm" style={{ color: "#c9a835" }}>$</span>
        <input type="number" min="1" max="500" placeholder="ចំនួនផ្ទាល់ខ្លួន..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-full pl-8 pr-4 py-3.5 rounded-xl text-sm font-semibold outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border:     custom ? "2px solid #c9a835" : "2px solid rgba(255,255,255,0.08)",
            color: "#f0f0f0", caretColor: "#c9a835",
          }} />
        {custom && Number(custom) > 0 && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "#555" }}>
            ≈ {toKhr(Number(custom))} ៛
          </span>
        )}
      </div>
      {validAmt && (
        <div className="flex rounded-xl overflow-hidden mb-4"
          style={{ border: "1px solid rgba(201,168,53,0.2)" }}>
          <div className="flex-1 py-3 text-center" style={{ background: "rgba(201,168,53,0.07)" }}>
            <p className="text-[10px]" style={{ color: "#888" }}>បង់</p>
            <p className="font-black text-lg" style={{ color: "#c9a835" }}>${finalAmt}</p>
            <p className="text-[10px]" style={{ color: "#555" }}>{toKhr(finalAmt)} ៛</p>
          </div>
          <div className="w-px" style={{ background: "rgba(201,168,53,0.15)" }} />
          <div className="flex-1 py-3 text-center" style={{ background: "rgba(34,197,94,0.05)" }}>
            <p className="text-[10px]" style={{ color: "#888" }}>ទទួលបាន</p>
            <p className="font-black text-lg" style={{ color: "#22c55e" }}>${finalAmt}</p>
            <p className="text-[10px]" style={{ color: "#555" }}>Credit</p>
          </div>
        </div>
      )}
      {custom && (Number(custom) < 1 || Number(custom) > 500) && (
        <p className="text-xs text-center mb-3" style={{ color: "#ef4444" }}>ចំនួនត្រូវ $1 – $500</p>
      )}
      <button onClick={() => setTStep(2)} disabled={!validAmt}
        className="w-full py-4 rounded-xl font-black text-sm tracking-wide"
        style={{
          background: validAmt ? "linear-gradient(90deg,#c9a835,#8b6914)" : "rgba(255,255,255,0.05)",
          color:      validAmt ? "#0d0d12" : "#333",
          boxShadow:  validAmt ? "0 4px 20px rgba(201,168,53,0.35)" : "none",
          cursor:     validAmt ? "pointer" : "not-allowed",
        }}>
        Top Up ${validAmt ? finalAmt : "—"} →
      </button>
    </div>
  );

  const TStep2 = (
    <div>
      <p className="text-center text-sm mb-5" style={{ color: "#666" }}>
        ចំនួន <span className="font-black" style={{ color: "#c9a835" }}>${finalAmt}</span>
        <span style={{ color: "#555" }}> ({toKhr(finalAmt)} ៛)</span>
      </p>
      <div className="flex flex-col gap-3 mb-6">
        {METHODS.map((m) => (
          <button key={m.id} onClick={() => setTMethod(m.id)}
            className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all"
            style={{
              background: tMethod === m.id ? "rgba(201,168,53,0.09)" : "rgba(255,255,255,0.03)",
              border:     tMethod === m.id ? "2px solid #c9a835" : "2px solid rgba(255,255,255,0.07)",
            }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-black"
              style={{ background: m.bg, color: "white" }}>{m.abbr}</div>
            <span className="flex-1 font-semibold text-sm" style={{ color: "#ddd" }}>{m.label}</span>
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: tMethod === m.id ? "#c9a835" : "#444" }}>
              {tMethod === m.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#c9a835" }} />}
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setTStep(1)} className="flex-1 py-3.5 rounded-xl font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#666" }}>← ត្រឡប់</button>
        <button onClick={() => setTStep(3)} className="flex-1 py-4 rounded-xl font-black text-sm"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.35)" }}>ស្កេន QR →</button>
      </div>
    </div>
  );

  const TStep3 = (
    <div>
      <p className="text-center text-sm mb-3" style={{ color: "#666" }}>
        <span className="font-black" style={{ color: "#c9a835" }}>${finalAmt} ({toKhr(finalAmt)} ៛)</span>
      </p>
      <div className="flex justify-center mb-3">
        <button onClick={tCopy}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all"
          style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.25)", color: "#c9a835" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          {tCopied ? "បានចម្លង ✓" : `ចម្លង $${finalAmt}`}
        </button>
      </div>
      <div className="mb-4"><QrCard amount={`$${finalAmt}`} isTopup={true} /></div>
      <div className="flex items-center justify-center gap-2 mb-2">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={tTimer < 60 ? "#ef4444" : "#c9a835"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span className="font-black tabular-nums text-sm" style={{ color: tTimer < 60 ? "#ef4444" : "#c9a835" }}>
          {tTimer > 0 ? fmt(tTimer) : "ផុតកំណត់"}
        </span>
        <span className="text-xs" style={{ color: "#444" }}>នៅសល់</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${(tTimer / TIMER_SECS) * 100}%`, background: tTimer < 60 ? "#ef4444" : "linear-gradient(90deg,#c9a835,#8b6914)" }} />
      </div>
      <div className="flex gap-3">
        <button onClick={() => setTStep(2)} className="flex-1 py-3.5 rounded-xl font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#666" }}>← ត្រឡប់</button>
        <button onClick={() => setTStep(4)} disabled={tTimer === 0}
          className="flex-1 py-4 rounded-xl font-black text-sm transition-all"
          style={{
            background: tTimer === 0 ? "rgba(255,255,255,0.04)" : "linear-gradient(90deg,#c9a835,#8b6914)",
            color:      tTimer === 0 ? "#333" : "#0d0d12",
            boxShadow:  tTimer === 0 ? "none" : "0 4px 20px rgba(201,168,53,0.35)",
            cursor:     tTimer === 0 ? "not-allowed" : "pointer",
          }}>
          បានបង់ប្រាក់ ✓
        </button>
      </div>
    </div>
  );

  const TStep4 = (
    <div className="flex flex-col items-center py-4">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.12)", border: "3px solid rgba(34,197,94,0.35)", boxShadow: "0 0 40px rgba(34,197,94,0.2)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ border: "3px solid #22c55e" }} />
      </div>
      <h2 className="text-lg font-black mb-1" style={{ color: "#f0f0f0" }}>ស្នើសុំបានទទួល</h2>
      <p className="text-sm text-center mb-5" style={{ color: "#555" }}>
        Credit <span className="font-black" style={{ color: "#c9a835" }}>${finalAmt}</span> នឹងចូល Wallet ក្នុង 1–15 នាទី
      </p>
      <div className="w-full rounded-2xl overflow-hidden mb-5"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        {([
          ["ចំនួន Top Up", `$${finalAmt} (${toKhr(finalAmt)} ៛)`, "#c9a835"],
          ["Credit ទទួលបាន", `$${finalAmt}`, "#22c55e"],
          ["វិធីបង់ប្រាក់", METHODS.find((m) => m.id === tMethod)?.label ?? "", "#ddd"],
          ["ស្ថានភាព", "កំពុងផ្ទៀងផ្ទាត់", "#f59e0b"],
        ] as [string, string, string][]).map(([k, v, c]) => (
          <div key={k} className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span className="text-xs" style={{ color: "#555" }}>{k}</span>
            <span className="text-xs font-semibold" style={{ color: c }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => { setTStep(1); setCustom(""); setAmount(5); }}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm text-center"
          style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.25)", color: "#c9a835" }}>
          Top Up ម្ដងទៀត
        </button>
        <a href="/" className="flex-1 py-3.5 rounded-xl font-black text-sm text-center"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.3)" }}>
          ទំព័រដើម
        </a>
      </div>
    </div>
  );

  /* ─── Active content & step labels ─── */
  const mLabels = ["គម្រោង", "វិធីបង់", "QR", "រួចរាល់"];
  const tLabels = ["ចំនួន",  "វិធីបង់", "QR", "រួចរាល់"];
  const mContent = [MStep1, MStep2, MStep3, MStep4][mStep - 1];
  const tContent = [TStep1, TStep2, TStep3, TStep4][tStep - 1];

  /* ─── step titles ─── */
  const mTitles = ["ជ្រើសរើសគម្រោង VIP", "ជ្រើសរើសវិធីបង់ប្រាក់", "ស្កេន QR Code", "ស្នើសុំបានទទួល"];
  const tTitles = ["ជ្រើសរើសចំនួន",     "ជ្រើសរើសវិធីបង់ប្រាក់", "ស្កេន QR Code", "ស្នើសុំបានទទួល"];

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      {/* ── Header ── */}
      <div className="px-4 sm:px-6 lg:px-12 pt-28 pb-4">
        <div className="flex items-center gap-2 text-[11px] mb-1 max-w-2xl mx-auto" style={{ color: "#555" }}>
          <a href="/" className="hover:text-amber-400 transition-colors" style={{ color: "#555" }}>ទំព័រដើម</a>
          <span>/</span>
          <span style={{ color: "#c9a835" }}>ការបំពេញ</span>
        </div>
        <h1 className="text-xl font-black max-w-2xl mx-auto" style={{ color: "#f0f0f0" }}>
          ការបំពេញ & Top Up
        </h1>
      </div>

      <div className="px-4 sm:px-6 pb-24 pt-4 max-w-2xl mx-auto">

        {/* ══ TAB SWITCHER ══ */}
        <div className="flex rounded-2xl p-1.5 mb-6 gap-1.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

          {/* Membership tab */}
          <button onClick={() => switchTab("member")}
            className="relative flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-sm transition-all"
            style={{
              background: tab === "member"
                ? "linear-gradient(135deg,rgba(201,168,53,0.18) 0%,rgba(139,105,20,0.12) 100%)"
                : "transparent",
              border:  tab === "member" ? "1px solid rgba(201,168,53,0.35)" : "1px solid transparent",
              color:   tab === "member" ? "#c9a835" : "#555",
              boxShadow: tab === "member" ? "0 2px 16px rgba(201,168,53,0.12)" : "none",
            }}>
            {/* Crown icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20M5 20L3 8l7 4 2-6 2 6 7-4-2 12"/>
            </svg>
            <span>សមាជិកភាព</span>
            {tab === "member" && (
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full" style={{ background: "#c9a835" }} />
            )}
          </button>

          {/* Top-up tab */}
          <button onClick={() => switchTab("topup")}
            className="relative flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-sm transition-all"
            style={{
              background: tab === "topup"
                ? "linear-gradient(135deg,rgba(34,197,94,0.14) 0%,rgba(16,120,56,0.08) 100%)"
                : "transparent",
              border:  tab === "topup" ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent",
              color:   tab === "topup" ? "#22c55e" : "#555",
              boxShadow: tab === "topup" ? "0 2px 16px rgba(34,197,94,0.1)" : "none",
            }}>
            {/* Wallet icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V7H4v13h16v-5"/><path d="M20 12a2 2 0 0 0-4 0 2 2 0 0 0 4 0Z"/>
            </svg>
            <span>Top Up</span>
            {tab === "topup" && (
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
            )}
          </button>
        </div>

        {/* ══ STEP BAR + TITLE ══ */}
        <StepBar step={tab === "member" ? mStep : tStep} labels={tab === "member" ? mLabels : tLabels} />

        <p className="text-sm font-black text-center mb-5"
          style={{ color: tab === "member" ? "#c9a835" : "#22c55e" }}>
          {tab === "member" ? mTitles[mStep - 1] : tTitles[tStep - 1]}
        </p>

        {/* ══ CONTENT CARD ══ */}
        <div className="rounded-2xl p-5 sm:p-7"
          style={{
            background: "rgba(255,255,255,0.025)",
            border:     tab === "member"
              ? "1px solid rgba(201,168,53,0.14)"
              : "1px solid rgba(34,197,94,0.12)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
          }}>
          {tab === "member" ? mContent : tContent}
        </div>

        {/* ── Security note ── */}
        {((tab === "member" && mStep < 4) || (tab === "topup" && tStep < 4)) && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-[11px]" style={{ color: "#444" }}>SSL Encrypted · ការទូទាត់ត្រូវបានធានា</span>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
