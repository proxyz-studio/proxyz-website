import { twoWaysConfig } from '../config';

export default function TwoWays() {
  if (twoWaysConfig.cards.length === 0) {
    return null;
  }

  return (
    <section
      id="two-ways"
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
          {twoWaysConfig.sectionLabel}
        </p>

        <h2
          style={{
            fontSize: 'clamp(28px, 3.4vw, 44px)',
            fontWeight: 400,
            lineHeight: 1.18,
            margin: '0 0 80px 0',
          }}
        >
          {twoWaysConfig.heading}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px',
          }}
        >
          {twoWaysConfig.cards.map((card, index) => (
            <div
              key={index}
              style={{
                borderTop: '1px solid #000',
                paddingTop: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {card.name}
              </h3>
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '40ch',
                }}
              >
                {card.body}
              </p>
              <a
                href={card.link.href}
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#000',
                  textDecoration: 'none',
                  borderBottom: '1px solid #000',
                  paddingBottom: '2px',
                  alignSelf: 'flex-start',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '0.6';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }}
              >
                {card.link.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
