import { allCourses, lessons } from "@/lib/data";
import LessonHeader from "@/components/lesson/LessonHeader";
import LessonMeta from "@/components/lesson/LessonMeta";
import VideoPlayer from "@/components/lesson/VideoPlayer";
import LessonDescription from "@/components/lesson/LessonDescription";
import LessonNavigation from "@/components/lesson/LessonNavigation";
import LessonInfo from "@/components/lesson/LessonInfo";
import UpNext from "@/components/lesson/UpNext";
import MarkComplete from "@/components/lesson/MarkComplete";




type Props = {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
};

export default async function LessonPage({ params }: Props) {
  const { id, lessonId } = await params;

  const course = allCourses.find(
    (course) => course.id === Number(id)
  );

  const lesson = lessons.find(
    (lesson) =>
      lesson.id === Number(lessonId) &&
      lesson.courseId === Number(id)
  );

  const courseLessons = lessons.filter(
    (lesson) => lesson.courseId === Number(id)
  );

  const currentIndex = courseLessons.findIndex(
    (lesson) => lesson.id === Number(lessonId)
  );

  // Lesson Progress
  const lessonNumber = currentIndex + 1;
  const totalLessons = courseLessons.length;

  // Previous Lesson
  const previousLesson =
    currentIndex > 0
      ? courseLessons[currentIndex - 1]
      : null;

  // Next Lesson
  const nextLesson =
    currentIndex < courseLessons.length - 1
      ? courseLessons[currentIndex + 1]
      : null;

  if (!course || !lesson) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-3xl font-bold">
          Lesson not found
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
         <LessonHeader
        courseId={id}
        courseTitle={course.title}
      />

      <LessonMeta
        duration={lesson.duration}
        completed={lesson.completed}
      />

      <VideoPlayer
        videoUrl={lesson.videoUrl}
        thumbnail={lesson.thumbnail}
      />

            <LessonInfo
            lessonNumber={lessonNumber}
            totalLessons={totalLessons}
            title={lesson.title}
        />

        <hr className="my-8 border-zinc-800" />

      <LessonDescription
        description={lesson.description}
      />

      <hr className="my-8 border-zinc-800" />

      {nextLesson && (
            <UpNext
                title={nextLesson.title}
                duration={nextLesson.duration}
                href={`/courses/${id}/lessons/${nextLesson.id}`}
            />
            )}

            <hr className="my-8 border-zinc-800" />

            <MarkComplete completed={lesson.completed} />

      <LessonNavigation
        courseId={id}
        previousLesson={previousLesson}
        nextLesson={nextLesson}
      />
    </main>
  );
}