"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Loader2,
  MessageSquare,
  Play,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui";
import { ConfirmDialog, EmptyState } from "@/components/admin/ui";
import {
  resumeBroadcastAction,
  retryFailedAction,
} from "@/app/actions/admin/messages";
import type { BroadcastHistoryRow } from "@/lib/db/admin/messages";

/**
 * Sent-message history, and the only place an interrupted broadcast can be
 * restarted.
 *
 * Neither control here can re-send a completed broadcast. Resume drains rows
 * that are still PENDING — never SENT — and Retry re-queues only failures the
 * transport marked worth another attempt. A recipient who already received the
 * message is unreachable from this screen by construction, not by convention.
 *
 * Nothing here touches enrollment or course access: a failed delivery is a
 * delivery fact and nothing more.
 */

const audienceLabels: Record<string, string> = {
  ALL_ACTIVE_STUDENTS: "All active students",
  COURSE_ACTIVE_STUDENTS: "Course",
  SPECIFIC_STUDENT: "One student",
  DESTINATION: "Channel / group",
};

const statusStyles: Record<string, string> = {
  SENT: "bg-[var(--success)]/10 text-[var(--success)]",
  PARTIALLY_SENT: "bg-[var(--warning)]/10 text-[var(--warning)]",
  FAILED: "bg-[var(--danger)]/10 text-[var(--danger)]",
  SENDING: "bg-[var(--primary-soft)] text-[var(--primary-text)]",
  DRAFT: "bg-[var(--surface-secondary)] text-[var(--text-muted)]",
};

function audienceSummary(item: BroadcastHistoryRow) {
  if (item.audience === "COURSE_ACTIVE_STUDENTS") {
    return item.courseTitle ?? "Course removed";
  }

  if (item.audience === "SPECIFIC_STUDENT") {
    return item.targetStudentName ?? "Student removed";
  }

  if (item.audience === "DESTINATION") {
    return item.destinationName ?? "Destination removed";
  }

  return audienceLabels[item.audience] ?? item.audience;
}

/** What the admin is being asked to confirm, and which action carries it out. */
type PendingAction = {
  item: BroadcastHistoryRow;
  kind: "resume" | "retry";
};

