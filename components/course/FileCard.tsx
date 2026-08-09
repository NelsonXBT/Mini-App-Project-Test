"use client";

import Link from "next/link";

import {
  ExternalLink,
  FileText,
  Folder,
  GitBranch,
  Globe,
  NotebookText,
} from "lucide-react";

import { ResourceType } from "@prisma/client";

type FileCardProps = {
  title: string;
  url: string;
  type: ResourceType;
};

export default function FileCard({
  title,
  url,
  type,
}: FileCardProps) {
  function renderIcon() {
    // One size and stroke weight across every type; only the hue differs,
    // so the row still scans as a single icon language.
    const shared = "h-[18px] w-[18px]";
    const stroke = 1.9;

    switch (type) {
      case "pdf":
        return <FileText className={`${shared} text-[#c2554d]`} strokeWidth={stroke} />;

      case "google_doc":
        return <FileText className={`${shared} text-[#4a72b8]`} strokeWidth={stroke} />;

      case "drive":
        return <Folder className={`${shared} text-[#3f8f63]`} strokeWidth={stroke} />;

      case "github":
        return <GitBranch className={`${shared} text-[var(--text)]`} strokeWidth={stroke} />;

      case "notion":
        return <NotebookText className={`${shared} text-[var(--text)]`} strokeWidth={stroke} />;

      case "website":
        return <Globe className={`${shared} text-[#4a6fa8]`} strokeWidth={stroke} />;

      case "download":
      default:
        return <FileText className={`${shared} text-[var(--text-muted)]`} strokeWidth={stroke} />;
    }
  }

  return (
    <div
      className="
        flex
        items-center
        gap-4
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--card)]
        px-4
        py-3.5
        shadow-[var(--shadow-card)]
        transition-all
        duration-200
        ease-out
        hover:border-[var(--border-strong)]
      "
    >
      {/* Icon */}

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[var(--radius-control)]
          bg-[var(--surface-secondary)]
        "
      >
        {renderIcon()}
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-medium tracking-tight text-[var(--text)]">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] capitalize text-[var(--text-subtle)]">
          {type.replace("_", " ")}
        </p>
      </div>

      {/* View Button */}

      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="
          inline-flex
          h-9
          shrink-0
          items-center
          gap-1.5
          rounded-[var(--radius-control)]
          border
          border-[var(--border)]
          px-3
          text-[13px]
          font-medium
          text-[var(--primary-text)]
          transition-all
          duration-200
          ease-out
          hover:border-[var(--primary)]
          hover:bg-[var(--primary-soft)]
          active:scale-[0.98]
        "
      >
        View

        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}