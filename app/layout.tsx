import type { Metadata } from "next";
import { Geist, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ClientMobileBottomNav from "./components/ClientMobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const kantumruy = Kantumruy_Pro({
  subsets: ["khmer"],
  weight: ["400", "700"],
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
      <head>
        <link rel="preconnect" href="https://streaming-backend-hldchiyj.on-forge.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn-mdia.sgp1.digitaloceanspaces.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://streaming-backend-hldchiyj.on-forge.com" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://cdn-mdia.sgp1.digitaloceanspaces.com" />
      </head>
      <body className="bg-[#09090b] text-white min-h-full antialiased" suppressHydrationWarning>
        {/* Extra bottom padding on mobile so content clears the nav bar */}
        <AuthProvider>
          <div className="lg:pb-0 pb-20">
            {children}
          </div>
          <ClientMobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
