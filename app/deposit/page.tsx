"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ─── Data ───────────────────────────────────────────── */
const PLANS = [
  {
    id: "1m", label: "1 ខែ", price: 3, usd: "$3", khr: "12,000",
    badge: "", accent: "#888",
    features: ["HD 1080p", "រឿងទាំងអស់", "1 ឧបករណ៍"],
  },
  {
    id: "3m", label: "3 ខែ", price: 8, usd: "$8", khr: "32,000",
    badge: "ពេញនិយម", accent: "#c9a835",
    features: ["4K Ultra HD", "រឿងទាំងអស់", "2 ឧបករណ៍", "គ្មានការផ្សាយ"],
  },
  {
    id: "12m", label: "12 ខែ", price: 25, usd: "$25", khr: "100,000",
    badge: "សន្សំបំផុត", accent: "#a855f7",
    features: ["4K Ultra HD", "រឿងទាំងអស់", "4 ឧបករណ៍", "គ្មានការផ្សាយ", "Download ក្រៅ"],
  },
];

const METHODS = [
  { id: "khqr",   label: "KHQR",     desc: "ស្កេនមួយ · ទូទាត់គ្រប់ធនាគារ",  bg: "#c0392b", abbr: "KH"  },
  { id: "aba",    label: "ABA Bank", desc: "ABA Mobile · Online Banking",      bg: "#1a3c6e", abbr: "ABA" },
  { id: "acleda", label: "ACLEDA",   desc: "ACLEDA Unity · ToanChet",          bg: "#1a6e3c", abbr: "ACL" },
];

const QR_IMG     = "https://khdiamond.net/wp-content/uploads/2026/05/khqr-sample.png";
const TIMER_SECS = 300;

/* ─── Helpers ────────────────────────────────────────── */
function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

