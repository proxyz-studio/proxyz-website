import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import Reveal from '../components/Reveal';
import { MagneticAnchor } from '../components/Spatial';
import { Marginalia } from '../components/Editorial';
import { HeroMesh } from '../components/Glow';
import PictoIcon from '../components/PictoIcon';
import Footer from '../sections/Footer';
import { ProxyzMark } from '../components/ProxyzMark';
import { useHeroParallax } from '../lib/scrollChoreography';
import { pipelinePageConfig, type PartnerCard } from '../config';

function isInternalRoute(href: string) {
  return href.startsWith('/') && !href.startsWith('/#');
}

const statusColor: Record<string, string> = {
  done: '#5BC9B8',
  active: '#ff4193',
  next: 'rgba(255,255,255,0.35)',
};

const metaIcons = {
  sector: 'stage',
  location: 'place',
  partner: 'person',
  stage: 'time',
} as const;

function PartnerEntry({ partner, index }: { partner: PartnerCard; index: number }) {
  const navigate = useNavigate();
  return (
    <article
      style={{
        borderTop: '1px solid rgba(255,255,255,0.18)',
        padding: '64px 0',
        position: 'relative',
      }}
    >
      {/* Big outlined chapter number — sits inside the article so the
          divider line above the card doesn't cut through the digits. */}
      <div
        aria-hidden
        className="partner-marginalia"
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

      {/* Header strip — small marker + name, pill drops to a new row below */}
      <div
        className="partner-header"
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
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2
          style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: 'clamp(40px, 5.4vw, 80px)',
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: '0.015em',
            textTransform: 'uppercase',
            margin: 0,
            color: '#F2F2F2',
          }}
        >
          {partner.detailHref ? (
            <Link to={partner.detailHref} style={{ color: '#F2F2F2', textDecoration: 'none' }}>
              {partner.name}
            </Link>
          ) : (
            partner.name
          )}
        </h2>
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          paddingLeft: 'calc(32px + 1.6ch)',
          marginBottom: '36px',
        }}
      >
        <span
          className="partner-status-pill"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#0A0A0A',
            background: 'var(--accent-pink)',
            padding: '6px 12px',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            display: 'inline-block',
          }}
        >
          ● {partner.stage}
        </span>
      </div>

      {/* Meta row */}
      <div
        className="partner-meta"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          padding: '20px 0',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          marginBottom: '40px',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <PictoIcon name={metaIcons.sector} size={20} stroke="rgba(255,255,255,0.55)" />
          <div>
            <p
              style={{
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                margin: '0 0 6px 0',
              }}
            >
              Sector
            </p>
            <p style={{ margin: 0, color: '#F2F2F2' }}>{partner.sector}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <PictoIcon name={metaIcons.location} size={20} stroke="rgba(255,255,255,0.55)" />
          <div>
            <p
              style={{
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                margin: '0 0 6px 0',
              }}
            >
              Location
            </p>
            <p style={{ margin: 0, color: '#F2F2F2' }}>{partner.location}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <PictoIcon name={metaIcons.partner} size={20} stroke="rgba(255,255,255,0.55)" />
          <div>
            <p
              style={{
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                margin: '0 0 6px 0',
              }}
            >
              {partner.partnerLabel}
            </p>
            <p style={{ margin: 0, color: '#F2F2F2' }}>{partner.partner}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <PictoIcon name={metaIcons.stage} size={20} stroke="var(--accent-pink)" />
          <div>
            <p
              style={{
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                margin: '0 0 6px 0',
              }}
            >
              Stage
            </p>
            <p style={{ margin: 0, color: 'var(--accent-pink)' }}>{partner.stage}</p>
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div
        className="partner-body"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          marginBottom: '40px',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-pink)',
              margin: '0 0 14px 0',
            }}
          >
            What <ProxyzMark /> brings
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.82)',
              margin: 0,
            }}
          >
            {partner.proxyzRole}
          </p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-pink)',
              margin: '0 0 14px 0',
            }}
          >
            What {partner.name} brings
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.82)',
              margin: 0,
            }}
          >
            {partner.partnerBrings}
          </p>
        </div>
      </div>

      {/* Why it matters */}
      <div style={{ marginBottom: '40px' }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--accent-pink)',
            margin: '0 0 14px 0',
          }}
        >
          Why it matters
        </p>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '15px',
            lineHeight: 1.65,
            color: '#F2F2F2',
            margin: 0,
            maxWidth: '76ch',
          }}
        >
          {partner.whyItMatters}
        </p>
      </div>

      {/* Milestones */}
      <div style={{ marginBottom: '32px' }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--accent-pink)',
            margin: '0 0 18px 0',
          }}
        >
          Roadmap · live
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}
          className="partner-milestones"
        >
          {partner.milestones.map((m) => (
            <li
              key={m.label}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                lineHeight: 1.5,
                padding: '14px 16px',
                border: `1px solid ${statusColor[m.status]}`,
                color: m.status === 'next' ? 'rgba(255,255,255,0.5)' : '#F2F2F2',
                background:
                  m.status === 'active' ? 'rgba(255,65,147,0.08)' : 'transparent',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  background: statusColor[m.status],
                  borderRadius: '50%',
                  marginTop: '5px',
                  flexShrink: 0,
                  animation: m.status === 'active' ? 'pulse 2s infinite' : 'none',
                }}
              />
              <span>{m.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Last update + CTA */}
      <div
        className="partner-foot"
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
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              margin: '0 0 6px 0',
            }}
          >
            Latest update
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '13px',
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
            }}
          >
            {partner.lastUpdate}
          </p>
        </div>
        {isInternalRoute(partner.cta.href) ? (
          <MagneticAnchor
            href={partner.cta.href}
            onClick={(e) => {
              e.preventDefault();
              navigate(partner.cta.href);
            }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
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
            }}
          >
            {partner.cta.label}
          </MagneticAnchor>
        ) : (
          <MagneticAnchor
            href={partner.cta.href}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
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
            }}
          >
            {partner.cta.label}
          </MagneticAnchor>
        )}
      </div>
    </article>
  );
}

