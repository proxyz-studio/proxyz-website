import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Reveal from '../components/Reveal';
import { MagneticAnchor, TiltCard } from '../components/Spatial';
import { Marginalia } from '../components/Editorial';
import { HeroMesh } from '../components/Glow';
import PictoIcon from '../components/PictoIcon';
import Footer from '../sections/Footer';
import { useHeroParallax } from '../lib/scrollChoreography';
import { mediaPageConfig } from '../config';

const flywheelIcons = ['stage', 'spark', 'arrow', 'orbit'] as const;

export default function Media() {
  const c = mediaPageConfig;
  const heroRef = useRef<HTMLElement>(null);
  useHeroParallax(heroRef, { drift: 120, fadeTo: 0.2, inner: '.media-hero-inner' });

  return (
    <>
      <Nav />
      <main style={{ background: '#0A0A0A', color: '#F2F2F2' }}>

        {/* HERO */}
        <section
          ref={heroRef}
          className="section-mobile"
          style={{
            position: 'relative',
            padding: '180px 40px 120px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <HeroMesh />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '120px',
              right: '40px',
              opacity: 0.4,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <Marginalia number="04" color="light" />
          </div>

          <div className="media-hero-inner" style={{ position: 'relative', zIndex: 2, maxWidth: '1360px', margin: '0 auto' }}>
            <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '0 0 22px 0' }}>
              <PictoIcon name="stage" size={28} stroke="var(--accent-pink)" />
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-pink)',
                  margin: 0,
                }}
              >
                {c.eyebrow}
              </p>
            </div>
            </Reveal>
            <Reveal delay={80}>
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
            </Reveal>
            <Reveal delay={180}>
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
            </Reveal>
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
                <Reveal key={i} delay={i * 80}>
                <div
                  style={{
                    padding: '36px 28px 36px 0',
                    paddingLeft: i === 0 ? 0 : '28px',
                    borderRight:
                      i === c.flywheel.steps.length - 1
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <PictoIcon name={flywheelIcons[i] ?? 'arrow'} size={32} stroke="#F2F2F2" style={{ marginBottom: '20px' }} />
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
                </Reveal>
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
              {c.properties.cards.map((card, i) => {
                const _delay = i * 80;
                const inner = (
                  <>
                    <PictoIcon name="orbit" size={36} stroke="#F2F2F2" style={{ marginBottom: '24px' }} />
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
                        color: '#F2F2F2',
                      }}
                    >
                      {(() => {
                        const m = /^(.*?\s+)(Z)$/i.exec(card.name);
                        if (m) {
                          return (
                            <>
                              {m[1]}
                              <span style={{ color: '#5BC9B8' }}>{m[2]}</span>
                            </>
                          );
                        }
                        return card.name;
                      })()}
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
                        margin: '0 0 20px 0',
                      }}
                    >
                      {card.lead}
                    </p>
                    {card.detailHref && (
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '11px',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--accent-pink)',
                          borderBottom: '1px solid var(--accent-pink)',
                          paddingBottom: '2px',
                        }}
                      >
                        View project →
                      </span>
                    )}
                  </>
                );

                const cardStyle: React.CSSProperties = {
                  border: '1px solid rgba(255,255,255,0.10)',
                  padding: '32px',
                  borderRadius: '4px',
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s, background 0.2s',
                };

                if (card.detailHref) {
                  return (
                    <Reveal key={i} delay={_delay}>
                    <TiltCard maxTiltX={3} maxTiltY={4} style={{ height: '100%' }}>
                    <Link
                      to={card.detailHref}
                      style={cardStyle}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          'rgba(255,255,255,0.30)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          'rgba(255,255,255,0.10)';
                      }}
                    >
                      {inner}
                    </Link>
                    </TiltCard>
                    </Reveal>
                  );
                }
                return (
                  <Reveal key={i} delay={_delay}>
                    <TiltCard maxTiltX={3} maxTiltY={4} style={{ height: '100%' }}>
                      <div style={cardStyle}>{inner}</div>
                    </TiltCard>
                  </Reveal>
                );
              })}
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
            <MagneticAnchor
              href={c.cta.primaryCta.href}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '13px',
                fontWeight: 400,
                color: '#0A0A0A',
                background: 'var(--accent-pink)',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                padding: '14px 26px',
                borderRadius: '2px',
              }}
            >
              {c.cta.primaryCta.label}
            </MagneticAnchor>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
