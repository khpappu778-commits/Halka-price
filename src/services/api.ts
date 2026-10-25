import {
  Product,
  Category,
  HomepageBanner,
  AdPlacement,
  SiteSettings,
  DashboardStats,
  AdminUser,
  ProductImage
} from '../types';

const TOKEN_KEY = 'halkaprice_admin_token';

export const api = {
  // Token management
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data as T;
  },

  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const data = await this.request<{ token: string; user: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await this.request('/api/admin/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  },

  async getMe(): Promise<{ user: AdminUser }> {
    return this.request<{ user: AdminUser }>('/api/admin/me');
  },

  async changePassword(current_password: string, new_password: string, confirm_password: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password, confirm_password })
    });
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/admin/stats');
  },

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    status?: string;
    is_featured?: boolean;
    is_hot_deal?: boolean;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.is_featured !== undefined) query.set('is_featured', String(params.is_featured));
    if (params?.is_hot_deal !== undefined) query.set('is_hot_deal', String(params.is_hot_deal));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const qs = query.toString();
    return this.request<{ products: Product[]; total: number }>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  async getAdminProducts(params?: {
    category?: string;
    search?: string;
    status?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.status !== undefined) query.set('status', params.status);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const qs = query.toString();
    return this.request<{ products: Product[]; total: number }>(`/api/admin/products${qs ? `?${qs}` : ''}`);
  },

  async getProduct(slugOrId: string): Promise<{ product: Product; images: ProductImage[]; category?: Category; related: Product[] }> {
    return this.request(`/api/products/${slugOrId}`);
  },

  async createProduct(productData: any): Promise<Product> {
    return this.request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id: string, updates: any): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    return this.request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    });
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/categories/${id}`, {
      method: 'DELETE'
    });
  },

  async reorderCategories(ordered_ids: string[]): Promise<Category[]> {
    return this.request<Category[]>('/api/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ ordered_ids })
    });
  },

  // Banners
  async getBanners(all = false): Promise<HomepageBanner[]> {
    return this.request<HomepageBanner[]>(`/api/banners${all ? '?all=true' : ''}`);
  },

  async createBanner(banner: Partial<HomepageBanner>): Promise<HomepageBanner> {
    return this.request<HomepageBanner>('/api/banners', {
      method: 'POST',
      body: JSON.stringify(banner)
    });
  },

  async updateBanner(id: string, updates: Partial<HomepageBanner>): Promise<HomepageBanner> {
    return this.request<HomepageBanner>(`/api/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteBanner(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/banners/${id}`, {
      method: 'DELETE'
    });
  },

  async reorderBanners(ordered_ids: string[]): Promise<HomepageBanner[]> {
    return this.request<HomepageBanner[]>('/api/banners/reorder', {
      method: 'POST',
      body: JSON.stringify({ ordered_ids })
    });
  },

  // Adsterra Ads
  async getAds(): Promise<AdPlacement[]> {
    return this.request<AdPlacement[]>('/api/ads');
  },

  async updateAd(id: string, updates: Partial<AdPlacement>): Promise<AdPlacement> {
    return this.request<AdPlacement>(`/api/admin/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    return this.request<SiteSettings>('/api/settings');
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    return this.request<SiteSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // Image Upload
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.request<{ url: string; filename: string }>('/api/upload', {
      method: 'POST',
      body: formData
    });
  }
};
