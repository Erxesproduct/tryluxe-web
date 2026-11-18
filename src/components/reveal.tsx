"use client";

import { useEffect, useRef } from "react";

/**
 * Fades its children up when they scroll into view. Only elements that start below the fold are hidden
 * (class added after mount), so without JS, or above the fold, nothing ever disappears.
 * Fail-safe: besides the IntersectionObserver, a scroll / resize check and a timer reveal the element, so a missed
 * observer callback can never leave content invisible.
 */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" | "article" }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add("reveal-armed");

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      el.classList.add("reveal-in");
      cleanup();
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) show();
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && show());
    io.observe(el);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    // last resort: whatever happens, the content shows up
    const timer = window.setTimeout(show, 4000);
    function cleanup() {
      io.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.clearTimeout(timer);
    }
    return cleanup;
  }, []);
  return (
    <Tag ref={ref as never} className={className} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
