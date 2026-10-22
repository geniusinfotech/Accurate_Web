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
  Trash2,
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
  products: [],
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
  const { cart, cartMeta, setCart, clearCart, products: dynamicProducts } = useContext(StoreContext);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = prev;
    };
  }, [open, setOpen]);

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
    setCart((current) => {
      const next = (current[id] || 0) + delta;
      if (next <= 0) {
        const { [id]: _omit, ...rest } = current;
        return rest;
      }
      return { ...current, [id]: next };
    });

  const removeLine = (id: string | number) =>
    setCart((current) => {
      const { [id]: _omit, ...rest } = current;
      return rest;
    });

  return (
    <div
      className="overlay fixed inset-0 z-[100] flex justify-end bg-black/45 backdrop-blur-xs"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <aside
        className="cart-drawer relative flex h-full max-h-[100dvh] w-full max-w-[440px] flex-col bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-head shrink-0 flex items-start justify-between border-b border-border p-6 bg-background">
          <div>
            <p className="eyebrow text-[11px] font-bold uppercase tracking-wider text-primary">your selection</p>
            <div className="flex items-center gap-3">
              <h2 className="text-[28px] font-extrabold m-0 text-foreground">
                Cart <span className="text-sm font-medium text-muted">({totalItems})</span>
              </h2>
              {totalItems > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors ml-1 cursor-pointer"
                  title="Clear all items from cart"
                >
                  <Trash2 size={12} />
                  Clear all
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="grid size-9 place-items-center rounded-full text-muted hover:bg-slate-100 hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {totalItems === 0 ? (
          <div className="empty-cart flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-slate-100 text-primary">
              <ShoppingBag size={32} />
            </div>
            <p className="text-base font-semibold text-foreground">
              Your cart is waiting
              <br />
              for something good.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 text-sm font-bold text-primary underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items flex-1 overflow-y-auto overscroll-contain flex flex-col gap-3 px-6 py-4 min-h-0">
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
                    <div className="cart-item flex items-center gap-3.5 py-3 border-b border-border/60 last:border-b-0" key={id}>
                      <ProductArt product={artProduct} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-bold text-foreground m-0">{name}</h3>
                          <button
                            type="button"
                            onClick={() => removeLine(id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 -mr-1 cursor-pointer"
                            title="Remove product"
                            aria-label={`Remove ${name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {(meta?.variantLabel || meta?.fragrance) && (
                          <p className="text-[11px] text-muted truncate mt-0.5 mb-1">
                            {[meta?.variantLabel, meta?.fragrance].filter(Boolean).join(' • ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="qty flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => change(id, -1)}
                              aria-label="Decrease quantity"
                              className="cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span>{qty}</span>
                            <button
                              type="button"
                              onClick={() => change(id, 1)}
                              aria-label="Increase quantity"
                              className="cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-primary">₹{price * qty}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="cart-drawer-footer shrink-0 border-t border-border bg-background/95 backdrop-blur-md px-6 py-5 shadow-[0_-8px_20px_rgba(0,0,0,0.04)]">
              <div className="cart-total flex items-baseline justify-between mb-3">
                <div>
                  <span className="text-sm font-semibold text-muted">Subtotal</span>
                  <p className="text-[11px] text-muted m-0">Taxes &amp; shipping calculated at checkout</p>
                </div>
                <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  className="checkout w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-95 cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    router.push("/checkout");
                  }}
                >
                  <span>Buy Now / Checkout</span>
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-border bg-background py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-slate-100 cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    router.push("/cart");
                  }}
                >
                  View full cart details
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function mapApiProduct(p: ApiProduct, index: number): Product {
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
  const rawCategory: any = p.category;
  const categoryName =
    (typeof rawCategory === "object" && rawCategory?.name ? rawCategory.name : undefined) ||
    (typeof rawCategory === "string" && !/^[0-9a-fA-F]{24}$/.test(rawCategory) ? rawCategory : undefined) ||
    (typeof raw.productType === "string"
      ? raw.productType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
      : undefined) ||
    "Everyday Care";

  return {
    id: p._id || p.id,
    name: p.name,
    category: categoryName,
    price: firstVariant?.price ?? p.price,
    size,
    color: colors[index % colors.length],
    kind,
    image: p.images?.[0] || p.image ? getImageUrl(p.images?.[0] || p.image || "") : undefined,
  };
}

export function CartSite({ children, hideFooter = false }: { children: React.ReactNode; hideFooter?: boolean }) {
  const [cart, setCart] = useState<Record<string | number, number>>({});
  const [cartMeta, setCartMeta] = useState<Record<string, CartMeta>>({});
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
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
      <div className="site-shell min-h-screen flex flex-col justify-between">
        <Navbar onCart={() => setOpen(true)} count={count} />
        <div className="flex-1">{children}</div>
        {!hideFooter && <Footer />}
      </div>
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
    <main className="inner-page wrap product-detail-layout">
      <div
        className="product-detail-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        <style jsx>{`
          @media (min-width: 768px) {
            .product-detail-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 4rem !important;
            }
          }
        `}</style>
        <div
          className="product-art-large"
          style={{
            backgroundColor: "var(--color-cream)",
            borderRadius: "24px",
            padding: "2rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ProductArt product={product} />
        </div>
        <div className="product-info-large">
          <span className="eyebrow">{product.category}</span>
          <h1 style={{ fontSize: "clamp(1.75rem, 6vw, 3rem)", margin: "0.5rem 0" }}>{product.name}</h1>
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
              flexWrap: "wrap",
              gap: "1.5rem",
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

export function PageFrame({ children, hideFooter }: { children: React.ReactNode; hideFooter?: boolean }) {
  return <CartSite hideFooter={hideFooter}>{children}</CartSite>;
}
