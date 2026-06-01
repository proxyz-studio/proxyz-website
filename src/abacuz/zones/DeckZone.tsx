/* ─── Deck zone — placeholder ─────────────────────────────────────── */

import type { Lang } from '../types';
import { NAVY, IVORY, INK, GOLD, RULE, FONT_HEAD, FONT_HEAD_TH, FONT_LABEL } from '../theme';

export function DeckZone({ lang }: { lang: Lang }) {
  const headFont = lang === 'th' ? FONT_HEAD_TH : FONT_HEAD;
  return (
    <main
      style={{
        background: IVORY,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          textAlign: 'center',
          border: `1px solid ${RULE}`,
          padding: '64px 48px',
          background: IVORY,
        }}
      >
        <p
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: GOLD,
            margin: '0 0 20px 0',
          }}
        >
          {lang === 'th' ? 'สไลด์สำหรับนักลงทุน' : 'Product deck'}
        </p>
        <p
          style={{
            fontFamily: headFont,
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 500,
            fontStyle: 'italic',
            lineHeight: 1.25,
            color: NAVY,
            margin: '0 0 16px 0',
          }}
        >
          {lang === 'th' ? 'กำลังจัดทำ' : 'In progress'}
        </p>
        <p
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '13px',
            color: INK,
            opacity: 0.55,
            margin: 0,
            letterSpacing: '0.06em',
          }}
        >
          {lang === 'th' ? 'เร็ว ๆ นี้' : 'Coming soon'}
        </p>
      </div>
    </main>
  );
}
