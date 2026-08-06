
import LearningCard from "@/components/course/LearningCard";

import { getHomeLearningCard } from "@/lib/db/home";

export default async function HomeLearningCard() {
  const learningCard =
    await getHomeLearningCard();

  if (!learningCard) {
    return null;
  }

  const {
    mode,
    course,
    lesson,
    totalLessons,
    completedLessons,
    progress,
  } = learningCard;

  

  switch (mode) {
    case "start":
  return (
    <section className="mt-3">
      <LearningCard
        thumbnail={
          course.thumbnail ??
          "/thumbnails/coursethumbnail.png"
        }
        title={course.title}
        lessonText={`${totalLessons} Lessons`}
        badge="Ready"
        buttonText="Start Learning"
        buttonHref={`/courses/${course.slug}`}
      />
    </section>
  );
    case "recommend":
  return (
    <section className="mt-3">
      <LearningCard
        thumbnail={
          course.thumbnail ??
          "/thumbnails/coursethumbnail.png"
        }
        title={course.title}
        lessonText={`${totalLessons} Lessons`}
        badge="New"
        buttonText="Open Course"
        buttonHref={`/courses/${course.slug}`}
      />
    </section>
  );

    
   case "continue":
default:
  return (
    <section className="mt-3">
      <LearningCard
        thumbnail={
          course.thumbnail ??
          "/thumbnails/coursethumbnail.png"
        }
        title={course.title}
        lessonText={`Lesson ${completedLessons + 1} of ${totalLessons}`}
        badge={`${progress}%`}
        badgeTone="accent"
        progress={progress}
        buttonText="Continue Lesson"
        buttonHref={`/courses/${course.slug}?lesson=${lesson.id}`}
      />
    </section>
  ); }
}