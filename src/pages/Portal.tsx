import { useRef } from 'react';
import Nav from '../components/Nav';
import Reveal from '../components/Reveal';
import PictoIcon from '../components/PictoIcon';
import { TiltCard, MagneticAnchor } from '../components/Spatial';
import { HeroMesh, EdgeRule } from '../components/Glow';
import Footer from '../sections/Footer';
import { useHeroParallax } from '../lib/scrollChoreography';
import { portalPageConfig } from '../config';

const moduleIcons = ['meetings', 'todos', 'rocks', 'issues', 'scorecard', 'vto'] as const;
const pillarIcons = ['time', 'install', 'spark'] as const;

export default function Portal() {
  const c = portalPageConfig;
  // P5: scroll-driven hero parallax — content drifts up + fades on scroll.
  const heroRef = useRef<HTMLElement>(null);
  useHeroParallax(heroRef, { drift: 120, fadeTo: 0.2, inner: '.portal-hero-inner' });

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
          <div className="portal-hero-inner" style={{ position: 'relative', zIndex: 1, maxWidth: '1360px', margin: '0 auto' }}>
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
            {/*
              scanline-heading className: same fix as Hero + Pipeline.
              Pseudo-element overlay replaces gradient-text.
            */}
            <h1
              className="scanline-heading"
              style={{
                fontFamily: "'Fragment Mono', 'Courier New', monospace",
                fontSize: 'clamp(44px, 6.4vw, 96px)',
                fontWeight: 400,
                lineHeight: 0.96,
                textTransform: 'uppercase',
                margin: 0,
                letterSpacing: '0.015em',
                wordSpacing: '-0.45em',
                textWrap: 'balance',
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

            <div
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                marginTop: '40px',
                fontFamily: "'IBM Plex Mono', monospace",
                flexWrap: 'wrap',
              }}
            >
              <MagneticAnchor
                href={c.primaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
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
                {c.primaryCta.label}
              </MagneticAnchor>
              <a
                href={c.secondaryLink.href}
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#F2F2F2',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  letterSpacing: '0.08em',
                  borderBottom: '1px solid rgba(255,255,255,0.4)',
                  paddingBottom: '2px',
                  transition: 'border-color 0.2s',
                }}
              >
                {c.secondaryLink.label}
              </a>
            </div>
          </div>
        </section>

        {/* WHO RUNS ON IT — promoted from position 4 to position 2 per
            audit (_output/2026-05-23-impeccable-portal-media-v1.md #4):
            framing the Portal as "what we install at clients" has to
            precede the module tour, or a cold reader parses MODULES as
            a SaaS feature grid. */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent-pink)',
                margin: '0 0 48px 0',
              }}
            >
              {c.whoLabel}
            </p>
            <h2
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 'clamp(32px, 4vw, 56px)',
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                margin: '0 0 36px 0',
                maxWidth: '24ch',
                textWrap: 'balance',
              }}
            >
              {c.whoHeading}
            </h2>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                maxWidth: '64ch',
              }}
            >
              {c.whoBody}
            </p>
          </div>
        </section>

        {/* PILLARS */}
        <section
          className="section-mobile"
          style={{
            position: 'relative',
            padding: '120px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <EdgeRule />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1360px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent-pink)',
                margin: '0 0 56px 0',
              }}
            >
              {c.pillarsLabel}
            </p>

            <div
              className="portal-pillars"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0',
                borderTop: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              {c.pillars.map((pillar, i) => (
                <Reveal key={pillar.name} delay={i * 80}>
                <div
                  style={{
                    padding: '36px 28px 36px 0',
                    paddingLeft: i === 0 ? 0 : '28px',
                    borderRight:
                      i === c.pillars.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <PictoIcon name={pillarIcons[i] ?? 'spark'} size={32} stroke="#F2F2F2" style={{ marginBottom: '18px' }} />
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.12em',
                      color: 'var(--accent-pink)',
                      textTransform: 'uppercase',
                      margin: '0 0 18px 0',
                    }}
                  >
                    0{i + 1}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '22px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                      textTransform: 'uppercase',
                      margin: '0 0 18px 0',
                    }}
                  >
                    {pillar.name}
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
                    {pillar.description}
                  </p>
                </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* MODULES — dark register matches the rest of the page (audit #3
            in 2026-05-23-impeccable-portal-media-v1.md). The earlier white
            inversion read as a SaaS feature grid stitched onto an editorial
            page; on dark with shared dividers it inherits the Pillars grid
            pattern, so MODULES extends the rhythm instead of breaking it. */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent-pink)',
                margin: '0 0 48px 0',
              }}
            >
              {c.modulesLabel}
            </p>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '17.5px',
                fontWeight: 400,
                lineHeight: 1.45,
                color: 'var(--fg)',
                margin: '0 0 56px 0',
                maxWidth: '64ch',
              }}
            >
              {c.modulesIntro}
            </p>

            <div
              className="portal-modules"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0',
                borderTop: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              {c.modules.map((m, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const isLastRow = row === Math.floor((c.modules.length - 1) / 3);
                return (
                  <Reveal key={m.name} delay={i * 60}>
                  <TiltCard
                    maxTiltX={3}
                    maxTiltY={4}
                    style={{
                      padding: '32px 28px',
                      paddingLeft: col === 0 ? 0 : '28px',
                      paddingRight: col === 2 ? 0 : '28px',
                      borderRight: col === 2 ? 'none' : '1px solid rgba(255,255,255,0.18)',
                      borderBottom: isLastRow ? 'none' : '1px solid rgba(255,255,255,0.18)',
                      minHeight: '100%',
                    }}
                  >
                    <PictoIcon name={moduleIcons[i] ?? 'arrow'} size={32} stroke="#F2F2F2" style={{ marginBottom: '16px' }} />
                    <h3
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '20px',
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                        textTransform: 'uppercase',
                        color: 'var(--fg)',
                        margin: '0 0 16px 0',
                      }}
                    >
                      {m.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '13px',
                        fontWeight: 400,
                        lineHeight: 1.6,
                        margin: 0,
                        color: 'rgba(255,255,255,0.78)',
                      }}
                    >
                      {m.description}
                    </p>
                  </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 'clamp(36px, 4.6vw, 64px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                margin: '0 0 28px 0',
              }}
            >
              {c.closingHeading}
            </h2>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.7)',
                margin: '0 0 36px 0',
                maxWidth: '60ch',
              }}
            >
              {c.closingBody}
            </p>
            <a
              href={c.closingCta.href}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '13px',
                fontWeight: 400,
                color: '#0A0A0A',
                background: '#F2F2F2',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                padding: '14px 26px',
                borderRadius: '2px',
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
              {c.closingCta.label}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
