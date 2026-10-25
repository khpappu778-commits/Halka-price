import React, { useState, useEffect } from 'react';
import {
  Flame,
  Star,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdSlot } from './components/AdSlot';
import { Footer } from './components/Footer';
import { PolicyModals } from './components/PolicyModals';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { api } from './services/api';
import { Product, Category, HomepageBanner, AdPlacement, SiteSettings, AdminUser, DashboardStats } from './types';

export default function App() {
  // Storefront Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [ads, setAds] = useState<AdPlacement[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Halka Price',
    tagline: 'Low Price, Smart Choice!',
    currency_symbol: '৳',
    contact_email: 'support@halkaprice.com',
    contact_phone: '+880 1712-345678',
    whatsapp_number: '+8801712345678',
    facebook_url: 'https://facebook.com/halkaprice.bd',
    daraz_store_url: 'https://www.daraz.com.bd',
    affiliate_disclosure: 'Some links on Halka Price may be affiliate links. We may earn a commission when you purchase through these links, at no additional cost to you.',
    announcement_bar_text: '🔥 Halka Price: Lowest Verified Deals in Bangladesh! Save Up to 70% Today!',
    announcement_bar_enabled: true
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'hot'>('all');
  const [loading, setLoading] = useState(true);

  // Modals & Navigation
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [policyModal, setPolicyModal] = useState<'about' | 'contact' | 'affiliate' | 'privacy' | 'terms' | null>(null);

  // Admin routing
  const [adminMode, setAdminMode] = useState<'none' | 'login' | 'dashboard'>('none');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Initial load
  const loadInitialData = async () => {
    try {
      const [catsRes, bansRes, adsRes, setsRes] = await Promise.all([
        api.getCategories(),
        api.getBanners(false),
        api.getAds(),
        api.getSettings()
      ]);
      setCategories(catsRes);
      setBanners(bansRes);
      setAds(adsRes);
      setSettings(setsRes);
    } catch (err) {
      console.error('Failed to load site assets', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        category: selectedCategory,
        search: searchQuery,
        status: 'published',
        is_featured: filterType === 'featured' ? true : undefined,
        is_hot_deal: filterType === 'hot' ? true : undefined,
        sort: sortBy
      });
      setProducts(res.products);
    } catch (err) {
      console.error('Failed to load deals', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const s = await api.getDashboardStats();
      setStats(s);
    } catch (err) {
      console.error('Could not load stats', err);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Check existing auth token
    if (api.isAuthenticated()) {
      api.getMe()
        .then(res => {
          setCurrentUser(res.user);
        })
        .catch(() => {
          api.clearToken();
        });
    }

    // Check deep link hash e.g. #deal-slug
    const hash = window.location.hash;
    if (hash && hash.startsWith('#deal-')) {
      const targetSlug = hash.replace('#deal-', '');
      api.getProduct(targetSlug).then(res => {
        setSelectedProduct(res.product);
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery, sortBy, filterType]);

  useEffect(() => {
    if (adminMode === 'dashboard') {
      loadStats();
    }
  }, [adminMode]);

  // Derived deals for curated sections
  const featuredDeals = products.filter(p => p.is_featured);
  const hotDeals = products.filter(p => p.is_hot_deal);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Admin actions
  const handleOpenAdmin = () => {
    if (currentUser) {
      setAdminMode('dashboard');
    } else {
      setAdminMode('login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setAdminMode('dashboard');
    loadStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setAdminMode('none');
  };

  // If in Admin Dashboard view
  if (adminMode === 'dashboard' && currentUser) {
    return (
      <AdminLayout
        user={currentUser}
        stats={stats}
        categories={categories}
        settings={settings}
        onLogout={handleAdminLogout}
        onReturnToStore={() => setAdminMode('none')}
        onRefreshStats={loadStats}
        onRefreshCategories={loadInitialData}
        onRefreshSettings={loadInitialData}
        onPreviewProduct={prod => setSelectedProduct(prod)}
      />
    );
  }

  // If in Admin Login view
  if (adminMode === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Header
          settings={settings}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenAdmin={handleOpenAdmin}
          onOpenAbout={() => setPolicyModal('about')}
          onOpenContact={() => setPolicyModal('contact')}
          isAdminLoggedIn={!!currentUser}
        />
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onCancel={() => setAdminMode('none')}
        />
        <Footer
          settings={settings}
          ads={ads}
          onOpenPolicy={type => setPolicyModal(type)}
          onOpenAdmin={handleOpenAdmin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Storefront Header */}
      <Header
        settings={settings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenAdmin={handleOpenAdmin}
        onOpenAbout={() => setPolicyModal('about')}
        onOpenContact={() => setPolicyModal('contact')}
        isAdminLoggedIn={!!currentUser}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Adsterra Top Slot */}
        <AdSlot placementKey="homepage_top" ads={ads} className="mt-4" />

        {/* Hero Banner & Categories Strip */}
        <HeroBanner
          banners={banners}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={catSlug => setSelectedCategory(catSlug)}
        />

        {/* Featured Deals Carousel / Grid */}
        {!selectedCategory && !searchQuery && featuredDeals.length > 0 && (
          <section className="mt-6 mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-red-600 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Featured Handpicked Deals
                  </h2>
                  <p className="text-xs text-slate-500">
                    Editor-tested discount offers with maximum savings on Daraz
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredDeals.slice(0, 4).map(product => {
                const cat = categories.find(c => c.id === product.category_id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    category={cat}
                    onViewDetails={setSelectedProduct}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Adsterra Middle Slot */}
        <AdSlot placementKey="homepage_middle" ads={ads} className="my-6" />

        {/* Popular / Hot Deals Section */}
        {!selectedCategory && !searchQuery && hotDeals.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4 fill-orange-600 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Trending Hot Deals
                  </h2>
                  <p className="text-xs text-slate-500">
                    High demand price cuts selling fast in Bangladesh
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hotDeals.slice(0, 4).map(product => {
                const cat = categories.find(c => c.id === product.category_id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    category={cat}
                    onViewDetails={setSelectedProduct}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* All Deals Catalog Section with Filters & Sidebar */}
        <section id="deals-section" className="mt-8 mb-16 scroll-mt-20">
          {/* Section Heading & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{selectedCategory ? `${categories.find(c => c.slug === selectedCategory || c.id === selectedCategory)?.name || 'Category'} Deals` : 'Browse All Deals'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full tabular-nums">
                  {products.length} {products.length === 1 ? 'deal' : 'deals'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click "Shop Now" on any product to open its original Daraz seller page
              </p>
            </div>

            {/* Filter Buttons & Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Switcher */}
              <div className="flex items-center p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('featured')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterType === 'featured' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => setFilterType('hot')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterType === 'hot' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hot
                </button>
              </div>

              {/* Sorting Select */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-2xs appearance-none"
                >
                  <option value="newest">Sort: Newest Added</option>
                  <option value="discount_desc">Highest Discount %</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Catalog Layout with Desktop Sidebar Slot */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Main Product Cards Grid (3 cols on desktop) */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-3"
                    >
                      <div className="aspect-[4/3] bg-slate-200 rounded-lg" />
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-8 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                  <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800 text-sm">No deals found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try clearing your search query or selecting a different category to view available offers.
                  </p>
                  {(selectedCategory || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSearchQuery('');
                      }}
                      className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(product => {
                    const cat = categories.find(c => c.id === product.category_id);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        category={cat}
                        onViewDetails={setSelectedProduct}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Sidebar with Adsterra Slot & Shopping Tips */}
            <aside className="hidden lg:block space-y-4">
              {/* Adsterra 300x250 Sidebar Slot */}
              <AdSlot placementKey="homepage_sidebar" ads={ads} />

              {/* Verified Shopping Tips Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>Daraz BD Shopping Tips</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">1.</span>
                    <span>Always check store ratings (&gt;85%) and positive customer reviews.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">2.</span>
                    <span>Look for DarazMall badges for official warranty coverage in Bangladesh.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">3.</span>
                    <span>Collect Daraz collection vouchers at checkout for extra savings on ৳ BDT.</span>
                  </li>
                </ul>
              </div>

              {/* Categories list in sidebar */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-xs font-bold text-slate-900 block mb-2">
                  All Categories
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === '' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="tabular-nums text-slate-400">({products.length})</span>
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug || c.id)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === c.slug || selectedCategory === c.id
                          ? 'bg-red-50 text-red-600 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {/* Storefront Footer */}
      <Footer
        settings={settings}
        ads={ads}
        onOpenPolicy={type => setPolicyModal(type)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Product Details Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          if (window.location.hash.startsWith('#deal-')) {
            history.pushState(null, '', window.location.pathname);
          }
        }}
        categories={categories}
        ads={ads}
        onSelectProduct={setSelectedProduct}
      />

      {/* Trust & Policy Dialogs */}
      <PolicyModals
        isOpen={!!policyModal}
        onClose={() => setPolicyModal(null)}
        type={policyModal || 'about'}
        settings={settings}
      />
    </div>
  );
}
