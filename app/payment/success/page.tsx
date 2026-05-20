import { Suspense } from "react";
import Link from "next/link";
import { serverApi } from "../../lib/server-api";
import { getServerUser } from "../../lib/server-auth";

interface PaymentData {
  success: boolean;
  payment: {
    reference_no: string;
    amount: number;
    currency: string;
    status: "paid" | "pending" | "failed" | string;
    payment_method: string | null;
    paid_at: string | null;
  };
  movie_purchase: {
    status: string;
    movie: { title: string; slug: string } | null;
  } | null;
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ transaction_id?: string }>;
}) {
  const { transaction_id } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0d0d12" }}>
      <Suspense fallback={<Loader />}>
        <PaymentResult transactionId={transaction_id ?? null} />
      </Suspense>
    </div>
  );
}

async function PaymentResult({ transactionId }: { transactionId: string | null }) {
  if (!transactionId) {
    return <StatusCard type="error" title="Transaction ID មិនត្រឹមត្រូវ" message="URL ខុស ឬការបញ្ជូនបន្តបានបរាជ័យ" />;
  }

  const user = await getServerUser();
  if (!user) {
    return <StatusCard type="error" title="មិនបានចូលគណនី" message="សូម​ចូល​គណនី​ហើយ​ព្យាយាម​ម្ដងទៀត" />;
  }

  let data: PaymentData | null = null;
  let fetchError: string | null = null;

  try {
    data = await serverApi<PaymentData>(`/payments/${transactionId}/status`, { withAuth: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    fetchError = err.status === 404
      ? "រកមិនឃើញការទូទាត់នេះ"
      : (err.message ?? "មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់");
  }

  if (fetchError || !data) {
    return <StatusCard type="error" title="រកមិនឃើញ" message={fetchError ?? "មានបញ្ហា"} />;
  }

  const { payment, movie_purchase } = data;
  const isPaid    = payment.status === "paid";
  const isPending = payment.status === "pending";

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-5">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={isPaid
          ? { background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.3)" }
          : isPending
          ? { background: "rgba(201,168,53,0.12)", border: "2px solid rgba(201,168,53,0.3)" }
          : { background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)" }}>
        {isPaid ? (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : isPending ? (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        ) : (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        )}
      </div>

      {/* Text */}
      <div className="text-center">
        <h2 className="text-lg font-black mb-1" style={{ color: "#f0f0f0" }}>
          {isPaid ? "ការទូទាត់បានជោគជ័យ" : isPending ? "កំពុងរង់ចាំបញ្ជាក់" : "ការទូទាត់បានបរាជ័យ"}
        </h2>
        <p className="text-sm" style={{ color: "#555" }}>
          {isPaid
            ? "អរគុណ! ការទូទាត់របស់អ្នកបានជោគជ័យ"
            : isPending
            ? "ការទូទាត់នៅមិនទាន់ត្រូវបានបញ្ជាក់"
            : "សូម​ព្យាយាម​ម្ដង​ទៀត"}
        </p>
      </div>

      {/* Details */}
      <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <DetailRow label="Transaction" value={payment.reference_no} mono />
        <DetailRow
          label="ចំនួន"
          value={`$${Number(payment.amount).toFixed(2)} ${payment.currency}`}
        />
        <DetailRow
          label="ស្ថានភាព"
          value={isPaid ? "បានទូទាត់" : isPending ? "Pending" : "បរាជ័យ"}
          valueColor={isPaid ? "#22c55e" : isPending ? "#c9a835" : "#ef4444"}
          last
        />
      </div>

      {/* Movie link */}
      {movie_purchase?.movie && (
        <Link
          href={`/movie/${movie_purchase.movie.slug}`}
          target="_top"
          className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 20px rgba(201,168,53,0.3)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {isPaid ? "ចុចមើលរឿង" : "ត្រលប់ទៅរឿង"}
        </Link>
      )}

      {!movie_purchase?.movie && (
        <Link
          href="/"
          target="_top"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#777" }}>
          ទំព័រដើម
        </Link>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  valueColor,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3"
      style={{
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)",
        background: "rgba(255,255,255,0.02)",
      }}>
      <span className="text-xs" style={{ color: "#555" }}>{label}</span>
      <span className={`text-xs font-semibold ${mono ? "font-mono" : ""}`}
        style={{ color: valueColor ?? "#bbb", maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>
        {value}
      </span>
    </div>
  );
}

function StatusCard({ type, title, message }: { type: "error"; title: string; message: string }) {
  void type;
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)" }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-black mb-1" style={{ color: "#f0f0f0" }}>{title}</h2>
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
