/* Lazy Tiger helmet — SVG illustration with the deck's geometry:
   - pointed cat ears, central vertical orange stripe down the forehead,
   - tiger-stripe linework on the cheeks, dark visor, glowing V-jaw piece.
   60 BPM breathing scale-pulse, dual rim lights (PROXYZ pink + Tiger orange),
   cursor-tracking yaw. SVG-based for performance (<50 KB, 60 fps).
   TODO: swap for a custom Spline scene when geometry is finalized. */

import { useEffect, useRef } from 'react';

const ORANGE = '#FF6E1F';
const PINK = '#FF4193';
const BG = '#000';

export interface TigerHelmetTheme {
  /** Color of the neon stripe linework. */
  stripe?: string;
  /** Inner crisp highlight at the very center of the stripes. */
  stripeHighlight?: string;
  /** Soft rim light to the left of the helmet. */
  rimLeft?: string;
  /** Soft rim light to the right of the helmet. */
  rimRight?: string;
  /** Override the helmet body gradient. Use 'chrome' for a silver finish,
   *  'matte' (default) for the brand-standard matte black,
   *  'warm' for terracotta/bronze on light backgrounds,
   *  'bubble' for a soft pink-tinted glossy body. */
  body?: 'matte' | 'chrome' | 'warm' | 'noir' | 'bubble';
}

