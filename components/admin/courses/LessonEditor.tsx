"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Copy,
  PlayCircle,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui";
import {
  ConfirmDialog,
  EmptyState,
  ReorderList,
} from "@/components/admin/ui";
import {
  deleteLesson,
  duplicateLesson,
  reorderLessons,
} from "@/app/actions/admin/lessons";
import LessonForm from "./LessonForm";
import LessonResourceEditor from "./LessonResourceEditor";

export type LessonRow = {
  id: string;
  title: string;
  description: string | null;
  provider: string;
  videoId: string;
  duration: number | null;
  isPublished: boolean;
  isPreview: boolean;
  resources: {
    id: string;
    title: string;
    url: string;
    type: string;
  }[];
};

export default function LessonEditor({
  moduleId,
  lessons,
}: {
  moduleId: string;
  lessons: LessonRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resourcesFor, setResourcesFor] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<LessonRow | null>(null);

  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteLesson(deleteTarget.id);

      if (result.ok) {
        setDeleteTarget(null);
        router.refresh();
      } else {
        setError(result.error);
        setDeleteTarget(null);
      }
    });
  }

  function onDuplicate(lessonId: string) {
    startTransition(async () => {
      const result = await duplicateLesson(lessonId);

      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function onReorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderLessons(moduleId, orderedIds);

      if (!result.ok) {
        setError(result.error);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
          Lessons
        </h3>

        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="
              inline-flex
              items-center
              gap-1.5
              text-[13px]
              font-medium
              text-[var(--primary-text)]
              transition-opacity
              duration-200
              hover:opacity-70
            "
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.1} />
            Add Lesson
          </button>
        )}
      </div>

      {creating && (
        <LessonForm
          moduleId={moduleId}
          onDone={() => {
            setCreating(false);
            router.refresh();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {error && (
        <p className="text-[13px] text-[var(--danger)]">{error}</p>
      )}

      {lessons.length === 0 && !creating ? (
        <EmptyState
          icon={PlayCircle}
          title="No lessons yet"
          description="Add the first lesson to this module."
        />
      ) : (
        <ReorderList
          items={lessons}
          onReorder={onReorder}
          renderItem={(lesson) => (
            <div>
              {editingId === lesson.id ? (
                <LessonForm
                  moduleId={moduleId}
                  lesson={lesson}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium tracking-tight text-[var(--text)]">
                        {lesson.title}
                      </p>

                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[var(--text-subtle)]">
                        <span>{lesson.provider}</span>

                        {lesson.duration != null && (
                          <span>
                            · {Math.ceil(lesson.duration / 60)} min
                          </span>
                        )}

                        {!lesson.isPublished && (
                          <span className="text-[var(--warning)]">
                            · Draft
                          </span>
                        )}

                        {lesson.isPreview && (
                          <span className="inline-flex items-center gap-1 text-[var(--primary-text)]">
                            · <Eye className="h-3 w-3" /> Preview
                          </span>
                        )}

                        {lesson.resources.length > 0 && (
                          <span>
                            · {lesson.resources.length} resource
                            {lesson.resources.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </div>

                    <IconAction
                      label={`Edit ${lesson.title}`}
                      onClick={() => setEditingId(lesson.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </IconAction>

                    <IconAction
                      label={`Duplicate ${lesson.title}`}
                      onClick={() => onDuplicate(lesson.id)}
                    >
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </IconAction>

                    <IconAction
                      label={`Delete ${lesson.title}`}
                      destructive
                      onClick={() => setDeleteTarget(lesson)}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </IconAction>
                  </div>

                  <button
                    onClick={() =>
                      setResourcesFor(
                        resourcesFor === lesson.id ? null : lesson.id
                      )
                    }
                    className="mt-1.5 text-[12px] font-medium text-[var(--primary-text)] transition-opacity hover:opacity-70"
                  >
                    {resourcesFor === lesson.id ? "Hide" : "Manage"}{" "}
                    resources
                  </button>

                  {resourcesFor === lesson.id && (
                    <div className="mt-2 border-t border-[var(--border)] pt-2">
                      <LessonResourceEditor
                        lessonId={lesson.id}
                        resources={lesson.resources}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        busy={pending}
        title="Delete lesson?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently deleted, along with its resources and any student progress for it.`
            : undefined
        }
        confirmLabel="Delete lesson"
        onConfirm={onDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function IconAction({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        flex
        h-7
        w-7
        shrink-0
        items-center
        justify-center
        rounded-[var(--radius-control)]
        text-[var(--text-muted)]
        transition-colors
        duration-200
        ${
          destructive
            ? "hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
            : "hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
        }
      `}
    >
      {children}
    </button>
  );
}
