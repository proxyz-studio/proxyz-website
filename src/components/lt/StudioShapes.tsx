/* Lazy Tiger studio shape system.
   Cardio circle (pink-red), Reformer triangle (orange), Yoga square (lime).
   Outlined badge style — matches the in-app screens in the Concepting deck. */

import type { LayerModality } from '../../config';

const STROKE = 2;

export function CardioCircle({ size = 18, stroke = STROKE }: { size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Cardio Studio">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--studio-cardio)"
        strokeWidth={stroke}
      />
    </svg>
  );
}

export function ReformerTriangle({ size = 18, stroke = STROKE }: { size?: number; stroke?: number }) {
  const pad = stroke / 2 + 1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Reformer Studio">
      <polygon
        points={`${size / 2},${pad} ${size - pad},${size - pad} ${pad},${size - pad}`}
        fill="none"
        stroke="var(--studio-reformer)"
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function YogaSquare({ size = 18, stroke = STROKE }: { size?: number; stroke?: number }) {
  const pad = stroke / 2 + 1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Yoga Studio">
      <rect
        x={pad}
        y={pad}
        width={size - pad * 2}
        height={size - pad * 2}
        fill="none"
        stroke="var(--studio-yoga)"
        strokeWidth={stroke}
      />
    </svg>
  );
}

export function ShapeFor({ modality, size = 18 }: { modality: LayerModality; size?: number }) {
  if (modality === 'cardio') return <CardioCircle size={size} />;
  if (modality === 'reformer') return <ReformerTriangle size={size} />;
  return <YogaSquare size={size} />;
}
