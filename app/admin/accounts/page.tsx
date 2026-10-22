"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PageHeader,
  Panel,
  StatStrip,
} from "@/components/admin/AdminShell";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { apiRequest } from "@/lib/api-client";
import { inr } from "@/lib/admin-ui";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface TransactionRow extends Record<string, any> {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  orderStatus: string;
  createdAt: string;
}

export default function AccountsPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/orders").catch(() => []);
      const list = Array.isArray(res) ? res : res?.items || [];
      setOrders(list);
    } catch (err: any) {
      toast.error(err.message || "Failed to load financial records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const transactions: TransactionRow[] = useMemo(() => {
    return orders.map((o: any) => {
      const orderStatus = o.orderStatus || o.status;
      const isPaid =
        o.paymentStatus === "paid" ||
        orderStatus === "delivered" ||
        o.isPaid === true;
      const isFailed = o.paymentStatus === "failed" || orderStatus === "cancelled";
      const status: "paid" | "pending" | "failed" | "refunded" = isPaid
        ? "paid"
        : isFailed
        ? "failed"
        : "pending";

      return {
        id: o._id || o.id,
        orderNumber: o.orderNumber || `#${(o._id || o.id || "").slice(-6).toUpperCase()}`,
        customerName:
          o.shippingAddress?.fullName ||
          (o.user?.firstname
            ? `${o.user?.firstname || ""} ${o.user?.lastname || ""}`.trim()
            : o.customerName || "Customer"),
        customerPhone: o.shippingAddress?.phone || o.user?.phone,
        amount: Number(o.totalAmount || o.total || 0),
        // Orders carry no method field: a Razorpay payment id ("pay_…") means online, otherwise COD.
        paymentMethod: (o.paymentMethod || (String(o.paymentId || "").startsWith("pay_") ? "Razorpay" : "COD")).toUpperCase(),
        paymentStatus: status,
        orderStatus: orderStatus || "pending",
        createdAt: o.createdAt || new Date().toISOString(),
      };
    });
  }, [orders]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterMethod !== "all" && !t.paymentMethod.includes(filterMethod.toUpperCase())) {
        return false;
      }
      if (filterStatus !== "all" && t.paymentStatus !== filterStatus) {
        return false;
      }
      if (dateFilter === "today") {
        const today = new Date().toISOString().split("T")[0];
        if (!t.createdAt.startsWith(today)) return false;
      } else if (dateFilter === "month") {
        const thisMonth = new Date().toISOString().slice(0, 7);
        if (!t.createdAt.startsWith(thisMonth)) return false;
      }
      return true;
    });
  }, [transactions, filterMethod, filterStatus, dateFilter]);

  // Financial calculations
  const statsData = useMemo(() => {
    const totalCollected = transactions
      .filter((t) => t.paymentStatus === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingCollection = transactions
      .filter((t) => t.paymentStatus === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const onlinePayments = transactions
      .filter((t) => t.paymentMethod.includes("RAZORPAY") && t.paymentStatus === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    const codPayments = transactions
      .filter((t) => t.paymentMethod.includes("COD") && t.paymentStatus === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      { label: "Total Collected", value: inr(totalCollected), tone: "good" as const },
      { label: "Pending Receivables", value: inr(pendingCollection), tone: "due" as const },
      { label: "Online (Razorpay)", value: inr(onlinePayments), tone: "default" as const },
      { label: "Cash on Delivery", value: inr(codPayments), tone: "default" as const },
    ];
  }, [transactions]);

  const columns: ColumnDef<TransactionRow>[] = [
    {
      key: "orderNumber",
      label: "Order / Ref",
      render: (_val, r: TransactionRow) => (
        <span className="font-mono font-semibold text-brand-950 text-xs">
          {r.orderNumber}
        </span>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      render: (_val, r: TransactionRow) => (
        <div>
          <p className="font-medium text-charcoal text-sm">{r.customerName}</p>
          {r.customerPhone && (
            <p className="text-xs text-charcoal/50 font-mono">{r.customerPhone}</p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (_val, r: TransactionRow) => (
        <span className="font-serif font-bold text-sm text-charcoal">
          {inr(r.amount)}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (_val, r: TransactionRow) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold-deep border border-gold/20">
          <CreditCard size={12} />
          {r.paymentMethod}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      render: (_val, r: TransactionRow) => {
        if (r.paymentStatus === "paid") {
          return (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <CheckCircle2 size={12} />
              Paid
            </span>
          );
        }
        if (r.paymentStatus === "pending") {
          return (
            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <Clock size={12} />
              Pending
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <AlertCircle size={12} />
            Failed
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (_val, r: TransactionRow) => (
        <span className="text-xs text-charcoal/60">
          {new Date(r.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts & Financial Ledger"
        description="Monitor online payments, receivables, and revenue settlement history"
        actions={
          <button
            onClick={loadData}
            className="btn-secondary flex items-center gap-2 text-xs py-2 px-3"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Summary Cards */}
      <StatStrip stats={statsData} columns={4} />

      {/* Filter and Table Panel */}
      <Panel>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border-gray">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gold-deep" />
            <h3 className="font-serif text-lg font-bold text-charcoal">
              Payment Transactions
            </h3>
            <span className="text-xs text-charcoal/50">
              ({filteredTransactions.length} records)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Method filter */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="text-xs bg-cream/40 border border-border-gray rounded-md px-3 py-1.5 text-charcoal focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="all">All Methods</option>
              <option value="razorpay">Razorpay</option>
              <option value="cod">Cash on Delivery</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-cream/40 border border-border-gray rounded-md px-3 py-1.5 text-charcoal focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed / Cancelled</option>
            </select>

            {/* Period filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs bg-cream/40 border border-border-gray rounded-md px-3 py-1.5 text-charcoal focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredTransactions}
          searchPlaceholder="Search customer or order ref..."
          exportFileName="accurate-liquid-accounts"
        />
      </Panel>
    </div>
  );
}
