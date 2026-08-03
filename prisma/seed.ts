import { PrismaClient, VideoProvider, ResourceType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Delete old data (correct order)
  await prisma.resource.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Create Course
  const course = await prisma.course.create({
  data: {
    title: "AI Filmmaking Masterclass",
    slug: "ai-filmmaking-masterclass",
    description:
      "Learn how to create professional AI films from idea to final export.",
    thumbnail: "/thumbnails/coursethumbnail.png",
    purchaseUrl: "https://your-nestuge-link",
    isFree: true,
    isPublished: true,

    telegramChatId: "-1003963602715",
    telegramInviteLink: "https://t.me/+mWgnZjYYR3RjZTNk",
  },
});

  // Create Module
  const module1 = await prisma.module.create({
    data: {
      title: "Getting Started",
      order: 1,
      courseId: course.id,
    },
  });

  

  // Create Lesson
  const lesson1 = await prisma.lesson.create({
    data: {
      title: "Welcome",
      description: "Welcome to the course.",
      provider: VideoProvider.bunny,
      videoId:
        "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8",
      duration: 300,
      order: 1,
      moduleId: module1.id,
    },
  });

  await prisma.lesson.create({
  data: {
    title: "Course Roadmap",
    description: "Understand what you'll build throughout this masterclass.",
    provider: VideoProvider.bunny,
    videoId:
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8",
    duration: 240,
    order: 2,
    moduleId: module1.id,
  },
});

await prisma.lesson.create({
  data: {
    title: "Setting Up Your AI Toolkit",
    description: "Install and prepare all the tools you'll use.",
    provider: VideoProvider.bunny,
    videoId:
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8",
    duration: 360,
    order: 3,
    moduleId: module1.id,
  },
});

  const module2 = await prisma.module.create({
  data: {
    title: "Story Development",
    order: 2,
    courseId: course.id,
  },
});

const lesson2 = await prisma.lesson.create({
  data: {
    title: "Finding Great AI Film Ideas",
    description: "Learn how to discover ideas worth turning into AI films.",
    provider: VideoProvider.bunny,
    videoId:
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8",
    duration: 420,
    order: 1,
    moduleId: module2.id,
  },
});

await prisma.lesson.create({
  data: {
    title: "Writing Strong AI Scripts",
    description: "Learn to write scripts AI can faithfully execute.",
    provider: VideoProvider.bunny,
    videoId:
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8",
    duration: 480,
    order: 2,
    moduleId: module2.id,
  },
});

await prisma.lesson.create({
  data: {
    title: "Planning Your Scenes",
    description: "Break your script into clear cinematic scenes.",
    provider: VideoProvider.bunny,
    videoId:
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8",
    duration: 420,
    order: 3,
    moduleId: module2.id,
  },
});


const module3 = await prisma.module.create({
  data: {
    title: "Character Creation",
    order: 3,
    courseId: course.id,
  },
});

const lesson3 = await prisma.lesson.create({
  data: {
    title: "Creating Consistent Characters",
    description:
      "Build AI characters that remain consistent throughout your film.",
    provider: VideoProvider.bunny,
    videoId:
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8",
    duration: 540,
    order: 1,
    moduleId: module3.id,
  },
});

await prisma.lesson.create({
  data: {
    title: "Designing Character Styles",
    description: "Create a visual identity for every character.",
    provider: VideoProvider.bunny,
    videoId:
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8",
    duration: 510,
    order: 2,
    moduleId: module3.id,
  },
});

await prisma.lesson.create({
  data: {
    title: "Maintaining Character Consistency",
    description: "Keep characters looking identical throughout the film.",
    provider: VideoProvider.bunny,
    videoId:
      "https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8",
    duration: 600,
    order: 3,
    moduleId: module3.id,
  },
});

  // Lesson Resources
  await prisma.resource.createMany({
  data: [
    {
      lessonId: lesson1.id,
      title: "Course Notes",
      type: ResourceType.google_doc,
      url: "https://docs.google.com",
      sortOrder: 1,
    },
    {
      lessonId: lesson2.id,
      title: "Story Development Worksheet",
      type: ResourceType.google_doc,
      url: "https://docs.google.com",
      sortOrder: 1,
    },
    {
      lessonId: lesson3.id,
      title: "Character Prompt Template",
      type: ResourceType.google_doc,
      url: "https://docs.google.com",
      sortOrder: 1,
    },
  ],
});

  console.log("✅ Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });