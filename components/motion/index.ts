/**
 * Accurate Liquid motion primitives.
 *
 * The animation *definitions* live in `app/globals.css`; these components
 * only decide when they play. Everything here is SSR-safe, honours
 * `prefers-reduced-motion`, and avoids per-frame React renders.
 */
export { default as Reveal } from "./Reveal";
export { default as Magnetic } from "./Magnetic";
export { default as TiltCard } from "./TiltCard";
export { default as ScrollProgress } from "./ScrollProgress";
export { default as AnimatedCounter } from "./AnimatedCounter";
export { default as Ripple, useRipple } from "./Ripple";
export { default as RippleRoot } from "./RippleRoot";
export { useReducedMotion } from "./useReducedMotion";
