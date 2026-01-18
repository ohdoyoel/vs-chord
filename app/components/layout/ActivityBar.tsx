import { Files, Search, GitGraph } from "lucide-react";

interface Props {
  activeTab: "explorer" | "search";
  onTabChange: (tab: "explorer" | "search") => void;
}

export default function ActivityBar({ activeTab, onTabChange }: Props) {
  const getItemClass = (tabName: string) =>
    `cursor-pointer border-l-2 pl-3 py-1 ${
      activeTab === tabName
        ? "border-white opacity-100"
        : "border-transparent opacity-50"
    }`;

  return (
    <aside className="w-12 bg-[#333333] flex flex-col items-center py-2 z-10">
      <div className="flex flex-col space-y-6">
        <div
          onClick={() => onTabChange("explorer")}
          className={getItemClass("explorer")}
        >
          <Files className="w-6 h-6" />
        </div>
        <div
          onClick={() => onTabChange("search")}
          className={getItemClass("search")}
        >
          <Search className="w-6 h-6" />
        </div>
        <div className="cursor-pointer opacity-50 pl-3">
          <GitGraph className="w-6 h-6" />
        </div>
      </div>
    </aside>
  );
}
