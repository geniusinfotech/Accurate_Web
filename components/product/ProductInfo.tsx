'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Lock, Minus, PackageCheck, Plus, ShieldCheck, Truck, Droplets, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/components/storefront';
import { AddToCartButton } from './AddToCartButton';
import { api, getImageUrl } from '@/lib/api';
import { COD_ENABLED } from '@/lib/checkout';
import { formatINR, stockLabel, unitPriceLabel, type StoreProduct, type StoreVariant } from '@/lib/product';

interface Props {
  product: StoreProduct;
  variant: StoreVariant | null;
  onVariant: (v: StoreVariant) => void;
  fragrance: string | null;
  onFragrance: (f: string) => void;
  quantity: number;
  onQuantity: (q: number) => void;
}

export function ProductInfo({ product, variant, onVariant, fragrance, onFragrance, quantity, onQuantity }: Props) {
  const { addToCart } = useStore();
  const toast = useToast();
  const router = useRouter();
  // Owner-configured threshold (admin → Shipping); 0 / unset = no free-shipping promise.
  const [freeShippingAbove, setFreeShippingAbove] = useState(0);
  useEffect(() => {
    api
      .get<{ value?: { freeShippingAbove?: number } | null }>('/settings/shipping')
      .then((r) => setFreeShippingAbove(Number(r?.value?.freeShippingAbove) || 0))
      .catch(() => undefined);
  }, []);

  // The mobile bar only appears once the main buy box has scrolled out of view.
  const buyRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const el = buyRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const price = variant?.price ?? product.price;
  const mrp = variant?.mrp ?? product.mrp;
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : product.discountPercent;
  const available = variant?.stock ?? product.availableStock;
  const stock = stockLabel(available);
  const activeFragrances = product.availableFragrances;
  const selectedFragrance = fragrance ?? activeFragrances[0] ?? product.fragrance ?? null;
  const cartKey = `${product.id}__${variant?.sku || 'base'}__${selectedFragrance || 'nofrag'}`;
  const out = available <= 0;

  const formulaLabel =
    product.productForm?.toLowerCase().includes('powder') ? 'Powder formula'
    : product.productForm?.toLowerCase().includes('liquid') ? 'Liquid formula'
    : product.productType?.toLowerCase().includes('liquid') ? 'Liquid formula'
    : product.productForm || 'Easy everyday use';

  function handleAdd(openCart = false) {
    if (out) return;
    const qty = Math.min(quantity, Math.max(1, available));
    addToCart(cartKey, qty, {
      name: product.name,
      price,
      image: getImageUrl(variant?.images[0] || product.images[0] || ''),
      variantLabel: variant?.label,
      fragrance: selectedFragrance || undefined,
    });
    toast.success(`${product.name} (${variant?.label || product.size}${selectedFragrance ? `, ${selectedFragrance}` : ''}) × ${qty} added to cart`);
    if (openCart) {
      router.push('/checkout');
    }
  }

  const packs = product.variants.filter((v) => v.isActive);
  const unitLabel = variant?.qty && variant?.unit ? unitPriceLabel(price, variant.qty, variant.unit) : '';
  const displayTags = (product.tags && product.tags.length > 0)
    ? product.tags
    : [product.category?.toLowerCase(), product.productForm?.toLowerCase() || 'liquid', 'accurate', 'clean'].filter(Boolean);
  const selectedLabel = [variant?.label || product.size, selectedFragrance].filter(Boolean).join(' · ');
  const addLabel = out ? 'Out of stock' : 'Add to cart';

  return (
    <div className="product-information flex flex-col">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
        <span>{product.category}</span>
        {product.brand && <><span aria-hidden>•</span><span>{product.brand}</span></>}
        {product.isNewArrival && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 normal-case tracking-normal text-primary">New</span>}
        {product.isBestseller && <span className="rounded-full bg-charcoal px-2.5 py-0.5 normal-case tracking-normal text-white">Bestseller</span>}
        {product.isConcentrated && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 normal-case tracking-normal text-primary">Concentrated</span>}
      </div>

      <h1 className="mt-3 text-[1.75rem] font-bold leading-[1.1] tracking-tight text-charcoal md:text-4xl">{product.name}</h1>

      {product.shortDescription && <p className="mt-3 text-[15px] leading-relaxed text-charcoal/75">{product.shortDescription}</p>}

      {/* Price */}
      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-3xl font-extrabold text-charcoal">{formatINR(price)}</span>
        {mrp && mrp > price && (
          <>
            <span className="text-base text-muted line-through">{formatINR(mrp)}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Save {discount}%</span>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">
        Inclusive of all taxes{product.gstRate ? ` (GST ${product.gstRate})` : ''}
        {unitLabel && <> • <strong className="font-semibold text-charcoal/70">{unitLabel}</strong></>}
      </p>

      {/* Pack size */}
      {packs.length > 0 && (
        <div className="mt-6">
          <strong className="text-sm text-charcoal">Pack size</strong>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Pack size">
            {packs.map((v) => {
              const active = variant?.key === v.key;
              const vDiscount = v.mrp && v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
              const vUnit = v.qty && v.unit ? unitPriceLabel(v.price, v.qty, v.unit) : '';
              return (
                <button
                  key={v.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={v.stock <= 0}
                  onClick={() => onVariant(v)}
                  className={`min-h-[44px] cursor-pointer rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${
                    active ? 'border-primary bg-primary/[0.04] ring-1 ring-primary' : 'border-border-gray bg-white hover:border-charcoal/40'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold text-charcoal">{v.label}</span>
                    {vDiscount > 0 && <span className="text-[11px] font-bold text-emerald-600">-{vDiscount}%</span>}
                  </span>
                  <strong className="mt-0.5 block text-primary">{formatINR(v.price)}</strong>
                  <span className="block text-xs text-muted">
                    {vUnit}
                    {v.stock <= 0 ? ' · Out of stock' : v.stock <= 10 ? ` · Only ${v.stock} left` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fragrance */}
      {activeFragrances.length > 0 && (
        <div className="mt-6">
          <strong className="text-sm text-charcoal">Fragrance</strong>
          <div className="mt-2.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Fragrance">
            {activeFragrances.map((f) => {
              const active = selectedFragrance === f;
              return (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onFragrance(f)}
                  className={`min-h-[44px] cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active ? 'border-primary bg-primary/[0.06] text-charcoal ring-1 ring-primary' : 'border-border-gray bg-white text-charcoal/70 hover:border-charcoal/40'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Buy */}
      <div ref={buyRef} className="mt-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold" role="status">
          <span className={`size-2.5 rounded-full ${stock.tone === 'in' ? 'bg-emerald-500' : stock.tone === 'low' ? 'bg-amber-500' : 'bg-destructive'}`} aria-hidden />
          <span className={stock.tone === 'out' ? 'text-destructive' : stock.tone === 'low' ? 'text-amber-700' : 'text-emerald-700'}>{stock.text}</span>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center rounded-full border border-border-gray bg-white" role="group" aria-label="Quantity">
            <button type="button" onClick={() => onQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="grid size-12 place-items-center hover:text-primary disabled:opacity-40" disabled={out || quantity <= 1}>
              <Minus size={16} />
            </button>
            <span className="min-w-8 text-center font-bold" aria-live="polite">{quantity}</span>
            <button type="button" onClick={() => onQuantity(Math.min(Math.max(1, available), quantity + 1))} aria-label="Increase quantity" className="grid size-12 place-items-center hover:text-primary disabled:opacity-40" disabled={out || quantity >= available}>
              <Plus size={16} />
            </button>
          </div>
          <AddToCartButton
            variant="detail"
            className="min-h-12"
            disabled={out}
            label={addLabel}
            priceLabel={!out ? formatINR(price * quantity) : undefined}
            onAdd={() => handleAdd(false)}
          />
        </div>
        <button
          type="button"
          onClick={() => handleAdd(true)}
          disabled={out}
          className="mt-2.5 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-primary px-5 font-bold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy it now <ArrowRight size={18} />
        </button>
      </div>

      {/* Highlights */}
      {product.benefits.length > 0 && (
        <ul className="mt-6 grid gap-x-4 gap-y-2 border-t border-border-gray pt-5 sm:grid-cols-2">
          {product.benefits.slice(0, 4).map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-charcoal/85">
              <Check size={16} className="mt-0.5 shrink-0 text-primary" />{b}
            </li>
          ))}
        </ul>
      )}

      {/* Trust */}
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-charcoal/70">
        {[
          { icon: <Truck size={16} />, title: 'Fast delivery' },
          { icon: <ShieldCheck size={16} />, title: 'Quality assured' },
          { icon: <PackageCheck size={16} />, title: 'Sealed packaging' },
          { icon: product.kind === 'pouch' ? <Zap size={16} /> : <Droplets size={16} />, title: formulaLabel },
        ].map((t) => (
          <li key={t.title} className="flex items-center gap-1.5"><span className="text-primary">{t.icon}</span>{t.title}</li>
        ))}
      </ul>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span>{freeShippingAbove > 0 ? `Free delivery on orders of ${formatINR(freeShippingAbove)} or more.` : 'Delivery charges are shown at checkout.'}</span>
        {COD_ENABLED && <span><Check size={12} className="inline text-emerald-600" /> COD available.</span>}
        <span><Lock size={12} className="inline text-primary" /> Secure checkout via Razorpay (UPI, Cards).</span>
      </p>

      {/* Meta */}
      <dl className="mt-5 space-y-2 border-t border-border-gray pt-4 text-[13px] text-muted" id="product-side-details-meta">
        {(variant?.sku || product.sku) && (
          <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-charcoal/60">SKU</dt><dd className="text-charcoal/85">{variant?.sku || product.sku}</dd></div>
        )}
        {product.certifications.length > 0 && (
          <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-charcoal/60">Certified</dt><dd className="text-charcoal/85">{product.certifications.join(' • ')}</dd></div>
        )}
        {product.shelfLife && (
          <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-charcoal/60">Shelf life</dt><dd className="text-charcoal/85">{product.shelfLife}</dd></div>
        )}
        {displayTags.length > 0 && (
          <div className="flex items-start gap-2" id="product-tags">
            <dt className="w-24 shrink-0 pt-0.5 font-semibold text-charcoal/60">Tags</dt>
            <dd className="flex flex-wrap gap-1.5">
              {displayTags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">#{tag}</span>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {/* Mobile sticky buy bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border-gray bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 motion-reduce:transition-none lg:hidden ${
          showBar ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
        aria-hidden={!showBar}
        inert={!showBar}
      >
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold leading-tight text-charcoal">{formatINR(price * quantity)}</p>
          <p className="truncate text-xs text-muted">{selectedLabel}{quantity > 1 ? ` · Qty ${quantity}` : ''}</p>
        </div>
        <AddToCartButton variant="detail" className="!flex-none min-h-12 px-7" disabled={out} label={addLabel} onAdd={() => handleAdd(false)} />
      </div>
    </div>
  );
}
