import { X, Calendar, ExternalLink, TrendingUp, Clock, Store, Pencil } from "lucide-react";
import type { Campaign } from "../types/types";

interface CampaignDetailModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export function CampaignDetailModal({ campaign, onClose, onEdit }: CampaignDetailModalProps) {
  if (!campaign) return null;

  const daysUntilExpiry = Math.ceil(
    (new Date(campaign.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getUrgencyColor = (days: number) => {
    if (days < 0) return "text-red-600 bg-red-50";
    if (days <= 3) return "text-orange-600 bg-orange-50";
    if (days <= 7) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "twitter":
      case "x":
        return "𝕏";
      case "facebook":
        return "f";
      case "instagram":
        return "📷";
      default:
        return "🌐";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="閉じる"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{campaign.company}</span>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
              {getSourceIcon(campaign.source)}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{campaign.title}</h2>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">
          {campaign.summary}
        </p>

        <div className="space-y-3 mb-6">
          {campaign.discountRate && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-600 text-lg">
                {campaign.discountRate}% OFF
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5" />
            <span>
              {new Date(campaign.startDate).toLocaleDateString("ja-JP")} 〜{" "}
              {new Date(campaign.expiryDate).toLocaleDateString("ja-JP")}
            </span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg w-fit ${getUrgencyColor(daysUntilExpiry)}`}>
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              {daysUntilExpiry < 0
                ? "期限切れ"
                : daysUntilExpiry === 0
                ? "今日まで"
                : `あと${daysUntilExpiry}日`}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={campaign.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span>キャンペーンページを開く</span>
            <ExternalLink className="w-5 h-5" />
          </a>
          <button
            onClick={() => {
              onEdit(campaign.id);
              onClose();
            }}
            className="px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
          >
            <Pencil className="w-5 h-5" />
            <span>編集</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}