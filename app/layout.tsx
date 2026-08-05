import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";

import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import TelegramAuth from "@/components/telegram/TelegramAuth";
import { SessionProvider } from "@/contexts/SessionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IME Creative Lab",
  description: "AI Filmmaking Learning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
  lang="en"
  suppressHydrationWarning
  className={`${geistSans.variable} ${geistMono.variable}`}
>
  <body className="min-h-screen bg-[var(--background)] text-[var(--text)] antialiased">

<SessionProvider>
  <TelegramAuth>
    <main className="app-main mx-auto min-h-screen max-w-md px-6 pt-5 pb-28">
      <Header />

      <div className="space-y-6">
        {children}
      </div>
    </main>

    <BottomNavigation />
  </TelegramAuth>
</SessionProvider>      </body>
    </html>
  );
}