"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KhqrPayModal from "../../components/KhqrPayModal";
import {
  preparePurchaseKhqrAction,
  purchaseWithBalanceAction,
  purchaseMovieAction,
} from "../../actions/movie-actions";

export default function PurchaseButton({
  slug,
  movieTitle,
  requiresPurchase,
  price,
  canBuyCredit,
  canBuyBalance,
  isLoggedIn,
}: {
  slug: string;
  movieTitle: string;
  requiresPurchase: boolean;
  price: number | undefined;
  canBuyCredit: boolean;
  canBuyBalance: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  type KhqrModalState = { paymentUrl: string; transactionId: string; amount: string };
  const [khqrModal, setKhqrModal] = useState<KhqrModalState | null>(null);
  const [buyingKhqr, setBuyingKhqr] = useState(false);
  const [buyingBal, setBuyingBal] = useState(false);
  const [buyingBalAct, setBuyingBalAct] = useState(false);
  const [buyMsg, setBuyMsg] = useState<string | null>(null);

  async function handleBuyKhqr() {
    setBuyingKhqr(true); setBuyMsg(null);
    const res = await preparePurchaseKhqrAction(slug);
    setBuyingKhqr(false);
    if (res.ok && res.data) {
      const d = res.data as { payment_url?: string; transaction_id?: string; amount?: number };
      setKhqrModal({ paymentUrl: d.payment_url ?? "", transactionId: d.transaction_id ?? "", amount: `$${d.amount ?? ""}` });
    } else {
      if (res.message?.toLowerCase().includes("already purchased")) {
        router.push(`/movie/${slug}/player`);
        return;
      }
      setBuyMsg(res.message ?? "Could not create payment.");
    }
  }

  async function handleBuyBalance() {
    setBuyingBal(true); setBuyMsg(null);
    const res = await purchaseWithBalanceAction(slug);
    setBuyingBal(false);
    if (res.ok) { router.refresh(); }
    else if (res.message?.toLowerCase().includes("already purchased")) {
      router.push(`/movie/${slug}/player`);
    } else { setBuyMsg(res.message ?? "Purchase failed."); }
  }

  async function handleBuyWithBalance() {
    setBuyingBalAct(true); setBuyMsg(null);
    const res = await purchaseMovieAction(slug, "balance");
    setBuyingBalAct(false);
    if (res.ok) { router.refresh(); }
    else if (res.data?.can_watch) {
      router.push(`/movie/${slug}/player`);
    } else { setBuyMsg(res.message ?? "Purchase failed."); }
  }

  return (
    <>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(201,168,53,0.15)", border: "2px solid rgba(201,168,53,0.4)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#c9a835">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        {!isLoggedIn ? (
          <>
            <p className="text-sm font-semibold" style={{ color: "#bbb" }}>
              ត្រូវការចូលគណនីដើម្បីមើលរឿង
            </p>
            <Link href={`/login?redirect=/movie/${slug}`}
              className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12",
                boxShadow: "0 4px 20px rgba(201,168,53,0.35)" }}>
              ចូលគណនី
            </Link>
          </>
        ) : requiresPurchase ? (
          <>
            <p className="text-sm font-semibold" style={{ color: "#bbb" }}>
              រឿងនេះត្រូវការទូទាត់ · {price ? `$${price}` : ""}
            </p>
            {buyMsg && <p className="text-xs" style={{ color: "#ef4444" }}>{buyMsg}</p>}
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={handleBuyKhqr} disabled={buyingKhqr || buyingBal || buyingBalAct}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12",
                  boxShadow: "0 4px 20px rgba(201,168,53,0.35)", cursor: buyingKhqr ? "not-allowed" : "pointer" }}>
                {buyingKhqr && <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                ទិញដោយ KHQR
              </button>
              {canBuyBalance && (
                <button onClick={handleBuyWithBalance} disabled={buyingKhqr || buyingBal || buyingBalAct}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 flex items-center gap-2"
                  style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399",
                    cursor: buyingBalAct ? "not-allowed" : "pointer" }}>
                  {buyingBalAct && <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                  ទិញដោយ Balance
                </button>
              )}
              {canBuyCredit && (
                <button onClick={handleBuyBalance} disabled={buyingKhqr || buyingBal || buyingBalAct}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 flex items-center gap-2"
                  style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.4)", color: "#c9a835",
                    cursor: buyingBal ? "not-allowed" : "pointer" }}>
                  {buyingBal && <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                  ទិញដោយ Credit
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm" style={{ color: "#666" }}>មិនទាន់មានប្រភព</p>
        )}
      </div>

      {khqrModal && (
        <KhqrPayModal
          paymentUrl={khqrModal.paymentUrl}
          transactionId={khqrModal.transactionId}
          amount={khqrModal.amount}
          label={movieTitle}
          onSuccess={() => { setKhqrModal(null); router.refresh(); }}
          onClose={() => setKhqrModal(null)}
        />
      )}
    </>
  );
}
