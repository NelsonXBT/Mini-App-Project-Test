"use client";

type CourseTabsProps = {
  activeTab: "lessons" | "files";
  onTabChange: (tab: "lessons" | "files") => void;
  hasFiles?: boolean;
};

export default function CourseTabs({
  activeTab,
  onTabChange,
  hasFiles = true,
}: CourseTabsProps) {
  /*
   * With no course files there is nothing behind the Files tab, so it is
   * dropped rather than left to open an empty panel.
   */
  const tabs = [
    { id: "lessons" as const, label: "Lessons" },
    ...(hasFiles ? [{ id: "files" as const, label: "Files" }] : []),
  ];

  // A single tab is a label, not a choice — hide the bar entirely.
  if (tabs.length < 2) {
    return null;
  }

  return (
    <div
      className="
        mb-4
        mt-1
        flex
        border-b
        border-[var(--border)]
      "
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative
              flex-1
              pb-3
              text-[12.5px]
              font-bold
              uppercase
              tracking-[0.1em]
              transition-colors
              duration-200
              ease-out
              ${
                active
                  ? "text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }
            `}
          >
            {tab.label}

            <span
              className={`
                absolute
                bottom-[-1px]
                left-0
                h-0.5
                w-full
                rounded-[var(--radius-pill)]
                bg-[var(--primary)]
                transition-opacity
                duration-200
                ease-out
                ${active ? "opacity-100" : "opacity-0"}
              `}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}