export default function MessageHistory({
  items,
}: {
  items: BroadcastHistoryRow[];
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<PendingAction | null>(null);

  /*
   * Keyed by message id so a result stays attached to the row it belongs to.
   * A single shared banner would attribute the outcome of one broadcast to
   * whichever row the admin happened to open next.
   */
  const [feedback, setFeedback] = useState<
    Record<string, { tone: "ok" | "error"; text: string }>
  >({});

  /** The id currently being drained — used to disable only that row's control. */
  const [working, setWorking] = useState<string | null>(null);

  function run(action: PendingAction) {
    const { item, kind } = action;

    setConfirming(null);
    setWorking(item.id);

    setFeedback((current) => {
      const next = { ...current };
      delete next[item.id];
      return next;
    });

    startTransition(async () => {
      const result =
        kind === "resume"
          ? await resumeBroadcastAction(item.id)
          : await retryFailedAction(item.id);

      setWorking(null);

      if (!result.ok) {
        setFeedback((current) => ({
          ...current,
          [item.id]: { tone: "error", text: result.error },
        }));
      } else {
        /*
         * A non-zero pending count is not a failure — the send budget stops a
         * pass well short of the platform timeout, so a large audience drains
         * over several presses. Saying so explicitly stops the admin reading a
         * partial pass as a stall.
         */
        setFeedback((current) => ({
          ...current,
          [item.id]: {
            tone: "ok",
            text:
              result.pending > 0
                ? `${result.sent} delivered so far — ${result.pending} still queued. Press Resume again to continue.`
                : `Finished: ${result.sent} delivered${
                    result.failed > 0 ? `, ${result.failed} failed` : ""
                  }.`,
          },
        }));
      }

      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages sent yet"
        description="Compose a message and it will appear here with its delivery results."
      />
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {items.map((item) => {
          const open = expanded === item.id;
          const note = feedback[item.id];
          const isWorking = working === item.id;

          return (
            <li
              key={item.id}
              className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)]"
            >
              <button
                onClick={() => setExpanded(open ? null : item.id)}
                className="flex w-full items-start gap-3 p-3.5 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-semibold tracking-tight text-[var(--text)]">
                      {item.title || item.body?.slice(0, 60) || "Media message"}
                    </p>

                    <span
                      className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        statusStyles[item.status] ??
                        "bg-[var(--surface-secondary)] text-[var(--text-muted)]"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>

                    {/* An interrupted broadcast is the one thing in this list
                        that needs acting on, so it is called out on the
                        collapsed row rather than hidden behind the toggle. */}
                    {item.pendingCount > 0 && (
                      <span className="rounded-[var(--radius-pill)] bg-[var(--warning)]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--warning)]">
                        {item.pendingCount} remaining
                      </span>
                    )}

                    {item.isLocked && (
                      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--text-subtle)]">
                        <Loader2
                          className="h-3 w-3 animate-spin"
                          strokeWidth={2.1}
                        />
                        Sending now
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[12.5px] text-[var(--text-subtle)]">
                    {audienceSummary(item)}
                    {" · "}
                    {item.sentCount} sent
                    {item.failedCount > 0 && ` · ${item.failedCount} failed`}
                    {item.skippedCount > 0 && ` · ${item.skippedCount} skipped`}
                    {" · "}
                    {new Date(item.createdAt).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[var(--text-subtle)] transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.9}
                />
              </button>

              {/* Shown whether or not the row is expanded: the outcome of a
                  press must not vanish because the admin collapsed the row. */}
              {note && (
                <p
                  className={`border-t border-[var(--border)] px-3.5 py-2 text-[12.5px] ${
                    note.tone === "error"
                      ? "text-[var(--danger)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {note.text}
                </p>
              )}

              {(item.canResume || item.canRetry || item.isLocked) && (
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] px-3.5 py-2.5">
                  {item.canResume && (
                    <Button
                      variant="secondary"
                      onClick={() => setConfirming({ item, kind: "resume" })}
                      disabled={busy}
                    >
                      {isWorking ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          strokeWidth={2.1}
                        />
                      ) : (
                        <Play className="h-4 w-4" strokeWidth={2.1} />
                      )}
                      {isWorking ? "Sending…" : "Resume sending"}
                    </Button>
                  )}

                  {item.canRetry && (
                    <Button
                      variant="secondary"
                      onClick={() => setConfirming({ item, kind: "retry" })}
                      disabled={busy}
                    >
                      {isWorking ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          strokeWidth={2.1}
                        />
                      ) : (
                        <RotateCcw className="h-4 w-4" strokeWidth={2.1} />
                      )}
                      Retry {item.retryableCount} failed
                    </Button>
                  )}

                  <p className="text-[12px] text-[var(--text-subtle)]">
                    {item.isLocked
                      ? "A send is in progress. Controls return when it pauses or finishes."
                      : item.canResume
                        ? `${item.pendingCount} recipient${
                            item.pendingCount === 1 ? "" : "s"
                          } not yet attempted. Already-delivered recipients are skipped.`
                        : "Only temporary failures are retried — blocked or unreachable chats are left alone."}
                  </p>
                </div>
              )}

              {open && (
                <div className="space-y-3 border-t border-[var(--border)] p-3.5">
                  {item.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="max-h-48 rounded-[var(--radius-control)] border border-[var(--border)] object-cover"
                    />
                  )}

                  {item.body && (
                    <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-[var(--text-muted)]">
                      {item.body}
                    </p>
                  )}

                  {item.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.buttons.map((button, index) => (
                        <span
                          key={index}
                          className="rounded-[var(--radius-control)] border border-[var(--border)] px-2.5 py-1 text-[12.5px] text-[var(--text-muted)]"
                        >
                          {button.text}
                        </span>
                      ))}
                    </div>
                  )}

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px] sm:grid-cols-5">
                    {[
                      ["Recipients", item.recipientCount],
                      ["Sent", item.sentCount],
                      ["Failed", item.failedCount],
                      ["Skipped", item.skippedCount],
                      ["Remaining", item.pendingCount],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <dt className="text-[var(--text-subtle)]">{label}</dt>
                        <dd className="font-semibold text-[var(--text)]">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {item.actorName && (
                    <p className="text-[12.5px] text-[var(--text-subtle)]">
                      Sent by {item.actorName}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Confirmed rather than fired on click: this puts real messages in real
          inboxes, and the count involved is worth reading before committing. */}
      <ConfirmDialog
        open={Boolean(confirming)}
        busy={busy}
        destructive={false}
        title={
          confirming?.kind === "retry"
            ? "Retry failed recipients?"
            : "Resume sending?"
        }
        description={
          confirming?.kind === "retry"
            ? `${confirming.item.retryableCount} recipient${
                confirming.item.retryableCount === 1 ? "" : "s"
              } failed for a temporary reason and will be attempted again. Recipients who already received this message are not contacted again.`
            : confirming
              ? `${confirming.item.pendingCount} recipient${
                  confirming.item.pendingCount === 1 ? "" : "s"
                } have not been attempted yet. The ${
                  confirming.item.sentCount
                } already delivered are skipped, so nobody receives this twice.`
              : undefined
        }
        confirmLabel={confirming?.kind === "retry" ? "Retry" : "Resume"}
        onConfirm={() => confirming && run(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
