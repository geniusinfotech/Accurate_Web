"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import Modal from "@/components/admin/Modal";
import { useDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader, Tabs } from "@/components/admin/AdminShell";
import {
  modalInputCls,
  stackedLabelCls,
  inr,
  formatBillDate,
  toDateInput,
} from "@/lib/admin-ui";
import {
  orderDailyHtmlString,
  type DailyOrderBill,
} from "@/lib/order-daily-html";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Loader2,
  Edit,
  Printer,
} from "lucide-react";
import { activityLoggers } from "@/lib/activity-log";
import { useToast } from "@/components/ui/Toast";
import { DataTable } from "@/components/admin/DataTable";
import { ShortcutHint } from "@/components/admin/ShortcutHint";
import { StatCard } from "@/components/admin/StatCard";
import type { Order, OrderItem } from "@/lib/types/api";

type AdminOrderItem = OrderItem & {
  subtotal?: number;
};

type AdminOrder = Omit<Order, "status" | "paymentStatus" | "items"> & {
  address?: string;
  pincode?: string;
  shippingCost?: number;
  subtotal?: number;
  discount?: number;
  totalAmount?: number;
  paymentStatus?: string;
  orderStatus?: string;
  courierName?: string;
  trackingId?: string;
  notes?: string;
  items?: AdminOrderItem[];
};

