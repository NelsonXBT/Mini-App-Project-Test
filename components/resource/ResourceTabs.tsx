
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
    <div className="mb-6 flex rounded-xl bg-zinc-900 p-1">



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


      <button
  type="button"
  disabled
  className="
    flex-1
    flex
    items-center
    justify-center
    gap-1
    rounded-lg
    py-3
    text-sm
    font-semibold
    text-zinc-500
    opacity-70
    cursor-not-allowed
  "
>
  <span>Packs</span>
  <Lock className="h-3.5 w-3.5" />
</button>
    </div>
  );
}