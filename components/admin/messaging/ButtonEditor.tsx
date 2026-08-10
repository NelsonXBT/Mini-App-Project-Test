"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui";
import { FormField, Select, inputClasses } from "@/components/admin/ui";
import {
  MINI_APP_URL,
  type BroadcastButton,
} from "@/lib/telegram/compose";

/**
 * The optional inline keyboard.
 *
 * Buttons are optional throughout: an empty list is a valid message and the
 * send path omits reply_markup entirely rather than sending an empty keyboard.
 */

const actionOptions = [
  { value: "mini_app", label: "Open Nadi Academy Mini App" },
  { value: "url", label: "Open URL" },
];

type ButtonEditorProps = {
  buttons: BroadcastButton[];
  onChange: (buttons: BroadcastButton[]) => void;
  disabled?: boolean;
};

export default function ButtonEditor({
  buttons,
  onChange,
  disabled,
}: ButtonEditorProps) {
  function add() {
    /*
     * Defaults to the Mini App action with its label pre-filled: it is the
     * common case, and the admin never has to know or type the deep link.
     */
    onChange([
      ...buttons,
      { text: "🎓 Access Nadi Academy", action: "mini_app" },
    ]);
  }

  function update(index: number, patch: Partial<BroadcastButton>) {
    onChange(
      buttons.map((button, i) =>
        i === index ? { ...button, ...patch } : button
      )
    );
  }

  function remove(index: number) {
    onChange(buttons.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {buttons.length === 0 ? (
        <p className="text-[13px] text-[var(--text-subtle)]">
          No buttons. The message will be sent without an inline keyboard.
        </p>
      ) : (
        <ul className="space-y-3">
          {buttons.map((button, index) => (
            <li
              key={index}
              className="space-y-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-secondary)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Button label">
                  <input
                    value={button.text}
                    placeholder="🎓 Access Nadi Academy"
                    disabled={disabled}
                    onChange={(e) => update(index, { text: e.target.value })}
                    className={inputClasses}
                  />
                </FormField>

                <FormField label="Action">
                  <Select
                    value={button.action}
                    disabled={disabled}
                    onChange={(value) =>
                      update(index, {
                        action: value as BroadcastButton["action"],
                        // Drop a stale URL when switching to the Mini App, so
                        // it cannot be stored against a button that ignores it.
                        url: value === "mini_app" ? undefined : button.url,
                      })
                    }
                    options={actionOptions}
                  />
                </FormField>
              </div>

              {button.action === "url" ? (
                <FormField
                  label="URL"
                  hint="Must be an https:// address."
                >
                  <input
                    value={button.url ?? ""}
                    placeholder="https://example.com"
                    disabled={disabled}
                    onChange={(e) => update(index, { url: e.target.value })}
                    className={inputClasses}
                  />
                </FormField>
              ) : (
                <p className="text-[13px] text-[var(--text-subtle)]">
                  Opens{" "}
                  <code className="text-[12px]">{MINI_APP_URL}</code>
                </p>
              )}

              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--danger)] transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {buttons.length < 6 && (
        <Button variant="secondary" onClick={add} disabled={disabled}>
          <Plus className="h-4 w-4" strokeWidth={2.1} />
          Add button
        </Button>
      )}
    </div>
  );
}
