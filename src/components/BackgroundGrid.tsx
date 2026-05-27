/**
 * Subtle drifting diagonal lines for section backgrounds.
 *
 * Pure CSS — uses repeating-linear-gradient for the line pattern and a
 * keyframe animation defined in index.css (.background-grid-drift) to
 * slide the pattern across the section over 30s.
 *
 * Render inside a section with position: relative and overflow: hidden.
 * pointer-events: none and a low z-index so it never blocks content.
 *
 * Honors prefers-reduced-motion (animation stops, pattern remains static).
 */

type BackgroundGridProps = {
  /** Line color — full opacity. Final visibility is opacity * color alpha. */
  color?: string;
  /** Layer opacity. Keep low (0.03 - 0.08) so it doesn't compete with copy. */
  opacity?: number;
  /** Line thickness in px. 1 is hairline, 2 is visible. */
  thickness?: number;
  /** Distance between lines in px. Bigger = more whitespace, fewer lines. */
  spacing?: number;
};

export default function BackgroundGrid({
  color = '#FF4193',
  opacity = 0.05,
  thickness = 1,
  spacing = 84,
}: BackgroundGridProps) {
  return (
    <div
      aria-hidden
      className="background-grid-drift"
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent 0,
          transparent ${spacing}px,
          ${color} ${spacing}px,
          ${color} ${spacing + thickness}px
        )`,
        backgroundSize: `${Math.round(spacing * 1.414)}px ${Math.round(spacing * 1.414)}px`,
      }}
    />
  );
}
