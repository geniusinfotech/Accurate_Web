"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Facets, ShopFilters } from "@/lib/shop-filters";

type ListKey = "category" | "fragrance" | "size" | "type" | "highlight";

const SECTIONS: { key: ListKey; title: string }[] = [
  { key: "category", title: "Category" },
  { key: "highlight", title: "Highlights" },
  { key: "fragrance", title: "Fragrance" },
  { key: "size", title: "Pack size" },
  { key: "type", title: "Product type" },
];

const summaryCls = "flex cursor-pointer list-none items-center justify-between text-sm font-bold text-slate-900 [&::-webkit-details-marker]:hidden";
const sectionCls = "group border-b border-slate-200 py-4";

/** Min/max price boxes; applied on blur or Enter so the grid doesn't reshuffle per keystroke. */
function PriceFilter({ bounds, filters, onChange }: { bounds: { min: number; max: number }; filters: ShopFilters; onChange: (f: ShopFilters) => void }) {
  const [lo, setLo] = useState(filters.min?.toString() ?? "");
  const [hi, setHi] = useState(filters.max?.toString() ?? "");

  // Follow the URL when filters are cleared or changed from outside.
  useEffect(() => {
    setLo(filters.min?.toString() ?? "");
    setHi(filters.max?.toString() ?? "");
  }, [filters.min, filters.max]);

  const commit = () => {
    let min = lo === "" ? undefined : Math.max(0, Number(lo));
    let max = hi === "" ? undefined : Math.max(0, Number(hi));
    if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
    if (min !== filters.min || max !== filters.max) onChange({ ...filters, min, max });
  };
  const box = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#244892] focus:outline-none";
  const onEnter = (e: React.KeyboardEvent) => e.key === "Enter" && commit();

  return (
    <div className="mt-3 flex items-center gap-2">
      <input type="number" inputMode="numeric" min={0} value={lo} placeholder={`₹${bounds.min}`} aria-label="Minimum price" onChange={(e) => setLo(e.target.value)} onBlur={commit} onKeyDown={onEnter} className={box} />
      <span className="text-slate-400">–</span>
      <input type="number" inputMode="numeric" min={0} value={hi} placeholder={`₹${bounds.max}`} aria-label="Maximum price" onChange={(e) => setHi(e.target.value)} onBlur={commit} onKeyDown={onEnter} className={box} />
    </div>
  );
}

/** Every option here comes from the product data (see lib/shop-filters.ts). */
export function FilterPanel({ facets, filters, onChange }: { facets: Facets; filters: ShopFilters; onChange: (f: ShopFilters) => void }) {
  const toggle = (key: ListKey, value: string) =>
    onChange({ ...filters, [key]: filters[key].includes(value) ? filters[key].filter((v) => v !== value) : [...filters[key], value] });

  return (
    <div>
      {SECTIONS.map(({ key, title }) => {
        const options = facets[key];
        // A filter with a single choice filters nothing, so only show it once it has something to choose between.
        if (options.length < 2 && filters[key].length === 0) return null;
        return (
          <details key={key} open className={sectionCls}>
            <summary className={summaryCls}>
              {title}
              <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-3 space-y-2.5">
              {options.map((o) => (
                <li key={o.value}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input type="checkbox" checked={filters[key].includes(o.value)} onChange={() => toggle(key, o.value)} className="size-4 shrink-0 accent-[#244892]" />
                    <span className="flex-1">{o.label}</span>
                    <span className="text-xs text-slate-400">{o.count}</span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        );
      })}

      {facets.price && facets.price.max > facets.price.min && (
        <details open className={sectionCls}>
          <summary className={summaryCls}>
            Price
            <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <PriceFilter bounds={facets.price} filters={filters} onChange={onChange} />
        </details>
      )}

      {(facets.outOfStockExists || filters.inStock) && (
        <div className="py-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-900">
            <input type="checkbox" checked={filters.inStock} onChange={(e) => onChange({ ...filters, inStock: e.target.checked })} className="size-4 accent-[#244892]" />
            In stock only
          </label>
        </div>
      )}
    </div>
  );
}
