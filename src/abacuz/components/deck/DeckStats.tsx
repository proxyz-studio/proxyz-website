/* ─── DeckStats — big headline figures (market stats) ─────────────── */

import type { DeckStat } from '../../../content/abacuz/deck';
import type { Lang } from '../../types';
import { GOLD } from '../../theme';
import { RevealStack } from '../../../components/Reveal';

export function DeckStats({
  stats,
  lang,
  bodyColor,
  headFont,
}: {
  stats: DeckStat[];
  lang: Lang;
  bodyColor: string;
  headFont: string;
}) {
  return (
    <RevealStack
      step={80}
      startDelay={60}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'clamp(32px, 5vw, 64px)',
        margin: '48px 0 0 0',
        alignItems: 'flex-end',
      }}
    >
      {stats.map((stat) => (
        <div key={stat.value} style={{ textAlign: 'center', minWidth: '120px' }}>
          <p
            style={{
              fontFamily: headFont,
              fontSize: 'clamp(40px, 6vw, 76px)',
              fontWeight: 500,
              lineHeight: 1,
              color: GOLD,
              margin: '0 0 10px 0',
            }}
          >
            {stat.value}
          </p>
          <p
            style={{
              fontFamily: 'var(--deck-font-label, "Hanken Grotesk", sans-serif)',
              fontSize: '13px',
              letterSpacing: '0.04em',
              lineHeight: 1.45,
              color: bodyColor,
              margin: 0,
              maxWidth: '160px',
            }}
          >
            {stat.caption[lang]}
          </p>
        </div>
      ))}
    </RevealStack>
  );
}
