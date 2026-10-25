import React, { useState } from 'react';
import { Settings, Save, Check, AlertCircle } from 'lucide-react';
import { SiteSettings } from '../../types';
import { api } from '../../services/api';

interface SettingsManagerProps {
  settings: SiteSettings;
  onRefreshSettings: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onRefreshSettings
}) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await api.updateSettings(formData);
      setMessage('Website settings saved successfully!');
      onRefreshSettings();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-600" />
          <span>Website & Affiliate Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Update brand copy, contact details, social links, and top announcement banner
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Platform Name
            </label>
            <input
              type="text"
              required
              value={formData.site_name}
              onChange={e => handleChange('site_name', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              required
              value={formData.tagline}
              onChange={e => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Top Announcement Notification Bar
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcement_bar_enabled}
                onChange={e => handleChange('announcement_bar_enabled', e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700">Display Bar</span>
            </label>
          </div>
          <input
            type="text"
            value={formData.announcement_bar_text}
            onChange={e => handleChange('announcement_bar_text', e.target.value)}
            placeholder="Banner announcement message..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
          />
        </div>

        {/* Affiliate Disclosure */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mandatory Affiliate Disclosure Notice
          </label>
          <textarea
            rows={3}
            value={formData.affiliate_disclosure}
            onChange={e => handleChange('affiliate_disclosure', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          />
        </div>

        {/* Contact & Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={e => handleChange('contact_email', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Hotline Number
            </label>
            <input
              type="text"
              value={formData.whatsapp_number}
              onChange={e => handleChange('whatsapp_number', e.target.value)}
              placeholder="+880 1712-345678"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Facebook Page Link
            </label>
            <input
              type="url"
              value={formData.facebook_url}
              onChange={e => handleChange('facebook_url', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daraz Storefront / Destination Link
            </label>
            <input
              type="url"
              value={formData.daraz_store_url}
              onChange={e => handleChange('daraz_store_url', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Website Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
