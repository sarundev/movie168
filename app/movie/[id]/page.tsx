import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MovieRow from "../../components/MovieRow";
import { findMovieById, allMovies } from "../../data/movies";

const qualityBg: Record<string, string> = { "4K":"#1d4ed8", FHD:"#b45309", HD:"#15803d" };
const badgeBg:   Record<string, string> = { NEW:"#c9a835", HOT:"#e50914", TOP:"#7c3aed", AWARD:"#065f46" };

const mockCast = [
  { name: "Actor A",   initials: "AA", color: "linear-gradient(135deg,#7c2d12,#c2410c)" },
  { name: "Actor B",   initials: "AB", color: "linear-gradient(135deg,#1e1b4b,#4c1d95)" },
  { name: "Actor C",   initials: "AC", color: "linear-gradient(135deg,#064e3b,#15803d)" },
  { name: "Actor D",   initials: "AD", color: "linear-gradient(135deg,#701a75,#9d174d)" },
  { name: "Actor E",   initials: "AE", color: "linear-gradient(135deg,#0c4a6e,#0369a1)" },
  { name: "Actor F",   initials: "AF", color: "linear-gradient(135deg,#92400e,#b45309)" },
];

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = findMovieById(Number(id));
  if (!movie) notFound();

  const qColor = qualityBg[movie.quality] ?? "#15803d";
  const castList = movie.cast ?? mockCast.map(c => c.name);
  const relatedMovies = allMovies
    .filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.includes(g)))
    .slice(0, 10);

  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      {/* ── Hero backdrop ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "72vh", minHeight: "520px" }}>
        {/* Gradient base */}
        <div className="absolute inset-0" style={{ background: movie.gradient }} />

        {/* Backdrop image */}
        {movie.image && (
          <img
            src={movie.image}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ opacity: 0.55 }}
          />
        )}

        {/* Overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0d0d12 0%, rgba(13,13,18,0.6) 50%, rgba(13,13,18,0.1) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,13,18,0.95) 0%, rgba(13,13,18,0.5) 55%, transparent 80%)" }} />

        {/* Floating poster — mobile (top-right) */}
        {movie.image && (
          <div className="lg:hidden absolute top-20 right-4 z-10">
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                width: "110px",
                aspectRatio: "2/3",
                background: movie.gradient,
                boxShadow: "0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,53,0.3)",
              }}
            >
              <img
                src={movie.image}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
              <span
                className="absolute bottom-1.5 left-1.5 text-[8px] font-black px-1 py-0.5 rounded tracking-wide"
                style={{ background: qColor, color: "white" }}
              >
                {movie.quality === "4K" ? "4K" : movie.quality}
              </span>
            </div>
          </div>
        )}

        {/* Floating poster — desktop (right) */}
        {movie.image && (
          <div className="hidden lg:block absolute right-14 bottom-10 z-10">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                width: "240px",
                aspectRatio: "2/3",
                background: movie.gradient,
                boxShadow: "0 24px 64px rgba(0,0,0,0.85), 0 0 0 1.5px rgba(201,168,53,0.3)",
              }}
            >
              <img
                src={movie.image}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
              <span
                className="absolute bottom-2.5 left-2.5 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider"
                style={{ background: qColor, color: "white" }}
              >
                {movie.quality === "4K" ? "4K ULTRA HD" : movie.quality}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 pl-4 pr-32 sm:pl-6 sm:pr-36 lg:pl-14 lg:pr-4 pb-10 max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-4" style={{ color:"#666" }}>
            <a href="/" className="hover:text-amber-400 transition-colors" style={{ color:"#888" }}>Home</a>
            <span>/</span>
            <a href="/movies" className="hover:text-amber-400 transition-colors" style={{ color:"#888" }}>Movies</a>
            <span>/</span>
            <span style={{ color:"#c9a835" }}>{movie.title}</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            {movie.badge && (
              <span className="text-xs font-black px-2.5 py-1 rounded tracking-widest"
                style={{ background: badgeBg[movie.badge] ?? "#c9a835", color:"white" }}>
                {movie.badge}
              </span>
            )}
            <span className="text-xs font-black px-2 py-1 rounded tracking-wider"
              style={{ background: qColor, color:"white" }}>
              {movie.quality === "4K" ? "4K ULTRA HD" : movie.quality}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-black text-white leading-none tracking-tight mb-4 animate-fade-in-up"
            style={{ fontSize:"clamp(2rem,5vw,3.8rem)" }}>
            {movie.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" fill="#c9a835" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-bold" style={{ color:"#c9a835" }}>{movie.rating}</span>
              <span style={{ color:"#555" }}>/10</span>
            </div>
            <span style={{ color:"#555" }}>•</span>
            <span style={{ color:"#aaa" }}>{movie.year}</span>
            <span style={{ color:"#555" }}>•</span>
            <span style={{ color:"#aaa" }}>{movie.duration}</span>
            {movie.director && (
              <>
                <span style={{ color:"#555" }}>•</span>
                <span style={{ color:"#aaa" }}>Dir. <span style={{ color:"#c9a835" }}>{movie.director}</span></span>
              </>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-5">
            {movie.genres.map(g => (
              <a key={g} href={`/movies?genre=${g.toLowerCase()}`}
                className="text-xs px-3 py-1 rounded-full transition-all hover:border-amber-400 hover:text-amber-400"
                style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.13)", color:"#ccc" }}>
                {g}
              </a>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background:"linear-gradient(135deg,#c9a835,#8a6e1a)", color:"#0d0d12", boxShadow:"0 4px 20px rgba(201,168,53,0.35)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Watch Now
            </button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:bg-white/15"
              style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.18)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              My List
            </button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:bg-white/10"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#bbb" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Download
            </button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:bg-white/10"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#bbb" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Trailer
            </button>
          </div>
        </div>
      </div>

      {/* ── Details section ── */}
      <div className="px-4 sm:px-6 lg:px-14 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: description + cast */}
          <div className="lg:col-span-2 space-y-10">

            {/* Synopsis */}
            {movie.description && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 rounded-full shrink-0" style={{ background:"linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                  <h2 className="text-lg font-bold" style={{ color:"#f0f0f0" }}>Synopsis</h2>
                </div>
                <p className="text-base leading-relaxed" style={{ color:"#999" }}>{movie.description}</p>
              </div>
            )}

            {/* Cast */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 rounded-full shrink-0" style={{ background:"linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                <h2 className="text-lg font-bold" style={{ color:"#f0f0f0" }}>Cast</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                {castList.map((name, i) => {
                  const mock = mockCast[i % mockCast.length];
                  return (
                    <div key={name} className="flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black transition-all group-hover:scale-110"
                        style={{ background: mock.color, color:"white", boxShadow:"0 4px 12px rgba(0,0,0,0.5)", border:"2px solid rgba(255,255,255,0.06)" }}>
                        {name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-center font-medium w-20 line-clamp-2 transition-colors group-hover:text-amber-400" style={{ color:"#888" }}>
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: movie info card */}
          <div>
            <div className="rounded-2xl p-5 space-y-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
              {/* Mini poster */}
              <div className="relative rounded-xl overflow-hidden mx-auto" style={{ aspectRatio:"2/3", background:movie.gradient, maxWidth:"180px" }}>
                {movie.image && (
                  <img src={movie.image} alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                )}
                <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
              </div>

              {/* Details list */}
              <div className="space-y-3 pt-1">
                {[
                  { label:"Year",     value: String(movie.year) },
                  { label:"Duration", value: movie.duration },
                  { label:"Quality",  value: movie.quality },
                  { label:"Rating",   value: `${movie.rating} / 10` },
                  { label:"Genres",   value: movie.genres.join(", ") },
                  ...(movie.director ? [{ label:"Director", value: movie.director }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider shrink-0" style={{ color:"#555" }}>{label}</span>
                    <span className="text-sm text-right" style={{ color:"#bbb" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Share */}
              <button className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background:"rgba(201,168,53,0.1)", border:"1px solid rgba(201,168,53,0.3)", color:"#c9a835" }}>
                Share Movie
              </button>
            </div>
          </div>
        </div>

        {/* Related movies row */}
        {relatedMovies.length > 0 && (
          <div className="mt-14">
            <MovieRow title="You Might Also Like" movies={relatedMovies} />
          </div>
        )}
      </div>

      <div className="gold-divider mx-4 sm:mx-6 lg:mx-12 mb-2" />
      <Footer />
    </div>
  );
}
