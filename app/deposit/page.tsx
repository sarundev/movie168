import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import DepositForm from "./DepositForm";

export default async function DepositPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0d12" }}>
      <Navbar />

      <div className="pt-24 pb-2 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-1.5 text-[11px] mb-3" style={{ color: "#444" }}>
          <Link href="/" className="hover:text-amber-400 transition-colors" style={{ color: "#444" }}>ទំព័រដើម</Link>
          <span>/</span>
          <span style={{ color: "#c9a835" }}>Top-Up</span>
        </div>
        <h1 className="text-2xl font-black" style={{ color: "#f0f0f0" }}>Top-Up</h1>
        <p className="text-sm mt-1" style={{ color: "#555" }}>ដាក់ប្រាក់ចូល Balance ឬទិញ Credits</p>
      </div>

      <DepositForm />

      <Footer />
    </div>
  );
}
