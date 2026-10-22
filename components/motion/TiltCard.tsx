"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface TiltCardProps {
  children: ReactNode;
  /** Maximum rotation on each axis, in degrees. */
  max?: number;
  /** Also track a gold spotlight under the cursor. */
  glare?: boolean;
  className?: string;
}

/**
 * Tips a card in 3D toward the cursor — the product-card interaction.
 *
 * The rotation is handed to CSS through `--tilt-x` / `--tilt-y` (see
 * `.tilt-surface`), and the optional glare through `--spot-x` / `--spot-y`
 * (`.spotlight`), so the transition curve stays in the stylesheet with the
 * rest of the motion language.
 */
export default function TiltCard({
  children,
  max = 7,
  glare = true,
  className = "",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const reduced = useReducedMotion();

  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      // Cursor above centre tips the top away from the viewer, so the card
      // reads as a physical surface rather than an inverted one.
      el.style.setProperty("--tilt-x", `${(0.5 - py) * max * 2}deg`);
      el.style.setProperty("--tilt-y", `${(px - 0.5) * max * 2}deg`);
      if (glare) {
        el.style.setProperty("--spot-x", `${px * 100}%`);
        el.style.setProperty("--spot-y", `${py * 100}%`);
      }
    });
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      className={`tilt-surface ${glare ? "spotlight" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
