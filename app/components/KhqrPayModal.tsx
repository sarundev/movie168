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
  const [timer,        setTimer]        = useState(TIMER_SECS);
  const [status,       setStatus]       = useState<"pending" | "success" | "failed" | "expired">("pending");
  const [popupBlocked, setPopupBlocked] = useState(false);
  const popupRef  = useRef<Window | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // Open popup immediately
  useEffect(() => {
    const win = window.open(paymentUrl, "khqrpay_checkout", "width=500,height=700,scrollbars=yes,resizable=yes");
    if (!win) { setPopupBlocked(true); }
    else { popupRef.current = win; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          clearInterval(pollRef.current!);
          setStatus("expired");
          popupRef.current?.close();
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
        popupRef.current?.close();
        setStatus("success");
        setTimeout(onSuccess, 1000);
      } else if (s === "failed" || s === "expired") {
        clearInterval(pollRef.current!);
        popupRef.current?.close();
        setStatus(s as "failed" | "expired");
      }
    }, 4000);
    return () => clearInterval(pollRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  function openPayment() {
    const win = window.open(paymentUrl, "khqrpay_checkout", "width=500,height=700,scrollbars=yes,resizable=yes");
    if (win) { popupRef.current = win; setPopupBlocked(false); }
  }

  function handleClose() {
    popupRef.current?.close();
    clearInterval(timerRef.current!);
    clearInterval(pollRef.current!);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
      onClick={handleClose}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#c0392b" }}>
          <span className="font-black text-white tracking-widest text-sm">KHQR Payment</span>
          <button onClick={handleClose} className="text-red-200 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-5">
          {status === "success" ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.35)", boxShadow: "0 0 40px rgba(34,197,94,0.2)" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-black text-base" style={{ color: "#f0f0f0" }}>ការទូទាត់បានជោគជ័យ!</p>
                <p className="text-sm mt-1" style={{ color: "#555" }}>{label}</p>
              </div>
            </div>

          ) : status === "failed" || status === "expired" ? (
            <div className="flex flex-col items-center py-6 gap-3">
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
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "rgba(255,255,255,0.07)", color: "#888" }}>
                បិទ
              </button>
            </div>

          ) : (
            <>
              {/* Amount */}
              <div className="text-center mb-5">
                <p className="text-xs mb-1" style={{ color: "#555" }}>{label}</p>
                <p className="text-3xl font-black" style={{ color: "#c9a835" }}>{amount}</p>
              </div>

              {/* Popup state */}
              {popupBlocked ? (
                <div className="rounded-2xl p-4 mb-4 text-center"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-xs mb-3" style={{ color: "#ef4444" }}>
                    Browser បានរារាំង Popup — សូមចុចដើម្បីបើក
                  </p>
                  <button onClick={openPayment}
                    className="w-full py-3 rounded-xl text-sm font-black transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.35)" }}>
                    បើកទំព័រទូទាត់ →
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl p-4 mb-4 flex items-start gap-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "#c0392b" }}>
                    <span className="font-black text-white text-[10px]">KH</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#ddd" }}>ទំព័រទូទាត់បានបើក</p>
                    <p className="text-xs mt-0.5" style={{ color: "#555" }}>ស្កេន KHQR ឬបង់ប្រាក់ក្នុង popup window</p>
                  </div>
                </div>
              )}

              {/* Reopen link */}
              <button onClick={openPayment}
                className="w-full text-xs py-2 mb-4 rounded-lg transition-colors hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.04)", color: "#555", border: "1px solid rgba(255,255,255,0.07)" }}>
                បើក Popup ម្ដងទៀត
              </button>

              {/* Timer */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "#555" }}>ផុតកំណត់ក្នុង</span>
                  <span className="text-sm font-black tabular-nums"
                    style={{ color: timer < 60 ? "#ef4444" : "#c9a835" }}>
                    {fmt(timer)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(timer / TIMER_SECS) * 100}%`, background: timer < 60 ? "#ef4444" : "linear-gradient(90deg,#c9a835,#8b6914)" }} />
                </div>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span className="text-xs" style={{ color: "#444" }}>កំពុងរងចាំការបញ្ជាក់...</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
