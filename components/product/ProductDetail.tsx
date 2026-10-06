'use client';

import { useEffect, useMemo, useState } from 'react';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Leaf, Sparkles } from 'lucide-react';
import { PageFrame } from '@/components/storefront';
import { ProductGrid } from './ProductGrid';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import type { Product as ApiProduct } from '@/lib/types/api';
import { imagesFor, mapApiProduct, type StoreProduct, type StoreVariant } from '@/lib/product';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductTabs } from './ProductTabs';

function ProductJsonLd({ product }: { product: StoreProduct }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    category: product.category,
    description: product.description,
    image: product.images,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: product.variants.length
      ? product.variants.map((v) => ({
          '@type': 'Offer',
          sku: v.sku,
          price: v.price,
          priceCurrency: 'INR',
          availability: v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        }))
      : {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'INR',
          availability: product.availableStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export function ProductDetail({ id: propId }: { id?: string }) {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const id = propId || params?.id;

  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [variant, setVariant] = useState<StoreVariant | null>(null);
  const [fragrance, setFragrance] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    api
      .get<ApiProduct>(`/products/${id}`)
      .then((data) => {
        if (!mounted) return;
        const mapped = mapApiProduct(data);
        setProduct(mapped);
        const wantedSku = searchParams?.get('variant');
        const list = mapped.variants.filter((v) => v.isActive);
        const initial =
          (wantedSku && [...list, ...mapped.variants].find((v) => v.sku === wantedSku)) ||
          list[0] ||
          mapped.variants[0] ||
          null;
        setVariant(initial);
        setFragrance(mapped.availableFragrances[0] || null);
        setImageIndex(0);
        setQuantity(1);
      })
      .catch(() => {
        if (!mounted) return;
        toast.error('Could not load this product');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setImageIndex(0);
    setQuantity(1);
  }, [variant?.key]);

  const images = useMemo(() => (product ? imagesFor(product, variant) : []), [product, variant]);
  const discount = useMemo(() => {
    if (!product) return 0;
    const price = variant?.price ?? product.price;
    const mrp = variant?.mrp ?? product.mrp;
    if (mrp && mrp > price) return Math.round(((mrp - price) / mrp) * 100);
    return product.discountPercent;
  }, [product, variant]);

  function pickVariant(v: StoreVariant) {
    setVariant(v);
    try {
      router.replace(`?variant=${encodeURIComponent(v.sku)}`, { scroll: false });
    } catch {}
  }

  if (loading) {
    return (
      <PageFrame>
        <main className="product-detail-page mx-auto max-w-[1240px] px-8 py-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="h-[460px] animate-pulse rounded-3xl bg-cream-dark" />
            <div className="space-y-4">
              <div className="h-4 w-1/3 animate-pulse rounded bg-cream-dark" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-cream-dark" />
              <div className="h-8 w-1/2 animate-pulse rounded bg-cream-dark" />
              <div className="h-24 animate-pulse rounded-2xl bg-cream-dark" />
              <div className="h-12 animate-pulse rounded-full bg-cream-dark" />
            </div>
          </div>
        </main>
      </PageFrame>
    );
  }

  if (!product) return notFound();

  return (
    <PageFrame>
      <ProductJsonLd product={product} />
      <main className="product-detail-page mx-auto max-w-[1240px] px-5 md:px-8 pb-20">
        {/* Breadcrumb */}
        <div className="product-wrap !px-0">
          <nav className="flex items-center gap-2 py-5 text-sm text-muted" aria-label="Breadcrumb">
            <button onClick={() => router.push('/shop')} className="flex items-center gap-1.5 hover:text-charcoal cursor-pointer">
              <ArrowLeft size={15} /> Shop
            </button>
            <span aria-hidden>/</span>
            <span>{product.category}</span>
            <span aria-hidden>/</span>
            <strong className="text-charcoal truncate max-w-[40vw]">{product.name}</strong>
          </nav>
        </div>

        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery
            product={product}
            images={images}
            activeIndex={imageIndex}
            onSelect={setImageIndex}
            lightboxOpen={lightbox}
            onLightbox={setLightbox}
            discount={discount}
          />
          <ProductInfo
            product={product}
            variant={variant}
            onVariant={pickVariant}
            fragrance={fragrance}
            onFragrance={setFragrance}
            quantity={quantity}
            onQuantity={setQuantity}
          />
        </section>

        {/* Benefits strip */}
        {product.benefits.length > 0 && (
          <section className="product-wrap !px-0 mt-14 md:mt-20">
            <div className="section-eyebrow">WHY YOU&apos;LL LOVE IT</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everyday cleaning,<br /><em className="font-serif italic font-normal text-primary">made simpler.</em></h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {product.benefits.slice(0, 8).map((b, i) => (
                <div key={b} className="rounded-3xl border border-border-gray/70 bg-white p-5">
                  <span className="text-xs font-bold text-muted">0{i + 1}</span>
                  <Sparkles size={22} className="my-2.5 text-primary" />
                  <h3 className="font-bold text-charcoal leading-snug">{b}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        <ProductTabs product={product} />

        {/* Ingredients highlight */}
        {product.ingredients.length > 0 && (
          <section className="mt-14 md:mt-20 rounded-[28px] bg-charcoal text-white px-6 py-10 md:p-14">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
              <div>
                <Leaf size={30} className="text-emerald-300" />
                <div className="section-eyebrow !text-white/60 mt-4">WHAT&apos;S INSIDE</div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">A formula built<br /><em className="font-serif italic font-normal text-emerald-300">with purpose.</em></h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">Active oxygen stain busters and color-brightening agents — effective in hard and soft water.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <span key={ing} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium">{ing}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related */}
        <section className="product-wrap !px-0 mt-14 md:mt-20" id="related">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="section-eyebrow">COMPLETE THE ROUTINE</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">More everyday<br /><em className="font-serif italic font-normal text-primary">essentials.</em></h2>
            </div>
            <button onClick={() => router.push('/shop')} className="flex items-center gap-2 text-sm font-bold hover:text-primary cursor-pointer">
              View all products <ArrowRight size={17} />
            </button>
          </div>
          <div className="mt-6">
            <ProductGrid excludeId={String(product.id)} />
          </div>
        </section>

        {/* Mobile sticky buy bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border-gray bg-white/95 backdrop-blur px-4 py-3 flex items-center gap-3 lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-charcoal">{product.name} {variant ? `• ${variant.label}` : ''}</p>
            <p className="text-sm font-extrabold text-primary">{`₹${((variant?.price ?? product.price) * quantity).toLocaleString('en-IN')}`}</p>
          </div>
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full bg-charcoal text-white text-sm font-bold px-5 py-2.5">
            Choose pack
          </a>
        </div>
      </main>
    </PageFrame>
  );
}
