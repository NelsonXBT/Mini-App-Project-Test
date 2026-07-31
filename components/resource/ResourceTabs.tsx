type ResourceTabsProps = {
  activeTab: "packs" | "tools";
  onTabChange: (tab: "packs" | "tools") => void;
};

export default function ResourceTabs({
  activeTab,
  onTabChange,
}: ResourceTabsProps) {
  return (
    <div className="mb-6 flex rounded-xl bg-zinc-900 p-1">
      <button
        onClick={() => onTabChange("packs")}
        className={`flex-1 rounded-lg py-3 text-sm font-semibold transition ${
          activeTab === "packs"
            ? "bg-cyan-500 text-black"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        Packs
      </button>

      <button
        onClick={() => onTabChange("tools")}
        className={`flex-1 rounded-lg py-3 text-sm font-semibold transition ${
          activeTab === "tools"
            ? "bg-cyan-500 text-black"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        Tools
      </button>
    </div>
  );
}