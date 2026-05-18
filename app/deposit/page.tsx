"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import KhqrPayModal from "../components/KhqrPayModal";
import { getCreditBalanceAction, createCreditTopUpAction, createBalanceTopUpAction } from "../actions/movie-actions";

const CREDIT_PACKS = [
  { id: "2",  credits: 2,  usd: "$2",  khr: "8,000",   label: "2 Credits",  badge: "" },
  { id: "5",  credits: 5,  usd: "$5",  khr: "20,000",  label: "5 Credits",  badge: "ពេញនិយម" },
  { id: "10", credits: 10, usd: "$10", khr: "40,000",  label: "10 Credits", badge: "" },
  { id: "25", credits: 25, usd: "$25", khr: "100,000", label: "25 Credits", badge: "សន្សំបំផុត" },
];

const BALANCE_PACKS = [
  { id: "5",   amount: 5,   usd: "$5",   khr: "20,000",  label: "$5",    badge: "" },
  { id: "10",  amount: 10,  usd: "$10",  khr: "40,000",  label: "$10",   badge: "ពេញនិយម" },
  { id: "20",  amount: 20,  usd: "$20",  khr: "80,000",  label: "$20",   badge: "" },
  { id: "50",  amount: 50,  usd: "$50",  khr: "200,000", label: "$50",   badge: "សន្សំបំផុត" },
];

type TopUpType = "balance" | "credit";

function PrimaryBtn({ onClick, disabled, loading, children }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className="flex-1 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
      style={{
        background: disabled || loading ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg,#c9a835,#8b6914)",
        color:      disabled || loading ? "#333" : "#0d0d12",
        boxShadow:  disabled || loading ? "none" : "0 4px 24px rgba(201,168,53,0.35)",
        cursor:     disabled || loading ? "not-allowed" : "pointer",
      }}>
      {loading && <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
      {children}
    </button>
  );
}

