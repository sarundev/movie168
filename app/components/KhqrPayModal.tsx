"use client";

import { useEffect, useRef, useState } from "react";
import { checkPaymentStatusAction } from "../actions/movie-actions";

const TIMER_SECS = 300;

function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

interface Props {
  paymentUrl: string;
  transactionId: string;
  amount: string;
  label: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function KhqrPayModal({ paymentUrl, transactionId, amount, label, onSuccess, onClose }: Props) {
  const [timer,  setTimer]  = useState(TIMER_SECS);
  const [status, setStatus] = useState<"pending" | "success" | "failed" | "expired">("pending");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          clearInterval(pollRef.current!);
          setStatus("expired");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  // Poll status every 4s
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      const res = await checkPaymentStatusAction(transactionId);
      const raw = res.data as { data?: { status?: string }; status?: string } | undefined;
      const s = raw?.data?.status ?? raw?.status;
      if (s === "success") {
        clearInterval(pollRef.current!);
        clearInterval(timerRef.current!);
        setStatus("success");
        setTimeout(onSuccess, 1200);
      } else if (s === "failed" || s === "expired") {
        clearInterval(pollRef.current!);
        setStatus(s as "failed" | "expired");
      }
    }, 4000);
    return () => clearInterval(pollRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  function handleClose() {
    clearInterval(timerRef.current!);
    clearInterval(pollRef.current!);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={handleClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: "#141418",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
          maxHeight: "92vh",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ background: "#1B4F9B", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3">
            <img src="/image/icon.png" alt="KHQR" style={{ height: 26, width: "auto", objectFit: "contain" }} />
            <div>
              <p className="text-sm font-black text-white leading-none">KHQR Payment</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Amount row ── */}
        {/* <div className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ background: "rgba(201,168,53,0.07)", borderBottom: "1px solid rgba(201,168,53,0.12)" }}>
          <span className="text-xs font-medium" style={{ color: "#888" }}>ចំនួនទឹកប្រាក់</span>
          <span className="text-xl text-white font-black" style={{  }}>{amount}</span>
        </div> */}

        {/* ── Body ── */}
        <div className="flex-1 overflow-auto min-h-0">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 px-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.35)", boxShadow: "0 0 48px rgba(34,197,94,0.2)" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ border: "2px solid #22c55e" }} />
              </div>
              <div className="text-center">
                <p className="font-black text-lg" style={{ color: "#f0f0f0" }}>ការទូទាត់បានជោគជ័យ!</p>
                <p className="text-sm mt-1" style={{ color: "#555" }}>{label} · {amount}</p>
              </div>
            </div>

          ) : status === "failed" || status === "expired" ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 px-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-black text-base" style={{ color: "#f0f0f0" }}>
                  {status === "expired" ? "ការទូទាត់ផុតកំណត់" : "ការទូទាត់មិនបានសំរេច"}
                </p>
                <p className="text-sm mt-1" style={{ color: "#555" }}>សូមព្យាយាមម្ដងទៀត</p>
              </div>
              <button onClick={handleClose}
                className="px-8 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#888" }}>
                បិទ
              </button>
            </div>

          ) : (
            /* ── Payment iframe ── */
            <iframe
              src={paymentUrl}
              title="KHQR Payment"
              className="w-full"
              style={{ height: "460px", border: "none", display: "block" }}
              allow="payment"
            />
          )}
        </div>

        {/* ── Footer — timer + status ── */}
        {status === "pending" && (
          <div className="px-5 py-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <svg className="animate-spin text-white" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span className="text-[11px] text-white" >កំពុងរងចាំការបញ្ជាក់...</span>
              </div>
              <span className="text-sm font-black tabular-nums text-white"
           >
                {fmt(timer)}
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${(timer / TIMER_SECS) * 100}%`, background: timer < 60 ? "#ef4444" : "linear-gradient(90deg,#c9a835,#8b6914)" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
