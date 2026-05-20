/* Hotel network map.
   Same SE-Asia outline as the rollout map (Section 10), but with hotel-property
   pins instead of city pins. Active partnership glows copper-gold (IHG's
   brand cue, used here only for status differentiation, not as a primary
   brand color). Pending partnerships pulse PROXYZ pink. Mapped-but-not-pursued
   show as dim copper outlines. */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { HotelMarker } from '../../config';
import { SE_ASIA_OUTLINE } from './AsiaMap';

gsap.registerPlugin(ScrollTrigger);

const FONT_MONO = "'IBM Plex Mono', monospace";
const PINK = '#FF4193';
const COPPER = '#C77C3F'; // IHG-flavored gold, used only here for hotel-active status

function pinFill(status: HotelMarker['status']) {
  switch (status) {
    case 'active':
      return COPPER;
    case 'pending':
      return PINK;
    case 'mapped':
      return 'rgba(199,124,63,0.4)';
  }
}

export default function HotelMap({ markers }: { markers: HotelMarker[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      markerRefs.current.forEach((g) => g && gsap.set(g, { opacity: 1, scale: 1 }));
      return;
    }

    markerRefs.current.forEach((g) => g && gsap.set(g, { opacity: 0, scale: 0.6, transformOrigin: 'center center' }));

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: 0.6,
        },
      });

      markers.forEach((_, i) => {
        const m = markerRefs.current[i];
        if (m) tl.to(m, { opacity: 1, scale: 1, duration: 0.5 }, i * 0.4);
      });
    }, section);

    return () => ctx.revert();
  }, [markers]);

  return (
    <div ref={sectionRef} style={{ position: 'relative' }}>
      <svg
        viewBox="200 50 700 540"
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Asia hotel network"
      >
        <defs>
          <radialGradient id="hotel-active-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COPPER} stopOpacity="0.42" />
            <stop offset="100%" stopColor={COPPER} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hotel-pending-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={PINK} stopOpacity="0.3" />
            <stop offset="100%" stopColor={PINK} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Coastline */}
        <path
          d={SE_ASIA_OUTLINE}
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Grid */}
        <g stroke="rgba(255,255,255,0.06)" strokeWidth="0.5">
          <line x1="200" y1="200" x2="900" y2="200" />
          <line x1="200" y1="400" x2="900" y2="400" />
          <line x1="400" y1="50" x2="400" y2="600" />
          <line x1="700" y1="50" x2="700" y2="600" />
        </g>

        {/* Markers */}
        {markers.map((m, i) => {
          const color = pinFill(m.status);
          const glow = m.status === 'active' ? 'url(#hotel-active-glow)' : 'url(#hotel-pending-glow)';
          const r = m.status === 'active' ? 9 : 6;
          return (
            <g
              key={m.city}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              transform={`translate(${m.x}, ${m.y})`}
            >
              {/* Outer glow */}
              <circle r={r * 4} fill={glow} />
              {/* Pulse ring for active hotel */}
              {m.status === 'active' && (
                <circle r={r * 1.8} fill="none" stroke={color} strokeWidth="1" opacity="0.7">
                  <animate attributeName="r" values={`${r * 1.8};${r * 3.4}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Core pin */}
              <circle r={r} fill={color} />
              {/* Inner highlight on active */}
              {m.status === 'active' && <circle r={r * 0.4} fill="#FFE6BD" opacity="0.85" />}

              <text
                x={r + 10}
                y={2}
                fontFamily={FONT_MONO}
                fontSize="13"
                fill="#fff"
                letterSpacing="0.04em"
              >
                {m.city}
              </text>
              <text
                x={r + 10}
                y={18}
                fontFamily={FONT_MONO}
                fontSize="10"
                fill={color}
                opacity="0.9"
              >
                {m.hotel}
              </text>
              <text
                x={r + 10}
                y={32}
                fontFamily={FONT_MONO}
                fontSize="9"
                fill="rgba(255,255,255,0.45)"
                letterSpacing="0.18em"
                style={{ textTransform: 'uppercase' }}
              >
                {m.status === 'active' ? '● ACTIVE' : '○ PENDING'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          marginTop: '24px',
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COPPER, boxShadow: `0 0 8px ${COPPER}` }} />
          Active IHG partner
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PINK, boxShadow: `0 0 8px ${PINK}` }} />
          Pending
        </span>
      </div>
    </div>
  );
}
