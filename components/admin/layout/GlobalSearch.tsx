"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, User as UserIcon, Loader2 } from "lucide-react";

import {
  searchAdmin,
  type SearchResult,
} from "@/app/actions/admin/search";

export default function GlobalSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [pending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced so we aren't issuing a round trip per keystroke. The 150ms
  // window is short enough to still feel instant while typing.
  useEffect(() => {
    const term = query.trim();

    if (term.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const found = await searchAdmin(term);
          setResults(found);
          setHighlighted(0);
        } catch {
          setResults([]);
        }
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);

    return () =>
      document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function go(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(
        (i) => (i - 1 + results.length) % results.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown =
    open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
        strokeWidth={1.9}
      />

      <input
        type="text"
        value={query}
        placeholder="Search courses or students…"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="
          h-10
          w-full
          rounded-[var(--radius-control)]
          border
          border-[var(--border)]
          bg-[var(--surface-secondary)]
          pl-9
          pr-9
          text-[14px]
          text-[var(--text)]
          outline-none
          transition-all
          duration-200
          ease-out
          placeholder:text-[var(--text-subtle)]
          focus:border-[var(--primary)]
          focus:bg-[var(--card)]
          focus:ring-2
          focus:ring-[var(--primary-ring)]
        "
      />

      {pending && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--text-subtle)]" />
      )}

      {showDropdown && (
        <div
          className="
            animate-fade-in
            absolute
            left-0
            right-0
            top-[calc(100%+6px)]
            z-50
            overflow-hidden
            rounded-[var(--radius)]
            border
            border-[var(--border)]
            bg-[var(--card)]
            shadow-[var(--shadow-raised)]
          "
        >
          {results.length === 0 ? (
            <p className="px-4 py-3.5 text-[13px] text-[var(--text-muted)]">
              {pending ? "Searching…" : "No matches."}
            </p>
          ) : (
            results.map((result, index) => {
              const Icon =
                result.kind === "course" ? BookOpen : UserIcon;

              return (
                <button
                  key={`${result.kind}-${result.id}`}
                  onClick={() => go(result)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    px-3.5
                    py-2.5
                    text-left
                    transition-colors
                    duration-150
                    ${
                      index === highlighted
                        ? "bg-[var(--surface-secondary)]"
                        : ""
                    }
                  `}
                >
                  <span
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-[var(--radius-control)]
                      bg-[var(--surface-secondary)]
                    "
                  >
                    <Icon
                      className="h-3.5 w-3.5 text-[var(--text-muted)]"
                      strokeWidth={1.9}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium tracking-tight text-[var(--text)]">
                      {result.title}
                    </span>

                    {result.subtitle && (
                      <span className="block truncate text-[11px] text-[var(--text-subtle)]">
                        {result.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
