import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MagneticAnchor } from '../../components/Spatial';
import { studioOsContent } from './content';
import { DISPLAY, FG, LIME, MONO, MUTED, PINK, MAXW } from './theme';

const { hero } = studioOsContent;

export default function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null);

  // Headline reveal: each line slides up out of its mask on load.
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.sos-hero-line-inner, .sos-hero-fade', { opacity: 1, yPercent: 0, y: 0 });
        return;
      }
      gsap.set('.sos-hero-line-inner', { yPercent: 116 });
      gsap.set('.sos-hero-fade', { opacity: 0, y: 18 });
      const tl = gsap.timeline({ delay: 0.15 });
      tl.to('.sos-hero-line-inner', {
        yPercent: 0,
        duration: 1.05,
        ease: 'expo.out',
        stagger: 0.1,
      }).to(
        '.sos-hero-fade',
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12 },
        '-=0.5',
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '160px 40px 120px',
        boxSizing: 'border-box',
      }}
    >
      <div className="sos-hero-inner" style={{ width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
        {/* Wordmark lockup — camelCase StudioOS, OS in lime */}
        <p
          className="sos-hero-fade"
          style={{
            fontFamily: MONO,
            fontSize: '13px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            margin: '0 0 30px 0',
            color: FG,
          }}
        >
          Studio<span style={{ color: LIME }}>OS</span>
        </p>

        <h1
          style={{
            fontFamily: DISPLAY,
            fontSize: 'clamp(40px, 6vw, 90px)',
            fontWeight: 600,
            lineHeight: 1.06,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            margin: 0,
            color: FG,
            textWrap: 'balance',
          }}
        >
          {hero.h1Lines.map((line, i) => (
            <span
              key={line}
              className="sos-hero-line"
              style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}
            >
              <span
                className="sos-hero-line-inner"
                style={{
                  display: 'block',
                  willChange: 'transform',
                  // The "operating brain" line is the brand center — quiet pink tint.
                  color: i === 1 ? PINK : FG,
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          className="sos-hero-fade"
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(15px, 1.5vw, 18px)',
            fontWeight: 400,
            lineHeight: 1.7,
            color: MUTED,
            margin: '40px 0 0 0',
            maxWidth: '60ch',
          }}
        >
          {hero.h2}
        </p>

        <div
          className="sos-hero-fade"
          style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '44px', flexWrap: 'wrap' }}
        >
          <MagneticAnchor
            href={hero.primaryCta.href}
            style={{
              fontFamily: MONO,
              fontSize: '13px',
              fontWeight: 500,
              color: '#0a0a0a',
              background: PINK,
              textTransform: 'uppercase',
              textDecoration: 'none',
              letterSpacing: '0.1em',
              padding: '15px 30px',
              borderRadius: '2px',
            }}
          >
            {hero.primaryCta.label}
          </MagneticAnchor>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="sos-hero-fade"
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '38px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          fontFamily: MONO,
          fontSize: '10px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        Scroll
        <span className="sos-scroll-line" style={{ width: '1px', height: '46px', background: 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)' }} />
      </div>
    </section>
  );
}