type StatusKey =
  | "all"
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const STATUS_TONES: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export default function AdminOrdersPage() {
  const { alert } = useDialog();
  const toast = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Tracking form
  const [editStatus, setEditStatus] = useState<string>("placed");
  const [editCourier, setEditCourier] = useState<string>("");
  const [editTrackingId, setEditTrackingId] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Daily orders print
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDate, setPrintDate] = useState<string>(() =>
    toDateInput(new Date().toISOString()),
  );
  const [printResult, setPrintResult] = useState<{
    date: string;
    count: number;
  } | null>(null);
  const [printLoading, setPrintLoading] = useState(false);

  const handlePrintDailyOrders = async () => {
    if (!printDate) return;
    setPrintLoading(true);
    setPrintResult(null);
    try {
      const data = await apiRequest(`/orders?date=${printDate}`);
      const list = Array.isArray(data) ? data : data?.items || [];
      const bill: DailyOrderBill = {
        dateLabel: formatBillDate(`${printDate}T00:00:00`),
        orders: list.map((o: any) => ({
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          phone: o.phone,
          address: o.address,
          pincode: o.pincode,
          items: (o.items || []).map((it: any) => ({
            name: it.name,
            quantity: it.quantity,
            price: it.price,
          })),
          subtotal: (o.items || []).reduce(
            (s: number, it: any) =>
              s + Number(it.subtotal || it.quantity * it.price || 0),
            0,
          ),
          totalAmount: o.totalAmount,
        })),
      };
      setPrintResult({ date: printDate, count: bill.orders.length });

      if (bill.orders.length === 0) {
        // Nothing to print — say so rather than opening a blank sheet.
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.srcdoc = orderDailyHtmlString(bill);
      iframe.onload = () => {
        try {
          const win = iframe.contentWindow;
          if (win) {
            win.focus();
            win.print();
          }
        } catch (err) {
          console.error(err);
        }
        setTimeout(() => iframe.remove(), 1000);
      };
      document.body.appendChild(iframe);
      toast.success("Print dialog opened");
    } catch (err: any) {
      console.error("Failed to print daily orders:", err);
      await alert(err?.message || "Failed to print daily orders", "error");
      toast.error(err?.message || "Failed to print daily orders");
    } finally {
      setPrintLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordersData, summaryData] = await Promise.all([
        apiRequest(`/orders?status=${statusFilter}`),
        apiRequest(`/orders/summary`),
      ]);
      const list = Array.isArray(ordersData)
        ? ordersData
        : Array.isArray(ordersData?.items)
        ? ordersData.items
        : Array.isArray(ordersData?.data)
        ? ordersData.data
        : [];
      setOrders(list);
      setSummary(summaryData || null);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleOpenTrackingModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus || "placed");
    setEditCourier(order.courierName || "");
    setEditTrackingId(order.trackingId || "");
    setEditNotes(order.notes || "");
    setShowTrackingModal(true);
  };

  // Marking an order shipped without a tracking number leaves the customer
  // with nothing to follow, so nudge for it.
  const shippedWithoutTracking =
    (editStatus === "shipped" || editStatus === "delivered") &&
    !editTrackingId.trim();

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const oldOrder = { ...selectedOrder };
      await apiRequest(`/orders/${selectedOrder._id}/tracking`, {
        method: "PATCH",
        body: JSON.stringify({
          orderStatus: editStatus,
          courierName: editCourier,
          trackingId: editTrackingId,
          notes: editNotes,
        }),
      });
      await activityLoggers.order.updated(
        selectedOrder._id,
        oldOrder,
        {
          ...oldOrder,
          orderStatus: editStatus,
          courierName: editCourier,
          trackingId: editTrackingId,
          notes: editNotes,
        },
        `Updated order ${selectedOrder.orderNumber} status to ${editStatus}`,
      );
      setShowTrackingModal(false);
      fetchOrders();
      await alert(
        `Order ${selectedOrder.orderNumber} marked ${editStatus}.`,
        "success",
      );
      toast.success(`Order ${selectedOrder.orderNumber} updated`);
    } catch (err: any) {
      await alert(err?.message || "Failed to update tracking info", "error");
      toast.error(err?.message || "Failed to update tracking info");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status: string) => (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
        STATUS_TONES[status] || "bg-charcoal/5 text-charcoal/60"
      }`}
    >
      {status}
    </span>
  );

  const rows = (Array.isArray(orders) ? orders : []).map((o) => ({
    ...o,
    id: o._id,
    itemCount: o.items?.length || 0,
    courierSummary:
      o.courierName || o.trackingId
        ? `${o.courierName || "Courier"} · ${o.trackingId || "No AWB"}`
        : "",
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders & Web Sales"
        description="Website orders, dispatch status and courier tracking"
        actions={
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-2 btn-primary px-5 py-2.5"
          >
            <Printer size={17} /> Print Daily Orders
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Web Revenue"
          value={inr(summary?.totalWebRevenue || 0)}
          icon={ShoppingBag}
          description={`${summary?.totalOrdersCount || 0} orders in total`}
          color="gold"
        />
        <StatCard
          title="Pending Dispatch"
          value={String(summary?.pendingShipmentCount || 0)}
          icon={Clock}
          description="Placed and processing"
          color="rose-gold"
        />
        <StatCard
          title="Shipped"
          value={String(summary?.shippedCount || 0)}
          icon={Truck}
          description="In transit with courier"
          color="charcoal"
        />
        <StatCard
          title="Delivered"
          value={String(summary?.deliveredCount || 0)}
          icon={CheckCircle2}
          description="Completed orders"
        />
      </div>

      <Tabs<StatusKey>
        tabs={[
          { key: "all", label: "All" },
          { key: "placed", label: "Placed" },
          { key: "processing", label: "Processing" },
          { key: "shipped", label: "Shipped" },
          { key: "delivered", label: "Delivered" },
          { key: "cancelled", label: "Cancelled" },
        ]}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <DataTable
        trail={[]}
        headerRight={`${rows.length} order${rows.length === 1 ? "" : "s"}`}
        loading={loading}
        defaultPageSize={25}
        columns={[
          {
            key: "orderNumber",
            label: "Order #",
            render: (v: string) => (
              <span className="font-mono font-semibold">{v}</span>
            ),
          },
          {
            key: "createdAt",
            label: "Date",
            render: (v: string) => formatBillDate(v),
            sortValue: (r: any) =>
              r.createdAt ? new Date(r.createdAt).getTime() : 0,
          },
          {
            key: "customerName",
            label: "Customer",
            render: (v: string, row: any) => (
              <div>
                <p className="font-medium text-charcoal">{v}</p>
                <p className="text-xs text-charcoal/50">{row.phone}</p>
              </div>
            ),
          },
          {
            key: "itemCount",
            label: "Items",
            align: "right",
            hideOnMobile: true,
            render: (v: number) => `${v} item${v === 1 ? "" : "s"}`,
          },
          {
            key: "totalAmount",
            label: "Total",
            align: "right",
            render: (v: number) => (
              <span className="font-semibold">{inr(v)}</span>
            ),
          },
          {
            key: "orderStatus",
            label: "Status",
            align: "center",
            render: (v: string) => statusBadge(v),
          },
          {
            key: "courierSummary",
            label: "Courier & Tracking",
            hideOnMobile: true,
            render: (_v: any, row: any) =>
              row.courierName || row.trackingId ? (
                <div className="text-xs">
                  <p className="font-medium text-charcoal">
                    {row.courierName || "Courier"}
                  </p>
                  <p className="font-mono text-charcoal/55">
                    {row.trackingId || "No AWB"}
                  </p>
                </div>
              ) : (
                <span className="text-charcoal/35 italic text-xs">
                  Unassigned
                </span>
              ),
          },
        ]}
        data={rows}
        onView={(row: any) => {
          setSelectedOrder(row as AdminOrder);
          setShowDetailModal(true);
        }}
        customActions={(row: any) => (
          <button
            onClick={() => handleOpenTrackingModal(row as AdminOrder)}
            className="inline-flex items-center gap-1 bg-gold/15 text-gold-deep hover:bg-gold/25 rounded transition-colors text-xs px-2.5 py-1.5 font-semibold whitespace-nowrap"
            title="Manage tracking and status"
          >
            <Edit size={13} /> Tracking
          </button>
        )}
        searchPlaceholder="Search by order #, customer or phone…"
        exportFileName="web-orders"
        rowClassName={(row: any) =>
          row.orderStatus === "cancelled"
            ? "opacity-60"
            : row.orderStatus === "placed"
              ? "bg-gold/[0.04]"
              : ""
        }
        emptyTitle={
          statusFilter === "all"
            ? "No web orders yet"
            : `No ${statusFilter} orders`
        }
        emptyDescription={
          statusFilter === "all"
            ? "Orders placed on the website land here for dispatch."
            : "Switch to another status tab to see the rest."
        }
      />

      <ShortcutHint
        keys={[
          { combo: "/", label: "Search" },
          { combo: "← →", label: "Switch status" },
          { combo: "↑ ↓", label: "Move" },
        ]}
      />

      {/* Manual tracking & status management */}
      <Modal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        title={`Tracking — ${selectedOrder?.orderNumber || ""}`}
        subtitle={
          selectedOrder
            ? `${selectedOrder.customerName} · ${selectedOrder.phone}`
            : undefined
        }
        onSubmit={handleSaveTracking}
        submitLabel="Save Tracking"
        submitting={saving}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className={stackedLabelCls}>Order Status</label>
            <select
              tabIndex={1}
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className={modalInputCls}
            >
              <option value="placed">Placed — order received</option>
              <option value="processing">Processing — packing</option>
              <option value="shipped">Shipped — with courier</option>
              <option value="delivered">Delivered — completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className={stackedLabelCls}>Courier Partner</label>
            <input
              type="text"
              tabIndex={2}
              placeholder="e.g. BlueDart, Delhivery, DTDC, India Post"
              value={editCourier}
              onChange={(e) => setEditCourier(e.target.value)}
              className={modalInputCls}
            />
          </div>

          <div>
            <label className={stackedLabelCls}>AWB / Tracking Number</label>
            <input
              type="text"
              tabIndex={3}
              placeholder="e.g. BD123456789IN"
              value={editTrackingId}
              onChange={(e) => setEditTrackingId(e.target.value)}
              className={`${modalInputCls} font-mono ${shippedWithoutTracking ? "border-gold-deep" : ""}`}
            />
            {shippedWithoutTracking && (
              <p className="text-[11px] text-gold-deep mt-1">
                No tracking number — the customer won't be able to follow this
                parcel.
              </p>
            )}
          </div>

          <div>
            <label className={stackedLabelCls}>Internal Notes</label>
            <textarea
              tabIndex={4}
              rows={2}
              placeholder="Estimated delivery date, special handling…"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className={`${modalInputCls} resize-none`}
            />
          </div>
        </div>
      </Modal>

      {/* Order detail */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Order ${selectedOrder?.orderNumber || ""}`}
        subtitle={
          selectedOrder ? formatBillDate(selectedOrder.createdAt) : undefined
        }
        footer={
          <button
            onClick={() => setShowDetailModal(false)}
            className="flex-1 btn-secondary py-2.5"
          >
            Close
          </button>
        }
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream/60 border border-border-gray p-4 rounded-sm text-xs">
              <div>
                <p className="text-charcoal/50 uppercase font-semibold tracking-wider text-[10px]">
                  Customer
                </p>
                <p className="font-semibold text-sm text-charcoal mt-0.5">
                  {selectedOrder.customerName}
                </p>
                <p className="text-charcoal/70">{selectedOrder.phone}</p>
                <div className="mt-2">
                  {statusBadge(selectedOrder.orderStatus || "placed")}
                </div>
              </div>
              <div>
                <p className="text-charcoal/50 uppercase font-semibold tracking-wider text-[10px]">
                  Delivery Address
                </p>
                <p className="text-charcoal/80 mt-0.5 whitespace-pre-line">
                  {selectedOrder.address}
                </p>
                <p className="font-semibold text-charcoal mt-0.5">
                  PIN: {selectedOrder.pincode}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-2">
                Order Items
              </p>
              <div className="border border-border-gray rounded-sm divide-y divide-border-gray/60 max-h-56 overflow-y-auto">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex justify-between items-center gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-charcoal truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-charcoal/50">
                        Qty {item.quantity} × {inr(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-charcoal tabular-nums shrink-0">
                      {inr(item.subtotal || item.total || 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gold/10 p-4 rounded-sm space-y-1.5 text-sm text-charcoal/75 border border-gold/25">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">
                  {inr(selectedOrder.subtotal)}
                </span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span className="tabular-nums">
                    −{inr(selectedOrder.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="tabular-nums">
                  {inr(selectedOrder.shippingCost || 0)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-charcoal pt-2 border-t border-gold/25">
                <span>Total</span>
                <span className="text-rose-gold tabular-nums">
                  {inr(selectedOrder.totalAmount || 0)}
                </span>
              </div>
            </div>

            {(selectedOrder.courierName || selectedOrder.trackingId) && (
              <div className="text-xs text-charcoal/70 border border-border-gray rounded-sm p-3">
                <span className="font-semibold text-charcoal">
                  {selectedOrder.courierName || "Courier"}
                </span>{" "}
                ·{" "}
                <span className="font-mono">
                  {selectedOrder.trackingId || "No AWB"}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Daily orders print */}
      <Modal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Print Daily Orders"
        subtitle="Prints every order placed on the chosen date as one packing sheet."
        onSubmit={handlePrintDailyOrders}
        submitLabel="Print"
        submitting={printLoading}
        disabled={!printDate}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className={stackedLabelCls}>Order Date</label>
            <input
              type="date"
              value={printDate}
              onChange={(e) => {
                setPrintDate(e.target.value);
                setPrintResult(null);
              }}
              className={modalInputCls}
            />
          </div>

          {printLoading && (
            <p className="text-sm text-charcoal/70 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-gold" />
              Loading orders…
            </p>
          )}

          {printResult && !printLoading && (
            <p
              className={`text-sm rounded-sm px-3 py-2 border ${
                printResult.count === 0
                  ? "bg-gold/10 border-gold/25 text-charcoal/75"
                  : "bg-cream/60 border-border-gray text-charcoal/75"
              }`}
            >
              {printResult.count === 0 ? (
                <>
                  No orders on {formatBillDate(`${printResult.date}T00:00:00`)}{" "}
                  — nothing to print.
                </>
              ) : (
                <>
                  <span className="font-bold text-gold-deep">
                    {printResult.count}
                  </span>{" "}
                  order
                  {printResult.count === 1 ? "" : "s"} on{" "}
                  {formatBillDate(`${printResult.date}T00:00:00`)} sent to the
                  printer.
                </>
              )}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
