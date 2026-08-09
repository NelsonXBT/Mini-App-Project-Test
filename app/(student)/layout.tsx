import StudentShell from "@/components/layout/StudentShell";
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
 *
 * Two gates, in order. TelegramAuth decides whether this is a validated Mini
 * App context at all and renders nothing but a message if not; StudentShell
 * then decides how much chrome the route gets. Header and BottomNavigation
 * are imported by StudentShell alone, so neither can mount outside Telegram.
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TelegramAuth>
      <StudentShell>{children}</StudentShell>
    </TelegramAuth>
  );
}