export default function DepositPage() {
  const [topUpType, setTopUpType] = useState<TopUpType>("balance");
  const [pack,      setPack]      = useState("5");
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [balance,   setBalance]   = useState<number | null>(null);
  const [credits,   setCredits]   = useState<number | null>(null);
  const [balLoading, setBalLoading] = useState(true);

  type KhqrModal = { paymentUrl: string; transactionId: string; amount: string };
  const [modal, setModal] = useState<KhqrModal | null>(null);

  const isBalance = topUpType === "balance";
  const selPack = (isBalance ? BALANCE_PACKS : CREDIT_PACKS).find(p => p.id === pack)!;

  useEffect(() => {
    getCreditBalanceAction().then(res => {
      if (res.ok && res.data) {
        const d = res.data as { credits?: number; balance?: number };
        setCredits(d.credits ?? 0);
        setBalance(d.balance ?? 0);
      }
    }).finally(() => setBalLoading(false));
  }, []);

  async function handlePay() {
    setLoading(true); setError(null);
    const value = isBalance ? (selPack as typeof BALANCE_PACKS[number]).amount : (selPack as typeof CREDIT_PACKS[number]).credits;
    const res = isBalance
      ? await createBalanceTopUpAction(value)
      : await createCreditTopUpAction(value);
    setLoading(false);
    if (res.ok && res.data) {
      const d = res.data as { payment_url?: string; transaction_id?: string; amount?: number };
      setModal({ paymentUrl: d.payment_url ?? "", transactionId: d.transaction_id ?? "", amount: selPack.usd });
    } else {
      setError(res.message ?? "Could not create payment.");
    }
  }

  function resetAll() {
    setSuccess(false); setModal(null); setError(null);
  }

  const PackGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {(isBalance ? BALANCE_PACKS : CREDIT_PACKS).map(p => {
        const sel = pack === p.id;
        const isBest = p.badge === "សន្សំបំផុត";
        const accent = isBest ? "#a855f7" : "#c9a835";
        return (
          <button key={p.id} onClick={() => setPack(p.id)}
            className="relative rounded-2xl p-4 text-left transition-all duration-200"
            style={{
              background: sel ? `${accent}13` : "rgba(255,255,255,0.025)",
              border: `2px solid ${sel ? accent : "rgba(255,255,255,0.07)"}`,
              boxShadow: sel ? `0 0 24px ${accent}26` : "none",
            }}>
            {p.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: isBest ? "linear-gradient(90deg,#a855f7,#7c3aed)" : "linear-gradient(90deg,#c9a835,#8b6914)",
                  color: isBest ? "#fff" : "#0d0d12",
                }}>
                {p.badge}
              </span>
            )}
            <p className="text-2xl font-black mt-1" style={{ color: accent }}>{"credits" in p ? p.credits : `$${p.amount}`}</p>
            <p className="text-[10px]" style={{ color: sel ? accent : "#555" }}>{"credits" in p ? "Credits" : "USD"}</p>
            <p className="text-sm font-bold mt-2" style={{ color: sel ? "#ddd" : "#666" }}>{p.usd}</p>
            <p className="text-[10px]" style={{ color: "#444" }}>{p.khr} ៛</p>
          </button>
        );
      })}
    </div>
  );

  const MainForm = (
    <div>
      <p className="text-[11px] font-semibold mb-3" style={{ color: "#555" }}>
        {isBalance ? "ជ្រើសចំនួនទឹកប្រាក់សម្រាប់ដាក់ចូល Balance" : "ជ្រើសរើសកញ្ចប់ Credits"}
      </p>

      {PackGrid}

      <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: "#555" }}>{isBalance ? "Amount" : "Credits"}</span>
          <span style={{ color: "#c9a835" }} className="font-bold">{selPack.usd}</span>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: "#555" }}>ចំនួនទឹកប្រាក់</span>
          <span style={{ color: "#ddd" }} className="font-bold">{selPack.usd} ({selPack.khr} ៛)</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: "#555" }}>វិធីបង់</span>
          <span style={{ color: "#ddd" }}>KHQR</span>
        </div>
      </div>

      {error && <p className="text-xs text-center mb-3" style={{ color: "#ef4444" }}>{error}</p>}

      <PrimaryBtn onClick={handlePay} loading={loading}>
        {loading ? "កំពុងបង្កើត..." : `ស្កេន KHQR · ${selPack.usd} →`}
      </PrimaryBtn>
    </div>
  );

  const SuccessView = (
    <div className="flex flex-col items-center py-4 gap-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)", boxShadow: "0 0 48px rgba(34,197,94,0.2)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full animate-ping opacity-15" style={{ border: "2px solid #22c55e" }} />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-black mb-1" style={{ color: "#f0f0f0" }}>ការទូទាត់បានជោគជ័យ!</h2>
        <p className="text-sm" style={{ color: "#555" }}>
          <span className="font-bold" style={{ color: "#c9a835" }}>{selPack.usd}</span> {isBalance ? "ត្រូវបានបន្ថែមទៅ Balance" : "Credits ត្រូវបានបន្ថែម"}
        </p>
      </div>
      <div className="flex gap-3 w-full mt-2">
        <button onClick={resetAll}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-center"
          style={{ background: "rgba(201,168,53,0.08)", border: "1px solid rgba(201,168,53,0.2)", color: "#c9a835" }}>
          Top Up ម្ដងទៀត
        </button>
        <Link href="/profile" className="flex-1 py-3.5 rounded-2xl font-black text-sm text-center"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.3)" }}>
          មើល Wallet
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      <div className="pt-24 pb-2 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-1.5 text-[11px] mb-3" style={{ color: "#444" }}>
          <Link href="/" className="hover:text-amber-400 transition-colors" style={{ color: "#444" }}>ទំព័រដើម</Link>
          <span>/</span>
          <span style={{ color: "#c9a835" }}>Top-Up</span>
        </div>
        <h1 className="text-2xl font-black" style={{ color: "#f0f0f0" }}>Top-Up</h1>
        <p className="text-sm mt-1" style={{ color: "#555" }}>ដាក់ប្រាក់ចូល Balance ឬទិញ Credits</p>
      </div>

      {/* Balance + Credits cards */}
      {/* {!balLoading && balance !== null && credits !== null && (
        <div className="px-4 sm:px-6 max-w-2xl mx-auto mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl px-4 py-3.5"
              style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.18)" }}>
              <p className="text-[10px] font-semibold" style={{ color: "#34d399" }}>Balance</p>
              <p className="text-xl font-black leading-none mt-1" style={{ color: "#34d399" }}>${balance.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl px-4 py-3.5"
              style={{ background: "rgba(201,168,53,0.07)", border: "1px solid rgba(201,168,53,0.18)" }}>
              <p className="text-[10px] font-semibold" style={{ color: "#c9a835" }}>Credits</p>
              <p className="text-xl font-black leading-none mt-1" style={{ color: "#c9a835" }}>${credits.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )} */}

      <div className="px-4 sm:px-6 pb-24 pt-2 max-w-2xl mx-auto">
        {/* Type tabs */}
        <div className="flex gap-2 mb-6">
          {(["balance", "credit"] as const).map(t => {
            const active = topUpType === t;
            return (
              <button key={t} onClick={() => { setTopUpType(t); setPack("5"); setError(null); setSuccess(false); }}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: active ? "rgba(201,168,53,0.13)" : "rgba(255,255,255,0.035)",
                  border: `1px solid ${active ? "rgba(201,168,53,0.35)" : "rgba(255,255,255,0.07)"}`,
                  color: active ? "#c9a835" : "#555",
                }}>
                {t === "balance" ? "Top-Up Balance" : "Top-Up Credit"}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl p-5 sm:p-7"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,168,53,0.12)", boxShadow: "0 16px 64px rgba(0,0,0,0.5)" }}>
          {success ? SuccessView : MainForm}
        </div>

        {!success && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-[11px]" style={{ color: "#333" }}>SSL Encrypted · ការទូទាត់ត្រូវបានធានា</span>
          </div>
        )}
      </div>

      <Footer />

      {modal && (
        <KhqrPayModal
          paymentUrl={modal.paymentUrl}
          transactionId={modal.transactionId}
          amount={modal.amount}
          label={`${selPack.usd} Top-Up`}
          onSuccess={() => { setModal(null); setSuccess(true); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
