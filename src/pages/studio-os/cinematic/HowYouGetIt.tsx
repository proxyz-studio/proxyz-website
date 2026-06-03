import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReveal } from '../reveal';
import { studioOsContent } from '../content';
import { DISPLAY, FG, HAIRLINE, MAXW, MONO, MUTED, PINK, labelStyle } from '../theme';
import { wordmark } from './parts';

const { howYouGetIt } = studioOsContent;

export default function HowYouGetIt() {
  const ref = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  useReveal(ref);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !lineRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: lineRef.current, start: 'top 80%', end: 'bottom 75%', scrub: 1 } },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} style={{ position: 'relative', padding: '140px 40px', borderTop: `1px solid ${HAIRLINE}` }}>
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <p data-reveal style={{ ...labelStyle, marginBottom: '28px' }}>{howYouGetIt.label}</p>
        <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: 'clamp(40px,6vw,86px)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 64px', color: FG }}>
          {howYouGetIt.heading}
        </h2>

        <div style={{ position: 'relative', paddingLeft: '60px' }}>
          {/* Drawn connecting line */}
          <div aria-hidden style={{ position: 'absolute', left: '17px', top: '12px', bottom: '12px', width: '2px', background: 'rgba(255,255,255,0.12)' }}>
            <div ref={lineRef} style={{ position: 'absolute', inset: 0, background: PINK, transformOrigin: 'top', transform: 'scaleY(0)' }} />
          </div>
          {howYouGetIt.steps.map((s, i) => (
            <div key={s.lead} data-reveal style={{ position: 'relative', paddingBottom: i === howYouGetIt.steps.length - 1 ? 0 : '48px' }}>
              <span style={{ position: 'absolute', left: '-60px', top: 0, width: '36px', height: '36px', borderRadius: '999px', border: `1px solid ${PINK}`, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: '13px', color: PINK }}>
                {i + 1}
              </span>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 'clamp(17px,1.9vw,22px)', lineHeight: 1.5 }}>
                <span style={{ color: FG, fontWeight: 500 }}>{wordmark(s.lead)} </span>
                <span style={{ color: MUTED }}>{s.rest}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
