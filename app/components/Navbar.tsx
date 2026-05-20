"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { fetchMovieFilters, type ApiGenre } from "../lib/api";

const COUNTRY_LABELS: Record<string, string> = {
  US: "អាមេរិក",
  KR: "កូរ៉េ",
  CN: "ចិន",
  TH: "ថៃ",
  KH: "ខ្មែរ",
  JP: "ជប៉ុន",
  IN: "ឥណ្ឌា",
  FR: "បារាំង",
  GB: "អង់គ្លេស",
  HK: "ហុងកុង",
  TW: "តៃវ៉ាន់",
};




interface NavbarProps {
  initialGenres?: ApiGenre[];
  initialCountries?: { label: string; value: string }[];
}

export default function Navbar({ initialGenres, initialCountries }: NavbarProps = {}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function initFromCache<T>(key: string, field: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const { ts, [field]: val } = JSON.parse(raw);
        if (Date.now() - ts < 600000) return val;
      }
    } catch {}
    return fallback;
  }

  const [genres, setGenres] = useState<ApiGenre[]>(() => initFromCache<ApiGenre[]>("nav_filters_v1", "genres", initialGenres ?? []));
  const [countries, setCountries] = useState<{ label: string; value: string }[]>(() => initFromCache<{ label: string; value: string }[]>("nav_filters_v1", "countries", initialCountries ?? []));

  useEffect(() => {
    if (genres.length > 0 && countries.length > 0) return;
    fetchMovieFilters()
      .then((f) => {
        setGenres(f.genres);
        setCountries(f.countries);
        try {
          sessionStorage.setItem("nav_filters_v1", JSON.stringify({
            genres: f.genres, countries: f.countries, ts: Date.now(),
          }));
        } catch {}
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const genreDropdown = genres.length > 0
    ? genres.map((g) => ({ label: g.name, href: `/movies?genre=${g.slug}` }))
    : [
        { label: "សកម្មភាព", href: "/movies?genre=action" },
        { label: "គួរឲ្យសើច", href: "/movies?genre=comedy" },
        { label: "រឿងស្នេហា", href: "/movies?genre=romance" },
        { label: "រឿងបំភ័យ", href: "/movies?genre=horror" },
      ];

  const countryDropdown = countries.length > 0
    ? countries.map((c) => ({
        label: COUNTRY_LABELS[c.value.toUpperCase()] ?? c.label,
        href: `/movies?country=${c.value.toLowerCase()}`,
      }))
    : [
        { label: "អាមេរិក", href: "/movies?country=us" },
        { label: "កូរ៉េ", href: "/movies?country=kr" },
        { label: "ចិន", href: "/movies?country=cn" },
        { label: "ថៃ", href: "/movies?country=th" },
        { label: "ខ្មែរ", href: "/movies?country=kh" },
      ];

  const navItems: { label: string; href: string; dropdown?: { label: string; href: string }[] }[] = [
    { label: "ទំព័រដើម", href: "/" },
    { label: "ភាពយន្ត", href: "/movies", dropdown: genreDropdown },
    { label: "ស៊េរី", href: "/series", dropdown: countryDropdown },
  ];


  const openUserMenu  = () => { if (userMenuTimer.current) clearTimeout(userMenuTimer.current); setUserMenuOpen(true); };
  const closeUserMenu = () => { userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 150); };

  const openDD = (label: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setOpenDropdown(label);
  };
  const closeDD = () => {
    dropdownTimer.current = setTimeout(() => setOpenDropdown(null), 130);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}
    >
      <div className="px-4 sm:px-6 lg:px-10 flex items-center h-16 md:h-20 gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          {/* Diamond icon */}
        
          <div className="leading-none">
            <span className="font-black text-lg tracking-wider" style={{ color: "#e8c84a" }}>168</span>
            <span className="font-black text-lg tracking-wider text-green-600 ml-1">KH</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center flex-1 min-w-0 py-24">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <div
                key={item.label}
                className="relative flex items-center shrink-0"
                onMouseEnter={() => item.dropdown && openDD(item.label)}
                onMouseLeave={closeDD}
              >

                <a
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-8 text-lg  space-x-2.5 space-y-1.5 whitespace-nowrap transition-colors rounded"
               
                  style={{ color: active ? "#e8c84a" : "#d1d1d1",fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
                   fontWeight: 900,}}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = "#d1d1d1";
                  }}
                >
                  
                  {item.label}
                  {item.dropdown && (
                    <svg
                      width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      className={`transition-transform duration-150 ${openDropdown === item.label ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  )}
                </a>

                {/* Dropdown panel */}
                {item.dropdown && openDropdown === item.label && (
                  <div
                    className="absolute top-full left-0 min-w-40 py-1 z-50 rounded-b"
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                      borderTop: "2px solid #e8c84a",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
                    }}
                    onMouseEnter={() => openDD(item.label)}
                    onMouseLeave={closeDD}
                  >
                    {item.dropdown.map((sub) => (
                      <a
                        key={sub.label}
                        href={sub.href}
                        className="flex items-center px-4 py-2 text-sm transition-all"
                        style={{ color: "#c0c0c0", borderLeft: "2px solid transparent" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#e8c84a";
                          e.currentTarget.style.borderLeftColor = "#e8c84a";
                          e.currentTarget.style.background = "rgba(232,200,74,0.07)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#c0c0c0";
                          e.currentTarget.style.borderLeftColor = "transparent";
                          e.currentTarget.style.background = "";
                        }}
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: search + user */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Inline search */}
          <div
            className="hidden sm:flex items-center rounded"
            style={{ background: "#1c1c1c", border: "1px solid #2e2e2e" }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none px-3 py-1.5 w-44"
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/movies?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
            />
            
            <button
              className="px-3 py-1.5 transition-colors"
              style={{ color: "#888", borderLeft: "1px solid #2e2e2e" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e8c84a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
              aria-label="Search"
              onClick={() => {
                if (searchQuery.trim()) {
                  router.push(`/movies?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            
          </div>
          {/* <div className="relative bg-amber-500 py-1.5 px-3 rounded-md">
          <button>
            <a href="/deposit">បញ្ជូលទឹកប្រាក់</a>
          </button>
          </div> */}

          {/* User area — desktop */}
          <div className="relative hidden md:flex items-center">
            {user ? (
              /* ── Logged-in: avatar + dropdown ── */
              <div
                className="relative"
                onMouseEnter={openUserMenu}
                onMouseLeave={closeUserMenu}
              >
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors"
                  // style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #2e2e2e" }}
                >
                  {/* Avatar circle */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 overflow-hidden"
                    style={user.avatar ? {} : { background: "linear-gradient(135deg,#c9a835,#8b6914)", color: "#0d0d12" }}
                  >
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  {/* <span className="text-xs font-semibold max-w-20 truncate" style={{ color: "#ddd" }}>
                    {user.name}
                  </span> */}
                  {/* <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>  m
                  </svg> */}
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-48 py-1.5 rounded-xl z-50"
                    style={{
                      background: "#141414",
                      border:     "1px solid #2a2a2a",
                      borderTop:  "2px solid #c9a835",
                      boxShadow:  "0 8px 32px rgba(0,0,0,0.7)",
                    }}
                  >
                    {/* User info */}
                    <div className="px-4 py-2.5 mb-1" style={{ borderBottom: "1px solid #222" }}>
                      <p className="text-xs font-semibold truncate" style={{ color: "#ddd" }}>{user.name}</p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: "#555" }}>{user.email}</p>
                    </div>
                    <Link href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-all"
                      style={{ color: "#aaa" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#e8c84a"; e.currentTarget.style.background = "rgba(232,200,74,0.07)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = ""; }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      គណនី
                    </Link>
                    <Link href="/deposit"
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-all"
                      style={{ color: "#aaa" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#e8c84a"; e.currentTarget.style.background = "rgba(232,200,74,0.07)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = ""; }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 12V7H4v13h16v-5"/><path d="M20 12a2 2 0 0 0-4 0 2 2 0 0 0 4 0Z"/>
                      </svg>
                      Top Up
                    </Link>
                    <div style={{ borderTop: "1px solid #222", marginTop: "4px", paddingTop: "4px" }}>
                      <button
                        onClick={logout}
                        disabled={authLoading}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-all"
                        style={{ color: "#ef4444", background: "transparent", textAlign: "left" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                        </svg>
                        {authLoading ? "កំពុងចាកចេញ..." : "ចាកចេញ"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest: Login button ── */
              <a
                href="/login"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: "linear-gradient(90deg,#c9a835,#8b6914)",
                  color:      "#0d0d12",
                  boxShadow:  "0 2px 10px rgba(201,168,53,0.3)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>
                </svg>
                ចូលគណនី
              </a>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded transition-colors"
            style={{ color: "#888" }}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden px-4 pb-4 pt-2 flex flex-col gap-1"
          style={{ borderTop: "1px solid #1a1a1a", background: "#0d0d0d" }}
        >
          {/* Mobile search */}
          <div
            className="flex items-center rounded mb-2"
            style={{ background: "#1c1c1c", border: "1px solid #2e2e2e" }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none px-3 py-2 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/movies?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
            />
            <button className="px-3" style={{ color: "#888" }} aria-label="Search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-2.5 rounded text-sm font-medium transition-colors"
              style={{ color: isActive(item.href) ? "#e8c84a" : "#aaa" }}
            >
              {item.label}
            </a>
          ))}

          {/* Mobile auth section */}
          <div className="mt-2 pt-2" style={{ borderTop: "1px solid #1e1e1e" }}>
            {user ? (
              <>
                {/* User info row */}
                <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 overflow-hidden"
                    style={user.avatar ? {} : { background: "linear-gradient(135deg,#c9a835,#8b6914)", color: "#0d0d12" }}
                  >
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#ddd" }}>{user.name}</p>
                    <p className="text-xs truncate" style={{ color: "#555" }}>{user.email}</p>
                  </div>
                </div>
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded text-sm" style={{ color: "#aaa" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  គណនី
                </Link>
                <button
                  onClick={logout}
                  disabled={authLoading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm"
                  style={{ color: "#ef4444", background: "transparent", textAlign: "left" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                  </svg>
                  {authLoading ? "កំពុងចាកចេញ..." : "ចាកចេញ"}
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="flex items-center justify-center gap-2 mx-1 py-3 rounded-lg text-sm font-black"
                style={{
                  background: "linear-gradient(90deg,#c9a835,#8b6914)",
                  color:      "#0d0d12",
                  boxShadow:  "0 2px 12px rgba(201,168,53,0.3)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>
                </svg>
                ចូលគណនី
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
