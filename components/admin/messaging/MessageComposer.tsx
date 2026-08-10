"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Users } from "lucide-react";

import { Button } from "@/components/ui";
import {
  ConfirmDialog,
  FormField,
  Select,
  inputClasses,
  textareaClasses,
} from "@/components/admin/ui";
import type { BroadcastButton } from "@/lib/telegram/compose";
import {
  previewAudience,
  sendBroadcastMessageAction,
} from "@/app/actions/admin/messages";

import ButtonEditor from "./ButtonEditor";
import ImageUploadField, { type UploadedImage } from "./ImageUploadField";
import MessagePreview from "./MessagePreview";
import StudentPicker from "./StudentPicker";

export type CourseOption = { value: string; label: string };
export type DestinationOption = { value: string; label: string };

const audienceOptions = [
  { value: "ALL_ACTIVE_STUDENTS", label: "All active students" },
  { value: "COURSE_ACTIVE_STUDENTS", label: "Active students in a course" },
  { value: "SPECIFIC_STUDENT", label: "One specific student" },
  { value: "DESTINATION", label: "Telegram channel or group" },
];

type Counts =
  | { kind: "students"; deliverable: number; unavailable: number }
  | { kind: "destination"; name: string }
  | { kind: "error"; message: string }
  | null;

export default function MessageComposer({
  courses,
  destinations,
}: {
  courses: CourseOption[];
  destinations: DestinationOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [audience, setAudience] = useState("ALL_ACTIVE_STUDENTS");
  const [courseId, setCourseId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [destinationId, setDestinationId] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [buttons, setButtons] = useState<BroadcastButton[]>([]);

  const [counts, setCounts] = useState<Counts>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  /*
   * Whether the audience is fully specified. Derived during render rather than
   * stored, so an incomplete selection simply has no count to show.
   */
  const audienceReady = !(
    (audience === "COURSE_ACTIVE_STUDENTS" && !courseId) ||
    (audience === "SPECIFIC_STUDENT" && !targetUserId) ||
    (audience === "DESTINATION" && !destinationId)
  );

  /*
   * Recipient counts come from the server on every audience change. The
   * confirmation dialog must never show a number the browser computed.
   */
  useEffect(() => {
    if (!audienceReady) return;

    let cancelled = false;

    previewAudience({ audience, courseId, targetUserId, destinationId })
      .then((res) => {
        if (cancelled) return;

        if (!res.ok) {
          setCounts({ kind: "error", message: res.error });
        } else if (res.kind === "destination") {
          setCounts({ kind: "destination", name: res.name });
        } else {
          setCounts({
            kind: "students",
            deliverable: res.deliverable,
            unavailable: res.unavailable,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCounts({ kind: "error", message: "Could not count recipients." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [audienceReady, audience, courseId, targetUserId, destinationId]);

  // An incomplete audience has nothing to report, regardless of what the last
  // completed selection resolved to.
  const visibleCounts = audienceReady ? counts : null;

  const hasContent =
    Boolean(title.trim()) || Boolean(body.trim()) || Boolean(image);

  function send() {
    setError(null);

    startTransition(async () => {
      const response = await sendBroadcastMessageAction({
        audience,
        courseId,
        targetUserId,
        destinationId,
        title,
        body,
        imageUrl: image?.url ?? "",
        imageKey: image?.key ?? "",
        imageMimeType: image?.mimeType ?? "",
        imageSize: image?.size ?? null,
        buttons,
      });

      setConfirming(false);

      if (!response.ok) {
        setError(response.error);
        return;
      }

      setResult(
        `Sent ${response.sent}` +
          (response.failed ? ` · Failed ${response.failed}` : "") +
          (response.skipped ? ` · Skipped ${response.skipped}` : "")
      );

      // Reset the composer so the same message cannot be sent twice by
      // accident.
      setTitle("");
      setBody("");
      setImage(null);
      setButtons([]);

      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* ---------------- Audience ---------------- */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Audience
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Send to">
            <Select
              value={audience}
              onChange={(value) => {
                setAudience(value);
                setCourseId("");
                setTargetUserId("");
                setDestinationId("");
              }}
              options={audienceOptions}
              disabled={pending}
            />
          </FormField>

          {audience === "COURSE_ACTIVE_STUDENTS" && (
            <FormField label="Course" required>
              <Select
                value={courseId}
                onChange={setCourseId}
                options={courses}
                placeholder="Select a course"
                disabled={pending}
              />
            </FormField>
          )}

          {audience === "DESTINATION" && (
            <FormField label="Destination" required>
              <Select
                value={destinationId}
                onChange={setDestinationId}
                options={destinations}
                placeholder={
                  destinations.length ? "Select a destination" : "None configured"
                }
                disabled={pending || destinations.length === 0}
              />
            </FormField>
          )}
        </div>

        {audience === "SPECIFIC_STUDENT" && (
          <StudentPicker
            value={targetUserId}
            onChange={setTargetUserId}
            disabled={pending}
          />
        )}

        {/* Server-computed recipient count */}
        {visibleCounts && (
          <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-secondary)] px-3.5 py-2.5">
            <Users
              className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
              strokeWidth={1.9}
            />

            <p className="text-[13.5px] text-[var(--text-muted)]">
              {visibleCounts.kind === "students" ? (
                <>
                  <span className="font-semibold text-[var(--text)]">
                    {visibleCounts.deliverable}
                  </span>{" "}
                  {visibleCounts.deliverable === 1 ? "recipient" : "recipients"}
                  {visibleCounts.unavailable > 0 && (
                    <> · {visibleCounts.unavailable} unavailable (no Telegram ID)</>
                  )}
                </>
              ) : visibleCounts.kind === "destination" ? (
                <>Sending to {visibleCounts.name}</>
              ) : (
                <span className="text-[var(--danger)]">{visibleCounts.message}</span>
              )}
            </p>
          </div>
        )}

        {audience === "ALL_ACTIVE_STUDENTS" && (
          <p className="text-[13px] text-[var(--text-subtle)]">
            Active students have at least one active course enrollment.
          </p>
        )}
      </section>

      {/* ---------------- Message ---------------- */}
      <section className="space-y-3 border-t border-[var(--border)] pt-5">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Message
        </h2>

        <FormField label="Image" hint="Optional.">
          <ImageUploadField
            value={image}
            onChange={setImage}
            disabled={pending}
          />
        </FormField>

        <FormField label="Title" hint="Optional. Shown in bold on the first line.">
          <input
            value={title}
            placeholder="🎓 NADI ACADEMY"
            disabled={pending}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClasses}
          />
        </FormField>

        <FormField label="Body" hint="Optional. Emoji and line breaks are supported.">
          <textarea
            rows={5}
            value={body}
            placeholder="Write your message…"
            disabled={pending}
            onChange={(e) => setBody(e.target.value)}
            className={textareaClasses}
          />
        </FormField>
      </section>

      {/* ---------------- Buttons ---------------- */}
      <section className="space-y-3 border-t border-[var(--border)] pt-5">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Buttons{" "}
          <span className="font-normal text-[var(--text-subtle)]">
            (optional)
          </span>
        </h2>

        <ButtonEditor
          buttons={buttons}
          onChange={setButtons}
          disabled={pending}
        />
      </section>

      {/* ---------------- Preview ---------------- */}
      <section className="space-y-3 border-t border-[var(--border)] pt-5">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Preview
        </h2>

        {hasContent ? (
          <MessagePreview
            title={title}
            body={body}
            imageUrl={image?.url ?? ""}
            buttons={buttons}
          />
        ) : (
          <p className="text-[13px] text-[var(--text-subtle)]">
            Add an image, a title, or a message to see the preview.
          </p>
        )}
      </section>

      {error && <p className="text-[14px] text-[var(--danger)]">{error}</p>}

      {result && (
        <p className="text-[14px] text-[var(--success)]">{result}</p>
      )}

      <div className="flex items-center gap-3 border-t border-[var(--border)] pt-5">
        <Button
          onClick={() => setConfirming(true)}
          disabled={pending || !hasContent}
        >
          <Send className="h-4 w-4" strokeWidth={2.1} />
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        busy={pending}
        destructive={false}
        confirmLabel="Send message"
        title="Send this message?"
        description={
          visibleCounts?.kind === "students"
            ? `It will be delivered to ${visibleCounts.deliverable} ${
                visibleCounts.deliverable === 1 ? "recipient" : "recipients"
              }${visibleCounts.unavailable ? `, with ${visibleCounts.unavailable} unavailable` : ""}. This cannot be undone.`
            : visibleCounts?.kind === "destination"
              ? `It will be posted to ${visibleCounts.name}. This cannot be undone.`
              : "This cannot be undone."
        }
        onConfirm={send}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
