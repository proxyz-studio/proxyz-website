import { studioOsContent } from '../../content';
import { FG, HAIRLINE, LIME, MAXW, MONO, MUTED, PINK, labelStyle } from '../../theme';
import { MODULES, cardSurface } from './data';
import { wordmark } from '../parts';

const { modules } = studioOsContent;

/** Section intro shared by every variant (label + heading + intro line). */
export function InsideHeader() {
  return (
    <div style={{ maxWidth: MAXW, margin: '0 auto 56px', padding: '0 40px', width: '100%' }}>
      <p style={{ ...labelStyle, marginBottom: '28px' }}>{wordmark(modules.label)}</p>
      <h2 style={{ fontFamily: MONO, fontSize: 'clamp(38px,5.4vw,80px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 18px', color: FG, maxWidth: '20ch' }}>
        {modules.heading}
      </h2>
      <p style={{ fontFamily: MONO, fontSize: '15px', lineHeight: 1.6, color: MUTED, margin: 0, maxWidth: '52ch' }}>{modules.intro}</p>
    </div>
  );
}

/** Breathing play triangle (CSS-animated via `.sosi-play`). */
export function PlayMark({ size = 54 }: { size?: number }) {
  return (
    <span className="sosi-play" style={{ width: size, height: size, borderRadius: '50%', border: `1px solid ${PINK}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: PINK, flex: '0 0 auto' }}>
      <svg width={size * 0.32} height={size * 0.32} viewBox="0 0 12 14" fill="currentColor" aria-hidden>
        <path d="M0 0l12 7-12 7z" />
      </svg>
    </span>
  );
}

/** Lime "coming soon" tag. */
export function ComingSoon() {
  return <span style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: LIME }}>Coming soon</span>;
}

/**
 * Motion-free fallback grid for reduced-motion and narrow screens. Every
 * variant renders this when its scroll choreography can't run.
 */
export function StaticInside() {
  return (
    <section className="sos-inside" style={{ position: 'relative', padding: '110px 40px', borderTop: `1px solid ${HAIRLINE}` }}>
      <InsideHeader />
      <div style={{ maxWidth: MAXW, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '18px' }}>
        {MODULES.map((m, i) => (
          <article key={m.name} style={{ ...cardSurface, padding: '26px', minHeight: '230px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: MONO, fontSize: '12px', letterSpacing: '0.14em', color: PINK }}>{String(i + 1).padStart(2, '0')}</span>
            <h3 style={{ fontFamily: MONO, fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '18px 0 14px', color: FG }}>{m.name}</h3>
            <p style={{ fontFamily: MONO, fontSize: '13px', lineHeight: 1.6, color: MUTED, margin: 0 }}>{m.description}</p>
          </article>
        ))}
        <article style={{ ...cardSurface, border: `1px solid ${PINK}55`, padding: '26px', minHeight: '230px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <PlayMark />
          <h3 style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', margin: 0, color: FG }}>Product walkthrough</h3>
          <ComingSoon />
        </article>
      </div>
    </section>
  );
}
