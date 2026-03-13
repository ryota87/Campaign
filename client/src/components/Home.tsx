import { useState, useMemo, useEffect } from "react";
import { Sparkles, LogOut } from "lucide-react";
import { CampaignCard } from "./campaign-card";
import { AddCampaignForm } from "./add-campaign-form";
import { FilterBar } from "./filter-bar";
import { CalendarView } from "./calendar-view";
import { TabNavigation } from "./tab-navigation";
import { EditCampaignModal } from "./edit-campaign-modal";
import { analyzeCampaignFromUrl } from "../lib/mock-data";
import type { Campaign } from "../types/types";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

type Props = { session: Session };

// Helper to map DB columns to frontend types
const mapFromDb = (dbCampaign: any): Campaign => ({
  id: dbCampaign.id,
  url: dbCampaign.url,
  title: dbCampaign.title,
  company: dbCampaign.company,
  summary: dbCampaign.summary || "",
  startDate: dbCampaign.start_date || "",
  expiryDate: dbCampaign.expiry_date || "",
  discountRate: dbCampaign.discount_rate ? Number(dbCampaign.discount_rate) : undefined,
  discountAmount: dbCampaign.discount_amount || "Unknown",
  maxAmount: dbCampaign.max_amount || "Unknown",
  maxUsage: dbCampaign.max_usage || "Unknown",
  source: dbCampaign.source,
  addedAt: dbCampaign.added_at,
  user_id: dbCampaign.user_id,
});

// Helper to map frontend types to DB columns
const mapToDb = (campaign: Omit<Campaign, 'id' | 'addedAt'>) => ({
  url: campaign.url,
  title: campaign.title,
  company: campaign.company,
  summary: campaign.summary,
  start_date: campaign.startDate || null,
  expiry_date: campaign.expiryDate || null,
  discount_rate: campaign.discountRate || null,
  discount_amount: campaign.discountAmount || "Unknown",
  max_amount: campaign.maxAmount || "Unknown",
  max_usage: campaign.maxUsage || "Unknown",
  source: campaign.source,
});

export default function Home({ session }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"expiry" | "discount" | "added">("expiry");
  const [showExpired, setShowExpired] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      if (data) {
        setCampaigns(data.map(mapFromDb));
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCampaign = async (url: string) => {
    try {
      const analyzedData = await analyzeCampaignFromUrl(url);
      const dbData = {
        ...mapToDb(analyzedData),
        user_id: session.user.id,
      };

      const { data, error } = await supabase
        .from("campaigns")
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCampaigns((prev) => [mapFromDb(data), ...prev]);
      }
    } catch (error) {
      console.error("Error adding campaign:", error);
      alert("キャンペーンの追加に失敗しました。");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting campaign:", error);
      alert("キャンペーンの削除に失敗しました。");
    }
  };

  const handleEditCampaign = (id: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      setEditingCampaign(campaign);
    }
  };

  const handleSaveCampaign = async (updatedCampaign: Campaign) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update(mapToDb(updatedCampaign))
        .eq("id", updatedCampaign.id);

      if (error) throw error;
      setCampaigns((prev) =>
        prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
      );
      setEditingCampaign(null);
    } catch (error) {
      console.error("Error updating campaign:", error);
      alert("キャンペーンの更新に失敗しました。");
    }
  };

  const handleSignOut = () => supabase.auth.signOut();

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns;

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 期限切れフィルター
    if (!showExpired) {
      filtered = filtered.filter((c) => {
        if (!c.expiryDate) return true;
        return new Date(c.expiryDate) >= new Date();
      });
    }

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "expiry": {
          const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          return dateA - dateB;
        }
        case "discount":
          return (b.discountRate || 0) - (a.discountRate || 0);
        case "added":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [campaigns, searchQuery, sortBy, showExpired]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ログイン情報・ヘッダー */}
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Campaign Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session.user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="ログアウト"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
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
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* キャンペーン一覧 */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">読み込み中...</div>
          ) : activeTab === "list" ? (
            filteredAndSortedCampaigns.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                <p className="text-gray-500">
                  {searchQuery
                    ? "検索条件に一致するキャンペーンが見つかりませんでした"
                    : "キャンペーンがまだ登録されていません。URLを追加してください。"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAndSortedCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onDelete={handleDeleteCampaign}
                    onEdit={handleEditCampaign}
                  />
                ))}
              </div>
            )
          ) : (
            <CalendarView
              campaigns={filteredAndSortedCampaigns}
              onDeleteCampaign={handleDeleteCampaign}
              onEditCampaign={handleEditCampaign}
            />
          )}
        </div>
      </div>

      {editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSave={handleSaveCampaign}
        />
      )}
    </div>
  );
}
