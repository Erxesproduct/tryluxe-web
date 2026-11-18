"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sticky header that slides away while the visitor scrolls down and returns when they scroll up.
 * It stays put near the top and while the pointer or focus is inside it (an open mega menu).
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - last;
        const busy = !!ref.current?.matches(":hover, :focus-within");
        setScrolled(y > 8);
        if (y < 160 || busy) setHidden(false);
        else if (dy > 6) setHidden(true);
        else if (dy < -6) setHidden(false);
        if (Math.abs(dy) > 6) last = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header ref={ref} data-hidden={hidden} data-scrolled={scrolled} className="site-header sticky top-0 z-40 bg-ivory/92 backdrop-blur-md">
      {children}
    </header>
  );
}
