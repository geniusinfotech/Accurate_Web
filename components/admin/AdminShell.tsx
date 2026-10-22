"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import {
  actionBarCls,
  breadcrumbFor,
  captionCls,
  chipCls,
  inputCls,
  labelCls,
  panelCls,
  panelHeaderCls,
  totalsBoxCls,
} from "@/lib/admin-ui";
import { AnimatedCounter } from "@/components/motion";

/* ──────────────────────────────────────────────────────────────────────────
 * PageHeader — the serif title + muted subtitle + optional right-hand actions
 * that every admin screen opens with.
 * ────────────────────────────────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {/* The gold rule under the title is the admin's section marker. */}
        <h1 className="relative inline-block font-serif text-2xl font-semibold text-charcoal sm:text-3xl">
          {title}
          <span
            aria-hidden
            className="absolute -bottom-1 left-0 h-[2px] w-10 rounded-full bg-gradient-to-r from-gold-600 to-gold-200"
          />
        </h1>
        {description && (
          <p className="mt-3 text-sm text-charcoal/55 sm:text-base">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Panel — the white desktop-software card with the dark breadcrumb strip.
 * Pass `trail` to override the path-derived breadcrumb.
 * ────────────────────────────────────────────────────────────────────────── */

export function Panel({
  children,
  trail,
  headerRight,
  padded = true,
  className = "",
}: {
  children: ReactNode;
  trail?: string[];
  headerRight?: ReactNode;
  /** Set false when the body is a full-bleed table. */
  padded?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const crumbs = breadcrumbFor(pathname || "", trail);

  return (
    <div className={`${panelCls} transition-shadow duration-300 hover:shadow-card ${className}`}>
      <div className={`${panelHeaderCls} flex items-center justify-between gap-3`}>
        <span className="flex min-w-0 items-center truncate">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={i} className="flex items-center">
                {i > 0 && (
                  <ChevronRight size={12} className="mx-1 shrink-0 text-gold/45" />
                )}
                <span className={last ? "text-gold-100" : "text-gold-100/55"}>{c}</span>
              </span>
            );
          })}
        </span>
        {headerRight && <span className="shrink-0 font-normal">{headerRight}</span>}
      </div>
      <div className={padded ? "space-y-4 p-4" : ""}>{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Field — a `label | input` row. Children replace the default input so a
 * field can hold a select, an autocomplete, or anything else.
 * ────────────────────────────────────────────────────────────────────────── */

export function Field({
  label,
  children,
  hint,
  required,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <label htmlFor={htmlFor} className={`${labelCls} pt-2`}>
        {label}
        {required && <span className="ml-0.5 text-rose-gold">*</span>}
      </label>
      <div className="w-full min-w-0">
        {children}
        {hint && <p className="mt-1 text-[11px] text-charcoal/45">{hint}</p>}
      </div>
    </div>
  );
}

/** Field whose child is a plain text input — the common case. */
export function TextField({
  label,
  value,
  onChange,
  hint,
  required,
  ...rest
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  hint?: string;
  required?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <Field label={label} hint={hint} required={required}>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${rest.className || ""}`}
      />
    </Field>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * TotalsBox — the gold summary panel from the Sales Invoice footer.
 * ────────────────────────────────────────────────────────────────────────── */

export function TotalsBox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${totalsBoxCls} ${className}`}>{children}</div>;
}

/** One `label ......... value` line inside a TotalsBox. */
export function TotalsRow({
  label,
  value,
  emphasis,
  divider,
}: {
  label: ReactNode;
  value: ReactNode;
  /** Renders as the headline "Bill Amount" row. */
  emphasis?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        emphasis
          ? "mt-2 border-t border-gold/30 pt-2.5 font-serif text-xl font-semibold text-charcoal"
          : "text-sm"
      } ${divider && !emphasis ? "border-t border-gold/20 pt-2" : ""}`}
    >
      <span className={emphasis ? "" : "text-charcoal/70"}>{label}</span>
      <span
        className={
          emphasis
            ? "tabular-nums text-rose-gold"
            : "font-medium tabular-nums text-charcoal"
        }
      >
        {value}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * FormActions — the bordered footer holding Cancel / Save.
 * ────────────────────────────────────────────────────────────────────────── */

export function FormActions({
  onCancel,
  onSubmit,
  cancelLabel = "Clear",
  submitLabel = "Save",
  submitting,
  submitIcon,
  submitRef,
  tabIndexBase = 104,
  extra,
  disabled,
}: {
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  submitting?: boolean;
  submitIcon?: ReactNode;
  submitRef?: React.RefObject<HTMLButtonElement | null>;
  tabIndexBase?: number;
  extra?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={actionBarCls}>
      {extra}
      {onCancel && (
        <button type="button" className="btn-secondary px-6 py-2" onClick={onCancel}>
          {cancelLabel}
        </button>
      )}
      {onSubmit && (
        <button
          type="button"
          ref={submitRef}
          tabIndex={tabIndexBase}
          onClick={onSubmit}
          disabled={submitting || disabled}
          className="btn-primary px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" /> Saving…
            </>
          ) : (
            <>
              {submitIcon}
              {submitLabel}
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Loading / empty states — one spinner and one empty message everywhere.
 * ────────────────────────────────────────────────────────────────────────── */

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <span className="relative grid h-12 w-12 place-items-center">
        <span className="absolute inset-0 rounded-full border-2 border-gold/15" />
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </span>
      <p className="animate-pulse text-sm text-charcoal/45">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: any;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center animate-in fade-in zoom-in-95 duration-500">
      {Icon && (
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold-50 to-gold-100 ring-1 ring-gold/20">
          <Icon className="h-6 w-6 text-gold-deep" />
        </span>
      )}
      <div>
        <p className="font-serif text-lg font-semibold text-charcoal">{title}</p>
        {description && (
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-charcoal/50">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * StatStrip — the compact row of figures above a table (invoices, qty,
 * sales, paid, due). Denser than StatCard, which stays for the dashboard.
 * ────────────────────────────────────────────────────────────────────────── */

export function StatStrip({
  stats,
  columns = 5,
}: {
  stats: { label: string; value: ReactNode; tone?: "default" | "due" | "good" }[];
  columns?: 3 | 4 | 5 | 6;
}) {
  const cols: Record<number, string> = {
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  };

  return (
    <div className={`grid grid-cols-2 ${cols[columns]} gap-3`}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{ animationDelay: `${i * 60}ms` }}
          className="group relative overflow-hidden rounded-md border border-border-gray bg-white px-4 py-3
                     shadow-soft transition-all duration-300 ease-luxury
                     hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-card
                     animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500"
        >
          {/* A gold rail wipes in from the left on hover. */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-gradient-to-b from-gold-400 to-gold-700
                       transition-transform duration-300 ease-luxury group-hover:scale-y-100"
          />
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal/45">
            {s.label}
          </p>
          <p
            className={`text-lg font-semibold tabular-nums ${
              s.tone === "due"
                ? "text-rose-gold"
                : s.tone === "good"
                  ? "text-success"
                  : "text-charcoal"
            }`}
          >
            <StatFigure value={s.value} />
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Rolls a strip figure up when it is a plain number or a "₹12,345" string,
 * and renders anything else (markup, dates, ranges) untouched.
 */
function StatFigure({ value }: { value: ReactNode }) {
  if (typeof value === "number") return <AnimatedCounter value={value} />;

  if (typeof value === "string") {
    const m = value.trim().match(/^(₹)?([\d,]+(?:\.\d+)?)$/);
    if (m) {
      return (
        <AnimatedCounter
          value={Number(m[2].replace(/,/g, ""))}
          prefix={m[1] || ""}
          decimals={m[2].includes(".") ? 2 : 0}
        />
      );
    }
  }

  return <>{value}</>;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Tabs — for screens that show the same data cut several ways. Arrow keys
 * move between tabs, matching the keyboard-first feel of the entry screens.
 * ────────────────────────────────────────────────────────────────────────── */

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string; count?: number }[];
  active: T;
  onChange: (key: T) => void;
}) {
  const move = (dir: 1 | -1) => {
    const i = tabs.findIndex((t) => t.key === active);
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    if (next) onChange(next.key);
  };

  return (
    <div
      role="tablist"
      className="flex gap-1 border-b border-border-gray overflow-x-auto"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        }
      }}
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.key)}
            className={`relative -mb-px whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              on
                ? "text-charcoal"
                : "text-charcoal/50 hover:text-charcoal"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs transition-colors duration-200 ${
                  on ? "bg-gold/20 text-gold-deep" : "bg-charcoal/5 text-charcoal/45"
                }`}
              >
                {t.count}
              </span>
            )}
            {/* The indicator grows from the centre rather than snapping. */}
            <span
              aria-hidden
              className={`absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-gold transition-transform duration-300 ease-luxury ${
                on ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * DateRangeFilter — the From/To pair used by every report-style screen,
 * with the presets people actually reach for.
 * ────────────────────────────────────────────────────────────────────────── */

export function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onClear,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onClear?: () => void;
}) {
  const iso = (d: Date) => d.toISOString().split("T")[0];

  const preset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    onFromChange(iso(start));
    onToChange(iso(end));
  };

  const thisMonth = () => {
    const now = new Date();
    onFromChange(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
    onToChange(iso(now));
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className={`${captionCls} mb-1`}>From</label>
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onFromChange(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className={`${captionCls} mb-1`}>To</label>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onToChange(e.target.value)}
          className={inputCls}
        />
      </div>
      <div className="flex items-center gap-1 pb-0.5">
        {[
          { label: "7d", days: 7 },
          { label: "30d", days: 30 },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => preset(p.days)}
            className={chipCls}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={thisMonth}
          className={chipCls}
        >
          This month
        </button>
        {(from || to) && onClear && (
          <button
            onClick={onClear}
            className="text-xs font-semibold text-rose-gold hover:underline px-2 py-1.5"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
