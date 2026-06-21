// src/features/mira-class/hooks/useSmoothScroll.ts
//
// Page-scoped Lenis smooth scroll wired to GSAP ScrollTrigger.
//
// Lifecycle discipline (per the brief):
//   - Lenis is created ONLY inside this effect and destroyed on unmount, so
//     other routes are never affected.
//   - We wire lenis.on('scroll', ScrollTrigger.update) and drive lenis from the
//     gsap ticker, then remove the ticker callback + destroy lenis on cleanup.
//   - Under prefers-reduced-motion we skip Lenis entirely (native scroll).
//
// If Lenis ever fails to construct, we fall back to native scroll silently —
// correctness over smoothness.

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    let onScroll: (() => void) | null = null;

    try {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Let touch devices use native momentum scrolling.
        syncTouch: false,
      });

      onScroll = () => ScrollTrigger.update();
      lenis.on('scroll', onScroll);

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    } catch {
      // Native scroll fallback — nothing to do.
      lenis = null;
    }

    return () => {
      if (tickerFn) gsap.ticker.remove(tickerFn);
      gsap.ticker.lagSmoothing(500, 33);
      if (lenis && onScroll) lenis.off('scroll', onScroll);
      lenis?.destroy();
      lenis = null;
    };
  }, [enabled]);
}
