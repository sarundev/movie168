"use client";

import { usePathname } from "next/navigation";

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

/* Center: search + play merged icon */
// const SearchPlayIcon = () => (
//   <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
//     <circle cx="11.5" cy="11.5" r="7.5" stroke="white" strokeWidth="2.2" />
//     <path d="M17.5 17.5 25 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
//     <polygon points="9,8.5 9,14.5 14.5,11.5" fill="white" />
//   </svg>
// );

/* ─── Nav data ───────────────────────────────────────── */
const tabs = [
  { label: "ទំព័រដើម",  href: "/",       icon: <HomeIcon />,    isCenter: false },
  { label: "រឿងខ្លី",   href: "/movies",  icon: <MovieIcon />,   isCenter: false },
  // { label: "ស្វែងរក",  href: "/search",  icon: null,            isCenter: true  },
  { label: "រឿងភាគ",   href: "/series",  icon: <SeriesIcon />,  isCenter: false },
  { label: "គណនី",     href: "/profile", icon: <ProfileIcon />, isCenter: false },
] as const;

/* ─── Component ──────────────────────────────────────── */
export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  return (
    <>
      {/* ── Inline styles for transitions (no Tailwind purge risk) ── */}
      <style>{`
        .mnav-tab { transition: color 180ms ease, transform 180ms ease; }
        .mnav-tab:active { transform: scale(0.92); }
        .mnav-center-btn { transition: box-shadow 180ms ease, transform 180ms ease; }
        .mnav-center-btn:active { transform: scale(0.93) translateY(-18px); }
        .mnav-indicator {
          width: 20px; height: 3px; border-radius: 9999px;
          background: #e01010;
          transition: opacity 180ms ease, width 180ms ease;
        }
      `}</style>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          height: "68px",
          background: "rgba(10, 10, 13, 0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.7)",
          /* iOS safe area */
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-end h-full">
          {tabs.map((tab) => {
            const active = isActive(tab.href);

            /* ── Centre search button ── */
            // if (tab.isCenter) {
            //   return (
            //     <a
            //       key={tab.label}
            //       href={tab.href}
            //       aria-label={tab.label}
            //       className="mnav-center-btn  flex flex-col items-center flex-1"
                 
            //     >
            //       {/* Floating circle */}
            //       <div
            //         style={{
            //           width: "40px",
            //           height: "40px",
            //           borderRadius: "50%",
            //           background: "linear-gradient(145deg, #ff2828, #b80000)",
            //           display: "flex",
            //           alignItems: "center",
            //           justifyContent: "center",
            //           /* Outer ring so it looks detached from the bar */
            //           outline: "3px solid rgba(10,10,13,0.96)",
            //           outlineOffset: "2px",
            //           boxShadow:
            //             "0 6px 24px rgba(220,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset",
            //         }}

            //       >
            //         <SearchPlayIcon />
            //       </div>

            //       {/* Label */}
            //       <span
            //         style={{
            //           marginTop: "6px",
            //           fontSize: "10px",
            //           fontFamily: "'Battambang', 'Khmer', serif",
            //           color: active ? "#ff4040" : "#555",
            //           letterSpacing: "0.02em",
            //           lineHeight: 1,
            //         }}
            //       >
            //         {tab.label}
            //       </span>
            //     </a>
            //   );
            // }

            /* ── Regular tab ── */
            return (
              <a
                key={tab.label}
                href={tab.href}
                aria-label={tab.label}
                className="mnav-tab flex flex-col items-center justify-end flex-1 pb-3 gap-1"
                style={{
                  color: active ? "#ff4040" : "#4a4a55",
                  textDecoration: "none",
                }}
              >
                {/* Active bar indicator at top */}
                <div
                  className="mnav-indicator"
                  style={{
                    marginBottom: "2px",
                    opacity: active ? 1 : 0,
                    width: active ? "20px" : "0px",
                  }}
                />

                {/* Icon */}
                <div style={{ lineHeight: 0 }}>{tab.icon}</div>

                {/* Label */}
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "'Battambang', 'Khmer', serif",
                    lineHeight: 1.1,
                    letterSpacing: "0.02em",
                  }}
                >
                  {tab.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
