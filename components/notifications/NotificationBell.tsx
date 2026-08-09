"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, ExternalLink, X } from "lucide-react";

import IconButton from "@/components/ui/IconButton";
import type { NotificationView } from "@/lib/db/notifications";

/*
 * Compact relative time. Notifications are read at a glance, so the feed
 * favours "2h" over a formatted date; anything older than a week falls back
 * to a real date because "23d" stops being meaningful.
 */
function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const seconds = Math.max(0, (Date.now() - then) / 1000);

  if (seconds < 60) return "now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationView[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");

      if (!response.ok) return;

      const data = await response.json();

      setItems(data.items ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      // A failed poll leaves the last known state in place: an empty bell is
      // less alarming than an error badge for something this peripheral.
    }
  }, []);

  /*
   * Fetch the count once on mount so the badge is right before any tap.
   *
   * The effect owns its own fetch rather than calling load(), so it can drop
   * a response that arrives after unmount — the header remounts on every
   * navigation, and a late resolve would otherwise set state on a dead
   * component.
   */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await fetch("/api/notifications");

        if (!response.ok || !active) return;

        const data = await response.json();

        if (!active) return;

        setItems(data.items ?? []);
        setUnread(data.unreadCount ?? 0);
      } catch {
        // Same rationale as load(): stay quiet and keep the last state.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function openPanel() {
    setOpen(true);
    setLoading(items.length === 0);

    await load();
    setLoading(false);

    /*
     * Clearing is deliberately optimistic and fire-and-forget. The badge is
     * the thing the student notices; making them wait on a round trip to see
     * it clear would feel broken, and a lost mark-read only means the badge
     * reappears once.
     */
    setUnread(0);

    fetch("/api/notifications", { method: "POST" }).catch(() => {});
  }

  // Dismiss on outside tap and on Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <IconButton
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        <span className="relative flex items-center justify-center">
          <Bell className="h-[18px] w-[18px]" />

          {unread > 0 && (
            <span
              className="
                absolute
                -right-1.5
                -top-1.5
                flex
                h-4
                min-w-4
                items-center
                justify-center
                rounded-[var(--radius-pill)]
                bg-[var(--primary)]
                px-1
                text-[10px]
                font-bold
                leading-none
                text-white
                shadow-[0_0_0_2px_var(--background)]
              "
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
      </IconButton>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="
            animate-panel-open
            absolute
            right-0
            top-[calc(100%+10px)]
            z-50
            max-h-[min(70vh,26rem)]
            w-[min(20rem,calc(100vw-2rem))]
            overflow-hidden
            rounded-[var(--radius)]
            border
            border-[var(--border)]
            bg-[var(--card)]
            shadow-[var(--shadow-raised)]
          "
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <h2 className="text-[13px] font-semibold tracking-tight text-[var(--text)]">
              Notifications
            </h2>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="
                -mr-1
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-[var(--radius-control)]
                text-[var(--text-muted)]
                transition-colors
                duration-200
                hover:bg-[var(--surface-secondary)]
                hover:text-[var(--text)]
              "
            >
              <X className="h-4 w-4" strokeWidth={1.9} />
            </button>
          </div>

          <div className="max-h-[calc(min(70vh,26rem)-3rem)] overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="space-y-2 p-3">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="h-14 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-secondary)]"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell
                  className="mx-auto h-6 w-6 text-[var(--text-subtle)]"
                  strokeWidth={1.6}
                />

                <p className="mt-2.5 text-[13px] font-medium text-[var(--text)]">
                  No notifications yet
                </p>

                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                  Updates from your instructor land here.
                </p>
              </div>
            ) : (
              <ul>
                {items.map((item) => {
                  const Row = item.linkUrl ? "a" : "div";

                  const rowProps = item.linkUrl
                    ? {
                        href: item.linkUrl,
                        target: "_blank" as const,
                        rel: "noopener noreferrer",
                      }
                    : {};

                  return (
                    <li
                      key={item.id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <Row
                        {...rowProps}
                        className={`
                          block
                          px-4
                          py-3
                          transition-colors
                          duration-200
                          ${item.linkUrl ? "hover:bg-[var(--surface-secondary)]" : ""}
                        `}
                      >
                        <div className="flex items-start gap-2.5">
                          {/*
                           * The unread dot occupies its slot either way, so a
                           * read row's text stays aligned with an unread one
                           * instead of shifting left.
                           */}
                          <span
                            className={`
                              mt-1.5
                              h-1.5
                              w-1.5
                              shrink-0
                              rounded-[var(--radius-pill)]
                              ${item.isUnread ? "bg-[var(--primary)]" : "bg-transparent"}
                            `}
                            aria-hidden="true"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p
                                className={`
                                  text-[13px]
                                  leading-snug
                                  tracking-tight
                                  text-[var(--text)]
                                  ${item.isUnread ? "font-semibold" : "font-medium"}
                                `}
                              >
                                {item.title}
                              </p>

                              <time
                                dateTime={item.publishedAt}
                                className="shrink-0 text-[11px] tabular-nums text-[var(--text-subtle)]"
                              >
                                {relativeTime(item.publishedAt)}
                              </time>
                            </div>

                            <p className="mt-1 whitespace-pre-line text-[12px] leading-relaxed text-[var(--text-muted)]">
                              {item.body}
                            </p>

                            <div className="mt-1.5 flex items-center gap-2">
                              {item.courseTitle && (
                                <span className="truncate text-[11px] font-medium text-[var(--text-subtle)]">
                                  {item.courseTitle}
                                </span>
                              )}

                              {item.linkUrl && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary-text)]">
                                  Open
                                  <ExternalLink
                                    className="h-3 w-3"
                                    strokeWidth={2.2}
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Row>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
