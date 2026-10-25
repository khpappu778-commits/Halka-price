import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Zap, ShieldCheck, TrendingDown, Clock } from 'lucide-react';
import { HomepageBanner, Category } from '../types';

interface HeroBannerProps {
  banners: HomepageBanner[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slugOrId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  banners,
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Auto rotate banners every 6s if more than 1
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners[currentIdx] || banners[0];

  return (
    <section className="relative pt-4 pb-8">
      {/* Promotional Banner Area */}
      {banners.length > 0 && activeBanner && (
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-900 group">
          <a
            href={activeBanner.destination_url || 'https://www.daraz.com.bd'}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[16/6] max-h-[420px] overflow-hidden"
          >
            {/* Desktop / Responsive image */}
            <picture>
              {activeBanner.mobile_image_url && (
                <source media="(max-width: 640px)" srcSet={activeBanner.mobile_image_url} />
              )}
              <img
                src={activeBanner.image_url}
                alt={activeBanner.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              />
            </picture>

            {/* Subtle Gradient Scrim for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-8 text-white">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-red-600 text-white rounded-md mb-2">
                  <Zap className="w-3 h-3 fill-current" />
                  Special Campaign
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm text-balance">
                  {activeBanner.title}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                  <span>Shop directly on Daraz Bangladesh</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </a>

          {/* Banner Navigation Controls if multiple */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-md backdrop-blur transition-all"
                aria-label="Previous Banner"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIdx((prev) => (prev + 1) % banners.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-md backdrop-blur transition-all"
                aria-label="Next Banner"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
                {banners.map((b, i) => (
                  <button
                    key={b.id}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentIdx ? 'w-6 bg-red-600' : 'w-1.5 bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Trust & Proof Strip */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Up to 70% Off</div>
            <div className="text-[11px] text-slate-500">Verified price drops</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Direct Daraz Links</div>
            <div className="text-[11px] text-slate-500">Original seller checkout</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">100% Genuine Stores</div>
            <div className="text-[11px] text-slate-500">Top-rated sellers checked</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Daily Updates</div>
            <div className="text-[11px] text-slate-500">Bangladeshi Taka (৳ BDT)</div>
          </div>
        </div>
      </div>

      {/* Quick Category Chips Bar */}
      <div id="categories-section" className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Popular Categories
          </h2>
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory('')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          <button
            onClick={() => onSelectCategory('')}
            className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === ''
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug || cat.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat.slug || selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
