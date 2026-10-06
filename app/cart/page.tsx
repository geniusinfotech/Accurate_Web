"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PageFrame, ProductArt, useStore } from "@/components/storefront";
import { formatINR } from "@/lib/checkout";

function CartPageInner() {
  const router = useRouter();
  const { cart, cartMeta, setCart, products } = useStore();

  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const linePrice = (id: string, qty: number) => {
    const meta = cartMeta[id];
    if (meta) return meta.price * qty;
    const p = products.find((x) => String(x.id) === String(id));
    return (p?.price || 0) * qty;
  };
  const subtotal = entries.reduce((s, [id, qty]) => s + linePrice(id, qty), 0);
  const count = entries.reduce((s, [, qty]) => s + qty, 0);

  const change = (id: string | number, delta: number) =>
    setCart((c) => {
      const next = Math.max(0, (c[id] || 0) + delta);
      if (next === 0) {
        const { [id]: _omit, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: next };
    });

  const remove = (id: string | number) =>
    setCart((c) => {
      const { [id]: _omit, ...rest } = c;
      return rest;
    });

  return (
    <main className="inner-page wrap">
      <p className="eyebrow">your selection</p>
      <h1>Cart {count > 0 && <span>({count})</span>}</h1>

      {entries.length === 0 ? (
        <div className="empty-cart" style={{ padding: "3rem 0", textAlign: "center" }}>
          <ShoppingBag size={34} style={{ margin: "0 auto" }} />
          <p>
            Your cart is waiting
            <br />
            for something good.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            <Link href="/shop" className="primary-button">
              Continue shopping
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "2rem",
            alignItems: "start",
            marginTop: "1.5rem",
          }}
          className="cart-layout"
        >
          <div className="cart-items" style={{ display: "grid", gap: 12 }}>
            {entries.map(([id, qty]) => {
              const meta = cartMeta[id];
              const product = products.find((p) => String(p.id) === String(id));
              const name = meta?.name || product?.name || "Product";
              const price = meta?.price ?? product?.price ?? 0;
              const artProduct =
                product ||
                (meta
                  ? {
                      id,
                      name,
                      category: "",
                      price,
                      size: meta.variantLabel || "",
                      color: "aqua",
                      kind: "bottle" as const,
                      image: meta.image,
                    }
                  : null);
              if (!artProduct) return null;
              return (
                <div
                  key={id}
                  className="cart-item"
                  style={{
                    display: "flex",
                    gap: 16,
                    border: "1px solid var(--color-border-gray, #e5e0d8)",
                    borderRadius: 16,
                    padding: 16,
                    background: "#fff",
                  }}
                >
                  <div style={{ width: 96, flexShrink: 0 }}>
                    <ProductArt product={artProduct} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{name}</h3>
                    {(meta?.variantLabel || meta?.fragrance) && (
                      <p style={{ color: "var(--color-muted)", fontSize: 12 }}>
                        {[meta?.variantLabel, meta?.fragrance].filter(Boolean).join(" • ")}
                      </p>
                    )}
                    <p style={{ fontWeight: 700 }}>{formatINR(price)}</p>
                    <div className="qty" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => change(id, -1)} aria-label="Decrease quantity">
                        <Minus size={13} />
                      </button>
                      <span>{qty}</span>
                      <button onClick={() => change(id, 1)} aria-label="Increase quantity">
                        <Plus size={13} />
                      </button>
                      <button
                        onClick={() => remove(id)}
                        aria-label={`Remove ${name}`}
                        style={{ marginLeft: 8, color: "#b3261e" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <strong>{formatINR(price * qty)}</strong>
                </div>
              );
            })}
          </div>

          <aside
            style={{
              border: "1px solid var(--color-border-gray, #e5e0d8)",
              borderRadius: 16,
              padding: 20,
              background: "#fff",
              position: "sticky",
              top: 88,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Summary</h2>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "8px 0" }}>
              <span>Subtotal ({count} items)</span>
              <strong>{formatINR(subtotal)}</strong>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-muted)" }}>
              Shipping &amp; discounts are calculated at checkout from the live server quote.
            </p>
            <button className="checkout" style={{ width: "100%" }} onClick={() => router.push("/checkout")}>
              Proceed to checkout <ArrowRight size={18} />
            </button>
            <Link
              href="/shop"
              style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: 14 }}
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}

export default function CartPage() {
  return (
    <PageFrame>
      <CartPageInner />
    </PageFrame>
  );
}
