/* ─── DeckTimeline — roadmap phase strip ──────────────────────────── */

import type { DeckPhase } from '../../../content/abacuz/deck';
import type { Lang } from '../../types';
import type { Palette } from './palette';
import { GOLD } from '../../theme';
import { RevealStack } from '../../../components/Reveal';

export function DeckTimeline({
  phases,
  lang,
  palette,
  headFont,
}: {
  phases: DeckPhase[];
  lang: Lang;
  palette: Palette;
  headFont: string;
}) {
  return (
    <RevealStack
      step={70}
      startDelay={80}
      style={{
        display: 'grid',
        /* 5 phases side-by-side on desktop, wrap gracefully on smaller screens */
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0',
        margin: '40px 0 0 0',
        position: 'relative',
      }}
    >
      {phases.map((ph, i) => (
        <div
          key={ph.phase.en}
          style={{
            padding: '20px 20px 24px',
            borderTop: `2px solid ${GOLD}`,
            borderRight: i < phases.length - 1 ? `1px solid ${palette.cardBorder}` : undefined,
            position: 'relative',
          }}
        >
          {/* Gold dot at the top rule intersection */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-5px',
              left: '20px',
              width: '8px',
              height: '8px',
              background: GOLD,
              borderRadius: '50%',
            }}
          />
          <p
            style={{
              fontFamily: headFont,
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: 1.25,
              color: palette.headline,
              margin: '0 0 10px 0',
            }}
          >
            {ph.phase[lang]}
          </p>
          <p
            style={{
              fontFamily: 'var(--deck-font-body, "Hanken Grotesk", sans-serif)',
              fontSize: '14px',
              lineHeight: 1.6,
              color: palette.bodyColor,
              margin: 0,
            }}
          >
            {ph.body[lang]}
          </p>
        </div>
      ))}
    </RevealStack>
  );
}
