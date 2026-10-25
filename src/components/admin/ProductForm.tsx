import React, { useState, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, Plus, Star, Flame, Eye, Image as ImageIcon } from 'lucide-react';
import { Product, Category } from '../../types';
import { api } from '../../services/api';

interface ProductFormProps {
  initialProduct?: Product | null;
  categories: Category[];
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  categories,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [titleBn, setTitleBn] = useState(initialProduct?.title_bn || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [shortDesc, setShortDesc] = useState(initialProduct?.short_description || '');
  const [fullDesc, setFullDesc] = useState(initialProduct?.full_description || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || categories[0]?.id || '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(initialProduct?.original_price || '');
  const [dealPrice, setDealPrice] = useState<number | string>(initialProduct?.deal_price || '');
  const [productSource, setProductSource] = useState(initialProduct?.product_source || 'Daraz Bangladesh');
  const [destinationUrl, setDestinationUrl] = useState(initialProduct?.destination_url || '');
  const [affiliateUrl, setAffiliateUrl] = useState(initialProduct?.affiliate_url || '');
  const [primaryImage, setPrimaryImage] = useState(initialProduct?.primary_image || '');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured || false);
  const [isHotDeal, setIsHotDeal] = useState(initialProduct?.is_hot_deal || false);
  const [status, setStatus] = useState<'published' | 'draft'>(initialProduct?.status || 'published');
  const [expiresAt, setExpiresAt] = useState(initialProduct?.expires_at ? initialProduct.expires_at.split('T')[0] : '');
  const [tags, setTags] = useState(initialProduct?.tags?.join(', ') || '');

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto slug generation if creating new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialProduct) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Live discount calculation
  const orig = Number(originalPrice) || 0;
  const deal = Number(dealPrice) || 0;
  const hasDiscount = orig > deal && orig > 0;
  const discountPercent = hasDiscount ? Math.round(((orig - deal) / orig) * 100) : 0;

  // Load existing gallery images if editing
  useEffect(() => {
    if (initialProduct) {
      api.getProduct(initialProduct.slug || initialProduct.id)
        .then(res => {
          if (res.images && res.images.length > 0) {
            const urls = res.images.map(img => img.image_url);
            setGalleryImages(urls);
          }
        })
        .catch(console.error);
    }
  }, [initialProduct]);

