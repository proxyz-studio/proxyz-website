/* ─── DeckZone — capital-raise-style product deck ──────────────────── */
/*
 * Renders all 9 DECK sections as full-bleed vertical panels.
 * Design target: immersive, bigger type, more drama than the chapter zone —
 * but still restrained ABACUZ editorial-premium (navy / gold / ivory only,
 * no neon, no gradient text).
 *
 * Panel anatomy:
 *   surface (navy | ivory | stone) → full-bleed background
 *   eyebrow  → FONT_LABEL 12px uppercase gold letter-spaced
 *   headline → headFont clamp(34px,5.2vw,66px) large, w-500
 *   lede     → headFont italic clamp(19px,2.4vw,26px)
 *   body     → FONT_BODY 17px/1.7
 *   points   → auto-fit 2-col grid of cards
 *   stats    → horizontal row of big gold figures
 *   phases   → 5-column timeline with gold top-rule
 *   pull     → left-border pull-quote in italic headFont
 *
 * Cover + Ask headlines are wrapped in a subtle HeadlineHalo for atmosphere.
 */

import type { Lang } from '../types';
import { FONT_HEAD, FONT_HEAD_TH } from '../theme';
import { DECK } from '../../content/abacuz/deck';
import { surfacePalette } from '../components/deck/palette';
import {
  PanelColumn,
  Eyebrow,
  DeckHeadline,
  DeckLede,
  DeckBody,
  DeckPull,
} from '../components/deck/DeckPanel';
import { DeckPoints } from '../components/deck/DeckPoints';
import { DeckStats } from '../components/deck/DeckStats';
import { DeckTimeline } from '../components/deck/DeckTimeline';
import { DeckPortrait } from '../components/deck/DeckPortrait';

export function DeckZone({ lang }: { lang: Lang }) {
  const headFont = lang === 'th' ? FONT_HEAD_TH : FONT_HEAD;

  return (
    <main
      /* Suppress top-margin from the AbacuzShell's sticky header */
      style={{ outline: 'none' }}
      aria-label={lang === 'th' ? 'สไลด์นำเสนอผลิตภัณฑ์' : 'Product deck'}
    >
      {DECK.map((section) => {
        const palette = surfacePalette(section.surface);

        /* Vertical padding: cover + ask get near-full-height; rest get
           generous but not quite full-screen padding. */
        const isCoverOrAsk = section.kind === 'cover' || section.kind === 'ask';
        const vPad = isCoverOrAsk
          ? 'clamp(100px, 14vh, 180px)'
          : 'clamp(80px, 12vh, 160px)';

        return (
          <section
            key={section.id}
            id={`deck-${section.id}`}
            style={{
              background: palette.bg,
              paddingTop: vPad,
              paddingBottom: vPad,
              position: 'relative',
              overflow: 'hidden',
              /* Ensure full viewport width edge-to-edge */
              width: '100%',
            }}
          >
            <PanelColumn>

              {/* Eyebrow */}
              <Eyebrow text={section.eyebrow[lang]} />

              {/* Headline — with halo on cover + ask */}
              <DeckHeadline
                text={section.headline[lang]}
                color={palette.headline}
                headFont={headFont}
                withHalo={isCoverOrAsk}
              />

              {/* Lede */}
              {section.lede && (
                <DeckLede
                  text={section.lede[lang]}
                  color={palette.ledeColor}
                  headFont={headFont}
                />
              )}

              {/* Portrait — e.g. the founder photo on the partnership panel */}
              {section.image && (
                <DeckPortrait
                  src={section.image.src}
                  alt={section.image.alt[lang]}
                  caption={section.image.caption?.[lang]}
                  captionColor={palette.bodyColor}
                />
              )}

              {/* Body paragraphs */}
              {section.body && section.body[lang].length > 0 && (
                <DeckBody
                  lines={section.body[lang]}
                  color={palette.bodyColor}
                />
              )}

              {/* Stats row */}
              {section.stats && section.stats.length > 0 && (
                <DeckStats
                  stats={section.stats}
                  lang={lang}
                  bodyColor={palette.bodyColor}
                  headFont={headFont}
                />
              )}

              {/* Points grid */}
              {section.points && section.points.length > 0 && (
                <DeckPoints
                  points={section.points}
                  lang={lang}
                  palette={palette}
                  headFont={headFont}
                />
              )}

              {/* Roadmap timeline */}
              {section.phases && section.phases.length > 0 && (
                <DeckTimeline
                  phases={section.phases}
                  lang={lang}
                  palette={palette}
                  headFont={headFont}
                />
              )}

              {/* Pull-quote */}
              {section.pull && (
                <DeckPull
                  text={section.pull[lang]}
                  headlineColor={palette.headline}
                  headFont={headFont}
                />
              )}

            </PanelColumn>
          </section>
        );
      })}
    </main>
  );
}
