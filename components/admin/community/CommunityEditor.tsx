"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, ExternalLink, Users } from "lucide-react";

import { Button } from "@/components/ui";
import {
  ConfirmDialog,
  EmptyState,
  FormField,
  ReorderList,
  Select,
  StatusBadge,
  Toggle,
  inputClasses,
} from "@/components/admin/ui";
import { COMMUNITY_ICON_OPTIONS } from "@/lib/constants/icon-keys";
import { communityIcon } from "@/lib/constants/icon-map";
import type { CommunityChannelInput } from "@/app/actions/admin/community";
import {
  createCommunityChannel,
  deleteCommunityChannel,
  reorderCommunityChannels,
  updateCommunityChannel,
} from "@/app/actions/admin/community";

export type CommunityRow = {
  id: string;
  title: string;
  description: string;
  icon: string;
  cta: string;
  url: string;
  isPublished: boolean;
};

const emptyForm: CommunityChannelInput = {
  title: "",
  description: "",
  icon: "community",
  cta: "Join",
  url: "",
  isPublished: true,
};

/**
 * The admin surface for the student community page. Mirrors LinkListEditor's
 * shape — actions passed to one list that owns create, edit, delete, reorder
 * and its own error state — but the rows here carry a description, an icon key
 * and a CTA label, which that component's ResourceInput has no room for.
 */
export default function CommunityEditor({ items }: { items: CommunityRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommunityRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(input: CommunityChannelInput, id?: string) {
    setError(null);

    startTransition(async () => {
      const result = id
        ? await updateCommunityChannel(id, input)
        : await createCommunityChannel(input);

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
      const result = await deleteCommunityChannel(deleteTarget.id);

      if (!result.ok) setError(result.error);

      setDeleteTarget(null);
      router.refresh();
    });
  }

  function reorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderCommunityChannels(orderedIds);

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
          Channels
        </h3>

        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--primary-text)] transition-opacity duration-200 hover:opacity-70"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.1} />
            Add channel
          </button>
        )}
      </div>

      {creating && (
        <ChannelForm
          pending={pending}
          onSubmit={(input) => submit(input)}
          onCancel={() => setCreating(false)}
        />
      )}

      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}

      {items.length === 0 && !creating ? (
        <EmptyState
          icon={Users}
          title="No channels yet"
          description="Add the groups and support links students should see on the community page."
          action={
            <Button variant="secondary" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" strokeWidth={2.1} />
              Add channel
            </Button>
          }
        />
      ) : (
        <ReorderList
          items={items}
          onReorder={reorder}
          renderItem={(item) =>
            editingId === item.id ? (
              <ChannelForm
                initial={item}
                pending={pending}
                onSubmit={(input) => submit(input, item.id)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <ChannelRow
                item={item}
                onEdit={() => setEditingId(item.id)}
                onDelete={() => setDeleteTarget(item)}
              />
            )
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        busy={pending}
        title="Delete channel?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed from the community page.`
            : undefined
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ChannelRow({
  item,
  onEdit,
  onDelete,
}: {
  item: CommunityRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  /* Same icon map the student card uses, so the row previews the real thing. */
  const { Glyph, tint, tile, ring } = communityIcon(item.icon);

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] ${tile} ${ring}`}
      >
        <Glyph className={`h-4 w-4 ${tint}`} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14px] font-medium tracking-tight text-[var(--text)]">
            {item.title}
          </p>

          {!item.isPublished && <StatusBadge published={false} />}
        </div>

        <p className="truncate text-[12px] text-[var(--text-subtle)]">
          {item.cta} · {item.url}
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
        onClick={onEdit}
        aria-label={`Edit ${item.title}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
      </button>

      <button
        onClick={onDelete}
        aria-label={`Delete ${item.title}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
      </button>
    </div>
  );
}

function ChannelForm({
  initial,
  pending,
  onSubmit,
  onCancel,
}: {
  initial?: CommunityRow;
  pending: boolean;
  onSubmit: (input: CommunityChannelInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CommunityChannelInput>({
    title: initial?.title ?? emptyForm.title,
    description: initial?.description ?? emptyForm.description,
    icon: initial?.icon ?? emptyForm.icon,
    cta: initial?.cta ?? emptyForm.cta,
    url: initial?.url ?? emptyForm.url,
    isPublished: initial?.isPublished ?? emptyForm.isPublished,
  });

  function set<K extends keyof CommunityChannelInput>(
    key: K,
    value: CommunityChannelInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)] p-3.5">
      <FormField label="Name" required>
        <input
          autoFocus
          value={form.title}
          placeholder="WhatsApp Group"
          onChange={(e) => set("title", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Description" required>
        <input
          value={form.description}
          placeholder="Chat with other students"
          onChange={(e) => set("description", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Link" required>
        <input
          value={form.url}
          placeholder="https://chat.whatsapp.com/…"
          onChange={(e) => set("url", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Icon">
          <Select
            value={form.icon}
            onChange={(value) => set("icon", value)}
            options={COMMUNITY_ICON_OPTIONS}
          />
        </FormField>

        <FormField label="Button label" hint="Shown on the card's chip.">
          <input
            value={form.cta}
            placeholder="Join"
            onChange={(e) => set("cta", e.target.value)}
            className={inputClasses}
          />
        </FormField>
      </div>

      <Toggle
        checked={form.isPublished}
        onChange={(checked) => set("isPublished", checked)}
        label="Visible to students"
        description="Turn off to keep the channel here without showing it in the app."
      />

      <div className="flex gap-2">
        <Button onClick={() => onSubmit(form)} disabled={pending}>
          {pending ? "Saving…" : initial ? "Save" : "Add"}
        </Button>

        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
