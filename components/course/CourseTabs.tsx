"use client";

type CourseTabsProps = {
  activeTab: "lessons" | "files";
  onTabChange: (tab: "lessons" | "files") => void;
};

export default function CourseTabs({
  activeTab,
  onTabChange,
}: CourseTabsProps) {
  const tabs = [
    { id: "lessons" as const, label: "Lessons" },
    { id: "files" as const, label: "Files" },
  ];

  return (
    <div
      className="
        mb-4
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
              text-[12px]
              font-semibold
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