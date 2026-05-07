import { buildWithConfig } from '../config';

export default function BuildWith() {
  if (!buildWithConfig.heading) {
    return null;
  }

  return (
    <section
      id="build-with"
      style={{
        background: '#000',
        color: '#fff',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        <p
          style={{
            fontSize: '12px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--accent-pink)',
            margin: '0 0 64px 0',
          }}
        >
          {buildWithConfig.sectionLabel}
        </p>

        <h2
          style={{
            fontSize: 'clamp(32px, 3.8vw, 52px)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            margin: '0 0 56px 0',
            maxWidth: '24ch',
            textWrap: 'balance',
          }}
        >
          {buildWithConfig.heading}
        </h2>

        <div style={{ maxWidth: '64ch', marginBottom: '48px' }}>
          {buildWithConfig.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              style={{
                fontSize: '15px',
                fontWeight: 400,
                lineHeight: 1.7,
                margin: index === 0 ? '0 0 24px 0' : '0',
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <a
          href={buildWithConfig.cta.href}
          style={{
            fontSize: '12px',
            fontWeight: 400,
            color: '#fff',
            background: 'var(--accent-pink)',
            textTransform: 'uppercase',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            padding: '14px 26px',
            borderRadius: '999px',
            display: 'inline-block',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.opacity = '0.85';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.opacity = '1';
          }}
        >
          {buildWithConfig.cta.label}
        </a>
      </div>
    </section>
  );
}
