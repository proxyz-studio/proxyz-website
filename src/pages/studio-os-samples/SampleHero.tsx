import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { MagneticAnchor } from '../../components/Spatial';
import { studioOsContent } from '../studio-os/content';
import { DISPLAY, FG, LIME, MAXW, MONO, MUTED, PINK } from '../studio-os/theme';

const { hero } = studioOsContent;

/**
 * Shared hero for the immersive samples. Line-by-line headline reveal on load.
 * `backdrop` is rendered behind the content (each sample's signature effect).
 */
export default function SampleHero({
  backdrop,
  align = 'left',
}: {
  backdrop?: ReactNode;
  align?: 'left' | 'center';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.sh-line-inner, .sh-fade', { opacity: 1, yPercent: 0, y: 0 });
        return;
      }
      gsap.set('.sh-line-inner', { yPercent: 118 });
      gsap.set('.sh-fade', { opacity: 0, y: 18 });
      gsap
        .timeline({ delay: 0.12 })
        .to('.sh-line-inner', { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.09 })
        .to('.sh-fade', { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12 }, '-=0.55');
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '160px 40px 120px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {backdrop}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: MAXW,
          margin: '0 auto',
          textAlign: align,
        }}
      >
        <p
          className="sh-fade"
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
          }}
        >
          {hero.h1Lines.map((line, i) => (
            <span key={line} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
              <span
                className="sh-line-inner"
                style={{ display: 'block', willChange: 'transform', color: i === 1 ? PINK : FG }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          className="sh-fade"
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(15px, 1.5vw, 18px)',
            lineHeight: 1.7,
            color: MUTED,
            margin: align === 'center' ? '40px auto 0' : '40px 0 0 0',
            maxWidth: '60ch',
          }}
        >
          {hero.h2}
        </p>

        <div
          className="sh-fade"
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            marginTop: '44px',
            justifyContent: align === 'center' ? 'center' : 'flex-start',
          }}
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
    </section>
  );
}
