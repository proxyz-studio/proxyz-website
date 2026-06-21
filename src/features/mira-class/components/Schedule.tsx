// src/features/mira-class/components/Schedule.tsx
//
// Schedule rows that animate in on scroll. Date/location are placeholders Tew
// fills later; styled cleanly and italic so they read as "to be confirmed".
// Numerals use tabular-nums so any future real dates align.

import { motion } from 'motion/react';
import type { MiraClassContent, MiraClassSession } from '../../../content/mira-class';
import { INK_DIM, INK_FAINT, PINK, MONO, DIVIDER } from '../theme';
import { Eyebrow, SectionHeading, Body } from './primitives';
import { RISE } from '../motion';

export default function Schedule({
  c,
  sessions,
}: {
  c: MiraClassContent['schedule'];
  sessions: readonly MiraClassSession[];
}) {
  return (
    <>
      <Eyebrow>When and where</Eyebrow>
      <SectionHeading>{c.heading}</SectionHeading>
      <Body>{c.note}</Body>

      <motion.div
        variants={RISE}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}
      >
        {sessions.map((s, i) => (
          <div
            key={i}
            className="mira-schedule-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr 1fr',
              gap: 'clamp(12px, 2vw, 24px)',
              alignItems: 'center',
              padding: 'clamp(16px, 2.2vw, 22px)',
              background: 'rgba(255,255,255,0.025)',
              border: `1px solid ${DIVIDER}`,
              borderRadius: 12,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: PINK,
                whiteSpace: 'nowrap',
              }}
            >
              {s.tag}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 'clamp(12px, 1.3vw, 14px)',
                color: INK_FAINT,
                fontStyle: 'italic',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.schedulePlaceholder}
            </span>
            <span
              className="mira-location-col"
              style={{
                fontFamily: MONO,
                fontSize: 'clamp(12px, 1.3vw, 14px)',
                color: INK_DIM,
                fontStyle: 'italic',
              }}
            >
              {s.locationPlaceholder}
            </span>
          </div>
        ))}
      </motion.div>
    </>
  );
}
