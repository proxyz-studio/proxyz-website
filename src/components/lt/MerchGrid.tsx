/* Vizcom-style 3-stage merch reveal.
   Default: finished mockup. Hover 1s: AI render. Hover 2s: rough sketch.
   Three layered SVG visuals per tile, CSS opacity transitions.
   Placeholder geometry — Tew swaps with real Vizcom outputs once drops are designed. */

import { useState } from 'react';

const FONT_MONO = "'IBM Plex Mono', monospace";
const ORANGE = '#FF4193'; // PROXYZ pink (kept the name for diff-friendliness)
const COPPER_1 = '#FF4193'; // pink (was copper)
const COPPER_2 = '#D2FF3B'; // neon lime (was copper highlight)

type Stage = 'final' | 'render' | 'sketch';

/* Generic "garment silhouette" SVG. The three stages render the same geometry at
   different fidelity tiers so the visual reveal feels like Vizcom rewinding. */
function GarmentSilhouette({ stage, seed }: { stage: Stage; seed: number }) {
  const variants = [
    // Tee
    'M40,60 L80,30 L160,30 L200,60 L180,80 L160,70 L160,210 L80,210 L80,70 L60,80 Z',
    // Hoodie
    'M30,80 L80,20 L160,20 L210,80 L200,110 L170,100 Q160,160 165,210 L75,210 Q80,160 70,100 L40,110 Z M110,40 Q120,55 130,40',
    // Jacket
    'M40,70 L75,30 L120,30 L130,55 L140,30 L165,30 L200,70 L195,210 L130,210 L120,80 L110,210 L45,210 Z',
    // Singlet
    'M65,40 L100,30 L140,30 L175,40 L160,70 L165,210 L75,210 L80,70 Z',
    // Long-sleeve
    'M30,70 L70,30 L170,30 L210,70 L210,200 L175,210 L165,80 L165,210 L75,210 L75,80 L65,210 L30,200 Z',
    // Tote
    'M55,80 L70,40 L170,40 L185,80 L180,220 L60,220 Z M90,50 Q120,20 150,50',
    // Cap
    'M40,140 Q120,60 200,140 L200,170 L40,170 Z M120,170 L120,200 L130,210 L110,210 Z',
    // Shorts
    'M55,60 L185,60 L180,140 L160,210 L130,210 L120,150 L110,210 L80,210 L60,140 Z',
    // Anorak
    'M40,80 L75,30 L165,30 L200,80 L210,220 L30,220 Z M120,40 L120,140',
  ];
  const path = variants[seed % variants.length];

  if (stage === 'sketch') {
    return (
      <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden="true">
        <path
          d={path}
          fill="none"
          stroke="rgba(255,110,31,0.55)"
          strokeWidth="1"
          strokeDasharray="3 2"
          strokeLinejoin="round"
        />
        {/* Sketch lines + construction marks */}
        <line x1="20" y1="120" x2="220" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="2 4" />
        <line x1="120" y1="20" x2="120" y2="220" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="2 4" />
        <text x="20" y="234" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily={FONT_MONO}>
          v0 · 2026.06
        </text>
      </svg>
    );
  }

  if (stage === 'render') {
    return (
      <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id={`render-grad-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
        </defs>
        <path d={path} fill={`url(#render-grad-${seed})`} stroke={ORANGE} strokeWidth="2" opacity="0.85" />
        {/* Coarser fill texture — feels AI-render-stage */}
        <path d={path} fill="rgba(255,110,31,0.04)" />
      </svg>
    );
  }

  // final
  return (
    <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={`final-grad-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#222" />
          <stop offset="60%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
      </defs>
      <path d={path} fill={`url(#final-grad-${seed})`} stroke={ORANGE} strokeWidth="1.5" />
      {/* Tiger Helmet badge — center motif */}
      <g transform="translate(110, 110)">
        <circle r="14" fill="none" stroke={ORANGE} strokeWidth="1.2" opacity="0.7" />
        <path d="M -6 -2 L -3 -8 L 0 -2 L 3 -8 L 6 -2" fill="none" stroke={ORANGE} strokeWidth="1.2" opacity="0.85" />
      </g>
      {/* Stitch lines */}
      <line x1="60" y1="80" x2="180" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="1 2" />
    </svg>
  );
}

function MerchTile({ label, seed }: { label: string; seed: number }) {
  const [hoverStart, setHoverStart] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>('final');

  function onEnter() {
    const start = Date.now();
    setHoverStart(start);
    setStage('final');
    // After 1s switch to render, after 2s switch to sketch.
    const t1 = window.setTimeout(() => setStage('render'), 1000);
    const t2 = window.setTimeout(() => setStage('sketch'), 2000);
    // Stash timers for cleanup via element data
    (onEnter as unknown as { timers?: number[] }).timers = [t1, t2];
  }
  function onLeave() {
    const timers = (onEnter as unknown as { timers?: number[] }).timers;
    if (timers) timers.forEach(clearTimeout);
    setHoverStart(null);
    setStage('final');
  }

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        background: '#000',
        border: '1px solid rgba(255,110,31,0.18)',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 200ms',
      }}
      onFocus={onEnter}
      onBlur={onLeave}
      tabIndex={0}
      aria-label={`${label} — hover to see design progression`}
    >
      {/* Three layered visuals, opacity controlled by stage */}
      {(['sketch', 'render', 'final'] as Stage[]).map((s) => (
        <div
          key={s}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            padding: '24px',
            opacity: stage === s ? 1 : 0,
            transition: 'opacity 400ms cubic-bezier(0.2, 0.7, 0.1, 1)',
          }}
        >
          <GarmentSilhouette stage={s} seed={seed} />
        </div>
      ))}

      {/* Stage indicator */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: FONT_MONO,
          fontSize: '9px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
          pointerEvents: 'none',
        }}
      >
        <span>{label}</span>
        <span style={{ color: ORANGE }}>
          {stage === 'final' && '· FINAL'}
          {stage === 'render' && '· AI RENDER'}
          {stage === 'sketch' && '· SKETCH'}
        </span>
      </div>

      {/* Hover progress bar */}
      {hoverStart && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '2px',
            background: ORANGE,
            transformOrigin: 'left center',
            animation: 'lt-merch-progress 2.4s linear forwards',
          }}
        />
      )}
    </div>
  );
}

export default function MerchGrid({ items }: { items: string[] }) {
  return (
    <>
      <style>{`
        @keyframes lt-merch-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
      <div
        className="lt-merch-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0',
          border: '1px solid rgba(255,110,31,0.18)',
          background: '#000',
        }}
      >
        {items.map((label, i) => (
          <div
            key={label}
            style={{
              borderRight: (i % 3) === 2 ? 'none' : '1px solid rgba(255,110,31,0.18)',
              borderBottom: i >= 6 ? 'none' : '1px solid rgba(255,110,31,0.18)',
            }}
          >
            <MerchTile label={label} seed={i} />
          </div>
        ))}
      </div>
      <p
        style={{
          marginTop: '16px',
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.04em',
          color: 'rgba(255,255,255,0.45)',
          textAlign: 'center',
        }}
      >
        Hover a tile to reverse the AI design loop. <span style={{ color: COPPER_2 }}>Final</span>{' '}
        → <span style={{ color: COPPER_1 }}>AI render</span> → <span style={{ color: ORANGE }}>sketch.</span>
      </p>
    </>
  );
}
