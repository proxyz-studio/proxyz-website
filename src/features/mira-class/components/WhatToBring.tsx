// src/features/mira-class/components/WhatToBring.tsx
//
// An animated checklist. Each item reveals on scroll and a checkmark draws
// itself in (SVG path stroke). The check stroke is animated with Framer Motion's
// pathLength so it literally draws on. Under reduced motion the checks appear
// instantly, no drawing.

import { motion } from 'motion/react';
import type { MiraClassContent } from '../../../content/mira-class';
import { INK_DIM, PINK, MONO } from '../theme';
import { Eyebrow, SectionHeading } from './primitives';

const OUT = [0.16, 1, 0.3, 1] as const;

function DrawCheck({ reduce, delay }: { reduce: boolean; delay: number }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="11"
        stroke={PINK}
        strokeWidth="1.4"
        fill="rgba(255,65,147,0.08)"
        initial={reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: OUT, delay: reduce ? 0 : delay }}
      />
      <motion.path
        d="M7 12.4l3.2 3.1L17 8.5"
        stroke={PINK}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: reduce ? 0 : 0.4, ease: OUT, delay: reduce ? 0 : delay + 0.22 }}
      />
    </svg>
  );
}

export default function WhatToBring({
  c,
  reduce,
}: {
  c: MiraClassContent['prepare'];
  reduce: boolean;
}) {
  return (
    <>
      <Eyebrow>Come prepared</Eyebrow>
      <SectionHeading>{c.heading}</SectionHeading>

      <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
        {c.items.map((item, i) => (
          <motion.li
            key={i}
            initial={reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: reduce ? 0 : 0.55, ease: OUT, delay: reduce ? 0 : i * 0.1 }}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              padding: '16px 0',
              borderBottom: i < c.items.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}
          >
            <DrawCheck reduce={reduce} delay={i * 0.1 + 0.1} />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 'clamp(14px, 1.4vw, 16px)',
                lineHeight: 1.75,
                color: INK_DIM,
                textWrap: 'pretty',
              }}
            >
              {item}
            </span>
          </motion.li>
        ))}
      </ul>
    </>
  );
}
