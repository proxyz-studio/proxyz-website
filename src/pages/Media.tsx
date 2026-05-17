import Nav from '../components/Nav';
import Footer from '../sections/Footer';
import { mediaPageConfig } from '../config';

export default function Media() {
  const c = mediaPageConfig;

  return (
    <>
      <Nav />
      <main style={{ background: '#000', color: '#fff' }}>

        {/* HERO */}
        <section
          className="section-mobile"
          style={{
            padding: '180px 40px 120px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                fontWeight: 400,
                lineHeight: 1.6,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--accent-pink)',
                margin: '0 0 22px 0',
              }}
            >
              {c.eyebrow}
            </p>
            <h1
              style={{
                fontFamily: "'Fragment Mono', 'Courier New', monospace",
                fontSize: 'clamp(44px, 6.4vw, 96px)',
                fontWeight: 400,
                lineHeight: 0.96,
                color: 'transparent',
                textTransform: 'uppercase',
                margin: 0,
                letterSpacing: '0.015em',
                wordSpacing: '-0.45em',
                textWrap: 'balance',
                background:
                  'repeating-linear-gradient(' +
                  'to bottom, ' +
                  '#fff 0px, ' +
                  '#fff 2px, ' +
                  'transparent 2px, ' +
                  'transparent 5px' +
                  ')',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {c.titleLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < c.titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '15px',
                fontWeight: 400,
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.7)',
                margin: '48px 0 0 0',
                maxWidth: '64ch',
              }}
            >
              {c.lead}
            </p>
          </div>
        </section>

        {/* THESIS */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: "'Fragment Mono', 'Courier New', monospace",
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                margin: '0 0 48px 0',
                maxWidth: '24ch',
              }}
            >
              {c.thesis.heading}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '64ch' }}>
              {c.thesis.paragraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '15px',
                    fontWeight: 400,
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.7)',
                    margin: 0,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* PRINCIPLES */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: "'Fragment Mono', 'Courier New', monospace",
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                margin: '0 0 56px 0',
              }}
            >
              {c.principles.heading}
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                borderTop: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {c.principles.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '32px',
                    alignItems: 'flex-start',
                    padding: '28px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.12em',
                      color: 'var(--accent-pink)',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                      paddingTop: '2px',
                      minWidth: '28px',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '15px',
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.85)',
                      margin: 0,
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FLYWHEEL */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: "'Fragment Mono', 'Courier New', monospace",
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                margin: '0 0 56px 0',
              }}
            >
              {c.flywheel.heading}
            </h2>
            <div
              className="media-flywheel"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0',
                borderTop: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              {c.flywheel.steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    padding: '36px 28px 36px 0',
                    paddingLeft: i === 0 ? 0 : '28px',
                    borderRight:
                      i === c.flywheel.steps.length - 1
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.12em',
                      color: 'var(--accent-pink)',
                      textTransform: 'uppercase',
                      margin: '0 0 12px 0',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                      textTransform: 'uppercase',
                      margin: '0 0 16px 0',
                    }}
                  >
                    {step.label}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.7)',
                      margin: 0,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROPERTIES */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: "'Fragment Mono', 'Courier New', monospace",
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                margin: '0 0 12px 0',
              }}
            >
              {c.properties.heading}
            </h2>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                margin: '0 0 48px 0',
              }}
            >
              {c.properties.subhead}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
                marginBottom: '48px',
              }}
            >
              {c.properties.cards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid rgba(255,255,255,0.10)',
                    padding: '32px',
                    borderRadius: '4px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--accent-pink)',
                      margin: '0 0 20px 0',
                    }}
                  >
                    {card.status}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Fragment Mono', 'Courier New', monospace",
                      fontSize: '22px',
                      fontWeight: 400,
                      lineHeight: 1.1,
                      textTransform: 'uppercase',
                      margin: '0 0 12px 0',
                    }}
                  >
                    {card.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: 'rgba(255,255,255,0.85)',
                      margin: '0 0 16px 0',
                    }}
                  >
                    {card.tagline}
                  </p>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.55)',
                      margin: '0 0 24px 0',
                    }}
                  >
                    {card.description}
                  </p>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.35)',
                      margin: 0,
                    }}
                  >
                    {card.lead}
                  </p>
                </div>
              ))}
            </div>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '13px',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
              }}
            >
              {c.properties.closingLine}
            </p>
          </div>
        </section>

        {/* OPERATORS */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: "'Fragment Mono', 'Courier New', monospace",
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                margin: '0 0 48px 0',
                maxWidth: '24ch',
              }}
            >
              {c.operators.heading}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '64ch' }}>
              {c.operators.paragraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '15px',
                    fontWeight: 400,
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.7)',
                    margin: 0,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: "'Fragment Mono', 'Courier New', monospace",
                fontSize: 'clamp(36px, 4.6vw, 64px)',
                fontWeight: 400,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                margin: '0 0 28px 0',
              }}
            >
              {c.cta.heading}
            </h2>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '15px',
                fontWeight: 400,
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.7)',
                margin: '0 0 40px 0',
                maxWidth: '60ch',
              }}
            >
              {c.cta.lead}
            </p>
            <a
              href={c.cta.primaryCta.href}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '13px',
                fontWeight: 400,
                color: '#000',
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
              {c.cta.primaryCta.label}
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
