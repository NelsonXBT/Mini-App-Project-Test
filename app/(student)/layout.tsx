import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import TelegramAuth from "@/components/telegram/TelegramAuth";

/**
 * The student Mini App chrome.
 *
 * This is exactly what app/layout.tsx used to render. It moved down into the
 * (student) route group so that /admin, which lives in the (admin) group, does
 * not inherit the Telegram access gate or the student header and navigation —
 * a root layout in Next.js always wraps every nested layout, so the split has
 * to happen one level below the root.
 *
 * URLs are unchanged: route groups in parentheses do not appear in the path.
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TelegramAuth>
      <main className="app-main min-h-screen px-5 pt-4 pb-28">
        <Header />

        <div>{children}</div>
      </main>

      <BottomNavigation />
    </TelegramAuth>
  );
}
