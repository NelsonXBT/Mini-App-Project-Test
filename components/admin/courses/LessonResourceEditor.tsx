"use client";

import { Paperclip } from "lucide-react";

import LinkListEditor, { type LinkRow } from "./LinkListEditor";
import {
  createResource,
  updateResource,
  deleteResource,
  reorderResources,
  type ResourceInput,
} from "@/app/actions/admin/resources";

/**
 * Resources are optional. When a lesson has none, the student app shows no
 * resources section at all rather than an empty placeholder.
 */
export default function LessonResourceEditor({
  lessonId,
  resources,
}: {
  lessonId: string;
  resources: LinkRow[];
}) {
  return (
    <LinkListEditor
      items={resources}
      heading="Resources"
      addLabel="Add Resource"
      emptyIcon={Paperclip}
      emptyTitle="No lesson resources"
      emptyDescription="Optional. Students see nothing here unless you add one."
      confirmTitle="Delete resource?"
      onCreate={(input: ResourceInput) =>
        createResource(lessonId, input)
      }
      onUpdate={(id, input) => updateResource(id, input)}
      onDelete={(id) => deleteResource(id)}
      onReorder={(ids) => reorderResources(lessonId, ids)}
    />
  );
}
