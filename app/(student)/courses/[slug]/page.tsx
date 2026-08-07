import CourseProgress from "@/components/course/CourseProgress";
import CourseLearning from "@/components/course/CourseLearning";
import CourseGuard from "@/components/guards/CourseGuard";

import {
  getCourse,
  getCourseProgress,
} from "@/lib/db/courses";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;

  const course = await getCourse(slug);

  if (!course) {
    return (
      <main>
        <h1 className="text-2xl font-bold">
          Course not found
        </h1>
      </main>
    );
  }

  const courseProgress = await getCourseProgress(course.id);

  return (
    <CourseGuard course={course}>
      <main className="space-y-4">

        <CourseProgress
          completed={courseProgress.completedLessons}
          total={courseProgress.totalLessons}
          progress={courseProgress.progress}
        />

        <CourseLearning
          course={course}
        />

      </main>
    </CourseGuard>
  );
}