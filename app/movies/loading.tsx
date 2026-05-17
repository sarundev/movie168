export default function MoviesLoading() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <div className="px-4 sm:px-6 lg:px-12 pt-20 pb-6" style={{ borderBottom: "1px solid rgba(201,168,53,0.1)" }}>
        <div className="h-8 rounded animate-pulse mb-2" style={{ background: "rgba(255,255,255,0.07)", width: "160px" }} />
        <div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.05)", width: "80px" }} />
      </div>
      <div className="px-4 sm:px-6 lg:px-12 py-8">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i}>
              <div className="rounded-lg sm:rounded-xl animate-pulse" style={{ aspectRatio: "2/3", background: "rgba(255,255,255,0.06)" }} />
              <div className="mt-1.5 space-y-1">
                <div className="h-3 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)", width: "80%" }} />
                <div className="h-2.5 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)", width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
