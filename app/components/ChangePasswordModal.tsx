"use client";

import { useState } from "react";
import { updatePasswordAction } from "../actions/profile-actions";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2"
      style={{ color: "#555" }}>
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}

export default function ChangePasswordModal({ onSuccess, onClose }: Props) {
  const [current,      setCurrent]      = useState("");
  const [newPass,      setNewPass]      = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!current) { setError("សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"); return; }
    if (!newPass) { setError("សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី"); return; }
    if (newPass.length < 8) { setError("ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៨ តួរ"); return; }
    if (newPass !== confirm) { setError("ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នា"); return; }

    setLoading(true);
    const res = await updatePasswordAction(current, newPass, confirm);
    setLoading(false);

    if (res.ok) {
      onSuccess();
    } else {
      setError(res.message ?? "មិនអាចប្ដូរពាក្យសម្ងាត់បានទេ");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span className="font-black text-sm" style={{ color: "#f0f0f0" }}>ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
          <button onClick={onClose} style={{ color: "#555" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#555" }}>ពាក្យសម្ងាត់បច្ចុប្បន្ន</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ddd" }}
                autoFocus />
              <EyeBtn show={showCurrent} toggle={() => setShowCurrent(!showCurrent)} />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#555" }}>ពាក្យសម្ងាត់ថ្មី</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ddd" }} />
              <EyeBtn show={showNew} toggle={() => setShowNew(!showNew)} />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#555" }}>បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ddd" }} />
              <EyeBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
            </div>
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: "#ef4444" }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
            style={{
              background: loading ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg,#c9a835,#8b6914)",
              color: loading ? "#333" : "#0d0d12",
              boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,53,0.3)",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
            {loading && <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
            {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
          </button>
        </form>
      </div>
    </div>
  );
}
