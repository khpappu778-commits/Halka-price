import React, { useState } from 'react';
import { Search, Menu, X, Shield, ArrowRight, Tag, Phone } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onOpenAdmin: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSelectCategory,
  onOpenAdmin,
  onOpenAbout,
  onOpenContact,
  isAdminLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Announcement Bar */}
      {settings.announcement_bar_enabled && settings.announcement_bar_text && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 text-white text-xs font-medium py-1.5 px-4 text-center tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span>{settings.announcement_bar_text}</span>
            <span className="hidden sm:inline-block bg-white/20 text-white text-[11px] px-2 py-0.5 rounded font-bold">
              Daraz Verified
            </span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onSelectCategory('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-sm shadow-red-500/20 group-hover:scale-105 transition-transform">
                ৳
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                  Halka<span className="text-red-600">Price</span>
                </span>
                <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase -mt-1 hidden sm:block">
                  Low Price, Smart Choice!
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-2">
            <form onSubmit={onSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search deals on Daraz (e.g. earbuds, blender, smartwatch)..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-900 placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </form>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => {
                onSelectCategory('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </button>
            <button
              onClick={() => {
                onSelectCategory('');
                const el = document.getElementById('deals-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
            >
              All Deals
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('categories-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
            >
              Categories
            </button>
            <button
              onClick={onOpenAbout}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
            >
              About Us
            </button>
            <button
              onClick={onOpenContact}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
            >
              Contact
            </button>
          </nav>

          {/* Zone 3: Actions & Admin */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchMobile(!showSearchMobile)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isAdminLoggedIn
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? 'Dashboard' : 'Admin'}</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Accordion */}
        {showSearchMobile && (
          <div className="lg:hidden py-2 pb-3 border-t border-slate-100">
            <form onSubmit={onSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search deals in Bangladesh..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onSelectCategory('');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => {
                onSelectCategory('');
                setMobileMenuOpen(false);
                document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              All Deals
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              Browse Categories
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              About Halka Price
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              Contact Support
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Bangladesh Currency: ৳ BDT</span>
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-600 font-semibold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Deals</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
