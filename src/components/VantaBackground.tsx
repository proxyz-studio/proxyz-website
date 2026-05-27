import { useEffect, useRef, useState } from 'react';

/**
 * Animated pink-network atmosphere behind every page.
 *
 * Renders Vanta.NET (Three.js + Vanta) as a fixed full-viewport layer
 * behind all content. Same generative network the founder's brief uses.
 *
 * Gating (impeccable: ambient effects bound to capable environments):
 *   - Viewport >= 821px (skips phones + small tablets)
 *   - prefers-reduced-motion: no-preference
 *   - Re-evaluates on viewport + motion-preference changes
 *
 * Cost discipline:
 *   - Three.js + Vanta bundle (~75KB gz) loaded via dynamic import only
 *     after the gates pass. Mobile + reduce-motion users never download.
 *   - Single instance, destroyed on unmount.
 *
 * Mobile + reduce-motion fallback: the body's static dot-grid CSS
 * (defined in src/index.css under `.has-ambient`) shows through.
 */

type VantaInstance = {
  destroy: () => void;
  resize?: () => void;
};

const VANTA_OPTIONS = {
  mouseControls: true,
  touchControls: false,
  gyroControls: false,
  scale: 1.0,
  scaleMobile: 1.0,
  color: 0xff4193,         // PROXYZ pink
  backgroundColor: 0x0a0a0a, // Tinted near-black
  points: 7,
  maxDistance: 22,
  spacing: 19,
  showDots: false,
};

export default function VantaBackground() {
  const elRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaInstance | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mqDesktop = window.matchMedia('(min-width: 821px)');
    const mqMotionOK = window.matchMedia('(prefers-reduced-motion: no-preference)');

    let cancelled = false;

    async function tryLoad() {
      if (cancelled) return;
      if (!elRef.current) return;
      if (effectRef.current) return;
      if (!mqDesktop.matches || !mqMotionOK.matches) return;

      try {
        const [threeModule, vantaModule] = await Promise.all([
          import('three'),
          // vanta.net is a plain JS module that attaches to window.VANTA in
          // browser builds. The default export is the NET constructor function.
          import('vanta/dist/vanta.net.min'),
        ]);
        if (cancelled || !elRef.current || effectRef.current) return;

        const THREE = threeModule;
        // Vanta's "default" export is the constructor function.
        const NetCtor = (vantaModule as { default: (opts: object) => VantaInstance }).default;

        effectRef.current = NetCtor({
          el: elRef.current,
          THREE,
          ...VANTA_OPTIONS,
        });
        // Fade in after the first frame paints
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      } catch (e) {
        // Vanta failed to load. Mobile fallback dot-grid keeps showing.
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('[VantaBackground] failed to initialize:', e);
        }
      }
    }

    function teardown() {
      if (effectRef.current) {
        try { effectRef.current.destroy(); } catch { /* noop */ }
        effectRef.current = null;
      }
      setReady(false);
    }

    function onPreferenceChange() {
      if (mqDesktop.matches && mqMotionOK.matches) {
        tryLoad();
      } else {
        teardown();
      }
    }

    tryLoad();

    mqDesktop.addEventListener('change', onPreferenceChange);
    mqMotionOK.addEventListener('change', onPreferenceChange);

    return () => {
      cancelled = true;
      mqDesktop.removeEventListener('change', onPreferenceChange);
      mqMotionOK.removeEventListener('change', onPreferenceChange);
      teardown();
    };
  }, []);

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      className={`vanta-bg${ready ? ' is-ready' : ''}`}
    />
  );
}
