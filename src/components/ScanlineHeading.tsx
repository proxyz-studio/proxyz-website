import type { CSSProperties, ReactNode } from 'react';

/**
 * Editorial heading with a "horizontal scanline" decoration.
 *
 * Replaces the inline `background-clip: text` + `repeating-linear-gradient`
 * pattern that violates impeccable's gradient-text absolute ban. The text
 * here is real text (color: var(--fg)); the scanlines come from a CSS
 * `::after` pseudo-element defined in src/index.css under `.scanline-heading`.
 *
 * High-contrast / forced-colors mode drops the decorative overlay
 * automatically. Same for prefers-reduced-motion (the overlay is static, but
 * the principle is "user motion/contrast preference overrides decoration").
 *
 * Use:
 *   <ScanlineHeading>
 *     One line.<br/>
 *     <span style={{ color: 'var(--pink)' }}>Another line.</span>
 *   </ScanlineHeading>
 */
export default function ScanlineHeading({
  children,
  as = 'h1',
  style,
  className = '',
}: {
  children: ReactNode;
  as?: 'h1' | 'h2';
  style?: CSSProperties;
  className?: string;
}) {
  const Tag = as;
  return (
    <Tag
      className={`scanline-heading ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  );
}
