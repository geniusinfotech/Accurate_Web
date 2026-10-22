"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, PackageSearch } from "lucide-react";
import { PageFrame } from "@/components/storefront";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { apiRequest } from "@/lib/api-client";
import { formatINR, type ShopOrder } from "@/lib/checkout";

function SuccessInner() {
  const params = useSearchParams();
  const toast = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const orderId = params.get("orderId") || "";
  const orderNumber = params.get("orderNumber") || "";

  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");
  const [pendingPayment, setPendingPayment] = useState<{
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  } | null>(null);

  useEffect(() => {
    try {
      const ph = window.sessionStorage.getItem("accurate_last_order_phone") || "";
      if (ph) setGuestPhone(ph);
      const pend = window.sessionStorage.getItem("accurate_pending_payment");
      if (pend) setPendingPayment(JSON.parse(pend));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (authLoading || !orderId || !isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    apiRequest<ShopOrder>(`/orders/${orderId}`)
      .then((o) => {
        if (!cancelled) setOrder(o);
      })
      .catch(() => {
        // Order fetch may fail for guest-shaped orders; fall back to my-orders.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, orderId]);

  async function retryOrderCreation() {
    if (!pendingPayment) {
      toast.error("No pending payment found in this browser to retry with.");
      return;
    }
    const phone = guestPhone.trim();
    if (!phone) {
      toast.error("Enter the phone number used at checkout to retry.");
      return;
    }
    setRetrying(true);
    try {
      toast.info("Retrying order creation — your payment will not be charged again.");
      const saved = window.sessionStorage.getItem("accurate_checkout_backup");
      if (!saved) {
        toast.error("Checkout details are no longer in this browser. Contact support with your payment ID.");
        return;
      }
      const backup = JSON.parse(saved);
      const created = await apiRequest<any>("/orders", {
        method: "POST",
        body: JSON.stringify({ ...backup, ...pendingPayment }),
      });
      window.sessionStorage.removeItem("accurate_pending_payment");
      setPendingPayment(null);
      setOrder(created);
      toast.success("Order recovered successfully!");
    } catch (e: any) {
      toast.error(e?.message || "Retry failed. Contact support with your payment ID.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <main className="inner-page wrap" style={{ textAlign: "center", padding: "3rem 0" }}>
      <CheckCircle2 size={44} color="#047857" style={{ margin: "0 auto" }} />
      <p className="eyebrow" style={{ marginTop: 12 }}>
        thank you
      </p>
      <h1>Order confirmed!</h1>
      {orderNumber && (
        <p>
          Order <strong>{orderNumber}</strong>
        </p>
      )}
      <p style={{ color: "var(--color-muted)", maxWidth: 520, margin: "0 auto" }}>
        {isAuthenticated
          ? "Track it anytime from your profile under Orders."
          : "Keep your order number safe. Guests can look orders up with the phone number used at checkout."}
      </p>

      {loading && <p>Loading order details…</p>}

      {order && (
        <div
          style={{
            textAlign: "left",
            maxWidth: 560,
            margin: "20px auto",
            border: "1px solid var(--color-border-gray, #e5e0d8)",
            borderRadius: 16,
            padding: 20,
            background: "#fff",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 17 }}>Receipt</h2>
          {order.items?.map((i, idx) => (
            <div
              key={idx}
              style={{ display: "flex", justifyContent: "space-between", fontSize: 14, margin: "6px 0" }}
            >
              <span>
                {i.name} × {i.quantity}
              </span>
              <strong>{formatINR((i.price || 0) * (i.quantity || 0))}</strong>
            </div>
          ))}
          {Boolean((order.discount || 0) > 0) && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                margin: "6px 0",
                color: "#047857",
              }}
            >
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>−{formatINR(order.discount || 0)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #eee",
              paddingTop: 8,
              fontWeight: 800,
            }}
          >
            <span>Total paid</span>
            <span>{formatINR(order.totalAmount || 0)}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
            Payment: {order.paymentStatus} • Status: {order.orderStatus}
            {order.paymentId ? ` • ${order.paymentId}` : ""}
          </p>
        </div>
      )}

      {pendingPayment && !order && (
        <div
          style={{
            maxWidth: 560,
            margin: "20px auto",
            border: "1px solid #f59e0b",
            borderRadius: 16,
            padding: 20,
            background: "#fffbeb",
            textAlign: "left",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <PackageSearch size={18} /> Payment captured, order pending?
          </h2>
          <p style={{ fontSize: 14 }}>
            We found a completed payment ({pendingPayment.razorpay_payment_id}) without a linked
            order. Enter your checkout phone number and retry — you won&apos;t be charged again.
          </p>
          <input
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="Checkout phone number"
            style={{
              width: "100%",
              border: "1px solid #e5e0d8",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 14,
            }}
          />
          <button className="checkout" style={{ marginTop: 10 }} onClick={retryOrderCreation} disabled={retrying}>
            {retrying ? "Retrying…" : "Retry order creation"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
        {orderNumber && (
          <Link
            href={`/track?orderNumber=${encodeURIComponent(orderNumber)}`}
            className="primary-button"
            style={{
              background: "#244892",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Track Order Live →
          </Link>
        )}
        {isAuthenticated ? (
          <Link
            href="/profile?tab=orders"
            className="primary-button"
            style={{ background: "#fff", color: "var(--color-charcoal)" }}
          >
            View my orders
          </Link>
        ) : (
          <Link
            href={`/orders${guestPhone ? `?phone=${encodeURIComponent(guestPhone)}` : ""}`}
            className="primary-button"
            style={{ background: "#fff", color: "var(--color-charcoal)" }}
          >
            Look up my orders
          </Link>
        )}
        <Link
          href="/shop"
          className="primary-button"
          style={{ background: "#fff", color: "var(--color-charcoal)" }}
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <PageFrame>
      <Suspense fallback={<main className="inner-page wrap">Loading…</main>}>
        <SuccessInner />
      </Suspense>
    </PageFrame>
  );
}
