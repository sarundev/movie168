import type { Metadata } from "next";
import { Geist, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import MobileBottomNav from "./components/MobileBottomNav";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const kantumruy = Kantumruy_Pro({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-khmer",
  display: "swap",
});

export const metadata: Metadata = {
  title: "168NET — Movies & TV Shows",
  description: "Stream the latest movies and TV shows in HD.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" className={`${geistSans.variable} ${kantumruy.variable} h-full`}>
      <body className="bg-[#09090b] text-white min-h-full antialiased" suppressHydrationWarning>
        {/* Extra bottom padding on mobile so content clears the nav bar */}
        <AuthProvider>
          <div className="lg:pb-0 pb-20">
            {children}
          </div>
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
