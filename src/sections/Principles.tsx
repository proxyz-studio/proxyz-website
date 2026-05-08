import { principlesConfig } from '../config';

export default function Principles() {
  if (principlesConfig.items.length === 0) {
    return null;
  }

  return (
    <section
      id="principles"
      className="section-mobile"
      style={{
        background: '#000',
        color: '#fff',
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
          {principlesConfig.sectionLabel}
        </p>

        <h2
          style={{
            fontSize: 'clamp(40px, 5vw, 68px)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
            margin: '0 0 80px 0',
          }}
        >
          {principlesConfig.heading}
        </h2>

        <ol
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '40px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {principlesConfig.items.map((item, index) => (
            <li
              key={index}
              style={{
                borderTop: '1px solid rgba(255,255,255,0.3)',
                paddingTop: '24px',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  letterSpacing: '0.08em',
                  color: 'var(--accent-pink)',
                  margin: '0 0 16px 0',
                }}
              >
                {item.number}
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: 1.45,
                  margin: 0,
                  textWrap: 'balance',
                }}
              >
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
