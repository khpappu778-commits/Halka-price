import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  role: 'superadmin' | 'admin';
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

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
  product_source: string; // e.g., 'Daraz Bangladesh'
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

export interface DatabaseSchema {
  users: AdminUser[];
  categories: Category[];
  products: Product[];
  product_images: ProductImage[];
  banners: HomepageBanner[];
  ad_placements: AdPlacement[];
  settings: SiteSettings;
  login_attempts: { [ip: string]: { count: number; last_attempt: number; locked_until?: number } };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'halkaprice_db.json');

export class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.data = this.loadOrInit();
  }

  private loadOrInit(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database file, reinitializing', err);
      }
    }
    const initial = this.generateInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    const d = dataToSave || this.data;
    fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2), 'utf-8');
  }

  private generateInitialData(): DatabaseSchema {
    // Generate secure hash for initial setup password: @piash#
    // Salt rounds 10
    const initialHash = bcrypt.hashSync('@piash#', 10);

    const categories: Category[] = [
      { id: 'cat-1', name: 'Electronics', name_bn: 'ইলেকট্রনিক্স', slug: 'electronics', status: 'active', sort_order: 1 },
      { id: 'cat-2', name: 'Mobile Accessories', name_bn: 'মোবাইল এক্সেসরিজ', slug: 'mobile-accessories', status: 'active', sort_order: 2 },
      { id: 'cat-3', name: 'Home & Kitchen', name_bn: 'গৃহস্থালি ও রান্নাঘর', slug: 'home-kitchen', status: 'active', sort_order: 3 },
      { id: 'cat-4', name: 'Fashion & Bags', name_bn: 'ফ্যাশন ও ব্যাগ', slug: 'fashion', status: 'active', sort_order: 4 },
      { id: 'cat-5', name: 'Beauty & Personal Care', name_bn: 'বিউটি ও কেয়ার', slug: 'beauty-personal-care', status: 'active', sort_order: 5 },
      { id: 'cat-6', name: 'Gadgets & Wearables', name_bn: 'গ্যাজেট ও ওয়্যারেবল', slug: 'gadgets', status: 'active', sort_order: 6 },
      { id: 'cat-7', name: 'Lifestyle', name_bn: 'লাইফস্টাইল', slug: 'lifestyle', status: 'active', sort_order: 7 },
      { id: 'cat-8', name: 'Other Deals', name_bn: 'অন্যান্য ডিল', slug: 'other-deals', status: 'active', sort_order: 8 }
    ];

    const products: Product[] = [
      {
        id: 'prod-1',
        title: 'Aero TWS Wireless Earbuds with LED Digital Display Charging Case',
        title_bn: 'এরো টিডব্লিউএস ওয়্যারলেস এয়ারবাডস ডিজিটাল ডিসপ্লে কেস সহ',
        slug: 'aero-tws-wireless-earbuds-led-display',
        short_description: 'Hi-Fi stereo sound, Bluetooth 5.3, ultra-low latency, and 30-hour battery life with power bank case.',
        full_description: 'Upgrade your audio experience with the Aero True Wireless Earbuds. Designed for daily commuters, music lovers, and gamers in Bangladesh. Features active ENC noise reduction, IPX5 water resistance against sweat and rain, ergonomic snug fit, and instant one-step pairing. Compatible with Android, iOS, and PC. Verified budget deal from top-rated Daraz store.',
        category_id: 'cat-2',
        original_price: 1850,
        deal_price: 890,
        discount_percent: Math.round(((1850 - 890) / 1850) * 100),
        product_source: 'Daraz Bangladesh',
        destination_url: 'https://www.daraz.com.bd/products/wireless-bluetooth-earbuds-i123456.html',
        affiliate_url: 'https://www.daraz.com.bd/products/wireless-bluetooth-earbuds-i123456.html?aff_sub=halkaprice',
        primary_image: '/src/assets/images/deal_earbuds_1792909911203.jpg',
        is_featured: true,
        is_hot_deal: true,
        status: 'published',
        is_demo: true,
        expires_at: '2026-12-31T23:59:59Z',
        tags: ['Audio', 'Earbuds', 'DarazMall', 'Gadget'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-2',
        title: 'Velocity X7 Smartwatch with AMOLED Display & Heart Rate Monitor',
        title_bn: 'ভেলোসিটি এক্স৭ স্মার্টওয়াচ অ্যামোলেড ডিসপ্লে ও হেলথ ট্র্যাকার',
        slug: 'velocity-x7-smartwatch-amoled-display',
        short_description: '1.43-inch vivid AMOLED screen, Bluetooth calling, 100+ workout sports modes, IP68 waterproof.',
        full_description: 'The Velocity X7 Smartwatch combines premium aesthetics with comprehensive health tracking. Real-time SpO2, heart rate, sleep tracking, and customizable watch faces. Comes with silicone strap and metallic alloy casing. Super lightweight and 7-day battery standby.',
        category_id: 'cat-6',
        original_price: 3800,
        deal_price: 1999,
        discount_percent: Math.round(((3800 - 1999) / 3800) * 100),
        product_source: 'Daraz Bangladesh',
        destination_url: 'https://www.daraz.com.bd/products/velocity-smartwatch-amoled-i234567.html',
        affiliate_url: 'https://www.daraz.com.bd/products/velocity-smartwatch-amoled-i234567.html?aff_sub=halkaprice',
        primary_image: '/src/assets/images/deal_smartwatch_1792909911488.jpg',
        is_featured: true,
        is_hot_deal: true,
        status: 'published',
        is_demo: true,
        expires_at: '2026-11-30T23:59:59Z',
        tags: ['Smartwatch', 'Fitness', 'DarazDeals', 'Wearable'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-3',
        title: 'Multi-Function Stainless Steel Countertop Blender & Food Grinder',
        title_bn: 'স্টেইনলেস স্টিল মাল্টিফাংশন ব্লেন্ডার ও মসলা গ্রাইন্ডার',
        slug: 'stainless-steel-countertop-blender-grinder',
        short_description: '800W high-speed copper motor, tempered glass jar, 4-speed control with pulse mode.',
        full_description: 'Effortlessly blend fresh juices, smoothies, shakes, and grind dried spices and lentils with this heavy-duty countertop blender. Fitted with 6 sharp surgical-grade stainless steel blades and anti-slip suction feet. A must-have kitchen appliance for Bangladeshi households.',
        category_id: 'cat-3',
        original_price: 4200,
        deal_price: 2450,
        discount_percent: Math.round(((4200 - 2450) / 4200) * 100),
        product_source: 'Daraz Bangladesh',
        destination_url: 'https://www.daraz.com.bd/products/high-speed-blender-grinder-i345678.html',
        affiliate_url: 'https://www.daraz.com.bd/products/high-speed-blender-grinder-i345678.html?aff_sub=halkaprice',
        primary_image: '/src/assets/images/deal_blender_1792909911929.jpg',
        is_featured: true,
        is_hot_deal: false,
        status: 'published',
        is_demo: true,
        expires_at: null,
        tags: ['Home', 'Kitchen', 'DarazFlashSale'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prod-4',
        title: 'Anti-Theft Water-Resistant Commuter Laptop Backpack with USB Port',
        title_bn: 'ওয়াটারপ্রুফ অ্যান্টি-থেফট ল্যাপটপ ব্যাকপ্যাক ইউএসবি চার্জিং পোর্ট সহ',
        slug: 'anti-theft-commuter-laptop-backpack-usb',
        short_description: 'Dedicated 15.6-inch padded laptop compartment, durable oxford fabric, hidden anti-theft pockets.',
        full_description: 'Perfect for university students and office commuters in Dhaka and Chittagong. Features breathable cushioned shoulder straps, luggage strap for travel, external USB charging port passthrough, and dual water bottle side pockets.',
        category_id: 'cat-4',
        original_price: 1950,
        deal_price: 1150,
        discount_percent: Math.round(((1950 - 1150) / 1950) * 100),
        product_source: 'Daraz Bangladesh',
        destination_url: 'https://www.daraz.com.bd/products/commuter-laptop-backpack-i456789.html',
        affiliate_url: 'https://www.daraz.com.bd/products/commuter-laptop-backpack-i456789.html?aff_sub=halkaprice',
        primary_image: '/src/assets/images/deal_backpack_1792909911881.jpg',
        is_featured: false,
        is_hot_deal: true,
        status: 'published',
        is_demo: true,
        expires_at: null,
        tags: ['Fashion', 'Backpack', 'Travel'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const product_images: ProductImage[] = [
      { id: 'img-1', product_id: 'prod-1', image_url: '/src/assets/images/deal_earbuds_1792909911203.jpg', alt_text: 'Aero TWS Earbuds Open Case', sort_order: 1 },
      { id: 'img-2', product_id: 'prod-2', image_url: '/src/assets/images/deal_smartwatch_1792909911488.jpg', alt_text: 'Velocity X7 Smartwatch Face', sort_order: 1 },
      { id: 'img-3', product_id: 'prod-3', image_url: '/src/assets/images/deal_blender_1792909911929.jpg', alt_text: 'Countertop Blender Front Angle', sort_order: 1 },
      { id: 'img-4', product_id: 'prod-4', image_url: '/src/assets/images/deal_backpack_1792909911881.jpg', alt_text: 'Laptop Commuter Backpack Front', sort_order: 1 }
    ];

    const banners: HomepageBanner[] = [
      {
        id: 'ban-1',
        title: 'Daraz Super Deals & Flash Discounts - Halka Price Exclusive',
        image_url: '/src/assets/images/halka_hero_banner_1792909911008.jpg',
        mobile_image_url: '/src/assets/images/halka_hero_banner_1792909911008.jpg',
        destination_url: 'https://www.daraz.com.bd',
        placement: 'top_header',
        start_at: null,
        end_at: null,
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString()
      }
    ];

    const ad_placements: AdPlacement[] = [
      {
        id: 'ad-1',
        placement_key: 'homepage_top',
        placement_name: 'Homepage Top Banner (728x90 / Responsive)',
        ad_code: `<!-- Adsterra 728x90 Top Banner Slot -->
<div class="adsterra-banner flex items-center justify-center p-3 text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
  <span>Adsterra Top Banner Slot (728x90) — Active in Production</span>
</div>`,
        is_enabled: true,
        sort_order: 1,
        device_target: 'all',
        updated_at: new Date().toISOString()
      },
      {
        id: 'ad-2',
        placement_key: 'homepage_middle',
        placement_name: 'Homepage Between Product Sections (468x60 / Responsive)',
        ad_code: `<!-- Adsterra Middle Section Banner Slot -->
<div class="adsterra-banner flex items-center justify-center p-3 text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
  <span>Adsterra In-Feed Product Ad Slot — Configured via Admin</span>
</div>`,
        is_enabled: true,
        sort_order: 2,
        device_target: 'all',
        updated_at: new Date().toISOString()
      },
      {
        id: 'ad-3',
        placement_key: 'homepage_sidebar',
        placement_name: 'Homepage Sidebar Desktop (300x250)',
        ad_code: `<!-- Adsterra 300x250 Medium Rectangle Slot -->
<div class="adsterra-banner flex items-center justify-center p-6 text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-lg min-h-[250px]">
  <span>Adsterra 300x250 Sidebar Slot</span>
</div>`,
        is_enabled: true,
        sort_order: 3,
        device_target: 'desktop',
        updated_at: new Date().toISOString()
      },
      {
        id: 'ad-4',
        placement_key: 'product_details',
        placement_name: 'Product Details Page Sticky/In-Page Ad',
        ad_code: `<!-- Adsterra Product Page Sponsored Widget -->
<div class="adsterra-banner flex items-center justify-center p-4 text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
  <span>Adsterra Product Page Recommendation Banner</span>
</div>`,
        is_enabled: true,
        sort_order: 4,
        device_target: 'all',
        updated_at: new Date().toISOString()
      },
      {
        id: 'ad-5',
        placement_key: 'footer',
        placement_name: 'Footer Leaderboard Banner',
        ad_code: `<!-- Adsterra Footer Ad Banner Slot -->
<div class="adsterra-banner flex items-center justify-center p-3 text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
  <span>Adsterra Footer Banner Slot</span>
</div>`,
        is_enabled: true,
        sort_order: 5,
        device_target: 'all',
        updated_at: new Date().toISOString()
      }
    ];

    const settings: SiteSettings = {
      site_name: 'Halka Price',
      tagline: 'Low Price, Smart Choice!',
      currency_symbol: '৳',
      contact_email: 'support@halkaprice.com',
      contact_phone: '+880 1712-345678',
      whatsapp_number: '+8801712345678',
      facebook_url: 'https://facebook.com/halkaprice.bd',
      daraz_store_url: 'https://www.daraz.com.bd',
      affiliate_disclosure: 'Some links on Halka Price may be affiliate links. We may earn a commission when you purchase through these links, at no additional cost to you. All prices and discounts are based on Daraz Bangladesh listings.',
      announcement_bar_text: '🔥 Halka Price: Lowest Verified Deals in Bangladesh! Save Up to 70% Today!',
      announcement_bar_enabled: true
    };

    return {
      users: [
        {
          id: 'user-admin',
          username: 'admin',
          password_hash: initialHash,
          role: 'superadmin',
          must_change_password: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      categories,
      products,
      product_images,
      banners,
      ad_placements,
      settings,
      login_attempts: {}
    };
  }

  // --- Users & Auth ---
  getUserByUsername(username: string): AdminUser | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserById(id: string): AdminUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  updateUserPassword(id: string, newHash: string): boolean {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return false;
    user.password_hash = newHash;
    user.must_change_password = false;
    user.updated_at = new Date().toISOString();
    this.saveData();
    return true;
  }

  // Rate Limiting on Login Attempts
  recordLoginAttempt(ip: string, success: boolean): { allowed: boolean; remainingLockoutSeconds?: number } {
    const now = Date.now();
    const entry = this.data.login_attempts[ip] || { count: 0, last_attempt: now };

    if (entry.locked_until && entry.locked_until > now) {
      return {
        allowed: false,
        remainingLockoutSeconds: Math.ceil((entry.locked_until - now) / 1000)
      };
    }

    if (success) {
      delete this.data.login_attempts[ip];
      this.saveData();
      return { allowed: true };
    }

    // Reset count if last attempt was over 15 mins ago
    if (now - entry.last_attempt > 15 * 60 * 1000) {
      entry.count = 0;
    }

    entry.count += 1;
    entry.last_attempt = now;

    // Lock for 15 minutes after 5 failed attempts
    if (entry.count >= 5) {
      entry.locked_until = now + 15 * 60 * 1000;
    }

    this.data.login_attempts[ip] = entry;
    this.saveData();

    return {
      allowed: entry.count < 5,
      remainingLockoutSeconds: entry.locked_until ? Math.ceil((entry.locked_until - now) / 1000) : undefined
    };
  }

  // --- Categories ---
  getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.sort_order - b.sort_order);
  }

  getCategory(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id || c.slug === id);
  }

  createCategory(cat: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    this.data.categories.push(newCategory);
    this.saveData();
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.saveData();
    return this.data.categories[idx];
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  reorderCategories(orderedIds: string[]): Category[] {
    orderedIds.forEach((id, index) => {
      const cat = this.data.categories.find(c => c.id === id);
      if (cat) cat.sort_order = index + 1;
    });
    this.saveData();
    return this.getCategories();
  }

  // --- Products ---
  getProducts(params?: {
    category_id?: string;
    search?: string;
    status?: string;
    is_featured?: boolean;
    is_hot_deal?: boolean;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'discount_desc';
    limit?: number;
    offset?: number;
  }): { products: Product[]; total: number } {
    let list = [...this.data.products];

    if (params?.status) {
      list = list.filter(p => p.status === params.status);
    }
    if (params?.category_id) {
      // Find category by slug or id
      const cat = this.getCategory(params.category_id);
      const targetId = cat ? cat.id : params.category_id;
      list = list.filter(p => p.category_id === targetId);
    }
    if (params?.is_featured !== undefined) {
      list = list.filter(p => p.is_featured === params.is_featured);
    }
    if (params?.is_hot_deal !== undefined) {
      list = list.filter(p => p.is_hot_deal === params.is_hot_deal);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.title_bn && p.title_bn.toLowerCase().includes(q)) ||
        p.short_description.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sorting
    switch (params?.sort) {
      case 'price_asc':
        list.sort((a, b) => a.deal_price - b.deal_price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.deal_price - a.deal_price);
        break;
      case 'discount_desc':
        list.sort((a, b) => b.discount_percent - a.discount_percent);
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    const total = list.length;
    if (params?.offset !== undefined && params?.limit !== undefined) {
      list = list.slice(params.offset, params.offset + params.limit);
    } else if (params?.limit !== undefined) {
      list = list.slice(0, params.limit);
    }

    return { products: list, total };
  }

  getProductByIdOrSlug(idOrSlug: string): { product: Product; images: ProductImage[]; category?: Category } | null {
    const prod = this.data.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
    if (!prod) return null;
    const images = this.data.product_images
      .filter(img => img.product_id === prod.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const category = this.data.categories.find(c => c.id === prod.category_id);
    return { product: prod, images, category };
  }

  createProduct(data: Omit<Product, 'id' | 'discount_percent' | 'created_at' | 'updated_at'> & { gallery_images?: string[] }): Product {
    const orig = Number(data.original_price) || 0;
    const deal = Number(data.deal_price) || 0;
    const discount = orig > deal && orig > 0 ? Math.round(((orig - deal) / orig) * 100) : 0;
    const id = `prod-${Date.now()}`;

    const newProd: Product = {
      ...data,
      id,
      original_price: orig,
      deal_price: deal,
      discount_percent: discount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.products.unshift(newProd);

    // Save primary image into product images
    if (newProd.primary_image) {
      this.data.product_images.push({
        id: `img-${Date.now()}-0`,
        product_id: id,
        image_url: newProd.primary_image,
        alt_text: newProd.title,
        sort_order: 1
      });
    }

    // Save gallery images if provided
    if (data.gallery_images && Array.isArray(data.gallery_images)) {
      data.gallery_images.forEach((imgUrl, idx) => {
        if (imgUrl && imgUrl !== newProd.primary_image) {
          this.data.product_images.push({
            id: `img-${Date.now()}-${idx + 1}`,
            product_id: id,
            image_url: imgUrl,
            alt_text: `${newProd.title} gallery ${idx + 1}`,
            sort_order: idx + 2
          });
        }
      });
    }

    this.saveData();
    return newProd;
  }

  updateProduct(id: string, updates: Partial<Product> & { gallery_images?: string[] }): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const current = this.data.products[idx];
    const orig = updates.original_price !== undefined ? Number(updates.original_price) : current.original_price;
    const deal = updates.deal_price !== undefined ? Number(updates.deal_price) : current.deal_price;
    const discount = orig > deal && orig > 0 ? Math.round(((orig - deal) / orig) * 100) : 0;

    this.data.products[idx] = {
      ...current,
      ...updates,
      original_price: orig,
      deal_price: deal,
      discount_percent: discount,
      updated_at: new Date().toISOString()
    };

    // If gallery_images provided, update product images
    if (updates.gallery_images) {
      this.data.product_images = this.data.product_images.filter(img => img.product_id !== id);
      const allImgs = [this.data.products[idx].primary_image, ...updates.gallery_images.filter(u => u !== this.data.products[idx].primary_image)];
      allImgs.forEach((url, i) => {
        if (url) {
          this.data.product_images.push({
            id: `img-${Date.now()}-${i}`,
            product_id: id,
            image_url: url,
            alt_text: `${this.data.products[idx].title} photo ${i + 1}`,
            sort_order: i + 1
          });
        }
      });
    }

    this.saveData();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.data.product_images = this.data.product_images.filter(img => img.product_id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Banners ---
  getBanners(): HomepageBanner[] {
    return [...this.data.banners].sort((a, b) => a.sort_order - b.sort_order);
  }

  createBanner(banner: Omit<HomepageBanner, 'id' | 'created_at'>): HomepageBanner {
    const newBanner: HomepageBanner = {
      ...banner,
      id: `ban-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.data.banners.push(newBanner);
    this.saveData();
    return newBanner;
  }

  updateBanner(id: string, updates: Partial<HomepageBanner>): HomepageBanner | null {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
    this.saveData();
    return this.data.banners[idx];
  }

  deleteBanner(id: string): boolean {
    const initialLen = this.data.banners.length;
    this.data.banners = this.data.banners.filter(b => b.id !== id);
    if (this.data.banners.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  reorderBanners(orderedIds: string[]): HomepageBanner[] {
    orderedIds.forEach((id, index) => {
      const banner = this.data.banners.find(b => b.id === id);
      if (banner) banner.sort_order = index + 1;
    });
    this.saveData();
    return this.getBanners();
  }

  // --- Ad Placements ---
  getAdPlacements(): AdPlacement[] {
    return [...this.data.ad_placements].sort((a, b) => a.sort_order - b.sort_order);
  }

  updateAdPlacement(id: string, updates: Partial<AdPlacement>): AdPlacement | null {
    const idx = this.data.ad_placements.findIndex(a => a.id === id || a.placement_key === id);
    if (idx === -1) return null;
    this.data.ad_placements[idx] = {
      ...this.data.ad_placements[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveData();
    return this.data.ad_placements[idx];
  }

  createAdPlacement(ad: Omit<AdPlacement, 'id' | 'updated_at'>): AdPlacement {
    const newAd: AdPlacement = {
      ...ad,
      id: `ad-${Date.now()}`,
      updated_at: new Date().toISOString()
    };
    this.data.ad_placements.push(newAd);
    this.saveData();
    return newAd;
  }

  // --- Settings ---
  getSettings(): SiteSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  // --- Dashboard Stats ---
  getDashboardStats() {
    const now = new Date().toISOString();
    const total_products = this.data.products.length;
    const published_products = this.data.products.filter(p => p.status === 'published').length;
    const draft_products = this.data.products.filter(p => p.status === 'draft').length;
    const featured_deals = this.data.products.filter(p => p.is_featured).length;
    const expired_deals = this.data.products.filter(p => p.expires_at && p.expires_at < now).length;
    const active_banners = this.data.banners.filter(b => b.is_active).length;
    const categories_count = this.data.categories.length;

    return {
      total_products,
      published_products,
      draft_products,
      featured_deals,
      expired_deals,
      active_banners,
      categories_count
    };
  }
}

export const db = new Database();
