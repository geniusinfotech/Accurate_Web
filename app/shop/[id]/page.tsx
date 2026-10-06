import { Suspense } from 'react';
import { ProductDetail } from '@/components/product';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<main className="mx-auto max-w-[1240px] px-8 py-10"><div className="h-[460px] animate-pulse rounded-3xl bg-cream-dark" /></main>}>
      <ProductDetail id={id} />
    </Suspense>
  );
}
