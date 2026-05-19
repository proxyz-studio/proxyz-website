// src/components/FallbackBadge.tsx

/**
 * Small [EN] indicator rendered in a section's eyebrow when the section
 * is displaying English content in Thai mode (because Thai copy is missing).
 *
 * Pure presentational. Each section computes its own `show` boolean via
 * the anyFallback() helper from src/i18n/Bilingual.
 */
export function FallbackBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      aria-label="English shown; Thai translation not yet available"
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.5em',
        color: 'rgba(255,255,255,0.5)',
        marginLeft: '0.75em',
        verticalAlign: 'middle',
        letterSpacing: '0.08em',
      }}
    >
      [EN]
    </span>
  );
}
