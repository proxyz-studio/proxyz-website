import { useEffect, useState } from 'react';

/**
 * True when the viewport is at or below `maxWidth` (phones / narrow tablets).
 * Initialised synchronously from matchMedia so the first paint is already
 * correct (no desktop-to-mobile flash), and updated on resize.
 */
export function useIsMobile(maxWidth = 760): boolean {
  const query = `(max-width: ${maxWidth}px)`;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);

  return isMobile;
}
