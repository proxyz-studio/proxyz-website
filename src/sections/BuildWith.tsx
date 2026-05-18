import Reveal from '../components/Reveal';
import { Marginalia, DropCap, PullQuote } from '../components/Editorial';
import { MagneticAnchor } from '../components/Spatial';
import { HeadlineHalo, EdgeRule } from '../components/Glow';
import PictoIcon from '../components/PictoIcon';
import { buildWithConfig } from '../config';

export default function BuildWith() {
  if (!buildWithConfig.heading) {
    return null;
  }

  return (
    <section
      id="build-with"
      className="section-mobile"
      style={{
        position: 'relative',
        background: '#000',
        color: '#fff',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
        overflow: 'hidden',
      }}
    >
      <EdgeRule />
      <HeadlineHalo top="42%" opacity={0.14} />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '32px',
          right: '40px',
          opacity: 0.45,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <Marginalia number="05" color="light" />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1360px', margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '0 0 64px 0' }}>
            <PictoIcon name="partnership" size={32} stroke="var(--accent-pink)" />
            <p
              style={{
                fontSize: '12px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent-pink)',
                margin: 0,
              }}
            >
              {buildWithConfig.sectionLabel}
            </p>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <h2
            style={{
              fontSize: 'clamp(32px, 3.8vw, 52px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              margin: '0 0 56px 0',
              maxWidth: '24ch',
              textWrap: 'balance',
            }}
          >
            {buildWithConfig.heading}
          </h2>
        </Reveal>

        <div style={{ maxWidth: '64ch', marginBottom: '48px' }}>
          {buildWithConfig.paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={120 + index * 80}>
              {index === 0 ? (
                <div style={{ margin: '0 0 24px 0', color: 'rgba(255,255,255,0.85)' }}>
                  <DropCap color="var(--accent-pink)">{paragraph}</DropCap>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 400,
                    lineHeight: 1.7,
                    margin: 0,
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {paragraph}
                </p>
              )}
            </Reveal>
          ))}
        </div>

        <Reveal delay={260}>
          <PullQuote variant="dark" align="left">
            This isn't a tier on a menu. It's a partnership.
          </PullQuote>
        </Reveal>

        <Reveal delay={340}>
          <MagneticAnchor
            href={buildWithConfig.cta.href}
            style={{
              fontSize: '12px',
              fontWeight: 400,
              color: '#fff',
              background: 'var(--accent-pink)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              padding: '14px 26px',
              borderRadius: '999px',
            }}
          >
            {buildWithConfig.cta.label}
          </MagneticAnchor>
        </Reveal>
      </div>
    </section>
  );
}
