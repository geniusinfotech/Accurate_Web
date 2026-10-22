import type { StoreProduct } from './product';

/**
 * Shop filtering. Every option the shop shows is derived from the product list
 * itself (categories, fragrances, pack sizes, types, price range...), so adding
 * or editing a product in the admin changes the filters with no code change.
 * Within one filter, picks are OR'd; different filters are AND'd.
 */

export type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'name' | 'discount';

export interface ShopFilters {
  q: string;
  category: string[]; // category slugs (matches the existing /shop?category=slug links)
  fragrance: string[];
  size: string[];
  type: string[];
  highlight: string[];
  inStock: boolean;
  min?: number;
  max?: number;
  sort: SortKey;
}

export const emptyFilters: ShopFilters = {
  q: '',
  category: [],
  fragrance: [],
  size: [],
  type: [],
  highlight: [],
  inStock: false,
  sort: 'featured',
};

export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'name', label: 'Name: A to Z' },
];

export const slugify = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '-');
export const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const unique = (list: (string | undefined)[]) => [...new Set(list.map((s) => (s ?? '').trim()).filter(Boolean))];

const HIGHLIGHTS: { id: string; label: string; test: (p: StoreProduct) => boolean }[] = [
  { id: 'bestseller', label: 'Bestseller', test: (p) => !!p.isBestseller },
  { id: 'new', label: 'New arrival', test: (p) => !!p.isNewArrival },
  { id: 'featured', label: 'Featured', test: (p) => !!p.isFeatured },
  { id: 'concentrated', label: 'Concentrated', test: (p) => !!p.isConcentrated },
  { id: 'sale', label: 'On sale', test: (p) => p.discountPercent > 0 },
];

const categoryOf = (p: StoreProduct) => [p.category];
const fragrancesOf = (p: StoreProduct) => unique(p.availableFragrances);
// Only real pack variants count as sizes; product.size falls back to the product form ("Gel"), which is not a size.
const sizesOf = (p: StoreProduct) => unique(p.variants.filter((v) => v.isActive).map((v) => v.label));
const highlightsOf = (p: StoreProduct) => HIGHLIGHTS.filter((h) => h.test(p)).map((h) => h.id);
export const isInStock = (p: StoreProduct) =>
  p.variants.length ? p.variants.some((v) => v.isActive && v.stock > 0) : p.availableStock > 0;

type Facet = 'q' | 'category' | 'fragrance' | 'size' | 'type' | 'highlight' | 'stock' | 'price';

const anyOf = (picked: string[], have: string[]) => picked.length === 0 || picked.some((v) => have.includes(v));

/** True when the product passes every active filter, optionally ignoring one (for option counts). */
export function matches(p: StoreProduct, f: ShopFilters, skip?: Facet): boolean {
  if (skip !== 'q' && f.q.trim()) {
    const hay = [p.name, p.category, p.shortDescription, p.productType, ...p.tags, ...p.keywords, ...p.availableFragrances]
      .join(' ')
      .toLowerCase();
    if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.includes(t))) return false;
  }
  if (skip !== 'category' && !anyOf(f.category, categoryOf(p).map(slugify))) return false;
  if (skip !== 'fragrance' && !anyOf(f.fragrance, fragrancesOf(p))) return false;
  if (skip !== 'size' && !anyOf(f.size, sizesOf(p))) return false;
  if (skip !== 'type' && !anyOf(f.type, [p.productType])) return false;
  if (skip !== 'highlight' && !anyOf(f.highlight, highlightsOf(p))) return false;
  if (skip !== 'stock' && f.inStock && !isInStock(p)) return false;
  if (skip !== 'price') {
    if (f.min !== undefined && p.price < f.min) return false;
    if (f.max !== undefined && p.price > f.max) return false;
  }
  return true;
}

