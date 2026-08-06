"use client";

import { FolderDown } from "lucide-react";

import LinkListEditor, { type LinkRow } from "./LinkListEditor";
import {
  createCourseFile,
  updateCourseFile,
  deleteCourseFile,
  reorderCourseFiles,
  type ResourceInput,
} from "@/app/actions/admin/resources";

/**
 * Course-wide downloads (prompt libraries, asset packs, workbooks) — distinct
 * from per-lesson resources. When a course has none, the student app hides the
 * Files tab entirely.
 */
export default function CourseFilesEditor({
  courseId,
  files,
}: {
  courseId: string;
  files: LinkRow[];
}) {
  return (
    <LinkListEditor
      items={files}
      heading="Course Files"
      addLabel="Add Course File"
      emptyIcon={FolderDown}
      emptyTitle="No files"
      emptyDescription="Course-wide downloads. The Files tab stays hidden until you add one."
      confirmTitle="Delete file?"
      onCreate={(input: ResourceInput) =>
        createCourseFile(courseId, input)
      }
      onUpdate={(id, input) => updateCourseFile(id, input)}
      onDelete={(id) => deleteCourseFile(id)}
      onReorder={(ids) => reorderCourseFiles(courseId, ids)}
    />
  );
}
