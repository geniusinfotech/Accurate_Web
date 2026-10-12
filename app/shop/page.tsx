"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { PageFrame } from "@/components/storefront";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useStore } from "@/components/storefront";
import { Suspense, useMemo } from "react";
import { motion } from "framer-motion";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, loading } = useStore();

  const selectedCategory = searchParams.get("category");

  // Derive categories dynamically from products
  const categories = useMemo(() => {
    if (!products) return [];
    const cats = Array.from(new Set(products.map((p) => p.category))).filter(
      Boolean,
    );
    return ["All", ...cats];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!selectedCategory || selectedCategory === "All") return products;
    return products.filter(
      (p) =>
        p.category.toLowerCase().replace(/ /g, "-") ===
          selectedCategory.toLowerCase() ||
        p.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [products, selectedCategory]);

  return (
    <main className="inner-page wrap">
      <p className="eyebrow">the daily edit</p>
      <h1>
        Good things for
        <br />
        <em>clean spaces.</em>
      </h1>
      <p className="page-intro mb-8">
        Simple, effective care for every room and ritual.
      </p>

      {/* Dynamic Filters */}
      {!loading && categories.length > 1 && (
        <div className="mb-12 flex flex-wrap gap-3">
          {categories.map((cat) => {
            const isSelected =
              (cat === "All" &&
                (!selectedCategory || selectedCategory === "All")) ||
              (cat !== "All" &&
                selectedCategory &&
                (selectedCategory.toLowerCase() ===
                  cat.toLowerCase().replace(/ /g, "-") ||
                  selectedCategory.toLowerCase() === cat.toLowerCase()));

            return (
              <button
                key={cat}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (cat === "All") {
                    params.delete("category");
                  } else {
                    params.set(
                      "category",
                      cat.toLowerCase().replace(/ /g, "-"),
                    );
                  }
                  router.push(`/shop?${params.toString()}`);
                }}
                className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  isSelected
                    ? "bg-[#244892] text-white shadow-md shadow-[#244892]/20"
                    : "bg-white border border-slate-200 text-[#244892] hover:border-[#244892] hover:text-[#244892]"
                }`}
              >
                {cat}
                {isSelected && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 rounded-full border-2 border-[#244892]"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Filter Indicator */}
      {selectedCategory && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-[#244892]">
            Showing category:{" "}
            <strong className="text-[#0e1117] capitalize">
              {selectedCategory.replace(/-/g, " ")}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="text-xs font-semibold text-[#244892] underline hover:text-[#0e1117] cursor-pointer"
          >
            Clear filter (view all)
          </button>
        </div>
      )}

      <ProductGrid products={filteredProducts} />
    </main>
  );
}

export default function Shop() {
  return (
    <PageFrame>
      <Suspense
        fallback={
          <main className="inner-page wrap">
            <p>Loading shop...</p>
          </main>
        }
      >
        <ShopContent />
      </Suspense>
    </PageFrame>
  );
}
