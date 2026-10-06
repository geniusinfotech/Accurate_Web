"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Tags,
  TrendingUp,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import { inr } from "@/lib/admin-ui";
import { useAuth } from "@/context/AuthContext";
import { useAdminLayout } from "@/context/AdminLayoutContext";
import { AnimatedCounter } from "@/components/motion";
import type { DashboardStats } from "@/lib/types/api";

type Order = {
  id?: string;
  _id?: string;
  customerName?: string;
  userName?: string;
  user?: { name?: string };
  items?: unknown[];
  totalAmount?: number | string;
  total?: number | string;
  orderStatus?: string;
  status?: string;
  createdAt?: string;
};

const QUICK_ACTIONS = [
  {
    href: "/admin/orders",
    label: "Orders & Sales",
    description: "Manage orders, payments and shipments",
    icon: ShoppingBag,
    iconClass: "bg-blue-500/10 text-blue-600",
  },
  {
    href: "/admin/products",
    label: "Products",
    description: "Inventory, pricing and product media",
    icon: Package,
    iconClass: "bg-violet-500/10 text-violet-600",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    description: "Organize your storefront collections",
    icon: Tags,
    iconClass: "bg-emerald-500/10 text-emerald-600",
  },
  {
    href: "/admin/accounts",
    label: "Accounts & Ledger",
    description: "Balances, transactions and accounts",
    icon: Wallet,
    iconClass: "bg-amber-500/10 text-amber-600",
  },
  {
    href: "/admin/reports",
    label: "Reports & Insights",
    description: "Analytics, financial reports and exports",
    icon: BarChart3,
    iconClass: "bg-rose-500/10 text-rose-600",
  },
];

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-blue-50 text-blue-700 ring-blue-600/10",
  processing: "bg-amber-50 text-amber-700 ring-amber-600/10",
  shipped: "bg-violet-50 text-violet-700 ring-violet-600/10",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  cancelled: "bg-red-50 text-red-700 ring-red-600/10",
};

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  placed: Clock3,
  processing: Clock3,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

function getOrderStatus(order: Order) {
  return String(order.orderStatus || order.status || "placed").toLowerCase();
}

function getOrderId(order: Order) {
  return String(order.id || order._id || "");
}

function getCustomerName(order: Order) {
  return order.customerName || order.userName || order.user?.name || "Guest";
}

