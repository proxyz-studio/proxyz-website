// src/features/mira-class/components/SessionCard.tsx
//
// One of the two session cards — the centrepiece. On desktop (pointer:fine) the
// card tilts toward the cursor via vanilla-tilt, lifts with a layered shadow,
// and shows a pink edge. Outcomes stagger in. Fully readable at every size.
//
// The tilt instance is created on mount (when enabled) and destroyed on unmount,
// so no listeners leak. Under reduced motion or on touch, tilt is never created.

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import VanillaTilt from 'vanilla-tilt';
import type { MiraClassSession } from '../../../content/mira-class';
import { INK, INK_DIM, PINK, PINK_SUBTLE, MONO, DIVIDER } from '../theme';
import { RISE } from '../motion';

type TiltElement = HTMLDivElement & { vanillaTilt?: { destroy: () => void } };

export default function SessionCard({
  session,
  index,
  tiltEnabled,
}: {
  session: MiraClassSession;
  index: number;
  tiltEnabled: boolean;
}) {
  const ref = useRef<TiltElement | null>(null);
  const isFirst = index === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || !tiltEnabled) return;
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    VanillaTilt.init(el, {
      max: 6,
      speed: 600,
      glare: true,
      'max-glare': 0.12,
      scale: 1.012,
      perspective: 1200,
      gyroscope: false,
    });
    return () => {
      el.vanillaTilt?.destroy();
    };
  }, [tiltEnabled]);

  return (
    <motion.div variants={RISE} style={{ height: '100%' }}>
      <div
        ref={ref}
        className="mira-session-card"
        style={{
          height: '100%',
          background: isFirst ? 'rgba(255,65,147,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isFirst ? 'rgba(255,65,147,0.22)' : DIVIDER}`,
          borderRadius: 16,
          padding: 'clamp(24px, 4vw, 38px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          transition: `box-shadow 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.4s cubic-bezier(0.16,1,0.3,1)`,
        }}
      >
        {/* Tag + duration */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: PINK,
              background: PINK_SUBTLE,
              borderRadius: 999,
              padding: '5px 13px',
            }}
          >
            {session.tag}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.08em',
              color: INK_DIM,
            }}
          >
            {session.duration}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(21px, 3vw, 30px)',
            fontWeight: 500,
            color: INK,
            margin: 0,
            lineHeight: 1.18,
            letterSpacing: '-0.01em',
            textWrap: 'balance',
          }}
        >
          {session.title}
        </h3>

        {/* Promise */}
        <p
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(13px, 1.3vw, 15px)',
            lineHeight: 1.75,
            color: INK_DIM,
            margin: 0,
            fontStyle: 'italic',
            textWrap: 'pretty',
          }}
        >
          {session.promise}
        </p>

        {/* Outcomes */}
        <div>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: INK_DIM,
              margin: '4px 0 14px',
            }}
          >
            You will walk away able to
          </p>
          <motion.ul
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 11,
            }}
          >
            {session.outcomes.map((item, i) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -8 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                }}
                style={{
                  fontFamily: MONO,
                  fontSize: 'clamp(13px, 1.3vw, 15px)',
                  lineHeight: 1.7,
                  color: INK_DIM,
                  paddingLeft: 20,
                  position: 'relative',
                  textWrap: 'pretty',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '0.5em',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: PINK,
                    display: 'block',
                  }}
                />
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </motion.div>
  );
}
