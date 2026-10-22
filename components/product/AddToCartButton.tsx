"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Loader2, Plus, ShoppingBag } from "lucide-react";

export function flyToCart(fromEl: HTMLElement | null) {
  if (!fromEl || typeof document === "undefined") return;
  const cartEl = document.querySelector("[data-cart-button]") as HTMLElement | null;
  if (!cartEl) return;

  const from = fromEl.getBoundingClientRect();
  const to = cartEl.getBoundingClientRect();
  if (to.width === 0 || to.height === 0 || from.width === 0 || from.height === 0) return;

  const dot = document.createElement("div");
  dot.setAttribute("data-fly-dot", "true");
  dot.style.cssText = [
    "position:fixed",
    "z-index:9999",
    "pointer-events:none",
    `left:${from.left + from.width / 2 - 11}px`,
    `top:${from.top + from.height / 2 - 11}px`,
    "width:22px",
    "height:22px",
    "border-radius:9999px",
    "background:#1f4e9e",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "color:#fff",
    "box-shadow:0 8px 20px rgba(31,78,158,.4)",
    "transition:transform .7s cubic-bezier(.22,1,.36,1), opacity .7s ease",
  ].join(";");

  dot.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  document.body.appendChild(dot);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dot.style.transform = `translate(${dx}px, ${dy}px) scale(.35)`;
      dot.style.opacity = "0.4";
    });
  });

  window.setTimeout(() => dot.remove(), 750);
}

type Props = {
  onAdd: () => void;
  label?: string;
  priceLabel?: string;
  className?: string;
  disabled?: boolean;
  variant?: "grid" | "detail";
};

export function AddToCartButton({
  onAdd,
  label = "Add to cart",
  priceLabel,
  className = "",
  disabled = false,
  variant = "grid",
}: Props) {
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const btnRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled || state !== "idle") return;
      setState("adding");
      flyToCart(btnRef.current);

      // tiny delay so the spinner / fly is visible, then commit the add
      window.setTimeout(() => {
        onAdd();
        setState("added");
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setState("idle"), 1400);
      }, 350);
    },
    [disabled, state, onAdd]
  );

  const base =
    variant === "grid"
      ? "mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98]"
      : "flex-1 rounded-full font-bold py-3.5 px-5 flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

  const tone =
    state === "added"
      ? variant === "grid"
        ? "bg-emerald-600 hover:bg-emerald-600 scale-[1.02]"
        : "bg-emerald-600 text-white hover:bg-emerald-600 scale-[1.02]"
      : variant === "grid"
        ? "bg-slate-950 hover:bg-slate-800"
        : "bg-charcoal text-white hover:bg-primary bg-[#1e293b]";

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      disabled={disabled || state === "adding"}
      className={`${base} ${tone} ${state === "adding" ? "opacity-90" : ""} ${className} ${
        state === "added" ? "animate-add-pop" : ""
      }`}
    >
      {state === "idle" && (
        <>
          {variant === "grid" ? <Plus size={17} /> : <ShoppingBag size={18} />}
          {label}
          {priceLabel ? ` • ${priceLabel}` : ""}
        </>
      )}
      {state === "adding" && (
        <>
          <Loader2 size={17} className="animate-spin" />
          Adding…
        </>
      )}
      {state === "added" && (
        <>
          <span className="animate-check-pop inline-flex">
            <Check size={17} strokeWidth={3} />
          </span>
          Added!
        </>
      )}
    </button>
  );
}
