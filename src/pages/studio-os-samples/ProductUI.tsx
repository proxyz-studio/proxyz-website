import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SampleFrame from './SampleFrame';
import SampleHero from './SampleHero';
import { FG, HAIRLINE, LIME, MAXW, MONO, MUTED, PINK, labelStyle } from '../studio-os/theme';

function HeroGlow() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '760px', height: '700px', background: `radial-gradient(circle at center, ${PINK}1f 0%, transparent 60%)`, filter: 'blur(40px)' }} />
    </div>
  );
}

const TODOS = ['Send Q3 plan to team', 'Approve vendor invoice', 'Review hiring shortlist', 'Confirm Friday cadence'];
const BARS = [42, 68, 55, 80, 61, 74];

function DashboardScene() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.pu-check', { backgroundColor: PINK, borderColor: PINK });
        gsap.set('.pu-bar', { scaleY: 1 });
        gsap.set('.pu-ai', { autoAlpha: 1, y: 0 });
        gsap.set('.pu-approved', { autoAlpha: 1 });
        gsap.set('.pu-approve', { autoAlpha: 0 });
        return;
      }
      gsap.set('.pu-bar', { scaleY: 0, transformOrigin: 'bottom' });
      gsap.set('.pu-ai', { autoAlpha: 0, y: 24 });
      gsap.set('.pu-approved', { autoAlpha: 0 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 72%', once: true },
      });
      tl.to('.pu-bar', { scaleY: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 })
        .to('.pu-check', { backgroundColor: PINK, borderColor: PINK, duration: 0.25, stagger: 0.18 }, '-=0.3')
        .to('.pu-ai', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.2')
        .to('.pu-approve', { autoAlpha: 0, duration: 0.3 }, '+=0.7')
        .to('.pu-approved', { autoAlpha: 1, duration: 0.4 }, '<0.1');
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 40px', borderTop: `1px solid ${HAIRLINE}` }}>
      <div style={{ width: '100%', maxWidth: MAXW, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(min(100%,380px),0.9fr) 1.1fr', gap: '56px', alignItems: 'center' }}>
        <div>
          <p style={{ ...labelStyle, marginBottom: '28px' }}>04 / HOW THE AI HELPS</p>
          <h2 style={{ fontFamily: MONO, fontSize: 'clamp(28px,3.6vw,48px)', fontWeight: 600, lineHeight: 1.12, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 22px 0', color: FG }}>
            It does the legwork.<br />You make the calls.
          </h2>
          <p style={{ fontFamily: MONO, fontSize: '16px', lineHeight: 1.7, color: MUTED, margin: 0, maxWidth: '46ch' }}>
            After a meeting, studioOS drafts the decisions and the to-dos. Your numbers, in one view. You approve with a click.
          </p>
        </div>

        {/* App window */}
        <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: '12px', overflow: 'hidden', background: '#0d0d0f', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '12px 16px', borderBottom: `1px solid ${HAIRLINE}`, background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ width: 9, height: 9, borderRadius: 9, background: '#ff5f57' }} />
            <span style={{ width: 9, height: 9, borderRadius: 9, background: '#febc2e' }} />
            <span style={{ width: 9, height: 9, borderRadius: 9, background: '#28c840' }} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginLeft: 10 }}>studioos.proxyz.studio</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: HAIRLINE }}>
            {/* To-dos */}
            <div style={{ background: '#0d0d0f', padding: '18px' }}>
              <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, margin: '0 0 14px 0' }}>To-dos</p>
              {TODOS.map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                  <span className="pu-check" style={{ width: 15, height: 15, borderRadius: 4, border: '1.5px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
                  <span style={{ fontFamily: MONO, fontSize: 13, color: FG }}>{t}</span>
                </div>
              ))}
            </div>
            {/* Scorecard */}
            <div style={{ background: '#0d0d0f', padding: '18px' }}>
              <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, margin: '0 0 14px 0' }}>This week</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110 }}>
                {BARS.map((h, i) => (
                  <div key={i} className="pu-bar" style={{ flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0', background: i === 3 ? PINK : 'rgba(255,255,255,0.22)' }} />
                ))}
              </div>
            </div>
          </div>
          {/* AI draft card */}
          <div className="pu-ai" style={{ margin: '1px', padding: '16px 18px', background: 'rgba(255,65,147,0.07)', borderTop: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 16, color: PINK }}>✦</span>
            <span style={{ fontFamily: MONO, fontSize: 13, color: FG, flex: 1 }}>studioOS drafted 3 follow-ups from your meeting.</span>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span className="pu-approve" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, color: '#0a0a0a', background: PINK, padding: '8px 16px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Approve</span>
              <span className="pu-approved" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 12, color: LIME, whiteSpace: 'nowrap' }}>Approved ✓</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductUISample() {
  return (
    <SampleFrame active="/preview/studio-os-product" title="Product UI">
      <main style={{ background: '#0a0a0a', color: FG }}>
        <SampleHero backdrop={<HeroGlow />} />
        <DashboardScene />
      </main>
    </SampleFrame>
  );
}
