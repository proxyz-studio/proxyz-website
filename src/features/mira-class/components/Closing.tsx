// src/features/mira-class/components/Closing.tsx
//
// A large kinetic sign-off. Each word masks up on scroll, the last word lands in
// pink — closing the "confused → confident" arc the hero opened. Reduced motion:
// the line simply appears.

import { motion } from 'motion/react';
import { INK, PINK, MONO } from '../theme';

const OUT = [0.16, 1, 0.3, 1] as const;

export default function Closing({ text, reduce }: { text: string; reduce: boolean }) {
  const words = text.split(' ');

  return (
    <section
      data-spine-section
      aria-label="Closing"
      style={{
        padding: 'clamp(80px, 16vh, 180px) clamp(20px, 6vw, 80px)',
        borderTop: '1px solid rgba(255,255,255,0.09)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: MONO,
          fontSize: 'clamp(40px, 9vw, 110px)',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          lineHeight: 1.0,
          color: INK,
          margin: 0,
          textAlign: 'center',
          textWrap: 'balance',
          maxWidth: 900,
        }}
      >
        {words.map((w, i) => (
          <span
            key={i}
            style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.12em', verticalAlign: 'top' }}
          >
            <motion.span
              initial={reduce ? { y: 0 } : { y: '110%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: reduce ? 0 : 0.9, ease: OUT, delay: reduce ? 0 : i * 0.12 }}
              style={{
                display: 'inline-block',
                color: i === words.length - 1 ? PINK : INK,
                marginRight: i < words.length - 1 ? '0.28em' : 0,
              }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </h2>
    </section>
  );
}
