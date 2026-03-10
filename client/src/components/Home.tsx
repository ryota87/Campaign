import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, LogOut } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api, type Campaign } from '../api/client';
import CampaignCard from './CampaignCard';
import AddCampaignModal from './AddCampaignModal';

type Props = { session: Session };

export default function Home({ session }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSignOut = () => supabase.auth.signOut();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">キャンペーン管理</h1>
        <button
          id="sign-out-btn"
          onClick={handleSignOut}
          className="text-gray-500 hover:text-gray-700"
          aria-label="ログアウト"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* キャンペーン一覧 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-center text-gray-400">読み込み中...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-center text-gray-400">キャンペーンがまだありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {campaigns.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onUpdated={fetchCampaigns}
              />
            ))}
          </div>
        )}
      </main>

      {/* キャンペーン追加ボタン */}
      <button
        id="add-campaign-btn"
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg"
        aria-label="キャンペーンを追加"
      >
        <PlusCircle size={24} />
      </button>

      {showAddModal && (
        <AddCampaignModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); fetchCampaigns(); }}
        />
      )}
    </div>
  );
}
