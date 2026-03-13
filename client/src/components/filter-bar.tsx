import { Search, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "expiry" | "discount" | "added";
  onSortChange: (sort: "expiry" | "discount" | "added") => void;
  showExpired: boolean;
  onShowExpiredChange: (show: boolean) => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showExpired,
  onShowExpiredChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="キャンペーンを検索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "expiry" | "discount" | "added")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="expiry">期限順</option>
              <option value="discount">割引率順</option>
              <option value="added">追加日順</option>
            </select>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showExpired}
              onChange={(e) => onShowExpiredChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">期限切れを表示</span>
          </label>
        </div>
      </div>
    </div>
  );
}
