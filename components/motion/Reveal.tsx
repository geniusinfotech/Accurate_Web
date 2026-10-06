"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useReducedMotion } from "./useReducedMotion";

type RevealVariant = "up" | "left" | "right" | "scale" | "fade" | "blur";

interface RevealProps {
  children: ReactNode;
  /** Direction the element travels in from. */
  variant?: RevealVariant;
  /** Milliseconds to wait after the element enters the viewport. */
  delay?: number;
  /** Fraction of the element that must be visible before it plays. */
  threshold?: number;
  /** Replay every time the element scrolls back into view. */
  repeat?: boolean;
  /** Animate direct children in sequence instead of the wrapper as a whole. */
  stagger?: boolean;
  as?: ElementType;
  className?: string;
}

/**
 * Plays an entrance animation the first time an element scrolls into view.
 *
 * The animation itself lives in CSS (`[data-reveal]` in globals.css) — this
 * only flips `data-revealed`, so there is no per-frame JS and nothing to
 * clean up beyond the observer. Under `prefers-reduced-motion` the element
 * renders in its final state immediately.
 *
 *   <Reveal variant="up" delay={120}>…</Reveal>
 *   <Reveal stagger>{cards}</Reveal>   // children animate one after another
 */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  threshold = 0.15,
  repeat = false,
  stagger = false,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Already past the fold on load (a deep link, or a restored scroll
    // position) — show it without waiting for a scroll event.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (!repeat) observer.unobserve(entry.target);
        } else if (repeat) {
          setRevealed(false);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, repeat, threshold]);

  const revealProps = stagger
    ? { "data-stagger-children": "" }
    : { "data-reveal": variant };

  return (
    <Tag
      ref={ref as any}
      {...revealProps}
      data-revealed={revealed ? "true" : "false"}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as any) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
