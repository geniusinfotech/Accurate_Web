"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion`, and stays in sync if the user flips the
 * OS setting mid-session.
 *
 * Every animation primitive in this folder gates on it. The CSS in
 * `globals.css` already collapses transitions under the same media query —
 * this is for the JS-driven motion (tilt, magnets, counters), which CSS
 * cannot switch off on its own.
 *
 * Returns `false` during SSR and the first client paint, so markup is
 * identical on both sides and hydration stays clean.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
