"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import { PageHeader, Panel } from "@/components/admin/AdminShell";
import { useDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { modalInputCls, stackedLabelCls, inr } from "@/lib/admin-ui";
import { Truck, ShieldCheck, Save, Loader2, DollarSign, Clock, PackageCheck } from "lucide-react";
import type { ShippingSettings } from "@/lib/types/api";

const defaultSettings: ShippingSettings = {
  freeShippingAbove: 999,
  flatRate: 49,
  codCharge: 30,
  estimatedDays: "3-5 Business Days",
};

export default function ShippingChargesPage() {
  const { alert } = useDialog();
  const toast = useToast();
  const [settings, setSettings] = useState<ShippingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadShipping() {
      try {
        const res = await apiRequest("/settings/shipping").catch(() => null);
        if (mounted && res) {
          setSettings({
            freeShippingAbove: res.freeShippingAbove ?? defaultSettings.freeShippingAbove,
            flatRate: res.flatRate ?? defaultSettings.flatRate,
            codCharge: res.codCharge ?? defaultSettings.codCharge,
            estimatedDays: res.estimatedDays || defaultSettings.estimatedDays,
          });
        }
      } catch (err) {
        console.error("Failed to load shipping settings:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadShipping();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest("/settings/shipping", {
        method: "PUT",
        body: JSON.stringify(settings),
      }).catch(() => null);
      toast.success("Shipping settings saved successfully");
      await alert("Shipping rates and rules updated successfully.", "success");
    } catch (err: any) {
      toast.error(err.message || "Failed to update shipping settings");
      await alert(err.message || "Failed to update shipping settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping Charges & Delivery"
        description="Configure website shipping fees, free delivery thresholds, and dispatch guidelines"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border-gray rounded-xl p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Free Shipping Min</span>
            <Truck className="h-5 w-5 text-gold" />
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal mt-2">{inr(settings.freeShippingAbove)}</p>
          <p className="text-xs text-charcoal/50 mt-1">Orders above this get zero shipping cost</p>
        </div>

        <div className="bg-white border border-border-gray rounded-xl p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Flat Delivery Fee</span>
            <DollarSign className="h-5 w-5 text-gold-deep" />
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal mt-2">{inr(settings.flatRate)}</p>
          <p className="text-xs text-charcoal/50 mt-1">Standard rate charged for web orders</p>
        </div>

        <div className="bg-white border border-border-gray rounded-xl p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">COD Handling Fee</span>
            <PackageCheck className="h-5 w-5 text-gold" />
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal mt-2">{inr(settings.codCharge)}</p>
          <p className="text-xs text-charcoal/50 mt-1">Additional charge on cash-on-delivery</p>
        </div>

        <div className="bg-white border border-border-gray rounded-xl p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Delivery SLA</span>
            <Clock className="h-5 w-5 text-gold-deep" />
          </div>
          <p className="font-serif text-lg font-bold text-charcoal mt-2 truncate">{settings.estimatedDays}</p>
          <p className="text-xs text-charcoal/50 mt-1">Promised dispatch window to customers</p>
        </div>
      </div>

      {/* Configuration Form */}
      <Panel trail={["Admin", "Shipping Charges"]}>
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className={stackedLabelCls}>
                Free Shipping Threshold (₹) <span className="text-rose-gold">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={settings.freeShippingAbove}
                onChange={(e) => setSettings({ ...settings, freeShippingAbove: Number(e.target.value) })}
                className={modalInputCls}
                required
              />
              <p className="text-xs text-charcoal/45 mt-1">
                Cart subtotal equal to or exceeding this amount automatically qualifies for free shipping.
              </p>
            </div>

            <div>
              <label className={stackedLabelCls}>
                Standard Flat Delivery Fee (₹) <span className="text-rose-gold">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={settings.flatRate}
                onChange={(e) => setSettings({ ...settings, flatRate: Number(e.target.value) })}
                className={modalInputCls}
                required
              />
              <p className="text-xs text-charcoal/45 mt-1">
                Fee charged when the order does not reach the free shipping threshold.
              </p>
            </div>

            <div>
              <label className={stackedLabelCls}>
                Cash on Delivery (COD) Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.codCharge}
                onChange={(e) => setSettings({ ...settings, codCharge: Number(e.target.value) })}
                className={modalInputCls}
              />
              <p className="text-xs text-charcoal/45 mt-1">
                Extra charge added to checkout when customers choose Pay on Delivery.
              </p>
            </div>

            <div>
              <label className={stackedLabelCls}>
                Estimated Delivery Window
              </label>
              <input
                type="text"
                value={settings.estimatedDays}
                onChange={(e) => setSettings({ ...settings, estimatedDays: e.target.value })}
                placeholder="e.g. 3-5 Business Days"
                className={modalInputCls}
              />
              <p className="text-xs text-charcoal/45 mt-1">
                Shown on product detail and checkout pages for delivery expectations.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-gray flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
              {saving ? "Saving Changes…" : "Save Shipping Settings"}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
