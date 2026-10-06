"use client";

import { ReactNode } from "react";
import Modal from "@/components/admin/Modal";
import { Loader2, IndianRupee } from "lucide-react";
import { inputCls, inr, formatBillDate, stackedLabelCls } from "@/lib/admin-ui";

export type LedgerEntry = {
  type?: string;
  amount?: number;
  mode?: string;
  notes?: string;
  reference?: string;
  date?: string;
  createdAt?: string;
  runningBalance?: number;
};

export type PaymentDraft = {
  amount: string;
  mode: string;
  reference?: string;
  notes?: string;
  date?: string;
};

export const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
];

/**
 * The party/customer ledger dialog: three summary figures, an inline
 * "record payment" form, and the running transaction history. Dealers and
 * both Accounts tabs render the same thing, so it lives here once.
 */
export default function LedgerModal({
  open,
  onClose,
  title,
  subtitle,
  loading,
  summary,
  entries,
  payment,
  onPaymentChange,
  onRecordPayment,
  paymentSaving,
  paymentTitle = "Record Payment",
  debitLabel = "Debit",
  creditLabel = "Credit",
  debitTypes = ["purchase", "sale", "bill"],
  showPaymentDate,
  showReference = true,
  footerNote,
  outstanding,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  loading?: boolean;
  summary: { label: string; value: number; tone?: "default" | "good" | "due" }[];
  entries: LedgerEntry[];
  payment: PaymentDraft;
  onPaymentChange: (next: PaymentDraft) => void;
  onRecordPayment: () => void;
  paymentSaving?: boolean;
  paymentTitle?: string;
  debitLabel?: string;
  creditLabel?: string;
  /** Entry types that belong in the debit column; everything else is credit. */
  debitTypes?: string[];
  showPaymentDate?: boolean;
  showReference?: boolean;
  footerNote?: ReactNode;
  /** When given, the amount field is capped at this and a "pay all" chip shows. */
  outstanding?: number;
}) {
  const parsed = parseFloat(payment.amount);
  const amountValid = Number.isFinite(parsed) && parsed > 0;
  const overpaying = outstanding !== undefined && amountValid && parsed > outstanding;

  const set = (patch: Partial<PaymentDraft>) => onPaymentChange({ ...payment, ...patch });

  return (
    <Modal
      isOpen={open}
      title={title}
      subtitle={subtitle}
      maxWidth="max-w-4xl lg:max-w-5xl"
      onClose={onClose}
    >
      <div className="space-y-5">
        {loading ? (
          <div className="py-10 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 text-gold animate-spin" />
            <p className="text-sm text-charcoal/50">Loading ledger…</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {summary.map((s) => (
                <div
                  key={s.label}
                  className="bg-cream/50 px-3 py-2.5 rounded-sm border border-border-gray"
                >
                  <p className="text-[10px] uppercase tracking-widest text-charcoal/50">
                    {s.label}
                  </p>
                  <p
                    className={`text-lg font-bold tabular-nums mt-0.5 ${
                      s.tone === "good"
                        ? "text-emerald-700"
                        : s.tone === "due"
                          ? "text-rose-gold"
                          : "text-charcoal"
                    }`}
                  >
                    {inr(s.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* Record payment */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (amountValid && !paymentSaving) onRecordPayment();
              }}
              className="bg-gold/10 p-4 rounded-sm border border-gold/25 space-y-3"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h4 className="font-semibold text-sm text-charcoal flex items-center gap-1.5">
                  <IndianRupee size={15} /> {paymentTitle}
                </h4>
                {outstanding !== undefined && outstanding > 0 && (
                  <button
                    type="button"
                    onClick={() => set({ amount: String(outstanding) })}
                    className="text-xs font-semibold text-gold-deep hover:underline"
                  >
                    Settle full {inr(outstanding)}
                  </button>
                )}
              </div>

              <div className={`grid gap-3 ${showPaymentDate ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                <div>
                  <label className={stackedLabelCls}>Amount (₹)</label>
                  <input
                    type="number"
                    autoFocus
                    min="0"
                    step="0.01"
                    value={payment.amount}
                    onChange={(e) => set({ amount: e.target.value })}
                    placeholder="0.00"
                    className={`${inputCls} py-1.5 ${overpaying ? "border-gold-deep" : ""}`}
                  />
                  {overpaying && (
                    <p className="text-[11px] text-gold-deep mt-1">
                      More than the {inr(outstanding!)} outstanding — this will leave a credit.
                    </p>
                  )}
                </div>

                <div>
                  <label className={stackedLabelCls}>Payment Method</label>
                  <select
                    value={payment.mode}
                    onChange={(e) => set({ mode: e.target.value })}
                    className={`${inputCls} py-1.5`}
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {showPaymentDate && (
                  <div>
                    <label className={stackedLabelCls}>Date</label>
                    <input
                      type="date"
                      value={payment.date || ""}
                      onChange={(e) => set({ date: e.target.value })}
                      className={`${inputCls} py-1.5`}
                    />
                  </div>
                )}
              </div>

              <div className={`grid gap-3 ${showReference ? "sm:grid-cols-2" : ""}`}>
                {showReference && (
                  <input
                    type="text"
                    value={payment.reference || ""}
                    onChange={(e) => set({ reference: e.target.value })}
                    placeholder="Reference / Transaction ID"
                    className={`${inputCls} py-1.5`}
                  />
                )}
                <input
                  type="text"
                  value={payment.notes || ""}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="Notes (optional)"
                  className={`${inputCls} py-1.5`}
                />
              </div>

              <button
                type="submit"
                disabled={paymentSaving || !amountValid}
                className="btn-primary w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
              >
                {paymentSaving && <Loader2 size={14} className="animate-spin" />}
                {paymentSaving ? "Saving…" : "Save Payment"}
              </button>
            </form>

            {/* History */}
            <div>
              <h4 className="font-semibold text-sm text-charcoal mb-2">
                Transaction History
                {entries.length > 0 && (
                  <span className="text-charcoal/45 font-normal ml-1.5">
                    ({entries.length} entr{entries.length === 1 ? "y" : "ies"})
                  </span>
                )}
              </h4>
              <div className="max-h-[40vh] md:max-h-72 overflow-y-auto border border-border-gray rounded-sm">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="bg-light-gray sticky top-0 border-b border-border-gray">
                    <tr>
                      <th className="p-2.5 font-semibold">Date</th>
                      <th className="p-2.5 font-semibold">Type</th>
                      <th className="p-2.5 font-semibold">Reference / Notes</th>
                      <th className="p-2.5 font-semibold text-right">{debitLabel}</th>
                      <th className="p-2.5 font-semibold text-right">{creditLabel}</th>
                      <th className="p-2.5 font-semibold text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-gray/60">
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-charcoal/50">
                          No ledger entries yet.
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry, idx) => {
                        const isDebit = debitTypes.includes(String(entry.type || ""));
                        const bal = entry.runningBalance ?? 0;
                        return (
                          <tr key={idx} className="hover:bg-cream/40">
                            <td className="p-2.5 whitespace-nowrap">
                              {formatBillDate(entry.date || entry.createdAt || '')}
                            </td>
                            <td className="p-2.5 capitalize font-medium whitespace-nowrap">
                              {entry.type || "entry"}
                            </td>
                            <td className="p-2.5">{entry.notes || entry.reference || "—"}</td>
                            <td className="p-2.5 text-right text-rose-gold font-medium tabular-nums">
                              {isDebit ? inr(entry.amount || 0) : "—"}
                            </td>
                            <td className="p-2.5 text-right text-emerald-700 font-medium tabular-nums">
                              {!isDebit ? inr(entry.amount || 0) : "—"}
                            </td>
                            <td className="p-2.5 text-right font-semibold tabular-nums">
                              {bal < 0 ? `−${inr(Math.abs(bal))}` : inr(bal)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {footerNote && (
                <p className="text-[11px] text-charcoal/50 mt-2">{footerNote}</p>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
