import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { StoreProduct } from './product.ts';
import { applyFilters, buildFacets, emptyFilters, parseFilters, toParams } from './shop-filters.ts';

const product = (over: Partial<StoreProduct>): StoreProduct =>
  ({
    id: 'x', name: 'P', category: 'Laundry Care', productType: 'liquid_detergent', price: 100, discountPercent: 0,
    availableStock: 5, availableFragrances: [], tags: [], keywords: [], variants: [], size: '1 L', ...over,
  }) as StoreProduct;

const catalogue = [
  product({ id: 'a', name: 'Detergent', price: 249, availableFragrances: ['Lavender', 'Lemon'], isBestseller: true }),
  product({ id: 'b', name: 'Dish Gel', category: 'Dish Care', productType: 'dishwash', price: 129, size: '500 ml', discountPercent: 10 }),
  product({ id: 'c', name: 'Floor Cleaner', category: 'Surface Care', price: 199, availableFragrances: ['Lemon'], availableStock: 0 }),
];
const ids = (list: StoreProduct[]) => list.map((p) => p.id);

test('options are derived from the products, with counts', () => {
  const facets = buildFacets(catalogue, emptyFilters);
  assert.deepEqual(facets.category.map((o) => o.label), ['Dish Care', 'Laundry Care', 'Surface Care']);
  assert.deepEqual(facets.fragrance.map((o) => [o.label, o.count]), [['Lavender', 1], ['Lemon', 2]]);
  assert.deepEqual(facets.highlight.map((o) => o.label), ['Bestseller', 'On sale']); // only ones that exist
  assert.deepEqual(facets.price, { min: 129, max: 249 });
  assert.equal(facets.outOfStockExists, true);
});

test('pack sizes come from variants only, not from the product form', () => {
  const withVariants = product({ id: 'v', variants: [{ label: '1 L', isActive: true, stock: 3 }, { label: '5 L', isActive: true, stock: 3 }] as StoreProduct['variants'] });
  const facets = buildFacets([...catalogue, withVariants], emptyFilters);
  assert.deepEqual(facets.size.map((o) => o.label), ['1 L', '5 L']); // "500 ml" form-fallback of product b is ignored
  assert.deepEqual(ids(applyFilters([...catalogue, withVariants], { ...emptyFilters, size: ['5 L'] })), ['v']);
});

test('a new product shows up as a new option without any code change', () => {
  const more = [...catalogue, product({ id: 'd', category: 'Glass Care', availableFragrances: ['Mint'] })];
  const facets = buildFacets(more, emptyFilters);
  assert.ok(facets.category.some((o) => o.label === 'Glass Care'));
  assert.ok(facets.fragrance.some((o) => o.label === 'Mint'));
});

test('picks are OR within a filter and AND across filters', () => {
  assert.deepEqual(ids(applyFilters(catalogue, { ...emptyFilters, fragrance: ['Lavender', 'Lemon'] })), ['a', 'c']);
  assert.deepEqual(ids(applyFilters(catalogue, { ...emptyFilters, fragrance: ['Lemon'], inStock: true })), ['a']);
  assert.deepEqual(ids(applyFilters(catalogue, { ...emptyFilters, min: 130, max: 220 })), ['c']);
});

test('counts honour the other active filters, and dead options disappear', () => {
  const facets = buildFacets(catalogue, { ...emptyFilters, category: ['dish-care'] });
  assert.deepEqual(facets.fragrance, []); // dish gel has no fragrance
  assert.equal(facets.category.find((o) => o.value === 'laundry-care')?.count, 1); // own facet ignores itself
});

test('sorting and URL round-trip', () => {
  assert.deepEqual(ids(applyFilters(catalogue, { ...emptyFilters, sort: 'price_asc' })), ['b', 'c', 'a']);
  const f = { ...emptyFilters, category: ['dish-care'], fragrance: ['Lime, Lemon'], min: 50, max: undefined, inStock: true };
  assert.deepEqual(parseFilters(toParams(f)), f); // commas in names survive
  assert.deepEqual(parseFilters(new URLSearchParams('category=Laundry Care')).category, ['laundry-care']); // old links still work
});
