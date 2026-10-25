import React, { useState } from 'react';
import { ExternalLink, Eye, Flame, Star, Clock } from 'lucide-react';
import { Product, Category } from '../types';

interface ProductCardProps {
  product: Product;
  category?: Category;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  category,
  onViewDetails
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Price and discount calculations with safety
  const orig = Number(product.original_price) || 0;
  const deal = Number(product.deal_price) || 0;
  const hasDiscount = orig > deal && orig > 0;
  const discountPercent = hasDiscount ? Math.round(((orig - deal) / orig) * 100) : 0;

  // Safe destination URL
  const targetUrl = product.affiliate_url || product.destination_url;
  const isValidUrl = targetUrl && /^https?:\/\//i.test(targetUrl);

  const handleShopNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isValidUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Product destination URL is not configured.');
    }
  };

  // Expiry badge check
  const isExpired = product.expires_at ? new Date(product.expires_at) < new Date() : false;

  return (
    <article
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Top Media Frame */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        {!imageError && product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
            <span className="text-2xl font-bold text-slate-300 mb-1">৳</span>
            <span className="text-xs font-medium text-slate-500 line-clamp-1">{product.title}</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {hasDiscount && (
            <span className="bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded shadow-sm tracking-tight">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_hot_deal && (
            <span className="bg-orange-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs">
              <Flame className="w-3 h-3 fill-current" />
              HOT DEAL
            </span>
          )}
          {product.is_featured && (
            <span className="bg-slate-900 text-white font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              FEATURED
            </span>
          )}
        </div>

        {product.is_demo && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-amber-300/60">
              Demo
            </span>
          </div>
        )}

        {isExpired && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-rose-700 text-white font-bold text-xs px-3 py-1 rounded">
              Deal Expired
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata: Category & Store */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="font-medium text-red-600 truncate">{category?.name || 'Deals'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 truncate">{product.product_source || 'Daraz BD'}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
            {product.title}
          </h3>

          {/* Short description */}
          {product.short_description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Pricing and Action row */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 tabular-nums">
                ৳{deal.toLocaleString('en-US')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  ৳{orig.toLocaleString('en-US')}
                </span>
              )}
            </div>

            {hasDiscount && (
              <span className="text-[11px] font-semibold text-emerald-600 tabular-nums">
                Save ৳{(orig - deal).toLocaleString('en-US')}
              </span>
            )}
          </div>

          {/* Buttons: View Details & Shop Now */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product);
              }}
              className="w-full py-2 px-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            <button
              type="button"
              onClick={handleShopNow}
              disabled={isExpired}
              className={`w-full py-2 px-2 text-xs font-bold text-white rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                isExpired
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'
              }`}
            >
              <span>Shop Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
