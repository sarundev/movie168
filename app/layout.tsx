import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="bg-[#09090b] text-white min-h-full antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
