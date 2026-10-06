"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Globe2,
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import { getImageUrl } from "../lib/api";
import {
  Product as ApiProduct,
  Category,
  PaginatedResponse,
} from "../lib/types/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";
import { Navbar } from "./layout/Navbar";
import { Footer } from "./layout/Footer";
import { AddToCartButton } from "./product/AddToCartButton";

export type Product = {
  id: string | number;
  name: string;
  category: string;
  price: number;
  size: string;
  color: string;
  kind: "bottle" | "pouch" | "pump" | "spray";
  image?: string;
};
export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Accurate Liquid",
    category: "Laundry care",
    price: 249,
    size: "1 L",
    color: "aqua",
    kind: "bottle",
  },
  {
    id: 2,
    name: "Umiyadham Floor Care",
    category: "Home care",
    price: 199,
    size: "1 L",
    color: "gold",
    kind: "bottle",
  },
  {
    id: 3,
    name: "Pure Hands Wash",
    category: "Personal care",
    price: 149,
    size: "500 ml",
    color: "coral",
    kind: "pump",
  },
  {
    id: 4,
    name: "Accurate Refill Pack",
    category: "Refill pouch",
    price: 399,
    size: "2 L",
    color: "sage",
    kind: "pouch",
  },
];

export type CartMeta = {
  name: string;
  price: number;
  image?: string;
  variantLabel?: string;
  fragrance?: string;
};

const StoreContext = createContext<{
  products: Product[];
  cart: Record<string | number, number>;
  cartMeta: Record<string, CartMeta>;
  addToCart: (key: string | number, qty?: number, meta?: CartMeta) => void;
  setCart: React.Dispatch<
    React.SetStateAction<Record<string | number, number>>
  >;
  setCartMeta: React.Dispatch<React.SetStateAction<Record<string, CartMeta>>>;
  clearCart: () => void;
  loading: boolean;
  error: string | null;
}>({
  products: fallbackProducts,
  cart: {},
  cartMeta: {},
  addToCart: () => {},
  setCart: () => {},
  setCartMeta: () => {},
  clearCart: () => {},
  loading: true,
  error: null,
});

const CART_KEY = "accurate_liquid_cart";
const CART_META_KEY = "accurate_liquid_cart_meta";

function readStoredCart(): {
  cart: Record<string, number>;
  meta: Record<string, CartMeta>;
} {
  if (typeof window === "undefined") return { cart: {}, meta: {} };
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const rawMeta = window.localStorage.getItem(CART_META_KEY);
    const cart = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const meta = rawMeta ? (JSON.parse(rawMeta) as Record<string, CartMeta>) : {};
    return {
      cart: cart && typeof cart === "object" ? cart : {},
      meta: meta && typeof meta === "object" ? meta : {},
    };
  } catch {
    return { cart: {}, meta: {} };
  }
}

export function useStore() {
  return useContext(StoreContext);
}

export function ProductArt({ product }: { product: Product }) {
  if (!product) return null;
  if (product.image) {
    return (
      <div className={`product-art art-${product.color}`}>
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
    );
  }
  return (
    <div
      className={`product-art art-${product.color} art-${product.kind}`}
      aria-label={`${product.name} product illustration`}
      role="img"
    >
      {product.kind === "pouch" ? (
        <div className="pouch">
          <span>ACCURATE</span>
          <b>LIQUID</b>
          <small>REFILL</small>
        </div>
      ) : (
        <div className="bottle">
          <div className="cap" />
          <div className="label">
            <span>{product.color === "gold" ? "UMIYADHAM" : "ACCURATE"}</span>
            <strong>{product.kind === "pump" ? "HANDS" : "LIQUID"}</strong>
            <small>{product.size}</small>
          </div>
        </div>
      )}
      <span className="art-sparkle">✦</span>
    </div>
  );
}

