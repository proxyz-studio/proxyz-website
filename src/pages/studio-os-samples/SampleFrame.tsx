import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../sections/Footer';
import { useSmoothScroll } from '../studio-os/useSmoothScroll';
import { MONO, PINK } from '../studio-os/theme';

const SAMPLES = [
  { path: '/preview/studio-os-cinematic', label: 'Cinematic' },
  { path: '/preview/studio-os-product', label: 'Product UI' },
  { path: '/preview/studio-os-3d', label: '3D' },
  { path: '/preview/studio-os-kinetic', label: 'Kinetic' },
];

/**
 * Shared chrome for the four immersive sample directions. Provides Nav, Lenis
 * smooth scroll, the global-Vanta hide, and a fixed switcher so Tew can hop
 * between the four samples to decide. Each sample renders only its own content.
 */
export default function SampleFrame({
  active,
  title,
  children,
}: {
  active: string;
  title: string;
  children: ReactNode;
}) {
  useSmoothScroll();

  useEffect(() => {
    const prev = document.title;
    document.title = `studioOS — ${title} | PROXYZ`;
    const vanta = document.querySelector<HTMLElement>('.vanta-bg');
    const prevDisplay = vanta?.style.display ?? '';
    if (vanta) vanta.style.display = 'none';
    return () => {
      document.title = prev;
      if (vanta) vanta.style.display = prevDisplay;
    };
  }, [title]);

  return (
    <>
      <Nav />
      {children}
      <Footer />
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          display: 'flex',
          gap: '4px',
          padding: '5px',
          borderRadius: '999px',
          background: 'rgba(16,16,16,0.92)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.55)',
        }}
      >
        {SAMPLES.map((s) => {
          const on = s.path === active;
          return (
            <Link
              key={s.path}
              to={s.path}
              style={{
                fontFamily: MONO,
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: on ? '#0a0a0a' : '#f2f2f2',
                background: on ? PINK : 'transparent',
                borderRadius: '999px',
                padding: '9px 16px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
