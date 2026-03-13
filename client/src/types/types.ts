export interface Campaign {
  id: string;
  url: string;
  title: string;
  company: string;
  summary: string;
  startDate: string;
  expiryDate: string;
  discountRate?: number;
  discountAmount?: string;
  maxAmount?: string;
  maxUsage?: string;
  source: string;
  addedAt: string;
  user_id?: string;
}