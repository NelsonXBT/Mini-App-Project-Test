import { ReactNode } from "react";

/**
 * Bare passthrough. The admin group must not inherit the student chrome
 * (TelegramAuth / Header / BottomNavigation), and the authenticated shell is
 * applied one level down in admin/(protected)/layout.tsx so that the login
 * page can sit outside it.
 */
export default function AdminGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
