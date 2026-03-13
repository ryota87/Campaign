export interface Campaign {
  id: string;
  url: string;
  title: string;
  company: string;
  summary: string;
  startDate: string;
  expiryDate: string;
  discountRate?: number;
  source: string;
  addedAt: string;
}