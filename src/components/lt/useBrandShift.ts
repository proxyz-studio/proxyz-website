/* Scroll-driven dual-brand color shift.
   Toggles body.lt-mode-tiger on/off based on which [data-brand-mode] section
   currently contains the viewport's vertical midpoint. Simple, deterministic,
   plays well with tall sections that never reach intersectionRatio > 0.75. */

import { useEffect } from 'react';

export function useBrandShift(selector: string = '[data-brand-mode]') {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let raf = 0;
    let lastMode: string | null = null;

    function recompute() {
      raf = 0;
      const sections = document.querySelectorAll<HTMLElement>(selector);
      if (!sections.length) return;
      const probeY = (window.innerHeight || document.documentElement.clientHeight || 800) * 0.45;
      let pick: HTMLElement | null = null;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probeY && r.bottom >= probeY) {
          pick = s;
          break;
        }
      }
      // Fallback: closest section above the probe line
      if (!pick) {
        let bestTop = -Infinity;
        for (const s of sections) {
          const r = s.getBoundingClientRect();
          if (r.top <= probeY && r.top > bestTop) {
            bestTop = r.top;
            pick = s;
          }
        }
      }
      if (!pick) return;
      const mode = pick.dataset.brandMode || 'proxyz';
      if (mode === lastMode) return;
      lastMode = mode;
      if (mode === 'tiger') document.body.classList.add('lt-mode-tiger');
      else document.body.classList.remove('lt-mode-tiger');
    }

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(recompute);
    }

    recompute();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
      document.body.classList.remove('lt-mode-tiger');
    };
  }, [selector]);
}
