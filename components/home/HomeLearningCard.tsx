import LearningCard from "@/components/course/LearningCard";
import { PageTitle } from "@/components/ui";

import { getHomeLearningCard } from "@/lib/db/home";

const FALLBACK_THUMBNAIL =
  "/thumbnails/coursethumbnail.png";

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

  const isContinue = mode === "continue";

  const heading = isContinue
    ? "Continue Learning"
    : mode === "start"
      ? "Pick Up Where You Left Off"
      : "Recommended For You";

  const badge = isContinue
    ? `${progress}%`
    : mode === "start"
      ? "Ready"
      : "New";

  const buttonText = isContinue
    ? "Continue Lesson"
    : mode === "start"
      ? "Start Learning"
      : "Open Course";

  const lessonText = isContinue
    ? `Lesson ${completedLessons + 1} of ${totalLessons}`
    : `${totalLessons} Lessons`;

  /*
   * Only the "continue" card deep-links to a lesson — the other two modes have
   * no lesson row to resume, so they open the course and let it pick the first.
   */
  const buttonHref =
    isContinue && lesson
      ? `/courses/${course.slug}?lesson=${lesson.id}`
      : `/courses/${course.slug}`;

  return (
    <section>
      <PageTitle as="h2">{heading}</PageTitle>

      <LearningCard
        thumbnail={
          course.thumbnail ?? FALLBACK_THUMBNAIL
        }
        title={course.title}
        lessonText={lessonText}
        badge={badge}
        badgeTone={isContinue ? "accent" : undefined}
        progress={isContinue ? progress : undefined}
        buttonText={buttonText}
        buttonHref={buttonHref}
      />
    </section>
  );
}
