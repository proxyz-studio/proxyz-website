import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SampleFrame from './SampleFrame';
import SampleHero from './SampleHero';
import { studioOsContent } from '../studio-os/content';
import { DISPLAY, FG, HAIRLINE, LIME, MAXW, MONO, MUTED, PINK, labelStyle } from '../studio-os/theme';

const { problem, whatItIs } = studioOsContent;

function HeroGlow() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(1100px,120vw)',
          height: '720px',
          background: `radial-gradient(ellipse at center, ${PINK}22 0%, transparent 62%)`,
          filter: 'blur(34px)',
        }}
      />
    </div>
  );
}

/** Pinned scene: scrubs from the Problem beat to the What-It-Is beat. */
function PinnedScene() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.cs-problem', { autoAlpha: 0 });
        gsap.set('.cs-whatitis, .cs-panel', { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: '+=230%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
      tl.to('.cs-problem', { autoAlpha: 0, yPercent: -28, ease: 'power1.in', duration: 1 })
        .fromTo('.cs-whatitis', { autoAlpha: 0, yPercent: 26 }, { autoAlpha: 1, yPercent: 0, ease: 'expo.out', duration: 1.1 }, '<0.25')
        .fromTo('.cs-panel', { autoAlpha: 0, scale: 0.82, rotateX: 8 }, { autoAlpha: 1, scale: 1, rotateX: 0, ease: 'expo.out', duration: 1.1 }, '<');
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
          {/* Problem beat */}
          <div className="cs-problem" style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', maxWidth: '24ch' }}>
            <p style={{ ...labelStyle, marginBottom: '28px' }}>{problem.label}</p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,4.6vw,60px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: 0, color: FG }}>
              {problem.heading}
            </h2>
          </div>

          {/* What-it-is beat + panel */}
          <div className="cs-whatitis" style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', display: 'grid', gridTemplateColumns: 'minmax(min(100%,420px),1fr) 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <p style={{ ...labelStyle, marginBottom: '28px' }}>{whatItIs.label}</p>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px,3.8vw,52px)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 24px 0', color: FG }}>
                {whatItIs.heading}
              </h2>
              <p style={{ fontFamily: MONO, fontSize: '16px', lineHeight: 1.7, color: MUTED, margin: 0, maxWidth: '46ch' }}>
                {whatItIs.paragraphs[0]}
              </p>
            </div>
            <div className="cs-panel" style={{ perspective: '1000px' }}>
              <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: '10px', background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', padding: '22px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
                <p style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: LIME, margin: '0 0 16px 0' }}>The brain of the business</p>
                {['Plan', 'Numbers', 'Tasks', 'Meetings'].map((row, i) => (
                  <div key={row} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${HAIRLINE}` }}>
                    <span style={{ fontFamily: MONO, fontSize: '14px', color: FG }}>{row}</span>
                    <span style={{ width: '40px', height: '4px', borderRadius: '2px', background: i % 2 ? PINK : 'rgba(255,255,255,0.25)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CinematicSample() {
  return (
    <SampleFrame active="/preview/studio-os-cinematic" title="Cinematic">
      <main style={{ background: '#0a0a0a', color: FG }}>
        <SampleHero backdrop={<HeroGlow />} />
        <PinnedScene />
        <section style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 40px', borderTop: `1px solid ${HAIRLINE}` }}>
          <p style={{ fontFamily: MONO, fontSize: '13px', letterSpacing: '0.1em', color: MUTED, textTransform: 'uppercase' }}>
            Sample — pinned scroll scene. Full page builds out from here.
          </p>
        </section>
      </main>
    </SampleFrame>
  );
}
