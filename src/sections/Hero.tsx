import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import AsciiCanvas from '../components/AsciiCanvas';
import Nav from '../components/Nav';
import Reveal from '../components/Reveal';
import { MagneticAnchor } from '../components/Spatial';
import { heroConfig } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';
import { withProxyzMark } from '../components/ProxyzMark';

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const leadOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const { locale } = useLocale();
  const eyebrow = useBilingual(heroConfig.eyebrow);
  const titleLines = useBilingual(heroConfig.titleLines);
  const lead = useBilingual(heroConfig.lead);
  const primaryCtaLabel = useBilingual(heroConfig.primaryCta.label);
  const secondaryLabel = useBilingual(heroConfig.secondaryLink.label);
  const showBadge = anyFallback(
    locale,
    heroConfig.eyebrow,
    heroConfig.titleLines,
    heroConfig.lead,
    heroConfig.primaryCta.label,
    heroConfig.secondaryLink.label,
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-section"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <Nav />
      <div
        className="hero-left"
        style={{
          position: 'relative',
          width: '40%',
          minWidth: '320px',
          background: '#0A0A0A',
          overflow: 'hidden',
        }}
      >
        {/* Hero content */}
        <div
          className="hero-content"
          style={{
            position: 'absolute',
            left: '40px',
            right: '40px',
            top: '22vh',
            zIndex: 10,
          }}
        >
          <Reveal>
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
            {eyebrow}
            <FallbackBadge show={showBadge} />
          </p>
          </Reveal>
          <Reveal delay={80}>
          {/*
            scanline-heading className overlays horizontal scanlines via a
            ::after pseudo-element rather than the previous gradient-text
            (background-clip: text) technique. The text underneath is real,
            accessible, copy-pasteable, and visible in high-contrast mode.
            The inner .proxy-glitch span keeps its own inline scanline because
            its chromatic ::before/::after duplicates depend on it.
          */}
          <motion.h1
            className="scanline-heading"
            style={{
              y: titleY,
              opacity: titleOpacity,
              fontFamily: "'Fragment Mono', 'Courier New', monospace",
              fontSize: 'clamp(44px, 5.6vw, 82px)',
              fontWeight: 400,
              lineHeight: 0.96,
              textTransform: 'uppercase',
              margin: 0,
              letterSpacing: '0.015em',
              wordSpacing: '-0.45em',
              textWrap: 'balance',
            }}
          >
            {titleLines.map((line, index) => {
              const match = /^(.*?)\b(system)\b(.*)$/i.exec(line);
              return (
                <span key={`${line}-${index}`}>
                  {match ? (
                    <>
                      {match[1]}
                      <span
                        className="proxy-glitch"
                        data-text={match[2].toUpperCase()}
                        style={{
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
                        {match[2]}
                      </span>
                      {match[3]}
                    </>
                  ) : (
                    line
                  )}
                  {index < titleLines.length - 1 && <br />}
                </span>
              );
            })}
          </motion.h1>
          </Reveal>

          <Reveal delay={180}>
          <motion.p
            style={{
              opacity: leadOpacity,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.66)',
              margin: '40px 0 0 0',
              maxWidth: '52ch',
            }}
          >
            {withProxyzMark(lead, 'hero-lead')}
          </motion.p>
          </Reveal>

          <Reveal delay={260}>
          <div
            className="hero-ctas"
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
              marginTop: '36px',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            <MagneticAnchor
              href={heroConfig.primaryCta.href}
              style={{
                fontSize: '12px',
                fontWeight: 400,
                color: '#0A0A0A',
                background: '#F2F2F2',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                padding: '12px 22px',
                borderRadius: '2px',
              }}
            >
              {primaryCtaLabel}
            </MagneticAnchor>
            <a
              href={heroConfig.secondaryLink.href}
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
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderBottomColor = '#F2F2F2';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderBottomColor = 'rgba(255,255,255,0.4)';
              }}
            >
              {secondaryLabel}
            </a>
          </div>
          </Reveal>
        </div>
      </div>

      <div
        className="hero-right"
        style={{
          position: 'relative',
          width: '60%',
          background: '#0A0A0A',
          overflow: 'hidden',
        }}
      >
        <AsciiCanvas />
      </div>
    </section>
  );
}