  // Handle image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is larger than the 5MB limit.`);
        }
        const res = await api.uploadImage(file);
        if (!primaryImage) {
          setPrimaryImage(res.url);
        }
        setGalleryImages(prev => Array.from(new Set([...prev, res.url])));
      }
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = (url: string) => {
    setGalleryImages(prev => prev.filter(u => u !== url));
    if (primaryImage === url) {
      const remaining = galleryImages.filter(u => u !== url);
      setPrimaryImage(remaining[0] || '');
    }
  };

  const handleSubmit = async (submitStatus?: 'published' | 'draft') => {
    setError(null);

    if (!title.trim()) {
      setError('Product title is required.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (orig <= 0 || deal <= 0) {
      setError('Please provide valid positive numbers for Original Price and Deal Price.');
      return;
    }
    if (destinationUrl && !/^https?:\/\//i.test(destinationUrl)) {
      setError('Destination URL must start with http:// or https://');
      return;
    }
    if (affiliateUrl && !/^https?:\/\//i.test(affiliateUrl)) {
      setError('Affiliate URL must start with http:// or https://');
      return;
    }

    const payload = {
      title,
      title_bn: titleBn,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      short_description: shortDesc,
      full_description: fullDesc,
      category_id: categoryId,
      original_price: orig,
      deal_price: deal,
      product_source: productSource,
      destination_url: destinationUrl,
      affiliate_url: affiliateUrl || destinationUrl,
      primary_image: primaryImage || galleryImages[0] || '',
      gallery_images: galleryImages,
      is_featured: isFeatured,
      is_hot_deal: isHotDeal,
      status: submitStatus || status,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    setSubmitting(true);
    try {
      let saved: Product;
      if (initialProduct?.id) {
        saved = await api.updateProduct(initialProduct.id, payload);
      } else {
        saved = await api.createProduct(payload);
      }
      onSave(saved);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {initialProduct ? 'Edit Product Deal' : 'Add New Product Deal'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure prices in ৳ BDT, destination links, and photos
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Title (English) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. Aero TWS Wireless Earbuds with LED Display"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bangla Title (Optional)
              </label>
              <input
                type="text"
                value={titleBn}
                onChange={e => setTitleBn(e.target.value)}
                placeholder="বাংলা নাম (যেমন: এরো টিডব্লিউএস এয়ারবাডস)"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="aero-tws-wireless-earbuds"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Original Price (৳ BDT) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={originalPrice}
                onChange={e => setOriginalPrice(e.target.value)}
                placeholder="1850"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-red-600 mb-1">
                Deal / Offer Price (৳ BDT) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={dealPrice}
                onChange={e => setDealPrice(e.target.value)}
                placeholder="890"
                className="w-full px-3 py-2 text-sm bg-white border border-red-300 rounded-lg font-bold text-red-600 tabular-nums focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Calculated Discount
              </label>
              <div className="h-[38px] flex items-center px-3 bg-white border border-slate-200 rounded-lg font-bold text-sm">
                {hasDiscount ? (
                  <span className="text-emerald-600 font-extrabold">
                    {discountPercent}% OFF (Save ৳{(orig - deal).toLocaleString()})
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs font-normal">
                    {orig > 0 && deal >= orig ? 'No discount (Deal ≥ Orig)' : 'Enter prices'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Source / Store Name
              </label>
              <input
                type="text"
                value={productSource}
                onChange={e => setProductSource(e.target.value)}
                placeholder="Daraz Bangladesh"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daraz Product Destination URL *
              </label>
              <input
                type="url"
                required
                value={destinationUrl}
                onChange={e => setDestinationUrl(e.target.value)}
                placeholder="https://www.daraz.com.bd/products/..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Affiliate Tracking URL (Optional, fallback to destination)
              </label>
              <input
                type="url"
                value={affiliateUrl}
                onChange={e => setAffiliateUrl(e.target.value)}
                placeholder="https://www.daraz.com.bd/products/...&aff_sub=halka"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Summary Description
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={e => setShortDesc(e.target.value)}
              placeholder="Crisp 1-2 sentence overview for cards..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Product Description & Specs
            </label>
            <textarea
              rows={4}
              value={fullDesc}
              onChange={e => setFullDesc(e.target.value)}
              placeholder="Detailed specifications, warranty details, and seller highlights..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
        </div>

        {/* Right Col: Media & Settings */}
        <div className="space-y-5">
          {/* Photos Upload & Gallery */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Product Images
              </label>
              <span className="text-[10px] text-slate-400">Up to 5MB each</span>
            </div>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-white transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">
                {uploading ? 'Uploading...' : 'Upload Images'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG, WEBP, GIF</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Direct Image URL input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Or paste Image URL:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="https://..."
                  id="direct-image-url"
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('direct-image-url') as HTMLInputElement;
                    if (input?.value.trim()) {
                      const url = input.value.trim();
                      if (!primaryImage) setPrimaryImage(url);
                      setGalleryImages(prev => Array.from(new Set([...prev, url])));
                      input.value = '';
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Gallery Image Thumbnails */}
            {galleryImages.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Select primary image (starred):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.map((imgUrl, i) => (
                    <div
                      key={i}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 group ${
                        primaryImage === imgUrl ? 'border-red-600' : 'border-slate-200'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(imgUrl)}
                        className={`absolute top-1 left-1 p-1 rounded-full shadow-xs ${
                          primaryImage === imgUrl ? 'bg-red-600 text-white' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                        }`}
                        title="Set as primary"
                      >
                        <Star className="w-3 h-3 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(imgUrl)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 shadow-xs"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toggles & Options */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-700">Display Options</div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Featured Deal (Top Carousel / Spotlight)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isHotDeal}
                onChange={e => setIsHotDeal(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
                Hot Deal Badge
              </span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deal Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="DarazMall, FlashSale, Gadget"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('draft')}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('published')}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            {submitting ? 'Saving...' : initialProduct ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
