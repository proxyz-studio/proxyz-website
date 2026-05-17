import { bookingConfig } from '../config';

export default function Booking() {
  if (!bookingConfig.heading) {
    return null;
  }

  return (
    <section
      id="booking"
      className="section-mobile"
      style={{
        background: '#000',
        color: '#fff',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
          {bookingConfig.sectionLabel}
        </p>

        <h2
          style={{
            fontSize: 'clamp(28px, 3.4vw, 44px)',
            fontWeight: 400,
            lineHeight: 1.18,
            margin: '0 0 32px 0',
            maxWidth: '24ch',
            textWrap: 'balance',
          }}
        >
          {bookingConfig.heading}
        </h2>

        <p
          style={{
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: 1.7,
            margin: '0 0 56px 0',
            maxWidth: '56ch',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {bookingConfig.body}
        </p>

        {/*
          Cal.com embed forced to dark theme via ?theme=dark URL param so it
          always matches the site, ignoring the visitor's OS-level preference.
        */}
        <div style={{ background: 'transparent' }}>
          <iframe
            src={`https://cal.com/${bookingConfig.calLink}?theme=dark`}
            width="100%"
            height={700}
            frameBorder={0}
            title="Book the Audit"
            style={{
              display: 'block',
              border: '1px solid rgba(255,255,255,0.10)',
              colorScheme: 'dark',
            }}
          />
        </div>
      </div>
    </section>
  );
}
