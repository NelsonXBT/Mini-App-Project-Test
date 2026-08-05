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
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;

      case "google_doc":
        return <FileText className="h-5 w-5 text-blue-500" />;

      case "drive":
        return <Folder className="h-5 w-5 text-green-500" />;

      case "github":
        return <GitBranch className="h-5 w-5 text-[var(--text)]" />;

      case "notion":
        return <NotebookText className="h-5 w-5 text-[var(--text)]" />;

      case "website":
        return <Globe className="h-5 w-5 text-[var(--primary)]" />;

      case "download":
      default:
        return <FileText className="h-5 w-5 text-[var(--primary)]" />;
    }
  }

  return (
    <div
      className="
        flex
        items-center
        gap-4
        rounded-xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        px-5
        py-4
      "
    >
      {/* Icon */}

      <div className="shrink-0">
        {renderIcon()}
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-medium text-[var(--text)]">
          {title}
        </h3>

        <p className="mt-1 text-xs capitalize text-[var(--text-muted)]">
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
          items-center
          gap-1.5
          rounded-lg
          border
          border-[var(--border)]
          px-3
          py-2
          text-xs
          font-medium
          text-[var(--primary)]
          transition-all
          duration-200
          hover:border-[var(--primary)]
          hover:bg-[var(--surface-secondary)]
        "
      >
        View

        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}