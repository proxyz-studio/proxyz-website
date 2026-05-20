/* Live-feeling leaderboard.
   Twenty scripted members. Positions cycle every 3-5s. HR ticks each second.
   Tiger Score ticks upward. #1 slot occasionally changes hands.
   No real WebSocket — scripted setInterval that feels live. */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LeaderboardMember } from '../../config';
import { ShapeFor } from './StudioShapes';

const FONT_MONO = "'IBM Plex Mono', monospace";
const ORANGE = '#FF4193'; // PROXYZ pink (kept the name for diff-friendliness)

function jitter(value: number, amount: number) {
  return value + (Math.random() - 0.5) * amount;
}

export default function Leaderboard({ seed }: { seed: LeaderboardMember[] }) {
  const [members, setMembers] = useState<LeaderboardMember[]>(seed);
  const [tick, setTick] = useState(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedRef.current) return;

    // Sub-second HR jitter — feels like a heartbeat readout
    const hrInterval = setInterval(() => setTick((t) => t + 1), 900);

    // Score ticks upward every 1.4s
    const scoreInterval = setInterval(() => {
      setMembers((prev) =>
        prev.map((m) => ({
          ...m,
          score: Math.round(m.score + Math.random() * 8),
          hr: Math.max(110, Math.min(186, Math.round(jitter(m.hr, 6)))),
        }))
      );
    }, 1400);

    // Rank shuffle every 3.5s — occasional position swaps within top-10
    const rankInterval = setInterval(() => {
      setMembers((prev) => {
        const next = [...prev];
        // swap two random adjacent positions in top-10
        const i = Math.floor(Math.random() * 9);
        [next[i], next[i + 1]] = [next[i + 1], next[i]];
        // rare: shuffle top-3 (#1 changes hands)
        if (Math.random() < 0.15) {
          [next[0], next[1]] = [next[1], next[0]];
        }
        return next.map((m, idx) => ({ ...m, rank: idx + 1 }));
      });
    }, 3500);

    return () => {
      clearInterval(hrInterval);
      clearInterval(scoreInterval);
      clearInterval(rankInterval);
    };
  }, []);

  const top = useMemo(() => members.slice(0, 10), [members]);

  return (
    <div
      role="figure"
      aria-label="Live-feeling Tiger Score leaderboard"
      style={{
        background: '#000',
        border: '1px solid rgba(255,110,31,0.28)',
        padding: '24px 24px 16px',
        fontFamily: FONT_MONO,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto auto',
          gap: '16px',
          paddingBottom: '12px',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.42)',
        }}
      >
        <span>Rank</span>
        <span>Member</span>
        <span>HR</span>
        <span>Studio</span>
        <span style={{ textAlign: 'right', color: ORANGE }}>Tiger Score</span>
      </div>

      {top.map((m, idx) => {
        const isPodium = idx < 3;
        return (
          <div
            key={m.name}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto auto auto',
              gap: '16px',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              fontSize: '13px',
              color: isPodium ? '#fff' : 'rgba(255,255,255,0.78)',
              fontVariantNumeric: 'tabular-nums',
              transition: 'background 200ms, color 200ms',
              background: idx === 0 ? 'rgba(255,110,31,0.06)' : 'transparent',
            }}
          >
            <span
              style={{
                minWidth: '28px',
                color: isPodium ? ORANGE : 'rgba(255,255,255,0.45)',
                fontSize: '12px',
                letterSpacing: '0.04em',
              }}
            >
              {String(m.rank).padStart(2, '0')}
              {idx === 0 ? ' ◆' : ''}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {m.name}
              {idx < 3 && (
                <span
                  aria-hidden
                  title="Top-3 helmet"
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '4px',
                    background: ORANGE,
                    boxShadow: `0 0 8px ${ORANGE}`,
                    opacity: 0.85,
                    display: 'inline-block',
                  }}
                />
              )}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
              <span
                aria-hidden
                className="lt-hr-pulse"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#FF4860',
                  display: 'inline-block',
                  animation:
                    'lt-hr-pulse ' + (60_000 / Math.max(m.hr, 60)).toFixed(0) + 'ms infinite',
                }}
                key={`${m.name}-${tick}`}
              />
              <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: '34px' }}>{m.hr}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <ShapeFor modality={m.modality} size={16} />
            </span>
            <span
              style={{
                color: idx === 0 ? ORANGE : '#fff',
                fontWeight: idx === 0 ? 500 : 400,
                textAlign: 'right',
                minWidth: '72px',
              }}
            >
              {m.score.toLocaleString()}
            </span>
          </div>
        );
      })}

      {/* Status line — "LIVE" indicator */}
      <div
        style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#C7FF1F',
              boxShadow: '0 0 8px #C7FF1F',
              display: 'inline-block',
            }}
          />
          Live · Bangkok flagship
        </span>
        <span>Top 10 of 20 active</span>
      </div>
    </div>
  );
}
