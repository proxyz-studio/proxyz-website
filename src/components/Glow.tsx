const PINK = '#ff4193';
const MINT = '#5BC9B8';
const BUTTER = '#F2D78C';

/**
 * Option D — Animated mesh of three drifting color blobs (pink/mint/butter).
 * Place inside a position:relative; overflow:hidden parent.
 * Quiet by design — opacity 0.07–0.15, heavy blur, 22–28s loops.
 */
export function HeroMesh({
  intensity = 1,
  style,
}: {
  intensity?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        ...style,
      }}
    >
      <div
        className="glow-mesh-a"
        style={{
          position: 'absolute',
          top: '-150px',
          left: '8%',
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${PINK} 0%, transparent 60%)`,
          opacity: 0.15 * intensity,
          filter: 'blur(50px)',
        }}
      />
      <div
        className="glow-mesh-b"
        style={{
          position: 'absolute',
          bottom: '-200px',
          right: '4%',
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${MINT} 0%, transparent 60%)`,
          opacity: 0.10 * intensity,
          filter: 'blur(60px)',
        }}
      />
      <div
        className="glow-mesh-c"
        style={{
          position: 'absolute',
          top: '28%',
          right: '24%',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${BUTTER} 0%, transparent 60%)`,
          opacity: 0.07 * intensity,
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}

/**
 * Option C — Soft elliptical halo centered behind a heading.
 * Place inside a position:relative; overflow:hidden parent.
 * Pass position to anchor it behind a specific element.
 */
export function HeadlineHalo({
  color = PINK,
  width = '700px',
  height = '320px',
  top = '50%',
  left = '50%',
  opacity = 0.16,
  blur = 50,
  style,
}: {
  color?: string;
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  opacity?: number;
  blur?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top,
        left,
        width,
        height,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(ellipse, ${color} 0%, transparent 65%)`,
        opacity,
        pointerEvents: 'none',
        filter: `blur(${blur}px)`,
        zIndex: 0,
        ...style,
      }}
    />
  );
}

/**
 * Option E — 2px pink edge rule at the top with a soft vertical glow fade below.
 * Place inside a position:relative parent. Rule sits flush at top.
 */
export function EdgeRule({
  color = PINK,
  fadeHeight = 180,
  ruleOpacity = 0.85,
  fadeOpacity = '22',
  style,
}: {
  color?: string;
  fadeHeight?: number;
  ruleOpacity?: number;
  /** Two-digit hex alpha appended to the color for the fade (e.g. '22' = ~13%) */
  fadeOpacity?: string;
  style?: React.CSSProperties;
}) {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${color} 20%, ${color} 80%, transparent 100%)`,
          pointerEvents: 'none',
          opacity: ruleOpacity,
          zIndex: 1,
          ...style,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${fadeHeight}px`,
          background: `linear-gradient(180deg, ${color}${fadeOpacity} 0%, transparent 100%)`,
          pointerEvents: 'none',
          filter: 'blur(20px)',
          zIndex: 0,
        }}
      />
    </>
  );
}
