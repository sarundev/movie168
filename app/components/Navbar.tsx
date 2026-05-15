"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "កាលវិភាគ & អ្វៀបអស្ប្រ",
    href: "/schedule",
    dropdown: [
      { label: "កាលវិភាគ", href: "/schedule" },
      { label: "អ្វៀបអស្ប្រ", href: "/schedule/live" },
    ],
  },
  {
    label: "រឿង ដុំ",
    href: "/movies",
    dropdown: [
      { label: "រឿងជំទាំងអស់", href: "/movies" },
      { label: "រឿងថ្មី", href: "/movies?sort=newest" },
      { label: "រឿងពេញនិយម", href: "/movies?sort=popular" },
      { label: "ចំណាត់ថ្នាក់ខ្ពស់", href: "/movies?sort=rating" },
    ],
  },
  {
    label: "រឿង ភាគ",
    href: "/series",
    dropdown: [
      { label: "រឿងភាគទាំងអស់", href: "/series" },
      { label: "K-Drama", href: "/series?genre=k-drama" },
      { label: "កំពុង放映", href: "/series?status=ongoing" },
      { label: "បញ្ចប់ហើយ", href: "/series?status=completed" },
    ],
  },
  {
    label: "ប្រភេទរឿង",
    href: "/genres",
    dropdown: [
      { label: "សកម្មភាព", href: "/movies?genre=action" },
      { label: "គួរឲ្យសើច", href: "/movies?genre=comedy" },
      { label: "រឿងស្នេហា", href: "/movies?genre=romance" },
      { label: "រឿងបំភ័យ", href: "/movies?genre=horror" },
      { label: "វិទ្យាសាស្ត្រ", href: "/movies?genre=sci-fi" },
    ],
  },
  {
    label: "ប្រទេស",
    href: "/countries",
    dropdown: [
      { label: "អាមេរិក", href: "/movies?country=us" },
      { label: "កូរ៉េ", href: "/movies?country=kr" },
      { label: "ចិន", href: "/movies?country=cn" },
      { label: "ថៃ", href: "/movies?country=th" },
      { label: "ខ្មែរ", href: "/movies?country=kh" },
    ],
  },
  {
    label: "MARVEL UNIVERSE",
    href: "/movies?genre=marvel",
    isMarvel: true,
    dropdown: [
      { label: "Avengers", href: "/movies?franchise=avengers" },
      { label: "Spider-Man", href: "/movies?franchise=spider-man" },
      { label: "Thor", href: "/movies?franchise=thor" },
      { label: "Iron Man", href: "/movies?franchise=iron-man" },
      { label: "Captain America", href: "/movies?franchise=captain-america" },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      <div className="px-4 sm:px-6 lg:px-10 flex items-center h-24 gap-4">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0 mr-2">
          {/* Diamond icon */}
        
          <div className="leading-none">
            <span className="font-black text-lg tracking-wider" style={{ color: "#e8c84a" }}>168</span>
            <span className="font-black text-lg tracking-wider text-green-600 ml-1">KH</span>
          </div>
        </a>

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
                  className="flex items-center gap-1 px-3 py-8 text-lg font-extrabold space-x-2.5 space-y-1.5 whitespace-nowrap transition-colors rounded"
               
                  style={{ color: active ? "#e8c84a" : "#d1d1d1", fontFamily:'fangsong' }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = "#d1d1d1";
                  }}
                >
                  {(item as { isMarvel?: boolean }).isMarvel ? (
                    <span style={{ color: "#e8c84a", fontWeight: 800 }}>{item.label}</span>
                  ) : (
                    item.label
                  )}
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
                  window.location.href = `/movies?q=${encodeURIComponent(searchQuery)}`;
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
                  window.location.href = `/movies?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            
          </div>
          <div className="relative bg-amber-500 py-1.5 px-3 rounded-md">
          <button>
            <a href="/deposit">បញ្ជូលទឹកប្រាក់</a>
          </button>
          </div>

          {/* User icon */}
          <a
            href="/profile"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "#1c1c1c", border: "1px solid #2e2e2e", color: "#ccc" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e8c84a";
              (e.currentTarget as HTMLElement).style.color = "#e8c84a";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#2e2e2e";
              (e.currentTarget as HTMLElement).style.color = "#ccc";
            }}
            aria-label="User profile"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </a>

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
                  window.location.href = `/movies?q=${encodeURIComponent(searchQuery)}`;
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
        </div>
      )}
    </nav>
  );
}
