interface Trailer {
  id: number;
  url: string;
  label?: string;
}

function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m =
    url.match(/[?&]v=([^&#]+)/) ??
    url.match(/youtu\.be\/([^?&#]+)/) ??
    url.match(/embed\/([^?&#]+)/);
  return m ? m[1] : null;
}

function thumbUrl(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

export default function TrailerSection({
  trailers,
  movieTitle,
  posterFallback,
}: {
  trailers: Trailer[];
  movieTitle?: string;
  posterFallback?: string;
}) {
  const validTrailers = trailers.filter(t => t.url);
  if (!validTrailers.length) return null;

  return (
    <>
      <div
        className="rounded-xl p-4"
        style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-1 h-5 rounded-full"
            style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }}
          />
          <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>
            Trailer
          </h2>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-semibold ml-1"
            style={{ background: "rgba(201,168,53,0.12)", color: "#c9a835", border: "1px solid rgba(201,168,53,0.25)" }}
          >
            {validTrailers.length}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {validTrailers.map((t, i) => {
            const thumb = thumbUrl(t.url) ?? posterFallback ?? null;
            const label = t.label ?? (movieTitle ? `${movieTitle} · Trailer ${i + 1}` : `Trailer ${i + 1}`);
            return (
              <div
                key={t.id}
                className="group shrink-0 flex flex-col gap-2 text-left"
                style={{ width: "clamp(200px, 30vw, 280px)" }}
              >
                <div
                  className="relative w-full overflow-hidden rounded-xl transition-all duration-250 shadow-[0_4px_18px_rgba(0,0,0,0.55)] group-hover:shadow-[0_8px_28px_rgba(201,168,53,0.3),0_0_0_1.5px_rgba(201,168,53,0.4)] group-hover:scale-[1.02]"
                  style={{
                    aspectRatio: "16/9",
                    background: "#0d0d12",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={label}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(135deg,#1e1b4b,#0d0d12)" }}
                    />
                  )}

                  <div
                    className="absolute inset-0"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  />

                  {movieTitle && (
                    <div className="absolute top-2 left-2 right-2">
                      <p className="text-[11px] font-bold line-clamp-1 leading-tight" style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                        {movieTitle}
                      </p>
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
                      style={{
                        width: "46px",
                        height: "46px",
                        background: "rgba(201,168,53,0.93)",
                        boxShadow: "0 0 24px rgba(201,168,53,0.55)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d0d12">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(0,0,0,0.72)",
                        color: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      Trailer
                    </span>
                  </div>
                </div>

                <p
                  className="text-xs font-semibold leading-snug line-clamp-1 px-0.5 transition-colors group-hover:text-amber-400"
                  style={{ color: "#bbb" }}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
