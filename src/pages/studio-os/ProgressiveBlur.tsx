import { BG } from './theme';

/**
 * A fixed gradient + backdrop-blur strip that softly blurs and fades the page
 * content as it scrolls past the top and bottom edges. Dark-themed adaptation
 * of the progressive-blur pattern. Purely decorative (pointer-events: none).
 */
export function ProgressiveBlur({
  position,
  height = '130px',
  blur = '3px',
  offset = '0px',
}: {
  position: 'top' | 'bottom';
  height?: string;
  blur?: string;
  /** Distance from the edge (used to clear the fixed nav at the top). */
  offset?: string;
}) {
  const isTop = position === 'top';
  const mask = isTop
    ? `linear-gradient(to bottom, ${BG} 36%, transparent)`
    : `linear-gradient(to top, ${BG} 36%, transparent)`;
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        width: '100%',
        height,
        zIndex: 40,
        pointerEvents: 'none',
        ...(isTop ? { top: offset } : { bottom: offset }),
        background: isTop
          ? `linear-gradient(to top, transparent, ${BG})`
          : `linear-gradient(to bottom, transparent, ${BG})`,
        maskImage: mask,
        WebkitMaskImage: mask,
        backdropFilter: `blur(${blur})`,
        WebkitBackdropFilter: `blur(${blur})`,
      }}
    />
  );
}
