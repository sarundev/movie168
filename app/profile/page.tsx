"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  fetchMe, fetchMyPurchases, fetchWatchHistory,
  type ApiUser, type ApiPurchase, type ApiWatchHistory,
} from "../lib/api";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, src, onUpload }: { name: string; src: string | null; onUpload: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(URL.createObjectURL(file));
  }

  return (
    <div className="relative group cursor-pointer shrink-0" style={{ width: 96, height: 96 }} onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center text-2xl font-black select-none"
        style={{ background: src ? "transparent" : "linear-gradient(135deg,#c9a835,#8b6914)", boxShadow: "0 0 0 3px rgba(201,168,53,0.35), 0 0 24px rgba(201,168,53,0.2)", color: "#0d0d12" }}
      >
        {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
      </div>
      <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.55)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
        </svg>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center py-4 px-6 rounded-xl"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <span className="text-2xl font-black" style={{ color: "#c9a835" }}>{value}</span>
      <span className="text-xs mt-0.5" style={{ color: "#666" }}>{label}</span>
    </div>
  );
}

function MiniCard({ title, image, gradient, progress, slug, id }: {
  title: string; image?: string; gradient?: string; progress?: number; slug?: string; id?: number;
}) {
  const href = slug ? `/movie/${slug}` : id ? `/movie/${id}` : "#";
  return (
    <a href={href} className="group cursor-pointer shrink-0" style={{ width: 100 }}>
      <div className="relative rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-[1.04]"
        style={{ aspectRatio: "2/3", background: gradient ?? "#1e1b4b", border: "1px solid rgba(255,255,255,0.06)" }}>
        {image && (
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)" }} />
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progress === 100 ? "#22c55e" : "#c9a835" }} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,53,0.9)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#0d0d12"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>
      <p className="text-xs mt-1.5 line-clamp-1 font-medium" style={{ color: "#ccc" }}>{title}</p>
    </a>
  );
}

