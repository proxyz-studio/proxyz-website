/* PartnerSubNav — sticky in-page section navigation for partner pages.
 *
 * Sits directly under the main <Nav /> at top:82px so it pins right below.
 * Mirrors the SubNav pattern used inside /ventures/<slug> (VentureDetail.tsx)
 * but exported as a shared component because two or more partner pages need it
 * (LAZY-TIGER, FAST-FIX, future).
 *
 * Section anchors are plain href="#id" — pages own which section ids exist.
 * The last item commonly links to an external doc (cost overview, etc.); pass
 * `external: true` on those to render as a full-navigation <a> with no border.
 */

import { Link } from 'react-router-dom';

const FONT_MONO = "'IBM Plex Mono', monospace";
const PROXYZ_PINK = '#FF4193';

export interface PartnerSubNavSection {
  /** Either an in-page anchor id (renders as href="#id") or an absolute URL when external. */
  id: string;
  label: string;
  /** When true, treats `id` as a full URL and renders as a regular link (no #). */
  external?: boolean;
}

interface Props {
  /** Display name of the partner (e.g. "LAZY-TIGER"). */
  name: string;
  /** Section anchors plus optional external links. */
  sections: ReadonlyArray<PartnerSubNavSection>;
  /** Back-link href (defaults to /pipeline since both LAZY-TIGER and FAST-FIX use that). */
  backHref?: string;
  /** Back-link label (defaults to "Pipeline"). */
  backLabel?: string;
  /** Accent color used for the hover underline. Defaults to PROXYZ pink. */
  accent?: string;
}

export default function PartnerSubNav({
  name,
  sections,
  backHref = '/pipeline',
  backLabel = 'Pipeline',
  accent = PROXYZ_PINK,
}: Props) {
  return (
    <nav
      aria-label={`${name} sections`}
      style={{
        position: 'sticky',
        // 82px clears the fixed main <Nav> (padding 20 + logo 42 + padding 20).
        top: '82px',
        zIndex: 30,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 40px',
      }}
      className="partner-subnav"
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          gap: '28px',
          alignItems: 'center',
          flexWrap: 'wrap',
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <Link
          to={backHref}
          style={{
            color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none',
            marginRight: '8px',
          }}
        >
          ← {backLabel}
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{name}</span>
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
        {sections.map((s) => (
          <a
            key={s.id}
            href={s.external ? s.id : `#${s.id}`}
            style={{
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
              paddingBottom: '1px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#F2F2F2';
              (e.currentTarget as HTMLElement).style.borderBottomColor = accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
              (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent';
            }}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
