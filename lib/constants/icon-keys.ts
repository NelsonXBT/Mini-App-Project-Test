/*
 * The icon vocabulary shared by the admin pickers, the server-side validators
 * and the student cards.
 *
 * Icons are stored as keys rather than component names or SVG so the rendered
 * glyph and its colour stay a front-end decision — an admin picks "Support",
 * not a Lucide import. The cards map an unknown key to a neutral fallback, and
 * the actions coerce anything not listed here on write, so a key can be
 * retired in code without blanking a live row.
 *
 * Dependency-free on purpose: imported by both server actions and client
 * components.
 */

export type IconOption = {
  value: string;
  label: string;
};

export const COMMUNITY_ICON_OPTIONS: IconOption[] = [
  { value: "community", label: "Community" },
  { value: "whatsapp", label: "WhatsApp / Chat" },
  { value: "support", label: "Support" },
  { value: "telegram", label: "Telegram" },
  { value: "announcement", label: "Announcements" },
  { value: "video", label: "Live sessions" },
];

export const RESOURCE_ICON_OPTIONS: IconOption[] = [
  { value: "package", label: "Package" },
  { value: "clipboard", label: "Clipboard" },
  { value: "folder", label: "Folder" },
  { value: "palette", label: "Palette" },
  { value: "images", label: "Images" },
  { value: "rabbit", label: "Rabbit" },
  { value: "coins", label: "Coins" },
  { value: "trending", label: "Trending" },
  { value: "chart", label: "Chart" },
  { value: "wrench", label: "Tool" },
  { value: "sparkles", label: "AI / Sparkles" },
];

export const COMMUNITY_ICON_KEYS = COMMUNITY_ICON_OPTIONS.map(
  (option) => option.value,
);

export const RESOURCE_ICON_KEYS = RESOURCE_ICON_OPTIONS.map(
  (option) => option.value,
);
