# キャンペーン管理アプリ - アーキテクチャドキュメント

## 概要

企業・SNSのキャンペーンURLを送信すると、LLMが内容を要約して一覧管理するWebアプリ。
締め切り順の表示・期限管理・Web Share API経由の共有入力をサポートする。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React 18 + TypeScript + Vite |
| スタイリング | Tailwind CSS |
| アイコン | Lucide React |
| バックエンド | Supabase (PostgreSQL + Auth + Edge Functions) |
| LLM | Google Gemini API（URLコンテンツ要約） |
| デプロイ | Supabase (Edge Functions), Vercel等 (フロント) |

---

## ディレクトリ構造

```
campaign/
├── client/                    # Reactフロントエンド
│   ├── src/
│   │   ├── App.tsx           # メインコンポーネント（認証・ルーティング）
│   │   ├── api/
│   │   │   └── client.ts     # Supabase API クライアント
│   │   ├── components/
│   │   │   ├── Auth.tsx              # ログイン画面
│   │   │   ├── Home.tsx              # キャンペーン一覧（締め切り順）
│   │   │   ├── Header.tsx            # ヘッダー
│   │   │   ├── CampaignCard.tsx      # キャンペーンカード
│   │   │   └── AddCampaignModal.tsx  # URL入力→LLM要約→登録
│   │   └── lib/
│   │       └── supabase.ts   # Supabaseクライアント初期化
│   └── package.json
├── supabase/
│   ├── functions/
│   │   └── api/
│   │       └── index.ts      # Edge Function（全APIエンドポイント）
│   └── migrations/           # DBマイグレーション
├── db_design.sql             # DB設計書
├── AI_RULES.md
└── ARCHITECTURE.md
```

---

## データベース設計

### テーブル

| テーブル | 説明 |
|----------|------|
| `campaigns` | キャンペーン情報（URL、要約、締め切り日等） |

### campaigns テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK |
| user_id | uuid | Supabase Auth user id |
| url | text | 入力URL |
| title | text | LLMが抽出したタイトル |
| summary | text | LLMによる内容要約 |
| deadline | date | 締め切り日（LLM抽出 or ユーザー入力） |
| source_type | text | 'sns' / 'official' / 'other' |
| status | text | 'active' / 'applied' / 'closed' |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

---

## Edge Function API

**エンドポイント**: `POST /functions/v1/api`
**認証**: Supabase Auth JWT

### アクション一覧

| action | 説明 | パラメータ |
|--------|------|-----------|
| `summarize_url` | URLをGeminiで要約して返す | url |
| `add_campaign` | キャンペーン登録 | url, title, summary, deadline?, source_type |
| `update_campaign` | キャンペーン更新 | campaign_id, title?, summary?, deadline?, status? |
| `delete_campaign` | キャンペーン削除 | campaign_id |

---

## 画面構成

### 1. ホーム画面（Home.tsx）
- キャンペーン一覧（締め切り昇順）
- フィルター: すべて / 応募中 / 締め切り済み
- 右下FAB → AddCampaignModal

### 2. キャンペーン追加モーダル（AddCampaignModal.tsx）
- URL入力欄
- 「要約する」ボタン → Edge Function `summarize_url` 呼び出し
- LLM要約結果プレビュー（タイトル・要約・締め切り日）
- 編集後「登録」

---

## URL入力フロー

```
ユーザーがURLを入力 or Web Share APIで受信
    ↓
Edge Function: summarize_url
    ↓
Gemini API: URLのHTMLを取得 → タイトル・要約・締め切り日を抽出
    ↓
フロントに返却 → ユーザーが確認・編集
    ↓
Edge Function: add_campaign → DB保存
```

---

## 環境変数

### client/.env

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### GitHub Secrets（CI/CD用）

| シークレット | 用途 |
|-------------|------|
| `SUPABASE_ACCESS_TOKEN` | Edge Functionデプロイ |
| `SUPABASE_PROJECT_ID` | プロジェクトID |
| `GEMINI_API_KEY` | LLM API（Edge Function用） |

---

## 注意事項

1. **RLS**: campaignsテーブルはuser_idによるRLSで制御
2. **Web Share API**: モバイルのSNS共有から直接URLを受け取る（`navigator.share` / URLパラメータ経由）
3. **Edge Function**: Deno環境。ローカルのTypeScriptチェッカーではエラーが出るが動作に影響なし
4. **LLMコスト**: Gemini 2.0 Flash使用。要約1回あたり数銭以下
