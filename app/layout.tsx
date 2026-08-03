import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";

import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import TelegramAuth from "@/components/telegram/TelegramAuth";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-black`}
    >
      <body className="min-h-screen bg-black text-white">
        <Script
  src="https://telegram.org/js/telegram-web-app.js"
  strategy="beforeInteractive"
/>

<TelegramAuth>
  <main className="app-main min-h-screen px-5 pt-3 pb-20">
    <Header />

    <div className="mt-3">
      {children}
    </div>
  </main>

  <BottomNavigation />
</TelegramAuth>
      </body>
    </html>
  );
}