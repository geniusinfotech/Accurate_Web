"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Product, ProductArt, useStore } from "../storefront";
import { useToast } from "../ui/Toast";
import { AddToCartButton } from "./AddToCartButton";

/** Renders children only while products are loading or available; hides the section when the API fails or returns nothing. */
export function WhenProducts({ excludeId, children }: { excludeId?: string; children: React.ReactNode }) {
  const { products, loading } = useStore();
  if (!loading && !products.some((p) => String(p.id) !== excludeId)) return null;
  return <>{children}</>;
}

const GRID = "grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4";

export function ProductGrid({
  products: propsProducts,
  excludeId,
}: {
  products?: Product[];
  /** Hide this product (e.g. the one whose page we're on). */
  excludeId?: string;
}) {
  const router = useRouter();
  const toast = useToast();

  const { products: contextProducts, addToCart, loading, error } = useStore();

  const products = (propsProducts || contextProducts).filter(
    (p) => p.id !== excludeId,
  );

  const add = (product: Product) => {
    addToCart(product.id, 1, {
      name: product.name,
      price: product.price,
      image: product.image,
      variantLabel: product.size,
    });

    toast.success(`${product.name} added to cart`);
  };

  /* =========================================
     LOADING
  ========================================== */
  if (loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="aspect-square animate-pulse bg-slate-100" />

            <div className="space-y-3 p-3 sm:p-5">
              <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />

              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />

              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />

              <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* =========================================
     ERROR
  ========================================== */
  if (error) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-[2rem] border border-red-100 bg-red-50 px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-red-700">
            Unable to load products
          </p>

          <p className="mt-2 text-sm text-red-500">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     EMPTY
  ========================================== */
  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-slate-50 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
          <ShoppingBag size={23} />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-900">
          No products available
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          We couldn't find any products right now. Please check back again soon.
        </p>
      </div>
    );
  }

  /* =========================================
     PRODUCT GRID
  ========================================== */
  return (
    <div className={GRID}>
      {products.map((product) => {
        const href = `/product/${product.id}`;
        return (
          <article
            key={product.id}
            role="link"
            tabIndex={0}
            aria-label={`View ${product.name}`}
            onClick={() => router.push(href)}
            onPointerEnter={() => router.prefetch(href)}
            onFocus={() => router.prefetch(href)}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(href);
              }
            }}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors duration-200 hover:border-[#244892]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#244892]"
          >
            {/* Image: fills the square and is always fully visible (contain), never cropped */}
            <div className="relative aspect-square overflow-hidden bg-[#f4f7fe]">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none sm:p-6"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center p-4 [&_.product-art]:min-h-0">
                  <ProductArt product={product} />
                </div>
              )}
              {product.size && (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#244892] shadow-xs sm:left-3.5 sm:top-3.5">
                  {product.size}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-3 sm:p-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {product.category}
              </span>
              <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] font-serif text-base font-normal leading-tight text-[#0e1117] transition-colors group-hover:text-[#244892] sm:min-h-[3rem] sm:text-xl">
                {product.name}
              </h3>
              <strong className="mt-2 block text-lg font-bold tracking-tight text-[#0e1117] sm:mt-3">
                ₹{product.price.toLocaleString("en-IN")}
              </strong>
              <AddToCartButton variant="grid" className="!mt-3 !py-3 sm:!mt-4" onAdd={() => add(product)} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
