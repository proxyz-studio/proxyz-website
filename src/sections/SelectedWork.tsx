import { selectedWorkConfig } from '../config';

export default function SelectedWork() {
  if (selectedWorkConfig.rows.length === 0) {
    return null;
  }

  return (
    <section
      id="selected-work"
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
          {selectedWorkConfig.sectionLabel}
        </p>

        <h2
          style={{
            fontSize: 'clamp(36px, 4.4vw, 56px)',
            fontWeight: 400,
            lineHeight: 1,
            margin: '0 0 64px 0',
          }}
        >
          {selectedWorkConfig.heading}
        </h2>

        <div
          role="table"
          style={{
            borderTop: '1px solid #000',
          }}
        >
          <div
            role="row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(140px, 180px) minmax(160px, 220px) minmax(120px, 180px) 1fr',
              gap: '32px',
              padding: '16px 0',
              borderBottom: '1px solid #000',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.55)',
            }}
          >
            <span>Year</span>
            <span>Title</span>
            <span>Role</span>
            <span>Description</span>
          </div>

          {selectedWorkConfig.rows.map((row, index) => (
            <div
              key={index}
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 180px) minmax(160px, 220px) minmax(120px, 180px) 1fr',
                gap: '32px',
                padding: '24px 0',
                borderBottom: '1px solid #000',
                fontSize: '14px',
                lineHeight: 1.55,
                alignItems: 'baseline',
              }}
            >
              <span>{row.year}</span>
              <span style={{ textTransform: 'uppercase' }}>{row.title}</span>
              <span>{row.role}</span>
              <span style={{ color: 'rgba(0,0,0,0.78)' }}>{row.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
