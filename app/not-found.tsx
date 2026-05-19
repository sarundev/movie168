import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "#0d0d12" }}>
      <div className="text-center">
        <p className="text-7xl font-black mb-4" style={{ color: "#c9a835" }}>404</p>
        <h1 className="text-xl font-bold mb-2" style={{ color: "#f0f0f0" }}>រកមិនឃើញ</h1>
        <p className="text-sm" style={{ color: "#666" }}>មាតិកានេះមិនមានទេ</p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg text-sm font-bold transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#c9a835,#8a6e1a)", color: "#0d0d12" }}
      >
        ត្រឡប់ទៅទំព័រដើម
      </Link>
    </div>
  );
}
