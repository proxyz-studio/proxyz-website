/* eslint-disable react-refresh/only-export-components -- co-locating the
   withProxyzMark helper with the ProxyzMark component it wraps */
import React from 'react';

type ProxyzMarkProps = {
  className?: string;
};

/**
 * PROXYZ wordmark rendered as inline spans that mirror the tricolor SVG logo:
 * PRO inherits the parent color, X is yellow, Y is teal, Z is hot pink.
 * Carries a slow shine sweep and a chromatic-aberration glitch on hover.
 */
export function ProxyzMark({ className = '' }: ProxyzMarkProps) {
  return (
    <span className={`pmark ${className}`.trim()} aria-label="PROXYZ">
      <span aria-hidden="true">PRO</span>
      <span aria-hidden="true" className="pmark-x">X</span>
      <span aria-hidden="true" className="pmark-y">Y</span>
      <span aria-hidden="true" className="pmark-z">Z</span>
    </span>
  );
}

/**
 * Walk a string and replace every PROXYZ token with a <ProxyzMark /> instance.
 * Returns a ReactNode so it can be rendered inline inside any JSX expression.
 */
export function withProxyzMark(
  text: string | undefined | null,
  keyPrefix = 'pmk',
): React.ReactNode {
  if (!text) return text ?? '';
  if (!text.includes('PROXYZ')) return text;
  const parts = text.split(/(PROXYZ)/g);
  return parts.map((part, i) =>
    part === 'PROXYZ' ? <ProxyzMark key={`${keyPrefix}-${i}`} /> : part,
  );
}

export default ProxyzMark;
