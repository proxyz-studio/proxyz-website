import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { siteConfig } from './config';
import Hero from './sections/Hero';
import Diagnosis from './sections/Diagnosis';
import Principles from './sections/Principles';
import TwoWays from './sections/TwoWays';
import Services from './sections/Services';
import BuildWith from './sections/BuildWith';
import StudioOS from './sections/StudioOS';
import Booking from './sections/Booking';
import Footer from './sections/Footer';
import Portal from './pages/Portal';
import Media from './pages/Media';
import PadelZ from './pages/PadelZ';
import Partners from './pages/Partners';
import FastFix from './pages/FastFix';

// Preview routes are dev-only — code-split so production users don't pay for motion lib etc.
const HeroPreview = lazy(() => import('./pages/HeroPreview'));
const VisualPreview = lazy(() => import('./pages/VisualPreview'));
const GlowPreview = lazy(() => import('./pages/GlowPreview'));
const MotionPreview = lazy(() => import('./pages/MotionPreview'));

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function Home() {
  return (
    <>
      <main>
        <Hero />
        <Diagnosis />
        <Principles />
        <TwoWays />
        <Services />
        <BuildWith />
        <StudioOS />
        <Booking />
      </main>
      <Footer />
    </>
  );
}

function App() {
  useEffect(() => {
    document.title = siteConfig.siteTitle || 'PROXYZ';
    document.documentElement.lang = siteConfig.language || '';

    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = siteConfig.siteDescription || '';
  }, []);

  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/media" element={<Media />} />
        <Route path="/media/padel-z" element={<PadelZ />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/partners/fast-fix" element={<FastFix />} />
        <Route path="/preview/hero" element={<Suspense fallback={null}><HeroPreview /></Suspense>} />
        <Route path="/preview/visual" element={<Suspense fallback={null}><VisualPreview /></Suspense>} />
        <Route path="/preview/glow" element={<Suspense fallback={null}><GlowPreview /></Suspense>} />
        <Route path="/preview/motion" element={<Suspense fallback={null}><MotionPreview /></Suspense>} />
      </Routes>
    </>
  );
}

export default App;
