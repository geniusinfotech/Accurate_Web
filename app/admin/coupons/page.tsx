"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import Modal from "@/components/admin/Modal";
import { useDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/admin/AdminShell";
import {
  modalInputCls,
  stackedLabelCls,
  inr,
  formatBillDate,
  toDateInput,
} from "@/lib/admin-ui";
import { Plus, Percent, IndianRupee, Info, Power } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { Coupon as CouponType } from "@/lib/types/api";

interface Coupon extends CouponType {}
type CouponFormState = Partial<Coupon> & {
  code: string;
  discountValue: number;
  discountType: "percent" | "fixed";
  minSpendGoal: number;
  isActive: boolean;
  isAutoApplied: boolean;
  validFrom?: string;
  validUntil?: string;
};

const empty = (): CouponFormState => ({
  code: "",
  discountValue: 0,
  discountType: "percent",
  minSpendGoal: 0,
  isActive: true,
  isAutoApplied: false,
});

export default function CouponsPage() {
  const { alert, confirm } = useDialog();
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CouponFormState>(empty());
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () =>
    apiRequest("/coupons")
      .then((res) =>
        setCoupons(
          Array.isArray(res?.body) ? res.body : Array.isArray(res) ? res : [],
        ),
      )
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(empty());
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code || "",
      discountValue: coupon.discountValue ?? 0,
      discountType: coupon.discountType || "percent",
      minSpendGoal: coupon.minSpendGoal ?? 0,
      isActive: coupon.isActive !== false,
      isAutoApplied: !!coupon.isAutoApplied,
      // The API returns full ISO timestamps; <input type="date"> needs yyyy-mm-dd.
      validFrom: coupon.validFrom ? toDateInput(coupon.validFrom) : "",
      validUntil: coupon.validUntil ? toDateInput(coupon.validUntil) : "",
    });
    setEditingId(coupon._id || null);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(empty());
    setEditingId(null);
    setError("");
  };

  const f = (field: keyof CouponFormState, val: any) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const codeTaken = coupons.some(
    (c) =>
      c._id !== editingId &&
      c.code?.toUpperCase() === form.code.trim().toUpperCase(),
  );
  const percentOutOfRange =
    form.discountType === "percent" && form.discountValue > 100;
  const datesReversed =
    !!form.validFrom && !!form.validUntil && form.validFrom > form.validUntil;
  const valid =
    form.code.trim().length > 0 &&
    form.discountValue > 0 &&
    !codeTaken &&
    !percentOutOfRange &&
    !datesReversed;

  const handleSave = async () => {
    if (!form.code.trim()) return setError("Coupon code is required.");
    if (form.discountValue <= 0)
      return setError("Enter a discount greater than zero.");
    if (codeTaken)
      return setError(`The code ${form.code.toUpperCase()} already exists.`);
    if (percentOutOfRange)
      return setError("A percentage discount cannot exceed 100%.");
    if (datesReversed)
      return setError("“Valid until” must come after “valid from”.");

    setSaving(true);
    const code = form.code.trim().toUpperCase();
    try {
      // Build the body field by field: the API rejects unknown properties, so
      // an edited row's _id / createdAt must not ride along.
      const payload: Record<string, any> = {
        code,
        discountValue: Number(form.discountValue),
        discountType: form.discountType,
        minSpendGoal: Number(form.minSpendGoal) || 0,
        isActive: form.isActive,
        isAutoApplied: form.isAutoApplied,
      };
      if (editingId) {
        // On a PATCH an omitted field means "leave as is", so an emptied date
        // has to be sent as null to actually clear it.
        payload.validFrom = form.validFrom || null;
        payload.validUntil = form.validUntil || null;
      } else {
        if (form.validFrom) payload.validFrom = form.validFrom;
        if (form.validUntil) payload.validUntil = form.validUntil;
      }

      if (editingId) {
        await apiRequest(`/coupons/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Coupon updated successfully");
      } else {
        await apiRequest("/coupons", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Coupon created successfully");
      }

      const wasEditing = !!editingId;
      closeForm();
      await load();
      await alert(
        `Coupon ${code} ${wasEditing ? "updated" : "created"}.`,
        "success",
      );
    } catch (err: any) {
      setError(err?.message || "Failed to save coupon.");
      toast.error(err?.message || "Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const coupon = coupons.find((c) => c._id === id);
    const ok = await confirm(
      `Delete the coupon ${coupon?.code || ""}? Customers who try to use it at checkout will be told it is invalid.`,
      "Delete Coupon",
    );
    if (!ok) return;
    try {
      await apiRequest(`/coupons/${id}`, { method: "DELETE" });
      await load();
      toast.success("Coupon deleted successfully");
    } catch (err: any) {
      await alert(err?.message || "Failed to delete coupon.", "error");
      toast.error(err?.message || "Failed to delete coupon.");
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    if (!coupon._id) return;
    try {
      await apiRequest(`/coupons/${coupon._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      await load();
      toast.success("Coupon status updated");
    } catch (err: any) {
      await alert(
        err?.message || "Failed to change the coupon status.",
        "error",
      );
      toast.error(err?.message || "Failed to change the coupon status.");
    }
  };

  const describe = (c: Coupon | CouponFormState) =>
    `${c.discountType === "percent" ? `${c.discountValue}% off` : `${inr(c.discountValue)} off`}${
      (c.minSpendGoal || 0) > 0 ? ` above ${inr(c.minSpendGoal || 0)}` : ""
    }`;

  const expired = (c: Coupon) =>
    !!c.validUntil && new Date(c.validUntil) < new Date();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Coupons & Discounts"
        description="Coupon codes and discounts applied automatically at checkout"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 btn-primary px-5 py-2.5"
          >
            <Plus size={18} /> Add Coupon
          </button>
        }
      />

      <div className="border border-gold/30 bg-gold/10 rounded-sm px-4 py-3 text-sm text-charcoal/80 flex gap-3">
        <Info size={16} className="text-gold-deep shrink-0 mt-0.5" />
        <p>
          Turn on <strong>Auto-apply</strong> with a{" "}
          <strong>minimum spend</strong> and the discount is taken off at
          checkout without the customer typing anything — for example 10% off
          orders above ₹1,000.
        </p>
      </div>

      <Modal
        isOpen={showForm}
        title={editingId ? "Edit Coupon" : "New Coupon"}
        subtitle="Codes are stored in uppercase and must be unique."
        onClose={closeForm}
        onSubmit={handleSave}
        submitLabel={editingId ? "Update Coupon" : "Save Coupon"}
        submitting={saving}
        disabled={!valid}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-rose-gold/10 border border-rose-gold/25 text-rose-gold px-3 py-2 rounded-sm text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={stackedLabelCls}>
                Code <span className="text-rose-gold">*</span>
              </label>
              <input
                tabIndex={1}
                value={form.code}
                onChange={(e) => {
                  f("code", e.target.value.toUpperCase().replace(/\s/g, ""));
                  setError("");
                }}
                className={`${modalInputCls} font-mono tracking-wider ${
                  codeTaken ? "border-rose-gold" : ""
                }`}
                placeholder="e.g. SAVE10"
              />
              {codeTaken && (
                <p className="text-[11px] text-rose-gold mt-1">
                  This code already exists.
                </p>
              )}
            </div>

            <div>
              <label className={stackedLabelCls}>Discount Type</label>
              <select
                tabIndex={2}
                value={form.discountType}
                onChange={(e) => f("discountType", e.target.value)}
                className={modalInputCls}
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className={stackedLabelCls}>
                Discount Value {form.discountType === "percent" ? "(%)" : "(₹)"}{" "}
                <span className="text-rose-gold">*</span>
              </label>
              <input
                type="number"
                tabIndex={3}
                value={form.discountValue}
                onChange={(e) => {
                  f("discountValue", Number(e.target.value) || 0);
                  setError("");
                }}
                className={`${modalInputCls} ${percentOutOfRange ? "border-rose-gold" : ""}`}
                min={0}
                max={form.discountType === "percent" ? 100 : undefined}
              />
              {percentOutOfRange && (
                <p className="text-[11px] text-rose-gold mt-1">
                  Cannot be more than 100%.
                </p>
              )}
            </div>

            <div>
              <label className={stackedLabelCls}>Minimum Spend (₹)</label>
              <input
                type="number"
                tabIndex={4}
                value={form.minSpendGoal}
                onChange={(e) => f("minSpendGoal", Number(e.target.value) || 0)}
                className={modalInputCls}
                min={0}
                placeholder="0 = no minimum"
              />
            </div>

            <div>
              <label className={stackedLabelCls}>Valid From</label>
              <input
                type="date"
                tabIndex={5}
                value={form.validFrom || ""}
                onChange={(e) => {
                  f("validFrom", e.target.value);
                  setError("");
                }}
                className={modalInputCls}
              />
            </div>

            <div>
              <label className={stackedLabelCls}>Valid Until</label>
              <input
                type="date"
                tabIndex={6}
                value={form.validUntil || ""}
                onChange={(e) => {
                  f("validUntil", e.target.value);
                  setError("");
                }}
                className={`${modalInputCls} ${datesReversed ? "border-rose-gold" : ""}`}
              />
              {datesReversed && (
                <p className="text-[11px] text-rose-gold mt-1">
                  Must be after “valid from”.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-1 border-t border-border-gray pt-4">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                tabIndex={7}
                checked={form.isActive}
                onChange={(e) => f("isActive", e.target.checked)}
                className="w-4 h-4 rounded border-border-gray accent-gold"
              />
              <span className="font-medium text-charcoal">Active</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                tabIndex={8}
                checked={form.isAutoApplied}
                onChange={(e) => f("isAutoApplied", e.target.checked)}
                className="w-4 h-4 rounded border-border-gray accent-gold"
              />
              <span className="font-medium text-charcoal">
                Auto-apply at checkout once minimum spend is met
              </span>
            </label>
          </div>

          {valid && (
            <div className="bg-cream/60 border border-border-gray rounded-sm px-3 py-2 text-sm text-charcoal/75">
              Customers {editingId ? "will now get" : "will get"}{" "}
              <strong className="text-charcoal">{describe(form)}</strong>
              {form.isAutoApplied
                ? " automatically at checkout."
                : " when they enter this code."}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
