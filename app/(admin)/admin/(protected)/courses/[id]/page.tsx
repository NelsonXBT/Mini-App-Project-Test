import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import CourseStatistics from "@/components/admin/courses/CourseStatistics";
import CourseDetailsForm from "@/components/admin/courses/CourseDetailsForm";
import ModuleEditor from "@/components/admin/courses/ModuleEditor";
import CourseFilesEditor from "@/components/admin/courses/CourseFilesEditor";
import {
  getAdminCourse,
  getCourseStatistics,
} from "@/lib/db/admin/courses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Edit course",
};

export default async function AdminCourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [course, statistics] = await Promise.all([
    getAdminCourse(id),
    getCourseStatistics(id),
  ]);

  if (!course || !statistics) {
    notFound();
  }

  return (
    <div className="animate-rise-in space-y-5">
      <Link
        href="/admin/courses"
        className="
          inline-flex
          items-center
          gap-1
          text-[13px]
          font-medium
          text-[var(--text-muted)]
          transition-colors
          duration-200
          hover:text-[var(--text)]
        "
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
        Courses
      </Link>

      <CourseStatistics
        title={course.title}
        studentCount={statistics.studentCount}
        lessonCount={statistics.lessonCount}
        moduleCount={statistics.moduleCount}
        manualDuration={statistics.manualDuration}
        averageCompletion={statistics.averageCompletion}
        isPublished={statistics.isPublished}
      />

      <section
        className="
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          shadow-[var(--shadow-card)]
        "
      >
        <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Course details
        </h2>

        <CourseDetailsForm
          course={{
            id: course.id,
            title: course.title,
            slug: course.slug,
            shortDescription: course.shortDescription,
            description: course.description,
            thumbnail: course.thumbnail,
            instructor: course.instructor,
            manualDuration: course.manualDuration,
            difficulty: course.difficulty,
            telegramChatId: course.telegramChatId,
            telegramUsername: course.telegramUsername,
            telegramInviteLink: course.telegramInviteLink,
            isPublished: course.isPublished,
          }}
        />
      </section>

      <section
        className="
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          shadow-[var(--shadow-card)]
        "
      >
        <ModuleEditor
          courseId={course.id}
          modules={course.modules.map((module) => ({
            id: module.id,
            title: module.title,
            lessons: module.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              provider: lesson.provider,
              videoId: lesson.videoId,
              duration: lesson.duration,
              isPublished: lesson.isPublished,
              isPreview: lesson.isPreview,
              resources: lesson.resources.map((resource) => ({
                id: resource.id,
                title: resource.title,
                url: resource.url,
                type: resource.type,
              })),
            })),
          }))}
        />
      </section>

      <section
        className="
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          shadow-[var(--shadow-card)]
        "
      >
        <CourseFilesEditor
          courseId={course.id}
          files={course.files.map((file) => ({
            id: file.id,
            title: file.title,
            url: file.url,
            type: file.type,
          }))}
        />
      </section>
    </div>
  );
}
