import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Page-scoped Lenis smooth scroll, integrated with GSAP ScrollTrigger.
 *
 * The cinematic scroll-scrub scenes need an inertial scroll feel and a single
 * source of scroll truth that ScrollTrigger reads from. Lenis provides both.
 * Mounted once by the page shell; torn down on unmount so other routes keep
 * native scroll.
 *
 * Lenis is driven by a plain requestAnimationFrame loop (the canonical Lenis
 * pattern). The gsap.ticker integration is deliberately NOT used here: GSAP's
 * ticker passes seconds-since-init, not performance.now() ms, which feeds
 * lenis.raf a mismatched clock and freezes the scroll.
 *
 * Honors prefers-reduced-motion: when set, Lenis never initializes and the
 * page scrolls natively (ScrollTrigger's own listener still updates triggers).
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      // Long, gentle ease-out. Matches the "exponential ease-out, no bounce"
      // house motion law.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    // Dev aid: expose the instance so previews/tests can drive a real Lenis
    // scroll (window.scrollTo bypasses Lenis and won't fire ScrollTrigger).
    (window as unknown as { __sosLenis?: Lenis }).__sosLenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    ScrollTrigger.refresh();

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off('scroll', onScroll);
      delete (window as unknown as { __sosLenis?: Lenis }).__sosLenis;
      lenis.destroy();
    };
  }, []);
}
