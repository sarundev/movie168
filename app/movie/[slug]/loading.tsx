export default function MovieDetailLoading() {
  return (
    <div className="min-h-screen" style={{ background: "#111116" }}>
      {/* Player skeleton */}
      <div style={{ background: "#000", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="relative w-full mx-auto animate-pulse" style={{ maxWidth: "1350px", aspectRatio: "16/9", background: "#1a1a20" }} />
      </div>

      <div className="px-3 sm:px-5 lg:px-10 pb-16" style={{ marginTop: "-2px" }}>
        <div className="flex flex-col lg:flex-row gap-6 max-w-screen-xl mx-auto pt-4">

          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Info card skeleton */}
            <div className="rounded-xl p-4 animate-pulse" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-4">
                <div className="rounded-lg shrink-0" style={{ width: "90px", aspectRatio: "2/3", background: "#2a2a35" }} />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-5 rounded" style={{ background: "#2a2a35", width: "70%" }} />
                  <div className="h-3 rounded" style={{ background: "#2a2a35", width: "40%" }} />
                  <div className="flex gap-2 mt-2">
                    {[60, 50, 45].map(w => (
                      <div key={w} className="h-6 rounded-full" style={{ background: "#2a2a35", width: `${w}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Synopsis skeleton */}
            <div className="rounded-xl p-4 animate-pulse" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="h-4 rounded mb-3" style={{ background: "#2a2a35", width: "30%" }} />
              <div className="space-y-2">
                <div className="h-3 rounded" style={{ background: "#2a2a35" }} />
                <div className="h-3 rounded" style={{ background: "#2a2a35", width: "90%" }} />
                <div className="h-3 rounded" style={{ background: "#2a2a35", width: "75%" }} />
              </div>
            </div>

            {/* Comments skeleton */}
            <div className="rounded-xl p-4 animate-pulse" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="h-4 rounded mb-4" style={{ background: "#2a2a35", width: "25%" }} />
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-2.5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "#2a2a35" }} />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 rounded" style={{ background: "#2a2a35", width: "25%" }} />
                    <div className="h-3 rounded" style={{ background: "#2a2a35", width: "80%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="rounded-xl overflow-hidden animate-pulse" style={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="h-4 rounded" style={{ background: "#2a2a35", width: "60%" }} />
              </div>
              <div className="p-3 space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="rounded-lg shrink-0" style={{ width: "56px", height: "78px", background: "#2a2a35" }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 rounded" style={{ background: "#2a2a35", width: "90%" }} />
                      <div className="h-2.5 rounded" style={{ background: "#2a2a35", width: "40%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
