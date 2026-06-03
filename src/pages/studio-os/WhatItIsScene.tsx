import { useRef } from 'react';
import { useBatchReveal } from '../../lib/scrollChoreography';
import { studioOsContent } from './content';
import { DISPLAY, FG, LIME, MAXW, MONO, MUTED, labelStyle } from './theme';

const { whatItIs } = studioOsContent;

export default function WhatItIsScene() {
  const sectionRef = useRef<HTMLElement>(null);
  useBatchReveal(sectionRef, '.sos-reveal', { y: 28, duration: 0.75, stagger: 0.1 });

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '140px 40px 160px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
        <p className="sos-reveal" style={{ ...labelStyle, marginBottom: '36px' }}>{whatItIs.label}</p>
        <h2
          className="sos-reveal"
          style={{
            fontFamily: DISPLAY,
            fontSize: 'clamp(32px, 4.8vw, 68px)',
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            margin: '0 0 48px 0',
            color: FG,
          }}
        >
          {whatItIs.heading}
        </h2>

        <div style={{ maxWidth: '60ch' }}>
          {whatItIs.paragraphs.map((para, i) => {
            const isLast = i === whatItIs.paragraphs.length - 1;
            return (
              <p
                key={para}
                className="sos-reveal"
                style={{
                  fontFamily: MONO,
                  fontSize: isLast ? 'clamp(18px, 2.2vw, 26px)' : 'clamp(15px, 1.6vw, 18px)',
                  fontWeight: 400,
                  lineHeight: isLast ? 1.4 : 1.7,
                  color: isLast ? FG : MUTED,
                  margin: isLast ? '34px 0 0 0' : '0 0 22px 0',
                  maxWidth: isLast ? '24ch' : undefined,
                }}
              >
                {isLast ? (
                  <>
                    If you can use a phone, you can run your company on it
                    <span style={{ color: LIME }}>.</span>
                  </>
                ) : (
                  para
                )}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}