export default function Pipeline() {
  const c = pipelinePageConfig;
  // P5: scroll-driven hero parallax. The hero's inner content drifts up
  // + fades as the user scrolls past, scrub-tied with 0.6s catch-up.
  // Honors prefers-reduced-motion (no-op when set).
  const heroRef = useRef<HTMLElement>(null);
  useHeroParallax(heroRef, { drift: 120, fadeTo: 0.2, inner: '.pipeline-hero-inner' });

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
            <Marginalia number="03" color="light" />
          </div>

          <div className="pipeline-hero-inner" style={{ position: 'relative', zIndex: 2, maxWidth: '1360px', margin: '0 auto' }}>
            <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '0 0 22px 0' }}>
              <PictoIcon name="partnership" size={28} stroke="var(--accent-pink)" />
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
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
            {/*
              scanline-heading className: see Hero.tsx for the rationale.
              Replaces gradient-text (impeccable absolute ban) with a
              ::after pseudo-element overlay. Real DOM text underneath.
            */}
            <h1
              className="scanline-heading"
              style={{
                fontFamily: "'Fragment Mono', monospace",
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
                fontFamily: "'IBM Plex Mono', monospace",
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

            {/* Static count label — used to be a row of "filter pills" with
                pink selected styling and no onClick (false affordance per
                audit _output/2026-05-23-impeccable-pipeline-v1.md). Replaced
                with an honest one-line summary derived from the partner
                count + their shared stage. */}
            <Reveal delay={260}>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                margin: '48px 0 0 0',
              }}
            >
              {c.partners.length} companies · active discussion
            </p>
            </Reveal>
          </div>
        </section>

        {/* PARTNERS */}
        <section className="section-mobile" style={{ padding: '40px 40px 120px' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            {c.partners.map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <PartnerEntry partner={p} index={i} />
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
                fontFamily: "'IBM Plex Mono', monospace",
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
                fontFamily: "'IBM Plex Mono', monospace",
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
