/* Scripted Tiger Coach conversation.
   Types itself out across the four scripted exchanges at ~80ms per char.
   Starts when the section scrolls into view. */

import { useEffect, useRef, useState } from 'react';

const FONT_MONO = "'IBM Plex Mono', monospace";
const ORANGE = '#FF4193'; // PROXYZ pink (kept the name for diff-friendliness)

type Msg = { speaker: 'coach' | 'member'; text: string };

export default function TigerCoachChat({ messages }: { messages: Msg[] }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisibleCount(messages.length);
      setCurrentText(messages[messages.length - 1]?.text ?? '');
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            runScript();
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();

    async function runScript() {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        // Pre-show empty bubble
        setVisibleCount(i + 1);
        setCurrentText('');
        // Type characters
        for (let c = 0; c < msg.text.length; c++) {
          setCurrentText(msg.text.slice(0, c + 1));
          await new Promise((r) => setTimeout(r, 28));
        }
        // Pause between messages
        await new Promise((r) => setTimeout(r, 700));
      }
    }
  }, [messages]);

  const shown = messages.slice(0, visibleCount);

  return (
    <div
      ref={containerRef}
      style={{
        background: '#000',
        border: '1px solid rgba(255,110,31,0.2)',
        padding: '24px',
        fontFamily: FONT_MONO,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minHeight: '320px',
      }}
      role="figure"
      aria-label="Tiger Coach scripted conversation"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#C7FF1F',
            boxShadow: '0 0 8px #C7FF1F',
          }}
        />
        Tiger Coach · Active
      </div>

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {shown.map((m, i) => {
          const isCoach = m.speaker === 'coach';
          const isLast = i === shown.length - 1;
          const displayText = isLast ? currentText : m.text;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: isCoach ? 'flex-start' : 'flex-end',
              }}
            >
              <div
                style={{
                  maxWidth: '78%',
                  padding: '12px 14px',
                  borderRadius: isCoach ? '0 12px 12px 12px' : '12px 0 12px 12px',
                  background: isCoach ? 'rgba(255,110,31,0.08)' : 'rgba(255,255,255,0.06)',
                  border: isCoach
                    ? `1px solid rgba(255,110,31,0.32)`
                    : `1px solid rgba(255,255,255,0.12)`,
                  fontSize: '14px',
                  lineHeight: 1.5,
                  color: isCoach ? '#fff' : 'rgba(255,255,255,0.88)',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: isCoach ? ORANGE : 'rgba(255,255,255,0.45)',
                    marginBottom: '6px',
                  }}
                >
                  {isCoach ? 'Tiger Coach' : 'Member'}
                </div>
                {displayText}
                {isLast && displayText.length < m.text.length && (
                  <span
                    aria-hidden
                    style={{
                      display: 'inline-block',
                      width: '7px',
                      height: '14px',
                      background: isCoach ? ORANGE : 'rgba(255,255,255,0.6)',
                      verticalAlign: 'text-bottom',
                      marginLeft: '2px',
                      animation: 'lt-cursor-blink 1s steps(2) infinite',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
