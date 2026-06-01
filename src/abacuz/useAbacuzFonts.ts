/* ─── Page-scoped fonts injector ──────────────────────────────────── */

import { useEffect } from 'react';

export function useAbacuzFonts() {
  useEffect(() => {
    const HREF =
      'https://fonts.googleapis.com/css2' +
      '?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500' +
      '&family=Hanken+Grotesk:wght@400;500;600;700' +
      '&family=Noto+Serif+Thai:wght@400;500;600;700' +
      '&family=IBM+Plex+Sans+Thai:wght@400;500;600;700' +
      '&display=swap';
    let link = document.querySelector<HTMLLinkElement>(
      `link[data-abacuz-fonts]`
    );
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = HREF;
      link.setAttribute('data-abacuz-fonts', 'true');
      document.head.appendChild(link);
    }
    return () => {
      // Leave the link in place — repeated visits avoid re-fetching.
    };
  }, []);
}
