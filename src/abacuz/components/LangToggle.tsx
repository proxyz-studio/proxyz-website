import type { Lang } from '../types';
import { NAVY, IVORY, INK, FONT_LABEL } from '../theme';

export function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: 'inline-flex',
        gap: '2px',
        background: 'rgba(20,37,59,0.06)',
        borderRadius: '2px',
        padding: '3px',
        fontFamily: FONT_LABEL,
      }}
    >
      {(['th', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: lang === l ? IVORY : INK,
            background: lang === l ? NAVY : 'transparent',
            border: 'none',
            padding: '7px 14px',
            borderRadius: '1px',
            cursor: 'pointer',
            transition: 'background 180ms ease, color 180ms ease',
          }}
        >
          {l === 'th' ? 'ภาษาไทย' : 'English'}
        </button>
      ))}
    </div>
  );
}
