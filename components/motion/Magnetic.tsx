"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface MagneticProps {
  children: ReactNode;
  /** How far the element is allowed to travel toward the cursor, in px. */
  strength?: number;
  className?: string;
}

/**
 * Pulls an element gently toward the cursor while it is hovered, then lets
 * it spring back. Used on the primary CTAs, where it makes the button feel
 * like it is reaching for the pointer.
 *
 * Movement is written straight to `style.transform` inside a rAF so it never
 * triggers a React re-render on mousemove.
 */
export default function Magnetic({
  children,
  strength = 12,
  className = "",
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const reduced = useReducedMotion();

  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    // -1…1 on each axis, measured from the element's centre.
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
    });
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    el.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      className={className}
      style={{ transition: "transform 450ms var(--ease-spring)" }}
    >
      {children}
    </div>
  );
}
