// src/components/LanguageToggle.tsx
import { useLocation } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleContext';
import type { Locale } from '../i18n/Bilingual';

const INACTIVE_COLOR = 'rgba(255,255,255,0.6)';
const HOVER_COLOR = 'rgba(255,255,255,0.85)';
const ACTIVE_COLOR_VAR = 'var(--accent-pink)';

function ToggleButton({
  label,
  target,
  active,
  onClick,
}: {
  label: string;
  target: Locale;
  active: boolean;
  onClick: (next: Locale) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={target === 'en' ? 'English' : 'Thai'}
      onClick={() => onClick(target)}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = HOVER_COLOR;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = INACTIVE_COLOR;
      }}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '12px',
        fontWeight: 400,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: active ? ACTIVE_COLOR_VAR : INACTIVE_COLOR,
        transition: 'color 0.2s',
      }}
    >
      {label}
    </button>
  );
}

export default function LanguageToggle() {
  const { pathname } = useLocation();
  const { locale, setLocale } = useLocale();

  // Homepage-only in v1 (per spec). React Router v7 strips trailing
  // slash, search, and hash from `pathname` so an exact compare is safe.
  if (pathname !== '/') return null;

  return (
    <div
      role="group"
      aria-label="Language selector"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        // No marginLeft; parent .hero-nav-links flex container already
        // applies gap: 24px between siblings, matching the rest of the
        // nav cluster's rhythm.
      }}
    >
      <ToggleButton
        label="EN"
        target="en"
        active={locale === 'en'}
        onClick={setLocale}
      />
      <span
        aria-hidden="true"
        style={{
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
        }}
      >
        |
      </span>
      <ToggleButton
        label="TH"
        target="th"
        active={locale === 'th'}
        onClick={setLocale}
      />
    </div>
  );
}
