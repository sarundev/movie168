"use client";

import { useState } from "react";
import Link from "next/link";
import { submitRatingAction } from "../../actions/movie-actions";

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0 flex-wrap -mx-1.5">
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)} className="transition-transform hover:scale-125 active:scale-95 p-1.5"
          style={{ touchAction: "manipulation" }} aria-label={`Rate ${n}`}>
          <svg width="20" height="20" viewBox="0 0 20 20"
            fill={(hover || value) >= n ? "#c9a835" : "rgba(255,255,255,0.12)"}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      ))}
      {value > 0 && <span className="text-sm font-bold ml-2" style={{ color: "#c9a835" }}>{value}/10</span>}
    </div>
  );
}

export default function StarRating({
  movieId,
  slug,
  initialMyRating,
  token,
}: {
  movieId: number;
  slug: string;
  initialMyRating: number;
  token: string | null;
}) {
  const [myRating, setMyRating] = useState(initialMyRating);
  const [ratingDone, setRatingDone] = useState(initialMyRating > 0);

  async function submitRating(val: number) {
    if (!token) return;
    setMyRating(val);
    try {
      const res = await submitRatingAction(movieId, slug, val);
      if (res.ok) setRatingDone(true);
    } catch {}
  }

  return (
    <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
        <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>វាយតម្លៃរឿង</h2>
      </div>
      {token ? (
        ratingDone ? (
          <p className="text-sm" style={{ color: "#22c55e" }}>អរគុណ! អ្នកបានវាយតម្លៃ {myRating}/10</p>
        ) : (
          <div>
            <p className="text-xs mb-3" style={{ color: "#555" }}>ចុចដើម្បីវាយតម្លៃ (1–10)</p>
            <Stars value={myRating} onChange={submitRating} />
          </div>
        )
      ) : (
        <p className="text-sm" style={{ color: "#555" }}>
          <Link href="/login" style={{ color: "#c9a835" }} className="hover:underline">ចូលគណនី</Link> ដើម្បីវាយតម្លៃ
        </p>
      )}
    </div>
  );
}
