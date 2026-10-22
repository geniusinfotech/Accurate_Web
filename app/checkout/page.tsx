"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgePercent, CheckCircle2, Lock, MapPin, Plus, ShoppingBag, Tag, X } from "lucide-react";
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
  parseAddressDetails,
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
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountValue: number;
    discountType: string;
  } | null>(null);
  const [quote, setQuote] = useState<RazorpayOrderResponse | null>(null);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Saved Delivery Addresses from user profile
  const [savedAddresses, setSavedAddresses] = useState<NonNullable<ProfileUser["addresses"]>>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | "new">(0);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("Home");

  function applySavedAddress(addr: NonNullable<ProfileUser["addresses"]>[number]) {
    const { fullAddress, pincode: pin, phone: ph } = parseAddressDetails(addr);
    setAddress(fullAddress);
    setPincode(pin);
    if (ph) {
      setPhone(ph);
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (fullAddress) delete next.address;
      if (pin) delete next.pincode;
      if (ph) delete next.phone;
      return next;
    });
  }

  function handleSelectAddress(idx: number) {
    setSelectedAddressIndex(idx);
    if (savedAddresses[idx]) {
      applySavedAddress(savedAddresses[idx]);
    }
  }

  function handleSelectNewAddress() {
    setSelectedAddressIndex("new");
    setAddress("");
    setPincode("");
  }

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

  // Pre-fill from profile for logged-in shoppers and load saved addresses.
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

        // Collect all addresses (array and singular object fallback)
        let list: NonNullable<ProfileUser["addresses"]> = [];
        if (Array.isArray(me.addresses) && me.addresses.length > 0) {
          list = [...me.addresses];
        } else if ((me as any).address && typeof (me as any).address === "object") {
          const single = (me as any).address;
          if (single.street || single.city || single.line1) {
            list = [{
              label: "Saved Address",
              street: single.street || single.line1,
              city: single.city,
              state: single.state,
              zip: single.zip,
              pincode: single.pincode || single.zip,
              isDefault: true,
            }];
          }
        }

        // Filter out empty ghost records that have no valid address text
        const validList = list.filter((a: any) => {
          if (!a || typeof a !== "object") return false;
          const s = String(a.street || a.line1 || a.address || "").trim();
          const c = String(a.city || "").trim();
          const p = String(a.pincode || a.zip || a.postal_code || "").trim();
          return Boolean(s || c || p);
        });

        setSavedAddresses(validList);

        if (validList.length > 0) {
          const defIdx = validList.findIndex((a) => a.isDefault);
          const activeIdx = defIdx >= 0 ? defIdx : 0;
          setSelectedAddressIndex(activeIdx);
          applySavedAddress(validList[activeIdx]);
        } else {
          setSelectedAddressIndex("new");
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

  async function fetchQuote(customCoupon?: string): Promise<RazorpayOrderResponse | null> {
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
      const activeCoupon =
        customCoupon !== undefined
          ? customCoupon.trim()
          : (appliedCoupon?.code || couponCode.trim());

      const res = await apiRequest<RazorpayOrderResponse>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          items,
          pincode: pincode.trim(),
          ...(activeCoupon ? { couponCode: activeCoupon } : {}),
        }),
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
    if (q) {
      if (saveToProfile && selectedAddressIndex === "new" && isAuthenticated && address.trim()) {
        try {
          const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
          const inferredCity = parts.length >= 2 ? parts[parts.length - 1] : "Surat";
          await apiRequest("/users/addresses", {
            method: "POST",
            body: JSON.stringify({
              street: address.trim(),
              city: inferredCity || "Surat",
              zip: pincode.trim(),
              label: newAddressLabel.trim() || "Delivery Address",
              phone: phone.trim(),
            }),
          });
        } catch {
          // Non-blocking background save
        }
      }
      setStep(2);
    }
  }

  async function handleValidateCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMsg("Enter a coupon code first.");
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

      setAppliedCoupon({
        code: coupon.code || code,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
      });
      setCouponCode(coupon.code || code);
      setCouponMsg(`Coupon ${coupon.code || code} applied (${desc})!`);
      toast.success(`Coupon ${coupon.code || code} applied!`);

      // Refresh quote immediately with the coupon applied
      if (isValidPincode(pincode)) {
        await fetchQuote(coupon.code || code);
      }
    } catch (e: any) {
      setAppliedCoupon(null);
      setCouponMsg(e?.message || "Invalid or expired coupon.");
      toast.error(e?.message || "Invalid or expired coupon.");
    } finally {
      setCouponBusy(false);
    }
  }

  async function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMsg(null);
    toast.info("Coupon removed.");
    if (isValidPincode(pincode)) {
      await fetchQuote("");
    }
  }

  async function createOrder(args: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    paymentId?: string;
  }) {
    const activeCoupon = appliedCoupon?.code || couponCode.trim();
    const payload = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      items,
      ...(activeCoupon ? { couponCode: activeCoupon } : {}),
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
        const activeCoupon = appliedCoupon?.code || couponCode.trim();
        window.sessionStorage.setItem(
          "accurate_checkout_backup",
          JSON.stringify({
            customerName: customerName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            pincode: pincode.trim(),
            items,
            ...(activeCoupon ? { couponCode: activeCoupon } : {}),
            ...(notes.trim() ? { notes: notes.trim() } : {}),
          }),
        );
      } catch {
        // ignore storage errors
      }
      // Always refresh the quote right before opening Razorpay (amounts may change).
      const q = await fetchQuote(appliedCoupon?.code || couponCode.trim());
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

      {/* One column on phones/tablets (summary below the form), two from lg. */}
      <div className="mt-4 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Delivery details</h2>
                {isAuthenticated && (
                  <Link
                    href="/profile?tab=addresses"
                    target="_blank"
                    style={{ fontSize: 12, fontWeight: 700, color: "#244892", textDecoration: "underline" }}
                  >
                    Manage address book ↗
                  </Link>
                )}
              </div>

              {/* Saved Delivery Addresses Selector */}
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ ...labelStyle, marginTop: 0, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={15} color="#244892" /> Choose delivery address
                  </label>
                  <div style={{ display: "grid", gap: 10 }}>
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedAddressIndex === idx;
                      const { fullAddress, pincode: pin, phone: ph } = parseAddressDetails(addr);
                      const labelText = String(addr.label || "").trim() || `Address ${idx + 1}`;
                      return (
                        <div
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectAddress(idx)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelectAddress(idx);
                            }
                          }}
                          style={{
                            border: isSelected ? "2px solid #244892" : "1px solid var(--color-border-gray, #e5e0d8)",
                            borderRadius: 14,
                            padding: "14px 16px",
                            cursor: "pointer",
                            background: isSelected ? "rgba(36, 72, 146, 0.04)" : "#fff",
                            boxShadow: isSelected ? "0 4px 12px rgba(36, 72, 146, 0.08)" : "none",
                            transition: "all 0.18s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                type="radio"
                                name="deliveryAddress"
                                checked={isSelected}
                                onChange={() => handleSelectAddress(idx)}
                                onClick={(e) => e.stopPropagation()}
                                style={{ accentColor: "#244892", cursor: "pointer" }}
                              />
                              <strong style={{ fontSize: 14, color: "#0e1117" }}>
                                {labelText}
                              </strong>
                              {addr.isDefault && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    background: "#d1fae5",
                                    color: "#047857",
                                    padding: "2px 7px",
                                    borderRadius: 9999,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Default
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#244892", display: "flex", alignItems: "center", gap: 4 }}>
                                <CheckCircle2 size={14} /> Deliver here
                              </span>
                            )}
                          </div>
                          {fullAddress && (
                            <p style={{ margin: "8px 0 0 24px", fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                              {fullAddress}
                              {pin ? ` — ${pin}` : ""}
                            </p>
                          )}
                          {ph && (
                            <p style={{ margin: "4px 0 0 24px", fontSize: 12, color: "var(--color-muted)" }}>
                              Contact: <strong>{ph}</strong>
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Different / New Address Option */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={handleSelectNewAddress}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectNewAddress();
                        }
                      }}
                      style={{
                        border: selectedAddressIndex === "new" ? "2px solid #244892" : "1px dashed var(--color-border-gray, #cbd5e1)",
                        borderRadius: 14,
                        padding: "12px 16px",
                        cursor: "pointer",
                        background: selectedAddressIndex === "new" ? "rgba(36, 72, 146, 0.04)" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.18s ease",
                      }}
                    >
                      <input
                        type="radio"
                        name="deliveryAddress"
                        checked={selectedAddressIndex === "new"}
                        onChange={handleSelectNewAddress}
                        onClick={(e) => e.stopPropagation()}
                        style={{ accentColor: "#244892", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, color: selectedAddressIndex === "new" ? "#244892" : "#475569" }}>
                        + Deliver to a different / new address
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient info & Address fields */}
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

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
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
                Full delivery address *
              </label>
              <textarea
                id="co-addr"
                style={{ ...inputStyle, minHeight: 84, resize: "vertical" }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / House no., Street, Area, City, State"
                autoComplete="street-address"
              />
              {fieldErrors.address && (
                <p style={{ color: "#b3261e", fontSize: 12 }}>{fieldErrors.address}</p>
              )}

              {/* Save new address checkbox */}
              {selectedAddressIndex === "new" && isAuthenticated && (
                <div style={{ marginTop: 12, padding: "12px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      style={{ accentColor: "#244892" }}
                    />
                    Save this address to my profile address book
                  </label>
                  {saveToProfile && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Label:</span>
                      <input
                        style={{ ...inputStyle, padding: "6px 10px", fontSize: 12, maxWidth: 160 }}
                        value={newAddressLabel}
                        onChange={(e) => setNewAddressLabel(e.target.value)}
                        placeholder="Home / Work / Office"
                      />
                    </div>
                  )}
                </div>
              )}

              <label style={labelStyle} htmlFor="co-notes">
                Order notes (optional)
              </label>
              <input
                id="co-notes"
                style={inputStyle}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions or landmark…"
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

              <h3 style={{ margin: "20px 0 6px", fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                <BadgePercent size={16} /> Coupon code (optional)
              </h3>
              {appliedCoupon ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: 12,
                    marginTop: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <div>
                      <div style={{ fontWeight: 700, color: "#065f46", letterSpacing: "0.5px" }}>
                        {appliedCoupon.code}
                      </div>
                      <div style={{ fontSize: 12, color: "#047857" }}>
                        {appliedCoupon.discountType === "percent"
                          ? `${appliedCoupon.discountValue}% discount applied`
                          : `${formatINR(appliedCoupon.discountValue)} discount applied`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    disabled={couponBusy}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "none",
                      border: "none",
                      color: "#dc2626",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ ...inputStyle, textTransform: "uppercase" }}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleValidateCoupon();
                      }
                    }}
                    placeholder="Enter coupon code (e.g. DIWALI10)"
                  />
                  <button
                    className="primary-button"
                    style={{ whiteSpace: "nowrap", padding: "0 18px" }}
                    onClick={handleValidateCoupon}
                    disabled={couponBusy || !couponCode.trim()}
                  >
                    {couponBusy ? "Checking…" : "Apply"}
                  </button>
                </div>
              )}
              {couponMsg && !appliedCoupon && (
                <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 6 }}>{couponMsg}</p>
              )}

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
          className="lg:sticky lg:top-[88px]"
          style={{
            border: "1px solid var(--color-border-gray, #e5e0d8)",
            borderRadius: 16,
            padding: 20,
            background: "#fff",
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

              {quote.quote.discount > 0 && (
                <>
                  {Boolean(quote.quote.couponDiscount && quote.quote.couponDiscount > 0) && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#047857" }}>
                      <dt style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Tag size={12} /> Coupon ({quote.quote.couponCode || appliedCoupon?.code})
                      </dt>
                      <dd>−{formatINR(quote.quote.couponDiscount!)}</dd>
                    </div>
                  )}
                  {Boolean(quote.quote.discount - (quote.quote.couponDiscount || 0) > 0) && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#047857" }}>
                      <dt>Promotional Discount (10%)</dt>
                      <dd>−{formatINR(quote.quote.discount - (quote.quote.couponDiscount || 0))}</dd>
                    </div>
                  )}
                  {!quote.quote.couponDiscount && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#047857" }}>
                      <dt>Discount</dt>
                      <dd>−{formatINR(quote.quote.discount)}</dd>
                    </div>
                  )}
                </>
              )}

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
            onClick={() => fetchQuote()}
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
