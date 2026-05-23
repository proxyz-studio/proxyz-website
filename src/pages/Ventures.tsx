/* /ventures — PROXYZ's own venture portfolio.
 *
 * Each card represents a brand PROXYZ owns and operates (AUTOLOOM,
 * MAGNIZ, PRYZM). The page is a hub. Each venture's product story lives
 * at its own domain. If the domain is live the card is a clickable
 * outbound link; if it's pre-launch the domain shows as text only with
 * a status pill.
 *
 * Editorial pattern matches /pipeline: chapter-number marginalia, dark
 * background, Plex Mono + Fragment Mono, hot pink + lime accents.
 */

import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { MagneticAnchor } from '../components/Spatial';
import { Marginalia } from '../components/Editorial';
import { HeroMesh } from '../components/Glow';
import PictoIcon from '../components/PictoIcon';
import Nav from '../components/Nav';
import Footer from '../sections/Footer';
import { venturesPageConfig, type VentureCard } from '../config';

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', monospace";

/** PROXYZ default accent — used when a venture has no brand override. */
const PROXYZ_PINK = '#FF4193';

function getStatusPillStyle(status: string, brandAccent: string): React.CSSProperties {
  if (status === 'live') return { color: '#0A0A0A', background: '#D2FF3B' };
  if (status === 'building') return { color: '#0A0A0A', background: brandAccent };
  return {
    color: 'rgba(255,255,255,0.78)',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.32)',
  };
}

function VentureEntry({ venture, index }: { venture: VentureCard; index: number }) {
  const hasExternalLink = venture.status === 'live' && !!venture.href;
  const hasInternalLink = !!venture.internalHref;
  const brandAccent = venture.brand?.accent ?? PROXYZ_PINK;

  const ctaStyle: React.CSSProperties = {
    fontFamily: FONT_MONO,
    fontSize: '12px',
    fontWeight: 400,
    color: '#0A0A0A',
    background: '#F2F2F2',
    textTransform: 'uppercase',
    textDecoration: 'none',
    letterSpacing: '0.08em',
    padding: '12px 22px',
    borderRadius: '2px',
    whiteSpace: 'nowrap',
    justifySelf: 'end',
  };

  return (
    <article
      style={{
        borderTop: '1px solid rgba(255,255,255,0.18)',
        padding: '64px 0',
        position: 'relative',
      }}
    >
      {/* Chapter number — same marginalia pattern as /pipeline */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '24px',
          right: 0,
          opacity: 0.32,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Marginalia
          number={String(index + 1).padStart(2, '0')}
          color="light"
          size="clamp(96px, 12vw, 180px)"
        />
      </div>

      {/* Header: small marker + name */}
      <div
        className="venture-header"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '32px',
          alignItems: 'baseline',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: '12px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(40px, 5.4vw, 80px)',
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: '0.015em',
            textTransform: 'uppercase',
            margin: 0,
            color: '#F2F2F2',
          }}
        >
          {venture.name}
        </h2>
      </div>

      {/* Status pill */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          paddingLeft: 'calc(32px + 1.6ch)',
          marginBottom: '36px',
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            ...getStatusPillStyle(venture.status, brandAccent),
          }}
        >
          ● {venture.statusLabel}
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: 'clamp(18px, 1.8vw, 22px)',
          lineHeight: 1.45,
          color: brandAccent,
          margin: '0 0 28px 0',
          maxWidth: '76ch',
        }}
      >
        {venture.tagline}
      </p>

      {/* Pitch paragraph */}
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.82)',
          margin: '0 0 36px 0',
          maxWidth: '76ch',
        }}
      >
        {venture.pitch}
      </p>

      {/* Modules row */}
      <div
        className="venture-modules"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '20px 0',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          marginBottom: '32px',
        }}
      >
        {venture.modules.map((m) => (
          <div
            key={m}
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* Domain / outbound link row */}
      <div
        className="venture-foot"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '24px',
          alignItems: 'center',
          padding: '24px 20px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              margin: '0 0 6px 0',
            }}
          >
            Domain
          </p>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '14px',
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.92)',
              margin: 0,
            }}
          >
            {venture.domain}
            {!hasExternalLink && (
              <span
                style={{
                  marginLeft: '12px',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                {venture.status === 'building' ? '· launching soon' : '· domain pending'}
              </span>
            )}
          </p>
        </div>
        {hasExternalLink && (
          <MagneticAnchor
            href={venture.href!}
            target="_blank"
            rel="noopener noreferrer"
            style={ctaStyle}
          >
            Visit {venture.name.toLowerCase()} →
          </MagneticAnchor>
        )}
        {!hasExternalLink && hasInternalLink && (
          <Link to={venture.internalHref!} style={ctaStyle}>
            Explore {venture.name.toLowerCase()} →
          </Link>
        )}
        {!hasExternalLink && !hasInternalLink && (
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              justifySelf: 'end',
            }}
          >
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
}

export default function Ventures() {
  const c = venturesPageConfig;

  return (
    <>
      <Nav />
      <main style={{ background: '#0A0A0A', color: '#F2F2F2' }}>
        {/* HERO */}
        <section
          className="section-mobile"
          style={{
            position: 'relative',
            padding: '180px 40px 80px',
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

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1360px', margin: '0 auto' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '0 0 22px 0' }}>
                <PictoIcon name="spark" size={28} stroke="var(--accent-pink)" />
                <p
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '11px',
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
                  fontFamily: FONT_DISPLAY,
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
                {c.titleLines.map((line, i) => (
                  <span key={`${line}-${i}`}>
                    {line}
                    {i < c.titleLines.length - 1 && <br />}
                  </span>
                ))}
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.7)',
                  margin: '48px 0 0 0',
                  maxWidth: '60ch',
                }}
              >
                {c.lead}
              </p>
            </Reveal>
          </div>
        </section>

        {/* VENTURES */}
        <section className="section-mobile" style={{ padding: '40px 40px 120px' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            {c.ventures.map((v, i) => (
              <Reveal key={v.name} delay={i * 100}>
                <VentureEntry venture={v} index={i} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* CLOSING */}
        <section
          className="section-mobile"
          style={{
            padding: '120px 40px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: '#F2F2F2',
            color: '#0A0A0A',
          }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-pink)',
                margin: '0 0 36px 0',
              }}
            >
              {c.closingLabel}
            </p>
            <h2
              style={{
                fontFamily: FONT_MONO,
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
                fontFamily: FONT_MONO,
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'rgba(0,0,0,0.75)',
                margin: '0 0 40px 0',
                maxWidth: '60ch',
              }}
            >
              {c.closingBody}
            </p>
            <MagneticAnchor
              href={c.closingCta.href}
              style={{
                fontFamily: FONT_MONO,
                fontSize: '13px',
                fontWeight: 400,
                color: '#F2F2F2',
                background: '#0A0A0A',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                padding: '14px 26px',
                borderRadius: '2px',
              }}
            >
              {c.closingCta.label}
            </MagneticAnchor>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
