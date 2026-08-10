import {
  ChartColumn,
  ClipboardList,
  Coins,
  FolderOpen,
  Images,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  Package,
  Palette,
  Rabbit,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  Wrench,
} from "lucide-react";

/*
 * Maps the icon keys stored in the database to a glyph and a colour.
 *
 * Lives apart from the cards so the admin editor can preview exactly what a
 * student will see. Keys come from lib/constants/icon-keys.ts, which the
 * server actions validate against; anything unrecognised resolves to the
 * neutral fallback below rather than rendering an empty tile.
 *
 * Every class is written out in full and never assembled from a variable:
 * Tailwind generates utilities by scanning source text, so a template-built
 * `bg-[${hex}]/10` would compile to nothing and the tile would come out bare.
 * That is also why the palette repeats instead of being factored into a
 * helper — the literals have to survive in the file for the scanner to see.
 */

export type IconStyle = {
  Glyph: LucideIcon;
  /* Glyph colour. */
  tint: string;
  /* Container wash + hairline rim, in the same hue as the glyph. */
  tile: string;
  ring: string;
  /*
   * A wash bled diagonally across the whole card in the icon's own hue.
   *
   * Kept faint on purpose. Its job is to give each row an identity and stop a
   * stack of cards reading as one repeated grey block — not to colour the
   * card. Anything stronger and the oxblood CTA stops being the loudest thing
   * on screen, which is the one hierarchy the palette must protect.
   */
  sheen: string;
  /* The same hue, warmed a step, for the card's edge. */
  edge: string;
};

const NEUTRAL_TILE = "bg-[var(--surface-secondary)]";
const NEUTRAL_TINT = "text-[var(--text-muted)]";

const neutral = (Glyph: LucideIcon): IconStyle => ({
  Glyph,
  tint: NEUTRAL_TINT,
  tile: NEUTRAL_TILE,
  ring: "",
  /*
   * Neutral icons still get a wash so an uncoloured row is not visibly
   * flatter than its neighbours — drawn from the text colour, so it reads as
   * depth rather than as a hue the palette does not have.
   */
  sheen: "bg-linear-to-br from-[var(--text)]/[0.045] via-transparent to-transparent",
  edge: "border-[var(--border)]",
});

export const COMMUNITY_ICONS: Record<string, IconStyle> = {
  whatsapp: {
    Glyph: MessageCircle,
    tint: "text-[#3f8f63]",
    tile: "bg-[#3f8f63]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(63,143,99,0.18)]",
    sheen: "bg-linear-to-br from-[#3f8f63]/[0.10] via-[#3f8f63]/[0.03] to-transparent",
    edge: "border-[#3f8f63]/25",
  },
  community: {
    Glyph: Users,
    tint: "text-[#4a6fa8]",
    tile: "bg-[#4a6fa8]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(74,111,168,0.18)]",
    sheen: "bg-linear-to-br from-[#4a6fa8]/[0.10] via-[#4a6fa8]/[0.03] to-transparent",
    edge: "border-[#4a6fa8]/25",
  },
  support: {
    Glyph: MessageSquareText,
    tint: "text-[#c47a3d]",
    tile: "bg-[#c47a3d]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(196,122,61,0.18)]",
    sheen: "bg-linear-to-br from-[#c47a3d]/[0.10] via-[#c47a3d]/[0.03] to-transparent",
    edge: "border-[#c47a3d]/25",
  },
  telegram: {
    Glyph: Send,
    tint: "text-[#4a72b8]",
    tile: "bg-[#4a72b8]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(74,114,184,0.18)]",
    sheen: "bg-linear-to-br from-[#4a72b8]/[0.10] via-[#4a72b8]/[0.03] to-transparent",
    edge: "border-[#4a72b8]/25",
  },
  announcement: {
    Glyph: Megaphone,
    tint: "text-[#b8802a]",
    tile: "bg-[#b8802a]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(184,128,42,0.18)]",
    sheen: "bg-linear-to-br from-[#b8802a]/[0.10] via-[#b8802a]/[0.03] to-transparent",
    edge: "border-[#b8802a]/25",
  },
  video: {
    Glyph: Video,
    tint: "text-[#7a5cc0]",
    tile: "bg-[#7a5cc0]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(122,92,192,0.18)]",
    sheen: "bg-linear-to-br from-[#7a5cc0]/[0.10] via-[#7a5cc0]/[0.03] to-transparent",
    edge: "border-[#7a5cc0]/25",
  },
};