export default function TigerHelmet({ size = 520, theme }: { size?: number; theme?: TigerHelmetTheme }) {
  const stripe = theme?.stripe ?? ORANGE;
  const stripeHighlight = theme?.stripeHighlight ?? '#FFCC99';
  const rimLeftColor = theme?.rimLeft ?? PINK;
  const rimRightColor = theme?.rimRight ?? ORANGE;
  const body = theme?.body ?? 'matte';

  const bodyStops = (() => {
    switch (body) {
      case 'chrome':
        return [
          { offset: '0%', color: '#F4F4F2' },
          { offset: '55%', color: '#A8ADB4' },
          { offset: '100%', color: '#3A3D44' },
        ];
      case 'warm':
        return [
          { offset: '0%', color: '#5A3A2A' },
          { offset: '55%', color: '#2E1F18' },
          { offset: '100%', color: '#160E08' },
        ];
      case 'noir':
        return [
          { offset: '0%', color: '#1c1c24' },
          { offset: '55%', color: '#0a0a12' },
          { offset: '100%', color: '#04040a' },
        ];
      case 'bubble':
        return [
          { offset: '0%', color: '#FFB8D4' },
          { offset: '55%', color: '#E04A87' },
          { offset: '100%', color: '#5C0A30' },
        ];
      case 'matte':
      default:
        return [
          { offset: '0%', color: '#1a1a1a' },
          { offset: '55%', color: '#0c0c0c' },
          { offset: '100%', color: '#000' },
        ];
    }
  })();
  const wrapRef = useRef<HTMLDivElement>(null);
  const helmetRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ yaw: 0, pitch: 0 });
  const currentRef = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const helmet = helmetRef.current;
    if (!wrap || !helmet) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const onMove = (e: MouseEvent) => {
      // Track relative to viewport center — predator scanning the room.
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const nx = (e.clientX - cx) / window.innerWidth;
      const ny = (e.clientY - cy) / window.innerHeight;
      targetRef.current.yaw = nx * 16; // ±8° each side
      targetRef.current.pitch = ny * 8; // smaller pitch range
    };

    const tick = () => {
      const lerp = 0.08;
      currentRef.current.yaw += (targetRef.current.yaw - currentRef.current.yaw) * lerp;
      currentRef.current.pitch += (targetRef.current.pitch - currentRef.current.pitch) * lerp;
      helmet.style.transform = `perspective(1200px) rotateY(${currentRef.current.yaw}deg) rotateX(${-currentRef.current.pitch}deg)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: size,
        aspectRatio: '1 / 1',
        margin: '0 auto',
        perspective: '1200px',
      }}
      aria-label="Lazy Tiger helmet — animated illustration"
    >
      {/* Rim light: PROXYZ pink, left side */}
      <div
        aria-hidden
        className="lt-rim"
        style={{
          position: 'absolute',
          left: '-12%',
          top: '8%',
          width: '70%',
          height: '85%',
          background: `radial-gradient(ellipse at right, ${rimLeftColor}55 0%, transparent 65%)`,
          filter: 'blur(36px)',
          pointerEvents: 'none',
          animation: 'lt-rim-breathe 1s ease-in-out infinite',
        }}
      />
      {/* Rim light: right side */}
      <div
        aria-hidden
        className="lt-rim"
        style={{
          position: 'absolute',
          right: '-12%',
          top: '8%',
          width: '70%',
          height: '85%',
          background: `radial-gradient(ellipse at left, ${rimRightColor}66 0%, transparent 65%)`,
          filter: 'blur(36px)',
          pointerEvents: 'none',
          animation: 'lt-rim-breathe 1s ease-in-out infinite',
        }}
      />

      <div
        ref={helmetRef}
        className="lt-helmet-breathe"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformOrigin: 'center center',
          transition: 'transform 80ms linear',
          animation: 'lt-helmet-breathe 1s ease-in-out infinite',
          willChange: 'transform',
        }}
      >
        <svg
          viewBox="0 0 400 500"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ display: 'block', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6))' }}
        >
          <defs>
            {/* Helmet body gradient — theme-aware */}
            <radialGradient id="helmet-body" cx="50%" cy="40%" r="65%">
              {bodyStops.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </radialGradient>
            {/* Visor gradient — tinted, slight reflection */}
            <linearGradient id="visor-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d1d1d" />
              <stop offset="50%" stopColor="#0a0a0a" />
              <stop offset="100%" stopColor="#161616" />
            </linearGradient>
            {/* Orange neon glow filter */}
            <filter id="neon-orange" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Helmet body — rounded shell with two pointed cat ears at top */}
          <path
            d="M 200 30
               L 145 80
               L 80 90
               C 60 130, 50 200, 70 280
               C 85 340, 120 400, 165 430
               L 235 430
               C 280 400, 315 340, 330 280
               C 350 200, 340 130, 320 90
               L 255 80
               Z"
            fill="url(#helmet-body)"
            stroke="rgba(255,110,31,0.18)"
            strokeWidth="1"
          />

          {/* Left ear — pointed triangle with orange outline */}
          <path
            d="M 80 90 L 100 30 L 145 80 Z"
            fill="#0a0a0a"
            stroke={stripe}
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#neon-orange)"
          />
          {/* Right ear */}
          <path
            d="M 320 90 L 300 30 L 255 80 Z"
            fill="#0a0a0a"
            stroke={stripe}
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#neon-orange)"
          />

          {/* Central forehead stripe — vertical orange neon line.
              Two passes: a soft glow underneath, a crisp bright line on top.
              The filter blurs the bottom layer; the top stays sharp. */}
          <line
            x1="200"
            y1="50"
            x2="200"
            y2="205"
            stroke={stripe}
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.45"
            filter="url(#neon-orange)"
          />
          <line
            x1="200"
            y1="50"
            x2="200"
            y2="205"
            stroke={stripe}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="200"
            y1="50"
            x2="200"
            y2="205"
            stroke={stripeHighlight}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Tiger-stripe linework — left cheek */}
          <path
            d="M 95 130 Q 80 180, 90 230 M 110 180 Q 100 220, 115 260 M 90 270 Q 100 310, 130 340"
            fill="none"
            stroke={stripe}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
            filter="url(#neon-orange)"
          />
          {/* Tiger-stripe linework — right cheek */}
          <path
            d="M 305 130 Q 320 180, 310 230 M 290 180 Q 300 220, 285 260 M 310 270 Q 300 310, 270 340"
            fill="none"
            stroke={stripe}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
            filter="url(#neon-orange)"
          />

          {/* Inner forehead curve — extends central stripe down */}
          <path
            d="M 160 110 Q 200 100, 240 110"
            fill="none"
            stroke={stripe}
            strokeWidth="2"
            opacity="0.6"
            filter="url(#neon-orange)"
          />

          {/* Visor — dark tinted, wraps lower face */}
          <path
            d="M 110 200
               Q 200 220, 290 200
               L 280 290
               Q 200 305, 120 290
               Z"
            fill="url(#visor-grad)"
            stroke={stripe}
            strokeWidth="2"
            strokeLinejoin="round"
            filter="url(#neon-orange)"
          />

          {/* Visor inner reflection */}
          <path
            d="M 130 220 Q 200 235, 270 220"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2"
          />

          {/* V-jaw piece — glowing orange triangular vent */}
          <path
            d="M 175 330 L 200 365 L 225 330"
            fill="none"
            stroke={stripe}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#neon-orange)"
          />

          {/* Jaw guard — bottom curve */}
          <path
            d="M 145 320 Q 200 380, 255 320"
            fill="none"
            stroke="rgba(255,110,31,0.45)"
            strokeWidth="1.5"
          />

          {/* Side ear-piece detail — circular acoustic vent, left + right */}
          <circle cx="80" cy="240" r="14" fill="#0a0a0a" stroke="rgba(255,110,31,0.4)" strokeWidth="1" />
          <circle cx="320" cy="240" r="14" fill="#0a0a0a" stroke="rgba(255,110,31,0.4)" strokeWidth="1" />
          <circle cx="80" cy="240" r="4" fill={stripe} opacity="0.6" filter="url(#neon-orange)" />
          <circle cx="320" cy="240" r="4" fill={stripe} opacity="0.6" filter="url(#neon-orange)" />
        </svg>
      </div>

      {/* Ground shadow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '15%',
          right: '15%',
          bottom: '-2%',
          height: '20px',
          background: `radial-gradient(ellipse at center, ${BG}90 0%, transparent 70%)`,
          filter: 'blur(8px)',
        }}
      />
    </div>
  );
}
