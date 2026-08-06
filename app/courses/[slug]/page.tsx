
import CourseContent from "@/components/course/CourseContent";
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

  if (!course) {
    return (
      <main>
        <h1 className="text-2xl font-bold">
          Course not found
        </h1>
      </main>
    );
  }

  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  return (
  <CourseGuard course={course}>
    <main className="space-y-6">

  <section className="pb-1">

  <h1
  className="
    text-[1.4rem]
    font-medium
    leading-[1.2]
    tracking-[-0.015em]
    text-[var(--text)]
  "
>
  {course.title}
</h1>

</section>

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