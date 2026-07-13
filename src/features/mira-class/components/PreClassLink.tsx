// src/features/mira-class/components/PreClassLink.tsx
//
// The "your personal link" card. The link placeholder gets a soft pink pulse +
// hover-glow and a gentle magnetic drift toward the cursor (desktop only). It is
// a placeholder, not a real URL (per the brief), so it is a non-interactive
// styled chip — no href.

import { motion } from 'motion/react';
import type { MiraClassContent } from '../../../content/mira-class';
import { INK_DIM, INK_FAINT, PINK, MONO } from '../theme';
import { Eyebrow, SectionHeading, Body } from './primitives';
import { RISE } from '../motion';
import { useMagnetic } from '../hooks/useMagnetic';

export default function PreClassLink({
  c,
  reduce,
}: {
  c: MiraClassContent['preClass'];
  reduce: boolean;
}) {
  const magnetRef = useMagnetic<HTMLDivElement>(!reduce, 0.25);

  return (
    <>
      <Eyebrow>A few days before Session 1</Eyebrow>
      <SectionHeading>{c.heading}</SectionHeading>
      <Body>{c.intro}</Body>

      <motion.div variants={RISE} style={{ marginTop: 28 }}>
        <div ref={magnetRef} style={{ willChange: 'transform' }}>
          <div
            className="mira-link-card"
            style={{
              position: 'relative',
              border: `1px solid rgba(255,65,147,0.28)`,
              borderLeft: `3px solid ${PINK}`,
              borderRadius: 14,
              padding: 'clamp(22px, 3.4vw, 34px)',
              background: 'rgba(255,65,147,0.05)',
              overflow: 'hidden',
              transition:
                'box-shadow 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.5s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Soft pulsing glow behind the card */}
            <motion.span
              aria-hidden
              animate={reduce ? {} : { opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '50%',
                left: -40,
                width: 220,
                height: 220,
                transform: 'translateY(-50%)',
                background: 'radial-gradient(circle, rgba(255,65,147,0.22), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: PINK,
                  margin: '0 0 12px',
                }}
              >
                {c.linkCard.heading}
              </p>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: 'clamp(14px, 1.4vw, 16px)',
                  lineHeight: 1.75,
                  color: INK_DIM,
                  margin: '0 0 18px',
                  maxWidth: '52ch',
                  textWrap: 'pretty',
                }}
              >
                {c.linkCard.body}
              </p>
              {/* Placeholder chip with a soft live pulse */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: MONO,
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  color: INK_FAINT,
                  fontStyle: 'italic',
                  border: `1px dashed rgba(255,65,147,0.4)`,
                  borderRadius: 999,
                  padding: '8px 16px',
                }}
              >
                <motion.span
                  aria-hidden
                  animate={reduce ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: PINK,
                    display: 'block',
                  }}
                />
                {c.linkCard.placeholder}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
