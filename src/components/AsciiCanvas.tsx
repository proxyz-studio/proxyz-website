import { useEffect, useRef } from 'react';

/**
 * ASCII moon, printed as a single-ink engraving plate.
 *
 * 2026-06-10 redesign (ISSUE 01 cover): the old satellite, beam, yellow
 * city-light and drifting-field layers are gone. What remains is the
 * rotating crater-noise sphere, rendered like halftone ink on dark paper:
 * - steepened contrast curve (deep shadow side, bright lit limb)
 * - rare fixed pink "spot-ink" flecks on the brightest glyphs
 * - cursor "develop" effect: glyphs under the pointer brighten like
 *   photo paper in developer fluid (brightness only, no displacement)
 * - time accumulates from rAF deltas, never wall-clock, so a background
 *   tab does not fast-forward the rotation
 * - prefers-reduced-motion renders one static frame, no loop
 */

const MOON_CHARS =
  " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

const smooth = (t: number) => t * t * (3 - 2 * t);

const noise2D = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);

  const ux = smooth(fx);
  const uy = smooth(fy);

  return (
    a * (1 - ux) * (1 - uy) +
    b * ux * (1 - uy) +
    c * (1 - ux) * uy +
    d * ux * uy
  );
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export default function AsciiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let time = 0;
    let lastTs: number | null = null;
    let rafId = 0;
    const mouse = { x: -10000, y: -10000 };
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      width = canvas.parentElement!.offsetWidth;
      height = canvas.parentElement!.offsetHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // ~7px cells: engraving-grain glyphs, sized to the plate panel.
      cols = Math.max(60, Math.round(width / 7));
      const cellW = width / cols;
      const cellH = cellW * 1.18;
      rows = Math.ceil(height / cellH);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const draw = () => {
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, width, height);

      const cellW = width / cols;
      const cellH = cellW * 1.18;

      const moonX = width * 0.5;
      const moonY = height * 0.5;
      const moonRadius = Math.min(width, height) * 0.34;

      ctx.font = `${cellH * 0.84}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Fixed light direction: upper right, tilted toward the viewer so
      // most of the visible face prints and the terminator falls on the
      // lower-left limb (a crescent-only moon reads as an empty plate).
      let lx = 0.8;
      let ly = 0.3;
      let lz = 0.55;
      const lLen = Math.hypot(lx, ly, lz);
      lx /= lLen;
      ly /= lLen;
      lz /= lLen;

      // ~50s per revolution: quiet ambient motion, nothing else moves.
      const angle = time * 0.18;

      // Only walk the cell rows/cols that can intersect the disc.
      const r0 = Math.max(0, Math.floor((moonY - moonRadius) / cellH) - 1);
      const r1 = Math.min(rows, Math.ceil((moonY + moonRadius) / cellH) + 1);
      const c0 = Math.max(0, Math.floor((moonX - moonRadius) / cellW) - 1);
      const c1 = Math.min(cols, Math.ceil((moonX + moonRadius) / cellW) + 1);

      for (let r = r0; r < r1; r++) {
        const y = r * cellH + cellH / 2;

        for (let c = c0; c < c1; c++) {
          const x = c * cellW + cellW / 2;

          const dxMoon = x - moonX;
          const dyMoon = y - moonY;
          const distMoon = Math.hypot(dxMoon, dyMoon);
          if (distMoon / moonRadius >= 1.0) continue;

          const localX = dxMoon / moonRadius;
          const localY = -dyMoon / moonRadius;
          const localR2 = localX * localX + localY * localY;
          const z = Math.sqrt(Math.max(0, 1.0 - localR2));

          const px = localX * Math.cos(angle) - z * Math.sin(angle);
          const py = localY;
          const pz = localX * Math.sin(angle) + z * Math.cos(angle);

          let diffuse = px * lx + py * ly + pz * lz;
          diffuse = Math.max(0, diffuse);

          const maria =
            noise2D(px * 2.6 + 4.2, py * 2.6 - 1.7) * 0.6 +
            noise2D(pz * 3.4 - 8.1, py * 3.4 + 5.4) * 0.4;
          const craters =
            noise2D(px * 12.0 + py * 6.0 + 30.0, pz * 12.0 - px * 4.0 - 20.0) * 0.65 +
            noise2D(px * 20.0 - 11.0, py * 20.0 + 7.0) * 0.35;

          const albedo = clamp(0.76 + craters * 0.14 - maria * 0.18, 0.52, 0.92);

          if (diffuse > 0 && diffuse < 0.15) {
            diffuse += Math.sin(px * 50 + py * 50) * 0.03;
            diffuse = Math.max(0, diffuse);
          }

          const ambient = 0.015;
          const intensity = ambient + diffuse * albedo * 1.3;
          const moonIdx = clamp(
            Math.floor(intensity * (MOON_CHARS.length - 1)),
            0,
            MOON_CHARS.length - 1
          );

          // Halftone curve: shadow side nearly disappears into the paper,
          // the lit limb prints at close to full ink.
          let opacity = clamp(0.1 + Math.pow(intensity, 1.3) * 0.9, 0.1, 1);

          // Develop effect: brightness only, never displacement.
          if (!reduced) {
            const mouseDistance = Math.hypot(x - mouse.x, y - mouse.y);
            const mouseField = Math.exp(-mouseDistance * 0.0038);
            opacity = Math.min(opacity + mouseField * 0.22, 1);
          }

          // Misregistered spot ink: a fixed ~3% of the brightest glyphs
          // print in brand pink. Deterministic per cell — they never twinkle.
          const fleck = intensity > 0.78 && hash(c * 7.13, r * 3.71) < 0.03;
          ctx.fillStyle = fleck
            ? `rgba(255, 65, 147, ${Math.min(opacity + 0.1, 0.85)})`
            : `rgba(232, 230, 224, ${opacity})`;
          ctx.fillText(MOON_CHARS[moonIdx], x, y);
        }
      }
    };

    const loop = (ts: number) => {
      if (lastTs !== null) {
        // Clamp the delta so a backgrounded tab resumes without a time jump.
        time += Math.min((ts - lastTs) / 1000, 0.1);
      }
      lastTs = ts;
      draw();
      rafId = requestAnimationFrame(loop);
    };

    document.fonts.ready.then(() => {
      resize();
      if (reduced) {
        // One static frame at a flattering rotation; no loop, no listener.
        time = 2;
        draw();
        return;
      }
      // Paint the first frame immediately rather than waiting for rAF,
      // so the plate is never blank on first paint.
      draw();
      rafId = requestAnimationFrame(loop);
    });

    window.addEventListener('resize', resize);
    if (!reduced) window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      if (!reduced) window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
