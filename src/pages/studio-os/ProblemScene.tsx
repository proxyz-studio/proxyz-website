import { useRef } from 'react';
import { useBatchReveal } from '../../lib/scrollChoreography';
import { studioOsContent } from './content';
import { DISPLAY, FG, MAXW, MONO, MUTED, labelStyle } from './theme';

const { problem } = studioOsContent;

export default function ProblemScene() {
  const sectionRef = useRef<HTMLElement>(null);
  useBatchReveal(sectionRef, '.sos-reveal', { y: 28, duration: 0.7, stagger: 0.08 });

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 40px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
        <p className="sos-reveal" style={{ ...labelStyle, marginBottom: '36px' }}>{problem.label}</p>
        <h2
          className="sos-reveal"
          style={{
            fontFamily: DISPLAY,
            fontSize: 'clamp(28px, 4.2vw, 56px)',
            fontWeight: 600,
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            margin: '0 0 44px 0',
            maxWidth: '22ch',
            color: FG,
            textWrap: 'balance',
          }}
        >
          {problem.heading}
        </h2>

        <div style={{ maxWidth: '56ch' }}>
          {problem.bodyLines.map((line, i) => {
            const isLast = i === problem.bodyLines.length - 1;
            return (
              <p
                key={line}
                className="sos-reveal"
                style={{
                  fontFamily: MONO,
                  fontSize: isLast ? 'clamp(17px, 2vw, 22px)' : 'clamp(15px, 1.6vw, 18px)',
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: isLast ? FG : MUTED,
                  margin: isLast ? '26px 0 0 0' : '0 0 14px 0',
                }}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}
