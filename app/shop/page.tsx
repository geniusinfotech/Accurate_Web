"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PageFrame, mapApiProduct as toCard } from "@/components/storefront";
import type { Product as Card } from "@/components/storefront";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { api } from "@/lib/api";
import { mapApiProduct as toStoreProduct, formatINR, type StoreProduct } from "@/lib/product";
import type { PaginatedResponse, Product as ApiProduct } from "@/lib/types/api";
import {
  SORTS,
  activeCount,
  applyFilters,
  buildFacets,
  emptyFilters,
  parseFilters,
  toParams,
  type ShopFilters,
} from "@/lib/shop-filters";

const PAGE_SIZE = 50; // the API's maximum

/** The whole published catalogue, so filters and counts reflect every product, not just the first page. */
async function loadCatalogue(): Promise<ApiProduct[]> {
  const all: ApiProduct[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await api.get<PaginatedResponse<ApiProduct>>(
      `/products?status=published&isActive=true&limit=${PAGE_SIZE}&page=${page}`,
    );
    const items = res.items || [];
    all.push(...items);
    if (items.length === 0 || all.length >= (res.total ?? 0)) break;
  }
  return all;
}

/** Chips for what is currently applied, each removable. */
function activeChips(f: ShopFilters, labelFor: (key: "category" | "fragrance" | "size" | "type" | "highlight", v: string) => string) {
  const chips: { id: string; label: string; clear: (cur: ShopFilters) => ShopFilters }[] = [];
  if (f.q.trim()) chips.push({ id: "q", label: `“${f.q.trim()}”`, clear: (c) => ({ ...c, q: "" }) });
  for (const key of ["category", "fragrance", "size", "type", "highlight"] as const) {
    for (const v of f[key]) {
      chips.push({ id: `${key}:${v}`, label: labelFor(key, v), clear: (c) => ({ ...c, [key]: c[key].filter((x) => x !== v) }) });
    }
  }
  if (f.inStock) chips.push({ id: "stock", label: "In stock", clear: (c) => ({ ...c, inStock: false }) });
  if (f.min !== undefined || f.max !== undefined) {
    const label = `${f.min !== undefined ? formatINR(f.min) : "Any"} – ${f.max !== undefined ? formatINR(f.max) : "Any"}`;
    chips.push({ id: "price", label, clear: (c) => ({ ...c, min: undefined, max: undefined }) });
  }
  return chips;
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);

  const [items, setItems] = useState<{ rich: StoreProduct; card: Card }[] | null>(null);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(filters.q);

  const load = useCallback(() => {
    setError("");
    setItems(null);
    loadCatalogue()
      .then((raw) => setItems(raw.map((p, i) => ({ rich: toStoreProduct(p), card: toCard(p, i) }))))
      .catch((e: Error) => setError(e.message || "Could not load products."));
  }, []);
  useEffect(load, [load]);

  const update = useCallback(
    (next: ShopFilters) => {
      const qs = toParams(next).toString();
      router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
    },
    [router],
  );

  // Search box: debounced into the URL; follows the URL when it's cleared elsewhere.
  useEffect(() => setSearch(filters.q), [filters.q]);
  useEffect(() => {
    if (search === filters.q) return;
    const t = setTimeout(() => update({ ...filters, q: search }), 300);
    return () => clearTimeout(t);
  }, [search, filters, update]);

  // Mobile drawer: lock page scroll, close on Escape.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawer]);

  const rich = useMemo(() => (items ?? []).map((i) => i.rich), [items]);
  const cardById = useMemo(() => new Map((items ?? []).map((i) => [i.rich.id, i.card])), [items]);
  const facets = useMemo(() => buildFacets(rich, filters), [rich, filters]);
  const visible = useMemo(() => applyFilters(rich, filters), [rich, filters]);
  const cards = useMemo(() => visible.map((p) => cardById.get(p.id)).filter((c): c is Card => !!c), [visible, cardById]);

  const labelFor = (key: "category" | "fragrance" | "size" | "type" | "highlight", v: string) =>
    facets[key].find((o) => o.value === v)?.label ?? v.replace(/-/g, " ");
  const chips = activeChips(filters, labelFor);
  const count = activeCount(filters);
  const clearAll = () => update({ ...emptyFilters, sort: filters.sort });

  const panel = <FilterPanel facets={facets} filters={filters} onChange={update} />;

  return (
    <main className="inner-page wrap">
      <p className="eyebrow">the daily edit</p>
      <h1>
        Good things for
        <br />
        <em>clean spaces.</em>
      </h1>
      <p className="page-intro mb-8">Simple, effective care for every room and ritual.</p>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[200px] flex-1">
          <span className="sr-only">Search products</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-[#244892] focus:outline-none"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={filters.sort}
            onChange={(e) => update({ ...filters, sort: e.target.value as ShopFilters["sort"] })}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-[#244892] focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#244892] px-5 py-2.5 text-sm font-semibold text-white lg:hidden"
        >
          <SlidersHorizontal size={16} />
          Filters{count > 0 ? ` (${count})` : ""}
        </button>
      </div>

      {/* Active filters */}
      {chips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => update(c.clear(filters))}
              aria-label={`Remove filter ${c.label}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#244892]/30 bg-[#244892]/10 px-3 py-1.5 text-xs font-semibold text-[#244892] hover:bg-[#244892]/20"
            >
              {c.label}
              <X size={12} />
            </button>
          ))}
          <button type="button" onClick={clearAll} className="px-2 text-xs font-semibold text-slate-500 underline hover:text-slate-900">
            Clear all
          </button>
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 lg:block" aria-label="Product filters">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Filters</h2>
            {count > 0 && (
              <button type="button" onClick={clearAll} className="text-xs font-semibold text-slate-500 underline hover:text-slate-900">
                Clear all
              </button>
            )}
          </div>
          {items ? panel : <p className="py-4 text-sm text-slate-400">Loading filters…</p>}
        </aside>

        <section aria-live="polite">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
              <p className="font-semibold text-rose-800">{error}</p>
              <button type="button" onClick={load} className="mt-4 rounded-full bg-[#244892] px-5 py-2.5 text-sm font-semibold text-white">
                Try again
              </button>
            </div>
          ) : !items ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-[1.75rem] bg-slate-100" />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-slate-900">No products match these filters</p>
              <p className="mt-1 text-sm text-slate-500">Try removing a filter or two.</p>
              {count > 0 && (
                <button type="button" onClick={clearAll} className="mt-5 rounded-full bg-[#244892] px-5 py-2.5 text-sm font-semibold text-white">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">
                Showing {cards.length} of {rich.length} product{rich.length === 1 ? "" : "s"}
              </p>
              <ProductGrid products={cards} />
            </>
          )}
        </section>
      </div>

      {/* Mobile filter drawer — portalled so the page-transition wrapper's transform can't displace it */}
      {drawer &&
        createPortal(
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" onClick={() => setDrawer(false)} className="absolute inset-0 bg-slate-950/50" />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900">Filters</h2>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close filters" className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto px-5">{panel}</div>
            <div className="flex gap-3 border-t border-slate-200 px-5 py-4">
              {count > 0 && (
                <button type="button" onClick={clearAll} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
                  Clear all
                </button>
              )}
              <button type="button" onClick={() => setDrawer(false)} className="flex-1 rounded-full bg-[#244892] px-5 py-3 text-sm font-semibold text-white">
                Show {cards.length} product{cards.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>,
          document.body,
        )}
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
