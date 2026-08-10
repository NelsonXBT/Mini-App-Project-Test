"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Radio, Trash2, Wifi } from "lucide-react";

import { Button } from "@/components/ui";
import {
  ConfirmDialog,
  EmptyState,
  FormField,
  Select,
  Toggle,
  inputClasses,
} from "@/components/admin/ui";
import {
  createDestination,
  deleteDestination,
  testDestination,
  updateDestination,
  type DestinationInput,
} from "@/app/actions/admin/destinations";

/**
 * Authorised broadcast destinations.
 *
 * These are messaging targets only. They are entirely separate from the
 * Telegram chat that gates a course (Course.telegramChatId): editing or
 * removing a destination here cannot change any student's course access.
 */

export type DestinationRow = {
  id: string;
  name: string;
  chatId: string;
  type: string;
  isActive: boolean;
};

const typeOptions = [
  { value: "CHANNEL", label: "Channel" },
  { value: "GROUP", label: "Group" },
];

const emptyForm: DestinationInput = {
  name: "",
  chatId: "",
  type: "CHANNEL",
  isActive: true,
};

export default function DestinationManager({
  items,
}: {
  items: DestinationRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState<DestinationInput | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DestinationRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tested, setTested] = useState<Record<string, string>>({});

  function submit() {
    if (!form) return;

    setError(null);

    startTransition(async () => {
      const result = editingId
        ? await updateDestination(editingId, form)
        : await createDestination(form);

      if (result.ok) {
        setForm(null);
        setEditingId(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function test(id: string) {
    setTested((current) => ({ ...current, [id]: "Checking…" }));

    startTransition(async () => {
      const result = await testDestination(id);

      setTested((current) => ({
        ...current,
        [id]: result.ok
          ? `Reachable${result.title ? `: ${result.title}` : ""}`
          : result.error,
      }));
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteDestination(deleteTarget.id);

      if (!result.ok) setError(result.error);

      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {form ? (
        <div className="space-y-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Name" required>
              <input
                autoFocus
                value={form.name}
                placeholder="Nadi Academy Channel"
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className={inputClasses}
              />
            </FormField>

            <FormField label="Type">
              <Select
                value={form.type}
                onChange={(value) => setForm({ ...form, type: value })}
                options={typeOptions}
              />
            </FormField>
          </div>

          <FormField
            label="Chat ID"
            required
            hint="Numeric, e.g. -1001234567890. The bot must be an admin of this chat."
          >
            <input
              value={form.chatId}
              placeholder="-1001234567890"
              onChange={(e) => setForm({ ...form, chatId: e.target.value })}
              className={inputClasses}
            />
          </FormField>

          <Toggle
            checked={form.isActive}
            onChange={(value) => setForm({ ...form, isActive: value })}
            label="Active"
            description="Inactive destinations cannot be selected in the composer."
          />

          {error && (
            <p className="text-[13px] text-[var(--danger)]">{error}</p>
          )}

          <div className="flex gap-2">
            <Button onClick={submit} disabled={pending}>
              {pending ? "Saving…" : editingId ? "Save" : "Add destination"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                setForm(null);
                setEditingId(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setForm(emptyForm)}>
          <Plus className="h-4 w-4" strokeWidth={2.1} />
          Add destination
        </Button>
      )}

      {items.length === 0 && !form ? (
        <EmptyState
          icon={Radio}
          title="No destinations configured"
          description="Add the numeric chat ID of a channel or group the bot administers."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)] p-3.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-semibold tracking-tight text-[var(--text)]">
                    {item.name}
                  </p>

                  <span className="rounded-[var(--radius-pill)] bg-[var(--surface-secondary)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {item.type}
                  </span>

                  {!item.isActive && (
                    <span className="text-[12px] text-[var(--text-subtle)]">
                      Inactive
                    </span>
                  )}
                </div>

                <p className="mt-0.5 font-mono text-[12.5px] text-[var(--text-subtle)]">
                  {item.chatId}
                </p>

                {tested[item.id] && (
                  <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">
                    {tested[item.id]}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => test(item.id)}
                  disabled={pending}
                  aria-label={`Test ${item.name}`}
                  title="Check the bot can post here"
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text)] disabled:opacity-50"
                >
                  <Wifi className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>

                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setForm({
                      name: item.name,
                      chatId: item.chatId,
                      type: item.type,
                      isActive: item.isActive,
                    });
                  }}
                  className="px-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                >
                  Edit
                </button>

                <button
                  onClick={() => setDeleteTarget(item)}
                  aria-label={`Delete ${item.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-muted)] transition-colors hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        busy={pending}
        title="Remove destination?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will no longer be selectable. This does not affect course access for any student.`
            : undefined
        }
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
