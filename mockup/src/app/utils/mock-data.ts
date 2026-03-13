import type { Campaign } from "../types";

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    url: "https://example.com/campaign1",
    title: "春の大感謝セール",
    company: "イオン",
    summary: "3月15日まで、対象商品が最大50%OFF。食品、日用品、衣料品など幅広いカテゴリーで割引実施中。イオンカード会員はさらに5%OFF。",
    startDate: "2026-03-01",
    expiryDate: "2026-03-15",
    discountRate: 50,
    source: "twitter",
    addedAt: "2026-03-08",
  },
  {
    id: "2",
    url: "https://example.com/campaign2",
    title: "PayPay祭 全額還元チャンス",
    company: "PayPay",
    summary: "3月10日まで、対象店舗でのPayPay決済で最大20%還元。抽選で全額還元も当たる。1,000円以上の決済が対象。",
    startDate: "2026-03-05",
    expiryDate: "2026-03-10",
    discountRate: 20,
    source: "x",
    addedAt: "2026-03-05",
  },
  {
    id: "3",
    url: "https://example.com/campaign3",
    title: "楽天スーパーSALE",
    company: "楽天市場",
    summary: "3月20日まで、半額商品やポイント最大44倍。お買い物マラソンと併用可能。楽天カード利用でさらにポイントアップ。",
    startDate: "2026-03-04",
    expiryDate: "2026-03-20",
    discountRate: 44,
    source: "website",
    addedAt: "2026-03-07",
  },
  {
    id: "4",
    url: "https://example.com/campaign4",
    title: "ファミマ限定 お菓子5点で500円",
    company: "ファミリーマート",
    summary: "対象のお菓子5点を購入すると500円で購入可能。通常700円相当の商品をお得にゲット。ファミペイ払いでさらに50ポイント還元。",
    startDate: "2026-03-09",
    expiryDate: "2026-03-12",
    discountRate: 28,
    source: "twitter",
    addedAt: "2026-03-08",
  },
  {
    id: "5",
    url: "https://example.com/campaign5",
    title: "Amazon新生活セール",
    company: "Amazon",
    summary: "3月25日まで、家電・家具・日用品が特別価格。プライム会員はさらに先行タイムセール参加可能。最大80%OFFの商品も。",
    startDate: "2026-03-10",
    expiryDate: "2026-03-25",
    discountRate: 80,
    source: "website",
    addedAt: "2026-03-06",
  },
  {
    id: "6",
    url: "https://example.com/campaign6",
    title: "セブン-イレブン コーヒー半額",
    company: "セブン-イレブン",
    summary: "3月9日限定で、セブンカフェのコーヒー全サイズ半額。朝6時から夜23時まで。1人3杯まで購入可能。",
    startDate: "2026-03-09",
    expiryDate: "2026-03-09",
    discountRate: 50,
    source: "twitter",
    addedAt: "2026-03-08",
  },
];

// AIが解析する想定のモック関数
export async function analyzeCampaignFromUrl(url: string): Promise<Campaign> {
  // 実際にはここでAPIを呼び出してAIに解析させる
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // モックデータを返す
  const mockData: Campaign = {
    id: Date.now().toString(),
    url,
    title: "新規キャンペーン",
    company: "サンプル企業",
    summary: "このキャンペーンはAIによって自動的に解析され、要約されます。期限、割引率、対象商品などの情報が抽出されます。",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    discountRate: 30,
    source: url.includes("twitter.com") || url.includes("x.com") ? "x" : "website",
    addedAt: new Date().toISOString().split("T")[0],
  };

  return mockData;
}