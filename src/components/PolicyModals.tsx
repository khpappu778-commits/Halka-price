import React from 'react';
import { X, ShieldAlert, FileText, Phone, Mail, Globe, MessageSquare } from 'lucide-react';
import { SiteSettings } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'about' | 'contact' | 'affiliate' | 'privacy' | 'terms';
  settings: SiteSettings;
}

export const PolicyModals: React.FC<ModalProps> = ({ isOpen, onClose, type, settings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {type === 'about' && 'About Halka Price'}
            {type === 'contact' && 'Contact Halka Price'}
            {type === 'affiliate' && 'Affiliate Disclosure'}
            {type === 'privacy' && 'Privacy Policy'}
            {type === 'terms' && 'Terms and Conditions'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh] text-sm text-slate-600 leading-relaxed space-y-4">
          {type === 'about' && (
            <>
              <p>
                <strong>Halka Price</strong> (<em>Low Price, Smart Choice!</em>) is Bangladesh’s dedicated shopping deals curation platform.
              </p>
              <p>
                Online shopping across marketplaces like Daraz Bangladesh can be overwhelming with thousands of fluctuating prices, flash vouchers, and campaigns. Halka Price tracks and highlights verified price drops, heavy discount offers, and genuine top-rated deals so that smart shoppers across Dhaka, Chittagong, Sylhet, and all over Bangladesh can save money every single day.
              </p>
              <h3 className="font-bold text-slate-900 pt-2">Our Promise:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Real price discounts verified before publishing.</li>
                <li>Direct links to trusted sellers on Daraz Bangladesh.</li>
                <li>Zero extra hidden markup — you pay the exact seller price on Daraz.</li>
                <li>100% free deals resource for Bangladeshi consumers.</li>
              </ul>
            </>
          )}

          {type === 'contact' && (
            <div className="space-y-4">
              <p>
                Have a deal recommendation or a partnership inquiry? Reach out directly to the Halka Price team:
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Mail className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Email Support</div>
                    <div className="font-semibold text-slate-900">{settings.contact_email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">WhatsApp Deals Desk</div>
                    <a
                      href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      {settings.whatsapp_number}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Facebook Community</div>
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      facebook.com/halkaprice.bd
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'affiliate' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-medium">
                {settings.affiliate_disclosure}
              </div>
              <p>
                <strong>Affiliate Relationship:</strong> Halka Price participates in affiliate marketing programs, including authorized marketing partnerships. This means that when you click a "Shop Now" button on our site and make a purchase on Daraz Bangladesh, we may earn an affiliate commission at absolutely no extra cost to you.
              </p>
              <p>
                <strong>Pricing Integrity:</strong> The price you pay on Daraz remains identical whether you visit through Halka Price or go directly to the app or marketplace. All prices, vouchers, and product availability are determined exclusively by Daraz Bangladesh and its participating merchant shops.
              </p>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <p>
                Your privacy is paramount at Halka Price. We do not sell, rent, or trade your personal information.
              </p>
              <h3 className="font-bold text-slate-900 text-sm">Data Collection & Cookies</h3>
              <p>
                We do not collect personal identifying information unless you contact us directly. Our website uses standard web analytics and third-party advertising cookies (including Adsterra) to serve non-intrusive advertisements and analyze website traffic.
              </p>
              <h3 className="font-bold text-slate-900 text-sm">Third-Party Marketplace Links</h3>
              <p>
                When clicking outbound links to Daraz Bangladesh or external sellers, your interactions are governed by Daraz’s terms and privacy policies.
              </p>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <p>
                By using Halka Price, you agree to these Terms and Conditions:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Halka Price is an informational deals aggregator and affiliate platform. We do not sell or stock physical products directly.</li>
                <li>Orders, payments, shipping, warranty, returns, and refunds are handled exclusively by Daraz Bangladesh and the respective sellers.</li>
                <li>Prices and discounts are subject to change by marketplace sellers without prior notice.</li>
                <li>Content, logos, and deal reviews on Halka Price are provided for consumer guidance.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
