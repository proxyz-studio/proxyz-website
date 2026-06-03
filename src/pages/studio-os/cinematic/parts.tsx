import type { CSSProperties, ReactNode } from 'react';
import { Fragment } from 'react';
import { FG, LIME, MONO, PINK } from '../theme';

/** Soft static radial glow for atmospheric depth (no animation). */
export function Glow({
  color = PINK,
  opacity = 0.16,
  size = '760px',
  top,
  left,
  right,
  bottom,
  blur = 40,
}: {
  color?: string;
  opacity?: number;
  size?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  blur?: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${color} 0%, transparent 62%)`,
        opacity,
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/** The StudioOS wordmark lockup — camelCase, lime "OS". */
export function Wordmark({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: MONO,
        fontSize: '13px',
        letterSpacing: '0.32em',
        textTransform: 'none',
        margin: 0,
        color: FG,
        ...style,
      }}
    >
      studio<span style={{ color: LIME }}>OS</span>
    </p>
  );
}

/**
 * Render copy with every "Studio OS" / "StudioOS" set as the wordmark:
 * no space, "OS" in neon lime. Inherits font size and text-transform from the
 * surrounding element, so it reads STUDIOOS in uppercase headings and StudioOS
 * in body copy.
 */
// eslint-disable-next-line react-refresh/only-export-components -- shared wordmark helper colocated with the Wordmark lockup
export function wordmark(text: string): ReactNode {
  const segments = text.split(/studio\s?os/gi);
  if (segments.length === 1) {
    return text;
  }
  return segments.map((seg, i) => (
    <Fragment key={i}>
      {seg}
      {i < segments.length - 1 && (
        <span style={{ textTransform: 'none' }}>
          studio
          <span style={{ color: LIME }}>OS</span>
        </span>
      )}
    </Fragment>
  ));
}
