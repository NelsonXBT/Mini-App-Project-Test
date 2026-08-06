import { Lock } from "lucide-react";

type ResourceTabsProps = {
  activeTab: "packs" | "tools";
  onTabChange: (tab: "packs" | "tools") => void;
};

export default function ResourceTabs({
  activeTab,
  onTabChange,
}: ResourceTabsProps) {
  return (
    <div
      className="
        mb-5
        flex
        gap-1
        rounded-[var(--radius)]
        border
        border-[var(--border)]
        bg-[var(--surface-secondary)]
        p-1
      "
    >
      <button
        onClick={() => onTabChange("tools")}
        className={`
          flex-1
          rounded-[var(--radius-control)]
          py-2.5
          text-[13px]
          font-semibold
          tracking-tight
          transition-all
          duration-200
          ease-out
          ${
            activeTab === "tools"
              ? "bg-[var(--card)] text-[var(--text)] shadow-[var(--shadow-card)]"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }
        `}
      >
        Tools
      </button>

      <button
        type="button"
        disabled
        className="
          flex
          flex-1
          cursor-not-allowed
          items-center
          justify-center
          gap-1.5
          rounded-[var(--radius-control)]
          py-2.5
          text-[13px]
          font-semibold
          tracking-tight
          text-[var(--text-subtle)]
          opacity-70
        "
      >
        <span>Packs</span>
        <Lock className="h-3.5 w-3.5" strokeWidth={1.9} />
      </button>
    </div>
  );
}
