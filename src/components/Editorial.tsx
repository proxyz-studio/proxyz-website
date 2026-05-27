import type { ReactNode } from 'react';

const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";
const FONT_MONO = "'IBM Plex Mono', monospace";
const PINK = '#ff4193';

export function Marginalia({
  number,
  color,
  size = 'clamp(96px, 14vw, 200px)',
  style,
}: {
  number: string;
  color?: 'light' | 'dark';
  size?: string;
  style?: React.CSSProperties;
}) {
  const stroke = color === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)';
  return (
    <div
      aria-hidden
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: size,
        lineHeight: 0.85,
        color: 'transparent',
        WebkitTextStroke: `2px ${stroke}`,
        fontWeight: 400,
        letterSpacing: '-0.02em',
        userSelect: 'none',
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {number}
    </div>
  );
}

export function DropCap({
  children,
  color = PINK,
  letter,
}: {
  children: ReactNode;
  color?: string;
  letter?: string;
}) {
  const text = typeof children === 'string' ? children : '';
  const first = letter ?? (text ? text.charAt(0) : '');
  const rest = text ? text.slice(1) : null;
  return (
    <p
      style={{
        fontFamily: FONT_MONO,
        fontSize: '16px',
        lineHeight: 1.75,
        margin: 0,
        maxWidth: '60ch',
      }}
    >
      <span
        style={{
          float: 'left',
          fontFamily: FONT_DISPLAY,
          fontSize: '76px',
          lineHeight: 0.85,
          color: color,
          padding: '4px 14px 0 0',
          marginTop: '-4px',
        }}
      >
        {first}
      </span>
      {rest ?? children}
    </p>
  );
}

export function PullQuote({
  children,
  color = PINK,
  align = 'left',
  variant = 'dark',
}: {
  children: ReactNode;
  color?: string;
  align?: 'left' | 'center';
  variant?: 'dark' | 'light';
}) {
  return (
    <blockquote
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 'clamp(20px, 2.2vw, 28px)',
        lineHeight: 1.32,
        color: variant === 'dark' ? '#fff' : '#000',
        margin: '40px 0',
        paddingLeft: align === 'center' ? 0 : '24px',
        borderLeft: align === 'center' ? 'none' : `2px solid ${color}`,
        textAlign: align,
        fontStyle: 'italic',
        maxWidth: align === 'center' ? '36ch' : '50ch',
        marginLeft: align === 'center' ? 'auto' : 0,
        marginRight: align === 'center' ? 'auto' : 0,
      }}
    >
      <span style={{ color, marginRight: '8px' }}>"</span>
      {children}
      <span style={{ color, marginLeft: '8px' }}>"</span>
    </blockquote>
  );
}

export function MagazineFooter({
  issue = '01',
  section,
  date = 'May 2026',
  variant = 'dark',
}: {
  issue?: string;
  section?: string;
  date?: string;
  variant?: 'dark' | 'light';
}) {
  const fg = variant === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const fgFull = variant === 'dark' ? '#fff' : '#000';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        paddingTop: '24px',
        borderTop: `1px solid ${
          variant === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
        }`,
        marginTop: '40px',
      }}
    >
      {[
        { k: 'Issue', v: issue },
        { k: 'Section', v: section ?? '—' },
        { k: 'Date', v: date },
      ].map((m, i) => (
        <div key={i}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: fg,
              marginBottom: '4px',
            }}
          >
            {m.k}
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: '13px',
              color: fgFull,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {m.v}
          </div>
        </div>
      ))}
    </div>
  );
}
