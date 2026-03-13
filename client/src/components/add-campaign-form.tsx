import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

interface AddCampaignFormProps {
  onAdd: (url: string) => Promise<void>;
}

export function AddCampaignForm({ onAdd }: AddCampaignFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      await onAdd(url);
      setUrl("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="キャンペーンのURLを入力してください（例: https://...）"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              解析中...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              追加
            </>
          )}
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        SNSや企業サイトのキャンペーンURLを追加すると、AIが自動的に内容を要約します
      </p>
    </form>
  );
}
