"use client";

import { useState } from "react";
import Link from "next/link";
import { type ApiComment } from "../../lib/api";
import {
  submitCommentAction,
  replyCommentAction,
  reactCommentAction,
  removeCommentReactionAction,
} from "../../actions/movie-actions";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "ឥឡូវ";
  if (m < 60) return `${m} នាទីមុន`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ម៉ោងមុន`;
  return `${Math.floor(h / 24)} ថ្ងៃមុន`;
}

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

export default function CommentSection({
  movieId,
  slug,
  initialComments,
  token,
  userName,
}: {
  movieId: number;
  slug: string;
  initialComments: ApiComment[];
  token: string | null;
  userName: string;
}) {
  const [comments, setComments] = useState<ApiComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  async function submitComment() {
    if (!token || !newComment.trim()) return;
    setPosting(true);
    try {
      const res = await submitCommentAction(movieId, slug, newComment.trim());
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

  return (
    <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
        <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>
          មតិយោបល់{comments.length > 0 && <span className="font-normal ml-1.5" style={{ color: "#555" }}>({comments.length})</span>}
        </h2>
      </div>

      {token ? (
        <div className="flex gap-3 mb-5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: "linear-gradient(135deg,#c9a835,#8b6914)", color: "#0d0d12" }}>
            {userName.slice(0, 2).toUpperCase()}
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
          <Link href="/login" style={{ color: "#c9a835" }} className="hover:underline">ចូលគណនី</Link>&nbsp;ដើម្បីបញ្ចេញមតិ
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
  );
}
