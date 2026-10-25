import React, { useEffect, useRef } from 'react';
import { AdPlacement } from '../types';

interface AdSlotProps {
  placementKey: 'homepage_top' | 'homepage_middle' | 'homepage_sidebar' | 'product_details' | 'footer';
  ads: AdPlacement[];
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placementKey, ads, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ad = ads.find(a => a.placement_key === placementKey);

  useEffect(() => {
    if (!ad || !ad.is_enabled || !ad.ad_code || !containerRef.current) return;

    // Clear previous children
    containerRef.current.innerHTML = '';

    // Safely insert HTML and evaluate scripts
    const wrapper = document.createElement('div');
    wrapper.innerHTML = ad.ad_code;

    // Adsterra scripts need re-execution if they contain <script>
    const scripts = wrapper.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    containerRef.current.appendChild(wrapper);
  }, [ad, ad?.ad_code, ad?.is_enabled]);

  if (!ad || !ad.is_enabled) {
    return null;
  }

  // Device target filtering
  const visibilityClass =
    ad.device_target === 'desktop'
      ? 'hidden md:block'
      : ad.device_target === 'mobile'
      ? 'block md:hidden'
      : 'block';

  return (
    <div
      className={`adsterra-slot-container my-4 overflow-hidden rounded-lg transition-all ${visibilityClass} ${className}`}
      aria-label={`Advertisement - ${ad.placement_name}`}
    >
      <div className="flex items-center justify-between px-2 py-0.5 text-[10px] tracking-wider uppercase text-slate-400 border-b border-slate-100">
        <span>Advertisement</span>
        <span>Adsterra Partner</span>
      </div>
      <div ref={containerRef} className="p-2 flex justify-center items-center min-h-[50px] bg-white text-center" />
    </div>
  );
};
