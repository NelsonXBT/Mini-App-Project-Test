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
    lessonNumber,
    progress,
  } = learningCard;

  const isContinue = mode === "continue";

  /*
   * "start" is a course the student has access to but has never opened, so
   * there is nothing to pick back up — that heading belongs to "continue",
   * the only branch with a resume point.
   */
  const heading = isContinue
    ? "Continue Learning"
    : mode === "start"
      ? "Start Learning"
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

  /*
   * The resumed lesson's real position in the course, not completedLessons + 1
   * — those only agree when the student watches strictly in order. Every mode
   * now carries a lessonNumber, so this needs no union narrowing.
   */
  const lessonText = isContinue
    ? `Lesson ${lessonNumber} of ${totalLessons}`
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
