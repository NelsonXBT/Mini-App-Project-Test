"use client";

import Link from "next/link";

import {
  ChevronRight,
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
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        flex
        items-center
        gap-4
        rounded-xl
        border
        border-[var(--border)]
        bg-[var(--card)]
        px-5
        py-4
        transition-colors
        hover:bg-[var(--surface-secondary)]
      "
    >
      <div className="shrink-0">
        {renderIcon()}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-medium text-[var(--text)]">
          {title}
        </h3>

        <p className="mt-1 text-xs capitalize text-[var(--text-muted)]">
          {type.replace("_", " ")}
        </p>
      </div>

      <ChevronRight
        className="
          h-5
          w-5
          shrink-0
          text-[var(--text-muted)]
          transition-transform
          duration-200
          group-hover:translate-x-0.5
        "
      />
    </Link>
  );
}