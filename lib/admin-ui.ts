/* ──────────────────────────────────────────────────────────────────────────
 * admin-ui — design tokens & class names shared by every admin screen.
 * ────────────────────────────────────────────────────────────────────────── */

export const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors outline-none";

export const labelCls =
  "shrink-0 w-28 min-w-[112px] text-right text-sm font-medium text-slate-600";

export const captionCls =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400";

export const chipCls =
  "rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition";

export const panelCls =
  "rounded-lg border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,46,96,0.06)] overflow-hidden";

export const panelHeaderCls =
  "border-b border-blue-950/20 bg-blue-950 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-blue-50";

export const actionBarCls =
  "mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-blue-50/40 px-5 py-3.5 rounded-b-lg";

export const totalsBoxCls =
  "rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-xs";

export const breadcrumbFor = (pathname: string, trail?: string[]): string[] => {
  if (trail) return trail;
  const segments = pathname.split("/").filter(Boolean);
  const labels: Record<string, string> = {
    admin: "Admin",
    accounts: "Accounts",
    orders: "Orders",
    products: "Products",
    customers: "Customers",
    managers: "Managers",
    coupons: "Coupons",
    offers: "Offers",
    banners: "Banners",
    testimonials: "Testimonials",
    categories: "Categories",
    users: "Users",
    reports: "Reports",
    shipping: "Shipping",
    "activity-log": "Activity Log",
  };
  return segments.map((s) => labels[s] || s.charAt(0).toUpperCase() + s.slice(1));
};

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export const fmt = (n: number, d = 2) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(n);

export const stackedLabelCls = "block text-sm font-medium text-slate-700 mb-1.5";

export const modalInputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors outline-none";

export function formatBillDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function toDateInput(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export const tableHeadCls = "bg-blue-50/80 border-b border-blue-100 sticky top-0 z-10 text-xs font-semibold uppercase tracking-wider text-slate-600";

export const iconBtnCls = "inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-800 transition-colors";
