import { founderConfig } from '../config';

export default function Founder() {
  if (!founderConfig.heading) {
    return null;
  }

  return (
    <section
      id="founder"
      style={{
        background: '#000',
        color: '#fff',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
        }}
      >
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
          {founderConfig.sectionLabel}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 360px) 1fr',
            gap: '64px',
            alignItems: 'start',
          }}
        >
          {/*
            TODO: Replace this placeholder with the actual headshot.
            Drop the image at: public/images/tew-portrait.jpg
            Recommended size: 1200x1500 (aspect ratio 4:5).
            Then swap the placeholder div with:
              <img
                src="/images/tew-portrait.jpg"
                alt="Tew, founder of PROXYZ"
                style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', display: 'block', filter: 'grayscale(100%)' }}
              />
          */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4 / 5',
              border: '1px dashed rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 400,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
            }}
          >
            {founderConfig.imagePlaceholder}
          </div>

          <div>
            <h2
              style={{
                fontSize: 'clamp(36px, 4.4vw, 56px)',
                fontWeight: 400,
                lineHeight: 1,
                margin: '0 0 40px 0',
              }}
            >
              {founderConfig.heading}
            </h2>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 400,
                lineHeight: 1.7,
                margin: 0,
                maxWidth: '60ch',
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {founderConfig.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
