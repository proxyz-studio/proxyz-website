// src/features/mira-class/hooks/useResponsiveFlags.ts
//
// Live, SSR-safe flags for layout/animation gating. Desktop pins, scrubs, tilt,
// and the journey spine all key off `isDesktop` + `finePointer`. Combined with
// the reduced-motion flag (owned by the page via useReducedMotion), this lets us
// fully branch: rich desktop, simple mobile, static reduced-motion.

import { useEffect, useState } from 'react';

function read(query: string) {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
}

export function useResponsiveFlags() {
  const [isDesktop, setIsDesktop] = useState(() => read('(min-width: 880px)'));
  const [finePointer, setFinePointer] = useState(() => read('(pointer: fine)'));

  useEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 880px)');
    const mqPointer = window.matchMedia('(pointer: fine)');
    const onDesktop = () => setIsDesktop(mqDesktop.matches);
    const onPointer = () => setFinePointer(mqPointer.matches);
    onDesktop();
    onPointer();
    mqDesktop.addEventListener('change', onDesktop);
    mqPointer.addEventListener('change', onPointer);
    return () => {
      mqDesktop.removeEventListener('change', onDesktop);
      mqPointer.removeEventListener('change', onPointer);
    };
  }, []);

  return { isDesktop, finePointer };
}
