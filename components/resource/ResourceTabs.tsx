import { Lock } from "lucide-react";

type ResourceTabsProps = {
  activeTab: "packs" | "tools";
  onTabChange: (tab: "packs" | "tools") => void;
  /*
   * Set when nothing is published in the packs section. The tab used to be
   * locked in code; it now reflects whether an admin has anything to show
   * there, so publishing the first pack unlocks it without a deploy.
   */
  packsLocked?: boolean;
};

const tabBase = `
  flex
  flex-1
  items-center
  justify-center
  gap-1.5
  rounded-[var(--radius-control)]
  py-2.5
  text-[13px]
  font-semibold
  tracking-tight
  transition-all
  duration-200
  ease-out
`;

export default function ResourceTabs({
  activeTab,
  onTabChange,
  packsLocked = false,
}: ResourceTabsProps) {
  const state = (tab: "packs" | "tools") =>
    activeTab === tab
      ? "bg-[var(--card)] text-[var(--text)] shadow-[var(--shadow-card)]"
      : "text-[var(--text-muted)] hover:text-[var(--text)]";

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
        type="button"
        onClick={() => onTabChange("tools")}
        aria-current={activeTab === "tools" ? "page" : undefined}
        className={`${tabBase} ${state("tools")}`}
      >
        Tools
      </button>

      {packsLocked ? (
        <span
          aria-disabled="true"
          title="Coming soon"
          className={`${tabBase} cursor-not-allowed text-[var(--text-subtle)] opacity-70`}
        >
          Packs
          <Lock className="h-3.5 w-3.5" strokeWidth={1.9} />
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onTabChange("packs")}
          aria-current={activeTab === "packs" ? "page" : undefined}
          className={`${tabBase} ${state("packs")}`}
        >
          Packs
        </button>
      )}
    </div>
  );
}
