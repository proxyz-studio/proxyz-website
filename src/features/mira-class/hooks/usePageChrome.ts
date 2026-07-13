// src/features/mira-class/hooks/usePageChrome.ts
//
// Sets the document title and injects robots noindex,nofollow while this page
// is mounted, restoring the previous values on unmount. Preserves the original
// MiraClass behaviour exactly.
//
// Also isolates the page from globally-injected PROXYZ chrome that lives OUTSIDE
// React and so cannot be route-gated in App.tsx: the StudioOS customer-service
// chat widget (loaded via a <script> in index.html, button aria-label
// "Open PROXYZ chat") and the LINE quick-contact rail. We hide them with a
// scoped <style> while this page is mounted, removed on unmount. CSS (rather
// than removing the node) handles the widget mounting asynchronously after us.

import { useEffect } from 'react';

const ISOLATE_STYLE_ID = 'mira-class-isolate-chrome';

export function usePageChrome(pageTitle: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = pageTitle;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    const prevContent = meta.content;
    meta.content = 'noindex,nofollow';

    // Hide global, non-React PROXYZ chrome so the team page stays isolated.
    const isolate = document.createElement('style');
    isolate.id = ISOLATE_STYLE_ID;
    isolate.textContent = [
      '[aria-label="Open PROXYZ chat"],',
      '#proxyz-cs-widget, .proxyz-cs-widget,',
      '.floating-contact-rail { display: none !important; }',
    ].join('');
    document.head.appendChild(isolate);

    return () => {
      document.title = prev;
      if (created && meta) {
        meta.remove();
      } else if (meta) {
        meta.content = prevContent;
      }
      document.getElementById(ISOLATE_STYLE_ID)?.remove();
    };
  }, [pageTitle]);
}
