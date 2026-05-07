import { studioOSConfig } from '../config';

export default function StudioOS() {
  if (!studioOSConfig.heading) {
    return null;
  }

  return (
    <section
      id="studio-os"
      style={{
        background: '#ffffff',
        color: '#000000',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
        borderTop: '1px solid #000',
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
          {studioOSConfig.sectionLabel}
        </p>

        <h2
          style={{
            fontSize: 'clamp(36px, 4.4vw, 60px)',
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            margin: '0 0 56px 0',
            maxWidth: '24ch',
            textWrap: 'balance',
          }}
        >
          {studioOSConfig.heading}
        </h2>

        <p
          style={{
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: 1.65,
            margin: '0 0 48px 0',
            maxWidth: '64ch',
          }}
        >
          {studioOSConfig.lead}
        </p>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 48px 0',
            borderTop: '1px solid #000',
          }}
        >
          {studioOSConfig.list.map((item, index) => (
            <li
              key={index}
              style={{
                fontSize: '15px',
                fontWeight: 400,
                lineHeight: 1.55,
                padding: '20px 0',
                borderBottom: '1px solid #000',
              }}
            >
              {item}
            </li>
          ))}
        </ul>

        <p
          style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 1.7,
            margin: 0,
            maxWidth: '64ch',
            color: 'rgba(0,0,0,0.7)',
          }}
        >
          {studioOSConfig.closing}
        </p>
      </div>
    </section>
  );
}
