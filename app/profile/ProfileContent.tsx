"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import type { ApiUser, ApiPurchase, ApiWatchHistory } from "../lib/api";
import type { ServerUser } from "../lib/server-auth";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { uploadAvatarAction } from "../actions/profile-actions";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#0d0d12"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, src, onFileSelect, uploading = false, size = 88 }: {
  name: string; src: string | null; onFileSelect: (file: File) => void; uploading?: boolean; size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="relative group shrink-0"
      style={{ width: size, height: size, cursor: uploading ? "default" : "pointer" }}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { onFileSelect(f); e.target.value = ""; } }} />

      {/* Ring */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: "linear-gradient(135deg,#c9a835,#5a3f0a)", padding: 2.5 }}>
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: src ? "transparent" : "#1a160a", fontSize: size * 0.28, fontWeight: 900, color: "#c9a835" }}>
          {src ? <Image src={src} alt={name} fill className="object-cover rounded-full" sizes={`${size}px`} unoptimized={src.startsWith("blob:")} /> : initials}
        </div>
      </div>

      {/* Overlay — spinner while uploading, camera icon on hover */}
      <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 ${uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}>
        {uploading ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
          </svg>
        ) : (
          <div style={{ color: "#c9a835" }}><CameraIcon /></div>
        )}
      </div>
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({ value, label, accent = "#c9a835" }: { value: string | number; label: string; accent?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xl font-black leading-none" style={{ color: accent }}>{value}</span>
      <span className="text-[11px] font-medium" style={{ color: "#666" }}>{label}</span>
    </div>
  );
}

// ─── Movie Thumbnail Card ─────────────────────────────────────────────────────

function MovieCard({ title, image, progress, slug, id }: {
  title: string; image?: string; progress?: number; slug?: string; id?: number;
}) {
  const href = slug ? `/movie/${slug}` : id ? `/movie/${id}` : "#";

  return (
    <Link href={href} className="group shrink-0 flex flex-col gap-2" style={{ width: 110 }}>
      <div className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-xl"
        style={{ aspectRatio: "2/3", background: "#1a1620", border: "1px solid rgba(255,255,255,0.06)" }}>

        {image && (
          <Image
            src={image}
            alt={title}
            fill
            sizes="110px"
            className="object-cover"
            loading="lazy"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 50%)" }} />

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-0.75" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full" style={{ width: `${progress}%`, background: progress === 100 ? "#22c55e" : "#c9a835", borderRadius: 99 }} />
          </div>
        )}

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(201,168,53,0.92)", backdropFilter: "blur(4px)", boxShadow: "0 4px 16px rgba(201,168,53,0.4)" }}>
            <PlayIcon />
          </div>
        </div>

        </div>

      <p className="text-xs line-clamp-1 font-medium" style={{ color: "#bbb" }}>{title}</p>
    </Link>
  );
}

// ─── Settings Row ─────────────────────────────────────────────────────────────

