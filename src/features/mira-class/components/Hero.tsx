// src/features/mira-class/components/Hero.tsx
//
// The "arrival" moment. A kinetic headline ("confused → confident") that masks
// up line-by-line, a small AI-chat motif that types a welcome, a subtle pink
// ambient dot field behind everything, and a gentle scroll cue.
//
// Motion is Framer-Motion for the component-level reveals (sequenced on mount),
// with the canvas field hand-rolled. Reduced motion: everything renders static,
// the typing resolves instantly, the field draws one static frame.

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { INK, INK_DIM, INK_FAINT, PINK, MONO, EASE_OUT_EXPO_TUPLE } from '../theme';
import type { MiraClassContent } from '../../../content/mira-class';
import AmbientField from './AmbientField';
import TypedReply from './TypedReply';

const OUT = EASE_OUT_EXPO_TUPLE;

/** A single line that rises from behind a clipped mask. */
function MaskLine({
  children,
  delay,
  reduce,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  reduce: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.1em' }}>
      <motion.span
        style={{ display: 'block', ...style }}
        initial={reduce ? { y: 0 } : { y: '115%' }}
        animate={{ y: 0 }}
        transition={{ duration: reduce ? 0 : 1.0, ease: OUT, delay: reduce ? 0 : delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero({ c, reduce }: { c: MiraClassContent; reduce: boolean }) {
  const [typeStart, setTypeStart] = useState(reduce);
  const lines = c.hero.headline.split('\n');

  // Let the typed reply begin only after the headline has revealed. Under
  // reduced motion the initial state is already `true`, so no effect is needed.
  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setTypeStart(true), 1100);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <section
      aria-label="Welcome"
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(96px, 14vh, 160px) clamp(20px, 6vw, 80px) clamp(64px, 10vh, 110px)',
        overflow: 'hidden',
      }}
    >
      {/* Ambient pink dot field — fades out as you scroll (parent owns wrapper opacity) */}
      <div
        aria-hidden
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      >
        <AmbientField reduce={reduce} />
        {/* Soft pink glow, low and behind content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(720px 460px at 18% 12%, rgba(255,65,147,0.10), transparent 60%), radial-gradient(640px 520px at 86% 90%, rgba(255,65,147,0.05), transparent 64%)',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 980, margin: '0 auto', width: '100%' }}>
        {/* Eyebrow */}
        <motion.p
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.6, ease: OUT, delay: reduce ? 0 : 0.1 }}
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: PINK,
            margin: '0 0 22px',
          }}
        >
          {c.hero.eyebrow}
        </motion.p>

        {/* Kinetic headline: "From / confused / to confident" */}
        <h1
          style={{
            fontFamily: MONO,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: INK,
            margin: '0 0 26px',
            lineHeight: 1.02,
            textWrap: 'balance',
          }}
        >
          <MaskLine
            delay={0.25}
            reduce={reduce}
            style={{
              fontFamily: MONO,
              fontSize: 'clamp(16px, 2.2vw, 22px)',
              fontWeight: 400,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: INK_FAINT,
              marginBottom: 8,
            }}
          >
            {c.hero.kicker}
          </MaskLine>
          {lines.map((ln, i) => (
            <MaskLine
              key={i}
              delay={0.4 + i * 0.14}
              reduce={reduce}
              style={{
                fontSize: 'clamp(44px, 9vw, 104px)',
                // Final line lands in pink — the destination of the journey.
                color: i === lines.length - 1 ? PINK : INK,
              }}
            >
              {ln}
            </MaskLine>
          ))}
        </h1>

        {/* Subline */}
        <motion.p
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.7, ease: OUT, delay: reduce ? 0 : 0.85 }}
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            lineHeight: 1.75,
            color: INK_DIM,
            margin: '0 0 36px',
            maxWidth: '54ch',
            textWrap: 'pretty',
          }}
        >
          {c.hero.subline}
        </motion.p>

        {/* AI typing motif */}
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.7, ease: OUT, delay: reduce ? 0 : 1.0 }}
        >
          <TypedReply
            label={c.hero.typedLabel}
            text={c.hero.typedReply}
            start={typeStart}
            reduce={reduce}
          />
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: reduce ? 0 : 1.6 }}
        style={{
          position: 'absolute',
          bottom: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 9,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: INK_FAINT,
          }}
        >
          {c.hero.scrollCue}
        </span>
        <motion.span
          animate={reduce ? {} : { y: [0, 7, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 30,
            background: 'linear-gradient(rgba(255,65,147,0.7), transparent)',
          }}
        />
      </motion.div>
    </section>
  );
}
