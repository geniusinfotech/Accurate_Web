"use client";

import { useCallback } from "react";

/**
 * Adds a press ripple to any element.
 *
 * Spread the returned props onto the element; the ripple span is created and
 * removed directly in the DOM, so a click never costs a React render:
 *
 *   const ripple = useRipple()
 *   <button className="ripple-host" {...ripple}>Save</button>
 *
 * The host needs `position: relative; overflow: hidden` — that is what the
 * `.ripple-host` class provides.
 */
export function useRipple() {
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const host = e.currentTarget;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = host.getBoundingClientRect();
    const dot = document.createElement("span");
    dot.className = "ripple-dot";
    dot.style.left = `${e.clientX - rect.left}px`;
    dot.style.top = `${e.clientY - rect.top}px`;
    // Scale the dot to the element so a wide button ripples across its width.
    dot.style.setProperty(
      "transform-origin",
      "center",
    );
    dot.style.width = dot.style.height = `${Math.max(rect.width, rect.height) * 0.5}px`;
    dot.style.margin = `${-Math.max(rect.width, rect.height) * 0.25}px 0 0 ${-Math.max(rect.width, rect.height) * 0.25}px`;

    host.appendChild(dot);
    dot.addEventListener("animationend", () => dot.remove(), { once: true });
  }, []);

  return { onPointerDown };
}

/** Wrapper form, for when you cannot reach the element's props. */
export default function Ripple({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ripple = useRipple();
  return (
    <span className={`ripple-host inline-flex ${className}`} {...ripple}>
      {children}
    </span>
  );
}
