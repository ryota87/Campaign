-- キャンペーン管理アプリ データベース設計

-- 1. 前提・設計方針
-- DB：Supabase（PostgreSQL）
-- 個人利用を想定
-- RLSでuser_idによるアクセス制御

-- 2. テーブル定義

-- 2.1 campaigns（キャンペーン）
CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,              -- Supabase Auth user id

  url text NOT NULL,                  -- 入力URL
  title text NOT NULL,                -- LLMが抽出したタイトル
  summary text NOT NULL,              -- LLMによる内容要約
  deadline date,                      -- 締め切り日（LLM抽出 or ユーザー入力）

  source_type text NOT NULL DEFAULT 'other',
  -- 'sns' | 'official' | 'other'

  status text NOT NULL DEFAULT 'active',
  -- 'active' | 'applied' | 'closed'

  created_at timestamp WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at timestamp WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2.2 updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. RLS（Row Level Security）
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns: 自分のデータのみ参照"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "campaigns: 自分のデータのみ挿入"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "campaigns: 自分のデータのみ更新"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "campaigns: 自分のデータのみ削除"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- 4. インデックス
CREATE INDEX campaigns_user_id_deadline_idx ON campaigns (user_id, deadline ASC NULLS LAST);
CREATE INDEX campaigns_user_id_status_idx ON campaigns (user_id, status);
