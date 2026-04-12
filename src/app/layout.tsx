import "@/lib/env"; // fail-fast: validates required env vars at startup
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inspira Updates",
  description: "Scheduled WhatsApp group messages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">
        <nav className="border-b border-slate-800 bg-slate-950 px-6 py-3 font-mono">
          <div className="max-w-4xl mx-auto flex items-center gap-6">
            <span className="text-slate-500 text-xs uppercase tracking-widest select-none">
              Inspira
            </span>
            <Link
              href="/session"
              className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
            >
              Session
            </Link>
            <Link
              href="/groups"
              className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
            >
              Groups
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
