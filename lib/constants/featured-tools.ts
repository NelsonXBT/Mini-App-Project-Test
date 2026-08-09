/*
 * `cta` replaces the old "Affiliate" pill in the card's action slot. The verb
 * fits the tool: you sign up for an exchange, you open a platform you already
 * work in. "Use" and "Visit" are not interchangeable, so neither is applied
 * blanket-wise across the list.
 *
 * `affiliate` stays as a separate flag rather than being folded into the CTA.
 * A paid referral has to be disclosed to be honest with members, and the
 * disclosure belongs next to the tool's name, not on the button.
 */
export const featuredTools = [
  {
    id: 1,
    title: "Bunny Stream",
    description: "Secure video hosting platform.",
    icon: "rabbit",
    cta: "Use",
    affiliate: true,
    href: "",
  },
  {
    id: 2,
    title: "Bybit",
    description: "Crypto exchange.",
    icon: "coins",
    cta: "Visit",
    affiliate: true,
    href: "",
  },
  {
    id: 3,
    title: "Bitget",
    description: "Trade cryptocurrencies securely.",
    icon: "trending",
    cta: "Visit",
    affiliate: true,
    href: "",
  },
  {
    id: 4,
    title: "TradingView",
    description: "Professional charting tools.",
    icon: "chart",
    cta: "Use",
    affiliate: true,
    href: "",
  },
];
