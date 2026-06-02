import type { Lang } from '../types';
import { NAVY, IVORY, INK, GOLD, RULE, FONT_BODY, FONT_LABEL } from '../theme';
import { CHAPTERS } from '../../content/abacuz/chapters';

export function ChapterNav({ lang }: { lang: Lang }) {
  return (
    <nav
      aria-label={lang === 'th' ? 'สารบัญบท' : 'Chapter index'}
      className="abacuz-chapnav"
      style={{
        background: IVORY,
        border: `1px solid ${RULE}`,
        padding: '20px 22px',
        fontFamily: FONT_BODY,
        color: INK,
      }}
    >
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: NAVY,
          margin: '0 0 14px 0',
        }}
      >
        {lang === 'th' ? 'สารบัญ' : 'Index'}
      </p>
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          counterReset: 'chap',
        }}
      >
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <a
              href={`#chapter-${c.id}`}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'baseline',
                textDecoration: 'none',
                color: INK,
                padding: '4px 0',
                fontFamily: FONT_BODY,
                fontSize: '13px',
                lineHeight: 1.4,
                borderBottom: `1px solid transparent`,
                transition: 'color 160ms ease, border-color 160ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = GOLD;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = INK;
              }}
            >
              <span
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  color: GOLD,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                {c.num}
              </span>
              <span>{c.title[lang]}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
