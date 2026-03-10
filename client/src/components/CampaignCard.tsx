import { ExternalLink, Calendar } from 'lucide-react';
import { api, type Campaign } from '../api/client';

type Props = {
  campaign: Campaign;
  onUpdated: () => void;
};

const STATUS_LABELS: Record<Campaign['status'], string> = {
  active: '応募中',
  applied: '応募済み',
  closed: '締め切り済み',
};

export default function CampaignCard({ campaign, onUpdated }: Props) {
  const handleStatusChange = async (status: Campaign['status']) => {
    await api.updateCampaign({ campaign_id: campaign.id, status });
    onUpdated();
  };

  const isExpired = campaign.deadline
    ? new Date(campaign.deadline) < new Date()
    : false;

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${isExpired ? 'border-red-200' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="font-semibold text-sm leading-snug flex-1">{campaign.title}</h2>
        <a
          href={campaign.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-500 shrink-0"
          aria-label="元URLを開く"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-3">
        {campaign.summary}
      </p>

      <div className="flex items-center justify-between gap-2">
        {campaign.deadline ? (
          <span className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
            <Calendar size={12} />
            {campaign.deadline}
          </span>
        ) : (
          <span className="text-xs text-gray-300">締め切り不明</span>
        )}

        <select
          id={`status-select-${campaign.id}`}
          value={campaign.status}
          onChange={e => handleStatusChange(e.target.value as Campaign['status'])}
          className="text-xs border rounded-lg px-2 py-1 bg-gray-50 focus:outline-none"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