export function applyFilters(all: StoreProduct[], f: ShopFilters): StoreProduct[] {
  const out = all.filter((p) => matches(p, f));
  const by: Record<SortKey, ((a: StoreProduct, b: StoreProduct) => number) | null> = {
    featured: null, // keep the API's order (newest first)
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
    discount: (a, b) => b.discountPercent - a.discountPercent,
  };
  const cmp = by[f.sort];
  return cmp ? out.sort(cmp) : out;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface Facets {
  category: FacetOption[];
  fragrance: FacetOption[];
  size: FacetOption[];
  type: FacetOption[];
  highlight: FacetOption[];
  price: { min: number; max: number } | null;
  outOfStockExists: boolean;
}

/**
 * Options come from the whole catalogue; each count is "how many products you
 * would see if you picked this", honouring all the OTHER active filters.
 * Options that would show nothing are dropped unless already picked.
 */
export function buildFacets(all: StoreProduct[], f: ShopFilters): Facets {
  const build = (
    facet: Exclude<Facet, 'q' | 'stock' | 'price'>,
    values: (p: StoreProduct) => string[],
    label: (v: string) => string = (v) => v,
    toValue: (v: string) => string = (v) => v,
  ): FacetOption[] => {
    const counts = new Map<string, number>();
    for (const p of all) {
      const vals = values(p).map(toValue);
      const visible = matches(p, f, facet);
      for (const v of new Set(vals)) counts.set(v, (counts.get(v) ?? 0) + (visible ? 1 : 0));
    }
    const picked = f[facet] as string[];
    const names = new Map<string, string>();
    for (const p of all) for (const raw of values(p)) names.set(toValue(raw), label(raw));
    return [...counts]
      .filter(([v, n]) => n > 0 || picked.includes(v))
      .map(([value, count]) => ({ value, label: names.get(value) ?? value, count }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  };

  const prices = all.map((p) => p.price).filter((n) => Number.isFinite(n));
  return {
    category: build('category', categoryOf, (v) => v, slugify),
    fragrance: build('fragrance', fragrancesOf),
    size: build('size', sizesOf),
    type: build('type', (p) => [p.productType], typeLabel),
    highlight: build('highlight', highlightsOf, (id) => HIGHLIGHTS.find((h) => h.id === id)?.label ?? id),
    price: prices.length ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) } : null,
    outOfStockExists: all.some((p) => !isInStock(p)),
  };
}

// ---- URL <-> filters (so a filtered shop can be shared / bookmarked) --------

export function parseFilters(params: URLSearchParams): ShopFilters {
  const num = (k: string) => {
    const v = params.get(k);
    return v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : undefined;
  };
  const sort = params.get('sort') as SortKey | null;
  return {
    q: params.get('q') ?? '',
    category: params.getAll('category').filter((c) => c && c !== 'All').map(slugify),
    fragrance: params.getAll('fragrance'),
    size: params.getAll('size'),
    type: params.getAll('type'),
    highlight: params.getAll('highlight'),
    inStock: params.get('stock') === '1',
    min: num('min'),
    max: num('max'),
    sort: SORTS.some((s) => s.value === sort) ? (sort as SortKey) : 'featured',
  };
}

export function toParams(f: ShopFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set('q', f.q.trim());
  for (const key of ['category', 'fragrance', 'size', 'type', 'highlight'] as const) {
    for (const v of f[key]) p.append(key, v);
  }
  if (f.inStock) p.set('stock', '1');
  if (f.min !== undefined) p.set('min', String(f.min));
  if (f.max !== undefined) p.set('max', String(f.max));
  if (f.sort !== 'featured') p.set('sort', f.sort);
  return p;
}

/** How many filters are active (the sort order is not a filter). */
export function activeCount(f: ShopFilters): number {
  return (
    (f.q.trim() ? 1 : 0) +
    f.category.length + f.fragrance.length + f.size.length + f.type.length + f.highlight.length +
    (f.inStock ? 1 : 0) +
    (f.min !== undefined || f.max !== undefined ? 1 : 0)
  );
}
