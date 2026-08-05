"use client";

type CourseTabsProps = {
  activeTab: "lessons" | "files";
  onTabChange: (tab: "lessons" | "files") => void;
};

export default function CourseTabs({
  activeTab,
  onTabChange,
}: CourseTabsProps) {
  return (
    <div
      className="
        mb-5
        flex
        border-b
        border-[var(--border)]
      "
    >
      <button
        onClick={() => onTabChange("lessons")}
        className={`
              relative
              flex-1
              pb-3
              text-[13px]
              font-semibold
              uppercase
              tracking-[0.08em]
              transition-colors
              ${
                activeTab === "lessons"
                  ? "text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }
            `}
      >
        Lessons

        {activeTab === "lessons" && (
          <span
            className="
              absolute
              bottom-0
              left-0
              h-0.5
              w-full
              rounded-full
              bg-[var(--primary)]
            "
          />
        )}
      </button>

      <button
        onClick={() => onTabChange("files")}
        className={`
            relative
            flex-1
            pb-3
            text-[13px]
            font-semibold
            uppercase
            tracking-[0.08em]
            transition-colors
            ${
              activeTab === "files"
                ? "text-[var(--primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }
          `}
      >
        Files

        {activeTab === "files" && (
          <span
            className="
              absolute
              bottom-0
              left-0
              h-0.5
              w-full
              rounded-full
              bg-[var(--primary)]
            "
          />
        )}
      </button>
    </div>
  );
}