// Data source type for switching between Supabase and mock data
export type DataSource = 'mock' | 'supabase';

// Plan types
export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
}

// PayFast response types
export interface PayFastRequest {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last?: string;
  email_address: string;
  m_payment_id: string;
  amount: number;
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: number;
  custom_int2?: number;
  custom_int3?: number;
  custom_int4?: number;
  custom_int5?: number;
  signature: string;
}

export interface PayFastNotification {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  item_description: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  name_first: string;
  name_last?: string;
  email_address: string;
  merchant_id: string;
  signature: string;
}

// Content-related types for frontend
export interface ContentItem {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  trailerUrl: string;
  releaseYear: number;
  duration?: number;
  isPremium: boolean;
  contentType?: 'movie' | 'series' | 'music_video' | 'trailer' | 'short_film';
  displayPriority?: number;
  vimeoId?: string;
  rating?: string;
  categoryId: number;
  category?: string;
  progress?: number;
}

export interface CategoryItem {
  id: number;
  name: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface ContentSection {
  title: string;
  viewAllLink: string;
  items: ContentItem[];
}
