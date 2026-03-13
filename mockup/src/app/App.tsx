import { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { CampaignCard } from "./components/campaign-card";
import { AddCampaignForm } from "./components/add-campaign-form";
import { FilterBar } from "./components/filter-bar";
import { CalendarView } from "./components/calendar-view";
import { TabNavigation } from "./components/tab-navigation";
import { EditCampaignModal } from "./components/edit-campaign-modal";
import {
  mockCampaigns,
  analyzeCampaignFromUrl,
} from "./utils/mock-data";
import type { Campaign } from "./types";

export default function App() {
  const [campaigns, setCampaigns] =
    useState<Campaign[]>(mockCampaigns);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "expiry" | "discount" | "added"
  >("expiry");
  const [showExpired, setShowExpired] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "list" | "calendar"
  >("list");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const handleAddCampaign = async (url: string) => {
    const newCampaign = await analyzeCampaignFromUrl(url);
    setCampaigns((prev) => [newCampaign, ...prev]);
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEditCampaign = (id: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      setEditingCampaign(campaign);
    }
  };

  const handleSaveCampaign = (updatedCampaign: Campaign) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
    );
  };

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns;

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          c.company
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          c.summary
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // 期限切れフィルター
    if (!showExpired) {
      filtered = filtered.filter(
        (c) => new Date(c.expiryDate) >= new Date(),
      );
    }

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "expiry":
          return (
            new Date(a.expiryDate).getTime() -
            new Date(b.expiryDate).getTime()
          );
        case "discount":
          return (b.discountRate || 0) - (a.discountRate || 0);
        case "added":
          return (
            new Date(b.addedAt).getTime() -
            new Date(a.addedAt).getTime()
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [campaigns, searchQuery, sortBy, showExpired]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Campaign Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            企業のキャンペーンを一元管理。AIが自動で内容を要約し、お得な情報を見逃しません。
          </p>
        </div>

        {/* URL追加フォーム */}
        <div className="mb-6">
          <AddCampaignForm onAdd={handleAddCampaign} />
        </div>

        {/* フィルターバー */}
        <div className="mb-6">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showExpired={showExpired}
            onShowExpiredChange={setShowExpired}
          />
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* キャンペーン一覧 */}
        <div className="space-y-4">
          {activeTab === "list" ? (
            filteredAndSortedCampaigns.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">
                  {searchQuery
                    ? "検索条件に一致するキャンペーンが見つかりませんでした"
                    : "キャンペーンがまだ登録されていません。URLを追加してください。"}
                </p>
              </div>
            ) : (
              filteredAndSortedCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onDelete={handleDeleteCampaign}
                  onEdit={handleEditCampaign}
                />
              ))
            )
          ) : (
            <CalendarView
              campaigns={filteredAndSortedCampaigns}
              onDeleteCampaign={handleDeleteCampaign}
              onEditCampaign={handleEditCampaign}
            />
          )}
        </div>

        {/* 今後の機能案（フッター） */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 className="font-semibold text-lg mb-3 text-gray-900">
            🚀 今後の機能
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                <strong>AI購買アシスタント:</strong>{" "}
                「どこで」「何を」「どの決済手段で」買うべきかをAIと対話しながら最適化
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                <strong>複数キャンペーンの組み合わせ:</strong>{" "}
                複数の割引・ポイント還元を組み合わせて最大限お得に
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                <strong>通知機能:</strong>{" "}
                期限が近づいたキャンペーンやお得度の高いキャンペーンをプッシュ通知
              </span>
            </li>
          </ul>
        </div>
      </div>

      <EditCampaignModal
        campaign={editingCampaign}
        onClose={() => setEditingCampaign(null)}
        onSave={handleSaveCampaign}
      />
    </div>
  );
}