"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  Check,
  X,
  Pencil,
  FolderTree,
} from "lucide-react";

import { Button } from "@/components/ui";
import {
  ConfirmDialog,
  EmptyState,
  ReorderList,
  inputClasses,
} from "@/components/admin/ui";
import {
  createModule,
  renameModule,
  deleteModule,
  reorderModules,
} from "@/app/actions/admin/modules";
import LessonEditor from "./LessonEditor";

type Lesson = {
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

type ModuleRow = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export default function ModuleEditor({
  courseId,
  modules,
}: {
  courseId: string;
  modules: ModuleRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<ModuleRow | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(
    modules[0]?.id ?? null
  );

  const [error, setError] = useState<string | null>(null);

  function onAdd() {
    const title = newTitle.trim();
    if (!title) return;

    startTransition(async () => {
      const result = await createModule(courseId, title);

      if (result.ok) {
        setNewTitle("");
        setAdding(false);
        if (result.id) setExpandedId(result.id);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function onRename(moduleId: string) {
    const title = renameValue.trim();
    if (!title) return;

    startTransition(async () => {
      const result = await renameModule(moduleId, title);

      if (result.ok) {
        setRenamingId(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function onDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteModule(deleteTarget.id);

      if (result.ok) {
        setDeleteTarget(null);
        router.refresh();
      } else {
        setError(result.error);
        setDeleteTarget(null);
      }
    });
  }

  function onReorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderModules(courseId, orderedIds);

      if (!result.ok) {
        setError(result.error);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Modules
        </h2>

        {!adding && (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" strokeWidth={2.1} />
            Add Module
          </Button>
        )}
      </div>

      {adding && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newTitle}
            placeholder="Module title"
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd();
              if (e.key === "Escape") {
                setAdding(false);
                setNewTitle("");
              }
            }}
            className={inputClasses}
          />

          <Button onClick={onAdd} disabled={pending}>
            Add
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setAdding(false);
              setNewTitle("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {error && (
        <p className="text-[13px] text-[var(--danger)]">{error}</p>
      )}

      {modules.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No modules yet"
          description="Modules group your lessons. Add one to begin."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" strokeWidth={2.1} />
              Add Module
            </Button>
          }
        />
      ) : (
        <ReorderList
          items={modules}
          onReorder={onReorder}
          renderItem={(module) => (
            <div>
              <div className="flex items-center gap-2">
                {renamingId === module.id ? (
                  <>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onRename(module.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className={inputClasses}
                    />

                    <button
                      onClick={() => onRename(module.id)}
                      aria-label="Save name"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--success)] transition-colors hover:bg-[var(--success)]/10"
                    >
                      <Check className="h-4 w-4" strokeWidth={2.1} />
                    </button>

                    <button
                      onClick={() => setRenamingId(null)}
                      aria-label="Cancel rename"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-secondary)]"
                    >
                      <X className="h-4 w-4" strokeWidth={2.1} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === module.id ? null : module.id
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-[14px] font-medium tracking-tight text-[var(--text)]">
                        {module.title}
                      </span>

                      <span className="block text-[11px] text-[var(--text-subtle)]">
                        {module.lessons.length} lesson
                        {module.lessons.length === 1 ? "" : "s"}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setRenamingId(module.id);
                        setRenameValue(module.title);
                      }}
                      aria-label={`Rename ${module.title}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.9} />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(module)}
                      aria-label={`Delete ${module.title}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                    </button>
                  </>
                )}
              </div>

              {expandedId === module.id && (
                <div className="mt-3 border-t border-[var(--border)] pt-3">
                  <LessonEditor
                    moduleId={module.id}
                    lessons={module.lessons}
                  />
                </div>
              )}
            </div>
          )}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        busy={pending}
        title="Delete module?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" and its ${deleteTarget.lessons.length} lesson${deleteTarget.lessons.length === 1 ? "" : "s"} will be permanently deleted.`
            : undefined
        }
        confirmLabel="Delete module"
        onConfirm={onDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
