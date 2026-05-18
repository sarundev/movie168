"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MovieRow from "../../components/MovieRow";
import { getMovieRating, type ApiMovie, type ApiComment } from "../../lib/api";
import type { ServerUser } from "../../lib/server-auth";
import { buildPlaybackUrl } from "../../lib/player";
import KhqrPayModal from "../../components/KhqrPayModal";
import {
  preparePurchaseKhqrAction,
  purchaseWithBalanceAction,
  purchaseMovieAction,
  submitRatingAction,
  submitCommentAction,
  replyCommentAction,
  reactCommentAction,
  removeCommentReactionAction,
  submitReportAction,
} from "../../actions/movie-actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const qualityBg: Record<string, string> = { "4K": "#1d4ed8", FHD: "#b45309", HD: "#15803d" };

const mockCastColors = [
  "linear-gradient(135deg,#7c2d12,#c2410c)",
  "linear-gradient(135deg,#1e1b4b,#4c1d95)",
  "linear-gradient(135deg,#064e3b,#15803d)",
  "linear-gradient(135deg,#701a75,#9d174d)",
  "linear-gradient(135deg,#0c4a6e,#0369a1)",
  "linear-gradient(135deg,#92400e,#b45309)",
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "ឥឡូវ";
  if (m < 60) return `${m} នាទីមុន`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ម៉ោងមុន`;
  return `${Math.floor(h / 24)} ថ្ងៃមុន`;
}

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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

// ─── Comment item ─────────────────────────────────────────────────────────────

function CommentItem({ comment, movieSlug, isLoggedIn, depth = 0, onReplyAdded }: {
  comment: ApiComment; movieSlug: string; isLoggedIn: boolean; depth?: number;
  onReplyAdded: (parentId: number, reply: ApiComment) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myReaction, setMyReaction] = useState<"like" | "dislike" | null>(comment.my_reaction ?? null);
  const [likes,    setLikes]    = useState(comment.likes_count);
  const [dislikes, setDislikes] = useState(comment.dislikes_count);

  async function handleReact(type: "like" | "dislike") {
    if (!isLoggedIn) return;
    try {
      if (myReaction === type) {
        await removeCommentReactionAction(comment.id, movieSlug);
        setMyReaction(null);
        if (type === "like") setLikes(l => l - 1); else setDislikes(d => d - 1);
      } else {
        if (myReaction) { if (myReaction === "like") setLikes(l => l - 1); else setDislikes(d => d - 1); }
        await reactCommentAction(comment.id, movieSlug, type);
        setMyReaction(type);
        if (type === "like") setLikes(l => l + 1); else setDislikes(d => d + 1);
      }
    } catch {}
  }

  async function submitReply() {
    if (!isLoggedIn || !replyBody.trim()) return;
    setSubmitting(true);
    try {
      const res = await replyCommentAction(comment.id, movieSlug, replyBody.trim());
      if (res.ok && res.data) {
        const raw = res.data as { data?: ApiComment } | ApiComment;
        const reply = (raw as { data?: ApiComment }).data ?? (raw as ApiComment);
        onReplyAdded(comment.id, reply);
      }
      setReplyBody(""); setReplyOpen(false);
    } catch {} finally { setSubmitting(false); }
  }

  return (
    <div style={{ marginLeft: depth > 0 ? "clamp(16px,5vw,36px)" : "0" }}>
      <div className="flex gap-2.5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
          style={{ background: "linear-gradient(135deg,#c9a835,#8b6914)", color: "#0d0d12" }}>
          {(comment.user?.name ?? "?").slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold" style={{ color: "#ddd" }}>{comment.user?.name ?? "Anonymous"}</span>
            <span className="text-xs" style={{ color: "#555" }}>{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#bbb" }}>{comment.body}</p>
          <div className="flex items-center gap-1 mt-1 -ml-2">
            <button onClick={() => handleReact("like")}
              aria-label={`Like (${likes})`}
              className="flex items-center gap-1 text-xs transition-colors px-2 py-1.5"
              style={{ color: myReaction === "like" ? "#c9a835" : "#555", touchAction: "manipulation" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88z"/>
              </svg>
              {likes}
            </button>
            <button onClick={() => handleReact("dislike")}
              aria-label={`Dislike (${dislikes})`}
              className="flex items-center gap-1 text-xs transition-colors px-2 py-1.5"
              style={{ color: myReaction === "dislike" ? "#ef4444" : "#555", touchAction: "manipulation" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 14V2M9 18.12L10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88z"/>
              </svg>
              {dislikes}
            </button>
            {isLoggedIn && depth === 0 && (
              <button onClick={() => setReplyOpen(r => !r)}
                className="text-xs transition-colors px-2 py-1.5"
                style={{ color: "#555", touchAction: "manipulation" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#c9a835")}
                onMouseLeave={e => (e.currentTarget.style.color = "#555")}>
                ឆ្លើយតប
              </button>
            )}
          </div>
          {replyOpen && (
            <div className="flex flex-col gap-2 mt-3">
              <input value={replyBody} onChange={e => setReplyBody(e.target.value)}
                aria-label="ឆ្លើយតប"
                placeholder="ឆ្លើយតប..." className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(); }}} />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setReplyOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#666" }}>លប់ចោល</button>
                <button onClick={submitReply} disabled={submitting || !replyBody.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(201,168,53,0.15)", color: "#c9a835", border: "1px solid rgba(201,168,53,0.3)" }}>
                  {submitting ? "..." : "បញ្ជូន"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map((reply, i) => (
        <CommentItem key={reply.id ?? i} comment={reply} movieSlug={movieSlug} isLoggedIn={isLoggedIn} depth={depth + 1} onReplyAdded={onReplyAdded} />
      ))}
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export default function MovieDetailClient({
  movie,
  slug,
  user,
  initialComments,
  sessionToken,
  userCreditBalance = 0,
}: {
  movie: ApiMovie;
  slug: string;
  user: ServerUser | null;
  initialComments: ApiComment[];
  sessionToken: string | null;
  userCreditBalance?: number;
}) {
  const token = user?.token;

  const [comments,     setComments]     = useState<ApiComment[]>(initialComments);
  const initialMyRating = typeof movie.rating === "object" ? (movie.rating?.my_rating ?? 0) : 0;
  const [myRating,     setMyRating]     = useState(initialMyRating);
  const [ratingDone,   setRatingDone]   = useState(initialMyRating > 0);
  const [newComment,   setNewComment]   = useState("");
  const [posting,      setPosting]      = useState(false);
  const [reportOpen,   setReportOpen]   = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent,   setReportSent]   = useState(false);

  const [backdropErr,  setBackdropErr]  = useState(false);
  const [miniPosterErr,setMiniPosterErr]= useState(false);

  type KhqrModal = { paymentUrl: string; transactionId: string; amount: string };
  const [khqrModal,    setKhqrModal]    = useState<KhqrModal | null>(null);
  const [buyingKhqr,   setBuyingKhqr]   = useState(false);
  const [buyingBal,    setBuyingBal]    = useState(false);
  const [buyingBalAct, setBuyingBalAct] = useState(false);
  const [buyMsg,       setBuyMsg]       = useState<string | null>(null);

  async function handleBuyKhqr() {
    setBuyingKhqr(true); setBuyMsg(null);
    const res = await preparePurchaseKhqrAction(slug);
    setBuyingKhqr(false);
    if (res.ok && res.data) {
      const d = res.data as { payment_url?: string; transaction_id?: string; amount?: number };
      setKhqrModal({ paymentUrl: d.payment_url ?? "", transactionId: d.transaction_id ?? "", amount: `$${d.amount ?? ""}` });
    } else {
      if (res.message?.toLowerCase().includes("already purchased")) {
        window.location.href = `/movie/${slug}/player`;
        return;
      }
      setBuyMsg(res.message ?? "Could not create payment.");
    }
  }

  async function handleBuyBalance() {
    setBuyingBal(true); setBuyMsg(null);
    const res = await purchaseWithBalanceAction(slug);
    setBuyingBal(false);
    if (res.ok) { window.location.reload(); }
    else if (res.message?.toLowerCase().includes("already purchased")) {
      window.location.href = `/movie/${slug}/player`;
    } else { setBuyMsg(res.message ?? "Purchase failed."); }
  }

  async function handleBuyWithBalance() {
    setBuyingBalAct(true); setBuyMsg(null);
    const res = await purchaseMovieAction(slug, "balance");
    setBuyingBalAct(false);
    if (res.ok) { window.location.reload(); }
    else if (res.data?.can_watch) {
      window.location.href = `/movie/${slug}/player`;
    } else { setBuyMsg(res.message ?? "Purchase failed."); }
  }

  async function submitRating(val: number) {
    if (!token) return;
    setMyRating(val);
    try {
      const res = await submitRatingAction(movie.id, slug, val);
      if (res.ok) setRatingDone(true);
    } catch {}
  }

  async function submitComment() {
    if (!token || !newComment.trim()) return;
    setPosting(true);
    try {
      const res = await submitCommentAction(movie.id, slug, newComment.trim());
      if (res.ok && res.data) {
        const raw = res.data as { data?: ApiComment } | ApiComment;
        const c = (raw as { data?: ApiComment }).data ?? (raw as ApiComment);
        setComments(prev => [c, ...prev]);
        setNewComment("");
      }
    } catch {} finally { setPosting(false); }
  }

  function handleReplyAdded(parentId: number, reply: ApiComment) {
    setComments(prev => prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c));
  }

  async function submitReport() {
    if (!token || !reportReason.trim()) return;
    try {
      const res = await submitReportAction("movie", movie.id, reportReason);
      if (res.ok) {
        setReportSent(true);
        setTimeout(() => setReportOpen(false), 2000);
      }
    } catch {}
  }

  const poster      = movie.backdrop_url ?? movie.poster_url ?? movie.thumbnail_url;
  const miniPoster  = movie.poster_url ?? movie.thumbnail_url;
  const qColor      = qualityBg[movie.quality ?? ""] ?? "#15803d";
  const { average: ratingAvg, count: ratingCount } = getMovieRating(movie);
  const movieGenres = movie.genres ?? [];
  const castNames:  string[] = (movie.casts ?? []).map(c => c.name);
  const isPurchased      = movie.purchase?.is_purchased ?? movie.is_purchased ?? false;
  const requiresPurchase = !isPurchased && (movie.purchase?.requires_purchase ?? movie.requires_purchase ?? false);
  const paymentMethods   = movie.purchase?.available_payment_methods ?? [];
  const canBuyCredit     = paymentMethods.includes("credit");
  const canBuyBalance    = paymentMethods.includes("balance");

  const releaseYear = movie.release_year
    ?? (movie.release_date ? new Date(movie.release_date).getFullYear() : undefined);
  const runtime = movie.runtime_minutes
    ? `${Math.floor(movie.runtime_minutes / 60)}h ${movie.runtime_minutes % 60}m` : undefined;
  const defaultSource = movie.sources?.find(s => s.is_default && s.can_watch)
    ?? movie.sources?.find(s => s.can_watch);
  const related: ApiMovie[] = movie.related_movies ?? [];
  const sidebarMovies: ApiMovie[] = related.length > 0
    ? [...related].sort((a, b) => {
        const ra = typeof a.rating === "object" ? (a.rating?.average ?? 0) : (a.vote_average ?? 0);
        const rb = typeof b.rating === "object" ? (b.rating?.average ?? 0) : (b.vote_average ?? 0);
        return rb - ra;
      }).slice(0, 10)
    : [];

  return (
    <div className="min-h-screen md:pt-4 pt-20" style={{ background: "#111116" }}>

      <Navbar />

      {/* ── Player section ── */}
      <div style={{ background: "#000", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="relative w-full mx-auto" style={{ maxWidth: "1350px", aspectRatio: "16/9" }}>
          {sessionToken && user ? (
            <iframe
              src={buildPlaybackUrl({ sessionToken, movieSlug: slug, sourceId: defaultSource?.id })}
              title={movie.title}
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : (
            <>
              {poster && !backdropErr && (
                <Image
                  src={poster}
                  alt={movie.title}
                  fill
                  priority
                  className="object-cover"
                  style={{ filter: "brightness(0.35)" }}
                  sizes="100vw"
                  onError={() => setBackdropErr(true)}
                />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(201,168,53,0.15)", border: "2px solid rgba(201,168,53,0.4)" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#c9a835">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                {!user ? (
                  <>
                    <p className="text-sm font-semibold" style={{ color: "#bbb" }}>
                      ត្រូវការចូលគណនីដើម្បីមើលរឿង
                    </p>
                    <a href={`/login?redirect=/movie/${slug}`}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12",
                        boxShadow: "0 4px 20px rgba(201,168,53,0.35)" }}>
                      ចូលគណនី
                    </a>
                  </>
                ) : requiresPurchase ? (
                  <>
                    <p className="text-sm font-semibold" style={{ color: "#bbb" }}>
                      រឿងនេះត្រូវការទូទាត់ · {movie.price ? `$${movie.price}` : ""}
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
                      {canBuyBalance && !backdropErr && (
                        <button onClick={handleBuyWithBalance} disabled={buyingKhqr || buyingBal || buyingBalAct}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 flex items-center gap-2"
                          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399",
                            cursor: buyingBalAct ? "not-allowed" : "pointer" }}>
                          {buyingBalAct && <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                          ទិញដោយ Balance
                        </button>
                      )}
                      {canBuyCredit && !backdropErr && (
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
            </>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="px-3 sm:px-5 lg:px-10 pb-16" style={{ marginTop: "-2px" }}>
        <div className="flex flex-col lg:flex-row gap-6 max-w-screen-xl mx-auto">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {!user && (
              <div className="rounded-xl px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <a href={`/login?redirect=/movie/${slug}/player${defaultSource ? `?source=${defaultSource.id}` : ""}`}
                  className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12",
                    boxShadow: "0 4px 16px rgba(201,168,53,0.3)", touchAction: "manipulation" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  ចុចមើលរឿង
                </a>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span className="text-xs" style={{ color: "#666" }}>
                    ត្រូវការ <a href={`/login?redirect=/movie/${slug}`} className="hover:underline" style={{ color: "#c9a835" }}>ចូលគណនី</a> ដើម្បីមើល
                  </span>
                </div>
              </div>
            )}

            {/* Movie info card */}
            <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-4">
                <div className="relative rounded-lg overflow-hidden shrink-0"
                  style={{ width: "90px", aspectRatio: "2/3", background: "#2a2a35" }}>
                  {miniPoster && !miniPosterErr && (
                    <Image
                      src={miniPoster}
                      alt={movie.title}
                      fill
                      priority
                      className="object-cover"
                      sizes="90px"
                      onError={() => setMiniPosterErr(true)}
                    />
                  )}
                  {movie.quality && (
                    <span className="absolute bottom-1 left-1 text-[8px] font-black px-1 py-0.5 rounded"
                      style={{ background: qColor, color: "white" }}>{movie.quality}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="font-black text-white leading-tight mb-1" style={{ fontSize: "clamp(1.1rem,3vw,1.5rem)" }}>
                    {movie.title}
                  </h1>
                  {movie.original_title && (
                    <p className="text-xs mb-2 truncate" style={{ color: "#666" }}>{movie.original_title}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-3" style={{ color: "#666" }}>
                    {releaseYear && <span>{releaseYear}</span>}
                    {movie.country_code && <><span>•</span><span>{movie.country_code}</span></>}
                    {runtime && <><span>•</span><span>{runtime}</span></>}
                    {movie.age_rating && <><span>•</span><span style={{ color: "#ef4444" }}>{movie.age_rating}</span></>}
                  </div>

                  {ratingAvg != null && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-black" style={{ color: "#c9a835" }}>
                        {Number(ratingAvg).toFixed(1)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <svg key={n} width="11" height="11" viewBox="0 0 20 20"
                            fill={n <= Math.round(ratingAvg!) ? "#c9a835" : "rgba(255,255,255,0.15)"}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      {ratingCount != null && (
                        <span className="text-xs" style={{ color: "#555" }}>{ratingCount} votes</span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {movieGenres.map(g => (
                      <a key={g.id} href={`/movies?genre=${g.slug ?? g.name.toLowerCase()}`}
                        className="text-[11px] px-2.5 py-0.5 rounded transition-colors hover:text-amber-400"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa" }}>
                        {g.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={() => setReportOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.25)", color: "#c9a835" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
                  </svg>
                  រាយការណ៍
                </button>
                <div className="flex-1" />
                <span className="text-xs" style={{ color: "#444" }}>{movie.comments_count ?? 0} comments</span>
              </div>
            </div>

            {/* Synopsis */}
            {movie.overview && (
              <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                  <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>សង្ខេប</h2>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#999" }}>{movie.overview}</p>
              </div>
            )}

            {/* Cast */}
            {castNames.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                  <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>តារា</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {castNames.map((name: string, i: number) => (
                    <div key={name} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black transition-all group-hover:scale-110"
                        style={{ background: mockCastColors[i % mockCastColors.length], color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                        {name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] text-center w-16 line-clamp-2 group-hover:text-amber-400 transition-colors" style={{ color: "#777" }}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info table */}
            <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                movie.type        && { label: "ប្រភេទ",   value: movie.type === "movie" ? "រឿង" : "រឿងភ្លើង" },
                releaseYear       && { label: "ឆ្នាំ",     value: String(releaseYear) },
                runtime           && { label: "រយៈពេល",   value: runtime },
                movie.country_code && { label: "ប្រទេស",   value: movie.country_code },
                movie.access_type && { label: "ការចូលមើល", value: movie.access_type === "free" ? "ឥតគិតថ្លៃ" : `$${movie.price ?? "—"}` },
              ].filter(Boolean).map(row => {
                const { label, value } = row as { label: string; value: string };
                return (
                  <div key={label} className="flex items-center py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span className="text-xs w-28 shrink-0 font-medium" style={{ color: "#555" }}>{label}</span>
                    <span className="text-sm" style={{ color: "#bbb" }}>{value}</span>
                  </div>
                );
              })}
            </div>

            {/* Rating widget */}
            <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>វាយតម្លៃរឿង</h2>
              </div>
              {user ? (
                ratingDone ? (
                  <p className="text-sm" style={{ color: "#22c55e" }}>អរគុណ! អ្នកបានវាយតម្លៃ {myRating}/10</p>
                ) : (
                  <div>
                    <p className="text-xs mb-3" style={{ color: "#555" }}>ចុចដើម្បីវាយតម្លៃ (1–10)</p>
                    <StarRating value={myRating} onChange={submitRating} />
                  </div>
                )
              ) : (
                <p className="text-sm" style={{ color: "#555" }}>
                  <a href="/login" style={{ color: "#c9a835" }} className="hover:underline">ចូលគណនី</a> ដើម្បីវាយតម្លៃ
                </p>
              )}
            </div>

            {/* Comments */}
            <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>
                  មតិយោបល់{comments.length > 0 && <span className="font-normal ml-1.5" style={{ color: "#555" }}>({comments.length})</span>}
                </h2>
              </div>

              {user ? (
                <div className="flex gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: "linear-gradient(135deg,#c9a835,#8b6914)", color: "#0d0d12" }}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                      aria-label="សរសេរមតិ"
                      placeholder="សរសេរមតិ..." rows={2}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#f0f0f0" }} />
                    <div className="flex justify-end">
                      <button onClick={submitComment} disabled={posting || !newComment.trim()}
                        className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{ background: newComment.trim() ? "rgba(201,168,53,0.15)" : "rgba(255,255,255,0.03)",
                          color: newComment.trim() ? "#c9a835" : "#444", border: "1px solid rgba(201,168,53,0.3)" }}>
                        {posting ? "..." : "បញ្ជូន"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-5 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#555" }}>
                  <a href="/login" style={{ color: "#c9a835" }} className="hover:underline">ចូលគណនី</a>&nbsp;ដើម្បីបញ្ចេញមតិ
                </div>
              )}

              {comments.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: "#444" }}>មិនទាន់មានមតិ</p>
              ) : (
                <div className="space-y-1">
                  {comments.map((c, i) => (
                    <CommentItem key={c.id ?? i} comment={c} movieSlug={slug} isLoggedIn={!!token} onReplyAdded={handleReplyAdded} />
                  ))}
                </div>
              )}
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <MovieRow title="ដូចគ្នា KH" movies={related} />
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-20 rounded-xl overflow-hidden" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                  <h3 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>ចំណាត់ថ្នាក់ទំព 10 ប្រចាំសប្តាហ៍</h3>
                </div>
              </div>
              <div className="lg:hidden flex overflow-x-auto gap-3 px-3 py-3 hide-scrollbar">
                {sidebarMovies.map(m => (
                  <a key={m.id} href={`/movie/${m.slug}`}
                    className="flex flex-col shrink-0 gap-1.5 group" style={{ touchAction: "manipulation" }}>
                    <div className="relative rounded-lg overflow-hidden"
                      style={{ width: "68px", height: "95px", background: "#2a2a35" }}>
                      {(m.poster_url ?? m.thumbnail_url) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.poster_url ?? m.thumbnail_url} alt={m.title} className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      )}
                    </div>
                    <p className="text-[10px] text-center leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors"
                      style={{ color: "#bbb", width: "68px" }}>{m.title}</p>
                  </a>
                ))}
              </div>
              <div className="hidden lg:block">
                {sidebarMovies.map(m => (
                  <a key={m.id} href={`/movie/${m.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors group"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <div className="relative rounded-lg overflow-hidden shrink-0"
                      style={{ width: "56px", height: "78px", background: "#2a2a35" }}>
                      {(m.poster_url ?? m.thumbnail_url) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.poster_url ?? m.thumbnail_url} alt={m.title} className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors"
                        style={{ color: "#ddd" }}>{m.title}</p>
                      <p className="text-[10px] mt-1" style={{ color: "#555" }}>{m.release_year ?? ""}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="gold-divider mx-4 sm:mx-6 lg:mx-12 mb-2" />
      <Footer />

      {/* KHQR buy modal */}
      {khqrModal && (
        <KhqrPayModal
          paymentUrl={khqrModal.paymentUrl}
          transactionId={khqrModal.transactionId}
          amount={khqrModal.amount}
          label={movie.title}
          onSuccess={() => { setKhqrModal(null); window.location.reload(); }}
          onClose={() => setKhqrModal(null)}
        />
      )}

      {/* Report modal */}
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
    </div>
  );
}
