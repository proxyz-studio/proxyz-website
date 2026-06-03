import { useMemo } from 'react';

/**
 * Direction A — The Operating Brain, used as the HERO BACKGROUND only (the
 * type/CTA live in Hero.tsx). An abstract constellation of glowing nodes +
 * flowing connection lines reading as an intelligent system thinking.
 * Position is parameterized (cxPct/cyPct, % of the 1600x900 frame) so it can
 * sit where it least distracts from the headline. (Tew's design; adapted.)
 */

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BNode { i: number; x: number; y: number; distNorm: number; kind: string; core: boolean }
interface BEdge { a: number; b: number; tint: string; d: number }
interface BPulse { x1: number; y1: number; x2: number; y2: number; color: string; dur: number; begin: number }

function buildBrain(CX: number, CY: number) {
  const rnd = mulberry32(20260603);
  const RX = 470, RY = 410, N = 108;
  const nodes: BNode[] = [];

  for (let i = 0; i < N; i++) {
    const ang = rnd() * Math.PI * 2;
    const rr = Math.pow(rnd(), 0.58); // bias toward center -> denser core
    const x = CX + Math.cos(ang) * rr * RX + (rnd() - 0.5) * 26;
    const y = CY + Math.sin(ang) * rr * RY * 0.94 + (rnd() - 0.5) * 22;
    const distNorm = rr;
    let kind = 'white';
    const roll = rnd();
    if (distNorm < 0.5 && roll < 0.22) kind = 'lime';
    else if (roll < 0.46) kind = 'pink';
    const core = distNorm < 0.32 && rnd() < 0.7;
    nodes.push({ i, x, y, distNorm, kind, core });
  }

  const edges: BEdge[] = [];
  const seen = new Set<string>();
  for (let a = 0; a < N; a++) {
    const dists: { b: number; d: number }[] = [];
    for (let b = 0; b < N; b++) {
      if (a === b) continue;
      const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
      dists.push({ b, d: Math.hypot(dx, dy) });
    }
    dists.sort((p, q) => p.d - q.d);
    const k = 2 + (rnd() < 0.5 ? 1 : 0);
    for (let j = 0; j < k; j++) {
      const b = dists[j].b;
      if (dists[j].d > 218) continue;
      const key = a < b ? a + '-' + b : b + '-' + a;
      if (seen.has(key)) continue;
      seen.add(key);
      const inner = nodes[a].distNorm < nodes[b].distNorm ? nodes[a] : nodes[b];
      edges.push({ a, b, tint: inner.kind, d: dists[j].d });
    }
  }

  const candidates = edges
    .map((e, idx) => ({ e, idx }))
    .filter(({ e }) => Math.min(nodes[e.a].distNorm, nodes[e.b].distNorm) < 0.62);
  const pulses: BPulse[] = [];
  for (let n = 0; n < 26 && candidates.length; n++) {
    const pick = candidates.splice(Math.floor(rnd() * candidates.length), 1)[0].e;
    const outer = nodes[pick.a].distNorm > nodes[pick.b].distNorm ? nodes[pick.a] : nodes[pick.b];
    const inner = outer === nodes[pick.a] ? nodes[pick.b] : nodes[pick.a];
    pulses.push({
      x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y,
      color: pick.tint === 'lime' ? 'var(--lime)' : 'var(--pink)',
      dur: 2.4 + rnd() * 2.6, begin: -rnd() * 4,
    });
  }
  return { nodes, edges, pulses };
}

const tintColor = (k: string) => (k === 'lime' ? 'var(--lime)' : k === 'pink' ? 'var(--pink)' : 'var(--white)');

export default function HeroBrain({ cxPct, cyPct }: { cxPct: number; cyPct: number }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const CX = (cxPct / 100) * 1600;
  const CY = (cyPct / 100) * 900;
  const { nodes, edges, pulses } = useMemo(() => buildBrain(CX, CY), [CX, CY]);

  return (
    <div className="sos-brain" aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.82 }}>
      {/* protection glow — light blooming from within the cloud */}
      <div style={{ position: 'absolute', left: cxPct + '%', top: cyPct + '%', width: 1180, height: 1180, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(255,65,147,0.16) 0%, rgba(255,65,147,0.05) 34%, transparent 62%)', filter: 'blur(8px)' }} />
      <div style={{ position: 'absolute', left: cxPct + '%', top: cyPct + '%', width: 600, height: 600, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(210,255,59,0.10) 0%, transparent 60%)', filter: 'blur(6px)' }} />

      <svg viewBox="0 0 1600 900" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <filter id="aBloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" /></filter>
          <filter id="aBloomSoft" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="11" /></filter>
        </defs>

        <g className={reduced ? undefined : 'os-drift'}>
          {/* connection lines */}
          <g>
            {edges.map((e, i) => {
              const n1 = nodes[e.a], n2 = nodes[e.b];
              const col = e.tint === 'lime' ? 'rgba(210,255,59,0.20)' : e.tint === 'pink' ? 'rgba(255,65,147,0.20)' : 'rgba(232,232,232,0.10)';
              return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={col} strokeWidth={0.9} />;
            })}
          </g>

          {/* soft node halos */}
          <g filter="url(#aBloomSoft)" opacity="0.55">
            {nodes.filter((n) => n.core || n.kind !== 'white').map((n, i) => (
              <circle key={i} cx={n.x} cy={n.y} r={n.core ? 9 : 6} fill={tintColor(n.kind === 'white' ? 'pink' : n.kind)} />
            ))}
          </g>

          {/* crisp node cores, twinkling */}
          <g>
            {nodes.map((n, i) => (
              <circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={n.core ? 3.0 : 1.4 + (1 - n.distNorm) * 1.4}
                fill={tintColor(n.kind)}
                opacity={0.55 + (1 - n.distNorm) * 0.4}
                className="os-twinkle"
                style={{ animationDelay: ((i * 0.17) % 4) + 's', animationDuration: 3 + (i % 5) * 0.6 + 's' }}
              />
            ))}
          </g>

          {/* travelling data pulses (outer -> inner) */}
          {!reduced && (
            <g filter="url(#aBloom)">
              {pulses.map((p, i) => (
                <circle key={i} r="2.4" fill={p.color}>
                  <animateMotion dur={p.dur + 's'} begin={p.begin + 's'} repeatCount="indefinite" path={`M ${p.x1} ${p.y1} L ${p.x2} ${p.y2}`} />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.7;1" dur={p.dur + 's'} begin={p.begin + 's'} repeatCount="indefinite" />
                </circle>
              ))}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
