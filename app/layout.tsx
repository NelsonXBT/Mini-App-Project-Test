import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";

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
  title: "Nadi Academy",
  description: "AI Filmmaking Learning Platform",
};

/**
 * Document shell only.
 *
 * The student chrome (TelegramAuth, Header, BottomNavigation) lives in
 * app/(student)/layout.tsx, because a root layout wraps every route — the
 * admin dashboard would otherwise inherit the Telegram access gate.
 *
 * SessionProvider stays here: it is only React context with no Telegram
 * dependency, and keeping it at the root means the admin tree renders
 * without a second provider.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--text)]">
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />

        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
