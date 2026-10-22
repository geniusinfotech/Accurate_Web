"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Product, ProductArt, useStore } from "../storefront";
import { useToast } from "../ui/Toast";
import { AddToCartButton } from "./AddToCartButton";

/** Renders children only while products are loading or available; hides the section when the API fails or returns nothing. */
export function WhenProducts({ excludeId, children }: { excludeId?: string; children: React.ReactNode }) {
  const { products, loading } = useStore();
  if (!loading && !products.some((p) => String(p.id) !== excludeId)) return null;
  return <>{children}</>;
}

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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white"
          >
            <div className="aspect-[4/4.2] animate-pulse bg-slate-100" />

            <div className="space-y-3 p-5">
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <article
          key={product.id}
          role="link"
          tabIndex={0}
          aria-label={`View ${product.name}`}
          onClick={() => router.push(`/product/${product.id}`)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();

              router.push(`/product/${product.id}`);
            }
          }}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#244892]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#244892] focus:ring-offset-2"
        >
          {/* PRODUCT IMAGE AREA */}
          <div className="relative aspect-[4/4] overflow-hidden bg-slate-50/70">
            {/* Category */}
            <div className="absolute left-3.5 top-3.5 z-10">
              <span className="rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0e1117] shadow-xs backdrop-blur-md">
                {product.category}
              </span>
            </div>

            {/* Size */}
            {product.size && (
              <div className="absolute right-3.5 top-3.5 z-10">
                <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[9px] font-medium text-[#244892] shadow-xs backdrop-blur-md">
                  {product.size}
                </span>
              </div>
            )}

            {/* Product Art */}
            <div className="flex h-full w-full items-center justify-center p-6 transition-transform duration-500 ease-out group-hover:scale-105">
              <ProductArt product={product} />
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="p-5">
            <div className="min-h-[64px]">
              <h3 className="font-serif line-clamp-2 text-xl font-normal leading-snug text-[#0e1117] transition-colors group-hover:text-[#244892]">
                {product.name}
              </h3>

              <p className="mt-1.5 text-xs text-[#244892]">
                Effective, effortless care.
              </p>
            </div>

            {/* PRICE */}
            <div className="mt-4 flex items-end justify-between border-t border-slate-200/80 pt-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#244892]">
                  Price
                </span>

                <strong className="mt-0.5 block text-lg font-bold tracking-tight text-[#0e1117]">
                  ₹{product.price}
                </strong>
              </div>

              {/* View icon */}
              <span className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0e1117] transition-all duration-200 group-hover:border-[#244892] group-hover:bg-[#244892] group-hover:text-white">
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </div>

            {/* ADD TO CART */}
            <AddToCartButton variant="grid" onAdd={() => add(product)} />
          </div>
        </article>
      ))}
    </div>
  );
}
