"use client";

const genres = [
  { name: "Action",      count: 348, gradient: "linear-gradient(135deg,#7f1d1d,#b45309)", icon: "⚡" },
  { name: "Drama",       count: 512, gradient: "linear-gradient(135deg,#1e1b4b,#2563eb)", icon: "🎭" },
  { name: "Sci-Fi",      count: 276, gradient: "linear-gradient(135deg,#0c4a6e,#4c1d95)", icon: "🚀" },
  { name: "Horror",      count: 193, gradient: "linear-gradient(135deg,#052e16,#14532d)", icon: "👻" },
  { name: "Comedy",      count: 421, gradient: "linear-gradient(135deg,#78350f,#ca8a04)", icon: "😂" },
  { name: "Romance",     count: 284, gradient: "linear-gradient(135deg,#881337,#9d174d)", icon: "❤️" },
  { name: "Thriller",    count: 317, gradient: "linear-gradient(135deg,#1e293b,#334155)", icon: "🔪" },
  { name: "Animation",   count: 156, gradient: "linear-gradient(135deg,#4c1d95,#701a75)", icon: "✨" },
  { name: "Fantasy",     count: 208, gradient: "linear-gradient(135deg,#312e81,#6d28d9)", icon: "🐉" },
  { name: "Documentary", count: 134, gradient: "linear-gradient(135deg,#064e3b,#065f46)", icon: "🎬" },
  { name: "Crime",       count: 245, gradient: "linear-gradient(135deg,#1c1917,#44403c)", icon: "🔫" },
  { name: "History",     count: 98,  gradient: "linear-gradient(135deg,#92400e,#78350f)", icon: "📜" },
];

export default function GenreGrid() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-1.5 h-7 rounded-full shrink-0"
          style={{ background: "linear-gradient(to bottom, #c9a835, #8a6e1a)" }}
        />
        <h2 className="text-lg sm:text-xl font-bold" style={{ color: "#f0f0f0" }}>
          Browse by Genre
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {genres.map((genre) => (
          <a
            key={genre.name}
            href={`/movies?genre=${genre.name.toLowerCase()}`}
            className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              aspectRatio: "4/3",
              background: genre.gradient,
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 8px 28px rgba(201,168,53,0.25), 0 0 0 1.5px rgba(201,168,53,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 4px 14px rgba(0,0,0,0.4)";
            }}
          >
            {/* Grain texture */}
            <div
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />
            {/* Overlay */}
            <div
              className="absolute inset-0 group-hover:opacity-70 transition-opacity"
              style={{ background: "rgba(0,0,0,0.35)" }}
            />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2">
              <span className="text-2xl">{genre.icon}</span>
              <span className="text-white text-sm font-bold text-center leading-tight">
                {genre.name}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                {genre.count} titles
              </span>
            </div>
            {/* Gold border on hover */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ border: "1.5px solid rgba(201,168,53,0.5)" }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
