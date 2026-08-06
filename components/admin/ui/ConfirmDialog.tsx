"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Every destructive admin action routes through this. Closing is always
 * available (Escape, backdrop, cancel) so the safe path is the easy one.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) {
        onCancel();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Stop the page behind the dialog from scrolling while it's open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
    >
      {/* Backdrop */}
      <div
        onClick={busy ? undefined : onCancel}
        className="animate-fade-in absolute inset-0 bg-black/25 backdrop-blur-[2px]"
      />

      <div
        className="
          animate-rise-in
          relative
          w-full
          max-w-sm
          rounded-[var(--radius)]
          border
          border-[var(--border)]
          bg-[var(--card)]
          p-5
          shadow-[var(--shadow-raised)]
        "
      >
        <div className="flex gap-3.5">
          {destructive && (
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-[var(--radius-control)]
                bg-[var(--danger)]/10
              "
            >
              <AlertTriangle
                className="h-[18px] w-[18px] text-[var(--danger)]"
                strokeWidth={1.9}
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-[15px] font-semibold tracking-tight text-[var(--text)]"
            >
              {title}
            </h2>

            {description && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={busy}
            className={
              destructive
                ? "bg-[var(--danger)] hover:bg-[var(--danger)]/90"
                : ""
            }
          >
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
