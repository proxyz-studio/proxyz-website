import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FG, HAIRLINE, LIME, MONO, MUTED, PINK } from '../theme';
import { wordmark } from './parts';
import { ComingSoon, InsideHeader, PlayMark, StaticInside } from './inside/shared';
import { LABELS, MODULES, canPin, cardSurface } from './inside/data';

/**
 * "Inside StudioOS" — the CINEMA coverflow. A pinned horizontal gallery: the
 * card nearest screen-centre grows, tilts toward you, and lights while its
 * neighbours recede and dim. A progress rail counts the modules as they pass.
 * The walkthrough slot is the final, brightest card.
 */
export default function Inside() {
  const [pin] = useState(canPin);
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);

  // Setup in useEffect (NOT useLayoutEffect) so this pin is created AFTER the
  // pinned Problem section above it; otherwise ScrollTrigger computes the wrong
  // start and the section ends up mispositioned (the "everything overlapping" bug).
  useEffect(() => {
    if (!pin) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const section = ref.current;
      if (!track || !section) return;
      const cards = gsap.utils.toArray<HTMLElement>('.cin-card', track);
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      if (distance() <= 0) return;

      // Recompute each card's focus (0..1 by nearness to centre) every frame.
      const focusPass = () => {
        const centre = window.innerWidth / 2;
        let best = 0;
        let bestD = Infinity;
        cards.forEach((card, i) => {
          const r = card.getBoundingClientRect();
          const d = (r.left + r.width / 2 - centre) / window.innerWidth;
          const ad = Math.abs(d);
          const focus = gsap.utils.clamp(0, 1, 1 - ad * 1.7);
          gsap.set(card, {
            scale: 0.8 + focus * 0.2,
            rotationY: gsap.utils.clamp(-12, 12, -d * 18),
            z: focus * 80,
            opacity: 0.34 + focus * 0.66,
          });
          card.style.setProperty('--focus', focus.toFixed(3));
          if (ad < bestD) {
            bestD = ad;
            best = i;
          }
        });
        if (counterRef.current) counterRef.current.textContent = String(best + 1).padStart(2, '0');
        if (nameRef.current) nameRef.current.textContent = LABELS[best];
      };

      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + distance(),
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            focusPass();
            if (fillRef.current) fillRef.current.style.transform = `scaleX(${self.progress.toFixed(4)})`;
          },
          onRefresh: focusPass,
        },
      });
      focusPass();
      ScrollTrigger.refresh();
    }, ref);
    return () => ctx.revert();
  }, [pin]);

  if (!pin) return <StaticInside />;

  return (
    <section ref={ref} className="sos-inside" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '90px 0', borderTop: `1px solid ${HAIRLINE}`, overflow: 'hidden' }}>
      <InsideHeader />

      <div style={{ overflow: 'hidden', width: '100%', perspective: '1500px' }}>
        <div ref={trackRef} style={{ display: 'flex', gap: '26px', padding: '24px calc(50vw - 190px)', width: 'max-content' }}>
          {MODULES.map((m, i) => (
            <article key={m.name} className="cin-card" style={{ ...cardSurface, width: '380px', flex: '0 0 auto', padding: '34px', minHeight: '340px', display: 'flex', flexDirection: 'column', transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}>
              <span className="cin-num" style={{ fontFamily: MONO, fontSize: '13px', letterSpacing: '0.16em', color: PINK }}>{String(i + 1).padStart(2, '0')}</span>
              <span className="cin-rule" aria-hidden />
              <h3 style={{ fontFamily: MONO, fontSize: '26px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 16px', color: FG }}>{m.name}</h3>
              <p style={{ fontFamily: MONO, fontSize: '14px', lineHeight: 1.65, color: MUTED, margin: 0 }}>{m.description}</p>
            </article>
          ))}
          <article className="cin-card" style={{ ...cardSurface, border: `1px solid ${PINK}66`, width: '440px', flex: '0 0 auto', padding: '34px', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '20px', transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}>
            <PlayMark size={62} />
            <h3 style={{ fontFamily: MONO, fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', margin: 0, color: FG }}>Product walkthrough</h3>
            <p style={{ fontFamily: MONO, fontSize: '13px', color: MUTED, margin: 0, maxWidth: '30ch' }}>{wordmark('A guided tour of StudioOS, dropping in here soon.')}</p>
            <ComingSoon />
          </article>
        </div>
      </div>

      {/* progress rail */}
      <div style={{ maxWidth: '1180px', margin: '46px auto 0', padding: '0 40px', width: '100%', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontFamily: MONO, fontSize: '12px', letterSpacing: '0.12em', minWidth: '58px' }}>
          <span ref={counterRef} style={{ color: PINK }}>01</span>
          <span style={{ color: MUTED }}> / {String(LABELS.length).padStart(2, '0')}</span>
        </span>
        <div style={{ position: 'relative', flex: 1, height: '2px', background: HAIRLINE, overflow: 'hidden' }}>
          <div ref={fillRef} style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${PINK}, ${LIME})`, transform: 'scaleX(0)', transformOrigin: 'left' }} />
        </div>
        <span ref={nameRef} style={{ fontFamily: MONO, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: FG, minWidth: '120px', textAlign: 'right' }}>{LABELS[0]}</span>
      </div>
    </section>
  );
}
