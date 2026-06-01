/* ─── DeckPoints — responsive grid of labelled point cards ────────── */

import type { DeckPoint } from '../../../content/abacuz/deck';
import type { Lang } from '../../types';
import type { Palette } from './palette';
import { RevealStack } from '../../../components/Reveal';

export function DeckPoints({
  points,
  lang,
  palette,
  headFont,
}: {
  points: DeckPoint[];
  lang: Lang;
  palette: Palette;
  headFont: string;
}) {
  return (
    <RevealStack
      step={60}
      startDelay={80}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        margin: '40px 0 0 0',
      }}
    >
      {points.map((pt) => (
        <div
          key={pt.label.en}
          style={{
            border: `1px solid ${palette.cardBorder}`,
            background: palette.cardBg,
            padding: '24px 26px',
            borderRadius: '2px',
          }}
        >
          <p
            style={{
              fontFamily: headFont,
              fontSize: '20px',
              fontWeight: 500,
              lineHeight: 1.2,
              color: palette.cardLabel,
              margin: '0 0 10px 0',
            }}
          >
            {pt.label[lang]}
          </p>
          <p
            style={{
              fontFamily: 'var(--deck-font-body, "Hanken Grotesk", sans-serif)',
              fontSize: '15.5px',
              lineHeight: 1.65,
              color: palette.bodyColor,
              margin: 0,
            }}
          >
            {pt.detail[lang]}
          </p>
        </div>
      ))}
    </RevealStack>
  );
}
