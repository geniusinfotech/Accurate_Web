'use client';

import { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import { ProductArt } from '@/components/storefront';
import type { StoreProduct } from '@/lib/product';

interface Props {
  product: StoreProduct;
  images: string[];
  activeIndex: number;
  onSelect: (i: number) => void;
  lightboxOpen: boolean;
  onLightbox: (open: boolean) => void;
  discount: number;
}

export function ProductGallery({ product, images, activeIndex, onSelect, lightboxOpen, onLightbox, discount }: Props) {
  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));

  const prev = useCallback(() => {
    onSelect(safeIndex > 0 ? safeIndex - 1 : images.length - 1);
  }, [safeIndex, images.length, onSelect]);

  const next = useCallback(() => {
    onSelect(safeIndex < images.length - 1 ? safeIndex + 1 : 0);
  }, [safeIndex, images.length, onSelect]);

  // Horizontal swipe on the main image (touch only; arrows/thumbnails cover mouse users).
  const touchX = useRef<number | null>(null);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || images.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onLightbox(false);
      else if (e.key === 'ArrowLeft' && images.length > 1) prev();
      else if (e.key === 'ArrowRight' && images.length > 1) next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, images.length, prev, next, onLightbox]);

  return (
    <div className="product-gallery w-full">
      <div className="gallery-main group relative overflow-hidden rounded-2xl bg-limewash">
        {images.length > 0 ? (
          <div
            className="relative flex aspect-square w-full select-none items-center justify-center overflow-hidden p-6 lg:aspect-auto lg:min-h-[520px] lg:p-10"
            style={{ touchAction: 'pan-y' }}
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={getImageUrl(images[safeIndex])}
              alt={`${product.name} - Image ${safeIndex + 1}`}
              onClick={() => onLightbox(true)}
              className="max-h-full w-auto max-w-full cursor-zoom-in object-contain transition-transform duration-500 motion-reduce:transition-none lg:max-h-[460px] lg:group-hover:scale-[1.03]"
              loading="eager"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-opacity hover:bg-white sm:flex lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-opacity hover:bg-white sm:flex lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onLightbox(true)}
              aria-label="Zoom image"
              className="absolute right-3 top-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-opacity hover:bg-white lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
            >
              <ZoomIn size={17} />
            </button>
          </div>
        ) : (
          <ProductArt
            product={{
              id: product.id,
              name: product.name,
              category: product.category,
              price: product.price,
              size: product.size,
              color: 'aqua',
              kind: product.kind,
            }}
          />
        )}

        {discount > 0 && (
          <span className="discount-badge absolute left-3 top-3 z-10 rounded-full bg-charcoal px-3 py-1.5 text-xs font-bold tracking-wide text-white">
            {discount}% OFF
          </span>
        )}
      </div>

      {images.length > 1 && (
        <>
          <div className="mt-3 flex justify-center gap-2 sm:hidden" aria-hidden>
            {images.map((_, index) => (
              <span key={index} className={`h-1.5 rounded-full transition-all ${safeIndex === index ? 'w-5 bg-primary' : 'w-1.5 bg-border-gray'}`} />
            ))}
          </div>
          <div className="mt-3 hidden flex-wrap gap-2.5 sm:flex" role="tablist" aria-label="Product images">
            {images.map((image, index) => {
              const isActive = safeIndex === index;
              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Select product image ${index + 1}`}
                  onClick={() => onSelect(index)}
                  className={`flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 bg-white p-1 transition-colors md:size-20 ${
                    isActive ? 'border-primary' : 'border-border-gray/80 opacity-70 hover:border-charcoal/40 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(image)} alt={`${product.name} ${index + 1}`} className="h-full w-full object-contain" loading="lazy" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => onLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Product image fullscreen view"
        >
          <button
            type="button"
            onClick={() => onLightbox(false)}
            aria-label="Close fullscreen view"
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <X size={24} />
          </button>
          <div className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImageUrl(images[safeIndex])}
              alt={`${product.name} fullscreen view`}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-2xl bg-white/10 overflow-x-auto max-w-full" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <button
                  key={`lightbox-thumb-${idx}`}
                  type="button"
                  onClick={() => onSelect(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white/5 ${
                    safeIndex === idx ? 'border-white ring-2 ring-white/50 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(img)} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
              <span className="text-white/80 text-xs font-semibold ml-2 pr-1 whitespace-nowrap">
                {safeIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
