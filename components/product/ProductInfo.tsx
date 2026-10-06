'use client';

import { ArrowRight, Check, Minus, PackageCheck, Plus, ShieldCheck, Truck, Droplets, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/components/storefront';
import { AddToCartButton } from './AddToCartButton';
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
      image: (variant?.images[0] || product.images[0]),
      variantLabel: variant?.label,
      fragrance: selectedFragrance || undefined,
    });
    toast.success(`${product.name} (${variant?.label || product.size}${selectedFragrance ? `, ${selectedFragrance}` : ''}) × ${qty} added to cart`);
    if (openCart) {
      router.push('/checkout');
    }
  }

  return (
    <div className="product-information flex flex-col">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
        <span>{product.category}</span>
        {product.brand && <><span aria-hidden>•</span><span>{product.brand}</span></>}
        {product.isConcentrated && (
          <span className="normal-case tracking-normal px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">Concentrated</span>
        )}
        {product.isNewArrival && (
          <span className="normal-case tracking-normal px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">New</span>
        )}
        {product.isBestseller && (
          <span className="normal-case tracking-normal px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">Bestseller</span>
        )}
      </div>

      <h1 className="mt-3 text-3xl md:text-[2.75rem] leading-[1.05] font-bold tracking-tight text-charcoal">{product.name}</h1>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        {product.sku && <span>SKU: <strong className="text-charcoal">{variant?.sku || product.sku}</strong></span>}
        {product.productForm && <><span aria-hidden>•</span><span>{product.productForm}</span></>}
        {product.packaging?.type && <><span aria-hidden>•</span><span>{product.packaging.type}</span></>}
      </div>

      {product.shortDescription && <p className="mt-3 text-[15px] leading-relaxed text-charcoal/80">{product.shortDescription}</p>}

      {/* Price */}
      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-3xl font-extrabold text-charcoal">{formatINR(price)}</span>
        {mrp && mrp > price && (
          <>
            <span className="text-lg text-muted line-through">{formatINR(mrp)}</span>
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Save {discount}%</span>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">
        Inclusive of all taxes{product.gstRate ? ` (GST ${product.gstRate})` : ''}
        {variant?.qty && variant?.unit && unitPriceLabel(price, variant.qty, variant.unit) && (
          <> • <strong className="text-charcoal/70">{unitPriceLabel(price, variant.qty, variant.unit)}</strong></>
        )}
      </p>

      {/* Pack size */}
      {product.variants.filter((v) => v.isActive).length > 0 && (
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <strong className="text-sm text-charcoal">Pack Size</strong>
            <span className="text-sm text-muted">{variant?.label || product.size}</span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Pack size">
            {product.variants.filter((v) => v.isActive).map((v) => {
              const active = variant?.key === v.key;
              const vDiscount = v.mrp && v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
              return (
                <button
                  key={v.key}
                  role="radio"
                  aria-checked={active}
                  onClick={() => onVariant(v)}
                  className={`rounded-2xl border-2 p-3 text-left transition-all cursor-pointer ${
                    active ? 'border-primary ring-2 ring-primary/15 bg-primary/[0.04]' : 'border-border-gray hover:border-charcoal/30 bg-white'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold text-charcoal">{v.label}</span>
                    {vDiscount > 0 && <span className="text-[11px] font-bold text-emerald-600">-{vDiscount}%</span>}
                  </span>
                  <strong className="mt-1 block text-primary">{formatINR(v.price)}</strong>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {v.mrp && v.mrp > v.price && <small className="line-through">{formatINR(v.mrp)}</small>}
                    {v.qty && v.unit && unitPriceLabel(v.price, v.qty, v.unit) && <small>{unitPriceLabel(v.price, v.qty, v.unit)}</small>}
                  </span>
                  <small className={`mt-1 block text-[11px] font-semibold ${v.stock <= 0 ? 'text-destructive' : v.stock <= 10 ? 'text-amber-600' : 'text-muted'}`}>
                    {v.stock <= 0 ? 'Out of stock' : v.stock <= 10 ? `Only ${v.stock} left` : 'In stock'}
                  </small>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fragrance */}
      {activeFragrances.length > 0 && (
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <strong className="text-sm text-charcoal">Fragrance</strong>
            <span className="text-sm text-muted">{selectedFragrance}</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Fragrance">
            {activeFragrances.map((f) => {
              const active = selectedFragrance === f;
              return (
                <button
                  key={f}
                  role="radio"
                  aria-checked={active}
                  onClick={() => onFragrance(f)}
                  className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    active ? 'border-primary bg-primary/[0.06] text-charcoal' : 'border-border-gray bg-white text-charcoal/70 hover:border-charcoal/30'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-primary' : 'bg-border-gray'}`} aria-hidden />
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock */}
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold" role="status">
        <span className={`w-2.5 h-2.5 rounded-full ${stock.tone === 'in' ? 'bg-emerald-500' : stock.tone === 'low' ? 'bg-amber-500' : 'bg-destructive'}`} aria-hidden />
        <span className={stock.tone === 'out' ? 'text-destructive' : stock.tone === 'low' ? 'text-amber-700' : 'text-emerald-700'}>{stock.text}</span>
        {variant && available > 10 && <span className="font-normal text-muted">• {available} units</span>}
      </div>

      {/* Buy */}
      <div className="mt-4 flex gap-3">
        <div className="flex items-center rounded-full border border-border-gray bg-white" aria-label="Quantity">
          <button onClick={() => onQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="p-3 hover:text-primary disabled:opacity-40" disabled={out || quantity <= 1}>
            <Minus size={16} />
          </button>
          <span className="min-w-8 text-center font-bold" aria-live="polite">{quantity}</span>
          <button onClick={() => onQuantity(Math.min(Math.max(1, available), quantity + 1))} aria-label="Increase quantity" className="p-3 hover:text-primary disabled:opacity-40" disabled={out || quantity >= available}>
            <Plus size={16} />
          </button>
        </div>
        <AddToCartButton
          variant="detail"
          disabled={out}
          label={out ? 'Out of stock' : 'Add to cart'}
          priceLabel={!out ? formatINR(price * quantity) : undefined}
          onAdd={() => handleAdd(false)}
        />
      </div>
      <button
        onClick={() => handleAdd(true)}
        disabled={out}
        className="mt-2.5 w-full rounded-full bg-primary text-white font-bold py-3.5 px-5 flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Buy it now <ArrowRight size={18} />
      </button>

      {/* Services */}
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        {[
          { icon: <Truck size={19} />, title: 'Fast delivery', sub: 'Delivered to your door' },
          { icon: <ShieldCheck size={19} />, title: 'Quality assured', sub: 'Certified & packed' },
          { icon: <PackageCheck size={19} />, title: 'Secure packaging', sub: product.packaging?.type ? `${product.packaging.type} • sealed` : 'Safe from dispatch' },
          { icon: product.kind === 'pouch' ? <Zap size={19} /> : <Droplets size={19} />, title: formulaLabel, sub: product.isConcentrated ? 'Concentrated power' : 'Easy everyday use' },
        ].map((s) => (
          <div key={s.title} className="flex gap-2.5 rounded-2xl border border-border-gray/70 bg-white p-3">
            <span className="text-primary mt-0.5">{s.icon}</span>
            <div><strong className="block text-[13px] text-charcoal">{s.title}</strong><span className="block text-xs text-muted">{s.sub}</span></div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Free delivery on orders above ₹499. <Check size={12} className="inline text-emerald-600" /> COD available.</p>

      {/* Meta */}
      <dl className="mt-5 space-y-1.5 text-[13px] text-muted border-t border-border-gray pt-4">
        {product.certifications.length > 0 && (
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-charcoal/60">Certified</dt><dd>{product.certifications.join(' • ')}</dd></div>
        )}
        {product.shelfLife && (
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-charcoal/60">Shelf life</dt><dd>{product.shelfLife}</dd></div>
        )}
        {product.tags.length > 0 && (
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-charcoal/60">Tags</dt><dd>{product.tags.slice(0, 6).join(', ')}</dd></div>
        )}
      </dl>
    </div>
  );
}
