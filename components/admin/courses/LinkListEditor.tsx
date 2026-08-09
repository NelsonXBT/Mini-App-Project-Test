"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui";
import {
  ConfirmDialog,
  EmptyState,
  ReorderList,
  Select,
  inputClasses,
} from "@/components/admin/ui";
import type { ResourceInput } from "@/app/actions/admin/resources";
import type { ActionResult } from "@/app/actions/admin/courses";

export type LinkRow = {
  id: string;
  title: string;
  url: string;
  type: string;
};

/*
 * Resource types come from the shared ResourceType enum, which both lesson
 * resources and course files use.
 */
const typeOptions = [
  { value: "pdf", label: "PDF" },
  { value: "zip", label: "ZIP" },
  { value: "link", label: "Link" },
  { value: "drive", label: "Google Drive" },
  { value: "google_doc", label: "Google Doc" },
  { value: "notion", label: "Notion" },
  { value: "github", label: "GitHub" },
  { value: "website", label: "Website" },
  { value: "download", label: "Download" },
  { value: "other", label: "Other" },
];

type LinkListEditorProps = {
  items: LinkRow[];
  heading: string;
  addLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: LucideIcon;
  confirmTitle: string;
  onCreate: (input: ResourceInput) => Promise<ActionResult>;
  onUpdate: (
    id: string,
    input: ResourceInput
  ) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
  onReorder: (orderedIds: string[]) => Promise<ActionResult>;
};

/**
 * Lesson resources and course files are the same shape — a titled, typed,
 * sortable link — so both use this component with different actions passed in
 * rather than duplicating the list, form and confirm plumbing twice.
 */
export default function LinkListEditor({
  items,
  heading,
  addLabel,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  confirmTitle,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: LinkListEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LinkRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(input: ResourceInput, id?: string) {
    setError(null);

    startTransition(async () => {
      const result = id
        ? await onUpdate(id, input)
        : await onCreate(input);

      if (result.ok) {
        setCreating(false);
        setEditingId(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await onDelete(deleteTarget.id);

      if (result.ok) {
        setDeleteTarget(null);
        router.refresh();
      } else {
        setError(result.error);
        setDeleteTarget(null);
      }
    });
  }

  function reorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await onReorder(orderedIds);

      if (!result.ok) {
        setError(result.error);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
          {heading}
        </h3>

        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--primary-text)] transition-opacity duration-200 hover:opacity-70"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.1} />
            {addLabel}
          </button>
        )}
      </div>

      {creating && (
        <LinkForm
          pending={pending}
          onSubmit={(input) => submit(input)}
          onCancel={() => setCreating(false)}
        />
      )}

      {error && (
        <p className="text-[12px] text-[var(--danger)]">{error}</p>
      )}

      {items.length === 0 && !creating ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button variant="secondary" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" strokeWidth={2.1} />
              {addLabel}
            </Button>
          }
        />
      ) : (
        <ReorderList
          items={items}
          onReorder={reorder}
          renderItem={(item) =>
            editingId === item.id ? (
              <LinkForm
                initial={item}
                pending={pending}
                onSubmit={(input) => submit(input, item.id)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium tracking-tight text-[var(--text)]">
                    {item.title}
                  </p>

                  <p className="truncate text-[11px] text-[var(--text-subtle)]">
                    {item.type.replace("_", " ")} · {item.url}
                  </p>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${item.title}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.9} />
                </a>

                <button
                  onClick={() => setEditingId(item.id)}
                  aria-label={`Edit ${item.title}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>

                <button
                  onClick={() => setDeleteTarget(item)}
                  aria-label={`Delete ${item.title}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>
              </div>
            )
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        busy={pending}
        title={confirmTitle}
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed.`
            : undefined
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function LinkForm({
  initial,
  pending,
  onSubmit,
  onCancel,
}: {
  initial?: LinkRow;
  pending: boolean;
  onSubmit: (input: ResourceInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ResourceInput>({
    title: initial?.title ?? "",
    url: initial?.url ?? "",
    type: initial?.type ?? "link",
  });

  return (
    <div className="space-y-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)] p-3">
      <input
        autoFocus
        value={form.title}
        placeholder="Title"
        onChange={(e) =>
          setForm((c) => ({ ...c, title: e.target.value }))
        }
        className={inputClasses}
      />

      <input
        value={form.url}
        placeholder="https://…"
        onChange={(e) =>
          setForm((c) => ({ ...c, url: e.target.value }))
        }
        className={inputClasses}
      />

      <Select
        value={form.type}
        onChange={(value) =>
          setForm((c) => ({ ...c, type: value }))
        }
        options={typeOptions}
      />

      <div className="flex gap-2">
        <Button
          onClick={() => onSubmit(form)}
          disabled={pending}
        >
          {pending ? "Saving…" : initial ? "Save" : "Add"}
        </Button>

        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
