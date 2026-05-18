"use client";

import { getMovieRating, type ApiMovie } from "../lib/api";

const qualityStyle: Record<string, { bg: string }> = {
  "4K": { bg: "#1d4ed8" },
  FHD:  { bg: "#b45309" },
  HD:   { bg: "#15803d" },
  CAM:  { bg: "#4b5563" },
};

const paymentLabels: Record<string, string> = {
  khqr:    "KHQR",
  balance: "Balance",
  credit:  "Credit",
};

export default function MovieCard({ movie }: { movie: ApiMovie }) {
  const quality        = movie.quality ?? "HD";
  const qBg            = (qualityStyle[quality] ?? qualityStyle["HD"]).bg;
  const year           = movie.release_year ?? (movie.release_date ? new Date(movie.release_date).getFullYear() : 0);
  const image          = movie.poster_url ?? movie.thumbnail_url ?? movie.backdrop_url;
  const { average: rating } = getMovieRating(movie);
  const gradient       = movie.gradient ?? "linear-gradient(160deg,#1a1a2e 0%,#0d0d12 100%)";
  const paymentMethods = (movie.purchase?.available_payment_methods ?? []).filter(m => paymentLabels[m]);
  const price          = movie.price;

  return (
    <div
      className="group shrink-0 block"
      style={{ width: "160px" }}
    >
      {/* ── Poster frame (2:3 ratio) ── */}
      <div
        className="relative overflow-hidden"
        style={{
          width: "160px",
          height: "240px",
          borderRadius: "10px",
          background: gradient,
          boxShadow: "0 6px 22px rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.07)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "scale(1.05) translateY(-3px)";
          el.style.boxShadow = "0 14px 40px rgba(0,0,0,0.75), 0 0 0 1.5px rgba(201,168,53,0.45)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "scale(1) translateY(0)";
          el.style.boxShadow = "0 6px 22px rgba(0,0,0,0.65)";
        }}
      >
        {/* Poster image */}
        {image && (
          <img
            src={image}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Cinematic bottom gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.1) 62%, transparent 100%)",
          }}
        />

        {/* ── TOP-LEFT: Free / Price badge ── */}
        {price != null && price > 0 ? (
          <span
            className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md tracking-wide"
            style={{ background: "#dc2626", color: "#fff", boxShadow: "0 2px 6px rgba(220,38,38,0.5)" }}
          >
            ${price}
          </span>
        ) : (
          <span
            className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md tracking-wide"
            style={{ background: "#16a34a", color: "#fff", boxShadow: "0 2px 6px rgba(22,163,74,0.5)" }}
          >
            FREE
          </span>
        )}

        {/* ── TOP-RIGHT: Quality badge ── */}
        <span
          className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-widest"
          style={{ background: qBg, color: "#fff" }}
        >
          {quality}
        </span>

        {/* ── BOTTOM CONTENT (always visible) ── */}
        <div className="absolute bottom-0 inset-x-0 px-2.5 pb-2.5 flex flex-col gap-1.5">
          {/* Payment method pills */}
          {paymentMethods.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {paymentMethods.map((m) => (
                <span
                  key={m}
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {paymentLabels[m]}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3
            className="text-white font-bold leading-tight"
            style={{
              fontSize: "12px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 1px 6px rgba(0,0,0,0.9)",
            }}
          >
            {movie.title}
          </h3>

          {/* Year + Rating */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
              {year || "—"}
            </span>
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 20 20" fill="#f59e0b">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[10px] font-bold" style={{ color: "#f59e0b" }}>
                {(rating ?? 0).toFixed(1)}
              </span>
            </span>
          </div>
        </div>

        {/* ── HOVER: play overlay ── */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.28)", transition: "opacity 0.25s ease" }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: "44px",
              height: "44px",
              background: "rgba(201,168,53,0.93)",
              boxShadow: "0 0 28px rgba(201,168,53,0.6)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d0d12">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
