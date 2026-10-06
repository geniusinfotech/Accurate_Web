import type { Product as ApiProduct, ProductVariant as ApiVariant } from './types/api';

// ---------------------------------------------------------------------------
// Shared storefront product model — supports both backend shapes:
//  - variants with `weight: "1 kg"` (current backend, e.g. Accurate Pro Powder)
//  - legacy variants with `packSize + packUnit`
// ---------------------------------------------------------------------------

export type ProductKind = 'bottle' | 'pouch' | 'pump' | 'spray';

export interface StoreVariant {
  key: string;
  sku: string;
  /** Display label e.g. "1 kg", "500 ml" */
  label: string;
  price: number;
  mrp?: number;
  discountPercent: number;
  stock: number;
  images: string[];
  isActive: boolean;
  /** Numeric quantity + unit parsed from label when possible (for unit pricing) */
  qty?: number;
  unit?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId?: string;
  brand?: string;
  productType: string;
  productForm?: string;
  description: string;
  shortDescription?: string;
  price: number;
  mrp?: number;
  discountPercent: number;
  images: string[];
  benefits: string[];
  features: string[];
  ingredients: string[];
  tags: string[];
  keywords: string[];
  kind: ProductKind;
  stock: number;
  availableStock: number;
  reservedStock: number;
  stockStatus?: string;
  isConcentrated?: boolean;
  concentration?: string;
  availableFragrances: string[];
  fragrance?: string;
  color?: string;
  usage?: ApiProduct['usage'];
  safety?: ApiProduct['safety'];
  packaging?: ApiProduct['packaging'];
  shelfLife?: string;
  storageInstructions?: string;
  certifications: string[];
  gstRate?: string;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  status?: string;
  size: string;
  variants: StoreVariant[];
}

export function getProductKind(packagingType?: string): ProductKind {
  const value = packagingType?.toLowerCase() || '';
  if (value.includes('pouch')) return 'pouch';
  if (value.includes('pump')) return 'pump';
  if (value.includes('spray') || value.includes('trigger')) return 'spray';
  return 'bottle';
}

function toDiscount(price: number, mrp?: number, fallback?: number): number {
  if (mrp && mrp > price) return Math.round(((mrp - price) / mrp) * 100);
  return fallback ?? 0;
}

/** Parse "1 kg", "500ml", "3 KG" → { qty: 1, unit: "kg", label: "1 kg" } */
export function parseWeightLabel(raw?: string): { qty?: number; unit?: string; label: string } {
  if (!raw || !raw.trim()) return { label: '' };
  const label = raw.trim().replace(/\s+/g, ' ');
  const m = label.match(/^([\d.,]+)\s*([a-zA-Z]+)?/);
  if (!m) return { label };
  const qty = parseFloat(m[1].replace(/,/g, ''));
  const unit = (m[2] || '').toLowerCase();
  const normUnit =
    unit === 'g' || unit === 'gm' || unit === 'gms' || unit === 'gram' || unit === 'grams'
      ? 'g'
      : unit === 'kgs' || unit === 'kilogram' || unit === 'kilograms'
        ? 'kg'
        : unit === 'ltr' || unit === 'ltrs' || unit === 'litre' || unit === 'liter' || unit === 'litres' || unit === 'liters'
          ? 'L'
          : unit === 'mls'
            ? 'ml'
            : unit || undefined;
  return { qty: Number.isFinite(qty) ? qty : undefined, unit: normUnit, label };
}

/** "160.00/kg" style helper for comparing 1kg vs 3kg packs. */
export function unitPriceLabel(price: number, qty?: number, unit?: string): string | null {
  if (!qty || !unit || qty <= 0) return null;
  // Normalise g→kg and ml→L for a fair comparison
  let per = price / qty;
  let perUnit = unit;
  if (unit === 'g') {
    per = (price / qty) * 1000;
    perUnit = 'kg';
  } else if (unit === 'ml') {
    per = (price / qty) * 1000;
    perUnit = 'L';
  }
  return `₹${per.toFixed(per >= 100 ? 0 : 2)}/${perUnit}`;
}

export function formatINR(n: number): string {
  return `₹${(n ?? 0).toLocaleString('en-IN')}`;
}

function variantKey(v: any, index: number): string {
  // Suffix the index so keys stay unique even if stored variantIds collide
  // (e.g. two variants generated in the same millisecond).
  const base = String(v.variantId || v._id || v.sku || `v${index}`);
  return `${base}::${index}`;
}

