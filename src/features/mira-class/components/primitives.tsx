// src/features/mira-class/components/primitives.tsx
//
// Small shared building blocks for the MIRA Workshop page: eyebrow, section
// heading, body paragraph, and a scroll-reveal wrapper. Kept tiny and styled
// inline to match the repo's existing convention (Mira.tsx / the old MiraClass).

import { motion } from 'motion/react';
import { INK, INK_DIM, PINK, MONO } from '../theme';
import { RISE, STAGGER } from '../motion';

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      variants={RISE}
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: PINK,
        margin: '0 0 18px',
      }}
    >
      {children}
    </motion.p>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      variants={RISE}
      style={{
        fontFamily: MONO,
        fontSize: 'clamp(24px, 4vw, 40px)',
        fontWeight: 500,
        letterSpacing: '-0.015em',
        color: INK,
        margin: '0 0 26px',
        lineHeight: 1.15,
        textWrap: 'balance',
      }}
    >
      {children}
    </motion.h2>
  );
}

export function Body({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <motion.p
      variants={RISE}
      style={{
        fontFamily: MONO,
        fontSize: 'clamp(14px, 1.4vw, 16px)',
        lineHeight: 1.85,
        color: INK_DIM,
        margin: '0 0 16px',
        maxWidth: '60ch',
        textWrap: 'pretty',
        ...style,
      }}
    >
      {children}
    </motion.p>
  );
}

/**
 * Section wrapper: standard padding, top divider, a `data-spine-section` hook
 * for the JourneySpine, and a single staggered reveal container so children
 * with `variants={RISE}` animate in once on scroll.
 */
export function Section({
  children,
  first = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  first?: boolean;
  ariaLabel?: string;
}) {
  return (
    <section
      data-spine-section
      aria-label={ariaLabel}
      style={{
        padding: 'clamp(56px, 9vh, 104px) clamp(20px, 6vw, 80px)',
        borderTop: first ? 'none' : `1px solid rgba(255,255,255,0.09)`,
      }}
    >
      <motion.div
        variants={STAGGER}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}
      >
        {children}
      </motion.div>
    </section>
  );
}
