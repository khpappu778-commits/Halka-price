import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, ExternalLink, Trash2, Check, X, Upload, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { HomepageBanner } from '../../types';
import { api } from '../../services/api';

export const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomepageBanner | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [placement, setPlacement] = useState<'top_header' | 'middle_section'>('top_header');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const list = await api.getBanners(true); // get all including inactive
      setBanners(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const startAdd = () => {
    setEditingBanner(null);
    setTitle('');
    setImageUrl('');
    setMobileImageUrl('');
    setDestinationUrl('');
    setPlacement('top_header');
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setIsAdding(true);
  };

  const startEdit = (b: HomepageBanner) => {
    setIsAdding(false);
    setEditingBanner(b);
    setTitle(b.title);
    setImageUrl(b.image_url);
    setMobileImageUrl(b.mobile_image_url || '');
    setDestinationUrl(b.destination_url);
    setPlacement(b.placement);
    setIsActive(b.is_active);
    setStartDate(b.start_at ? b.start_at.split('T')[0] : '');
    setEndDate(b.end_at ? b.end_at.split('T')[0] : '');
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingBanner(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      if (isMobile) {
        setMobileImageUrl(res.url);
      } else {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert('Title and banner image are required.');
      return;
    }

    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, {
          title,
          image_url: imageUrl,
          mobile_image_url: mobileImageUrl || imageUrl,
          destination_url: destinationUrl,
          placement,
          is_active: isActive,
          start_at: startDate ? new Date(startDate).toISOString() : null,
          end_at: endDate ? new Date(endDate).toISOString() : null
        });
        setMessage('Banner updated');
      } else {
        await api.createBanner({
          title,
          image_url: imageUrl,
          mobile_image_url: mobileImageUrl || imageUrl,
          destination_url: destinationUrl,
          placement,
          is_active: isActive,
          sort_order: banners.length + 1,
          start_at: startDate ? new Date(startDate).toISOString() : null,
          end_at: endDate ? new Date(endDate).toISOString() : null
        });
        setMessage('Banner created');
      }
      cancelForm();
      fetchBanners();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await api.deleteBanner(id);
      fetchBanners();
      setMessage('Banner deleted');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete banner');
    }
  };

  const handleToggleActive = async (banner: HomepageBanner) => {
    try {
      await api.updateBanner(banner.id, { is_active: !banner.is_active });
      setBanners(prev =>
        prev.map(b => (b.id === banner.id ? { ...b, is_active: !banner.is_active } : b))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= banners.length) return;

    const list = [...banners];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    const orderedIds = list.map(b => b.id);
    try {
      await api.reorderBanners(orderedIds);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-600" />
            <span>Homepage Promotional Banners</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure desktop and mobile banner creatives, schedules, and destination links
          </p>
        </div>

        {!isAdding && !editingBanner && (
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Add / Edit Form */}
      {(isAdding || editingBanner) && (
        <form onSubmit={handleSave} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              {editingBanner ? `Edit Banner: ${editingBanner.title}` : 'Add New Promotional Banner'}
            </span>
            <button
              type="button"
              onClick={cancelForm}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Banner Title / Campaign Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Daraz Super Deals Weekend Fest"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Link URL (Daraz or Affiliate)
              </label>
              <input
                type="url"
                value={destinationUrl}
                onChange={e => setDestinationUrl(e.target.value)}
                placeholder="https://www.daraz.com.bd/..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Image Upload Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Desktop Banner Image (16:9 or 21:9) *
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://... or upload below"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <label className="flex items-center justify-center gap-1.5 p-2 bg-white border border-dashed border-slate-300 hover:border-red-500 rounded-lg cursor-pointer text-xs font-medium text-slate-600 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>{uploading ? 'Uploading...' : 'Upload Desktop File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Banner Image (Optional, defaults to desktop)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={mobileImageUrl}
                  onChange={e => setMobileImageUrl(e.target.value)}
                  placeholder="https://... or upload below"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <label className="flex items-center justify-center gap-1.5 p-2 bg-white border border-dashed border-slate-300 hover:border-red-500 rounded-lg cursor-pointer text-xs font-medium text-slate-600 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>{uploading ? 'Uploading...' : 'Upload Mobile File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Schedule & Placement */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Placement Area
              </label>
              <select
                value={placement}
                onChange={e => setPlacement(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="top_header">Homepage Top Showcase</option>
                <option value="middle_section">Between Product Sections</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-700">
              Active / Visible on Storefront
            </span>
          </label>

          {/* Preview snippet if imageUrl exists */}
          {imageUrl && (
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Live Banner Preview:
              </span>
              <div className="aspect-[21/9] max-h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={cancelForm}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
            >
              {editingBanner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      )}

      {/* Banners List */}
      <div className="space-y-3">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-center text-xs font-mono font-bold text-slate-400">
                #{idx + 1}
              </span>
              <img
                src={b.image_url}
                alt=""
                className="w-20 h-10 object-cover rounded-md bg-slate-200 border border-slate-300 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-xs truncate max-w-xs sm:max-w-md">
                  {b.title}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="capitalize">{b.placement.replace('_', ' ')}</span>
                  <span>·</span>
                  <a
                    href={b.destination_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-600 hover:underline flex items-center gap-0.5 truncate max-w-[200px]"
                  >
                    <span>{b.destination_url || 'No URL'}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => handleToggleActive(b)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  b.is_active
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {b.is_active ? 'Active' : 'Disabled'}
              </button>

              <button
                disabled={idx === 0}
                onClick={() => handleMove(idx, 'up')}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={idx === banners.length - 1}
                onClick={() => handleMove(idx, 'down')}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => startEdit(b)}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