export function mapApiVariant(v: any, index = 0, fallbackDiscount = 0): StoreVariant {
  const label =
    (typeof v.weight === 'string' && v.weight.trim()) ||
    (v.packSize && v.packUnit ? `${v.packSize} ${v.packUnit}` : '') ||
    (typeof v.size === 'string' ? v.size : '') ||
    `Pack ${index + 1}`;
  const parsed = parseWeightLabel(label);
  const price = Number(v.price ?? 0);
  const mrp = v.mrp != null ? Number(v.mrp) : undefined;
  const images = Array.isArray(v.images) ? v.images.filter(Boolean) : [];
  return {
    key: variantKey(v, index),
    sku: String(v.sku || ''),
    label: parsed.label || label,
    price,
    mrp,
    discountPercent: toDiscount(price, mrp, fallbackDiscount),
    stock: Number(v.stock ?? 0),
    images,
    isActive: v.isActive !== false,
    qty: parsed.qty,
    unit: parsed.unit,
  };
}

export function mapApiProduct(p: ApiProduct): StoreProduct {
  const raw: any = p;
  const baseDiscount = Number(raw.discountPercent ?? 0);

  const apiVariants: any[] = Array.isArray(raw.variants) ? raw.variants : [];
  const variants = apiVariants.map((v, i) => mapApiVariant(v, i, baseDiscount));
  const active = variants.filter((v) => v.isActive);
  const first = active[0] ?? variants[0];

  const price = first?.price ?? Number(raw.price ?? 0);
  const mrp = first?.mrp ?? (raw.mrp != null ? Number(raw.mrp) : undefined);

  const productImages: string[] = Array.isArray(raw.images)
    ? raw.images.filter(Boolean)
    : raw.image
      ? [raw.image]
      : [];

  const stock = Number(first?.stock ?? raw.stock ?? 0);
  const reserved = Number(raw.reservedStock ?? 0);
  const availableStock = Math.max(0, stock - (Number.isFinite(reserved) ? reserved : 0));

  const fragrances: string[] = Array.isArray(raw.availableFragrances)
    ? raw.availableFragrances.filter(Boolean)
    : raw.fragrance
      ? [raw.fragrance]
      : [];

  return {
    id: String(raw._id || raw.id),
    name: String(raw.name || 'Product'),
    sku: String(raw.sku || ''),
    category: raw.category?.name || raw.categoryName || 'Cleaning Essentials',
    categoryId: raw.categoryId || raw.category?._id,
    brand: raw.brand?.name || raw.brandName,
    productType: String(raw.productType || 'other'),
    productForm: raw.productForm,
    description:
      raw.description ||
      'A carefully formulated essential designed for effective everyday cleaning.',
    shortDescription: raw.shortDescription,
    price,
    mrp,
    discountPercent: toDiscount(price, mrp, baseDiscount),
    images: productImages,
    benefits: Array.isArray(raw.benefits) ? raw.benefits : [],
    features: Array.isArray(raw.features) ? raw.features : [],
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
    kind: getProductKind(raw.packaging?.type),
    stock,
    availableStock,
    reservedStock: reserved,
    stockStatus: raw.stockStatus,
    isConcentrated: raw.isConcentrated,
    concentration: raw.concentration,
    availableFragrances: fragrances,
    fragrance: raw.fragrance,
    color: raw.color,
    usage: raw.usage,
    safety: raw.safety,
    packaging: raw.packaging,
    shelfLife: raw.shelfLife,
    storageInstructions: raw.storageInstructions,
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    gstRate: raw.gstRate,
    isNewArrival: raw.isNewArrival,
    isBestseller: raw.isBestseller,
    isFeatured: raw.isFeatured,
    isPremium: raw.isPremium,
    status: raw.status,
    size: first?.label || raw.productForm || '',
    variants,
  };
}

/** Images for the currently selected variant, falling back to product images. */
export function imagesFor(product: StoreProduct, variant?: StoreVariant | null): string[] {
  if (variant && variant.images.length > 0) return variant.images;
  return product.images;
}

export function stockLabel(available: number): { text: string; tone: 'in' | 'low' | 'out' } {
  if (available <= 0) return { text: 'Currently out of stock', tone: 'out' };
  if (available <= 10) return { text: `Only ${available} left in stock`, tone: 'low' };
  return { text: 'In stock — ready to ship', tone: 'in' };
}
