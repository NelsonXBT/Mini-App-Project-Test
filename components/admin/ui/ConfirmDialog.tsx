"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
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
 * Whether we are running on the client, expressed as a store read rather than
 * mount state.
 *
 * A portal needs document.body, which does not exist during the server render.
 * The usual `useState(false)` + `useEffect(setMounted)` pairing works but
 * schedules an extra render on every mount; reading a constant store returns
 * false on the server and true on the client with no state transition at all.
 */
const subscribeToNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * Every destructive admin action routes through this. Closing is always
 * available (Escape, backdrop, cancel) so the safe path is the easy one.
 *
 * Rendered into a portal on document.body rather than in place. `position:
 * fixed` resolves against the viewport only while no ancestor establishes a
 * containing block — but a transform, filter, or `will-change` on any parent
 * makes *that* element the reference instead. Every admin page wraps its
 * content in `.animate-rise-in`, whose keyframes carry a transform, so an
 * in-place dialog centres on the page wrapper and drifts off-screen when the
 * page is taller than the window. The portal puts the dialog outside that
 * subtree, where `inset-0` means the viewport again.
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
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    onClient,
    onServer
  );

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

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      /*
       * Centred via grid rather than flex so `place-items-center` also
       * constrains the card's height: a long description on a short window
       * shrinks the card and scrolls its body, instead of overflowing equally
       * in both directions and pushing the buttons past the top edge.
       */
      className="fixed inset-0 z-[100] grid max-h-[100dvh] place-items-center overflow-y-auto p-5"
    >
      {/* Backdrop */}
      <div
        onClick={busy ? undefined : onCancel}
        className="animate-fade-in fixed inset-0 bg-black/25 backdrop-blur-[2px]"
      />

      <div
        className="
          animate-rise-in
          relative
          my-auto
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
              <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--text-muted)]">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={busy}
            className={
              destructive ? "bg-[var(--danger)] hover:bg-[var(--danger)]/90" : ""
            }
          >
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
