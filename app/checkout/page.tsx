"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgePercent, Lock, ShoppingBag } from "lucide-react";
import { PageFrame, useStore } from "@/components/storefront";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { apiRequest } from "@/lib/api-client";
import {
  COD_ENABLED,
  cartToOrderItems,
  formatINR,
  isValidPhone,
  isValidPincode,
  type PaymentMethod,
  type ProfileUser,
  type RazorpayOrderResponse,
} from "@/lib/checkout";
import { openRazorpayCheckout, loadRazorpayScript } from "@/lib/razorpay";

type Step = 1 | 2 | 3;

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--color-border-gray, #e5e0d8)",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 14,
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  margin: "14px 0 6px",
};

function CheckoutInner() {
  const router = useRouter();
  const toast = useToast();
  const { cart, cartMeta, products, clearCart } = useStore();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [quote, setQuote] = useState<RazorpayOrderResponse | null>(null);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const items = useMemo(
    () => cartToOrderItems(cart, cartMeta, products),
    [cart, cartMeta, products],
  );
  const itemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const cartSubtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items],
  );

  // Preload Razorpay checkout script as early as possible.
  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  // Pre-fill from profile for logged-in shoppers.
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    apiRequest<ProfileUser>("/users/me")
      .then((me) => {
        if (cancelled || !me) return;
        const fullName =
          `${me.firstname || ""} ${me.lastname || ""}`.trim() || me.username || "";
        if (fullName && !customerName) setCustomerName(fullName);
        if (me.phone && !phone) setPhone(me.phone);
        const def =
          me.addresses?.find((a) => a.isDefault) || me.addresses?.[0];
        if (def) {
          const street = def.line1 || def.street || "";
          const line = [street, def.line2, def.city, def.state]
            .filter(Boolean)
            .join(", ");
          if (line && !address) setAddress(line);
          const pin = def.pincode || def.zip || "";
          if (pin && !pincode) setPincode(pin);
        }
      })
      .catch(() => {
        // Non-fatal — shopper can type details manually.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  function validateInfo(): boolean {
    const errs: Record<string, string> = {};
    if (customerName.trim().length < 2) errs.customerName = "Enter your full name.";
    if (!isValidPhone(phone))
      errs.phone = "Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits.";
    if (address.trim().length < 8) errs.address = "Enter your full street address.";
    if (!isValidPincode(pincode))
      errs.pincode = "Pincode must be exactly 6 digits (required for payment).";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function fetchQuote(): Promise<RazorpayOrderResponse | null> {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return null;
    }
    if (!isValidPincode(pincode)) {
      toast.error("Enter a valid 6-digit pincode to get shipping & total.");
      setStep(1);
      return null;
    }
    setQuoteBusy(true);
    try {
      const res = await apiRequest<RazorpayOrderResponse>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ items, pincode: pincode.trim() }),
      });
      setQuote(res);
      return res;
    } catch (e: any) {
      toast.error(e?.message || "Could not fetch the live price quote. Try again.");
      return null;
    } finally {
      setQuoteBusy(false);
    }
  }

  async function handleToPayment() {
    if (!validateInfo()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const q = await fetchQuote();
    if (q) setStep(2);
  }

  async function handleValidateCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMsg("Enter a coupon code first.");
      return;
    }
    if (!isAuthenticated) {
      setCouponMsg("Log in to validate loyalty coupons.");
      return;
    }
    setCouponBusy(true);
    setCouponMsg(null);
    try {
      const coupon: any = await apiRequest("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      const desc =
        coupon?.discountType === "percent"
          ? `${coupon.discountValue}% off`
          : `${formatINR(coupon.discountValue)} off`;
      setCouponMsg(
        `Code ${code} is valid (${desc}). Note: loyalty discounts are display-only for now — the server total above does not include coupons yet.`,
      );
      toast.success(`Coupon ${code} validated.`);
    } catch (e: any) {
      setCouponMsg(e?.message || "Invalid or expired coupon.");
    } finally {
      setCouponBusy(false);
    }
  }

  async function createOrder(args: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    paymentId?: string;
  }) {
    const payload = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      items,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...args,
    };
    const order = await apiRequest<any>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return order;
  }

  function finishSuccess(order: any, pendingRazorpay?: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    clearCart();
    try {
      if (!isAuthenticated && phone) {
        window.sessionStorage.setItem("accurate_last_order_phone", phone.trim());
      }
      if (pendingRazorpay) {
        window.sessionStorage.removeItem("accurate_pending_payment");
      }
    } catch {
      // ignore storage errors
    }
    const id = order?._id || order?.id || "";
    const orderNumber = order?.orderNumber || "";
    router.push(
      `/checkout/success?orderId=${encodeURIComponent(id)}&orderNumber=${encodeURIComponent(orderNumber)}`,
    );
  }

  async function payWithRazorpay() {
    if (placing) return;
    if (!validateInfo()) {
      setStep(1);
      toast.error("Please fix the highlighted fields first.");
      return;
    }
    setPlacing(true);
    try {
      // Stash checkout snapshot so the success page can retry order creation
      // without re-charging if the connection drops after payment.
      try {
        window.sessionStorage.setItem(
          "accurate_checkout_backup",
          JSON.stringify({
            customerName: customerName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            pincode: pincode.trim(),
            items,
            ...(notes.trim() ? { notes: notes.trim() } : {}),
          }),
        );
      } catch {
        // ignore storage errors
      }
      // Always refresh the quote right before opening Razorpay (amounts may change).
      const q = await fetchQuote();
      if (!q) {
        setPlacing(false);
        return;
      }
      await openRazorpayCheckout({
        key: q.key,
        amount: q.amount,
        currency: q.currency || "INR",
        orderId: q.id,
        customerName: customerName.trim(),
        email: user?.email,
        phone: phone.trim(),
        onSuccess: async (resp) => {
          try {
            // Best-effort signature check for instant UX feedback.
            await apiRequest("/payment/verify", {
              method: "POST",
              body: JSON.stringify(resp),
            });
          } catch (e: any) {
            toast.error(e?.message || "Payment verification failed. Your payment may still be captured — contact support with the payment ID.");
            setPlacing(false);
            return;
          }
          try {
            // Stash payment ref so a dropped connection can still be reconciled.
            window.sessionStorage.setItem(
              "accurate_pending_payment",
              JSON.stringify(resp),
            );
          } catch {
            // ignore
          }
          try {
            const order = await createOrder(resp);
            toast.success("Payment successful — order placed!");
            finishSuccess(order);
          } catch (e: any) {
            toast.error(
              (e?.message || "Payment succeeded but order creation failed.") +
                " Keep your payment ID and retry from the success page or contact support.",
            );
          } finally {
            setPlacing(false);
          }
        },
        onDismiss: () => {
          toast.info("Payment window closed — no charge made. You can retry anytime.");
          setPlacing(false);
        },
      });
      // Razorpay dialog is open; keep `placing` true until handler/dismiss fires.
    } catch (e: any) {
      toast.error(e?.message || "Could not start payment. Try again.");
      setPlacing(false);
    }
  }

  async function placeCodOrder() {
    if (!COD_ENABLED) return;
    if (placing) return;
    if (!validateInfo()) {
      setStep(1);
      return;
    }
    setPlacing(true);
    try {
      const order = await createOrder({});
      toast.success("Order placed — pay on delivery!");
      finishSuccess(order);
    } catch (e: any) {
      toast.error(e?.message || "Could not place the order. Try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (authLoading) {
    return (
      <main className="inner-page wrap">
        <p>Loading checkout…</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="inner-page wrap" style={{ textAlign: "center", padding: "3rem 0" }}>
        <ShoppingBag size={34} style={{ margin: "0 auto" }} />
        <h1>Your cart is empty</h1>
        <p style={{ color: "var(--color-muted)" }}>Add something good before checking out.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
          <Link href="/shop" className="primary-button">
            Browse shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="inner-page wrap">
      <Link
        href="/cart"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}
      >
        <ArrowLeft size={15} /> Back to cart
      </Link>
      <p className="eyebrow" style={{ marginTop: 12 }}>
        secure checkout
      </p>
      <h1 style={{ marginTop: 4 }}>Checkout</h1>
      {!isAuthenticated && (
        <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
          Checking out as guest — you can track with your phone number afterwards.{" "}
          <Link href="/login?redirect=/checkout" style={{ textDecoration: "underline" }}>
            Log in
          </Link>{" "}
          for order history &amp; loyalty coupons.
        </p>
      )}

      {/* Stepper */}
      <ol
        style={{
          display: "flex",
          gap: 8,
          listStyle: "none",
          padding: 0,
          margin: "18px 0 8px",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {(["Details", "Payment", "Review & pay"] as const).map((label, i) => {
          const n = (i + 1) as Step;
          const active = step === n;
          const done = step > n;
          return (
            <li
              key={label}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--color-border-gray, #e5e0d8)",
                background: active ? "var(--color-charcoal, #1e293b)" : done ? "#ecfdf5" : "#fff",
                color: active ? "#fff" : done ? "#047857" : "var(--color-muted)",
              }}
            >
              {n}. {label}
            </li>
          );
        })}
      </ol>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "2rem",
          alignItems: "start",
          marginTop: "1rem",
        }}
      >
        <section
          style={{
            border: "1px solid var(--color-border-gray, #e5e0d8)",
            borderRadius: 16,
            padding: 22,
            background: "#fff",
          }}
        >
          {step === 1 && (
            <div>
              <h2 style={{ margin: 0 }}>Delivery details</h2>
              <label style={labelStyle} htmlFor="co-name">
                Full name *
              </label>
              <input
                id="co-name"
                style={inputStyle}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Aarav Shah"
                autoComplete="name"
              />
              {fieldErrors.customerName && (
                <p style={{ color: "#b3261e", fontSize: 12 }}>{fieldErrors.customerName}</p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle} htmlFor="co-phone">
                    Phone *
                  </label>
                  <input
                    id="co-phone"
                    type="tel"
                    inputMode="numeric"
                    style={inputStyle}
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhone(digits);
                      if (fieldErrors.phone) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.phone;
                          return next;
                        });
                      }
                    }}
                    placeholder="10-digit number (e.g. 9876543210)"
                    autoComplete="tel"
                  />
                  {fieldErrors.phone && (
                    <p style={{ color: "#b3261e", fontSize: 12, marginTop: 4 }}>{fieldErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle} htmlFor="co-pin">
                    Pincode *
                  </label>
                  <input
                    id="co-pin"
                    style={inputStyle}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="395007"
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                  {fieldErrors.pincode && (
                    <p style={{ color: "#b3261e", fontSize: 12 }}>{fieldErrors.pincode}</p>
                  )}
                </div>
              </div>

              <label style={labelStyle} htmlFor="co-addr">
                Full address *
              </label>
              <textarea
                id="co-addr"
                style={{ ...inputStyle, minHeight: 84, resize: "vertical" }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat, street, area, city, state"
                autoComplete="street-address"
              />
              {fieldErrors.address && (
                <p style={{ color: "#b3261e", fontSize: 12 }}>{fieldErrors.address}</p>
              )}

              <label style={labelStyle} htmlFor="co-notes">
                Order notes (optional)
              </label>
              <input
                id="co-notes"
                style={inputStyle}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions…"
                maxLength={500}
              />

              <button
                className="checkout"
                style={{ width: "100%", marginTop: 18 }}
                onClick={handleToPayment}
                disabled={quoteBusy}
              >
                {quoteBusy ? "Calculating total…" : "Continue to payment"} <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ margin: 0 }}>Payment method</h2>
              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                <label
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    border: paymentMethod === "razorpay" ? "2px solid #1f4e9e" : "1px solid var(--color-border-gray, #e5e0d8)",
                    borderRadius: 14,
                    padding: 16,
                    cursor: "pointer",
                    background: paymentMethod === "razorpay" ? "#f0f6ff" : "#fff",
                    boxShadow: paymentMethod === "razorpay" ? "0 4px 14px rgba(31, 78, 158, 0.08)" : "none",
                  }}
                >
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    style={{ marginTop: 3 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <strong style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: "#0c2340" }}>
                        <Lock size={15} color="#1f4e9e" /> Pay online via Razorpay
                      </strong>
                      <span style={{ fontSize: 11, fontWeight: 700, background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: 999 }}>
                        RECOMMENDED
                      </span>
                    </div>
                    <p style={{ color: "var(--color-muted)", fontSize: 13, margin: "4px 0 10px" }}>
                      Instant confirmation • 256-bit SSL encrypted • UPI, Cards, Netbanking &amp; Wallets
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                      {["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "Visa", "MasterCard", "RuPay", "Netbanking"].map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            background: "#fff",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            padding: "2px 7px",
                            color: "#334155",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>

                <label
                  title={COD_ENABLED ? undefined : "Cash on Delivery is coming soon"}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    border: "1px solid var(--color-border-gray, #e5e0d8)",
                    borderRadius: 12,
                    padding: 14,
                    cursor: COD_ENABLED ? "pointer" : "not-allowed",
                    opacity: COD_ENABLED ? 1 : 0.55,
                    background: "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "cod"}
                    disabled={!COD_ENABLED}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <span>
                    <strong>Cash on Delivery</strong>{" "}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: "#fef3c7",
                        color: "#92400e",
                        borderRadius: 999,
                        padding: "2px 8px",
                      }}
                    >
                      Coming soon
                    </span>
                    <br />
                    <small style={{ color: "var(--color-muted)" }}>
                      {COD_ENABLED
                        ? "Pay in cash/UPI when your order arrives."
                        : "Disabled for launch — online payment only for now."}
                    </small>
                  </span>
                </label>
              </div>

              <h3 style={{ margin: "20px 0 6px", fontSize: 15 }}>
                <BadgePercent size={15} style={{ display: "inline", verticalAlign: -2 }} /> Loyalty
                coupon (optional)
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inputStyle, textTransform: "uppercase" }}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="DIWALI10"
                />
                <button
                  className="primary-button"
                  style={{ whiteSpace: "nowrap", padding: "0 18px" }}
                  onClick={handleValidateCoupon}
                  disabled={couponBusy}
                >
                  {couponBusy ? "Checking…" : "Apply"}
                </button>
              </div>
              {couponMsg && <p style={{ fontSize: 13, color: "var(--color-muted)" }}>{couponMsg}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    border: "1px solid var(--color-border-gray, #e5e0d8)",
                    borderRadius: 999,
                    padding: "12px",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button className="checkout" style={{ flex: 2 }} onClick={() => setStep(3)}>
                  Review order <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ margin: 0 }}>Review &amp; pay</h2>
              <div
                style={{
                  fontSize: 14,
                  background: "#faf8f5",
                  borderRadius: 12,
                  padding: 14,
                  marginTop: 12,
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <strong>{customerName}</strong> • {phone}
                </p>
                <p style={{ margin: "4px 0", color: "var(--color-muted)" }}>
                  {address} — {pincode}
                </p>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    fontSize: 13,
                    textDecoration: "underline",
                    background: "none",
                    border: 0,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Edit details
                </button>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                {items.map((i, idx) => (
                  <div
                    key={`${i.name}-${idx}`}
                    style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}
                  >
                    <span>
                      {i.name} {i.sku && <small style={{ color: "var(--color-muted)" }}>({i.sku})</small>} ×{" "}
                      {i.quantity}
                    </span>
                    <strong>{formatINR(i.price * i.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1,
                    border: "1px solid var(--color-border-gray, #e5e0d8)",
                    borderRadius: 999,
                    padding: "12px",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                {paymentMethod === "cod" ? (
                  <button
                    className="checkout"
                    style={{ flex: 2 }}
                    onClick={placeCodOrder}
                    disabled={placing || !COD_ENABLED}
                  >
                    {placing ? "Placing order…" : "Place COD order"}
                  </button>
                ) : (
                  <button className="checkout" style={{ flex: 2 }} onClick={payWithRazorpay} disabled={placing}>
                    <Lock size={16} /> {placing ? "Opening Razorpay…" : `Pay ${quote ? formatINR(quote.quote.totalAmount) : ""} via Razorpay`}
                  </button>
                )}
              </div>
              <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 10 }}>
                {paymentMethod === "razorpay"
                  ? "You’ll complete payment securely in the Razorpay window. Your order is placed immediately after successful payment."
                  : "Pay when your order arrives."}
              </p>
            </div>
          )}
        </section>

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
          <h2 style={{ marginTop: 0 }}>Order summary</h2>
          <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
            {itemCount} item{itemCount === 1 ? "" : "s"} • cart subtotal {formatINR(cartSubtotal)}
          </p>
          {quote ? (
            <dl style={{ fontSize: 14, display: "grid", gap: 6, marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt>Subtotal</dt>
                <dd>{formatINR(quote.quote.subtotal)}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#047857" }}>
                <dt>Discount</dt>
                <dd>−{formatINR(quote.quote.discount)}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt>Shipping</dt>
                <dd>{quote.quote.shippingCost === 0 ? "Free" : formatINR(quote.quote.shippingCost)}</dd>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #eee",
                  paddingTop: 8,
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                <dt>Total</dt>
                <dd>{formatINR(quote.quote.totalAmount)}</dd>
              </div>
            </dl>
          ) : (
            <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
              Live total (shipping + discount) appears after you enter your pincode.
            </p>
          )}
          <button
            onClick={fetchQuote}
            disabled={quoteBusy || !isValidPincode(pincode)}
            style={{
              width: "100%",
              marginTop: 8,
              border: "1px solid var(--color-border-gray, #e5e0d8)",
              background: "#fff",
              borderRadius: 999,
              padding: "10px",
              fontSize: 13,
              cursor: quoteBusy ? "wait" : "pointer",
            }}
          >
            {quoteBusy ? "Refreshing…" : "Refresh live total"}
          </button>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 12,
              color: "var(--color-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#1f4e9e", fontWeight: 600 }}>
              <Lock size={13} /> Secured by Razorpay
            </div>
            <div>All major UPI apps, cards, &amp; 50+ netbanking partners supported.</div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <PageFrame hideFooter>
      <CheckoutInner />
    </PageFrame>
  );
}
