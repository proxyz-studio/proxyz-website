import { useRef } from 'react';
import { MagneticAnchor } from '../../../components/Spatial';
import { useReveal } from '../reveal';
import { studioOsContent } from '../content';
import { DISPLAY, FG, HAIRLINE, MAXW, MONO, MUTED, PINK, labelStyle } from '../theme';
import { Glow, wordmark } from './parts';

const { bookACall } = studioOsContent;

export default function BookACall() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '140px 40px', borderTop: `1px solid ${HAIRLINE}`, overflow: 'hidden' }}>
      <Glow color={PINK} opacity={0.2} size="min(1100px,120vw)" top="-10%" left="50%" blur={40} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: MAXW, margin: '0 auto', width: '100%' }}>
        <p data-reveal style={{ ...labelStyle, marginBottom: '28px' }}>{bookACall.label}</p>
        <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: 'clamp(44px,6.4vw,96px)', fontWeight: 600, lineHeight: 1.04, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 32px', color: FG, maxWidth: '18ch' }}>
          {bookACall.heading}
        </h2>
        <p data-reveal style={{ fontFamily: MONO, fontSize: 'clamp(16px,1.8vw,20px)', lineHeight: 1.7, color: MUTED, margin: '0 0 44px', maxWidth: '52ch' }}>
          {wordmark(bookACall.body)}
        </p>
        <div data-reveal>
          <MagneticAnchor
            href={bookACall.primaryCta.href}
            style={{ fontFamily: MONO, fontSize: '14px', fontWeight: 500, color: '#0a0a0a', background: PINK, textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.1em', padding: '17px 36px', borderRadius: '2px', display: 'inline-block' }}
          >
            {bookACall.primaryCta.label}
          </MagneticAnchor>
        </div>
        <p data-reveal style={{ fontFamily: DISPLAY, fontSize: 'clamp(20px,2.4vw,32px)', fontWeight: 500, lineHeight: 1.3, color: FG, margin: '72px 0 0', maxWidth: '26ch' }}>
          {bookACall.closing}
        </p>
      </div>
    </section>
  );
}
