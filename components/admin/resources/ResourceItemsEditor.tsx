"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, ExternalLink, FolderOpen } from "lucide-react";

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
import { RESOURCE_ICON_OPTIONS } from "@/lib/constants/icon-keys";
import { resourceIcon } from "@/lib/constants/icon-map";
import type { ResourceItemInput } from "@/app/actions/admin/resource-items";
import {
  createResourceItem,
  deleteResourceItem,
  reorderResourceItems,
  updateResourceItem,
} from "@/app/actions/admin/resource-items";

export type ResourceRow = {
  id: string;
  section: "packs" | "tools";
  title: string;
  description: string;
  icon: string;
  cta: string;
  url: string;
  fileCount: number | null;
  isAffiliate: boolean;
  isPublished: boolean;
};

type Section = "packs" | "tools";

/*
 * Defaults differ per section so a new row starts sensible: a pack is browsed
 * in-app and counts files, a tool is visited off-site and usually carries a
 * referral.
 */
const defaultsFor = (section: Section): ResourceItemInput => ({
  section,
  title: "",
  description: "",
  icon: section === "packs" ? "package" : "wrench",
  cta: section === "packs" ? "Browse" : "Visit",
  url: "",
  fileCount: null,
  isAffiliate: false,
  isPublished: true,
});

export default function ResourceItemsEditor({
  section,
  items,
}: {
  section: Section;
  items: ResourceRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPacks = section === "packs";
  const noun = isPacks ? "pack" : "tool";

  function submit(input: ResourceItemInput, id?: string) {
    setError(null);

    startTransition(async () => {
      const result = id
        ? await updateResourceItem(id, input)
        : await createResourceItem(input);

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
      const result = await deleteResourceItem(deleteTarget.id);

      if (!result.ok) setError(result.error);

      setDeleteTarget(null);
      router.refresh();
    });
  }

  function reorder(orderedIds: string[]) {
    startTransition(async () => {
      const result = await reorderResourceItems(orderedIds);

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
          {isPacks ? "Packs" : "Tools"}
        </h3>

        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--primary-text)] transition-opacity duration-200 hover:opacity-70"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.1} />
            Add {noun}
          </button>
        )}
      </div>

      {creating && (
        <ItemForm
          section={section}
          pending={pending}
          onSubmit={(input) => submit(input)}
          onCancel={() => setCreating(false)}
        />
      )}

      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}

      {items.length === 0 && !creating ? (
        <EmptyState
          icon={FolderOpen}
          title={`No ${isPacks ? "packs" : "tools"} yet`}
          description={
            isPacks
              ? "Packs stay hidden from students until at least one is published."
              : "Add the platforms and services you recommend."
          }
          action={
            <Button variant="secondary" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" strokeWidth={2.1} />
              Add {noun}
            </Button>
          }
        />
      ) : (
        <ReorderList
          items={items}
          onReorder={reorder}
          renderItem={(item) =>
            editingId === item.id ? (
              <ItemForm
                section={section}
                initial={item}
                pending={pending}
                onSubmit={(input) => submit(input, item.id)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <ItemRow
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
        title={`Delete ${noun}?`}
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed from the resources page.`
            : undefined
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: ResourceRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { Glyph, tint, tile, ring } = resourceIcon(item.icon);

  const meta =
    item.section === "packs"
      ? item.fileCount !== null
        ? `${item.fileCount} files`
        : "No file count"
      : item.isAffiliate
        ? "Affiliate"
        : "Standard link";

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
          {item.cta} · {meta}
          {item.url ? ` · ${item.url}` : " · No link"}
        </p>
      </div>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${item.title}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.9} />
        </a>
      )}

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

function ItemForm({
  section,
  initial,
  pending,
  onSubmit,
  onCancel,
}: {
  section: Section;
  initial?: ResourceRow;
  pending: boolean;
  onSubmit: (input: ResourceItemInput) => void;
  onCancel: () => void;
}) {
  const defaults = defaultsFor(section);

  const [form, setForm] = useState<ResourceItemInput>({
    section,
    title: initial?.title ?? defaults.title,
    description: initial?.description ?? defaults.description,
    icon: initial?.icon ?? defaults.icon,
    cta: initial?.cta ?? defaults.cta,
    url: initial?.url ?? defaults.url,
    fileCount: initial?.fileCount ?? defaults.fileCount,
    isAffiliate: initial?.isAffiliate ?? defaults.isAffiliate,
    isPublished: initial?.isPublished ?? defaults.isPublished,
  });

  function set<K extends keyof ResourceItemInput>(
    key: K,
    value: ResourceItemInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const isPacks = section === "packs";

  return (
    <div className="space-y-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)] p-3.5">
      <FormField label="Title" required>
        <input
          autoFocus
          value={form.title}
          placeholder={isPacks ? "Prompt Packs" : "TradingView"}
          onChange={(e) => set("title", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Description" required>
        <input
          value={form.description}
          placeholder={
            isPacks
              ? "High-quality prompts for AI filmmaking."
              : "Professional charting tools."
          }
          onChange={(e) => set("description", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Link">
        <input
          value={form.url}
          placeholder="https://…"
          onChange={(e) => set("url", e.target.value)}
          className={inputClasses}
        />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Icon">
          <Select
            value={form.icon}
            onChange={(value) => set("icon", value)}
            options={RESOURCE_ICON_OPTIONS}
          />
        </FormField>

        <FormField label="Button label" hint="Shown on the card's chip.">
          <input
            value={form.cta}
            placeholder={isPacks ? "Browse" : "Visit"}
            onChange={(e) => set("cta", e.target.value)}
            className={inputClasses}
          />
        </FormField>
      </div>

      {/*
       * Packs count files; tools disclose referrals. Only the field that
       * applies is shown, and the server clears the other on save so the two
       * can never both be set.
       */}
      {isPacks ? (
        <FormField
          label="File count"
          hint="Shown under the description. Leave empty to hide."
        >
          <input
            inputMode="numeric"
            value={form.fileCount ?? ""}
            placeholder="45"
            onChange={(e) => {
              const raw = e.target.value.trim();
              set("fileCount", raw === "" ? null : Number(raw));
            }}
            className={inputClasses}
          />
        </FormField>
      ) : (
        <Toggle
          checked={form.isAffiliate}
          onChange={(checked) => set("isAffiliate", checked)}
          label="Affiliate link"
          description="Shows an “Affiliate link” disclosure on the student card."
        />
      )}

      <Toggle
        checked={form.isPublished}
        onChange={(checked) => set("isPublished", checked)}
        label="Visible to students"
        description="Turn off to keep it here without showing it in the app."
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
