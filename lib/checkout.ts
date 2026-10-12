import type { CartMeta, Product } from "@/components/storefront";

/** COD is implemented but intentionally disabled for launch. Flip to true to enable. */
export const COD_ENABLED = false;

export type PaymentMethod = "razorpay" | "cod";

export interface CheckoutItem {
  productId?: string;
  name: string;
  sku?: string;
  image?: string;
  quantity: number;
  price: number;
}

export interface PaymentQuote {
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  key: string;
  quote: PaymentQuote;
}

export interface ShopOrder {
  _id: string;
  orderNumber: string;
  customerName?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  items: Array<{
    productId?: string;
    name: string;
    sku?: string;
    image?: string;
    quantity: number;
    price: number;
    subtotal?: number;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: string;
  paymentId?: string;
  orderStatus: string;
  courierName?: string;
  trackingId?: string;
  notes?: string;
  createdAt?: string;
}

export interface ProfileUser {
  _id: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  phone?: string;
  avatar?: string;
  roles?: string[];
  totalAmountSpent?: number;
  addresses?: Array<{
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    isDefault?: boolean;
    // backend write-shape aliases
    street?: string;
    zip?: string;
    country?: string;
  }>;
}

export interface LoyaltyCoupon {
  id: string;
  code: string;
  discountValue: number;
  discountType: string;
  minSpendGoal?: number;
  isUnlocked?: boolean;
  progress?: number;
  remainingSpend?: number;
}

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/** Convert composite-key storefront cart into backend CreateOrderItemDto[]. */
export function cartToOrderItems(
  cart: Record<string | number, number>,
  cartMeta: Record<string, CartMeta>,
  products: Product[],
): CheckoutItem[] {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => {
      const k = String(key);
      const meta = cartMeta[k];
      const byId = products.find((p) => String(p.id) === k);
      // Composite keys look like `${productId}__${sku}__${fragrance}`
      const productIdPart = k.split("__")[0];
      const candidateId =
        byId && OBJECT_ID_RE.test(String(byId.id))
          ? String(byId.id)
          : OBJECT_ID_RE.test(productIdPart)
            ? productIdPart
            : undefined;
      const name = meta?.name || byId?.name || "Product";
      const price = meta?.price ?? byId?.price ?? 0;
      const skuPart = k.split("__")[1];
      return {
        ...(candidateId ? { productId: candidateId } : {}),
        name,
        ...(skuPart && skuPart !== "base" ? { sku: skuPart } : {}),
        ...(meta?.image ? { image: meta.image } : byId?.image ? { image: byId.image } : {}),
        quantity: qty,
        price,
      };
    });
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

/** Razorpay + payment quote require a strict 6-digit pincode. */
export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode.trim());
}

export function formatINR(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
