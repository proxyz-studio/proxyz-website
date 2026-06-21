// src/features/mira-class/components/JourneySpine.tsx
//
// A thin pink vertical line that runs down the left gutter of the page and
// DRAWS itself as you scroll (stroke-dashoffset scrubbed by ScrollTrigger),
// threading the sections together. Node dots light up as their section enters.
//
// Desktop only. The parent renders this únder a matchMedia('(min-width: 880px)')
// gate, but we also defend here: the component is fixed-position, pointer-none,
// and behind content. On mobile it is simply not mounted.
//
// All GSAP work is wrapped in a gsap.context scoped to the root and reverted on
// unmount. ScrollTriggers created here are killed by ctx.revert().

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PINK } from '../theme';

export default function JourneySpine({ labels }: { labels: string[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGLineElement | null>(null);

  // Node positions distributed evenly down the line (in % of the line height).
  const nodes = labels.map((label, i) => ({
    label,
    pct: labels.length > 1 ? (i / (labels.length - 1)) * 100 : 0,
  }));

  useEffect(() => {
    const root = rootRef.current;
    const line = pathRef.current;
    if (!root || !line) return;

    const ctx = gsap.context(() => {
      const len = line.getTotalLength?.() ?? 1000;
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });

      // Scrub the line drawing to the whole document scroll progress.
      gsap.to(line, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // Light each node when its matching section scrolls into the middle band.
      const dots = gsap.utils.toArray<HTMLElement>('.mira-spine-dot', root);
      const sections = gsap.utils.toArray<HTMLElement>('[data-spine-section]');
      sections.forEach((section, i) => {
        const dot = dots[i];
        if (!dot) return;
        ScrollTrigger.create({
          trigger: section,
          start: 'top 70%',
          end: 'bottom 30%',
          onToggle: (self) => {
            gsap.to(dot, {
              scale: self.isActive ? 1.6 : 1,
              backgroundColor: self.isActive ? PINK : 'rgba(255,65,147,0.3)',
              boxShadow: self.isActive ? `0 0 14px ${PINK}` : '0 0 0px rgba(255,65,147,0)',
              duration: 0.4,
              ease: 'expo.out',
            });
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [labels.length]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 'clamp(22px, 4vw, 54px)',
        bottom: 0,
        width: 14,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      {/* Faint full-height track */}
      <div
        style={{
          position: 'absolute',
          left: 6,
          top: '14vh',
          bottom: '14vh',
          width: 1,
          background: 'rgba(255,65,147,0.10)',
        }}
      />
      {/* The drawing line, as an SVG so we can scrub dashoffset */}
      <svg
        width="14"
        height="100%"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <line
          ref={pathRef}
          x1="7"
          y1="14%"
          x2="7"
          y2="86%"
          stroke={PINK}
          strokeWidth="1.4"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(255,65,147,0.5))' }}
        />
      </svg>
      {/* Node dots, positioned across the visible line span (14% → 86%) */}
      {nodes.map((n, i) => (
        <span
          key={i}
          className="mira-spine-dot"
          style={{
            position: 'absolute',
            left: 7,
            top: `calc(14% + ${(n.pct / 100) * 72}%)`,
            transform: 'translate(-50%, -50%)',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'rgba(255,65,147,0.3)',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
