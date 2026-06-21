// src/features/mira-class/components/SessionsScene.tsx
//
// The two sessions, the centrepiece scene. Cards reveal with stagger; on desktop
// they tilt + lift on hover. A thin connective beat ("1 → 2") sits between them
// and, on desktop, its progress bar fills as you scroll through the scene
// (a light scrubbed moment, no pin — pins are reserved and risk mobile layout).
//
// All GSAP work is scoped to a gsap.context and reverted on unmount. On mobile
// the cards stack to one column and the connective bar is static.

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import type { MiraClassContent } from '../../../content/mira-class';
import { INK_DIM, PINK, MONO } from '../theme';
import { Eyebrow } from './primitives';
import SessionCard from './SessionCard';

export default function SessionsScene({
  c,
  isDesktop,
  reduce,
}: {
  c: MiraClassContent;
  isDesktop: boolean;
  reduce: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    if (!root || !fill) return;
    if (reduce || !isDesktop) {
      gsap.set(fill, { scaleX: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });
      gsap.to(fill, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 65%',
          end: 'bottom 70%',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [isDesktop, reduce]);

  const tiltEnabled = isDesktop && !reduce;

  return (
    <section
      data-spine-section
      aria-label="The two sessions"
      style={{
        padding: 'clamp(56px, 9vh, 104px) clamp(20px, 6vw, 80px)',
        borderTop: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        style={{ maxWidth: 980, margin: '0 auto', width: '100%' }}
      >
        <Eyebrow>The two sessions</Eyebrow>

        <div ref={rootRef} style={{ position: 'relative' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: 'clamp(18px, 2.5vw, 28px)',
              alignItems: 'stretch',
            }}
          >
            <SessionCard session={c.sessions[0]} index={0} tiltEnabled={tiltEnabled} />
            <SessionCard session={c.sessions[1]} index={1} tiltEnabled={tiltEnabled} />
          </div>

          {/* Connective beat: 1 → 2 with a scrubbed progress fill (desktop) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
            }}
            style={{
              marginTop: 'clamp(22px, 3vw, 32px)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 12, color: PINK, whiteSpace: 'nowrap' }}>
              01
            </span>
            <span
              style={{
                position: 'relative',
                flex: 1,
                height: 2,
                background: 'rgba(255,65,147,0.14)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                ref={fillRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: PINK,
                  borderRadius: 2,
                  transformOrigin: 'left center',
                  willChange: 'transform',
                }}
              />
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: PINK, whiteSpace: 'nowrap' }}>
              02
            </span>
          </motion.div>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: '0.04em',
              color: INK_DIM,
              margin: '12px 0 0',
              textAlign: 'center',
            }}
          >
            Understand it first. Then put it to work.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
