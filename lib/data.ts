export const user = {
  name: "Nelson",
};

export const currentCourse = {
  id: 1,
  title: "AI Filmmaking Masterclass",
  progress: 22,
  currentLesson: "Creating Consistent Characters",
};

export const nextLessons = [
  {
    id: 1,
    title: "Camera Movement",
    lesson: "Lesson 12",
  },
  {
    id: 2,
    title: "Lighting",
    lesson: "Lesson 13",
  },
  {
    id: 3,
    title: "Lip Sync",
    lesson: "Lesson 14",
  },
];

export const allCourses = [
  {
    id: 1,
    title: "AI Filmmaking Masterclass",
    description:
      "Complete guide to AI filmmaking from start to finish.",
    thumbnail: "/thumbnails/coursethumbnail.png",
    lessons: 42,
    enrolled: true,
    progress: 22,
    level: "Beginner",
  },
  {
    id: 2,
    title: "AI Character Consistency",
    description:
      "Create consistent AI characters across every scene.",
    thumbnail: "/thumbnails/coursethumbnail.png",
    lessons: 28,
    enrolled: false,
    progress: 0,
    level: "Intermediate",
  },
  {
    id: 3,
    title: "AI Sound Design",
    description:
      "Learn cinematic AI sound effects and ambience.",
    thumbnail: "/thumbnails/coursethumbnail.png",
    lessons: 19,
    enrolled: false,
    progress: 0,
    level: "Intermediate",
  },
];

export const lessons = [
  // ==========================
  // Course 1
  // ==========================
  {
    id: 1,
    courseId: 1,
    title: "Welcome",
    duration: "5 min",
    completed: true,
    videoUrl: "/videos/demo.mp4",
    thumbnail: "/thumbnails/coursethumbnail.png",
    description:
      "Welcome to the AI Filmmaking Masterclass. In this lesson, you'll get an overview of the course, how it is structured, and what you'll be building by the end.",
  },
  {
    id: 2,
    courseId: 1,
    title: "Setting Up Your AI Tools",
    duration: "14 min",
    completed: true,
    videoUrl: "/videos/demo.mp4",
    thumbnail: "/public/thumbnails/coursethumbnail",
    description:
      "Learn how to install, configure, and organize the AI tools you'll use throughout this course, including video generation, editing, and audio tools.",
  },
  {
    id: 3,
    courseId: 1,
    title: "Character Consistency",
    duration: "22 min",
    completed: false,
    videoUrl: "/videos/demo.mp4",
    thumbnail: "/public/thumbnails/coursethumbnail",
    description:
      "Discover techniques for creating AI characters that remain visually consistent across multiple scenes, camera angles, and animations.",
  },
  {
    id: 4,
    courseId: 1,
    title: "Camera Movement",
    duration: "18 min",
    completed: false,
    videoUrl: "/videos/demo.mp4",
    thumbnail: "/public/thumbnails/coursethumbnail",
    description:
      "Learn cinematic camera movements such as dolly, crane, orbit, push-in, and tracking shots to make your AI videos feel more professional.",
  },
  {
    id: 5,
    courseId: 1,
    title: "Lip Sync",
    duration: "12 min",
    completed: false,
    videoUrl: "/videos/demo.mp4",
    thumbnail: "/public/thumbnails/coursethumbnail",
    description:
      "Generate realistic lip synchronization using AI tools and understand how to combine voiceovers with believable facial animation.",
  },

  // ==========================
  // Course 2
  // ==========================
  {
    id: 6,
    courseId: 2,
    title: "Introduction",
    duration: "6 min",
    completed: false,
    videoUrl: "/videos/demo.mp4",
    thumbnail: "/thumbnails/coursethumbnail",
    description:
      "Get an overview of character consistency, why it matters, and the workflow you'll follow throughout this course.",
  },
  {
    id: 7,
    courseId: 2,
    title: "Prompt Engineering",
    duration: "19 min",
    completed: false,
    videoUrl: "/videos/demo.mp4",
    thumbnail: "/thumbnails/coursethumbnail",
    description:
      "Master prompt engineering techniques that produce consistent AI characters with fewer retries and higher-quality results.",
  },

  // ==========================
  // Course 3
  // ==========================
  {
    id: 8,
    courseId: 3,
    title: "Getting Started",
    duration: "8 min",
    completed: false,
    videoUrl: "/videos/demo.mp4",
    thumbnail: "/thumbnails/coursethumbnail",
    description:
      "Begin your AI sound design journey by understanding ambience, sound effects, dialogue, and background music workflows.",
  },
];


export const courseFiles = [
  {
    id: 1,
    courseId: 1,
    title: "Project Files",
    files: 12,
    icon: "📁",
  },
  {
    id: 2,
    courseId: 1,
    title: "Source Footage",
    files: 8,
    icon: "🎥",
  },
  {
    id: 3,
    courseId: 1,
    title: "PDF Guides",
    files: 5,
    icon: "📕",
  },
  {
    id: 4,
    courseId: 1,
    title: "Presets & LUTs",
    files: 6,
    icon: "🎨",
  },
  {
    id: 5,
    courseId: 1,
    title: "Templates",
    files: 4,
    icon: "🧩",
  },
];

export const resourcePacks = [
  {
    id: 1,
    title: "Prompt Packs",
    description: "High-quality prompts for AI filmmaking.",
    icon: "✨",
    files: 45,
  },
  {
    id: 2,
    title: "Workflow Templates",
    description: "Ready-to-use production workflows.",
    icon: "📋",
    files: 18,
  },
  {
    id: 3,
    title: "Project Files",
    description: "Download project assets and examples.",
    icon: "📁",
    files: 12,
  },
  {
    id: 4,
    title: "LUT Collection",
    description: "Professional cinematic LUTs.",
    icon: "🎨",
    files: 26,
  },
  {
    id: 5,
    title: "Stock Assets",
    description: "Royalty-free images, videos and audio.",
    icon: "🖼️",
    files: 84,
  },
];

export const resourceTools = [
  {
    id: 1,
    title: "Bunny Stream",
    description: "Secure video hosting platform.",
    icon: "🐰",
  },
  {
    id: 2,
    title: "Bybit",
    description: "Crypto exchange.",
    icon: "💰",
  },
  {
    id: 3,
    title: "Bitget",
    description: "Trade cryptocurrencies securely.",
    icon: "📈",
  },
  {
    id: 4,
    title: "TradingView",
    description: "Professional charting tools.",
    icon: "📊",
  },
];


export const communityItems = [
  {
    id: 1,
    title: "Telegram Community",
    description: "Chat with other creators and members.",
    icon: "💬",
  },
  {
    id: 2,
    title: "Announcements",
    description: "Course updates and important news.",
    icon: "📢",
  },
  {
    id: 3,
    title: "Support",
    description: "Get help whenever you're stuck.",
    icon: "🛟",
  },
  {
    id: 4,
    title: "Live Sessions",
    description: "Weekly Q&A and creator workshops.",
    icon: "🎥",
  },
];
