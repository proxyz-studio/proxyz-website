import { motion, useScroll, useSpring } from 'motion/react';

/**
 * Site-wide scroll progress indicator. A 2px pink bar fixed to the very top
 * of the viewport that fills left-to-right as the user scrolls down the
 * document. Uses a spring on the raw scroll position so the bar settles
 * smoothly instead of snapping on every wheel tick.
 *
 * Pointer-events disabled so it never intercepts clicks on whatever is
 * underneath (nav, CTAs, etc.). z-index sits above the fixed nav (50) so
 * the bar reads as an over-everything thin layer.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    mass: 0.2,
  });

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: '#FF4193',
        transformOrigin: 'left center',
        scaleX: smooth,
        zIndex: 60,
        pointerEvents: 'none',
      }}
    />
  );
}
