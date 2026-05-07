import { useEffect, useRef } from 'react';

const MOON_CHARS =
  " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const FIELD_CHARS = '  ..::--==++**##@@'.split('');

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
    let rafId = 0;
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      width = canvas.parentElement!.offsetWidth;
      height = canvas.parentElement!.offsetHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      cols = width < 768 ? 90 : 128;
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
      // ── 1. CLEAR ──
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, width, height);

      time += 0.012;

      const cellW = width / cols;
      const cellH = cellW * 1.18;

      const moonX = width * 0.5;
      const moonY = height * 0.5;
      const moonRadius = Math.min(width, height) * 0.24;

      // ── 2. SATELLITE ORBIT (3D tilted Saturn ring) ──
      const orbitSpeed = 0.25;
      const orbitAngle = (Date.now() / 1000) * orbitSpeed + Math.PI * 1.5;
      const orbitRadius = moonRadius * 1.28;
      const tilt = 0.38; // ~22° tilt for diagonal Saturn ring

      // Raw orbit in flat XZ plane
      const rawX = Math.cos(orbitAngle) * orbitRadius;
      const rawZ = Math.sin(orbitAngle) * orbitRadius;

      // Tilt around X axis: z becomes partly screen-Y, partly depth-Z
      const screenOffsetY = rawZ * Math.sin(tilt);
      const stationZ = rawZ * Math.cos(tilt); // depth for z-sorting

      const stationX = moonX + rawX;
      const stationY = moonY + screenOffsetY;

      const isBehind = stationZ < 0;
      const isFront = stationZ > 0;

      // ── 3. CITY LIGHTS DATA (13 total) ──
      const rotAngle = time * 0.32;
      const pulse = (Math.sin(time * 2.5) + 1) * 0.5;

      // 13 cities at random longitudes around the full 360°,
      // near the equator (small latitudes), with 2 north and 2 south
      const citySpots = [
        { lon: 0.12,  lat: 0.18 },
        { lon: 0.85,  lat: -0.22 },
        { lon: 1.42,  lat: 0.62 },   // north
        { lon: 2.15,  lat: -0.15 },
        { lon: 2.78,  lat: 0.25 },
        { lon: 3.35,  lat: -0.08 },
        { lon: 4.05,  lat: 0.12 },
        { lon: 4.68,  lat: -0.65 },  // south
        { lon: 5.25,  lat: 0.05 },
        { lon: 5.85,  lat: -0.18 },
        { lon: 0.55,  lat: 0.72 },   // north
        { lon: 3.95,  lat: -0.32 },
        { lon: 1.95,  lat: -0.70 },  // south
      ];

      // Precompute city screen positions and z-depths
      interface CityPos {
        sx: number;
        sy: number;
        crz: number;
      }
      const cityPositions: CityPos[] = citySpots.map((spot) => {
        // Convert spherical (lon, lat) to local 3D position on unit sphere
        const cx = Math.cos(spot.lat) * Math.cos(spot.lon);
        const cy = Math.sin(spot.lat);
        const cz = Math.cos(spot.lat) * Math.sin(spot.lon);

        // Apply moon surface rotation
        const crx = cx * Math.cos(rotAngle) - cz * Math.sin(rotAngle);
        const cry = cy;
        const crz = cx * Math.sin(rotAngle) + cz * Math.cos(rotAngle);

        return {
          sx: moonX + crx * moonRadius,
          sy: moonY - cry * moonRadius,
          crz,
        };
      });

      // ── BEAM DRAWING HELPER ──
      const drawBeams = (citiesOnSameSide: boolean) => {
        const activationRadius = moonRadius * 0.65;
        cityPositions.forEach((pos) => {
          const cityFront = pos.crz > 0;
          if (citiesOnSameSide !== cityFront) return;

          const dx = pos.sx - stationX;
          const dy = pos.sy - stationY;
          const dist = Math.hypot(dx, dy);
          if (dist > activationRadius) return;

          const strength = 1 - dist / activationRadius;
          const beamAlpha = strength * 0.9;
          const beamWidth = 1.5 + strength * 3;

          // Outer glow (wide, dim)
          ctx.beginPath();
          ctx.moveTo(stationX, stationY);
          ctx.lineTo(pos.sx, pos.sy);
          ctx.strokeStyle = `rgba(255, 210, 60, ${beamAlpha * 0.35})`;
          ctx.lineWidth = beamWidth * 5;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Mid glow
          ctx.beginPath();
          ctx.moveTo(stationX, stationY);
          ctx.lineTo(pos.sx, pos.sy);
          ctx.strokeStyle = `rgba(255, 235, 140, ${beamAlpha * 0.6})`;
          ctx.lineWidth = beamWidth * 2.5;
          ctx.stroke();

          // Core beam (bright)
          ctx.beginPath();
          ctx.moveTo(stationX, stationY);
          ctx.lineTo(pos.sx, pos.sy);
          ctx.strokeStyle = `rgba(255, 252, 230, ${beamAlpha})`;
          ctx.lineWidth = beamWidth;
          ctx.stroke();
        });
      };

      // Helper to draw the satellite
      const drawStation = () => {
        ctx.save();
        ctx.translate(stationX, stationY);
        const rot = Math.atan2(Math.cos(orbitAngle) * Math.sin(tilt), Math.sin(orbitAngle) * Math.cos(tilt)) + Math.PI / 2;
        ctx.rotate(rot);

        // Station glow
        const stationGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
        stationGlow.addColorStop(0, 'rgba(200, 220, 255, 0.12)');
        stationGlow.addColorStop(1, 'rgba(200, 220, 255, 0)');
        ctx.fillStyle = stationGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        // Solar panels
        ctx.fillStyle = '#2a2a35';
        ctx.fillRect(-30, -2.5, 22, 5);
        ctx.strokeStyle = '#4a4a55';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-30, -2.5, 22, 5);
        ctx.fillRect(8, -2.5, 22, 5);
        ctx.strokeRect(8, -2.5, 22, 5);

        // Station body
        ctx.fillStyle = '#c8c6c0';
        ctx.beginPath();
        ctx.roundRect(-7, -5, 14, 10, 2);
        ctx.fill();

        // Dish antenna
        ctx.beginPath();
        ctx.arc(0, -9, 4.5, 0, Math.PI, true);
        ctx.strokeStyle = '#e8e6e0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Blinking beacon
        if (Math.sin(time * 6) > 0) {
          ctx.fillStyle = '#ff3333';
          ctx.beginPath();
          ctx.arc(0, -7, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Scanning beam from station to moon surface
        const beamTargetX = moonX + Math.cos(orbitAngle) * moonRadius * 0.55;
        const beamTargetY = moonY - moonRadius * 0.15;
        ctx.beginPath();
        ctx.moveTo(stationX, stationY + 5);
        ctx.lineTo(beamTargetX, beamTargetY);
        ctx.strokeStyle = `rgba(200, 220, 255, ${0.04 + Math.sin(time * 2) * 0.025})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // PROXYZ label
        ctx.font = 'bold 13px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(135, 206, 250, 0.85)';
        ctx.fillText('PROXYZ', stationX, stationY - 16);
      };

      // ── 4. DRAW BACK SATELLITE + BEAMS ──
      if (isBehind) {
        drawStation();
        drawBeams(false); // beams to back-facing cities
      }

      // ── 5. SOLID MOON DISC (covers back-satellite inside moon area) ──
      ctx.fillStyle = '#0A0A0A';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius + 4, 0, Math.PI * 2);
      ctx.fill();

      // ── 6. ASCII MOON + FIELD ──
      ctx.font = `${cellH * 0.84}px "Fragment Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let lx = 1.0;
      let ly = 0.15;
      let lz = -0.6;
      const lLen = Math.hypot(lx, ly, lz);
      lx /= lLen;
      ly /= lLen;
      lz /= lLen;

      for (let r = 0; r < rows; r++) {
        const rowY = r * cellH + cellH / 2;
        const laneNorm = rowY / height;
        const laneSpeed = 1.75;

        for (let c = 0; c < cols; c++) {
          const x = c * cellW + cellW / 2;
          const y = rowY;

          const dxMoon = x - moonX;
          const dyMoon = y - moonY;
          const distMoon = Math.hypot(dxMoon, dyMoon);
          const normMoon = distMoon / moonRadius;
          const angleMoon = Math.atan2(dyMoon, dxMoon);

          const mouseDistance = Math.hypot(x - mouse.x, y - mouse.y);
          const mouseField = Math.exp(-mouseDistance * 0.0038);

          let char = '';
          let opacity = 0;
          let drawX = x;
          let drawY = y;

          if (normMoon < 1.0) {
            const localX = dxMoon / moonRadius;
            const localY = -(y - moonY) / moonRadius;
            const localR2 = localX * localX + localY * localY;
            const z = Math.sqrt(Math.max(0, 1.0 - localR2));

            const angle = time * 0.32;
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

            char = MOON_CHARS[moonIdx];
            opacity = clamp(0.2 + intensity * 0.82, 0.2, 1);

            const edgeBend = Math.exp(-Math.abs(normMoon - 1.0) * 8) * 4;
            drawX += -Math.sin(angleMoon) * edgeBend;
            drawY += Math.cos(angleMoon) * edgeBend * 0.4;

            drawX += Math.sin(time * 3.6 + r * 0.32 + c * 0.11) * mouseField * 16;
            drawY += Math.cos(time * 2.8 + c * 0.24) * mouseField * 5;
          } else {
            const sampleX =
              c * 0.085 -
              time * (1.8 + laneSpeed * 1.6) +
              Math.sin(time * 4.2 + r * 0.28 + c * 0.08) * mouseField * 1.8;
            const sampleY =
              r * 0.11 +
              Math.sin(c * 0.025 + time * 1.2) * 0.6 +
              Math.cos(time * 3.4 + c * 0.2) * mouseField * 1.1;

            const flowA = noise2D(sampleX, sampleY);
            const flowB = noise2D(sampleX * 1.7 + 20, sampleY * 0.8 - 14);
            const wave =
              Math.sin(sampleX * 1.9 + laneNorm * 14) * 0.5 +
              Math.cos(sampleY * 2.4 - time * 2.1) * 0.5;

            let density = flowA * 0.42 + flowB * 0.28 + (wave * 0.5 + 0.5) * 0.3;
            const orbitBand = Math.exp(-Math.pow((normMoon - 1.12) * 5.5, 2));
            density += orbitBand * 0.16;

            if (density > 0.38) {
              const fieldIdx = clamp(
                Math.floor(density * (FIELD_CHARS.length - 1)),
                0,
                FIELD_CHARS.length - 1
              );
              char = FIELD_CHARS[fieldIdx];
              opacity = 0.035 + density * 0.24;

              drawX += (laneSpeed * 8 + flowB * 16) % (cellW * 3);
              drawY += Math.sin(sampleX * 2.2 + time + laneNorm * 8) * 1.8;

              const swirl = orbitBand * 10;
              drawX += -Math.sin(angleMoon) * swirl;
              drawY += Math.cos(angleMoon) * swirl * 0.6;

              drawX += Math.sin(time * 4.8 + r * 0.35 + c * 0.1) * mouseField * 18;
              drawY += Math.cos(time * 3.2 + c * 0.25) * mouseField * 6;
              density += mouseField * 0.24;
            }
          }

          if (!char || opacity <= 0.02) continue;

          ctx.fillStyle = `rgba(232, 230, 224, ${opacity})`;
          ctx.fillText(char, drawX, drawY);
        }
      }

      // ── 7. PULSING YELLOW CITY DOTS (13 total) ──
      cityPositions.forEach((pos) => {
        if (pos.crz > 0.05) {
          const glowRadius = 3 + pulse * 5;
          const glowAlpha = 0.3 + pulse * 0.4;

          const grad = ctx.createRadialGradient(pos.sx, pos.sy, 0, pos.sx, pos.sy, glowRadius * 2.5);
          grad.addColorStop(0, `rgba(255, 210, 40, ${glowAlpha})`);
          grad.addColorStop(0.5, `rgba(255, 180, 30, ${glowAlpha * 0.5})`);
          grad.addColorStop(1, 'rgba(255, 160, 20, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.sx, pos.sy, glowRadius * 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 245, 180, ${0.85 + pulse * 0.15})`;
          ctx.beginPath();
          ctx.arc(pos.sx, pos.sy, 2.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 220, ${0.6 + pulse * 0.4})`;
          ctx.beginPath();
          ctx.arc(pos.sx, pos.sy, 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ── 8. DRAW FRONT BEAMS + SATELLITE (in front of moon, z > 0) ──
      if (isFront) {
        drawBeams(true); // beams to front-facing cities
        drawStation();
      }

      rafId = requestAnimationFrame(draw);
    };

    document.fonts.ready.then(() => {
      resize();
      draw();
    });

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
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
