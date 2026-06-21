// src/features/mira-class/components/AmbientField.tsx
//
// A lightweight, hand-rolled <canvas> dot field that drifts behind the hero.
// Pink, sparse, slow — texture, not noise. It sits fixed behind all content
// (pointer-events:none, low opacity) and fades out as you scroll past the hero
// (handled by the parent via opacity on the wrapper).
//
// Performance: a single rAF loop, capped particle count, DPR-aware, paused when
// the tab is hidden. Under reduced motion the loop never starts — we draw one
// static frame so the texture is still present but never moves.

import { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number; // base alpha
  tw: number; // twinkle phase
}

export default function AmbientField({ reduce }: { reduce: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    const rgb = '255,65,147'; // PINK without the hash, for rgba()

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area but stays modest. Cap hard for low-end devices.
      const count = Math.min(70, Math.round((w * h) / 16000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.5,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${d.a})`;
        ctx.fill();
      }
    };

    let t = 0;
    const tick = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        // Wrap softly at the edges.
        if (d.x < -4) d.x = w + 4;
        if (d.x > w + 4) d.x = -4;
        if (d.y < -4) d.y = h + 4;
        if (d.y > h + 4) d.y = -4;
        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.8 + d.tw);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${d.a * twinkle})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduce) {
        drawStatic();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      build();
      start();
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduce) {
        // Cancel any outstanding frame before starting a fresh one so
        // rapid hide/show or a concurrent resize cannot stack two loops.
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      }
    };

    build();
    start();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}
