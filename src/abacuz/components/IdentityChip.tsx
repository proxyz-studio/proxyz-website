/* ─── IdentityChip — who's here prompt / identity badge ─────────────── */
/* Shown in the shell header only when capture is available.
 * Null identity → small "Who's here?" prompt with Tew / Khun Joy buttons.
 * Set identity → compact chip "You: Tew" / "You: คุณจอย" + switch affordance.
 * Bilingual via lang prop.
 */

import type { Lang, CollabAuthor } from '../types';
import { NAVY, GOLD, STONE, RULE, INK, FONT_BODY, FONT_LABEL } from '../theme';

type Props = {
  lang: Lang;
  identity: CollabAuthor | null;
  setIdentity: (a: CollabAuthor) => void;
};

const AUTHOR_LABEL: Record<CollabAuthor, Record<Lang, string>> = {
  tew: { en: 'Tew', th: 'Tew' },
  joy: { en: 'Khun Joy', th: 'คุณจอย' },
};

export function IdentityChip({ lang, identity, setIdentity }: Props) {
  if (identity === null) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: INK,
            opacity: 0.65,
            whiteSpace: 'nowrap',
          }}
        >
          {lang === 'th' ? 'คุณคือใคร?' : "Who's here?"}
        </span>
        {(['tew', 'joy'] as CollabAuthor[]).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setIdentity(a)}
            style={{
              fontFamily: FONT_LABEL,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: NAVY,
              background: STONE,
              border: `1px solid ${RULE}`,
              padding: '4px 10px',
              borderRadius: '2px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 140ms ease, border-color 140ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = GOLD;
              e.currentTarget.style.borderColor = GOLD;
              e.currentTarget.style.color = NAVY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = STONE;
              e.currentTarget.style.borderColor = RULE;
              e.currentTarget.style.color = NAVY;
            }}
          >
            {AUTHOR_LABEL[a][lang]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0,
        fontFamily: FONT_BODY,
        fontSize: '12px',
        color: INK,
      }}
    >
      <span style={{ opacity: 0.6 }}>
        {lang === 'th' ? 'คุณ:' : 'You:'}
      </span>
      <span
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: NAVY,
          background: GOLD,
          padding: '3px 8px',
          borderRadius: '2px',
        }}
      >
        {AUTHOR_LABEL[identity][lang]}
      </span>
      <button
        type="button"
        onClick={() => {
          const other: CollabAuthor = identity === 'tew' ? 'joy' : 'tew';
          setIdentity(other);
        }}
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '10px',
          letterSpacing: '0.1em',
          color: INK,
          opacity: 0.5,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
          textDecoration: 'underline',
        }}
        title={lang === 'th' ? 'เปลี่ยนตัวตน' : 'Switch identity'}
      >
        {lang === 'th' ? 'เปลี่ยน' : 'switch'}
      </button>
    </div>
  );
}
