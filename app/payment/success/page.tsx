"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PaymentData {
  payment: {
    reference_no: string;
    amount: number;
    currency: string;
    status: "paid" | "pending" | "failed" | string;
    payment_method: string | null;
  };
  movie_purchase: {
    status: string;
    movie: { title: string; slug: string } | null;
  } | null;
}

type State =
  | { phase: "loading" }
  | { phase: "ok"; data: PaymentData }
  | { phase: "error"; message: string };

export default function PaymentSuccessPage() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("transaction_id");

    if (!transactionId) {
      setState({ phase: "error", message: "Transaction ID មិនត្រឹមត្រូវ" });
      return;
    }

    fetch(`/api/payments/${transactionId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message ?? "រកមិនឃើញការទូទាត់");
        setState({ phase: "ok", data: json });
      })
      .catch((err: unknown) => {
        setState({ phase: "error", message: err instanceof Error ? err.message : "មានបញ្ហា" });
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0d0d12" }}>
      {state.phase === "loading" && <Loader />}
      {state.phase === "error" && <ErrorCard message={state.message} />}
      {state.phase === "ok"    && <SuccessCard data={state.data} />}
    </div>
  );
}

function SuccessCard({ data }: { data: PaymentData }) {
  const { payment, movie_purchase } = data;
  const isPaid    = payment.status === "paid";
  const isPending = payment.status === "pending";

  const iconColor = isPaid ? "#22c55e" : isPending ? "#c9a835" : "#ef4444";
  const iconBg    = isPaid
    ? "rgba(34,197,94,0.12)"
    : isPending ? "rgba(201,168,53,0.12)" : "rgba(239,68,68,0.12)";
  const iconBorder = isPaid
    ? "rgba(34,197,94,0.3)"
    : isPending ? "rgba(201,168,53,0.3)" : "rgba(239,68,68,0.3)";

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-5">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: iconBg, border: `2px solid ${iconBorder}` }}>
        {isPaid ? (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : isPending ? (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        ) : (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        )}
      </div>

      <div className="text-center">
        <h2 className="text-lg font-black mb-1" style={{ color: "#f0f0f0" }}>
          {isPaid ? "ការទូទាត់បានជោគជ័យ" : isPending ? "កំពុងរង់ចាំបញ្ជាក់" : "ការទូទាត់បានបរាជ័យ"}
        </h2>
        <p className="text-sm" style={{ color: "#555" }}>
          {isPaid ? "អរគុណ! ការទូទាត់របស់អ្នកបានជោគជ័យ"
            : isPending ? "ការទូទាត់នៅមិនទាន់ត្រូវបានបញ្ជាក់"
            : "សូមព្យាយាមម្ដងទៀត"}
        </p>
      </div>

      <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <Row label="Transaction" value={payment.reference_no} mono />
        <Row label="ចំនួន" value={`$${Number(payment.amount).toFixed(2)} ${payment.currency}`} />
        <Row
          label="ស្ថានភាព"
          value={isPaid ? "បានទូទាត់" : isPending ? "Pending" : "បរាជ័យ"}
          valueColor={iconColor}
          last
        />
      </div>

      {movie_purchase?.movie ? (
        <Link
          href={`/movie/${movie_purchase.movie.slug}`}
          target="_top"
          className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.3)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {isPaid ? "ចុចមើលរឿង" : "ត្រលប់ទៅរឿង"}
        </Link>
      ) : (
        <Link href="/" target="_top"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#777" }}>
          ទំព័រដើម
        </Link>
      )}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)" }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-black mb-1" style={{ color: "#f0f0f0" }}>មានបញ្ហា</h2>
        <p className="text-sm" style={{ color: "#666" }}>{message}</p>
      </div>
      <Link href="/" target="_top"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa" }}>
        ទំព័រដើម
      </Link>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg className="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <p className="text-sm" style={{ color: "#555" }}>កំពុងផ្ទៀងផ្ទាត់...</p>
    </div>
  );
}

function Row({ label, value, mono, valueColor, last }: {
  label: string; value: string; mono?: boolean; valueColor?: string; last?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
      <span className="text-xs" style={{ color: "#555" }}>{label}</span>
      <span className={`text-xs font-semibold ${mono ? "font-mono" : ""}`}
        style={{ color: valueColor ?? "#bbb", maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>
        {value}
      </span>
    </div>
  );
}
