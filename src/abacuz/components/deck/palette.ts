/* ─── Deck palette utilities ────────────────────────────────────────
 * Non-component helpers. Separated so DeckPanel.tsx can be a pure
 * component file (satisfies react-refresh/only-export-components).
 */

import type { DeckSection } from '../../../content/abacuz/deck';
import { NAVY, GOLD, IVORY, STONE, INK, RULE } from '../../theme';

export type Palette = {
  bg: string;
  headline: string;
  eyebrowColor: string;
  bodyColor: string;
  ledeColor: string;
  cardBorder: string;
  cardBg: string;
  cardLabel: string;
  rule: string;
};

/** Derive the color palette for a panel from its surface token. */
export function surfacePalette(surface: DeckSection['surface']): Palette {
  if (surface === 'navy') {
    return {
      bg: NAVY,
      headline: IVORY,
      eyebrowColor: GOLD,
      bodyColor: `rgba(246,241,231,0.80)`,
      ledeColor: `rgba(246,241,231,0.88)`,
      cardBorder: `rgba(201,162,75,0.28)`,
      cardBg: `rgba(246,241,231,0.05)`,
      cardLabel: GOLD,
      rule: `rgba(201,162,75,0.40)`,
    };
  }
  // ivory or stone — both are light surfaces
  return {
    bg: surface === 'stone' ? STONE : IVORY,
    headline: NAVY,
    eyebrowColor: GOLD,
    bodyColor: `rgba(28,36,51,0.78)`,
    ledeColor: INK,
    cardBorder: RULE,
    cardBg: `rgba(28,36,51,0.03)`,
    cardLabel: NAVY,
    rule: `rgba(28,36,51,0.18)`,
  };
}
