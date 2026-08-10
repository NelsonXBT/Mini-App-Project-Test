"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

export type UploadedImage = {
  url: string;
  key: string;
  mimeType: string;
  size: number;
};

/**
 * Upload an image from the admin's computer.
 *
 * The admin picks a file; everything else — the POST, the storage location,
 * the resulting URL — is invisible to them. The binary goes to Vercel Blob and
 * only the reference is handed back for storing alongside the message.
 *
 * Optional by design: an empty value is a valid message.
 */

type ImageUploadFieldProps = {
  value: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
  disabled?: boolean;
};

export default function ImageUploadField({
  value,
  onChange,
  disabled,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "The upload failed.");
        return;
      }

      onChange(data as UploadedImage);
    } catch {
      setError("The upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);

      // Clear the input so re-selecting the same file fires onChange again.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative h-[62px] w-[110px] shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-secondary)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-[var(--text-muted)]">
            {Math.round(value.size / 1024)} KB · {value.mimeType}
          </p>

          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--danger)] transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
            Remove image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="
          inline-flex
          h-11
          items-center
          gap-2
          rounded-[var(--radius-control)]
          border
          border-dashed
          border-[var(--border-strong)]
          bg-[var(--card)]
          px-4
          text-[14px]
          font-medium
          text-[var(--text-muted)]
          transition-colors
          duration-200
          hover:border-[var(--primary)]
          hover:text-[var(--text)]
          disabled:opacity-50
        "
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Uploading…
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" strokeWidth={1.9} />
            Upload image
          </>
        )}
      </button>

      {error ? (
        <p className="text-[13px] text-[var(--danger)]">{error}</p>
      ) : (
        <p className="text-[13px] text-[var(--text-subtle)]">
          Optional. JPEG, PNG, GIF or WebP, up to 5MB.
        </p>
      )}
    </div>
  );
}