/* ─── Step Bar ───────────────────────────────────────── */
function StepBar({ step, labels, accent = "#c9a835" }: { step: number; labels: string[]; accent?: string }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {labels.map((lb, i) => {
        const n = i + 1, done = n < step, active = n === step;
        return (
          <div key={lb} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300"
                style={{
                  background: done ? accent : active ? `${accent}22` : "rgba(255,255,255,0.04)",
                  border:     done || active ? `2px solid ${accent}` : "2px solid rgba(255,255,255,0.08)",
                  color:      done ? "#0d0d12" : active ? accent : "#444",
                  boxShadow:  active ? `0 0 12px ${accent}40` : "none",
                }}>
                {done
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : n}
              </div>
              <span className="text-[9px] font-semibold whitespace-nowrap hidden sm:block"
                style={{ color: active ? accent : done ? "#555" : "#333" }}>{lb}</span>
            </div>
            {i < labels.length - 1 && (
              <div className="w-10 sm:w-16 h-px mx-1 mb-4 sm:mb-0 transition-all duration-300"
                style={{ background: done ? accent : "rgba(255,255,255,0.07)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── QR Card ────────────────────────────────────────── */
function QrCard({ amount, label }: { amount: string; label: string }) {
  return (
    <div className="flex justify-center my-2">
      <div className="rounded-2xl overflow-hidden" style={{ background: "white", width: 210, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#c0392b" }}>
          <span className="font-black text-sm text-white tracking-widest">KHQR</span>
          <span className="text-[10px] text-red-200 font-semibold">Movie168</span>
        </div>
        <div className="p-3">
          <div className="rounded-xl overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
            <img src={QR_IMG} alt="QR Code" className="w-full h-full object-contain"
              onError={e => {
                const el = e.currentTarget.parentElement!;
                el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#bbb;font-size:11px;font-weight:600">QR Code</div>';
              }} />
          </div>
          <div className="mt-2.5 text-center">
            <p className="text-sm font-black" style={{ color: "#111" }}>{amount}</p>
            <p className="text-[10px]" style={{ color: "#999" }}>{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Copy Button ────────────────────────────────────── */
function CopyButton({ label, copied, onCopy }: { label: string; copied: boolean; onCopy: () => void }) {
  return (
    <button onClick={onCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
      style={{ background: copied ? "rgba(34,197,94,0.12)" : "rgba(201,168,53,0.1)", border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(201,168,53,0.25)"}`, color: copied ? "#22c55e" : "#c9a835" }}>
      {copied
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>}
      {copied ? "បានចម្លង!" : label}
    </button>
  );
}

/* ─── Payment Method List ────────────────────────────── */
function MethodList({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      {METHODS.map(m => {
        const sel = selected === m.id;
        return (
          <button key={m.id} onClick={() => onSelect(m.id)}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left"
            style={{
              background: sel ? "rgba(201,168,53,0.07)" : "rgba(255,255,255,0.025)",
              border:     sel ? "1.5px solid rgba(201,168,53,0.4)" : "1.5px solid rgba(255,255,255,0.07)",
            }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0"
              style={{ background: m.bg, color: "white", letterSpacing: "0.04em" }}>{m.abbr}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: sel ? "#c9a835" : "#ddd" }}>{m.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#555" }}>{m.desc}</p>
            </div>

            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
              style={{ borderColor: sel ? "#c9a835" : "#333" }}>
              {sel && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#c9a835" }} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Summary Row ────────────────────────────────────── */
function SummaryRow({ label, value, color = "#ddd" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-3 px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span className="text-xs" style={{ color: "#555" }}>{label}</span>
      <span className="text-xs font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

/* ─── Nav Buttons ────────────────────────────────────── */
function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-colors"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#666" }}>
      ← ត្រឡប់
    </button>
  );
}

function PrimaryBtn({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex-1 py-4 rounded-2xl text-sm font-black transition-all"
      style={{
        background: disabled ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg,#c9a835,#8b6914)",
        color:      disabled ? "#333" : "#0d0d12",
        boxShadow:  disabled ? "none" : "0 4px 24px rgba(201,168,53,0.35)",
        cursor:     disabled ? "not-allowed" : "pointer",
      }}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
export default function DepositPage() {
  const [step,   setStep]   = useState(1);
  const [plan,   setPlan]   = useState("3m");
  const [method, setMethod] = useState("khqr");
  const [timer,  setTimer]  = useState(TIMER_SECS);
  const [copied, setCopied] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selPlan  = PLANS.find(p => p.id === plan)!;

  useEffect(() => {
    if (step !== 3) return;
    setTimer(TIMER_SECS);
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  function copy() { navigator.clipboard.writeText(selPlan.price.toString()); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  /* ════ STEPS ════ */

  // Step 1 — Pick plan
  const Step1 = (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {PLANS.map(p => {
          const sel = plan === p.id;
          const isPurple = p.id === "12m";
          return (
            <button key={p.id} onClick={() => setPlan(p.id)}
              className="relative rounded-2xl p-5 text-left transition-all duration-200"
              style={{
                background: sel
                  ? isPurple ? "rgba(168,85,247,0.08)" : "rgba(201,168,53,0.08)"
                  : "rgba(255,255,255,0.025)",
                border: sel
                  ? `2px solid ${isPurple ? "#a855f7" : "#c9a835"}`
                  : "2px solid rgba(255,255,255,0.07)",
                boxShadow: sel ? `0 0 24px ${isPurple ? "rgba(168,85,247,0.15)" : "rgba(201,168,53,0.15)"}` : "none",
              }}>

              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black px-3 py-1 rounded-full whitespace-nowrap"
                  style={{
                    background: isPurple ? "linear-gradient(90deg,#a855f7,#7c3aed)" : "linear-gradient(90deg,#c9a835,#8b6914)",
                    color: isPurple ? "#fff" : "#0d0d12",
                    boxShadow: `0 2px 8px ${isPurple ? "rgba(168,85,247,0.4)" : "rgba(201,168,53,0.4)"}`,
                  }}>
                  {p.badge}
                </span>
              )}

              <p className="text-xs font-bold mb-3 mt-1" style={{ color: sel ? p.accent : "#555" }}>{p.label}</p>
              <p className="text-3xl font-black leading-none" style={{ color: p.accent }}>{p.usd}</p>
              <p className="text-[11px] mt-1 mb-4" style={{ color: "#444" }}>{p.khr} ៛</p>

              <ul className="flex flex-col gap-2">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[11px]" style={{ color: sel ? "#aaa" : "#555" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <PrimaryBtn onClick={() => setStep(2)}>ជ្រើស {selPlan.label} · {selPlan.usd} →</PrimaryBtn>
    </div>
  );

  // Step 2 — Pick payment method
  const Step2 = (
    <div>
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs" style={{ color: "#555" }}>គម្រោង</span>
        <span className="text-sm font-black" style={{ color: "#c9a835" }}>{selPlan.label} · {selPlan.usd}</span>
      </div>

      <MethodList selected={method} onSelect={setMethod} />

      <div className="flex gap-3 mt-6">
        <BackBtn onClick={() => setStep(1)} />
        <PrimaryBtn onClick={() => setStep(3)}>ស្កេន QR →</PrimaryBtn>
      </div>
    </div>
  );

  // Step 3 — QR scan
  const Step3 = (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: "#555" }}>ចំនួន</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black" style={{ color: "#c9a835" }}>{selPlan.usd}</span>
          <CopyButton label={`ចម្លង ${selPlan.usd}`} copied={copied} onCopy={copy} />
        </div>
      </div>

      <QrCard amount={selPlan.usd} label={`VIP ${selPlan.label} · ${selPlan.khr} ៛`} />

      <div className="mt-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: "#555" }}>ពេលវេលានៅសល់</span>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={timer < 60 ? "#ef4444" : "#c9a835"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-sm font-black tabular-nums" style={{ color: timer < 60 ? "#ef4444" : "#c9a835" }}>
              {timer > 0 ? fmt(timer) : "ផុតកំណត់"}
            </span>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(timer / TIMER_SECS) * 100}%`, background: timer < 60 ? "#ef4444" : "linear-gradient(90deg,#c9a835,#8b6914)" }} />
        </div>
      </div>

      <div className="flex gap-3">
        <BackBtn onClick={() => setStep(2)} />
        <PrimaryBtn onClick={() => setStep(4)} disabled={timer === 0}>បានបង់ប្រាក់ ✓</PrimaryBtn>
      </div>
    </div>
  );

  // Step 4 — Success
  const Step4 = (
    <div className="flex flex-col items-center py-2">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)", boxShadow: "0 0 48px rgba(34,197,94,0.2)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full animate-ping opacity-15" style={{ border: "2px solid #22c55e" }} />
      </div>

      <h2 className="text-lg font-black mb-1" style={{ color: "#f0f0f0" }}>ស្នើសុំបានទទួល</h2>
      <p className="text-sm text-center mb-6" style={{ color: "#555" }}>
        VIP <span className="font-black" style={{ color: "#c9a835" }}>{selPlan.label}</span> នឹងដំណើរការក្នុង 1–15 នាទី
      </p>

      <div className="w-full rounded-2xl overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <SummaryRow label="គម្រោង" value={`${selPlan.label} (${selPlan.usd})`} color="#c9a835" />
        <SummaryRow label="វិធីបង់ប្រាក់" value={METHODS.find(m => m.id === method)?.label ?? ""} />
        <SummaryRow label="ស្ថានភាព" value="កំពុងផ្ទៀងផ្ទាត់" color="#f59e0b" />
      </div>

      <div className="flex gap-3 w-full">
        <button onClick={() => setStep(1)}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-center"
          style={{ background: "rgba(201,168,53,0.08)", border: "1px solid rgba(201,168,53,0.2)", color: "#c9a835" }}>
          ជ្រើសម្ដងទៀត
        </button>
        <a href="/" className="flex-1 py-3.5 rounded-2xl font-black text-sm text-center"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.3)" }}>
          ទំព័រដើម
        </a>
      </div>
    </div>
  );

  const labels  = ["គម្រោង", "វិធីបង់", "QR", "រួចរាល់"];
  const titles  = ["ជ្រើសរើសគម្រោង VIP", "ជ្រើសរើសវិធីបង់ប្រាក់", "ស្កេន QR Code", "ស្នើសុំបានទទួល"];
  const content = [Step1, Step2, Step3, Step4][step - 1];

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      <div className="pt-24 pb-2 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-1.5 text-[11px] mb-3" style={{ color: "#444" }}>
          <a href="/" className="hover:text-amber-400 transition-colors" style={{ color: "#444" }}>ទំព័រដើម</a>
          <span>/</span>
          <span style={{ color: "#c9a835" }}>សមាជិកភាព</span>
        </div>
        <h1 className="text-2xl font-black" style={{ color: "#f0f0f0" }}>សមាជិកភាព VIP</h1>
        <p className="text-sm mt-1" style={{ color: "#555" }}>ជ្រើសសមាជិកភាព VIP សម្រាប់ការចូលទស្សនារឿង</p>
      </div>

      <div className="px-4 sm:px-6 pb-24 pt-6 max-w-2xl mx-auto">

        <StepBar step={step} labels={labels} accent="#c9a835" />

        <p className="text-sm font-black text-center mb-6" style={{ color: "#c9a835" }}>{titles[step - 1]}</p>

        <div className="rounded-3xl p-5 sm:p-7"
          style={{
            background: "rgba(255,255,255,0.02)",
            border:     "1px solid rgba(201,168,53,0.12)",
            boxShadow:  "0 16px 64px rgba(0,0,0,0.5)",
          }}>
          {content}
        </div>

        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-[11px]" style={{ color: "#333" }}>SSL Encrypted · ការទូទាត់ត្រូវបានធានា</span>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
