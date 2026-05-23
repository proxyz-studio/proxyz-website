import { useEffect, useRef, type ReactNode, type AnchorHTMLAttributes } from 'react';
import { motion } from 'motion/react';
import VanillaTilt from 'vanilla-tilt';

function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none)').matches;
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 3D card tilt + optional glare on hover.
 *
 * Powered by Vanilla-Tilt (the named skill in P3 of Tew's plan). Same
 * library + tuning the founder's brief uses for its venture cards.
 * Skipped on touch devices and reduce-motion users.
 *
 * Backward-compatible with the previous hand-rolled implementation:
 *   - maxTiltX (default 5)  → mapped to vanilla-tilt's max
 *   - maxTiltY (default 7)  → averaged with maxTiltX for the symmetric
 *                             tilt vanilla-tilt expects (its "max"
 *                             applies on both axes). Existing call sites
 *                             that pass both values get the average.
 *   - as, style, className unchanged
 *
 * New props:
 *   - glare (default true) — subtle gloss on the high edge
 *   - maxGlare (default 0.08) — restrained per impeccable
 *   - speed (default 720) — transition speed in ms
 */
export function TiltCard({
  children,
  maxTiltX = 5,
  maxTiltY = 7,
  glare = true,
  maxGlare = 0.08,
  speed = 720,
  style,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  maxTiltX?: number;
  maxTiltY?: number;
  glare?: boolean;
  maxGlare?: number;
  speed?: number;
  style?: React.CSSProperties;
  className?: string;
  as?: 'div' | 'article' | 'section';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isTouchDevice()) return;
    if (prefersReducedMotion()) return;

    const maxTilt = Math.round((maxTiltX + maxTiltY) / 2);
    VanillaTilt.init(el, {
      max: maxTilt,
      speed,
      glare,
      'max-glare': maxGlare,
      perspective: 1500,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // ease-out-expo, matches motion tokens
      'gyroscope': false,
      reset: true,
    });

    return () => {
      // Vanilla-Tilt attaches a `vanillaTilt` instance to the DOM node.
      const inst = (el as HTMLElement & { vanillaTilt?: { destroy(): void } }).vanillaTilt;
      if (inst) inst.destroy();
    };
  }, [maxTiltX, maxTiltY, glare, maxGlare, speed]);

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export function SpotlightCard({
  children,
  color = 'rgba(255, 65, 147, 0.18)',
  size = 320,
  style,
  className,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: React.MouseEvent) {
    if (isTouchDevice()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--pvz-x', `${x}%`);
    el.style.setProperty('--pvz-y', `${y}%`);
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(${size}px circle at var(--pvz-x, 50%) var(--pvz-y, 50%), ${color}, transparent 70%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type AnchorPropsWithoutMotionConflicts = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;

export function MagneticAnchor({
  children,
  style,
  className,
  strength = 12,
  ...rest
}: {
  children: ReactNode;
  strength?: number;
} & AnchorPropsWithoutMotionConflicts) {
  const ref = useRef<HTMLAnchorElement>(null);
  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isTouchDevice()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Keep the magnetic drift on the existing inline transform —
    // Motion's whileHover scale lives on a separate transform stack.
    el.style.setProperty('--magnetic-x', `${x * strength}px`);
    el.style.setProperty('--magnetic-y', `${y * (strength * 0.65)}px`);
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--magnetic-x', '0px');
    el.style.setProperty('--magnetic-y', '0px');
  }
  return (
    <motion.a
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      // Exponential ease-out-quint per impeccable motion law:
      // "no bounce, no elastic". Replaces the previous spring transition.
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={{
        display: 'inline-flex',
        translateX: 'var(--magnetic-x, 0px)',
        translateY: 'var(--magnetic-y, 0px)',
        willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.a>
  );
}
