'use client';

import { useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, X, ZoomIn } from 'lucide-react';
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
      <div className="gallery-main group relative overflow-hidden rounded-3xl border border-border-gray/70 bg-cream/40 shadow-xs">
        {images.length > 0 ? (
          <div className="relative w-full min-h-[380px] md:min-h-[460px] flex items-center justify-center p-6 select-none overflow-hidden">
            <img
              src={getImageUrl(images[safeIndex])}
              alt={`${product.name} - Image ${safeIndex + 1}`}
              onClick={() => onLightbox(true)}
              className="max-h-[420px] w-auto max-w-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
              loading="eager"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-charcoal shadow-md border border-border-gray/50 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-charcoal shadow-md border border-border-gray/50 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onLightbox(true)}
              aria-label="Zoom image"
              title="View fullscreen"
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-charcoal shadow-sm border border-border-gray/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ZoomIn size={16} />
            </button>

            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full text-xs font-semibold bg-charcoal/70 text-white flex items-center gap-1.5 z-10">
                <ImageIcon size={12} />
                <span>{safeIndex + 1} / {images.length}</span>
              </div>
            )}
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
          <span className="discount-badge absolute top-4 left-4 px-3 py-1.5 rounded-full bg-charcoal text-white text-xs font-bold tracking-wide z-10">
            {discount}% OFF
          </span>
        )}
        <span className="essential-badge absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/95 border border-border-gray/70 text-xs font-semibold flex items-center gap-1.5 text-charcoal shadow-xs z-10">
          <Sparkles size={14} className="text-primary" />
          {product.productForm || 'Everyday essential'}
        </span>
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2.5 mt-3" role="tablist" aria-label="Product images">
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
                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 bg-white transition-all p-1 flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-sm'
                    : 'border-border-gray/80 hover:border-charcoal/40 opacity-75 hover:opacity-100'
                }`}
              >
                <img src={getImageUrl(image)} alt={`${product.name} ${index + 1}`} className="w-full h-full object-contain" loading="lazy" />
              </button>
            );
          })}
        </div>
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
