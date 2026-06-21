// src/features/mira-class/hooks/useMagnetic.ts
//
// Magnetic hover for buttons/cards on fine-pointer devices only. The element
// drifts a few px toward the cursor and springs back on leave. Transform-only,
// so it stays on the GPU. No-op under reduced motion or on touch.
//
// Returns a ref to attach to the target element.

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function useMagnetic<T extends HTMLElement>(enabled: boolean, strength = 0.35) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'expo.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'expo.out' });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [enabled, strength]);

  return ref;
}
