// src/features/mira-class/components/TypedReply.tsx
//
// A small "AI chat" motif for the hero: a friendly line that types itself out,
// character by character, like an assistant replying. A blinking caret trails
// the text while typing, then settles.
//
// Reduced motion: the full line renders instantly, no caret animation, no loop.
// The typing runs exactly once (no infinite loop) and only after `start` flips
// true so it can be sequenced behind the headline reveal.

import { useEffect, useRef, useState } from 'react';
import { INK, INK_DIM, PINK, MONO, SURFACE, DIVIDER } from '../theme';

export default function TypedReply({
  label,
  text,
  start,
  reduce,
}: {
  label: string;
  text: string;
  start: boolean;
  reduce: boolean;
}) {
  const [shown, setShown] = useState(reduce ? text : '');
  const [done, setDone] = useState(reduce);
  const idx = useRef(0);

  useEffect(() => {
    // Under reduced motion the initial state already shows the full text.
    if (reduce) return;
    if (!start) return;
    // Initial state is '' / not-done for the non-reduced path, so the timer can
    // begin typing directly — no synchronous reset needed.
    idx.current = 0;

    let timer = 0;
    const type = () => {
      idx.current += 1;
      setShown(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        setDone(true);
        return;
      }
      // Slight natural variance; pause a touch longer after sentence breaks.
      const ch = text[idx.current - 1];
      const base = 18;
      const extra = ch === '.' || ch === '!' || ch === '?' ? 220 : ch === ',' ? 90 : 0;
      timer = window.setTimeout(type, base + extra + Math.random() * 22);
    };
    timer = window.setTimeout(type, 260);
    return () => window.clearTimeout(timer);
  }, [start, text, reduce]);

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        maxWidth: 480,
        background: SURFACE,
        border: `1px solid ${DIVIDER}`,
        borderRadius: 14,
        borderTopLeftRadius: 4,
        padding: '16px 18px',
      }}
    >
      {/* Avatar dot */}
      <span
        aria-hidden
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'rgba(255,65,147,0.14)',
          border: `1px solid rgba(255,65,147,0.45)`,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          fontFamily: MONO,
          fontSize: 12,
          color: PINK,
          marginTop: 1,
        }}
      >
        AI
      </span>
      <div style={{ minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: PINK,
            marginBottom: 7,
          }}
        >
          {label}
        </span>
        <p
          aria-label={text}
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(13px, 1.35vw, 15px)',
            lineHeight: 1.7,
            color: INK_DIM,
            margin: 0,
            textWrap: 'pretty',
            minHeight: '1.7em',
          }}
        >
          <span style={{ color: INK }} aria-hidden={!reduce}>
            {shown}
          </span>
          {!reduce && (
            <span
              aria-hidden
              className="mira-caret"
              style={{
                display: 'inline-block',
                width: 7,
                height: '1.05em',
                marginLeft: 2,
                transform: 'translateY(2px)',
                background: PINK,
                opacity: done ? 0 : 1,
                animation: done ? 'none' : 'mira-blink 1s steps(1) infinite',
              }}
            />
          )}
        </p>
      </div>
    </div>
  );
}
