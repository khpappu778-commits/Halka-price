import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Share2, Check, Clock, Flame, Shield, ArrowLeft, Tag, Star } from 'lucide-react';
import { Product, ProductImage, Category, AdPlacement } from '../types';
import { api } from '../services/api';
import { AdSlot } from './AdSlot';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  categories: Category[];
  ads: AdPlacement[];
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  categories,
  ads,
  onSelectProduct
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSelectedImage(product.primary_image);
    setLoading(true);

    api.getProduct(product.slug || product.id)
      .then(res => {
        setImages(res.images || []);
        setRelated(res.related || []);
        if (res.product.primary_image) {
          setSelectedImage(res.product.primary_image);
        }
      })
      .catch(err => {
        console.error('Failed to load product details', err);
      })
      .finally(() => setLoading(false));
  }, [product?.id, product?.slug]);

  if (!product) return null;

  const category = categories.find(c => c.id === product.category_id);
  const orig = Number(product.original_price) || 0;
  const deal = Number(product.deal_price) || 0;
  const hasDiscount = orig > deal && orig > 0;
  const discountPercent = hasDiscount ? Math.round(((orig - deal) / orig) * 100) : 0;
  const targetUrl = product.affiliate_url || product.destination_url;
  const productShareUrl = `${window.location.origin}/#deal-${product.slug || product.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productShareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    const text = `Check out this deal on Halka Price: ${product.title} for only ৳${deal} (Save ${discountPercent}%)! ${productShareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleShopNow = () => {
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isExpired = product.expires_at ? new Date(product.expires_at) < new Date() : false;

  // Gather all images (primary + gallery)
  const allImages = Array.from(new Set([product.primary_image, ...images.map(img => img.image_url)])).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header Controls */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={onClose}
              className="flex items-center gap-1 font-semibold text-slate-700 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Deals</span>
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-red-600 font-medium">{category?.name || 'Deals'}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(85vh-70px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Gallery & Image Display */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                <img
                  src={selectedImage || product.primary_image}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-2"
                />

                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-md shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}

                {product.is_demo && (
                  <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-amber-300">
                    Demo Deal
                  </span>
                )}
              </div>

              {/* Thumbnails row */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImage === imgUrl ? 'border-red-600 ring-2 ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* In-Modal Adsterra placement */}
              <AdSlot placementKey="product_details" ads={ads} className="my-2" />
            </div>

            {/* Right: Purchase & Info Module */}
            <div className="flex flex-col">
              {/* Category & Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                  {category?.name || 'Category'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">
                  Source: {product.product_source || 'Daraz Bangladesh'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {product.title}
              </h1>

              {product.title_bn && (
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {product.title_bn}
                </p>
              )}

              {/* Pricing Box */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-red-600 tabular-nums">
                    ৳{deal.toLocaleString('en-US')}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-slate-400 line-through tabular-nums">
                      ৳{orig.toLocaleString('en-US')}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">
                      Save ৳{(orig - deal).toLocaleString('en-US')} ({discountPercent}%)
                    </span>
                  )}
                </div>

                {product.expires_at && (
                  <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>
                      Deal Expiry: <strong className="text-slate-900">{new Date(product.expires_at).toLocaleDateString()}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Primary Call to Action */}
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleShopNow}
                  disabled={isExpired}
                  className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                    isExpired
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                      : 'bg-red-600 hover:bg-red-700 active:scale-[0.99] shadow-red-500/20'
                  }`}
                >
                  <span>Shop Now on Daraz Bangladesh</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Opens original seller listing on Daraz in a secure new tab.
                </p>
              </div>

              {/* Description */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Product Overview & Specs
                </h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.full_description || product.short_description}
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Tags:
                  </span>
                  {product.tags.map((tag, i) => (
                    <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Share Strip */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Share this deal with friends in Bangladesh:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareFacebook}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1877F2] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#25D366] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Deals Section */}
          {related.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                More Related Deals in {category?.name || 'Category'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="cursor-pointer group p-2.5 rounded-lg border border-slate-200 hover:border-red-400 bg-white transition-all"
                  >
                    <div className="aspect-[4/3] rounded overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={rel.primary_image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-red-600">
                      {rel.title}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-red-600 tabular-nums">৳{rel.deal_price}</span>
                      {rel.original_price > rel.deal_price && (
                        <span className="text-[10px] text-slate-400 line-through tabular-nums">৳{rel.original_price}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
