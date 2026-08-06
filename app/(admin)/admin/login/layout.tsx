import { ReactNode } from "react";

/**
 * The login screen sits inside the (admin) group but must not render the
 * admin chrome, so this route segment gets its own bare layout that overrides
 * the shell in app/(admin)/admin/layout.tsx.
 */
export default function AdminLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
