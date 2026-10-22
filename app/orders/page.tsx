"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageFrame } from "@/components/storefront";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { apiRequest } from "@/lib/api-client";
import { formatINR, type ShopOrder } from "@/lib/checkout";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--color-border-gray, #e5e0d8)",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 14,
  background: "#fff",
};

function OrdersInner() {
  const params = useSearchParams();
  const toast = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);

  async function lookup(explicitPhone?: string) {
    const p = (explicitPhone ?? phone).trim();
    if (isAuthenticated) {
      setBusy(true);
      try {
        const url = p ? `/orders/my-orders?phone=${encodeURIComponent(p)}` : "/orders/my-orders";
        const o: any = await apiRequest<any>(url);
        const list = Array.isArray(o) ? o : Array.isArray(o?.items) ? o.items : [];
        setOrders(list);
        setSearched(true);
      } catch (e: any) {
        toast.error(e?.message || "Could not load orders.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!p) {
      toast.error("Enter the phone number used at checkout.");
      return;
    }
    setBusy(true);
    try {
      const o: any = await apiRequest<any>(`/orders/my-orders?phone=${encodeURIComponent(p)}`);
      const list = Array.isArray(o) ? o : Array.isArray(o?.items) ? o.items : [];
      setOrders(list);
      setSearched(true);
      try {
        window.sessionStorage.setItem("accurate_last_order_phone", p);
      } catch {
        // ignore
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not find orders for that phone number.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    const preset = params.get("phone") || "";
    if (isAuthenticated || preset) lookup(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  return (
    <main className="inner-page wrap">
      <p className="eyebrow">track &amp; history</p>
      <h1>My orders</h1>
      {isAuthenticated ? (
        <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
          Signed in — showing your order history. Prefer a phone lookup?{" "}
          <Link href="/profile?tab=orders" style={{ textDecoration: "underline" }}>
            Open profile orders
          </Link>
        </p>
      ) : (
        <div
          style={{
            border: "1px solid var(--color-border-gray, #e5e0d8)",
            borderRadius: 16,
            padding: 20,
            background: "#fff",
            maxWidth: 560,
          }}
        >
          <p style={{ fontSize: 14, marginTop: 0 }}>
            Checked out as guest? Enter your checkout phone number to find your orders.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              inputMode="tel"
            />
            <button className="primary-button" style={{ whiteSpace: "nowrap", padding: "0 18px" }} onClick={() => lookup()} disabled={busy}>
              {busy ? "Searching…" : "Find orders"}
            </button>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
            <Link href="/login?redirect=/orders" style={{ textDecoration: "underline" }}>
              Log in
            </Link>{" "}
            to keep permanent order history.
          </p>
        </div>
      )}

      {isAuthenticated && (
        <button
          onClick={() => lookup()}
          disabled={busy}
          style={{
            marginTop: 12,
            border: "1px solid var(--color-border-gray, #e5e0d8)",
            background: "#fff",
            borderRadius: 999,
            padding: "10px 18px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {busy ? "Refreshing…" : "Refresh orders"}
        </button>
      )}

      {searched && orders.length === 0 && !busy && (
        <p style={{ color: "var(--color-muted)" }}>No orders found.</p>
      )}

      <div style={{ display: "grid", gap: 10, marginTop: 16, maxWidth: 760 }}>
        {orders.map((o) => (
          <div key={o._id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 16, background: "#fff", fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong>{o.orderNumber}</strong>
                <Link
                  href={`/track?orderNumber=${encodeURIComponent(o.orderNumber)}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-primary, #244892)",
                    textDecoration: "none",
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: "rgba(36, 72, 146, 0.08)",
                  }}
                >
                  Track order →
                </Link>
              </div>
              <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                {o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : ""}
              </span>
            </div>
            <p style={{ margin: "6px 0", color: "var(--color-muted)" }}>
              {(o.items || []).map((i) => `${i.name} × ${i.quantity}`).join(", ")}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>{formatINR(o.totalAmount || 0)}</strong>{" "}
              {Boolean((o.discount || 0) > 0) && (
                <span style={{ fontSize: 12, color: "#047857", fontWeight: 600 }}>
                  (saved {formatINR(o.discount || 0)}{o.couponCode ? ` with ${o.couponCode}` : ""}){" "}
                </span>
              )}
              <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                • payment: {o.paymentStatus} • status: {o.orderStatus}
                {o.trackingId ? ` • tracking: ${o.trackingId}${o.courierName ? ` (${o.courierName})` : ""}` : ""}
              </span>
            </p>
            <p style={{ margin: "6px 0", fontSize: 13, color: "var(--color-muted)" }}>
              {o.address} — {o.pincode}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <PageFrame>
      <Suspense fallback={<main className="inner-page wrap">Loading…</main>}>
        <OrdersInner />
      </Suspense>
    </PageFrame>
  );
}
