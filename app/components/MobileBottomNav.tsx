"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

/* ─── Icons ─────────────────────────────────────────── */
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <polyline points="9 21 9 13 15 13 15 21" />
  </svg>
);

const MovieIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="3" />
    <path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5" />
  </svg>
);

const SeriesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3 8 3M12 3v4" />
    <polygon points="10,11 10,17 16,14" fill="currentColor" stroke="none" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const LoginIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" x2="3" y1="12" y2="12"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────── */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, logout, loading: authLoading } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  const staticTabs = [
    { label: "ទំព័រដើម", href: "/",       icon: <HomeIcon /> },
    { label: "រឿងខ្លី",  href: "/movies",  icon: <MovieIcon /> },
    { label: "រឿងភាគ",  href: "/series",  icon: <SeriesIcon /> },
  ] as const;

  return (
    <>
      <style>{`
        .mnav-tab { transition: color 180ms ease, transform 180ms ease; }
        .mnav-tab:active { transform: scale(0.92); }
        .mnav-indicator {
          width: 20px; height: 3px; border-radius: 9999px;
          background: #e01010;
          transition: opacity 180ms ease, width 180ms ease;
        }
      `}</style>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          height:               "68px",
          background:           "rgba(10, 10, 13, 0.96)",
          backdropFilter:       "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop:            "1px solid rgba(255,255,255,0.06)",
          boxShadow:            "0 -8px 32px rgba(0,0,0,0.7)",
          paddingBottom:        "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-end h-full">

          {/* Static tabs: Home, Movies, Series */}
          {staticTabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <a
                key={tab.label}
                href={tab.href}
                aria-label={tab.label}
                className="mnav-tab flex flex-col items-center justify-end flex-1 pb-3 gap-1"
                style={{ color: active ? "#ff4040" : "#4a4a55", textDecoration: "none" }}
              >
                <div className="mnav-indicator" style={{ marginBottom: "2px", opacity: active ? 1 : 0, width: active ? "20px" : "0px" }} />
                <div style={{ lineHeight: 0 }}>{tab.icon}</div>
                <span style={{ fontSize: "10px", fontFamily: "'Battambang', 'Khmer', serif", lineHeight: 1.1, letterSpacing: "0.02em" }}>
                  {tab.label}
                </span>
              </a>
            );
          })}

          {/* Auth tab: Profile (logged in) or Login (guest) */}
          {user ? (
            /* ── Logged-in: profile link + avatar dot ── */
            <a
              href="/profile"
              aria-label="គណនី"
              className="mnav-tab flex flex-col items-center justify-end flex-1 pb-3 gap-1 relative"
              style={{ color: isActive("/profile") ? "#c9a835" : "#4a4a55", textDecoration: "none" }}
            >
              {/* Gold active bar */}
              <div
                className="mnav-indicator"
                style={{
                  marginBottom: "2px",
                  opacity:      isActive("/profile") ? 1 : 0,
                  width:        isActive("/profile") ? "20px" : "0px",
                  background:   "#c9a835",
                }}
              />
              {/* Avatar with initials */}
              <div className="relative" style={{ lineHeight: 0 }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black"
                  style={{
                    background: isActive("/profile")
                      ? "linear-gradient(135deg,#c9a835,#8b6914)"
                      : "rgba(201,168,53,0.25)",
                    color:      "#0d0d12",
                    border:     "1.5px solid rgba(201,168,53,0.5)",
                  }}
                >
                  {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                {/* Online dot */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: "#22c55e", border: "1.5px solid rgba(10,10,13,0.96)" }}
                />
              </div>
              <span style={{ fontSize: "10px", fontFamily: "'Battambang', 'Khmer', serif", lineHeight: 1.1 }}>
                គណនី
              </span>
            </a>
          ) : (
            /* ── Guest: Login button ── */
            <a
              href="/login"
              aria-label="ចូលគណនី"
              className="mnav-tab flex flex-col items-center justify-end flex-1 pb-3 gap-1"
              style={{ color: isActive("/login") ? "#c9a835" : "#4a4a55", textDecoration: "none" }}
            >
              <div
                className="mnav-indicator"
                style={{
                  marginBottom: "2px",
                  opacity:      isActive("/login") ? 1 : 0,
                  width:        isActive("/login") ? "20px" : "0px",
                  background:   "#c9a835",
                }}
              />
              <div style={{ lineHeight: 0 }}><LoginIcon /></div>
              <span style={{ fontSize: "10px", fontFamily: "'Battambang', 'Khmer', serif", lineHeight: 1.1 }}>
                ចូល
              </span>
            </a>
          )}

          {/* Logout tab — only when logged in (long-press style: just a quick tap) */}
          {user && (
            <button
              onClick={logout}
              disabled={authLoading}
              aria-label="ចាកចេញ"
              className="mnav-tab flex flex-col items-center justify-end flex-1 pb-3 gap-1"
              style={{ color: "#4a4a55", background: "transparent", border: "none", cursor: "pointer" }}
            >
              <div className="mnav-indicator" style={{ marginBottom: "2px", opacity: 0, width: "0px" }} />
              <div style={{ lineHeight: 0, color: authLoading ? "#333" : "#ef4444" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
              </div>
              <span style={{ fontSize: "10px", fontFamily: "'Battambang', 'Khmer', serif", lineHeight: 1.1, color: authLoading ? "#333" : "#ef4444" }}>
                {authLoading ? "..." : "ចាក"}
              </span>
            </button>
          )}

        </div>
      </nav>
    </>
  );
}
