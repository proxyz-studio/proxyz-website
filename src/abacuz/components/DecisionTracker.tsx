import { useMemo } from 'react';
import type { Lang } from '../types';
import { NAVY, IVORY, INK, STONE, RULE, FONT_HEAD, FONT_BODY, FONT_LABEL } from '../theme';
import { DECISIONS, STATUS_LABEL, STATUS_COLOR } from '../../content/abacuz/decisions';
import { CHAPTERS } from '../../content/abacuz/chapters';
import { StatusPill } from './StatusPill';

export function DecisionTracker({ lang }: { lang: Lang }) {
  const counts = useMemo(() => {
    return {
      locked: DECISIONS.filter((d) => d.status === 'locked').length,
      discuss: DECISIONS.filter((d) => d.status === 'discuss').length,
      joy: DECISIONS.filter((d) => d.status === 'joy').length,
    };
  }, []);

  return (
    <aside
      aria-label={lang === 'th' ? 'การติดตามการตัดสินใจ' : 'Decision tracker'}
      className="abacuz-tracker"
      style={{
        background: IVORY,
        border: `1px solid ${RULE}`,
        padding: '28px 26px',
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
          margin: '0 0 18px 0',
        }}
      >
        {lang === 'th' ? 'การตัดสินใจ · 12 รายการ' : 'Decisions · 12 items'}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        {(['locked', 'discuss', 'joy'] as const).map((s) => (
          <div
            key={s}
            style={{
              padding: '12px 10px',
              background: STONE,
              borderRadius: '2px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: FONT_HEAD,
                fontSize: '32px',
                fontWeight: 500,
                lineHeight: 1,
                color: STATUS_COLOR[s],
                marginBottom: '6px',
              }}
            >
              {counts[s]}
            </div>
            <div
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: INK,
                opacity: 0.7,
              }}
            >
              {STATUS_LABEL[s][lang]}
            </div>
          </div>
        ))}
      </div>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {DECISIONS.map((d) => (
          <li key={d.id}>
            <a
              href={`#chapter-${CHAPTERS[d.chapter - 1].id}`}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                paddingBottom: '12px',
                borderBottom: `1px dashed ${RULE}`,
              }}
            >
              <div style={{ marginBottom: '6px' }}>
                <StatusPill status={d.status} lang={lang} />
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: INK,
                }}
              >
                {d.label[lang]}
              </div>
              <div
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: NAVY,
                  opacity: 0.55,
                  marginTop: '6px',
                }}
              >
                {lang === 'th' ? 'บทที่ ' : 'Ch '}{d.chapter} · {CHAPTERS[d.chapter - 1].title[lang]}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
