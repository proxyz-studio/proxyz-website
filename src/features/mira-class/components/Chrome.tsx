// src/features/mira-class/components/Chrome.tsx
//
// Minimal co-brand header and a one-line footer. No site Nav, no links to other
// pages, no pricing — the page is intentionally isolated (per the brief).

import { motion } from 'motion/react';
import { INK_DIM, INK_FAINT, MONO, DIVIDER, EASE_OUT_EXPO_TUPLE } from '../theme';

const OUT = EASE_OUT_EXPO_TUPLE;

export function Header({ cobrand, reduce }: { cobrand: string; reduce: boolean }) {
  return (
    <motion.header
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: OUT }}
      style={{
        position: 'relative',
        zIndex: 5,
        padding: 'clamp(18px, 3vw, 26px) clamp(20px, 6vw, 80px)',
        borderBottom: `1px solid ${DIVIDER}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 'clamp(12px, 1.5vw, 14px)',
          letterSpacing: '0.06em',
          color: INK_DIM,
        }}
      >
        {cobrand}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: INK_FAINT,
        }}
      >
        AI Workshop
      </span>
    </motion.header>
  );
}

export function Footer({ text }: { text: string }) {
  return (
    <footer
      style={{
        borderTop: `1px solid ${DIVIDER}`,
        padding: 'clamp(20px, 3vw, 30px) clamp(20px, 6vw, 80px)',
      }}
    >
      <p
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: INK_FAINT,
          margin: 0,
          textAlign: 'center',
        }}
      >
        {text}
      </p>
    </footer>
  );
}
