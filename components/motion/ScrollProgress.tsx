"use client";

import { useEffect, useState } from "react";

/**
 * The thin brand-to-gold bar across the top of the window showing how far
 * down the page the reader is. Mounted once in the root layout.
 *
 * Hidden until the reader is actually scrolling a page long enough to need
 * it, so short pages are not decorated with a permanent full-width rule.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 240) {
        setVisible(false);
        return;
      }
      const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
      setProgress(ratio);
      setVisible(window.scrollY > 24);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="scroll-progress"
      style={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--scroll-progress" as any]: progress,
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms var(--ease-luxury)",
      }}
    />
  );
}
