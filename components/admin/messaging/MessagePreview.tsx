import type { BroadcastButton } from "@/lib/telegram/compose";

/**
 * A Telegram-style preview of the message about to be sent.
 *
 * Deliberately dumb: it renders exactly what was composed and nothing else.
 * No image → no image slot. No buttons → no keyboard. No title → no title.
 * This is the "what will actually be sent" promise, and the real send path
 * builds the Telegram payload from the same compose helpers.
 */

type MessagePreviewProps = {
  title: string;
  body: string;
  imageUrl: string;
  buttons: BroadcastButton[];
};

export default function MessagePreview({
  title,
  body,
  imageUrl,
  buttons,
}: MessagePreviewProps) {
  const hasImage = Boolean(imageUrl.trim());
  const hasTitle = Boolean(title.trim());
  const hasBody = Boolean(body.trim());

  return (
    <div className="overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-secondary)]">
      {/* Phone-width bubble, Telegram's muted chat background */}
      <div className="space-y-3 p-4">
        <div className="mx-auto w-full max-w-[280px]">
          <div className="overflow-hidden rounded-2xl bg-[var(--card)] shadow-[var(--shadow-card)]">
            {hasImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt=""
                className="max-h-56 w-full object-cover"
              />
            )}

            <div className="px-3.5 py-3">
              {hasTitle && (
                <p className="text-[14px] font-semibold leading-snug text-[var(--text)]">
                  {title}
                </p>
              )}

              {hasBody && (
                <p className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-[var(--text-muted)]">
                  {body}
                </p>
              )}
            </div>

            {buttons.length > 0 && (
              <div className="border-t border-[var(--border)] px-3.5 py-2">
                {buttons.map((button, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center rounded-lg py-1.5 text-center text-[13.5px] font-semibold text-[var(--primary-text)]"
                  >
                    {button.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