function getOrderTotal(order: Order) {
  return Number(order.totalAmount || order.total || 0);
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "G"
  );
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatCard({
  label,
  value,
  prefix,
  icon: Icon,
  iconClass,
  helper,
  loading,
}: {
  label: string;
  value: number;
  prefix?: string;
  icon: typeof TrendingUp;
  iconClass: string;
  helper: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <div className="mt-3 flex items-baseline gap-1 text-3xl font-bold tracking-tight text-slate-950">
            {prefix}
            {loading ? (
              <span className="text-slate-200">•••</span>
            ) : (
              <AnimatedCounter value={value} decimals={0} />
            )}
          </div>

          <div className="mt-2 text-xs text-slate-500">{helper}</div>
        </div>

        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-slate-900 transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { setIsCommandOpen } = useAdminLayout();

  const [summary, setSummary] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryResponse, ordersResponse] = await Promise.all([
        apiRequest("/orders/summary").catch(() => null),
        apiRequest("/orders").catch(() => []),
      ]);

      const orders = Array.isArray(ordersResponse)
        ? ordersResponse
        : ordersResponse?.items || [];

      const list = Array.isArray(orders) ? (orders as Order[]) : [];
      setRecentOrders(list.slice(0, 6));

      if (summaryResponse) {
        // The API names these without the "web" prefix the dashboard uses.
        const r = summaryResponse as Record<string, number>;
        setSummary({
          ...r,
          totalWebOrdersCount: r.totalOrdersCount,
          todayWebOrdersCount: r.todayOrdersCount,
          todayWebRevenue: r.todayRevenue,
          webPlacedCount: r.placedCount,
          webProcessingCount: r.processingCount,
        } as unknown as DashboardStats);
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const todayOrders = list.filter((order) =>
        order.createdAt?.startsWith(today),
      );

      const todayRevenue = todayOrders.reduce(
        (total, order) => total + getOrderTotal(order),
        0,
      );

      const totalRevenue = list.reduce(
        (total, order) => total + getOrderTotal(order),
        0,
      );

      const pendingShipmentCount = list.filter((order) => {
        const status = getOrderStatus(order);
        return status === "placed" || status === "processing";
      }).length;

      setSummary({
        totalProducts: 0,
        totalOrders: list.length,
        totalCustomers: 0,
        totalRevenue,
        recentOrders: list.slice(
          0,
          6,
        ) as unknown as DashboardStats["recentOrders"],
        topProducts: [],
        lowStockProducts: [],
        pendingShipmentCount,
        todayWebOrdersCount: todayOrders.length,
        todayWebRevenue: todayRevenue,
        webPlacedCount: list.filter(
          (order) => getOrderStatus(order) === "placed",
        ).length,
        webProcessingCount: list.filter(
          (order) => getOrderStatus(order) === "processing",
        ).length,
        totalWebRevenue: totalRevenue,
        totalWebOrdersCount: list.length,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchDashboardData();
  };

  const pendingShipments = summary?.pendingShipmentCount ?? 0;
  const placedCount = summary?.webPlacedCount ?? 0;
  const processingCount = summary?.webProcessingCount ?? 0;
  const totalOrders = summary?.totalWebOrdersCount ?? 0;

  const fulfillmentPercent = useMemo(() => {
    const total = placedCount + processingCount;
    if (!total) return 0;
    return Math.min(100, Math.round((processingCount / total) * 100));
  }, [placedCount, processingCount]);

  return (
    <main className="min-h-full space-y-6 bg-slate-50/40 pb-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-xl sm:px-7 lg:px-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              Store operations live
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {user?.name || "Administrator"}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Monitor sales, fulfillment and storefront activity from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              <Search className="h-4 w-4" />
              Search
              <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline">
                ⌘K
              </kbd>
            </button>

            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-slate-100"
            >
              <Package className="h-4 w-4" />
              Add / Manage Products
            </Link>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Revenue"
          value={summary?.todayWebRevenue ?? 0}
          prefix="₹"
          icon={TrendingUp}
          iconClass="bg-emerald-50 text-emerald-600"
          helper={<span className="text-emerald-600">Live web sales</span>}
          loading={loading}
        />

        <StatCard
          label="Today's Orders"
          value={summary?.todayWebOrdersCount ?? 0}
          icon={ShoppingBag}
          iconClass="bg-blue-50 text-blue-600"
          helper={
            <>
              <span className="font-semibold text-slate-700">
                {placedCount}
              </span>{" "}
              placed ·{" "}
              <span className="font-semibold text-slate-700">
                {processingCount}
              </span>{" "}
              processing
            </>
          }
          loading={loading}
        />

        <StatCard
          label="Total Web Orders"
          value={totalOrders}
          icon={Package}
          iconClass="bg-violet-50 text-violet-600"
          helper="Lifetime storefront volume"
          loading={loading}
        />

        <StatCard
          label="Total Revenue"
          value={summary?.totalWebRevenue ?? 0}
          prefix="₹"
          icon={BarChart3}
          iconClass="bg-amber-50 text-amber-600"
          helper="All recorded web orders"
          loading={loading}
        />
      </section>

      {/* Fulfillment attention */}
      {pendingShipments > 0 && (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                <Truck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {pendingShipments} order
                  {pendingShipments === 1 ? "" : "s"} need fulfillment
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {placedCount} awaiting packing · {processingCount} in
                  processing
                </p>
              </div>
            </div>

            <Link
              href="/admin/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Open Orders
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Operations */}
      <section className="grid grid-cols-1 gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Quick Actions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Jump directly into the areas you use most.
              </p>
            </div>

            <span className="hidden rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 sm:inline">
              ⌘K
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACTIONS.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl ${item.iconClass}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>

                    <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-900">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent orders */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Recent Web Orders
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Latest transactions from your storefront.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-blue-600"
          >
            View all orders
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No recent orders
            </p>
            <p className="mt-1 text-xs text-slate-400">
              New storefront orders will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-3.5 font-bold">Order</th>
                  <th className="px-4 py-3.5 font-bold">Customer</th>
                  <th className="px-4 py-3.5 font-bold">Date</th>
                  <th className="px-4 py-3.5 font-bold">Items</th>
                  <th className="px-4 py-3.5 font-bold">Amount</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const status = getOrderStatus(order);
                  const customer = getCustomerName(order);
                  const StatusIcon =
                    STATUS_ICONS[status] || STATUS_ICONS.placed;

                  return (
                    <tr
                      key={getOrderId(order)}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          #{getOrderId(order).slice(-6).toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                            {getInitials(customer)}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">
                            {customer}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {Array.isArray(order.items)
                          ? `${order.items.length} item${
                              order.items.length === 1 ? "" : "s"
                            }`
                          : "—"}
                      </td>

                      <td className="px-4 py-4 text-xs font-bold text-slate-900">
                        ₹{inr(getOrderTotal(order))}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ring-1 ring-inset ${
                            STATUS_STYLES[status] || STATUS_STYLES.placed
                          }`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href="/admin/orders"
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-slate-950"
                        >
                          Inspect
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
