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
   * Only the recommendation gets a heading.
   *
   * "Continue Learning" and "Start Learning" said exactly what the card's own
   * button already said, one line below it — the label was pure repetition and
   * cost a row of vertical space on a phone. "Recommended For You" is the one
   * heading carrying information the card cannot: that this course was chosen
   * for the student rather than already being theirs.
   */
  const isRecommendation = !isContinue && mode !== "start";

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
      {isRecommendation && (
        <PageTitle
          as="h2"
          className="text-[var(--primary-text)]"
        >
          Recommended For You
        </PageTitle>
      )}

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
