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
    <div className="mb-6 flex rounded-xl bg-zinc-900 p-1">
      <button
        onClick={() => onTabChange("lessons")}
        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
          activeTab === "lessons"
            ? "bg-cyan-500 text-black"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        Lessons
      </button>

      <button
        onClick={() => onTabChange("files")}
        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
          activeTab === "files"
            ? "bg-cyan-500 text-black"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        Files
      </button>
    </div>
  );
}