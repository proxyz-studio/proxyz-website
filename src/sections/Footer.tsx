import { Link } from 'react-router-dom';
import { footerConfig } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';
import { ProxyzMark, withProxyzMark } from '../components/ProxyzMark';

const LEGAL_LINK_STYLE: React.CSSProperties = {
  color: '#0A0A0A',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(0,0,0,0.6)',
  paddingBottom: '1px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

const LEGAL_DIVIDER_STYLE: React.CSSProperties = {
  opacity: 0.45,
  userSelect: 'none',
};

export default function Footer() {
  const { locale } = useLocale();
  const left = useBilingual(footerConfig.left);
  const right = useBilingual(footerConfig.right);
  const showBadge = anyFallback(locale, footerConfig.left, footerConfig.right);
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: '#F2F2F2',
        color: '#0A0A0A',
        borderTop: '1px solid #000',
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 400,
      }}
    >
      <div
        className="footer-grid"
        style={{
          padding: '32px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '32px',
          alignItems: 'center',
          fontSize: '12px',
          letterSpacing: '0.05em',
        }}
      >
        <span style={{ textTransform: 'uppercase' }}>
          {withProxyzMark(left, 'footer-left')}
          <FallbackBadge show={showBadge} />
        </span>

        <div style={{ display: 'flex', gap: '24px', justifySelf: 'center' }}>
          <a
            href={footerConfig.email.href}
            style={{
              color: 'var(--accent-pink)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--accent-pink)',
              paddingBottom: '2px',
            }}
          >
            {footerConfig.email.label}
          </a>
          <a
            href={footerConfig.linkedin.href}
            style={{
              color: '#0A0A0A',
              textDecoration: 'none',
              borderBottom: '1px solid #000',
              paddingBottom: '2px',
              textTransform: 'uppercase',
            }}
          >
            {footerConfig.linkedin.label}
          </a>
        </div>

        <span style={{ justifySelf: 'end', textTransform: 'uppercase' }}>
          {withProxyzMark(right, 'footer-right')}
        </span>
      </div>

      <div
        className="footer-legal"
        style={{
          borderTop: '1px solid rgba(0,0,0,0.12)',
          padding: '14px 40px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px 20px',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.72)',
        }}
      >
        <span>© {year} <ProxyzMark /> Studio</span>
        <span style={LEGAL_DIVIDER_STYLE}>·</span>
        <Link to="/privacy" style={LEGAL_LINK_STYLE}>
          Privacy
        </Link>
        <span style={LEGAL_DIVIDER_STYLE}>·</span>
        <Link to="/terms" style={LEGAL_LINK_STYLE}>
          Terms
        </Link>
      </div>
    </footer>
  );
}
