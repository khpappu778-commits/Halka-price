import React, { useState, useEffect } from 'react';
import { Radio, Check, AlertCircle, Save, Info, Monitor, Smartphone, Globe, Code } from 'lucide-react';
import { AdPlacement } from '../../types';
import { api } from '../../services/api';

export const AdsterraManager: React.FC = () => {
  const [ads, setAds] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const list = await api.getAds();
      setAds(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load ad slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleUpdateField = (id: string, field: keyof AdPlacement, value: any) => {
    setAds(prev =>
      prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleSaveSlot = async (slot: AdPlacement) => {
    setSavingId(slot.id);
    setMessage(null);
    setError(null);
    try {
      await api.updateAd(slot.id, {
        ad_code: slot.ad_code,
        is_enabled: slot.is_enabled,
        device_target: slot.device_target,
        sort_order: slot.sort_order
      });
      setMessage(`Saved settings for ${slot.placement_name}`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save ad placement');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Radio className="w-5 h-5 text-red-600" />
          <span>Adsterra Advertising Integration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Paste official Adsterra banner and native advertising codes into designated storefront slots
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

      {/* Guide Note */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Adsterra Implementation Instructions:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
          <li>
            Sign in to your <strong>Adsterra Publisher Account</strong> and generate your Banner (728x90, 468x60, 300x250) or Native script tag.
          </li>
          <li>
            Paste the exact <code>&lt;script&gt;</code> or HTML snippet into the corresponding placement box below.
          </li>
          <li>
            Ensure your ad blocker is temporarily paused when previewing test ads on the public website.
          </li>
          <li>
            Each slot executes within an isolated container to ensure security and prevent layout breakage.
          </li>
        </ul>
      </div>

      {/* Placements List */}
      <div className="space-y-6">
        {ads.map(slot => (
          <div
            key={slot.id}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {slot.placement_name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Slot Key: {slot.placement_key}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Device Targeting */}
                <select
                  value={slot.device_target || 'all'}
                  onChange={e => handleUpdateField(slot.id, 'device_target', e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="all">All Devices (Responsive)</option>
                  <option value="desktop">Desktop Only</option>
                  <option value="mobile">Mobile Only</option>
                </select>

                {/* Enabled Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slot.is_enabled}
                    onChange={e => handleUpdateField(slot.id, 'is_enabled', e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300"
                  />
                  <span className={`text-xs font-bold ${slot.is_enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {slot.is_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>

            {/* Ad Code Textarea */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Adsterra Script / HTML Code:</span>
                <span className="text-[10px] text-slate-400">Pastes raw code without altering tracking keys</span>
              </label>
              <textarea
                rows={3}
                value={slot.ad_code}
                onChange={e => handleUpdateField(slot.id, 'ad_code', e.target.value)}
                placeholder="<!-- Paste Adsterra script tag or iframe here -->"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Last updated: {new Date(slot.updated_at).toLocaleDateString()}
              </span>

              <button
                type="button"
                disabled={savingId === slot.id}
                onClick={() => handleSaveSlot(slot)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingId === slot.id ? 'Saving...' : 'Save Placement'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
