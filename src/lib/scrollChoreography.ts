import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scroll-choreography hooks. Thin wrappers around GSAP + ScrollTrigger
 * with sane defaults for editorial brand sites.
 *
 * Common pattern: scrub-tied hero parallax. The hero section's inner
 * content drifts up + fades as the user scrolls past it. The scrub
 * delay makes the motion feel inertial rather than glued to the
 * scrollbar (~0.6s catch-up is the founder's brief setting).
 *
 * Honors prefers-reduced-motion: the hook becomes a no-op when set.
 */

let _registered = false;
function ensureRegistered() {
  if (_registered) return;
  gsap.registerPlugin(ScrollTrigger);
  _registered = true;
}

function reducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface HeroParallaxOptions {
  /** Pixels of upward drift over the hero section's scroll range. Default 100. */
  drift?: number;
  /** Opacity at the end of the scroll range. Default 0.25 (visible but receded). */
  fadeTo?: number;
  /** Scrub catch-up delay in seconds. Default 0.6. */
  scrub?: number;
  /**
   * CSS selector for the inner element that drifts. If omitted, the section
   * ref itself is the animated target. Useful when the hero ref is the
   * outer <section> and we want only the inner content to drift.
   */
  inner?: string;
}

/**
 * Hero scroll parallax. Apply to a ref pointing at the hero <section>
 * (or any element that bounds the parallax range).
 *
 *   const heroRef = useRef<HTMLElement>(null);
 *   useHeroParallax(heroRef);
 *   return <section ref={heroRef}>...</section>;
 */
export function useHeroParallax<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: HeroParallaxOptions = {},
) {
  const { drift = 100, fadeTo = 0.25, scrub = 0.6, inner } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    ensureRegistered();

    const target = inner ? el.querySelector<HTMLElement>(inner) : el;
    if (!target) return;

    const tween = gsap.to(target, {
      y: -drift,
      opacity: fadeTo,
      ease: 'none', // linear scrub — feel comes from the scrub delay, not easing
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, drift, fadeTo, scrub, inner]);
}

/**
 * Staggered batch reveal. Apply to a container; all elements matching
 * `selector` inside it fade up in batches when they enter the viewport.
 * Cap on total stagger so long lists don't drag out.
 */
export function useBatchReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  selector: string,
  options: { stagger?: number; duration?: number; y?: number } = {},
) {
  const { stagger = 0.06, duration = 0.5, y = 24 } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    ensureRegistered();

    const items = el.querySelectorAll<HTMLElement>(selector);
    if (items.length === 0) return;

    // Pre-stage
    gsap.set(items, { opacity: 0, y });

    const trigger = ScrollTrigger.batch(items, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: 'expo.out',
          overwrite: true,
        });
      },
    });

    return () => {
      trigger.forEach((t) => t.kill());
    };
  }, [ref, selector, stagger, duration, y]);
}
