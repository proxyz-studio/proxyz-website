import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import SampleFrame from './SampleFrame';
import SampleHero from './SampleHero';
import { FG, HAIRLINE, MONO, MUTED, labelStyle } from '../studio-os/theme';
import { studioOsContent } from '../studio-os/content';

const { whatItIs } = studioOsContent;

/** A faceted gem that spins slowly and parallaxes toward the pointer. */
function ThreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return; // WebGL unavailable — hero still renders without the centerpiece
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    let w = parent.clientWidth || window.innerWidth;
    let h = parent.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 5;

    const geo = new THREE.IcosahedronGeometry(1.55, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x111319, metalness: 0.45, roughness: 0.35, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = 1.7;
    scene.add(mesh);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0xff4193, transparent: true, opacity: 0.4 }),
    );
    mesh.add(wire);

    scene.add(new THREE.AmbientLight(0x3a3a48, 0.9));
    const pink = new THREE.PointLight(0xff4193, 2.4, 0); pink.position.set(4, 3, 4); scene.add(pink);
    const cool = new THREE.PointLight(0x86b4ff, 1.4, 0); cool.position.set(-4, -2, 3); scene.add(cool);
    const key = new THREE.PointLight(0xffffff, 1.0, 0); key.position.set(0, 4, 5); scene.add(key);

    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };

    const render = () => renderer.render(scene, camera);
    render(); // static first frame (so a paused-rAF preview still shows the object)

    let raf = 0;
    const loop = () => {
      mesh.rotation.y += 0.003;
      mesh.rotation.x += 0.0014;
      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;
      camera.position.x = tx * 1.3;
      camera.position.y = -ty * 1.1;
      camera.lookAt(mesh.position);
      render();
      raf = requestAnimationFrame(loop);
    };

    if (!reduced) {
      window.addEventListener('pointermove', onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      w = parent.clientWidth || window.innerWidth;
      h = parent.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      (wire.geometry as THREE.BufferGeometry).dispose();
      (wire.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />;
}

export default function ThreeDeeSample() {
  return (
    <SampleFrame active="/preview/studio-os-3d" title="3D">
      <main style={{ background: '#0a0a0a', color: FG }}>
        <SampleHero backdrop={<ThreeCanvas />} />
        <section style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '120px 40px', borderTop: `1px solid ${HAIRLINE}` }}>
          <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto' }}>
            <p style={{ ...labelStyle, marginBottom: '28px' }}>{whatItIs.label}</p>
            <h2 style={{ fontFamily: MONO, fontSize: 'clamp(28px,3.8vw,52px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 24px 0', color: FG }}>
              {whatItIs.heading}
            </h2>
            <p style={{ fontFamily: MONO, fontSize: '17px', lineHeight: 1.7, color: MUTED, margin: 0 }}>
              {whatItIs.paragraphs[1]}
            </p>
            <p style={{ fontFamily: MONO, fontSize: '12px', letterSpacing: '0.1em', color: MUTED, textTransform: 'uppercase', marginTop: '56px' }}>
              Sample — move your mouse over the hero. Full page builds out from here.
            </p>
          </div>
        </section>
      </main>
    </SampleFrame>
  );
}
