"use client";

import Link from "next/link";

import {
  FileText,
  Globe,
  Folder,
  GitBranch,
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
        return (
          <FileText className="h-6 w-6 text-red-400" />
        );

      case "google_doc":
        return (
          <FileText className="h-6 w-6 text-blue-400" />
        );

      case "drive":
        return (
          <Folder className="h-6 w-6 text-green-400" />
        );

      case "github":
        return (
          <GitBranch className="h-6 w-6 text-white" />
        );

      case "notion":
        return (
          <NotebookText className="h-6 w-6 text-zinc-100" />
        );

      case "website":
        return (
          <Globe className="h-6 w-6 text-cyan-400" />
        );

      case "download":
      default:
        return (
          <FileText className="h-6 w-6 text-cyan-400" />
        );
    }
  }

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex
        items-center
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900
        p-4
        transition
        hover:border-cyan-500
        hover:bg-zinc-800
      "
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
        {renderIcon()}
      </div>

      <div className="ml-4 flex-1">
        <h3 className="font-medium text-white">
          {title}
        </h3>
      </div>

      <span className="text-sm font-semibold text-cyan-400">
        View
      </span>
    </Link>
  );
}