/* Asia rollout map — GSAP ScrollTrigger scrubs through the rollout sequence.
   Cities light up in order. Operating cities glow Tiger orange,
   master-license cities glow dimmer copper. Reverses on scroll-up. */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { AsiaCity } from '../../config';

gsap.registerPlugin(ScrollTrigger);

const FONT_MONO = "'IBM Plex Mono', monospace";
const ORANGE = '#FF4193'; // PROXYZ pink (operating cities)
const COPPER = '#D2FF3B'; // neon lime (master-license cities)

// Stylized SE-Asia coastline — abstracted, not geographically precise.
export const SE_ASIA_OUTLINE = `
  M 360 110
  L 420 100 L 470 120 L 510 100 L 560 110
  L 600 140 L 640 130 L 680 150 L 720 140
  L 760 160 L 800 180 L 820 220 L 810 260
  L 790 300 L 770 340 L 730 360
  L 710 400 L 680 430 L 650 440 L 620 470
  L 580 490 L 550 530 L 530 550 L 510 540
  L 490 510 L 470 480 L 450 470
  L 420 460 L 400 440 L 380 410 L 360 380
  L 340 360 L 320 340 L 310 310
  L 320 280 L 330 250 L 340 220 L 350 180
  L 355 150 L 360 120 Z
`;

export default function AsiaMap({ cities, sequence }: { cities: AsiaCity[]; sequence: string[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Map rollout sequence index → city index (cities order = sequence order)
    // sequence has 5 lines, cities has 7 entries — Tokyo/Manila/Jakarta/KL share the
    // 5th sequence line (master-license bundle).
    const cityForLine = [0, 0, 1, 2, 3]; // first two lines both light Bangkok

    if (reduced) {
      // Reveal everything statically
      lineRefs.current.forEach((el) => el && (el.style.opacity = '1'));
      dotRefs.current.forEach((g) => g && (g.style.opacity = '1'));
      return;
    }

    // Initial state — hidden
    lineRefs.current.forEach((el) => el && gsap.set(el, { opacity: 0, x: -8 }));
    dotRefs.current.forEach((g) => g && gsap.set(g, { opacity: 0, scale: 0.6, transformOrigin: 'center center' }));

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: 0.6,
        },
      });

      sequence.forEach((_, i) => {
        const line = lineRefs.current[i];
        const cityIdx = cityForLine[i] ?? i;
        if (line) {
          tl.to(line, { opacity: 1, x: 0, duration: 0.4 }, i * 0.5);
        }
        const dot = dotRefs.current[cityIdx];
        if (dot) {
          tl.to(dot, { opacity: 1, scale: 1, duration: 0.4 }, i * 0.5 + 0.15);
        }
        // For the master-license line, also light the rest of the licensed dots.
        if (i === sequence.length - 1) {
          [4, 5, 6].forEach((j) => {
            const d = dotRefs.current[j];
            if (d) tl.to(d, { opacity: 0.6, scale: 1, duration: 0.4 }, i * 0.5 + 0.3);
          });
        }
      });
    }, section);

    return () => ctx.revert();
  }, [sequence]);

  return (
    <div
      ref={sectionRef}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
        gap: '64px',
        alignItems: 'center',
        position: 'relative',
      }}
      className="lt-two-col"
    >
      {/* Left — typed sequence */}
      <div>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontFamily: FONT_MONO,
            fontSize: '15px',
            color: '#fff',
          }}
        >
          {sequence.map((line, i) => (
            <li key={line} style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span
                aria-hidden
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: i < 4 ? ORANGE : COPPER,
                  boxShadow: i < 4 ? `0 0 10px ${ORANGE}` : `0 0 6px ${COPPER}`,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <div
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'pre-wrap',
                  willChange: 'opacity, transform',
                }}
              >
                {line}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right — stylized Asia SVG */}
      <div style={{ position: 'relative' }}>
        <svg
          viewBox="200 50 700 540"
          width="100%"
          height="auto"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Asia rollout map"
        >
          {/* Background coastline outline */}
          <path
            d={SE_ASIA_OUTLINE}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Subtle grid lines */}
          <g stroke="rgba(255,255,255,0.06)" strokeWidth="0.5">
            <line x1="200" y1="200" x2="900" y2="200" />
            <line x1="200" y1="400" x2="900" y2="400" />
            <line x1="400" y1="50" x2="400" y2="600" />
            <line x1="700" y1="50" x2="700" y2="600" />
          </g>

          {/* City dots */}
          {cities.map((city, i) => {
            const color = city.type === 'operating' ? ORANGE : COPPER;
            const r = city.type === 'operating' ? 8 : 5;
            return (
              <g
                key={city.label}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                transform={`translate(${city.x}, ${city.y})`}
              >
                <circle r={r * 2.5} fill={color} opacity="0.18" />
                <circle r={r} fill={color} />
                <text
                  x={r + 8}
                  y={4}
                  fontFamily={FONT_MONO}
                  fontSize="13"
                  fill="#fff"
                  style={{ letterSpacing: '0.04em' }}
                >
                  {city.label}
                </text>
                <text
                  x={r + 8}
                  y={20}
                  fontFamily={FONT_MONO}
                  fontSize="10"
                  fill={color}
                  opacity="0.85"
                >
                  {city.timing}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
