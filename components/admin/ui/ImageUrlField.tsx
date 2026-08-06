"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { inputClasses } from "./FormField";

type ImageUrlFieldProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  aspect?: "video" | "square";
};

/**
 * URL in, live preview beside it.
 *
 * Deliberately storage-agnostic: the database only ever holds a string, so
 * swapping in Bunny CDN (or anything else) later needs no schema or UI change.
 * Uses a plain <img> rather than next/image because the host is arbitrary and
 * would otherwise have to be allow-listed in next.config.
 */
export default function ImageUrlField({
  value,
  onChange,
  id,
  placeholder = "https://…",
  aspect = "video",
}: ImageUrlFieldProps) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="flex gap-3">
      <div
        className={`
          relative
          shrink-0
          overflow-hidden
          rounded-[var(--radius-control)]
          border
          border-[var(--border)]
          bg-[var(--surface-secondary)]
          ${aspect === "video" ? "h-[62px] w-[110px]" : "h-[62px] w-[62px]"}
        `}
      >
        {value && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
            onLoad={() => setBroken(false)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff
              className="h-4 w-4 text-[var(--text-subtle)]"
              strokeWidth={1.9}
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <input
          id={id}
          type="url"
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            setBroken(false);
            onChange(e.target.value);
          }}
          className={inputClasses}
        />

        {value && broken && (
          <p className="mt-1.5 text-[12px] text-[var(--danger)]">
            That image could not be loaded.
          </p>
        )}
      </div>
    </div>
  );
}
