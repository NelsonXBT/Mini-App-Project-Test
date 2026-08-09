/*
 * `cta` is the label on each card's action chip. The verbs are specific to
 * what the channel is for — "Join" a group you become a member of, "Open
 * chat" for one that already exists, "Get help" for support — so the label
 * says what happens on tap instead of repeating a generic "View".
 *
 * `href` is the destination. A card with an empty href renders disabled on
 * purpose: a row that looks tappable and goes nowhere is worse than one
 * that shows it is not wired up yet.
 */
export const communityItems = [
  {
    id: 1,
    icon: "whatsapp",
    title: "WhatsApp Community",
    description: "Connect with other students.",
    cta: "Join",
    href: "",
  },
  {
    id: 2,
    icon: "community",
    title: "General Chat",
    description: "Discuss AI filmmaking together.",
    cta: "Open",
    href: "",
  },
  {
    id: 3,
    icon: "support",
    title: "Chat Support",
    description: "Need help? Contact our team.",
    cta: "Chat",
    href: "",
  },
];
