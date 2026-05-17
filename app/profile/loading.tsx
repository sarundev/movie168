export default function ProfileLoading() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* Hero card skeleton */}
        <div className="relative rounded-3xl overflow-hidden mb-4 animate-pulse"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="h-28 w-full" style={{ background: "rgba(201,168,53,0.08)" }} />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-12 mb-5">
              <div className="rounded-full shrink-0" style={{ width: 88, height: 88, background: "rgba(255,255,255,0.08)" }} />
              <div className="pb-1 flex-1 space-y-2">
                <div className="h-5 rounded" style={{ background: "rgba(255,255,255,0.08)", width: "50%" }} />
                <div className="h-3 rounded" style={{ background: "rgba(255,255,255,0.05)", width: "70%" }} />
              </div>
            </div>
            <div className="mb-5 -mx-6" style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <div className="flex justify-around">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-6 w-12 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
                  <div className="h-3 w-16 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet row skeleton */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2].map(i => (
            <div key={i} className="rounded-2xl p-4 animate-pulse"
              style={{ background: "rgba(201,168,53,0.05)", border: "1px solid rgba(201,168,53,0.1)" }}>
              <div className="h-8 w-8 rounded-xl mb-3" style={{ background: "rgba(201,168,53,0.1)" }} />
              <div className="h-8 rounded mb-1" style={{ background: "rgba(201,168,53,0.12)", width: "60%" }} />
              <div className="h-3 rounded" style={{ background: "rgba(255,255,255,0.05)", width: "40%" }} />
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-1.5 mb-6">
          {[80, 70, 85].map((w, i) => (
            <div key={i} className="h-9 rounded-xl animate-pulse" style={{ width: w, background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shrink-0 rounded-xl animate-pulse" style={{ width: 110, aspectRatio: "2/3", background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
