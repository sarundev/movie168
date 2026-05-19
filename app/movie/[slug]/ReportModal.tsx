"use client";

import { useState } from "react";
import { submitReportAction } from "../../actions/movie-actions";

export default function ReportModal({
  movieId,
  token,
}: {
  movieId: number;
  token: string | null;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);

  async function submitReport() {
    if (!token || !reportReason.trim()) return;
    try {
      const res = await submitReportAction("movie", movieId, reportReason);
      if (res.ok) {
        setReportSent(true);
        setTimeout(() => setReportOpen(false), 2000);
      }
    } catch {}
  }

  return (
    <>
      <button onClick={() => setReportOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
        style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.25)", color: "#c9a835" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
        </svg>
        រាយការណ៍
      </button>

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setReportOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-black mb-4" style={{ color: "#f0f0f0" }}>រាយការណ៍បញ្ហា</h3>
            {reportSent ? (
              <p className="text-sm" style={{ color: "#22c55e" }}>អរគុណ! បានរាយការណ៍</p>
            ) : (
              <>
                <textarea value={reportReason} onChange={e => setReportReason(e.target.value)}
                  aria-label="ពណ៌នាបញ្ហា"
                  placeholder="ពណ៌នាបញ្ហា..." rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }} />
                <div className="flex gap-3">
                  <button onClick={() => setReportOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#666" }}>លប់ចោល</button>
                  <button onClick={submitReport} disabled={!reportReason.trim()} className="flex-1 py-2.5 rounded-lg text-sm font-bold"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                    រាយការណ៍
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