function SettingsRow({ icon, label, value, onClick, danger }: {
  icon: React.ReactNode; label: string; value?: string; onClick?: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 px-5 py-4 transition-colors rounded-xl"
      style={{ background: "transparent", textAlign: "left" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = danger ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      <span style={{ color: danger ? "#ef4444" : "#888" }}>{icon}</span>
      <span className="flex-1 text-sm font-medium" style={{ color: danger ? "#ef4444" : "#ddd" }}>{label}</span>
      {value && <span className="text-xs" style={{ color: "#555" }}>{value}</span>}
      {!danger && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"history" | "saved" | "settings">("history");
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const [profile,  setProfile]  = useState<ApiUser | null>(null);
  const [history,  setHistory]  = useState<ApiWatchHistory[]>([]);
  const [purchases, setPurchases] = useState<ApiPurchase[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) { setLoadingData(false); return; }

    Promise.allSettled([
      fetchMe(user.token),
      fetchWatchHistory(user.token),
      fetchMyPurchases(user.token),
    ]).then(([p, h, pur]) => {
      if (p.status   === "fulfilled") setProfile(p.value);
      if (h.status   === "fulfilled") setHistory(h.value);
      if (pur.status === "fulfilled") setPurchases(pur.value);
    }).finally(() => setLoadingData(false));
  }, [user]);

  const displayName  = profile?.name  ?? user?.name  ?? "Guest";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const plan         = profile?.plan ?? "Free";
  const balance      = profile?.balance ?? 0;
  const totalWatched = profile?.total_watched ?? history.length;
  const totalBuy     = profile?.total_purchases ?? purchases.length;

  const tabs = [
    { key: "history",  label: "ប្រវត្តិ" },
    { key: "saved",    label: "ការទិញ" },
    { key: "settings", label: "ការកំណត់" },
  ] as const;

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#0d0d12" }}>
      <Navbar />
      <p className="text-sm mt-28" style={{ color: "#555" }}>ត្រូវតែ <a href="/login" style={{ color: "#c9a835" }} className="hover:underline">ចូលគណនី</a> ជាមុន</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-12 pt-28 pb-16 max-w-4xl mx-auto">

        {/* Profile card */}
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 4px 32px rgba(0,0,0,0.4)" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name={displayName} src={avatarSrc} onUpload={setAvatarSrc} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-xl font-black" style={{ color: "#f0f0f0" }}>{displayName}</h1>
                <span className="text-xs font-black px-2.5 py-1 rounded-full tracking-wider"
                  style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 2px 8px rgba(201,168,53,0.3)" }}>
                  {plan}
                </span>
              </div>
              <p className="text-sm mb-0.5" style={{ color: "#888" }}>{displayEmail}</p>
              {profile?.phone && <p className="text-sm" style={{ color: "#888" }}>{profile.phone}</p>}
              {profile?.member_since && (
                <p className="text-xs mt-2" style={{ color: "#555" }}>សមាជិកតាំងពី {profile.member_since}</p>
              )}
            </div>
          </div>

          {/* Stats row 1 */}
          {loadingData ? (
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 mt-6">
              <StatCard value={totalWatched} label="រឿងបានមើល" />
              <StatCard value={totalBuy}     label="ចំនួនទិញ" />
              <StatCard value="Gold"         label="កម្រិតសមាជិក" />
            </div>
          )}

          {/* Wallet + purchases */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="relative flex items-center gap-4 px-5 py-4 rounded-xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(201,168,53,0.13) 0%,rgba(139,105,20,0.07) 100%)", border: "1px solid rgba(201,168,53,0.25)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(201,168,53,0.15)", border: "1px solid rgba(201,168,53,0.3)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V7H4v13h16v-5"/><path d="M20 12a2 2 0 0 0-4 0 2 2 0 0 0 4 0Z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold mb-0.5" style={{ color: "#888" }}>ទឹកប្រាក់</p>
                <p className="text-2xl font-black leading-none" style={{ color: "#c9a835" }}>${balance}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#666" }}>{(balance * 4000).toLocaleString()} ៛</p>
              </div>
            </div>
            <div className="relative flex items-center gap-4 px-5 py-4 rounded-xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.12) 0%,rgba(109,40,217,0.07) 100%)", border: "1px solid rgba(168,85,247,0.25)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold mb-0.5" style={{ color: "#888" }}>ចំនួនរឿងទិញ</p>
                <p className="text-2xl font-black leading-none" style={{ color: "#a855f7" }}>{totalBuy}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#666" }}>រឿង</p>
              </div>
            </div>
          </div>
        </div>

        {/* Membership banner */}
        <div className="rounded-2xl px-6 py-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: "linear-gradient(135deg,rgba(201,168,53,0.12),rgba(139,105,20,0.08))", border: "1px solid rgba(201,168,53,0.2)" }}>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#c9a835" }}>{plan} Plan</p>
            <p className="text-sm" style={{ color: "#aaa" }}>ចូលមើលរឿងគ្រប់ប្រភេទ • គុណភាព 4K • គ្មានការផ្សាយពាណិជ្ជកម្ម</p>
          </div>
          <a href="/deposit" className="shrink-0 px-5 py-2 rounded-lg text-sm font-black transition-all"
            style={{ background: "linear-gradient(90deg,#c9a835,#8b6914)", color: "#0d0d12", boxShadow: "0 4px 12px rgba(201,168,53,0.3)" }}>
            បន្ថែម / Top Up
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.key ? "rgba(201,168,53,0.12)" : "transparent",
                color:      activeTab === tab.key ? "#c9a835" : "#666",
                border:     activeTab === tab.key ? "1px solid rgba(201,168,53,0.25)" : "1px solid transparent",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Watch History */}
        {activeTab === "history" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ color: "#aaa" }}>ប្រវត្តិនៃការមើល ({history.length})</h2>
            </div>
            {loadingData ? (
              <div className="flex gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="shrink-0 rounded-lg animate-pulse" style={{ width: 100, aspectRatio: "2/3", background: "rgba(255,255,255,0.05)" }} />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-center py-16 text-sm" style={{ color: "#444" }}>មិនទាន់មានប្រវត្តិ</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {history.map(h => (
                  <MiniCard
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

        {/* Purchases */}
        {activeTab === "saved" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ color: "#aaa" }}>ការទិញ ({purchases.length})</h2>
            </div>
            {loadingData ? (
              <div className="flex gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="shrink-0 rounded-lg animate-pulse" style={{ width: 100, aspectRatio: "2/3", background: "rgba(255,255,255,0.05)" }} />
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <p className="text-center py-16 text-sm" style={{ color: "#444" }}>មិនទាន់មានការទិញ</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {purchases.map(p => (
                  <MiniCard
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

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="rounded-2xl overflow-hidden divide-y"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="px-2 py-2">
              <p className="text-xs font-bold uppercase tracking-widest px-3 py-2" style={{ color: "#555" }}>គណនី</p>
              <SettingsRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                label="ប្រវត្តិរូប" value={displayName}
              />
              <SettingsRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
                label="អ៊ីម៉ែល" value={displayEmail}
              />
              <SettingsRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                label="ផ្លាស់ប្តូរពាក្យសម្ងាត់"
              />
            </div>
            <div className="px-2 py-2">
              <p className="text-xs font-bold uppercase tracking-widest px-3 py-2" style={{ color: "#555" }}>ចំណូលចិត្ត</p>
              <SettingsRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>}
                label="ភាសា" value="ខ្មែរ"
              />
            </div>
            <div className="px-2 py-2">
              <p className="text-xs font-bold uppercase tracking-widest px-3 py-2" style={{ color: "#555" }}>សមាជិកភាព</p>
              <SettingsRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>}
                label={`${plan} Plan`}
                value={profile?.plan_expires_at ? `ផុតកំណត់ ${profile.plan_expires_at}` : undefined}
              />
              <SettingsRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>}
                label="ប្រវត្តិការទូទាត់"
              />
            </div>
            <div className="px-2 py-2">
              <SettingsRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>}
                label={authLoading ? "កំពុងចាកចេញ..." : "ចាកចេញ"}
                onClick={logout}
                danger
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
