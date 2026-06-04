import { useEffect, useRef } from 'react';
import { MONO } from './theme';

/**
 * Persistent scroll cue. Fixed at the bottom-centre on every section so visitors
 * always know to keep scrolling (it does not scroll away with the hero). Faint
 * over the hero, it grows more opaque once the page scrolls, staying legible as
 * content passes behind it.
 */
export function ScrollCue() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const remaining = Math.max(0, max - y);
      // Ramp up as you scroll: 0.45 over the dark hero -> 0.9 once past ~180px,
      // so it stays legible as content passes behind it.
      const up = Math.min(0.9, 0.45 + (y / 180) * 0.45);
      // Fade out across the last screen — there is nothing left to scroll to.
      const fade = Math.min(window.innerHeight, 800);
      const down = Math.max(0, Math.min(1, remaining / fade));
      el.style.opacity = String(up * down);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        fontFamily: MONO,
        fontSize: '10px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#f2f2f2',
        opacity: 0.45,
        transition: 'opacity 0.2s ease',
        pointerEvents: 'none',
      }}
    >
      Scroll
      <span style={{ width: '1px', height: '40px', background: 'linear-gradient(180deg, rgba(255,255,255,0.65), transparent)' }} />
    </div>
  );
}
