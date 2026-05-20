/* Three-tier loyalty ladder.
   Cub (bronze) / Tiger (pink) / Black Tiger (lime).
   Stepped visual — each tier card sits slightly higher than the last
   so the eye reads progression. Each rung illuminates as it enters view. */

import type { LoyaltyTier } from '../../config';
import Reveal from '../Reveal';

const FONT_MONO = "'IBM Plex Mono', monospace";
const PINK = '#FF4193';
const LIME = '#D2FF3B';
const BRONZE = '#C77C3F';

function toneColor(tone: LoyaltyTier['tone']) {
  switch (tone) {
    case 'bronze':
      return BRONZE;
    case 'pink':
      return PINK;
    case 'lime':
      return LIME;
  }
}

function TierColumn({ tier, index, total }: { tier: LoyaltyTier; index: number; total: number }) {
  const color = toneColor(tier.tone);
  const isTop = index === total - 1;
  // Stepped layout: top tier is tallest, bottom tier shortest. Visual progression.
  const minHeight = 280 + index * 36;

  return (
    <Reveal delay={index * 120}>
      <article
        style={{
          position: 'relative',
          background: '#000',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: `3px solid ${color}`,
          padding: '32px 28px 28px',
          minHeight: `${minHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          transition: 'transform 240ms cubic-bezier(0.2, 0.7, 0.1, 1)',
          boxShadow: isTop ? `0 0 36px rgba(210,255,59,0.16)` : 'none',
          // Stepped: each card sits slightly higher than the previous
          marginTop: `${(total - 1 - index) * 18}px`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Tier 0{index + 1}
          </span>
          {isTop && (
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: color,
                border: `1px solid ${color}`,
                padding: '4px 10px',
                borderRadius: '999px',
              }}
            >
              Apex
            </span>
          )}
        </div>

        <h3
          style={{
            fontFamily: FONT_MONO,
            fontSize: 'clamp(26px, 2.4vw, 36px)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            color: color,
            margin: '0',
            lineHeight: 1.05,
          }}
        >
          {tier.name}
        </h3>

        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '13px',
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.66)',
            margin: 0,
          }}
        >
          {tier.blurb}
        </p>

        <ul
          style={{
            margin: '8px 0 0 0',
            padding: '14px 0 0 0',
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {tier.perks.map((p) => (
            <li
              key={p}
              style={{
                fontFamily: FONT_MONO,
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.84)',
                paddingLeft: '18px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  color: color,
                  fontSize: '12px',
                }}
              >
                →
              </span>
              {p}
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}

export default function TierLadder({ tiers }: { tiers: LoyaltyTier[] }) {
  return (
    <div
      className="lt-tier-ladder"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${tiers.length}, 1fr)`,
        gap: '20px',
        alignItems: 'end',
      }}
    >
      {tiers.map((t, i) => (
        <TierColumn key={t.name} tier={t} index={i} total={tiers.length} />
      ))}
    </div>
  );
}
