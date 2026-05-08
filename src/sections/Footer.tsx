import { footerConfig } from '../config';

export default function Footer() {
  return (
    <footer
      className="footer-grid"
      style={{
        background: '#ffffff',
        color: '#000000',
        borderTop: '1px solid #000',
        padding: '32px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '32px',
        alignItems: 'center',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '12px',
        fontWeight: 400,
        letterSpacing: '0.05em',
      }}
    >
      <span style={{ textTransform: 'uppercase' }}>{footerConfig.left}</span>

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
            color: '#000',
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
        {footerConfig.right}
      </span>
    </footer>
  );
}
