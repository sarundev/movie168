import type { ApiGenre } from "../lib/api";

const GENRE_META: Record<string, { gradient: string; icon: string }> = {
  action:      { gradient: "linear-gradient(135deg,#7f1d1d,#b45309)", icon: "⚡" },
  drama:       { gradient: "linear-gradient(135deg,#1e1b4b,#2563eb)", icon: "🎭" },
  "sci-fi":    { gradient: "linear-gradient(135deg,#0c4a6e,#4c1d95)", icon: "🚀" },
  horror:      { gradient: "linear-gradient(135deg,#052e16,#14532d)", icon: "👻" },
  comedy:      { gradient: "linear-gradient(135deg,#78350f,#ca8a04)", icon: "😂" },
  romance:     { gradient: "linear-gradient(135deg,#881337,#9d174d)", icon: "❤️" },
  thriller:    { gradient: "linear-gradient(135deg,#1e293b,#334155)", icon: "🔪" },
  animation:   { gradient: "linear-gradient(135deg,#4c1d95,#701a75)", icon: "✨" },
  fantasy:     { gradient: "linear-gradient(135deg,#312e81,#6d28d9)", icon: "🐉" },
  documentary: { gradient: "linear-gradient(135deg,#064e3b,#065f46)", icon: "🎬" },
  crime:       { gradient: "linear-gradient(135deg,#1c1917,#44403c)", icon: "🔫" },
  history:     { gradient: "linear-gradient(135deg,#92400e,#78350f)", icon: "📜" },
  adventure:   { gradient: "linear-gradient(135deg,#064e3b,#0f766e)", icon: "🏔️" },
  mystery:     { gradient: "linear-gradient(135deg,#1e1b4b,#4c1d95)", icon: "🔍" },
  family:      { gradient: "linear-gradient(135deg,#14532d,#166534)", icon: "👨‍👩‍👧" },
  biography:   { gradient: "linear-gradient(135deg,#7c3aed,#4c1d95)", icon: "📖" },
  music:       { gradient: "linear-gradient(135deg,#831843,#be185d)", icon: "🎵" },
  war:         { gradient: "linear-gradient(135deg,#1c1917,#292524)", icon: "⚔️" },
  sport:       { gradient: "linear-gradient(135deg,#14532d,#0f766e)", icon: "⚽" },
  western:     { gradient: "linear-gradient(135deg,#78350f,#92400e)", icon: "🤠" },
};

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg,#1e1b4b,#0d0d12)",
  "linear-gradient(135deg,#0c4a6e,#1e1b4b)",
  "linear-gradient(135deg,#064e3b,#1e1b4b)",
  "linear-gradient(135deg,#7c3aed,#1e1b4b)",
];

function genreMeta(genre: ApiGenre, idx: number) {
  const key = genre.slug.toLowerCase();
  return GENRE_META[key] ?? {
    gradient: FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length],
    icon: "🎬",
  };
}

export default function GenreGrid({ genres }: { genres: ApiGenre[] }) {
  if (genres.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1.5 h-7 rounded-full shrink-0"
          style={{ background: "linear-gradient(to bottom, #c9a835, #8a6e1a)" }} />
        <h2 className="text-lg sm:text-xl font-bold" style={{ color: "#f0f0f0" }}>
          Browse by Genre
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {genres.map((genre, idx) => {
          const meta = genreMeta(genre, idx);
          return (
            <a
              key={genre.id}
              href={`/movies?genre=${genre.slug}`}
              className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                aspectRatio: "4/3",
                background: meta.gradient,
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />
              <div className="absolute inset-0 group-hover:opacity-70 transition-opacity"
                style={{ background: "rgba(0,0,0,0.35)" }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2">
                <span className="text-2xl">{meta.icon}</span>
                <span className="text-white text-sm font-bold text-center leading-tight">
                  {genre.name}
                </span>
              </div>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ border: "1.5px solid rgba(201,168,53,0.5)" }} />
            </a>
          );
        })}
      </div>
    </div>
  );
}
