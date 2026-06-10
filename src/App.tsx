import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { siteConfig } from './config';
import Hero from './sections/Hero';
import Diagnosis from './sections/Diagnosis';
import Principles from './sections/Principles';
import HowItWorks from './sections/HowItWorks';
import WhatWeInstall from './sections/WhatWeInstall';
import Proof from './sections/Proof';
import Team from './sections/Team';
import Booking from './sections/Booking';
import Footer from './sections/Footer';
import Marquee from './components/Marquee';
// Media arm hidden from the site for now (2026-06-11, Tew). The pages are
// kept intact — to bring media back, restore these imports, the two /media
// routes below, and the "Media" link in navigationConfig (config.ts).
// import Media from './pages/Media';
// import PadelZ from './pages/PadelZ';
import Pipeline from './pages/Pipeline';
import Ventures from './pages/Ventures';
import FastFix from './pages/FastFix';
import VantaBackground from './components/VantaBackground';
// CursorOverlay disabled — to re-enable: re-add the import below and
// uncomment the <CursorOverlay /> render in <App />. Component file
// kept at ./components/CursorOverlay.tsx.
// import CursorOverlay from './components/CursorOverlay';
import ScrollProgress from './components/ScrollProgress';
import FloatingContactRail from './components/FloatingContactRail';

// Code-split the Lazy Tiger page — heavy on bespoke components (helmet, leaderboard,
// merch grid, GSAP Asia map). Only loaded when a visitor lands on /partners/lazy-tiger.
const LazyTiger = lazy(() => import('./pages/LazyTiger'));
const LazyTigerStyles = lazy(() => import('./pages/LazyTigerStyles'));

// ABACUZ partner walkthrough — page-scoped brand surface (navy/gold/ivory),
// bilingual TH/EN, sticky decision tracker. Lazy-loaded so the marketing site
// doesn't pay the font + content cost on the home page.
const Abacuz = lazy(() => import('./pages/Abacuz'));
// MIRA Valley × PROXYZ — month-1 proposal as an immersive, passcode-gated page.
// Lazy-loaded so the marketing home doesn't pay the Cormorant + Thai fonts and
// content cost. Confidential: mounted at /pipeline/mira but NOT listed on the
// public /pipeline index — reachable only via the direct link + 4-digit code.
const Mira = lazy(() => import('./pages/Mira'));

// Instant proposal links — /p/<slug>, code-gated, content served from Redis
// via /api/proposal-get so new proposals publish with zero rebuilds. Lazy:
// only prospects with a direct link ever load it.
const Proposal = lazy(() => import('./pages/Proposal'));

// Legal pages — lazy because rarely visited but needed for LINE OA + Thai PDPA.
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

// FAQ page — linked from the footer, not the primary nav.
const Faq = lazy(() => import('./pages/Faq'));

// Venture detail pages — lazy. One component handles all slugs.
const VentureDetail = lazy(() => import('./pages/VentureDetail'));

// Preview routes are dev-only — code-split so production users don't pay for motion lib etc.
// StudioOS cinematic redesign prototype — ports to /studio-os once approved.
const StudioOsExperience = lazy(() => import('./pages/studio-os'));
// Immersive direction samples — Tew picks one, then it builds out.
const StudioOsCinematic = lazy(() => import('./pages/studio-os-samples/Cinematic'));
const StudioOsProduct = lazy(() => import('./pages/studio-os-samples/ProductUI'));
const StudioOs3D = lazy(() => import('./pages/studio-os-samples/ThreeDee'));
const StudioOsKinetic = lazy(() => import('./pages/studio-os-samples/Kinetic'));
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
        <Team />
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
      {/* Custom cursor disabled — was a 16px pink crosshair with mix-blend
          difference, too subtle to see against most backgrounds. Native
          OS cursor restored. Re-enable by uncommenting <CursorOverlay />. */}
      {/* <CursorOverlay /> */}
      {/* Scroll progress bar — fixed pink 2px line across the top of the
          viewport, fills as the visitor scrolls. Always on. */}
      <ScrollProgress />
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studio-os" element={<Suspense fallback={null}><StudioOsExperience /></Suspense>} />
        {/* /media is offline for now — old links land on the homepage.
            Restore: <Route path="/media" element={<Media />} />
                     <Route path="/media/padel-z" element={<PadelZ />} /> */}
        <Route path="/media" element={<Navigate to="/" replace />} />
        <Route path="/media/*" element={<Navigate to="/" replace />} />
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
        <Route
          path="/pipeline/abacuz"
          element={<Suspense fallback={null}><Abacuz /></Suspense>}
        />
        <Route
          path="/pipeline/mira"
          element={<Suspense fallback={null}><Mira /></Suspense>}
        />
        <Route
          path="/p/:slug"
          element={<Suspense fallback={null}><Proposal /></Suspense>}
        />
        <Route path="/privacy" element={<Suspense fallback={null}><Privacy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
        <Route path="/faq" element={<Suspense fallback={null}><Faq /></Suspense>} />
        <Route
          path="/preview/lazy-tiger-styles"
          element={<Suspense fallback={null}><LazyTigerStyles /></Suspense>}
        />
        <Route path="/preview/studio-os" element={<Suspense fallback={null}><StudioOsExperience /></Suspense>} />
        <Route path="/preview/studio-os-cinematic" element={<Suspense fallback={null}><StudioOsCinematic /></Suspense>} />
        <Route path="/preview/studio-os-product" element={<Suspense fallback={null}><StudioOsProduct /></Suspense>} />
        <Route path="/preview/studio-os-3d" element={<Suspense fallback={null}><StudioOs3D /></Suspense>} />
        <Route path="/preview/studio-os-kinetic" element={<Suspense fallback={null}><StudioOsKinetic /></Suspense>} />
        <Route path="/preview/hero" element={<Suspense fallback={null}><HeroPreview /></Suspense>} />
        <Route path="/preview/visual" element={<Suspense fallback={null}><VisualPreview /></Suspense>} />
        <Route path="/preview/glow" element={<Suspense fallback={null}><GlowPreview /></Suspense>} />
        <Route path="/preview/motion" element={<Suspense fallback={null}><MotionPreview /></Suspense>} />
        <Route path="/preview/showcase" element={<Suspense fallback={null}><ShowcasePreview /></Suspense>} />
      </Routes>
      <FloatingContactRail />
    </>
  );
}

export default App;
