"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  MapPin,
  CreditCard,
  ChevronRight,
  X,
  AlertTriangle,
  Box,
  Sparkles,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { PageFrame } from "@/components/storefront";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { apiRequest } from "@/lib/api-client";
import { formatINR, type ShopOrder } from "@/lib/checkout";

const SUPPORT_EMAIL = "accurateliquid@gmail.com";
const SUPPORT_PHONE = "+91 72650 11288";
const WHATSAPP_NUMBER = "917265011288";

interface MilestoneStep {
  key: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

const MILESTONES: MilestoneStep[] = [
  {
    key: "placed",
    label: "Order Placed",
    desc: "Order confirmed & received",
    icon: CheckCircle2,
  },
  {
    key: "processing",
    label: "Processing & Packed",
    desc: "Quality verified & sealed",
    icon: Package,
  },
  {
    key: "shipped",
    label: "In Transit",
    desc: "Dispatched with courier partner",
    icon: Truck,
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    desc: "Arriving today at your doorstep",
    icon: Box,
  },
  {
    key: "delivered",
    label: "Delivered",
    desc: "Handed over safely",
    icon: ShieldCheck,
  },
];

function getStepIndex(status: string): number {
  const s = (status || "").toLowerCase().trim();
  switch (s) {
    case "placed":
      return 0;
    case "processing":
      return 1;
    case "shipped":
    case "in_transit":
      return 2;
    case "out_for_delivery":
      return 3;
    case "delivered":
      return 4;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

function getStatusBadge(status: string) {
  const s = (status || "").toLowerCase().trim();
  switch (s) {
    case "placed":
      return {
        text: "Order Placed",
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-600",
      };
    case "processing":
      return {
        text: "In Processing",
        bg: "bg-amber-50 text-amber-800 border-amber-200",
        dot: "bg-amber-600",
      };
    case "shipped":
    case "in_transit":
      return {
        text: "In Transit",
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        dot: "bg-indigo-600",
      };
    case "out_for_delivery":
      return {
        text: "Out for Delivery",
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        dot: "bg-purple-600",
      };
    case "delivered":
      return {
        text: "Delivered",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-600",
      };
    case "cancelled":
      return {
        text: "Cancelled",
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-600",
      };
    default:
      return {
        text: status || "Received",
        bg: "bg-slate-50 text-slate-700 border-slate-200",
        dot: "bg-slate-600",
      };
  }
}

function getCourierTrackingUrl(courierName?: string, trackingId?: string) {
  if (!trackingId) return null;
  const c = (courierName || "").toLowerCase().trim();
  if (c.includes("delhivery")) {
    return `https://www.delhivery.com/track/package/${encodeURIComponent(trackingId)}`;
  }
  if (c.includes("bluedart") || c.includes("blue dart")) {
    return `https://www.bluedart.com/tracking?handler=traking&trackFor=0&trackNo=${encodeURIComponent(trackingId)}`;
  }
  if (c.includes("dtdc")) {
    return `https://www.dtdc.in/tracking/shipment-tracking.asp?shipmentNo=${encodeURIComponent(trackingId)}`;
  }
  if (c.includes("ekart")) {
    return `https://ekartlogistics.com/shipmenttrack/${encodeURIComponent(trackingId)}`;
  }
  if (c.includes("xpressbees") || c.includes("xpress")) {
    return `https://www.xpressbees.com/shipment/tracking/${encodeURIComponent(trackingId)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${courierName || "courier"} tracking ${trackingId}`)}`;
}

function TrackOrderInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();

  const [query, setQuery] = useState(
    searchParams.get("orderNumber") ||
      searchParams.get("number") ||
      searchParams.get("trackingId") ||
      searchParams.get("q") ||
      "",
  );
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [copiedOrderNo, setCopiedOrderNo] = useState(false);

  // Auto-lookup if query is in URL on mount
  useEffect(() => {
    const initialQuery =
      searchParams.get("orderNumber") ||
      searchParams.get("number") ||
      searchParams.get("trackingId") ||
      searchParams.get("q");

    if (initialQuery && initialQuery.trim()) {
      handleLookup(initialQuery.trim(), searchParams.get("phone") || undefined);
    }
  }, []);

  async function handleLookup(lookupQuery?: string, lookupPhone?: string) {
    const q = (lookupQuery !== undefined ? lookupQuery : query).trim();
    const p = (lookupPhone !== undefined ? lookupPhone : phone).trim();

    if (!q) {
      toast.error("Please enter an Order Number or Tracking ID");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      const endpoint = `/orders/track/${encodeURIComponent(q)}${
        p ? `?phone=${encodeURIComponent(p)}` : ""
      }`;
      const data = await apiRequest<ShopOrder>(endpoint);

      if (data && (data.orderNumber || data._id)) {
        setOrder(data);
        setErrorMsg(null);
        // Sync URL query cleanly without a full refresh
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("orderNumber", data.orderNumber || q);
          if (p) url.searchParams.set("phone", p);
          window.history.replaceState({}, "", url.toString());
        }
      } else {
        setOrder(null);
        setErrorMsg("Order not found. Please verify the order number or tracking ID.");
      }
    } catch (err: any) {
      setOrder(null);
      const msg =
        err?.message ||
        "Could not find an order matching that number. Please verify and try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, type: "awb" | "order") {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    if (type === "awb") {
      setCopiedAWB(true);
      setTimeout(() => setCopiedAWB(false), 2000);
    } else {
      setCopiedOrderNo(true);
      setTimeout(() => setCopiedOrderNo(false), 2000);
    }
    toast.success("Copied to clipboard!");
  }

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;
  const isCancelled = (order?.orderStatus || "").toLowerCase() === "cancelled";
  const badge = order ? getStatusBadge(order.orderStatus) : null;
  const trackingUrl = order ? getCourierTrackingUrl(order.courierName, order.trackingId) : null;

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#0e1117]">
      {/* =========================================================
          HERO & SEARCH SECTION
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-[#edf2fe]/80 via-white to-[#f8faff] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Soft background ambient glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#244892]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-1/3 h-64 w-64 rounded-full bg-[#da3f51]/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Breadcrumb pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#244892]/15 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#244892] shadow-xs backdrop-blur-xs">
            <Sparkles size={13} className="text-[#244892]" />
            Live Shipment Tracker
          </div>

          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-[#0e1117] sm:text-4xl lg:text-5xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#64748b] sm:text-base">
            Check the real-time fulfillment status of your Accurate Liquid order.
            Enter your order number or courier AWB tracking code below.
          </p>

          {/* Search Box Card */}
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl shadow-[#244892]/5 sm:p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup();
              }}
              className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Order No. (e.g. ORD-2025-1014-0001) or AWB Tracking ID"
                  className="w-full rounded-xl border-0 bg-transparent py-3.5 pl-11 pr-10 text-sm font-medium text-[#0e1117] placeholder:text-slate-400 focus:outline-hidden focus:ring-0"
                  autoFocus={!query}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setOrder(null);
                      setSearched(false);
                      setErrorMsg(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Clear input"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244892] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#244892]/20 transition-all hover:bg-[#1b3773] hover:shadow-lg disabled:opacity-70 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Tracking…
                  </>
                ) : (
                  <>
                    <span>Track Order</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Helper Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#64748b]">
            {isAuthenticated && (
              <Link
                href="/profile?tab=orders"
                className="inline-flex items-center gap-1 font-medium text-[#244892] hover:underline"
              >
                <span>View all your past orders</span>
                <ChevronRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT AREA
      ========================================================= */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Loading Spinner Skeleton */}
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Loader2
              size={36}
              className="mx-auto animate-spin text-[#244892]"
            />
            <h3 className="mt-4 text-base font-semibold text-[#0e1117]">
              Locating your package…
            </h3>
            <p className="mt-1 text-sm text-[#64748b]">
              Connecting with our warehouse and logistics network.
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-rose-900">
              We couldn&apos;t find this order
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-rose-700">
              {errorMsg}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => handleLookup()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-xs transition hover:bg-rose-50"
              >
                <RefreshCw size={15} />
                Try again
              </button>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-rose-700"
              >
                <MessageCircle size={15} />
                Contact Customer Care
              </Link>
            </div>
          </div>
        )}

        {/* SUCCESS STATE: ORDER FOUND */}
        {!loading && order && (
          <div className="space-y-6">
            {/* Header Status Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-[#0e1117] sm:text-2xl">
                      {order.orderNumber}
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleCopy(order.orderNumber, "order")}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                      title="Copy order number"
                    >
                      {copiedOrderNo ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {badge && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badge.bg}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                        {badge.text}
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748b] sm:text-sm">
                    <span>
                      Placed on:{" "}
                      <strong className="text-slate-800">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recently"}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Items:{" "}
                      <strong className="text-slate-800">
                        {(order.items || []).reduce(
                          (acc, it) => acc + (it.quantity || 1),
                          0,
                        )}{" "}
                        units
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Total:{" "}
                      <strong className="text-slate-800">
                        {formatINR(order.totalAmount || 0)}
                      </strong>
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLookup()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                  >
                    <RefreshCw size={13} />
                    Refresh Status
                  </button>
                  <Link
                    href={`/contact?order=${encodeURIComponent(order.orderNumber)}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#244892]/20 bg-[#edf2fe] px-3.5 py-2 text-xs font-semibold text-[#244892] shadow-2xs transition hover:bg-[#dfe9fd]"
                  >
                    <MessageCircle size={13} />
                    Need Help?
                  </Link>
                </div>
              </div>

              {/* CANCELLED ALERT (if applicable) */}
              {isCancelled && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                  <AlertTriangle size={20} className="shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold">Order Cancelled</h4>
                    <p className="mt-0.5 text-xs text-rose-700">
                      This order was cancelled. If you already made a payment,
                      your refund will be automatically credited back within 3-5
                      business days to the original payment source.
                    </p>
                  </div>
                </div>
              )}

              {/* TIMELINE STEPPER (when not cancelled) */}
              {!isCancelled && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Journey & Milestones
                  </h3>

                  {/* Desktop / Tablet Stepper (horizontal) */}
                  <div className="relative mt-8 hidden sm:block">
                    {/* Background Progress track */}
                    <div className="absolute top-5 left-10 right-10 h-1 bg-slate-200 -z-0" />
                    {/* Filled Progress track */}
                    <div
                      className="absolute top-5 left-10 h-1 bg-[#244892] transition-all duration-700 -z-0"
                      style={{
                        width: `${Math.min(
                          100,
                          (Math.max(0, currentStep) / (MILESTONES.length - 1)) * 100,
                        )}%`,
                      }}
                    />

                    <div className="relative z-10 grid grid-cols-5 gap-2">
                      {MILESTONES.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = currentStep > idx;
                        const isCurrent = currentStep === idx;
                        const isFuture = currentStep < idx;

                        return (
                          <div
                            key={step.key}
                            className="flex flex-col items-center text-center"
                          >
                            <div
                              className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                isDone
                                  ? "border-[#244892] bg-[#244892] text-white shadow-md shadow-[#244892]/20"
                                  : isCurrent
                                  ? "border-[#244892] bg-white text-[#244892] ring-4 ring-[#244892]/15 shadow-md"
                                  : "border-slate-200 bg-white text-slate-400"
                              }`}
                            >
                              {isDone ? (
                                <Check size={18} strokeWidth={2.5} />
                              ) : (
                                <Icon size={18} strokeWidth={isCurrent ? 2.2 : 1.8} />
                              )}
                              {isCurrent && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#da3f51] opacity-75" />
                                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#da3f51]" />
                                </span>
                              )}
                            </div>

                            <p
                              className={`mt-3 text-xs font-bold leading-tight ${
                                isCurrent
                                  ? "text-[#244892]"
                                  : isDone
                                  ? "text-[#0e1117]"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="mt-1 text-[11px] text-[#64748b] leading-tight px-1">
                              {step.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Stepper (vertical stack) */}
                  <div className="mt-6 space-y-6 sm:hidden">
                    {MILESTONES.map((step, idx) => {
                      const Icon = step.icon;
                      const isDone = currentStep > idx;
                      const isCurrent = currentStep === idx;
                      const isLast = idx === MILESTONES.length - 1;

                      return (
                        <div key={step.key} className="relative flex items-start gap-4">
                          {!isLast && (
                            <div
                              className={`absolute left-5 top-10 bottom-[-24px] w-0.5 ${
                                isDone ? "bg-[#244892]" : "bg-slate-200"
                              }`}
                            />
                          )}
                          <div
                            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                              isDone
                                ? "border-[#244892] bg-[#244892] text-white"
                                : isCurrent
                                ? "border-[#244892] bg-white text-[#244892] ring-4 ring-[#244892]/15"
                                : "border-slate-200 bg-white text-slate-400"
                            }`}
                          >
                            {isDone ? (
                              <Check size={16} strokeWidth={2.5} />
                            ) : (
                              <Icon size={16} strokeWidth={isCurrent ? 2.2 : 1.8} />
                            )}
                          </div>
                          <div className="pt-1">
                            <p
                              className={`text-sm font-bold ${
                                isCurrent
                                  ? "text-[#244892]"
                                  : isDone
                                  ? "text-[#0e1117]"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.label}
                              {isCurrent && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-[#edf2fe] px-2 py-0.5 text-[10px] font-semibold text-[#244892]">
                                  Current Status
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-[#64748b]">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Courier & Shipping Information Card */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Courier Partner & AWB */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2fe] text-[#244892]">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0e1117]">
                      Courier & Dispatch
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Shipping carrier tracking information
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5 divide-y divide-slate-100 text-sm">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#64748b]">Courier Partner:</span>
                    <span className="font-semibold text-[#0e1117]">
                      {order.courierName || "Accurate Express Logistics"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[#64748b]">Tracking ID / AWB:</span>
                    {order.trackingId ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#244892]">
                          {order.trackingId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.trackingId || "", "awb")}
                          className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-100"
                          title="Copy Tracking ID"
                        >
                          {copiedAWB ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs italic text-slate-400">
                        Will be assigned upon dispatch
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[#64748b]">Estimated Delivery:</span>
                    <span className="font-semibold text-emerald-700">
                      {order.orderStatus === "delivered"
                        ? "Delivered successfully"
                        : "2 - 4 Business Days"}
                    </span>
                  </div>

                  {order.trackingId && trackingUrl && (
                    <div className="pt-4">
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#244892]/20 bg-[#edf2fe] py-2.5 text-xs font-semibold text-[#244892] transition hover:bg-[#dfe9fd]"
                      >
                        <span>Open Carrier Portal ({order.courierName || "Tracking"})</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address & Contact */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2fe] text-[#244892]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0e1117]">
                      Destination Details
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Delivery address & customer contact
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5 divide-y divide-slate-100 text-sm">
                  <div className="flex items-start justify-between pt-1">
                    <span className="text-[#64748b]">Recipient:</span>
                    <span className="font-semibold text-[#0e1117] text-right">
                      {order.customerName || "Customer"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-3">
                    <span className="text-[#64748b]">Phone:</span>
                    <span className="font-medium text-[#0e1117]">
                      {order.phone || "—"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-3">
                    <span className="text-[#64748b]">Address:</span>
                    <span className="max-w-[240px] text-right font-medium text-[#0e1117]">
                      {order.address ? `${order.address}, ${order.pincode || ""}` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[#64748b]">Packaging:</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <ShieldCheck size={14} />
                      Tamper-proof & Leak-safe
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Contents / Items Breakdown */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0e1117]">
                    Package Contents
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Items included in this delivery
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {(order.items || []).length} Product{order.items?.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                {(order.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#edf2fe] text-[#244892]">
                        <Package size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0e1117]">
                          {item.name}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#64748b]">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.sku && <span>•</span>}
                          <span>Qty: <strong>{item.quantity}</strong></span>
                          <span>•</span>
                          <span>Price: {formatINR(item.price || 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <p className="text-sm font-bold text-[#0e1117]">
                        {formatINR((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown Summary */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="ml-auto max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between text-[#64748b]">
                    <span>Items Subtotal:</span>
                    <span>{formatINR(order.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748b]">
                    <span>Shipping Charges:</span>
                    <span>
                      {(order.shippingCost || 0) > 0
                        ? formatINR(order.shippingCost)
                        : "FREE Delivery"}
                    </span>
                  </div>
                  {(order.discount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount Applied{order.couponCode ? ` (${order.couponCode})` : ""}:</span>
                      <span>-{formatINR(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-[#0e1117]">
                    <span>Total Amount:</span>
                    <span className="text-[#244892]">
                      {formatINR(order.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="pt-2 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <CreditCard size={12} />
                      Payment:{" "}
                      <strong className="capitalize">
                        {order.paymentStatus || "Paid"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support & Help Banner */}
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-r from-[#edf2fe] via-white to-[#edf2fe] p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0e1117]">
                    Need assistance with this shipment?
                  </h3>
                  <p className="mt-1 text-xs text-[#64748b] sm:text-sm">
                    Our customer care team is available Mon-Sat, 9:00 AM – 7:00 PM IST
                    to help with address corrections, delivery instructions, or queries.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      `Hi Accurate Liquid team, I have a query regarding my order ${order.orderNumber}.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#20ba59]"
                  >
                    <MessageCircle size={15} />
                    WhatsApp Us
                  </a>
                  <a
                    href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                  >
                    <Phone size={14} />
                    Call Care
                  </a>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                      `Order Inquiry: ${order.orderNumber}`,
                    )}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                  >
                    <Mail size={14} />
                    Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INITIAL EMPTY STATE (BEFORE USER SEARCHES) */}
        {!loading && !order && !errorMsg && (
          <div className="mt-4 space-y-12">
            {/* 3 Steps Guide Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10">
              <div className="text-center">
                <h2 className="text-xl font-bold text-[#0e1117] sm:text-2xl">
                  How to track your Accurate package
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-[#64748b]">
                  Follow 3 simple steps to find your package updates anytime
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-[#f8faff] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2fe] text-[#244892]">
                    <Search size={22} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#0e1117]">
                    1. Find Order Number
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
                    Check your checkout SMS confirmation, email invoice, or profile
                    orders tab for your <strong>ORD-XXXX</strong> number.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#f8faff] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2fe] text-[#244892]">
                    <Clock size={22} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#0e1117]">
                    2. Check Live Milestones
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
                    Watch as your premium cleaning formulation is verified,
                    dispatched, and assigned an AWB tracking code.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#f8faff] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2fe] text-[#244892]">
                    <ShieldCheck size={22} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#0e1117]">
                    3. Doorstep Delivery
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
                    Receive your sealed, tamper-proof liquid packages within
                    2 to 4 business days anywhere in India.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className="rounded-2xl border border-[#244892]/10 bg-gradient-to-r from-[#edf2fe] to-white p-6 text-center sm:p-8">
              <h3 className="text-base font-bold text-[#244892]">
                100% Guaranteed Safe & Leak-Proof Delivery
              </h3>
              <p className="mx-auto mt-1 max-w-2xl text-xs text-[#64748b] sm:text-sm">
                Every Accurate Liquid bottle is triple-sealed with induction heat
                liners, capped with tamper-evident rings, and cushioned in heavy-duty
                protective cartons.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <PageFrame>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#244892]" />
          </div>
        }
      >
        <TrackOrderInner />
      </Suspense>
    </PageFrame>
  );
}
