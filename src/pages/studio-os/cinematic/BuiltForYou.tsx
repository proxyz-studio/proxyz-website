import { useRef } from 'react';
import { useReveal } from '../reveal';
import { studioOsContent } from '../content';
import { DISPLAY, FG, HAIRLINE, MONO, MUTED, PINK, labelStyle } from '../theme';
import { wordmark } from './parts';

const { builtForYou } = studioOsContent;
const SHAPES = ['Staff', 'Stock', 'Clients', 'Jobs'];

export default function BuiltForYou() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} style={{ position: 'relative', padding: '140px 40px', borderTop: `1px solid ${HAIRLINE}` }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <p data-reveal style={{ ...labelStyle, marginBottom: '28px' }}>{builtForYou.label}</p>
        <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: 'clamp(40px,6vw,86px)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 36px', color: FG }}>
          {builtForYou.heading}
        </h2>
        {builtForYou.paragraphs.map((p, i) => (
          <p key={p} data-reveal style={{ fontFamily: MONO, fontSize: i === builtForYou.paragraphs.length - 1 ? 'clamp(17px,2vw,22px)' : '16px', lineHeight: 1.7, color: i === builtForYou.paragraphs.length - 1 ? FG : MUTED, margin: '0 0 20px', maxWidth: '56ch' }}>
            {wordmark(p)}
          </p>
        ))}
        <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '36px' }}>
          {SHAPES.map((s) => (
            <span key={s} style={{ fontFamily: MONO, fontSize: '13px', letterSpacing: '0.04em', color: FG, border: `1px solid ${PINK}66`, borderRadius: '999px', padding: '9px 20px' }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