export function CartDrawer({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const router = useRouter();
  const { cart, cartMeta, setCart, products: dynamicProducts } = useContext(StoreContext);
  if (!open) return null;
  const totalItems = Object.values(cart).reduce((sum, count) => sum + count, 0);

  const linePrice = (id: string, qty: number) => {
    const meta = cartMeta[id];
    if (meta) return meta.price * qty;
    const product = dynamicProducts.find((p) => String(p.id) === String(id));
    return (product?.price || 0) * qty;
  };
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => sum + linePrice(id, qty), 0);

  const change = (id: string | number, delta: number) =>
    setCart((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] || 0) + delta),
    }));

  return (
    <div className="overlay" onClick={() => setOpen(false)}>
      <aside
        className="cart-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          <div>
            <p className="eyebrow">your selection</p>
            <h2>
              Cart <span>({totalItems})</span>
            </h2>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close cart">
            <X />
          </button>
        </div>
        {totalItems === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={34} />
            <p>
              Your cart is waiting
              <br />
              for something good.
            </p>
            <button onClick={() => setOpen(false)}>Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {Object.entries(cart)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => {
                  const meta = cartMeta[id];
                  const product = dynamicProducts.find((p) => String(p.id) === String(id));
                  const name = meta?.name || product?.name || 'Product';
                  const price = meta?.price ?? product?.price ?? 0;
                  const artProduct = product || (meta ? {
                    id,
                    name,
                    category: '',
                    price,
                    size: meta.variantLabel || '',
                    color: 'aqua',
                    kind: 'bottle' as const,
                    image: meta.image,
                  } : null);
                  if (!artProduct) return null;
                  return (
                  <div className="cart-item" key={id}>
                    <ProductArt product={artProduct} />
                    <div>
                      <h3>{name}</h3>
                      {(meta?.variantLabel || meta?.fragrance) && (
                        <p style={{ color: 'var(--color-muted)', fontSize: 11 }}>
                          {[meta?.variantLabel, meta?.fragrance].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      <p>₹{price}</p>
                      <div className="qty">
                        <button onClick={() => change(id, -1)}>
                          <Minus size={13} />
                        </button>
                        <span>{qty}</span>
                        <button onClick={() => change(id, 1)}>
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
            </div>
            <div className="cart-total">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div className="flex gap-2.5">
              <button
                className="checkout"
                style={{ flex: 1 }}
                onClick={() => {
                  setOpen(false);
                  router.push("/cart");
                }}
              >
                View cart
              </button>
              <button
                className="checkout"
                style={{ flex: 1 }}
                onClick={() => {
                  setOpen(false);
                  router.push("/checkout");
                }}
              >
                Checkout <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function mapApiProduct(p: ApiProduct, index: number): Product {
  const colors = ["aqua", "gold", "coral", "sage"];
  const kinds: Product["kind"][] = ["bottle", "pump", "pouch", "spray"];
  const raw: any = p;
  const firstVariant = Array.isArray(raw.variants)
    ? raw.variants.find((v: any) => v?.isActive !== false) || raw.variants[0]
    : null;
  const size =
    (typeof firstVariant?.weight === "string" && firstVariant.weight.trim()) ||
    (firstVariant?.packSize && firstVariant?.packUnit
      ? `${firstVariant.packSize} ${firstVariant.packUnit}`
      : null) ||
    raw.productForm ||
    raw.dimensions?.volume ||
    raw.description?.match(/(\d+\.?\d?\s?[LMl])/)?.[0] ||
    "1 L";
  const packagingType = String(raw.packaging?.type || "").toLowerCase();
  const kind: Product["kind"] = packagingType.includes("pouch")
    ? "pouch"
    : packagingType.includes("pump")
      ? "pump"
      : packagingType.includes("spray") || packagingType.includes("trigger")
        ? "spray"
        : kinds[index % kinds.length];
  return {
    id: p._id || p.id,
    name: p.name,
    category: p.category?.name || p.categoryId || "Category",
    price: firstVariant?.price ?? p.price,
    size,
    color: colors[index % colors.length],
    kind,
    image: p.images?.[0] || p.image ? getImageUrl(p.images?.[0] || p.image || "") : undefined,
  };
}

export function CartSite({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string | number, number>>({});
  const [cartMeta, setCartMeta] = useState<Record<string, CartMeta>>({});
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted cart once on mount (client-only).
  useEffect(() => {
    const stored = readStoredCart();
    if (Object.keys(stored.cart).length > 0) setCart(stored.cart);
    if (Object.keys(stored.meta).length > 0) setCartMeta(stored.meta);
    setHydrated(true);
  }, []);

  // Persist cart on change (after hydration).
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.localStorage.setItem(CART_META_KEY, JSON.stringify(cartMeta));
    } catch {
      // Storage full / private mode — cart still works in-memory.
    }
  }, [cart, cartMeta, hydrated]);

  useEffect(() => {
    let mounted = true;
    api
      .get<PaginatedResponse<ApiProduct>>(
        "/products?status=published&isActive=true&limit=20",
      )
      .then((res) => {
        if (!mounted) return;
        const items = res.items || (res as any).products || (res as any).data || [];
        if (Array.isArray(items) && items.length > 0) {
          setProducts(items.map(mapApiProduct));
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const count = Object.values(cart).reduce((s, n) => s + n, 0);

  const addToCart = React.useCallback((key: string | number, qty = 1, meta?: CartMeta) => {
    setCart((c) => ({ ...c, [key]: (c[key] || 0) + qty }));
    if (meta) {
      setCartMeta((m) => ({ ...m, [String(key)]: meta }));
    }
  }, []);

  const clearCart = React.useCallback(() => {
    setCart({});
    setCartMeta({});
    try {
      window.localStorage.removeItem(CART_KEY);
      window.localStorage.removeItem(CART_META_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <StoreContext.Provider value={{ products, cart, cartMeta, addToCart, setCart, setCartMeta, clearCart, loading, error }}>
      <Navbar onCart={() => setOpen(true)} count={count} />
      {children}
      <Footer />
      <CartDrawer open={open} setOpen={setOpen} />
    </StoreContext.Provider>
  );
}

export function ProductDetailView({ id }: { id: string }) {
  const toast = useToast();
  const { products: dynamicProducts, cart, setCart } = useContext(StoreContext);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const found = dynamicProducts.find((p) => String(p.id) === id);
    if (found) {
      setProduct(found);
      setLoading(false);
      return;
    }
    api
      .get<ApiProduct>(`/products/${id}`)
      .then((p) => {
        if (!mounted) return;
        setProduct(mapApiProduct(p, 0));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, dynamicProducts]);

  const add = () => {
    if (product) {
      setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
      toast.success(`${product.name} added to cart`);
    }
  };

  if (loading)
    return (
      <div className="inner-page wrap">
        <p>Loading product...</p>
      </div>
    );
  if (error)
    return (
      <div className="inner-page wrap">
        <p>Error: {error}</p>
      </div>
    );
  if (!product)
    return (
      <div className="inner-page wrap">
        <p>Product not found</p>
      </div>
    );

  return (
    <main
      className="inner-page wrap product-detail-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        alignItems: "center",
      }}
    >
      <div
        className="product-art-large"
        style={{
          backgroundColor: "var(--color-cream)",
          borderRadius: "24px",
          padding: "4rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ProductArt product={product} />
      </div>
      <div className="product-info-large">
        <span className="eyebrow">{product.category}</span>
        <h1 style={{ fontSize: "3rem", margin: "0.5rem 0" }}>{product.name}</h1>
        <p
          className="price"
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--color-charcoal)",
            marginBottom: "2rem",
          }}
        >
          ₹{product.price}
        </p>
        <p
          className="description"
          style={{
            fontSize: "1.1rem",
            color: "var(--color-muted)",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          Effective, effortless care designed for your daily rituals. Made with
          honest ingredients and a lighter footprint.
        </p>
        <div
          className="specs"
          style={{
            display: "flex",
            gap: "2rem",
            marginBottom: "2rem",
            fontSize: "0.9rem",
            color: "var(--color-muted)",
          }}
        >
          <div>
            <strong>Size:</strong> {product.size}
          </div>
          <div>
            <strong>Type:</strong> {product.kind}
          </div>
        </div>
        <AddToCartButton
          variant="grid"
          className="primary-button"
          onAdd={add}
        />
      </div>
    </main>
  );
}

export function CertificateModal({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="certificate-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={close}
          aria-label="Close certificates"
        >
          <X />
        </button>
        <div className="modal-seal">✓</div>
        <p className="eyebrow">our promise, in writing</p>
        <h2>
          Verified to the
          <br />
          <em>last drop.</em>
        </h2>
        {[
          "ISO 9001:2015 quality management",
          "Genuine Trade Mark registered",
          "Made in Gujarat, India",
        ].map((text) => (
          <div className="cert-row" key={text}>
            <Check size={18} />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageFrame({ children }: { children: React.ReactNode }) {
  return <CartSite>{children}</CartSite>;
}
