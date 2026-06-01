import type { Chapter, Lang } from '../types';
import { NAVY, INK, GOLD, RULE, FONT_WORD, FONT_HEAD, FONT_HEAD_TH, FONT_BODY, FONT_LABEL } from '../theme';
import { ComplianceCalendar } from './insets/ComplianceCalendar';
import { NumberChecklist } from './insets/NumberChecklist';
import { BrandIdentity } from './insets/BrandIdentity';

export function ChapterSection({ chapter, lang, index }: { chapter: Chapter; lang: Lang; index: number }) {
  const headFont = lang === 'th' ? FONT_HEAD_TH : FONT_HEAD;
  return (
    <article
      id={`chapter-${chapter.id}`}
      className="abacuz-chapter"
      style={{
        padding: '96px 0',
        borderTop: index === 0 ? 'none' : `1px solid ${RULE}`,
        position: 'relative',
      }}
    >
      {/* Big outlined chapter number — top-right marginalia */}
      <div
        aria-hidden
        className="abacuz-chapter-marginalia"
        style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          fontFamily: FONT_WORD,
          fontSize: 'clamp(120px, 16vw, 220px)',
          lineHeight: 0.85,
          color: 'transparent',
          WebkitTextStroke: `2px ${GOLD}`,
          opacity: 0.18,
          letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        {chapter.num}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>
        <p
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: GOLD,
            margin: '0 0 18px 0',
          }}
        >
          {chapter.eyebrow[lang]}
        </p>
        <h2
          style={{
            fontFamily: headFont,
            fontSize: 'clamp(34px, 4.6vw, 56px)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.005em',
            color: NAVY,
            margin: '0 0 14px 0',
            textWrap: 'balance',
          }}
        >
          {chapter.title[lang]}
        </h2>
        <p
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '12px',
            letterSpacing: '0.06em',
            color: INK,
            opacity: 0.55,
            margin: '0 0 36px 0',
          }}
        >
          {chapter.source[lang]}
        </p>

        {chapter.pull && (
          <blockquote
            style={{
              fontFamily: headFont,
              fontSize: 'clamp(20px, 2.4vw, 28px)',
              fontStyle: 'italic',
              fontWeight: 500,
              lineHeight: 1.35,
              color: NAVY,
              padding: '0 0 0 28px',
              borderLeft: `2px solid ${GOLD}`,
              margin: '0 0 36px 0',
              maxWidth: '46ch',
              textWrap: 'balance',
            }}
          >
            <span style={{ color: GOLD, marginRight: '4px' }}>"</span>
            {chapter.pull[lang]}
            <span style={{ color: GOLD, marginLeft: '4px' }}>"</span>
          </blockquote>
        )}

        {chapter.body[lang].map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: FONT_BODY,
              fontSize: '16.5px',
              lineHeight: 1.75,
              color: INK,
              margin: '0 0 22px 0',
              maxWidth: '62ch',
            }}
          >
            {p}
          </p>
        ))}

        {chapter.closing && (
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: '14px',
              fontStyle: 'italic',
              lineHeight: 1.7,
              color: INK,
              opacity: 0.7,
              margin: '32px 0 0 0',
              maxWidth: '62ch',
            }}
          >
            {chapter.closing[lang]}
          </p>
        )}
      </div>

      {chapter.inset === 'compliance-calendar' && <ComplianceCalendar lang={lang} />}
      {chapter.inset === 'number-checklist' && <NumberChecklist lang={lang} />}
      {chapter.inset === 'brand-identity' && <BrandIdentity lang={lang} />}
    </article>
  );
}
