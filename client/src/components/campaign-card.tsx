import { Calendar, ExternalLink, TrendingUp, Clock, Store, Pencil } from "lucide-react";
import type { Campaign } from "../types/types";

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function CampaignCard({ campaign, onDelete, onEdit }: CampaignCardProps) {
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
    switch (source?.toLowerCase()) {
      case "twitter":
      case "x":
        return <span className="font-bold">𝕏</span>;
      case "tiktok":
        return <span>♪</span>;
      case "threads":
        return <span>@</span>;
      case "instagram":
        return <span>📷</span>;
      case "facebook":
        return <span>f</span>;
      case "website":
      case "official":
        return <ExternalLink className="w-3 h-3" />;
      default:
        return "🌐";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{campaign.company}</span>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
              {getSourceIcon(campaign.source)}
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{campaign.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(campaign.id)}
            className="text-gray-400 hover:text-blue-500 transition-colors"
            aria-label="編集"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(campaign.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="削除"
          >
            ×
          </button>
        </div>
      </div>

      <p className="text-gray-700 mb-4 text-sm leading-relaxed">
        {campaign.summary}
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {campaign.discountRate && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 shadow-sm backdrop-blur-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold text-sm tracking-tight">
              {campaign.discountRate}% OFF
            </span>
          </div>
        )}
        {campaign.discountAmount && campaign.discountAmount !== "Unknown" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 shadow-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold text-sm tracking-tight">
              {campaign.discountAmount} OFF
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {campaign.maxAmount && campaign.maxAmount !== "Unknown" && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-600 rounded-md border border-slate-200 text-xs">
              <span className="font-semibold opacity-70">上限</span>
              <span className="font-bold text-slate-800">{campaign.maxAmount}</span>
            </div>
          )}
          {campaign.maxUsage && campaign.maxUsage !== "Unknown" && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-600 rounded-md border border-slate-200 text-xs">
              <span className="font-semibold opacity-70">制限</span>
              <span className="font-bold text-slate-800">{campaign.maxUsage}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100">
          <Calendar className="w-3.5 h-3.5" />
          <span className="font-medium">
            {new Date(campaign.startDate).toLocaleDateString("ja-JP").replace(/\//g, ".")} - {new Date(campaign.expiryDate).toLocaleDateString("ja-JP").replace(/\//g, ".")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(daysUntilExpiry)}`}>
          <Clock className="w-4 h-4" />
          <span>
            {daysUntilExpiry < 0
              ? "期限切れ"
              : daysUntilExpiry === 0
              ? "今日まで"
              : `あと${daysUntilExpiry}日`}
          </span>
        </div>
        <a
          href={campaign.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>詳細を見る</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}