/* ─── DeckPanel — reusable primitive components for the product deck ── */

import type { ReactNode } from 'react';
import { GOLD } from '../../theme';
import Reveal from '../../../components/Reveal';

/** The inner column wrapper — always max 960px, centered. */
export function PanelColumn({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 80px)',
        position: 'relative',
        zIndex: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Gold eyebrow label above headlines. */
export function Eyebrow({ text }: { text: string }) {
  return (
    <Reveal>
      <p
        style={{
          fontFamily: 'var(--deck-font-label, "Hanken Grotesk", sans-serif)',
          fontSize: '12px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: GOLD,
          margin: '0 0 18px 0',
          fontWeight: 500,
        }}
      >
        {text}
      </p>
    </Reveal>
  );
}

/** The large deck headline — always Cormorant display. */
export function DeckHeadline({
  text,
  color,
  headFont,
  withHalo = false,
}: {
  text: string;
  color: string;
  headFont: string;
  withHalo?: boolean;
}) {
  const el = (
    <h2
      style={{
        fontFamily: headFont,
        fontWeight: 500,
        fontSize: 'clamp(34px, 5.2vw, 66px)',
        lineHeight: 1.08,
        color,
        margin: '0 0 24px 0',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {text}
    </h2>
  );

  if (!withHalo) return <Reveal>{el}</Reveal>;

  return (
    <Reveal>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Subtle gold atmospheric halo behind cover/ask headlines */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '110%',
            height: '260%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(ellipse, ${GOLD} 0%, transparent 65%)`,
            opacity: 0.10,
            pointerEvents: 'none',
            filter: 'blur(38px)',
            zIndex: 0,
          }}
        />
        {el}
      </div>
    </Reveal>
  );
}

/** Standfirst / lede under the headline. */
export function DeckLede({
  text,
  color,
  headFont,
}: {
  text: string;
  color: string;
  headFont: string;
}) {
  return (
    <Reveal delay={80}>
      <p
        style={{
          fontFamily: headFont,
          fontStyle: 'italic',
          fontSize: 'clamp(19px, 2.4vw, 26px)',
          lineHeight: 1.45,
          color,
          margin: '0 0 36px 0',
          maxWidth: '660px',
        }}
      >
        {text}
      </p>
    </Reveal>
  );
}

/** Paragraph body text. */
export function DeckBody({
  lines,
  color,
}: {
  lines: string[];
  color: string;
}) {
  return (
    <Reveal delay={100}>
      <div style={{ maxWidth: '62ch' }}>
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: 'var(--deck-font-body, "Hanken Grotesk", sans-serif)',
              fontSize: '17px',
              lineHeight: 1.7,
              color,
              margin: i === lines.length - 1 ? '0' : '0 0 16px 0',
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </Reveal>
  );
}

/** A pull-quote set apart — gold left-border, italic headline font. */
export function DeckPull({
  text,
  headlineColor,
  headFont,
}: {
  text: string;
  headlineColor: string;
  headFont: string;
}) {
  return (
    <Reveal delay={120}>
      <div
        style={{
          margin: '52px 0 0 0',
          paddingLeft: '24px',
          borderLeft: `2px solid ${GOLD}`,
        }}
      >
        <p
          style={{
            fontFamily: headFont,
            fontStyle: 'italic',
            fontSize: 'clamp(20px, 2.6vw, 30px)',
            lineHeight: 1.3,
            color: headlineColor,
            margin: 0,
          }}
        >
          {text}
        </p>
      </div>
    </Reveal>
  );
}
