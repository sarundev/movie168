"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { buildPlaybackUrl } from "../../lib/player";
import { fetchEpisodePlayerAction } from "../../actions/tv-show-actions";
import type { ApiTvShow, ApiSeason, ApiEpisode } from "../../lib/api";
import type { ServerUser } from "../../lib/server-auth";

const qualityBg: Record<string, string> = { "4K": "#1d4ed8", FHD: "#b45309", HD: "#15803d" };

function formatRuntime(min: number | null | undefined) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function TvShowClient({
  show,
  slug,
  user,
}: {
  show: ApiTvShow;
  slug: string;
  user: ServerUser | null;
}) {
  const firstSeason = show.seasons?.[0] ?? null;
  const [selectedSeason, setSelectedSeason] = useState<ApiSeason | null>(firstSeason);
  const [selectedEpisode, setSelectedEpisode] = useState<ApiEpisode | null>(
    firstSeason?.episodes?.[0] ?? null,
  );
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [backdropErr, setBackdropErr] = useState(false);

  const poster = show.backdrop_url ?? show.poster_url ?? show.thumbnail_url;
  const qColor = qualityBg[show.quality ?? ""] ?? "#15803d";
  const ratingAvg =
    show.rating?.average ?? show.vote_average ?? null;

  async function handleSelectEpisode(episode: ApiEpisode, season: ApiSeason) {
    setSelectedEpisode(episode);
    setSessionToken(null);
    setPlayerError(null);

    if (!user) return;

    setLoadingPlayer(true);
    const res = await fetchEpisodePlayerAction(slug, season.season_number, episode.episode_number);
    setLoadingPlayer(false);

    if (!res.ok || !res.data) {
      setPlayerError(res.message ?? "Could not load episode.");
      return;
    }
    if (!res.data.can_watch) {
      setPlayerError(res.data.requires_purchase ? "Purchase required to watch." : "Access denied.");
      return;
    }
    setSessionToken(res.data.playback_session_token ?? null);
  }

  function handleSelectSeason(season: ApiSeason) {
    setSelectedSeason(season);
    const firstEp = season.episodes?.[0] ?? null;
    setSelectedEpisode(firstEp);
    setSessionToken(null);
    setPlayerError(null);
  }

  const embedUrl = sessionToken && selectedEpisode
    ? buildPlaybackUrl({
        sessionToken,
        movieSlug: slug,
        sourceId: null,
      })
    : null;

  const episodes = selectedSeason?.episodes ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#111116" }}>
      <Navbar />

      {/* ── Player / Backdrop ── */}
      <div style={{ background: "#000", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="relative w-full mx-auto" style={{ maxWidth: "1350px", aspectRatio: "16/9" }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={selectedEpisode?.title ?? show.title}
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : (
            <>
              {poster && !backdropErr && (
                <Image
                  src={poster}
                  alt={show.title}
                  fill
                  priority
                  className="object-cover"
                  style={{ filter: "brightness(0.3)" }}
                  sizes="100vw"
                  onError={() => setBackdropErr(true)}
                />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                {loadingPlayer ? (
                  <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : playerError ? (
                  <>
                    <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>{playerError}</p>
                    {!user && (
                      <a href={`/login?redirect=/tv-shows/${slug}`}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12" }}>
                        ចូលគណនី
                      </a>
                    )}
                  </>
                ) : selectedEpisode ? (
                  <>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(201,168,53,0.15)", border: "2px solid rgba(201,168,53,0.4)" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="#c9a835">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "#ddd" }}>
                      {selectedEpisode.title ?? `Episode ${selectedEpisode.episode_number}`}
                    </p>
                    {!user ? (
                      <a href={`/login?redirect=/tv-shows/${slug}`}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12" }}>
                        ចូលគណនី
                      </a>
                    ) : (
                      <button
                        onClick={() => selectedSeason && handleSelectEpisode(selectedEpisode, selectedSeason)}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12" }}>
                        ចុចចាក់
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm" style={{ color: "#555" }}>ជ្រើសរើស Episode</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="px-3 sm:px-5 lg:px-10 pb-16 pt-4">
        <div className="flex flex-col lg:flex-row gap-6 max-w-screen-xl mx-auto">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Show info card */}
            <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-4">
                {show.poster_url && (
                  <div className="relative rounded-lg overflow-hidden shrink-0"
                    style={{ width: "90px", aspectRatio: "2/3", background: "#2a2a35" }}>
                    <Image src={show.poster_url} alt={show.title} fill className="object-cover" sizes="90px" />
                    {show.quality && (
                      <span className="absolute bottom-1 left-1 text-[8px] font-black px-1 py-0.5 rounded"
                        style={{ background: qColor, color: "white" }}>{show.quality}</span>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="font-black text-white leading-tight mb-1" style={{ fontSize: "clamp(1.1rem,3vw,1.5rem)" }}>
                    {show.title}
                  </h1>
                  {show.original_title && (
                    <p className="text-xs mb-2 truncate" style={{ color: "#666" }}>{show.original_title}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2" style={{ color: "#666" }}>
                    {show.release_year && <span>{show.release_year}</span>}
                    <span>•</span>
                    <span>{show.seasons_count} Season{show.seasons_count !== 1 ? "s" : ""}</span>
                    <span>•</span>
                    <span>{show.episodes_count} Episodes</span>
                    {show.age_rating && <><span>•</span><span style={{ color: "#ef4444" }}>{show.age_rating}</span></>}
                  </div>
                  {ratingAvg != null && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <svg width="12" height="12" fill="#c9a835" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="text-sm font-bold" style={{ color: "#c9a835" }}>{Number(ratingAvg).toFixed(1)}</span>
                      {show.vote_count != null && (
                        <span className="text-xs" style={{ color: "#555" }}>({show.vote_count})</span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {(show.genres ?? []).map(g => (
                      <span key={g.id} className="text-[11px] px-2.5 py-0.5 rounded"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa" }}>
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {show.overview && (
                <p className="text-sm leading-relaxed mt-4 pt-3" style={{ color: "#999", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  {show.overview}
                </p>
              )}
            </div>

            {/* Season + Episode browser */}
            {show.seasons.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Season tabs */}
                <div className="flex overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {show.seasons.map(season => (
                    <button
                      key={season.id}
                      onClick={() => handleSelectSeason(season)}
                      className="px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
                      style={{
                        color: selectedSeason?.id === season.id ? "#c9a835" : "#666",
                        borderBottom: selectedSeason?.id === season.id ? "2px solid #c9a835" : "2px solid transparent",
                        background: "transparent",
                      }}>
                      Season {season.season_number}
                      {season.episodes_count > 0 && (
                        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.07)", color: "#555" }}>
                          {season.episodes_count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Episode list */}
                <div className="divide-y" style={{ "--tw-divide-opacity": "1" } as React.CSSProperties}>
                  {episodes.length === 0 ? (
                    <p className="text-center py-8 text-sm" style={{ color: "#444" }}>មិនទាន់មាន Episode</p>
                  ) : (
                    episodes.map(ep => {
                      const isSelected = selectedEpisode?.id === ep.id;
                      const runtime = formatRuntime(ep.runtime_minutes);
                      return (
                        <button
                          key={ep.id}
                          onClick={() => selectedSeason && handleSelectEpisode(ep, selectedSeason)}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                          style={{
                            background: isSelected ? "rgba(201,168,53,0.07)" : "transparent",
                            borderLeft: isSelected ? "2px solid #c9a835" : "2px solid transparent",
                          }}
                          onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                          onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {/* Thumbnail */}
                          <div className="relative rounded-lg overflow-hidden shrink-0"
                            style={{ width: "90px", aspectRatio: "16/9", background: "#2a2a35" }}>
                            {ep.thumbnail_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={ep.thumbnail_url} alt={ep.title ?? `E${ep.episode_number}`}
                                className="absolute inset-0 w-full h-full object-cover" loading="lazy"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            ) : null}
                            <div className="absolute inset-0 flex items-center justify-center"
                              style={{ background: ep.thumbnail_url ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.3)" }}>
                              {isSelected && (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                  style={{ background: "rgba(201,168,53,0.9)" }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#0d0d12"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className="text-xs font-bold shrink-0" style={{ color: isSelected ? "#c9a835" : "#555" }}>
                                E{ep.episode_number}
                              </span>
                              <p className="text-sm font-semibold truncate" style={{ color: isSelected ? "#f0f0f0" : "#ccc" }}>
                                {ep.title ?? `Episode ${ep.episode_number}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs" style={{ color: "#555" }}>
                              {runtime && <span>{runtime}</span>}
                              {ep.air_date && <><span>•</span><span>{ep.air_date}</span></>}
                            </div>
                            {ep.overview && (
                              <p className="text-xs mt-1 line-clamp-2" style={{ color: "#666" }}>{ep.overview}</p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Cast */}
            {(show.people ?? []).length > 0 && (
              <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                  <h2 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>តារា</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(show.people ?? []).slice(0, 12).map((p, i) => (
                    <div key={p.id ?? i} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-sm font-black"
                        style={{ background: "linear-gradient(135deg,#c9a835,#8b6914)", color: "#0d0d12" }}>
                        {p.profile_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.profile_url} alt={p.name} className="w-full h-full object-cover"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        ) : p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] text-center w-16 line-clamp-2" style={{ color: "#777" }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            {/* Currently playing */}
            {selectedEpisode && (
              <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                  <h3 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>
                    {sessionToken ? "កំពុងចាក់" : "ជ្រើស Episode"}
                  </h3>
                </div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#c9a835" }}>
                  S{selectedEpisode.season_number} E{selectedEpisode.episode_number}
                </p>
                <p className="text-sm font-semibold leading-snug" style={{ color: "#ddd" }}>
                  {selectedEpisode.title ?? `Episode ${selectedEpisode.episode_number}`}
                </p>
                {selectedEpisode.overview && (
                  <p className="text-xs mt-2 line-clamp-3" style={{ color: "#666" }}>
                    {selectedEpisode.overview}
                  </p>
                )}
                {formatRuntime(selectedEpisode.runtime_minutes) && (
                  <p className="text-xs mt-2" style={{ color: "#555" }}>
                    {formatRuntime(selectedEpisode.runtime_minutes)}
                  </p>
                )}
              </div>
            )}

            {/* Show info */}
            <div className="rounded-xl p-4" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom,#c9a835,#8a6e1a)" }} />
                <h3 className="text-sm font-bold" style={{ color: "#f0f0f0" }}>ព័ត៌មាន</h3>
              </div>
              {[
                show.release_year && { label: "ឆ្នាំ", value: String(show.release_year) },
                { label: "Season", value: String(show.seasons_count) },
                { label: "Episodes", value: String(show.episodes_count) },
                show.access_type && { label: "ការចូលមើល", value: show.access_type === "free" ? "ឥតគិតថ្លៃ" : "ទូទាត់" },
              ].filter(Boolean).map(row => {
                const { label, value } = row as { label: string; value: string };
                return (
                  <div key={label} className="flex items-center py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span className="text-xs w-24 shrink-0 font-medium" style={{ color: "#555" }}>{label}</span>
                    <span className="text-sm" style={{ color: "#bbb" }}>{value}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <div className="mx-4 sm:mx-6 lg:mx-12 mb-2" style={{ height: 1, background: "rgba(201,168,53,0.12)" }} />
      <Footer />
    </div>
  );
}
