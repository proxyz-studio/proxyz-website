import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SampleFrame from './SampleFrame';
import { MagneticAnchor } from '../../components/Spatial';
import { studioOsContent } from '../studio-os/content';
import { DISPLAY, FG, LIME, MAXW, MONO, MUTED, PINK } from '../studio-os/theme';

const { hero, whatItIs } = studioOsContent;
const MARQUEE = 'ONE PLACE TO RUN YOUR WHOLE COMPANY ✦ THE OPERATING BRAIN ✦ ';

export default function KineticSample() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.kn-line-inner, .kn-fade, .kn-reveal', { yPercent: 0, opacity: 1, y: 0 });
        return;
      }
      gsap.set('.kn-line-inner', { yPercent: 120 });
      gsap.set('.kn-fade', { opacity: 0, y: 16 });
      gsap
        .timeline({ delay: 0.1 })
        .to('.kn-line-inner', { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 })
        .to('.kn-fade', { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.1 }, '-=0.6');

      gsap.utils.toArray<HTMLElement>('.kn-reveal').forEach((el) => {
        gsap.from(el, {
          yPercent: 115,
          ease: 'expo.out',
          duration: 1,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <SampleFrame active="/preview/studio-os-kinetic" title="Kinetic">
      <style>{`@keyframes snKineticMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <main ref={ref} style={{ background: '#0a0a0a', color: FG, overflow: 'hidden' }}>
        {/* Hero — oversized type */}
        <section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '150px 40px 60px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
            <p className="kn-fade" style={{ fontFamily: MONO, fontSize: '13px', letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 24px 0', color: FG }}>
              Studio<span style={{ color: LIME }}>OS</span>
            </p>
            <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(46px, 9vw, 150px)', fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0, color: FG }}>
              {hero.h1Lines.map((line, i) => (
                <span key={line} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.08em' }}>
                  <span className="kn-line-inner" style={{ display: 'block', willChange: 'transform', color: i === 1 ? PINK : FG }}>{line}</span>
                </span>
              ))}
            </h1>
            <div className="kn-fade" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '40px' }}>
              <MagneticAnchor href={hero.primaryCta.href} style={{ fontFamily: MONO, fontSize: '13px', fontWeight: 500, color: '#0a0a0a', background: PINK, textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.1em', padding: '15px 30px', borderRadius: '2px' }}>
                {hero.primaryCta.label}
              </MagneticAnchor>
            </div>
          </div>
        </section>

        {/* Scrolling word-band */}
        <div aria-hidden style={{ borderTop: `1px solid ${PINK}`, borderBottom: `1px solid ${PINK}`, padding: '20px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'inline-flex', animation: 'snKineticMarquee 24s linear infinite', willChange: 'transform' }}>
            {[0, 1].map((k) => (
              <span key={k} style={{ fontFamily: DISPLAY, fontSize: 'clamp(30px,5vw,64px)', fontWeight: 700, textTransform: 'uppercase', color: 'transparent', WebkitTextStroke: `1px ${FG}`, letterSpacing: '0.02em', paddingRight: '0.3em' }}>
                {MARQUEE.repeat(3)}
              </span>
            ))}
          </div>
        </div>

        {/* Pink color-block transition */}
        <section style={{ background: PINK, color: '#0a0a0a', padding: '140px 40px', overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
            <p style={{ fontFamily: MONO, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 32px 0', color: 'rgba(10,10,10,0.65)' }}>{whatItIs.label}</p>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(40px, 7vw, 110px)', fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0 }}>
              <span style={{ display: 'block', overflow: 'hidden' }}><span className="kn-reveal" style={{ display: 'block' }}>The brain of</span></span>
              <span style={{ display: 'block', overflow: 'hidden' }}><span className="kn-reveal" style={{ display: 'block' }}>the business.</span></span>
            </h2>
            <p style={{ fontFamily: MONO, fontSize: 'clamp(16px,1.8vw,20px)', lineHeight: 1.6, margin: '40px 0 0 0', maxWidth: '40ch', color: 'rgba(10,10,10,0.8)' }}>
              {whatItIs.paragraphs[2]}
            </p>
          </div>
        </section>

        <section style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 40px' }}>
          <p style={{ fontFamily: MONO, fontSize: '12px', letterSpacing: '0.1em', color: MUTED, textTransform: 'uppercase' }}>
            Sample — kinetic type + word-band + color-block. Full page builds out from here.
          </p>
        </section>
      </main>
    </SampleFrame>
  );
}
