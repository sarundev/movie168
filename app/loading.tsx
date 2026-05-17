export default function HomeLoading() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      {/* Hero skeleton */}
      <div className="relative pt-16 md:pt-24">
        <div className="animate-pulse" style={{ aspectRatio: "21/9", maxHeight: "560px", background: "#1a1a20" }} />
      </div>

      {/* Genre bar skeleton */}
      <div className="px-4 sm:px-6 lg:px-12 py-3 flex gap-2.5 overflow-hidden"
        style={{ background: "rgba(13,13,18,0.95)", borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
        {[80, 70, 90, 65, 80, 75, 60].map((w, i) => (
          <div key={i} className="shrink-0 h-8 rounded-lg animate-pulse" style={{ width: `${w}px`, background: "rgba(255,255,255,0.06)" }} />
        ))}
      </div>

      {/* Row skeletons */}
      <div className="px-4 sm:px-6 lg:px-12 pt-4 space-y-8">
        {[1, 2, 3].map(row => (
          <div key={row}>
            <div className="h-5 rounded mb-4 animate-pulse" style={{ background: "rgba(255,255,255,0.07)", width: "140px" }} />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shrink-0 rounded-xl animate-pulse" style={{ width: "130px", aspectRatio: "2/3", background: "rgba(255,255,255,0.06)" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
