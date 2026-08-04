import { notFound } from "next/navigation";

import { getLesson, getCourseLessons } from "@/lib/db/lessons";

import LessonHeader from "@/components/lesson/LessonHeader";
import LessonMeta from "@/components/lesson/LessonMeta";
import LessonVideoSection from "@/components/lesson/LessonVideoSection";
import LessonDescription from "@/components/lesson/LessonDescription";
import LessonNavigation from "@/components/lesson/LessonNavigation";
import LessonInfo from "@/components/lesson/LessonInfo";
import UpNext from "@/components/lesson/UpNext";
import MarkComplete from "@/components/lesson/MarkComplete";

type Props = {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
};

export default async function LessonPage({
  params,
}: Props) {
  const { slug, lessonId } = await params;

  const lesson = await getLesson(slug, lessonId);
  console.log("LESSON");
console.dir(lesson, { depth: null });

  if (!lesson) {
    notFound();
  }

  const allLessons = await getCourseLessons(slug);

  if (!allLessons) {
    notFound();
  }

  const currentIndex = allLessons.findIndex(
    (l) => l.id === lesson.id
  );

  const previousLesson =
    currentIndex > 0 ? allLessons[currentIndex - 1] : null;

  const nextLesson =
    currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  return (
    <main>
      <div className="mx-auto max-w-3xl space-y-4">
        <LessonHeader
          courseSlug={slug}
          courseTitle={lesson.module.course.title}
        />

        <LessonMeta
          duration={lesson.duration ?? 0}
          completed={false}
        />

        <LessonVideoSection
          lessonId={lesson.id}
          provider={lesson.provider}
          videoId={lesson.videoId}
        />

        <LessonInfo
          lessonNumber={currentIndex + 1}
          totalLessons={allLessons.length}
          title={lesson.title}
        />

        <LessonDescription
          description={lesson.description ?? ""}
        />

        {nextLesson && (
          <UpNext
            title={nextLesson.title}
            duration={nextLesson.duration ?? 0}
            href={`/courses/${slug}/lessons/${nextLesson.id}`}
          />
        )}

        <MarkComplete completed={false} />

        <LessonNavigation
          lessonId={lesson.id}
          courseSlug={slug}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
        />
      </div>
    </main>
  );
}