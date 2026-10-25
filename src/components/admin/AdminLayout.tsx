import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  FolderTree,
  Image as ImageIcon,
  Radio,
  Settings,
  KeyRound,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { AdminUser, Category, Product, DashboardStats, SiteSettings } from '../../types';
import { DashboardOverview } from './DashboardOverview';
import { ProductForm } from './ProductForm';
import { ManageProducts } from './ManageProducts';
import { CategoryManager } from './CategoryManager';
import { BannerManager } from './BannerManager';
import { AdsterraManager } from './AdsterraManager';
import { SettingsManager } from './SettingsManager';
import { ChangePasswordModal } from './ChangePasswordModal';

interface AdminLayoutProps {
  user: AdminUser;
  stats: DashboardStats | null;
  categories: Category[];
  settings: SiteSettings;
  onLogout: () => void;
  onReturnToStore: () => void;
  onRefreshStats: () => void;
  onRefreshCategories: () => void;
  onRefreshSettings: () => void;
  onPreviewProduct: (product: Product) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  stats,
  categories,
  settings,
  onLogout,
  onReturnToStore,
  onRefreshStats,
  onRefreshCategories,
  onRefreshSettings,
  onPreviewProduct
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setActiveTab('add-product');
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setActiveTab('add-product');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-product', label: editingProduct ? 'Edit Product' : 'Add Product', icon: PlusCircle },
    { id: 'manage-products', label: 'Manage Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'banners', label: 'Homepage Banners', icon: ImageIcon },
    { id: 'ads', label: 'Adsterra Ads', icon: Radio },
    { id: 'settings', label: 'Website Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center font-bold text-sm">
              ৳
            </div>
            <span className="font-extrabold tracking-tight text-sm">
              Halka<span className="text-red-500">Price</span> Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium hidden sm:inline-block">
              {user.username}
            </span>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Change Password"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Desktop */}
        <aside
          className={`fixed md:static inset-y-14 left-0 z-20 w-64 bg-white md:bg-transparent p-4 md:p-0 border-r md:border-r-0 border-slate-200 transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-100 mt-2 space-y-1">
              <button
                onClick={() => {
                  setShowPasswordModal(true);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl"
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Change Password</span>
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              onNavigate={tab => {
                if (tab === 'add-product') setEditingProduct(null);
                setActiveTab(tab);
              }}
            />
          )}

          {activeTab === 'add-product' && (
            <ProductForm
              initialProduct={editingProduct}
              categories={categories}
              onSave={() => {
                setEditingProduct(null);
                setActiveTab('manage-products');
                onRefreshStats();
              }}
              onCancel={() => {
                setEditingProduct(null);
                setActiveTab('manage-products');
              }}
            />
          )}

          {activeTab === 'manage-products' && (
            <ManageProducts
              categories={categories}
              onAddNew={handleAddNewProduct}
              onEditProduct={handleEditProduct}
              onPreview={onPreviewProduct}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager
              categories={categories}
              onRefreshCategories={onRefreshCategories}
            />
          )}

          {activeTab === 'banners' && <BannerManager />}

          {activeTab === 'ads' && <AdsterraManager />}

          {activeTab === 'settings' && (
            <SettingsManager
              settings={settings}
              onRefreshSettings={onRefreshSettings}
            />
          )}
        </main>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};
