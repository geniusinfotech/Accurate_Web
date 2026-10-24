import { PageFrame } from '@/components/storefront';

/** Shown instantly while a product page streams in or its data loads. */
export function ProductSkeleton() {
  return (
    <PageFrame>
      <main className="product-detail-page mx-auto max-w-[1240px] px-5 pb-28 pt-12 md:px-8 lg:pb-20" aria-busy="true">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="aspect-square animate-pulse rounded-2xl bg-cream-dark lg:aspect-auto lg:h-[520px]" />
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
