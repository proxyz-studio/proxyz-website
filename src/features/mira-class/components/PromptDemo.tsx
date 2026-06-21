// src/features/mira-class/components/PromptDemo.tsx
//
// THE interactive teaching toy. A clear toggle the visitor flips between "Weak
// prompt" and "Strong prompt". Flipping animates a fake chat: the weak prompt
// yields a vague, generic answer; the strong prompt (Role + Task + Context +
// Format) yields a specific, useful one. Smooth crossfade + height animation
// between states. Delightful, obvious, and it teaches the core lesson.
//
// Accessibility: the toggle is a real two-button radio-style group (role="radio"
// / aria-checked), keyboard-operable, 44px hit areas. The chat re-types on each
// flip only as a flourish; the full text is always present in the DOM for
// readers and under reduced motion.

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { MiraChatLine, MiraClassContent } from '../../../content/mira-class';
import {
  INK,
  INK_DIM,
  INK_FAINT,
  PINK,
  PINK_SUBTLE,
  MONO,
  DIVIDER,
  SURFACE,
} from '../theme';
import { Eyebrow, SectionHeading, Body } from './primitives';

const OUT = [0.16, 1, 0.3, 1] as const;

function ChatBubble({ line, reduce, delay }: { line: MiraChatLine; reduce: boolean; delay: number }) {
  const isYou = line.role === 'you';
  return (
    <motion.div
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: OUT, delay: reduce ? 0 : delay }}
      style={{
        display: 'flex',
        justifyContent: isYou ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '88%',
          background: isYou ? PINK_SUBTLE : SURFACE,
          border: `1px solid ${isYou ? 'rgba(255,65,147,0.3)' : DIVIDER}`,
          borderRadius: 14,
          borderTopRightRadius: isYou ? 4 : 14,
          borderTopLeftRadius: isYou ? 14 : 4,
          padding: '12px 15px',
        }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: MONO,
            fontSize: 9.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: isYou ? PINK : INK_FAINT,
            marginBottom: 6,
          }}
        >
          {isYou ? 'You' : 'AI'}
        </span>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(12.5px, 1.25vw, 14px)',
            lineHeight: 1.65,
            color: isYou ? INK : INK_DIM,
            margin: 0,
            whiteSpace: 'pre-line',
            textWrap: 'pretty',
          }}
        >
          {line.text}
        </p>
      </div>
    </motion.div>
  );
}

export default function PromptDemo({
  c,
  reduce,
}: {
  c: MiraClassContent['promptDemo'];
  reduce: boolean;
}) {
  const [strong, setStrong] = useState(false);
  const state = strong ? c.strong : c.weak;

  return (
    <>
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <SectionHeading>{c.heading}</SectionHeading>
      <Body style={{ marginBottom: 30 }}>{c.intro}</Body>

      {/* The toggle — big, obvious, tactile */}
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reduce ? 0 : 0.6, ease: OUT }}
        role="radiogroup"
        aria-label="Choose a prompt style"
        style={{
          display: 'inline-flex',
          position: 'relative',
          gap: 4,
          padding: 4,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${DIVIDER}`,
          borderRadius: 999,
          marginBottom: 24,
        }}
      >
        {/* Sliding pill */}
        <motion.span
          aria-hidden
          layout
          initial={false}
          animate={{ x: strong ? '100%' : '0%' }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 'calc(50% - 4px)',
            bottom: 4,
            background: PINK,
            borderRadius: 999,
            zIndex: 0,
          }}
        />
        {[
          { label: c.toggleWeak, on: !strong, set: () => setStrong(false) },
          { label: c.toggleStrong, on: strong, set: () => setStrong(true) },
        ].map((t, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={t.on}
            onClick={t.set}
            className="mira-toggle-btn"
            style={{
              position: 'relative',
              zIndex: 1,
              minWidth: 'clamp(120px, 22vw, 150px)',
              minHeight: 44,
              padding: '0 18px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: MONO,
              fontSize: 'clamp(12px, 1.3vw, 14px)',
              letterSpacing: '0.02em',
              fontWeight: t.on ? 600 : 400,
              color: t.on ? '#0A0A0A' : INK_DIM,
              transition: 'color 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* The phone-like demo surface */}
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: reduce ? 0 : 0.7, ease: OUT }}
        style={{
          border: `1px solid ${strong ? 'rgba(255,65,147,0.3)' : DIVIDER}`,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
          transition: 'border-color 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Badge bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            borderBottom: `1px solid ${DIVIDER}`,
          }}
        >
          <span style={{ display: 'flex', gap: 5 }} aria-hidden>
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: d === 0 ? 'rgba(255,65,147,0.5)' : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state.badge}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, y: -4 }}
              transition={{ duration: reduce ? 0 : 0.22 }}
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: strong ? PINK : INK_FAINT,
              }}
            >
              {state.badge}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Animated, height-aware content area */}
        <motion.div
          layout={!reduce}
          transition={reduce ? { duration: 0 } : { layout: { duration: 0.5, ease: OUT } }}
          style={{ padding: 'clamp(16px, 3vw, 24px)' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={strong ? 'strong' : 'weak'}
              initial={reduce ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: OUT }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {/* Recipe chips (strong only) */}
              {strong && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                    gap: 8,
                  }}
                >
                  {c.strong.recipe.map((r, i) => (
                    <motion.div
                      key={r.label}
                      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reduce ? 0 : 0.4, ease: OUT, delay: reduce ? 0 : 0.05 * i }}
                      style={{
                        border: `1px solid rgba(255,65,147,0.25)`,
                        background: 'rgba(255,65,147,0.05)',
                        borderRadius: 10,
                        padding: '9px 12px',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontFamily: MONO,
                          fontSize: 9.5,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: PINK,
                          marginBottom: 4,
                        }}
                      >
                        {r.label}
                      </span>
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: INK_DIM,
                        }}
                      >
                        {r.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* The chat exchange */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {state.chat.map((line, i) => (
                  <ChatBubble key={i} line={line} reduce={reduce} delay={0.15 + i * 0.35} />
                ))}
              </div>

              {/* Verdict */}
              <motion.div
                initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.15 + state.chat.length * 0.35 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  paddingTop: 4,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: strong ? PINK : 'rgba(255,255,255,0.12)',
                    color: strong ? '#0A0A0A' : INK_FAINT,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 600,
                    marginTop: 1,
                  }}
                >
                  {strong ? '✓' : '·'}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 'clamp(12.5px, 1.3vw, 14px)',
                    lineHeight: 1.6,
                    color: strong ? INK : INK_DIM,
                    fontStyle: 'italic',
                    textWrap: 'pretty',
                  }}
                >
                  {state.verdict}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <Body style={{ marginTop: 22, marginBottom: 0, color: INK_DIM }}>{c.footnote}</Body>
    </>
  );
}
