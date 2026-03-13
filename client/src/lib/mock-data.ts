import type { Campaign } from "../types/types";
import { supabase } from "./supabase";

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

// AIが解析する本物の関数
export async function analyzeCampaignFromUrl(url: string): Promise<Campaign> {
  const { data, error } = await supabase.functions.invoke('api', {
    body: { action: 'summarize_url', url },
  });

  if (error) {
    console.error("Supabase function error:", error);
    throw new Error("AI解析に失敗しました。Edge Functionがデプロイされているか、GEMINI_API_KEYが設定されているか確認してください。");
  }

  if (!data) throw new Error("解析結果が空です。");

  return {
    id: Date.now().toString(),
    url,
    title: data.title || "Unknown",
    company: data.company || "Unknown",
    summary: data.summary || "Unknown",
    startDate: data.start_date || "Unknown",
    expiryDate: data.deadline || "Unknown",
    discountRate: data.discount_rate !== "Unknown" ? Number(data.discount_rate) : undefined,
    discountAmount: data.discount_amount || "Unknown",
    maxAmount: data.max_amount || "Unknown",
    maxUsage: data.max_usage || "Unknown",
    source: data.source_type || "website",
    addedAt: new Date().toISOString().split("T")[0],
  };
}