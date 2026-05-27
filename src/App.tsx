import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { siteConfig } from './config';
import Hero from './sections/Hero';
import Diagnosis from './sections/Diagnosis';
import Principles from './sections/Principles';
import HowItWorks from './sections/HowItWorks';
import WhatWeInstall from './sections/WhatWeInstall';
import Proof from './sections/Proof';
import Booking from './sections/Booking';
import Footer from './sections/Footer';
import Marquee from './components/Marquee';
import Portal from './pages/Portal';
import Media from './pages/Media';
import PadelZ from './pages/PadelZ';
import Pipeline from './pages/Pipeline';
import Ventures from './pages/Ventures';
import FastFix from './pages/FastFix';
import VantaBackground from './components/VantaBackground';
import CursorOverlay from './components/CursorOverlay';

// Code-split the Lazy Tiger page — heavy on bespoke components (helmet, leaderboard,
// merch grid, GSAP Asia map). Only loaded when a visitor lands on /partners/lazy-tiger.
const LazyTiger = lazy(() => import('./pages/LazyTiger'));
const LazyTigerStyles = lazy(() => import('./pages/LazyTigerStyles'));

// Legal pages — lazy because rarely visited but needed for LINE OA + Thai PDPA.
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

// Venture detail pages — lazy. One component handles all slugs.
const VentureDetail = lazy(() => import('./pages/VentureDetail'));

// Preview routes are dev-only — code-split so production users don't pay for motion lib etc.
const HeroPreview = lazy(() => import('./pages/HeroPreview'));
const VisualPreview = lazy(() => import('./pages/VisualPreview'));
const GlowPreview = lazy(() => import('./pages/GlowPreview'));
const MotionPreview = lazy(() => import('./pages/MotionPreview'));
const ShowcasePreview = lazy(() => import('./pages/ShowcasePreview'));

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
        <HowItWorks />
        <WhatWeInstall />
        <Marquee />
        <Proof />
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
      {/* Animated pink network background — fixed layer behind all
          routes, lazy-loaded, desktop + motion-on only. See
          components/VantaBackground.tsx. */}
      <VantaBackground />
      {/* Custom cursor — pink crosshair with magnetic pull. Desktop +
          motion-on + pointer:fine only; touch users get the OS cursor. */}
      <CursorOverlay />
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/media" element={<Media />} />
        <Route path="/media/padel-z" element={<PadelZ />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/ventures" element={<Ventures />} />
        <Route
          path="/ventures/:slug"
          element={<Suspense fallback={null}><VentureDetail /></Suspense>}
        />
        <Route path="/pipeline/fast-fix" element={<FastFix />} />
        <Route
          path="/pipeline/lazy-tiger"
          element={<Suspense fallback={null}><LazyTiger /></Suspense>}
        />
        <Route path="/privacy" element={<Suspense fallback={null}><Privacy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
        <Route
          path="/preview/lazy-tiger-styles"
          element={<Suspense fallback={null}><LazyTigerStyles /></Suspense>}
        />
        <Route path="/preview/hero" element={<Suspense fallback={null}><HeroPreview /></Suspense>} />
        <Route path="/preview/visual" element={<Suspense fallback={null}><VisualPreview /></Suspense>} />
        <Route path="/preview/glow" element={<Suspense fallback={null}><GlowPreview /></Suspense>} />
        <Route path="/preview/motion" element={<Suspense fallback={null}><MotionPreview /></Suspense>} />
        <Route path="/preview/showcase" element={<Suspense fallback={null}><ShowcasePreview /></Suspense>} />
      </Routes>
    </>
  );
}

export default App;
