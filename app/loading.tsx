export default function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d12" }}>
      <div className="flex flex-col items-center gap-4">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a835" strokeWidth="2.5" className="animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p className="text-sm font-medium" style={{ color: "#666" }}>Loading…</p>
      </div>
    </div>
  );
}
