import { useState } from 'react';
import { X, Link, Loader2 } from 'lucide-react';
import { api } from '../api/client';

type Props = {
  onClose: () => void;
  onAdded: () => void;
};

type SummarizeResult = {
  title: string;
  summary: string;
  deadline: string | null;
  source_type: 'sns' | 'official' | 'other';
};

export default function AddCampaignModal({ onClose, onAdded }: Props) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.summarizeUrl(url);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '要約に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!result) return;
    setLoading(true);
    try {
      await api.addCampaign({
        url,
        title: result.title,
        summary: result.summary,
        deadline: result.deadline,
        source_type: result.source_type,
      });
      onAdded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base">キャンペーンを追加</h2>
          <button id="close-modal-btn" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* URL入力 */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center border rounded-lg px-3 gap-2">
            <Link size={16} className="text-gray-400 shrink-0" />
            <input
              id="url-input"
              type="url"
              placeholder="キャンペーンのURLを入力"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1 text-sm py-2 focus:outline-none"
            />
          </div>
          <button
            id="summarize-btn"
            onClick={handleSummarize}
            disabled={loading || !url}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : '要約'}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* LLM要約結果プレビュー */}
        {result && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">タイトル</label>
              <input
                id="title-input"
                type="text"
                value={result.title}
                onChange={e => setResult({ ...result, title: e.target.value })}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">要約</label>
              <textarea
                id="summary-input"
                value={result.summary}
                onChange={e => setResult({ ...result, summary: e.target.value })}
                rows={4}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">締め切り日</label>
              <input
                id="deadline-input"
                type="date"
                value={result.deadline ?? ''}
                onChange={e => setResult({ ...result, deadline: e.target.value || null })}
                className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              id="add-btn"
              onClick={handleAdd}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? '登録中...' : '登録する'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
