import React from 'react';
import {
  Package,
  CheckCircle,
  FileEdit,
  Star,
  Clock,
  Image,
  PlusCircle,
  Radio,
  Settings,
  FolderTree,
  ArrowUpRight
} from 'lucide-react';
import { DashboardStats } from '../../types';

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Halka Price Management Portal</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Monitor verified Daraz Bangladesh product offers, configure promotional banner slots, and manage Adsterra advertising code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('add-product')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Deal</span>
          </button>
        </div>
      </div>

      {/* 6 Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigate('manage-products')}
          className="cursor-pointer p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Package className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {stats?.total_products ?? 0}
          </div>
          <div className="text-xs font-medium text-slate-500">Total Products</div>
        </div>

        <div
          onClick={() => onNavigate('manage-products')}
          className="cursor-pointer p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">
            {stats?.published_products ?? 0}
          </div>
          <div className="text-xs font-medium text-slate-500">Published Deals</div>
        </div>

        <div
          onClick={() => onNavigate('manage-products')}
          className="cursor-pointer p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <FileEdit className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {stats?.draft_products ?? 0}
          </div>
          <div className="text-xs font-medium text-slate-500">Draft Deals</div>
        </div>

        <div
          onClick={() => onNavigate('manage-products')}
          className="cursor-pointer p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <Star className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            {stats?.featured_deals ?? 0}
          </div>
          <div className="text-xs font-medium text-slate-500">Featured Deals</div>
        </div>

        <div
          onClick={() => onNavigate('manage-products')}
          className="cursor-pointer p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-600 tabular-nums">
            {stats?.expired_deals ?? 0}
          </div>
          <div className="text-xs font-medium text-slate-500">Expired Deals</div>
        </div>

        <div
          onClick={() => onNavigate('banners')}
          className="cursor-pointer p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Image className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-purple-600 tabular-nums">
            {stats?.active_banners ?? 0}
          </div>
          <div className="text-xs font-medium text-slate-500">Active Banners</div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('add-product')}
          className="cursor-pointer p-5 bg-white rounded-2xl border border-slate-200 hover:border-red-500 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Add New Product Deal</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Publish a new discounted deal with images, calculated savings, and Daraz tracking URL.
          </p>
        </div>

        <div
          onClick={() => onNavigate('ads')}
          className="cursor-pointer p-5 bg-white rounded-2xl border border-slate-200 hover:border-red-500 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Adsterra Ad Placements</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Paste and manage official Adsterra advertising code across 5 designated website slots.
          </p>
        </div>

        <div
          onClick={() => onNavigate('categories')}
          className="cursor-pointer p-5 bg-white rounded-2xl border border-slate-200 hover:border-red-500 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Categories & Reordering</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Create, edit, remove, and reorder product deal categories on the public storefront.
          </p>
        </div>
      </div>
    </div>
  );
};
