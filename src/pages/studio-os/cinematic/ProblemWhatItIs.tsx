import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { studioOsContent } from '../content';
import { DISPLAY, FG, MAXW, MONO, MUTED, labelStyle } from '../theme';
import SystemMap from './SystemMap';

const { problem } = studioOsContent;

/**
 * The signature cinematic moment: the section pins and, as you scroll, the
 * Problem beat dissolves up while the System Map (the whole company as one
 * connected brain) resolves into place — the visual answer to "what it is".
 */
export default function ProblemWhatItIs() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.pw-problem', { autoAlpha: 0 });
        gsap.set('.pw-what', { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=280%', scrub: 1, pin: true, anticipatePin: 1 },
      });
      tl.from('.pw-problem .pw-anim', { autoAlpha: 0, yPercent: 60, stagger: 0.1, ease: 'expo.out', duration: 0.8 })
        .to('.pw-problem', { autoAlpha: 0, yPercent: -26, ease: 'power1.in', duration: 1 }, '+=0.7')
        .fromTo('.pw-what', { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.3 }, '<0.2');
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* Problem beat — constrained column, vertically centered */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
          <div className="pw-problem">
            <p className="pw-anim" style={{ ...labelStyle, marginBottom: '28px' }}>{problem.label}</p>
            <h2 className="pw-anim" style={{ fontFamily: DISPLAY, fontSize: 'clamp(40px,6vw,86px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 28px', color: FG }}>
              {problem.heading}
            </h2>
            <p className="pw-anim" style={{ fontFamily: MONO, fontSize: '16px', lineHeight: 1.65, color: MUTED, margin: 0, maxWidth: '46ch' }}>
              {problem.bodyLines[problem.bodyLines.length - 1]}
            </p>
          </div>
        </div>
      </div>

      {/* What-it-is beat = full-bleed System Map */}
      <div className="pw-what" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', visibility: 'hidden', padding: '24px' }}>
        <div style={{ width: 'min(88%, calc(84vh * 16 / 9))', aspectRatio: '16 / 9', maxHeight: '88%' }}>
          <SystemMap />
        </div>
      </div>
    </section>
  );
}
