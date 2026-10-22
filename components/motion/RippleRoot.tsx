"use client";

import { useEffect } from "react";

/**
 * Gives every button in the app a press ripple, without touching a single
 * button's markup.
 *
 * One delegated `pointerdown` listener on the document finds the nearest
 * button-shaped ancestor and drops a ripple span at the click point. The
 * `.btn-*` classes already set `position: relative; overflow: hidden`, which
 * is all the ripple needs to stay inside its host.
 *
 * Opt a control out with `data-no-ripple`, or opt an arbitrary element in
 * with `data-ripple`.
 */
const TARGET =
  "[data-ripple], .btn-primary, .btn-secondary, .btn-accent, .btn-danger";

export default function RippleRoot() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(TARGET) as
        | HTMLElement
        | null;
      if (!el || el.closest("[data-no-ripple]")) return;
      if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;

      const rect = el.getBoundingClientRect();
      // Scale the dot to the control so a wide button ripples across it.
      const size = Math.max(rect.width, rect.height) * 0.55;

      const dot = document.createElement("span");
      dot.className = "ripple-dot";
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${e.clientX - rect.left}px`;
      dot.style.top = `${e.clientY - rect.top}px`;
      dot.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;

      el.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove(), { once: true });
      // Belt and braces: if the animation never fires (tab hidden mid-press),
      // don't leak the node.
      setTimeout(() => dot.remove(), 1200);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return null;
}
