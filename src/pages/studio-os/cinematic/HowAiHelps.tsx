import { useRef } from 'react';
import { useReveal } from '../reveal';
import { studioOsContent } from '../content';
import { DISPLAY, FG, HAIRLINE, LIME, MAXW, MONO, MUTED, PINK, labelStyle } from '../theme';
import { wordmark } from './parts';

/** Blue tick shown on each AI-drafted follow-up. */
const BLUE = '#4d8cff';

const { howAiHelps } = studioOsContent;
const DRAFTS = ['Send the revised quote to the client', 'Book the follow-up for Thursday', 'Update the number on the scorecard'];

export default function HowAiHelps() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} style={{ position: 'relative', padding: '140px 40px', borderTop: `1px solid ${HAIRLINE}` }}>
      <div style={{ maxWidth: MAXW, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(min(100%,440px),1.1fr) 0.9fr', gap: '64px', alignItems: 'center' }}>
        <div>
          <p data-reveal style={{ ...labelStyle, marginBottom: '28px' }}>{howAiHelps.label}</p>
          <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: 'clamp(34px,4.8vw,68px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 24px', color: FG }}>
            {howAiHelps.heading}
          </h2>
          <p data-reveal style={{ fontFamily: MONO, fontSize: '16px', lineHeight: 1.7, color: MUTED, margin: '0 0 36px', maxWidth: '52ch' }}>{wordmark(howAiHelps.lead)}</p>
          <div>
            {howAiHelps.bullets.map((b) => (
              <p key={b.lead} data-reveal style={{ fontFamily: MONO, fontSize: '15.5px', lineHeight: 1.6, margin: '0 0 16px', paddingLeft: '22px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, top: '0.1em', color: PINK }}>&#10022;</span>
                <span style={{ color: FG, fontWeight: 500 }}>{b.lead} </span>
                <span style={{ color: MUTED }}>{b.rest}</span>
              </p>
            ))}
          </div>
          <p data-reveal style={{ fontFamily: MONO, fontSize: '15px', color: FG, margin: '32px 0 0', fontWeight: 500 }}>{howAiHelps.closing}</p>
        </div>

        {/* Compact AI draft → approve beat */}
        <div data-reveal style={{ border: `1px solid ${HAIRLINE}`, borderRadius: '12px', background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', padding: '24px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: PINK, fontSize: '16px' }}>&#10022;</span>
            <span style={{ fontFamily: MONO, fontSize: '13px', color: FG }}>{wordmark('StudioOS drafted 3 follow-ups')}</span>
          </div>
          {DRAFTS.map((d, i) => (
            <div key={d} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${HAIRLINE}` }}>
              <span style={{ width: '17px', height: '17px', borderRadius: '4px', border: `1.5px solid ${PINK}`, background: PINK, flex: '0 0 auto', marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2.5 6.4l2.3 2.3L9.5 3.5" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span style={{ fontFamily: MONO, fontSize: '13px', lineHeight: 1.5, color: MUTED }}>{d}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '18px', borderTop: `1px solid ${HAIRLINE}` }}>
            <span style={{ fontFamily: MONO, fontSize: '12px', color: MUTED }}>You make the calls</span>
            <span style={{ fontFamily: MONO, fontSize: '12px', color: LIME }}>Approved &#10003;</span>
          </div>
        </div>
      </div>
    </section>
  );
}
