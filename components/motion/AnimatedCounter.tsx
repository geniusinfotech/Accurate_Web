"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface AnimatedCounterProps {
  value: number;
  /** Rendered before the number, e.g. "₹". */
  prefix?: string;
  /** Rendered after the number, e.g. "%" or " pcs". */
  suffix?: string;
  decimals?: number;
  /** Roll-up duration in ms. */
  duration?: number;
  /** Indian digit grouping (12,34,567). On by default. */
  group?: boolean;
  className?: string;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function groupIndian(whole: string) {
  // 1234567 → 12,34,567 — last three digits, then pairs.
  if (whole.length <= 3) return whole;
  const head = whole.slice(0, -3);
  const tail = whole.slice(-3);
  return `${head.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${tail}`;
}

/**
 * Rolls a number up from zero the first time it scrolls into view, and
 * animates between values afterwards when the underlying figure changes —
 * so an admin stat that refreshes counts to its new total rather than
 * snapping.
 *
 * Digits are tabular so the width never jitters mid-count.
 */
export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1100,
  group = true,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const fromRef = useRef(0);
  const reduced = useReducedMotion();

  /* Hold the roll-up until the figure is on screen, so off-screen stats do
     not spend frames. Visibility gates the *animation*, never the number:
     in a background tab IntersectionObserver never fires, so the count is
     released immediately and the animation is simply skipped. Showing a
     stale 0 because the tab was not focused would be a far worse trade. */
  useEffect(() => {
    if (started) return;

    if (document.hidden) {
      setStarted(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    // A tab hidden before the observer fired would otherwise sit at zero.
    const onVisibility = () => {
      if (document.hidden) setStarted(true);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const target = Number.isFinite(value) ? value : 0;

    const settle = () => {
      fromRef.current = target;
      setDisplay(target);
    };

    // Browsers pause requestAnimationFrame in a background tab. Animating
    // there would strand the figure at whatever frame it reached, so a
    // hidden document gets the final number straight away.
    if (reduced || duration <= 0 || document.hidden) {
      settle();
      return;
    }

    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) {
      fromRef.current = target;
      return;
    }

    let frame = 0;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const current = from + delta * easeOut(t);
      fromRef.current = current;
      setDisplay(current);
      if (t < 1) frame = requestAnimationFrame(step);
      else fromRef.current = target;
    };

    frame = requestAnimationFrame(step);

    // If the tab is hidden part-way through, stop and show the real figure
    // rather than leaving a half-counted number on screen.
    const onHide = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        settle();
      }
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [started, value, duration, reduced]);

  const fixed = display.toFixed(decimals);
  const [whole, fraction] = fixed.split(".");
  const body = group ? groupIndian(whole) : whole;

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {body}
      {fraction ? `.${fraction}` : ""}
      {suffix}
    </span>
  );
}
