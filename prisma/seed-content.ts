/*
 * Moves the hardcoded community and resource lists into the database.
 *
 * Separate from seed.ts on purpose: that script opens with deleteMany() across
 * users, enrollments and progress, so it can only ever run against an empty
 * development database. This one is additive and idempotent — it skips any
 * table that already has rows, so it is safe to run against live data and safe
 * to run twice.
 */
import { PrismaClient, ResourceSection } from "@prisma/client";

const prisma = new PrismaClient();

const channels = [
  {
    icon: "whatsapp",
    title: "WhatsApp Community",
    description: "Connect with other students.",
    cta: "Join",
    url: "",
  },
  {
    icon: "community",
    title: "General Chat",
    description: "Discuss AI filmmaking together.",
    cta: "Open",
    url: "",
  },
  {
    icon: "support",
    title: "Chat Support",
    description: "Need help? Contact our team.",
    cta: "Chat",
    url: "",
  },
];

const packs = [
  {
    title: "Prompt Packs",
    description: "High-quality prompts for AI filmmaking.",
    icon: "package",
    fileCount: 45,
  },
  {
    title: "Workflow Templates",
    description: "Ready-to-use production workflows.",
    icon: "clipboard",
    fileCount: 18,
  },
  {
    title: "Project Files",
    description: "Download project assets and examples.",
    icon: "folder",
    fileCount: 12,
  },
  {
    title: "LUT Collection",
    description: "Professional cinematic LUTs.",
    icon: "palette",
    fileCount: 26,
  },
  {
    title: "Stock Assets",
    description: "Royalty-free images, videos and audio.",
    icon: "images",
    fileCount: 84,
  },
];

const tools = [
  {
    title: "Bunny Stream",
    description: "Secure video hosting platform.",
    icon: "rabbit",
    cta: "Use",
  },
  {
    title: "Bybit",
    description: "Crypto exchange.",
    icon: "coins",
    cta: "Visit",
  },
  {
    title: "Bitget",
    description: "Trade cryptocurrencies securely.",
    icon: "trending",
    cta: "Visit",
  },
  {
    title: "TradingView",
    description: "Professional charting tools.",
    icon: "chart",
    cta: "Use",
  },
];

async function main() {
  const existingChannels = await prisma.communityChannel.count();

  if (existingChannels > 0) {
    console.log(`↷ CommunityChannel already has ${existingChannels} rows, skipping.`);
  } else {
    await prisma.communityChannel.createMany({
      data: channels.map((channel, index) => ({
        ...channel,
        sortOrder: index + 1,
      })),
    });

    console.log(`✓ Seeded ${channels.length} community channels.`);
  }

  const existingItems = await prisma.resourceItem.count();

  if (existingItems > 0) {
    console.log(`↷ ResourceItem already has ${existingItems} rows, skipping.`);
  } else {
    await prisma.resourceItem.createMany({
      data: [
        ...packs.map((pack, index) => ({
          ...pack,
          section: ResourceSection.packs,
          cta: "Browse",
          url: "",
          sortOrder: index + 1,
        })),
        ...tools.map((tool, index) => ({
          ...tool,
          section: ResourceSection.tools,
          // Every current tool is a paid referral, so each one keeps its
          // disclosure. New tools default to false.
          isAffiliate: true,
          url: "",
          sortOrder: index + 1,
        })),
      ],
    });

    console.log(
      `✓ Seeded ${packs.length} packs and ${tools.length} tools.`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
