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
      thumbnail:
        "/thumbnails/coursethumbnail.png",
      isFree: true,
      isPublished: true,
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
        lessonId: lesson1.id,
        title: "Official Veo Documentation",
        type: ResourceType.website,
        url: "https://deepmind.google/technologies/veo/",
        sortOrder: 2,
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