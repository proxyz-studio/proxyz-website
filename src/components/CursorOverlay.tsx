import { useEffect, useRef } from 'react';

/**
 * Custom cursor: small pink crosshair that follows the mouse, expands
 * to a hollow ring on hover of interactive elements, and gets a gentle
 * magnetic pull toward branded targets (the PROXYZ wordmark, primary
 * CTAs). Same cursor system the founder's brief uses.
 *
 * Discipline (per design-motion-principles skill):
 *   - Restraint (Emil): 26px max, single mix-blend-mode element,
 *     transitions under 220ms, no decorative ornament.
 *   - Polish (Jakub): rAF-driven lerp at 0.34 factor for smooth follow,
 *     hover ring transitions via ease-out-expo, cleanly tear down on
 *     unmount.
 *   - Accessibility: skipped when (pointer: fine) is false (touch),
 *     when prefers-reduced-motion is set, or below 820px viewport.
 *     The default OS cursor is restored in all those cases.
 */

const HOVER_SELECTORS = [
  'a',
  'button',
  '[role="button"]',
  '.nav-vertical-row',
  '.pmark',
  '.hero-nav-brand',
  '.tilt-card',
  '.language-toggle-floating button',
].join(',');

const MAGNETIC_SELECTORS = [
  '.pmark',
  '.hero-nav-brand',
].join(',');

const MAGNETIC_RANGE_PX = 90;
const MAGNETIC_FORCE = 0.40;
const LERP_FACTOR = 0.34;

export default function CursorOverlay() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mqDesktop = window.matchMedia('(min-width: 821px)');
    const mqMotionOK = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const mqHover = window.matchMedia('(pointer: fine)');

    if (!mqDesktop.matches || !mqMotionOK.matches || !mqHover.matches) {
      return;
    }

    // Capture the cursor element into a non-null const so the closures
    // inside tick() / onLeaveWindow / etc. don't re-narrow it on every
    // access. The element lives for the full effect lifetime.
    const cursor: HTMLDivElement | null = cursorRef.current;
    if (!cursor) return;
    const cursorEl: HTMLDivElement = cursor;

    document.body.classList.add('has-custom-cursor');

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let rafId = 0;
    let magnetics: HTMLElement[] = [];
    let magneticsRefresh = 0;

    function refreshMagnetics() {
      magnetics = Array.from(document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTORS));
    }
    refreshMagnetics();

    function tick() {
      // Re-scan magnetic targets every ~30 frames (~half a second) so
      // route changes or DOM updates don't leave us pulling toward stale
      // elements. Cheap (~5 targets) but bounded.
      magneticsRefresh++;
      if (magneticsRefresh > 30) {
        refreshMagnetics();
        magneticsRefresh = 0;
      }

      let pullX = 0;
      let pullY = 0;
      for (const el of magnetics) {
        const rect = el.getBoundingClientRect();
        const mx = rect.left + rect.width / 2;
        const my = rect.top + rect.height / 2;
        const dx = mx - tx;
        const dy = my - ty;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAGNETIC_RANGE_PX) {
          const force = ((MAGNETIC_RANGE_PX - dist) / MAGNETIC_RANGE_PX) * MAGNETIC_FORCE;
          pullX += dx * force;
          pullY += dy * force;
        }
      }
      cx += (tx + pullX - cx) * LERP_FACTOR;
      cy += (ty + pullY - cy) * LERP_FACTOR;
      cursorEl.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    // Delegated hover detection so route changes / dynamic DOM don't
    // require re-binding listeners.
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest) return;
      if (target.closest(HOVER_SELECTORS)) {
        cursorEl.classList.add('is-hover');
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest) return;
      if (target.closest(HOVER_SELECTORS)) {
        cursorEl.classList.remove('is-hover');
      }
    };

    const onLeaveWindow = () => {
      cursorEl.style.opacity = '0';
    };
    const onEnterWindow = () => {
      cursorEl.style.opacity = '1';
    };

    // Tear down if the user toggles preferences mid-session.
    const onPreferenceChange = () => {
      if (!mqDesktop.matches || !mqMotionOK.matches || !mqHover.matches) {
        teardown();
      }
    };

    function teardown() {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.documentElement.removeEventListener('mouseleave', onLeaveWindow);
      document.documentElement.removeEventListener('mouseenter', onEnterWindow);
      mqDesktop.removeEventListener('change', onPreferenceChange);
      mqMotionOK.removeEventListener('change', onPreferenceChange);
      mqHover.removeEventListener('change', onPreferenceChange);
      document.body.classList.remove('has-custom-cursor');
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeaveWindow);
    document.documentElement.addEventListener('mouseenter', onEnterWindow);
    mqDesktop.addEventListener('change', onPreferenceChange);
    mqMotionOK.addEventListener('change', onPreferenceChange);
    mqHover.addEventListener('change', onPreferenceChange);

    return teardown;
  }, []);

  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />;
}
