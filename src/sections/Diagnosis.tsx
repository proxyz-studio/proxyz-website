import { diagnosisConfig } from '../config';

export default function Diagnosis() {
  if (!diagnosisConfig.heading && diagnosisConfig.paragraphs.length === 0) {
    return null;
  }

  return (
    <section
      id="diagnosis"
      className="section-mobile"
      style={{
        background: '#ffffff',
        color: '#000000',
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
          {diagnosisConfig.sectionLabel}
        </p>

        <h2
          style={{
            fontSize: 'clamp(32px, 3.6vw, 48px)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            margin: '0 0 56px 0',
            maxWidth: '24ch',
            textWrap: 'balance',
          }}
        >
          {diagnosisConfig.heading}
        </h2>

        <div style={{ maxWidth: '64ch' }}>
          {diagnosisConfig.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              style={{
                fontSize: '15px',
                fontWeight: 400,
                lineHeight: 1.7,
                margin: index === 0 ? '0 0 24px 0' : '0',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
