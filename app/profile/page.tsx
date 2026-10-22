"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgePercent, CheckCircle2, Eye, EyeOff, Home, Lock, Package, UserRound } from "lucide-react";
import { PageFrame } from "@/components/storefront";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { apiRequest } from "@/lib/api-client";
import { formatINR, parseAddressDetails, type LoyaltyCoupon, type ProfileUser, type ShopOrder } from "@/lib/checkout";

type Tab = "profile" | "addresses" | "orders" | "loyalty" | "security";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "addresses", label: "Addresses" },
  { id: "orders", label: "Orders" },
  { id: "loyalty", label: "Loyalty" },
  { id: "security", label: "Security" },
];

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

function addrDisplay(a: NonNullable<ProfileUser["addresses"]>[number]): string {
  const { fullAddress, pincode: pin } = parseAddressDetails(a);
  return pin ? `${fullAddress} — ${pin}` : fullAddress;
}

function ProfileInner() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { isAuthenticated, isLoading: authLoading, logout, user, profileCompletion, syncProfileUser } = useAuth();

  const initialTab = useMemo<Tab>(() => {
    const t = params.get("tab");
    return TABS.some((x) => x.id === t) ? (t as Tab) : "profile";
  }, [params]);
  const [tab, setTab] = useState<Tab>(initialTab);
  useEffect(() => setTab(initialTab), [initialTab]);

  const [me, setMe] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // profile form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // address form
  const [aStreet, setAStreet] = useState("");
  const [aCity, setACity] = useState("");
  const [aState, setAState] = useState("");
  const [aZip, setAZip] = useState("");
  const [aPhone, setAPhone] = useState("");
  const [aLabel, setALabel] = useState("Home");
  const [addrBusy, setAddrBusy] = useState(false);

  // orders + loyalty
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [loyalty, setLoyalty] = useState<LoyaltyCoupon[]>([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);

  // security
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/profile");
    }
  }, [authLoading, isAuthenticated, router]);

  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<ProfileUser>("/users/me");
      setMe(data);
      syncProfileUser(data);
      const full = `${data.firstname || ""} ${data.lastname || ""}`.trim() || data.username || "";
      setName(full);
      setPhone(data.phone || "");
    } catch (e: any) {
      toast.error(e?.message || "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, [toast, syncProfileUser]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) refreshMe();
  }, [authLoading, isAuthenticated, refreshMe]);

  useEffect(() => {
    if (!isAuthenticated || (tab !== "orders" && tab !== "loyalty")) return;
    if (tab === "orders") {
      setOrdersLoading(true);
      apiRequest<any>("/orders/my-orders")
        .then((o) => {
          const list = Array.isArray(o) ? o : Array.isArray(o?.items) ? o.items : [];
          setOrders(list);
        })
        .catch((e: any) => toast.error(e?.message || "Could not load orders."))
        .finally(() => setOrdersLoading(false));
    }
    if (tab === "loyalty") {
      setLoyaltyLoading(true);
      apiRequest<any>("/coupons/my-loyalty")
        .then((c) => {
          const list = Array.isArray(c) ? c : Array.isArray(c?.items) ? c.items : [];
          setLoyalty(list);
        })
        .catch((e: any) => toast.error(e?.message || "Could not load loyalty coupons."))
        .finally(() => setLoyaltyLoading(false));
    }
  }, [tab, isAuthenticated, toast]);

  async function saveProfile() {
    if (name.trim().length < 2) {
      toast.error("Enter your full name.");
      return;
    }
    setSaving(true);
    try {
      const updated = await apiRequest<ProfileUser>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          ...(name.trim() ? { name: name.trim() } : {}),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      });
      setMe(updated);
      syncProfileUser(updated);
      toast.success("Profile updated!");
    } catch (e: any) {
      toast.error(e?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function addAddress() {
    if (aStreet.trim().length < 3 || !aCity.trim()) {
      toast.error("Street and city are required.");
      return;
    }
    setAddrBusy(true);
    try {
      const updated = await apiRequest<ProfileUser>("/users/addresses", {
        method: "POST",
        body: JSON.stringify({
          street: aStreet.trim(),
          city: aCity.trim(),
          ...(aState.trim() ? { state: aState.trim() } : {}),
          ...(aZip.trim() ? { zip: aZip.trim() } : {}),
          ...(aPhone.trim() ? { phone: aPhone.trim() } : {}),
          ...(aLabel.trim() ? { label: aLabel.trim() } : {}),
        }),
      });
      setMe(updated);
      syncProfileUser(updated);
      setAStreet("");
      setACity("");
      setAState("");
      setAZip("");
      setAPhone("");
      toast.success("Address saved! First address becomes the default automatically.");
    } catch (e: any) {
      toast.error(e?.message || "Could not save address.");
    } finally {
      setAddrBusy(false);
    }
  }

  async function removeAddress(index: number) {
    setAddrBusy(true);
    try {
      const updated = await apiRequest<ProfileUser>(`/users/addresses/${index}`, {
        method: "DELETE",
      });
      setMe(updated);
      syncProfileUser(updated);
      toast.success("Address removed.");
    } catch (e: any) {
      toast.error(e?.message || "Could not remove address.");
    } finally {
      setAddrBusy(false);
    }
  }

  async function makeDefault(index: number) {
    setAddrBusy(true);
    try {
      const updated = await apiRequest<ProfileUser>(`/users/addresses/${index}/default`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      setMe(updated);
      syncProfileUser(updated);
      toast.success("Default address updated.");
    } catch (e: any) {
      toast.error(e?.message || "Could not update default address.");
    } finally {
      setAddrBusy(false);
    }
  }

  async function changePassword() {
    if (!oldPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setOldPassword("");
      setNewPassword("");
      toast.success("Password changed! Please log in again.");
      // Backend has cleared auth cookies + revoked refresh token —
      // drop client auth state and force a fresh login.
      await logout();
      router.replace("/login?redirect=/profile");
    } catch (e: any) {
      toast.error(e?.message || "Could not change password.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (authLoading || loading) {
    return (
      <main className="inner-page wrap">
        <p>Loading your profile…</p>
      </main>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <main className="inner-page wrap">
      <p className="eyebrow">your account</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Hi, {me?.firstname || user?.name || "there"}!</h1>
        <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{user?.email}</span>
        <button
          onClick={handleLogout}
          style={{
            marginLeft: "auto",
            fontSize: 13,
            border: "1px solid var(--color-border-gray, #e5e0d8)",
            background: "#fff",
            borderRadius: 999,
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>

      {/* Profile Completion Overview Card */}
      <div
        style={{
          border: "1px solid var(--color-border-gray, #e5e0d8)",
          borderRadius: 16,
          padding: "18px 22px",
          background: profileCompletion.isComplete ? "rgba(16, 185, 129, 0.04)" : "#fff",
          maxWidth: 760,
          margin: "18px 0 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Profile Completeness</h3>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "2px 10px",
                  borderRadius: 9999,
                  background: profileCompletion.isComplete ? "#d1fae5" : "rgba(36, 72, 146, 0.1)",
                  color: profileCompletion.isComplete ? "#047857" : "#244892",
                }}
              >
                {profileCompletion.percentage}%
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
              {profileCompletion.isComplete
                ? "Your profile is 100% complete! Faster checkout is enabled."
                : `${profileCompletion.completedCount} of 4 details complete. Complete remaining details for seamless 1-click ordering.`}
            </p>
          </div>

          <div style={{ minWidth: 160, flex: 1, maxWidth: 220 }}>
            <div style={{ height: 8, width: "100%", background: "#e2e8f0", borderRadius: 9999, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${profileCompletion.percentage}%`,
                  background: profileCompletion.isComplete ? "#10b981" : "#244892",
                  borderRadius: 9999,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* 4 Items Checklist Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          {profileCompletion.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "address") setTab("addresses");
                else setTab("profile");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: item.isCompleted ? "#d1fae5" : "#e2e8f0",
                background: item.isCompleted ? "#f0fdf4" : "#f8fafc",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              {item.isCompleted ? (
                <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
              ) : (
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #94a3b8",
                    flexShrink: 0,
                  }}
                />
              )}
              <span style={{ fontWeight: 600, color: item.isCompleted ? "#065f46" : "#475569" }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "18px 0", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? "primary-button" : ""}
            style={
              tab === t.id
                ? undefined
                : {
                    border: "1px solid var(--color-border-gray, #e5e0d8)",
                    background: "#fff",
                    borderRadius: 999,
                    padding: "10px 18px",
                    cursor: "pointer",
                    fontSize: 14,
                  }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <section
        style={{
          border: "1px solid var(--color-border-gray, #e5e0d8)",
          borderRadius: 16,
          padding: 22,
          background: "#fff",
          maxWidth: 760,
        }}
      >
        {tab === "profile" && (
          <div>
            <h2 style={{ marginTop: 0, display: "flex", gap: 8, alignItems: "center" }}>
              <UserRound size={18} /> Personal info
            </h2>
            <label style={labelStyle}>Full name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Shah" />
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            {me?.totalAmountSpent != null && (
              <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
                Lifetime spend: <strong>{formatINR(me.totalAmountSpent)}</strong> — unlocks loyalty coupons.
              </p>
            )}
            <button className="checkout" style={{ marginTop: 14 }} onClick={saveProfile} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}

        {tab === "addresses" && (
          <div>
            <h2 style={{ marginTop: 0, display: "flex", gap: 8, alignItems: "center" }}>
              <Home size={18} /> Address book
            </h2>
            {(me?.addresses || []).length === 0 && (
              <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
                No addresses yet — add one below. It will be suggested at checkout.
              </p>
            )}
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {(me?.addresses || []).map((a, i) => (
                <div
                  key={i}
                  style={{ border: "1px solid #eee", borderRadius: 12, padding: 14, fontSize: 14 }}
                >
                  <strong>
                    {a.label || `Address ${i + 1}`} {a.isDefault && <span style={{ color: "#047857" }}>(default)</span>}
                  </strong>
                  <p style={{ margin: "6px 0", color: "var(--color-muted)" }}>{addrDisplay(a)}</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    {!a.isDefault && (
                      <button onClick={() => makeDefault(i)} disabled={addrBusy} style={{ fontSize: 13, textDecoration: "underline", background: "none", border: 0, cursor: "pointer", padding: 0 }}>
                        Set default
                      </button>
                    )}
                    <button onClick={() => removeAddress(i)} disabled={addrBusy} style={{ fontSize: 13, textDecoration: "underline", background: "none", border: 0, cursor: "pointer", padding: 0, color: "#b3261e" }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: 20 }}>Add address</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Street *</label>
                <input style={inputStyle} value={aStreet} onChange={(e) => setAStreet(e.target.value)} placeholder="Flat, street, area" />
              </div>
              <div>
                <label style={labelStyle}>City *</label>
                <input style={inputStyle} value={aCity} onChange={(e) => setACity(e.target.value)} placeholder="Surat" />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input style={inputStyle} value={aState} onChange={(e) => setAState(e.target.value)} placeholder="Gujarat" />
              </div>
              <div>
                <label style={labelStyle}>Pincode</label>
                <input style={inputStyle} value={aZip} onChange={(e) => setAZip(e.target.value)} placeholder="395007" />
              </div>
              <div>
                <label style={labelStyle}>Label</label>
                <input style={inputStyle} value={aLabel} onChange={(e) => setALabel(e.target.value)} placeholder="Home" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Phone (optional)</label>
                <input style={inputStyle} value={aPhone} onChange={(e) => setAPhone(e.target.value)} placeholder="+91 …" />
              </div>
            </div>
            <button className="checkout" style={{ marginTop: 14 }} onClick={addAddress} disabled={addrBusy}>
              {addrBusy ? "Saving…" : "Save address"}
            </button>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h2 style={{ marginTop: 0, display: "flex", gap: 8, alignItems: "center" }}>
              <Package size={18} /> Order history
            </h2>
            {ordersLoading && <p>Loading orders…</p>}
            {!ordersLoading && orders.length === 0 && (
              <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
                No orders yet. <Link href="/shop" style={{ textDecoration: "underline" }}>Start shopping</Link>
              </p>
            )}
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {orders.map((o) => (
                <div key={o._id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 14, fontSize: 14 }}>
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
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "rgba(36, 72, 146, 0.08)",
                        }}
                      >
                        Track order →
                      </Link>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : ""}
                    </span>
                  </div>
                  <p style={{ margin: "6px 0", color: "var(--color-muted)" }}>
                    {(o.items || []).map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    <strong>{formatINR(o.totalAmount || 0)}</strong>{" "}
                    <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                      • payment: {o.paymentStatus} • status: {o.orderStatus}
                      {o.trackingId ? ` • tracking: ${o.trackingId}` : ""}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "loyalty" && (
          <div>
            <h2 style={{ marginTop: 0, display: "flex", gap: 8, alignItems: "center" }}>
              <BadgePercent size={18} /> Loyalty coupons
            </h2>
            {loyaltyLoading && <p>Loading coupons…</p>}
            {!loyaltyLoading && loyalty.length === 0 && (
              <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
                No loyalty coupons yet — they unlock as your lifetime spend grows.
              </p>
            )}
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {loyalty.map((c) => (
                <div key={c.id || c.code} style={{ border: "1px solid #eee", borderRadius: 12, padding: 14, fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ letterSpacing: 1 }}>{c.code}</strong>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.isUnlocked ? "#047857" : "#92400e" }}>
                      {c.isUnlocked ? "Unlocked" : `${formatINR(c.remainingSpend || 0)} to go`}
                    </span>
                  </div>
                  <p style={{ margin: "6px 0", color: "var(--color-muted)" }}>
                    {c.discountType === "percent" ? `${c.discountValue}% off` : `${formatINR(c.discountValue)} off`}
                    {c.minSpendGoal ? ` • unlocks at ${formatINR(c.minSpendGoal)} spend` : ""}
                  </p>
                  {typeof c.progress === "number" && (
                    <div style={{ height: 8, borderRadius: 999, background: "#f1ece4", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, c.progress))}%`,
                          height: "100%",
                          background: c.isUnlocked ? "#047857" : "#c9a15a",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 10 }}>
              Apply unlocked codes at checkout to receive instant discounts on your order summary and payment.
            </p>
          </div>
        )}

        {tab === "security" && (
          <div>
            <h2 style={{ marginTop: 0, display: "flex", gap: 8, alignItems: "center" }}>
              <Lock size={18} /> Security
            </h2>
            <label style={labelStyle}>Current password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingRight: 44 }}
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                aria-label={showOldPassword ? "Hide current password" : "Show current password"}
                aria-pressed={showOldPassword}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  color: "var(--color-muted)",
                }}
              >
                {showOldPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <label style={labelStyle}>New password (min 6 chars)</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingRight: 44 }}
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                aria-pressed={showNewPassword}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  color: "var(--color-muted)",
                }}
              >
                {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div>
              <button className="checkout" style={{ marginTop: 14 }} onClick={changePassword} disabled={saving}>
                {saving ? "Updating…" : "Change password"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <PageFrame>
      <Suspense fallback={<main className="inner-page wrap">Loading…</main>}>
        <ProfileInner />
      </Suspense>
    </PageFrame>
  );
}
