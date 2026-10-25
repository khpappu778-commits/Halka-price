import React from 'react';
import { ShieldCheck, Heart, Mail, Phone, ExternalLink } from 'lucide-react';
import { SiteSettings, AdPlacement } from '../types';
import { AdSlot } from './AdSlot';

interface FooterProps {
  settings: SiteSettings;
  ads: AdPlacement[];
  onOpenPolicy: (type: 'about' | 'contact' | 'affiliate' | 'privacy' | 'terms') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  ads,
  onOpenPolicy,
  onOpenAdmin
}) => {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200">
      {/* Adsterra Footer Placement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdSlot placementKey="footer" ads={ads} />
      </div>

      {/* Affiliate Disclosure Notice Banner */}
      <div className="bg-slate-50 border-y border-slate-200/80 py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-start sm:items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Affiliate Disclosure:</strong> {settings.affiliate_disclosure}
          </p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
                ৳
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Halka<span className="text-red-600">Price</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Low Price, Smart Choice! Discover the best verified discounts and low-price offers from Daraz Bangladesh, updated daily.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              Made with <Heart className="w-3 h-3 text-red-500 inline fill-current" /> for Bangladeshi Shoppers.
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Explore Deals
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-red-600 transition-colors"
                >
                  Featured Offers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-red-600 transition-colors"
                >
                  Browse Categories
                </button>
              </li>
              <li>
                <a
                  href={settings.daraz_store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <span>Daraz Bangladesh Official</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Information & Trust
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onOpenPolicy('about')}
                  className="hover:text-red-600 transition-colors"
                >
                  About Halka Price
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('affiliate')}
                  className="hover:text-red-600 transition-colors font-medium text-slate-700"
                >
                  Affiliate Disclosure Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-red-600 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-red-600 transition-colors"
                >
                  Terms and Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Contact & Social
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{settings.contact_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{settings.contact_phone}</span>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-blue-600 font-semibold"
                >
                  Facebook
                </a>
                <span className="text-slate-300">·</span>
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-emerald-600 font-semibold"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin Link */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Halka Price. All rights reserved. Curated deals from Daraz Bangladesh.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenPolicy('contact')}
              className="hover:text-slate-600 transition-colors"
            >
              Contact Us
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-slate-900 font-medium transition-colors"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
