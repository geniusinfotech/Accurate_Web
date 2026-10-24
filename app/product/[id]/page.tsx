import { cache, Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductDetail } from '@/components/product';
import { ProductSkeleton } from '@/components/product/ProductSkeleton';
import { getImageUrl, getServerApiClientInstance } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';

const getProduct = cache(async (id: string): Promise<any | null> => {
  try {
    const api = await getServerApiClientInstance();
    return await api.get(`/products/${id}`);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return pageMetadata({ title: 'Product', description: 'Accurate Liquid home cleaning product.', path: `/product/${id}` });

  const image = p.images?.[0] || p.image || p.variants?.find((v: any) => v.images?.[0])?.images[0];
  const text = String(p.metaDescription || p.shortDescription || p.description || `Buy ${p.name} online from Accurate Liquid.`);
  return pageMetadata({
    title: p.metaTitle || p.name,
    description: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160),
    path: `/product/${id}`,
    keywords: [p.name, p.category?.name, ...(p.keywords || []), ...(p.tags || [])].filter(Boolean),
    image: image ? getImageUrl(image) : undefined,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail id={id} />
    </Suspense>
  );
}