export const RESOURCE_ICONS: Record<string, IconStyle> = {
  package: neutral(Package),
  rabbit: neutral(Rabbit),
  wrench: neutral(Wrench),
  clipboard: {
    Glyph: ClipboardList,
    tint: "text-[#3f8f63]",
    tile: "bg-[#3f8f63]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(63,143,99,0.18)]",
    sheen: "bg-linear-to-br from-[#3f8f63]/[0.10] via-[#3f8f63]/[0.03] to-transparent",
    edge: "border-[#3f8f63]/25",
  },
  folder: {
    Glyph: FolderOpen,
    tint: "text-[#b8802a]",
    tile: "bg-[#b8802a]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(184,128,42,0.18)]",
    sheen: "bg-linear-to-br from-[#b8802a]/[0.10] via-[#b8802a]/[0.03] to-transparent",
    edge: "border-[#b8802a]/25",
  },
  palette: {
    Glyph: Palette,
    tint: "text-[#7a5cc0]",
    tile: "bg-[#7a5cc0]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(122,92,192,0.18)]",
    sheen: "bg-linear-to-br from-[#7a5cc0]/[0.10] via-[#7a5cc0]/[0.03] to-transparent",
    edge: "border-[#7a5cc0]/25",
  },
  images: {
    Glyph: Images,
    tint: "text-[#c47a3d]",
    tile: "bg-[#c47a3d]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(196,122,61,0.18)]",
    sheen: "bg-linear-to-br from-[#c47a3d]/[0.10] via-[#c47a3d]/[0.03] to-transparent",
    edge: "border-[#c47a3d]/25",
  },
  coins: {
    Glyph: Coins,
    tint: "text-[#b8802a]",
    tile: "bg-[#b8802a]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(184,128,42,0.18)]",
    sheen: "bg-linear-to-br from-[#b8802a]/[0.10] via-[#b8802a]/[0.03] to-transparent",
    edge: "border-[#b8802a]/25",
  },
  trending: {
    Glyph: TrendingUp,
    tint: "text-[#3f8f63]",
    tile: "bg-[#3f8f63]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(63,143,99,0.18)]",
    sheen: "bg-linear-to-br from-[#3f8f63]/[0.10] via-[#3f8f63]/[0.03] to-transparent",
    edge: "border-[#3f8f63]/25",
  },
  chart: {
    Glyph: ChartColumn,
    tint: "text-[#4a72b8]",
    tile: "bg-[#4a72b8]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(74,114,184,0.18)]",
    sheen: "bg-linear-to-br from-[#4a72b8]/[0.10] via-[#4a72b8]/[0.03] to-transparent",
    edge: "border-[#4a72b8]/25",
  },
  sparkles: {
    Glyph: Sparkles,
    tint: "text-[#7a5cc0]",
    tile: "bg-[#7a5cc0]/10",
    ring: "shadow-[inset_0_0_0_1px_rgba(122,92,192,0.18)]",
    sheen: "bg-linear-to-br from-[#7a5cc0]/[0.10] via-[#7a5cc0]/[0.03] to-transparent",
    edge: "border-[#7a5cc0]/25",
  },
};

export function communityIcon(key: string): IconStyle {
  return COMMUNITY_ICONS[key] ?? neutral(Users);
}

export function resourceIcon(key: string): IconStyle {
  return RESOURCE_ICONS[key] ?? neutral(Package);
}