function SettingsRow({ icon, label, value, onClick, danger, subtitle }: {
  icon: React.ReactNode; label: string; value?: string; onClick?: () => void; danger?: boolean; subtitle?: string;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 transition-all duration-150 rounded-2xl"
      style={{ background: "transparent", textAlign: "left" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = danger ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.035)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>

      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: danger ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)", color: danger ? "#ef4444" : "#888" }}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: danger ? "#ef4444" : "#e0e0e0" }}>{label}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "#555" }}>{subtitle}</p>}
      </div>

      {value && <span className="text-xs font-medium shrink-0" style={{ color: "#555" }}>{value}</span>}
      {!danger && <ChevronRight />}
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] px-5 pt-5 pb-2" style={{ color: "#444" }}>
      {children}
    </p>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20"/>
        </svg>
      </div>
      <p className="text-sm" style={{ color: "#444" }}>{message}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileContent({
  user: initialUser = null,
  initialProfile = null,
  initialHistory = [],
  initialPurchases = [],
  initialBalance = 0,
  initialCredits = 0,
}: {
  user?: ServerUser | null;
  initialProfile?: ApiUser | null;
  initialHistory?: ApiWatchHistory[];
  initialPurchases?: ApiPurchase[];
  initialBalance?: number;
  initialCredits?: number;
}) {
  const { user: authUser, logout, loading: authLoading } = useAuth();
  const clientUser = authUser ?? initialUser;
  const [activeTab, setActiveTab] = useState<"history" | "saved" | "settings">("history");
  const [avatarSrc, setAvatarSrc] = useState<string | null>(initialProfile?.avatar_url ?? initialProfile?.avatar ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [pwModalOpen,     setPwModalOpen]     = useState(false);
  const [pwSuccess,       setPwSuccess]       = useState(false);

  const [profile,    setProfile]    = useState<ApiUser | null>(initialProfile);
  const [history,    setHistory]    = useState<ApiWatchHistory[]>(initialHistory);
  const [purchases,  setPurchases]  = useState<ApiPurchase[]>(initialPurchases);
  const [balanceAmt, setBalanceAmt] = useState<number>(initialBalance);
  const [credits,    setCredits]    = useState<number>(initialCredits);
  const [loadingData, setLoadingData] = useState(!clientUser);

  const avatarStorageKey = clientUser ? `avatar_${(clientUser as { id?: number; email?: string }).id ?? (clientUser as { id?: number; email?: string }).email}` : null;

  useEffect(() => {
    if (!clientUser) return;
    const local = avatarStorageKey ? localStorage.getItem(avatarStorageKey) : null;
    if (local) setAvatarSrc(local);
  }, [clientUser]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAvatarSelect(file: File) {
    if (!clientUser) return;
    setAvatarUploading(true);

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setAvatarSrc(base64);
    if (avatarStorageKey) localStorage.setItem(avatarStorageKey, base64);

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await uploadAvatarAction(formData);
      const newAvatar = res.data?.avatar_url ?? res.data?.avatar;
      if (res.ok && newAvatar) {
        setAvatarSrc(newAvatar);
        setProfile(prev => prev ? { ...prev, avatar_url: newAvatar } : prev);
        if (avatarStorageKey) localStorage.setItem(avatarStorageKey, newAvatar);
      }
    } catch {
      // local base64 already saved
    } finally {
      setAvatarUploading(false);
    }
  }

  const displayName  = profile?.name  ?? clientUser?.name  ?? "Guest";
  const displayEmail = profile?.email ?? clientUser?.email ?? "";
  const plan         = profile?.plan ?? "Free";
  const totalWatched = profile?.total_watched ?? history.length;
  const totalBuy     = profile?.total_purchases ?? purchases.length;

  const tabs = [
    { key: "history",  label: "ប្រវត្តិ",  count: history.length },
    { key: "saved",    label: "ការទិញ",    count: purchases.length },
    { key: "settings", label: "ការកំណត់", count: null },
  ] as const;

  // ─ Not logged in ─
  if (!clientUser) return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ paddingTop: "25vh" }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(201,168,53,0.1)", border: "1px solid rgba(201,168,53,0.2)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <p className="text-base font-semibold" style={{ color: "#888" }}>
        ត្រូវ <Link href="/login" style={{ color: "#c9a835" }} className="hover:underline underline-offset-2">ចូលគណនី</Link> ជាមុន
      </p>
    </div>
  );

  return (
    <>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* ── Hero card ── */}
        <div className="relative rounded-3xl overflow-hidden mb-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Gradient strip */}
          <div className="h-28 w-full"
            style={{ background: "linear-gradient(135deg,rgba(201,168,53,0.18) 0%,rgba(101,78,11,0.12) 50%,rgba(30,15,5,0.2) 100%)" }}>
            <div className="absolute inset-0 h-28" style={{ background: "radial-gradient(ellipse at 30% 50%,rgba(201,168,53,0.15),transparent 70%)" }} />
            {/* Decorative banner */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 112" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              {/* Film strip right side */}
              <g opacity="0.18">
                <rect x="680" y="0" width="120" height="112" fill="#c9a835"/>
                {[0,1,2,3,4,5].map(i => (
                  <rect key={i} x="688" y={8 + i * 18} width="16" height="12" rx="2" fill="#0d0d12"/>
                ))}
                {[0,1,2,3,4,5].map(i => (
                  <rect key={i} x="776" y={8 + i * 18} width="16" height="12" rx="2" fill="#0d0d12"/>
                ))}
                <rect x="704" y="0" width="72" height="112" fill="#b8942e"/>
              </g>
              {/* Film strip left accent */}
              <g opacity="0.10">
                <rect x="0" y="0" width="60" height="112" fill="#c9a835"/>
                {[0,1,2,3,4,5].map(i => (
                  <rect key={i} x="8" y={8 + i * 18} width="12" height="11" rx="2" fill="#0d0d12"/>
                ))}
                {[0,1,2,3,4,5].map(i => (
                  <rect key={i} x="40" y={8 + i * 18} width="12" height="11" rx="2" fill="#0d0d12"/>
                ))}
              </g>
              {/* Scattered stars */}
              {[
                [120,28,5],[220,55,3.5],[340,20,4],[460,68,3],[560,32,5.5],[640,50,3],
                [180,80,2.5],[300,40,3],[400,85,4],[500,18,3.5],[150,50,2],
              ].map(([cx,cy,r],i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill="#c9a835" opacity="0.35"/>
              ))}
              {/* Play icon center-left */}
              <g transform="translate(90,28)" opacity="0.22">
                <circle cx="28" cy="28" r="26" stroke="#c9a835" strokeWidth="2" fill="none"/>
                <polygon points="20,16 42,28 20,40" fill="#c9a835"/>
              </g>
              {/* Horizontal shine line */}
              <line x1="0" y1="111" x2="800" y2="111" stroke="rgba(201,168,53,0.2)" strokeWidth="1"/>
            </svg>
            </div>

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-12 mb-5">
              <Avatar name={displayName} src={avatarSrc} onFileSelect={handleAvatarSelect} uploading={avatarUploading} size={88} />
              <div className="pb-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-black leading-none" style={{ color: "#f0f0f0" }}>{displayName}</h1>
                  {/* <span className="text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider shrink-0"
                    style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12" }}>
                    {plan}
                  </span> */}
                </div>
                <p className="text-sm" style={{ color: "#666" }}>{displayEmail}</p>
                {profile?.member_since && (
                  <p className="text-[11px] mt-1" style={{ color: "#444" }}>សមាជិកតាំងពី {profile.member_since}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="mb-5 -mx-6" style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

            {/* Stats row */}
            {loadingData ? (
              <div className="flex items-center justify-center py-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2.5" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </div>
            ) : (
              <div className="flex justify-around">
              <StatPill value={totalWatched} label="រឿងបានមើល" />
              <div style={{ width: 1, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
              <StatPill value={totalBuy} label="ចំនួនទិញ" accent="#a855f7" />
              <div style={{ width: 1, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
              <StatPill value={`$${balanceAmt.toFixed(2)}`} label="Balance" accent="#34d399" />
              <div style={{ width: 1, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
              <StatPill value={`$${credits.toFixed(2)}`} label="Credits" accent="#c9a835" />
            </div>
            )}
          </div>
        </div>

        {/* ── Balance + Credits row ── */}
        {/* <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.18)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(52,211,153,0.15)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V7H4v13h16v-5"/><path d="M20 12a2 2 0 0 0-4 0 2 2 0 0 0 4 0Z"/>
                </svg>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#6ee7b7" }}>Balance</span>
            </div>
            <div>
              {loadingData ? (
                <div className="h-8 w-16 rounded animate-pulse" style={{ background: "rgba(52,211,153,0.15)" }} />
              ) : (
                <>
                  <p className="text-3xl font-black leading-none" style={{ color: "#34d399" }}>${balanceAmt.toFixed(2)}</p>
                  <p className="text-[10px] mt-1" style={{ color: "#6ee7b7a0" }}>USD Wallet</p>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: "rgba(201,168,53,0.07)", border: "1px solid rgba(201,168,53,0.18)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(201,168,53,0.15)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#c9a835" }}>Credits</span>
            </div>
            <div>
              {loadingData ? (
                <div className="h-8 w-16 rounded animate-pulse" style={{ background: "rgba(201,168,53,0.15)" }} />
              ) : (
                <>
                  <p className="text-3xl font-black leading-none" style={{ color: "#c9a835" }}>${credits.toFixed(2)}</p>
                  <p className="text-[10px] mt-1" style={{ color: "#c9a835a0" }}>Credit Balance</p>
                </>
              )}
            </div>
          </div>
        </div> */}

        {/* Top-Up CTA */}
        <Link href="/deposit"
          className="rounded-2xl p-4 flex items-center justify-between group mb-6"
          style={{ background: "linear-gradient(135deg,rgba(201,168,53,0.12),rgba(139,105,20,0.06))", border: "1px solid rgba(201,168,53,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(201,168,53,0.18)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-black leading-none" style={{ color: "#c9a835" }}>Top-Up Balance &amp; Credit</p>
              <p className="text-[10px] mt-1" style={{ color: "#555" }}>ដាក់ប្រាក់តាម KHQR / ABA PayWay</p>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Link>

        {/* ── Plan banner ── */}
        {/* <div className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(201,168,53,0.1)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#c9a835" }}>{plan} Plan</p>
            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#555" }}>4K · គ្មានការផ្សាយពាណិជ្ជកម្ម · ចូលមើលបានគ្រប់ប្រភេទ</p>
          </div>
          {profile?.plan_expires_at && (
            <span className="text-[10px] shrink-0" style={{ color: "#555" }}>
              ផុត {profile.plan_expires_at}
            </span>
          )}
        </div> */}

        {/* ── Tabs ── */}
        <div className="grid grid-cols-3 gap-1.5 mb-6">
          {tabs.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: active ? "rgba(201,168,53,0.12)" : "rgba(255,255,255,0.04)",
                  color:      active ? "#c9a835" : "#555",
                  border:     active ? "1px solid rgba(201,168,53,0.3)" : "1px solid rgba(255,255,255,0.06)",
                }}>
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                    style={{ background: active ? "rgba(201,168,53,0.2)" : "rgba(255,255,255,0.08)", color: active ? "#c9a835" : "#555" }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Watch History tab ── */}
        {activeTab === "history" && (
          <div>
            {history.length === 0 ? (
              <EmptyState message="មិនទាន់មានប្រវត្តិ" />
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
                {history.map(h => (
                  <MovieCard
                    key={h.id}
                    title={h.movie.title}
                    image={h.movie.poster_url ?? h.movie.thumbnail_url}
                    slug={h.movie.slug}
                    id={h.movie.id}
                    progress={h.progress}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Purchases tab ── */}
        {activeTab === "saved" && (
          <div>
            {purchases.length === 0 ? (
              <EmptyState message="មិនទាន់មានការទិញ" />
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
                {purchases.filter(p => p.movie != null).map(p => (
                  <MovieCard
                    key={p.id}
                    title={p.movie.title}
                    image={p.movie.poster_url ?? p.movie.thumbnail_url}
                    slug={p.movie.slug}
                    id={p.movie.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Settings tab ── */}
        {activeTab === "settings" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>

            {/* Account */}
            <SectionLabel>គណនី</SectionLabel>
            <SettingsRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              label="ប្រវត្តិរូប"
              value={displayName}
            />
            <SettingsRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
              label="អ៊ីម៉ែល"
              value={displayEmail}
              subtitle={profile?.phone ?? undefined}
            />
            <SettingsRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              label="ផ្លាស់ប្តូរពាក្យសម្ងាត់"
              onClick={() => { setPwModalOpen(true); setPwSuccess(false); }}
            />

            {/* Divider */}
            <div className="mx-5" style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

            {/* Preferences */}
            <SectionLabel>ចំណូលចិត្ត</SectionLabel>
            <SettingsRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>}
              label="ភាសា"
              value="ខ្មែរ"
            />

            {/* Divider */}
            <div className="mx-5" style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

            {/* Membership */}
            <SectionLabel>សមាជិកភាព</SectionLabel>
            <SettingsRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>}
              label={`${plan} Plan`}
              value={profile?.plan_expires_at ? `ផុតកំណត់ ${profile.plan_expires_at}` : undefined}
            />
            <SettingsRow
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>}
              label="ប្រវត្តិការទូទាត់"
            />

            {/* Divider */}
            <div className="mx-5" style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

            {/* Logout */}
            <div className="py-2">
              <SettingsRow
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>}
                label={authLoading ? "កំពុងចាកចេញ..." : "ចាកចេញ"}
                onClick={logout}
                danger
              />
            </div>
          </div>
        )}

      </div>

      {pwModalOpen && (
        <ChangePasswordModal
          onSuccess={() => { setPwModalOpen(false); setPwSuccess(true); }}
          onClose={() => setPwModalOpen(false)}
        />
      )}

      {pwSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
          <div className="rounded-2xl px-6 py-4 flex items-center gap-3 pointer-events-auto"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ!</p>
          </div>
        </div>
      )}
    </>
  );
}
