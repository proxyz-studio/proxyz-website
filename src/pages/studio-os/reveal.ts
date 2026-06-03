import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scroll reveal for any `[data-reveal]` descendants of `ref`. Each fades and
 * rises into place when it enters the viewport. Fires on real scroll via
 * ScrollTrigger (Lenis-driven). Honors prefers-reduced-motion (content shown
 * immediately, no movement).
 *
 * Optional `data-reveal-delay` (seconds) staggers a group manually.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        const delay = parseFloat(el.dataset.revealDelay || '0');
        gsap.from(el, {
          opacity: 0,
          y: 34,
          duration: 0.9,
          ease: 'expo.out',
          delay,
          scrollTrigger: { trigger: el, start: 'top 86%' },
        });
      });
    }, ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
