import { supabase } from '../lib/supabase';

export type Campaign = {
  id: string;
  user_id: string;
  url: string;
  title: string;
  summary: string;
  deadline: string | null;
  source_type: 'sns' | 'official' | 'other';
  status: 'active' | 'applied' | 'closed';
  created_at: string;
  updated_at: string;
};

type SummarizeResult = {
  title: string;
  summary: string;
  deadline: string | null;
  source_type: 'sns' | 'official' | 'other';
};

async function callApi<T>(action: string, params: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('api', {
    body: { action, ...params },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const api = {
  // URLを要約（LLM）
  summarizeUrl: (url: string) =>
    callApi<SummarizeResult>('summarize_url', { url }),

  // キャンペーン登録
  addCampaign: (params: {
    url: string;
    title: string;
    summary: string;
    deadline?: string | null;
    source_type: 'sns' | 'official' | 'other';
  }) => callApi<{ campaign: Campaign }>('add_campaign', params),

  // キャンペーン更新
  updateCampaign: (params: {
    campaign_id: string;
    title?: string;
    summary?: string;
    deadline?: string | null;
    status?: 'active' | 'applied' | 'closed';
  }) => callApi<{ campaign: Campaign }>('update_campaign', params),

  // キャンペーン削除
  deleteCampaign: (campaignId: string) =>
    callApi<{ success: boolean }>('delete_campaign', { campaign_id: campaignId }),

  // キャンペーン一覧取得
  getCampaigns: async (): Promise<Campaign[]> => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('deadline', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data ?? [];
  },
};
