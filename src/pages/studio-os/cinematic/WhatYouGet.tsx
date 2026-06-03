import { useRef } from 'react';
import { useReveal } from '../reveal';
import { studioOsContent } from '../content';
import { DISPLAY, FAINT, FG, HAIRLINE, MAXW, MONO, MUTED, labelStyle } from '../theme';

const { whatYouGet } = studioOsContent;

export default function WhatYouGet() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} style={{ position: 'relative', padding: '140px 40px', borderTop: `1px solid ${HAIRLINE}` }}>
      <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
        <p data-reveal style={{ ...labelStyle, marginBottom: '28px' }}>{whatYouGet.label}</p>
        <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: 'clamp(38px,5.6vw,82px)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 64px', color: FG }}>
          {whatYouGet.heading}
        </h2>
        <div>
          {whatYouGet.bullets.map((b, i) => (
            <div
              key={b.lead}
              data-reveal
              style={{ display: 'grid', gridTemplateColumns: 'minmax(0,88px) 1fr', gap: '20px', alignItems: 'baseline', padding: '28px 0', borderTop: `1px solid ${HAIRLINE}` }}
            >
              <span style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px,3vw,44px)', fontWeight: 600, color: FAINT, lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 'clamp(17px,2vw,24px)', lineHeight: 1.5 }}>
                <span style={{ color: FG, fontWeight: 500 }}>{b.lead} </span>
                <span style={{ color: MUTED }}>{b.rest}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
