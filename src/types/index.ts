export interface Category {
  id: string;
  name: string;
  name_bn?: string;
  slug: string;
  status: 'active' | 'inactive';
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export interface Product {
  id: string;
  title: string;
  title_bn?: string;
  slug: string;
  short_description: string;
  full_description: string;
  category_id: string;
  original_price: number;
  deal_price: number;
  discount_percent: number;
  product_source: string;
  destination_url: string;
  affiliate_url: string;
  primary_image: string;
  is_featured: boolean;
  is_hot_deal: boolean;
  status: 'published' | 'draft';
  is_demo?: boolean;
  expires_at?: string | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface HomepageBanner {
  id: string;
  title: string;
  image_url: string;
  mobile_image_url?: string;
  destination_url: string;
  placement: 'top_header' | 'middle_section';
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface AdPlacement {
  id: string;
  placement_key: 'homepage_top' | 'homepage_middle' | 'homepage_sidebar' | 'product_details' | 'footer';
  placement_name: string;
  ad_code: string;
  is_enabled: boolean;
  sort_order: number;
  device_target?: 'all' | 'desktop' | 'mobile';
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  currency_symbol: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  facebook_url: string;
  daraz_store_url: string;
  affiliate_disclosure: string;
  announcement_bar_text: string;
  announcement_bar_enabled: boolean;
}

export interface DashboardStats {
  total_products: number;
  published_products: number;
  draft_products: number;
  featured_deals: number;
  expired_deals: number;
  active_banners: number;
  categories_count: number;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'superadmin' | 'admin';
  must_change_password: boolean;
}
