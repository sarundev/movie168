const starRating = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => i < Math.round(rating / 2));

export default function Hero() {
  const stars = starRating(8.7);

  return (
    <section className="relative h-screen min-h-[640px] flex items-end">
      {/* Layered background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(30,27,75,0.9) 0%, rgba(9,9,11,0.95) 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 80%, rgba(30,58,95,0.5) 0%, transparent 50%)",
        }}
      />
      {/* Stars/particles decoration */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(1px 1px at 50% 60%, white, transparent), radial-gradient(1px 1px at 10% 70%, white, transparent), radial-gradient(1px 1px at 90% 50%, white, transparent), radial-gradient(1px 1px at 35% 15%, white, transparent), radial-gradient(1px 1px at 65% 80%, white, transparent), radial-gradient(2px 2px at 75% 25%, rgba(167,139,250,0.8), transparent), radial-gradient(2px 2px at 15% 45%, rgba(147,197,253,0.8), transparent)",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #09090b 0%, rgba(9,9,11,0.6) 30%, transparent 60%)",
        }}
      />
      {/* Left fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.4) 40%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-8 lg:px-16 pb-28 max-w-3xl">
        {/* Featured badge */}
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded tracking-widest uppercase"
            style={{ background: "#e50914", color: "white" }}
          >
            Featured
          </span>
          <span className="text-zinc-400 text-sm">&#35;1 in Movies Today</span>
        </div>

        {/* Title */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight mb-5"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
          INTER<br />STELLAR
        </h1>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm font-semibold" style={{ color: "#4ade80" }}>
            97% Match
          </span>
          <span className="text-zinc-400 text-sm">2014</span>
          <span className="border border-zinc-600 text-zinc-300 px-2 py-0.5 rounded text-xs font-medium">
            4K HDR
          </span>
          <span className="text-zinc-400 text-sm">2h 49m</span>
          {/* Star rating */}
          <div className="flex items-center gap-1">
            {stars.map((filled, i) => (
              <svg
                key={i}
                className="w-3.5 h-3.5"
                fill={filled ? "#fbbf24" : "none"}
                stroke={filled ? "#fbbf24" : "#52525b"}
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
            <span className="text-zinc-300 text-sm ml-1 font-medium">8.7</span>
          </div>
        </div>

        {/* Genre tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {["Sci-Fi", "Drama", "Adventure"].map((genre) => (
            <span
              key={genre}
              className="text-xs font-medium text-zinc-300 px-3 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
          A team of explorers travels through a wormhole near Saturn in search of a new home for humanity — pushing the limits of human endurance across space and time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            className="flex items-center gap-2.5 font-bold px-8 py-3 rounded-lg text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "white", color: "#09090b", boxShadow: "0 4px 20px rgba(255,255,255,0.2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Play Now
          </button>
          <button
            className="flex items-center gap-2.5 font-semibold px-8 py-3 rounded-lg text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            More Info
          </button>
          <button
            className="flex items-center gap-2.5 font-semibold px-4 py-3 rounded-lg text-sm text-zinc-300 transition-all duration-200 hover:text-white hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            aria-label="Add to Watchlist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Watchlist
          </button>
        </div>
      </div>
    </section>
  );
}
