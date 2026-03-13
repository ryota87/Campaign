import { List, Calendar } from "lucide-react";

interface TabNavigationProps {
  activeTab: "list" | "calendar";
  onTabChange: (tab: "list" | "calendar") => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 bg-white rounded-lg border border-gray-200 p-1">
      <button
        onClick={() => onTabChange("list")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
          activeTab === "list"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <List className="w-5 h-5" />
        <span className="font-medium">リスト表示</span>
      </button>
      <button
        onClick={() => onTabChange("calendar")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
          activeTab === "calendar"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="font-medium">カレンダー表示</span>
      </button>
    </div>
  );
}
