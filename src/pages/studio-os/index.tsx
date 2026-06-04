import { useEffect } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../sections/Footer';
import { useSmoothScroll } from './useSmoothScroll';
import Hero from './cinematic/Hero';
import ProblemWhatItIs from './cinematic/ProblemWhatItIs';
import Inside from './cinematic/Inside';
import WhatYouGet from './cinematic/WhatYouGet';
import HowAiHelps from './cinematic/HowAiHelps';
import BuiltForYou from './cinematic/BuiltForYou';
import HowYouGetIt from './cinematic/HowYouGetIt';
import BookACall from './cinematic/BookACall';
import { BG, FG } from './theme';
import { ProgressiveBlur } from './ProgressiveBlur';

/**
 * StudioOS — the cinematic page (the chosen direction). Eight v4 sections plus
 * the "what's inside" product showcase, on Lenis smooth scroll with pinned
 * scroll scenes and choreographed reveals. Copy is v4 verbatim, IBM Plex Mono
 * throughout. Mounted at /studio-os.
 */
export default function StudioOsPage() {
  useSmoothScroll();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'StudioOS — The operating brain for your company | PROXYZ';
    const vanta = document.querySelector<HTMLElement>('.vanta-bg');
    const prevVanta = vanta?.style.display ?? '';
    if (vanta) vanta.style.display = 'none';
    return () => {
      document.title = prevTitle;
      if (vanta) vanta.style.display = prevVanta;
    };
  }, []);

  return (
    <>
      <Nav />
      <main className="sos-page" style={{ background: BG, color: FG }}>
        <Hero />
        <ProblemWhatItIs />
        <Inside />
        <WhatYouGet />
        <HowAiHelps />
        <BuiltForYou />
        <HowYouGetIt />
        <BookACall />
      </main>
      {/* Progressive scroll-blur: content softly blurs and fades under the nav
          and at the bottom edge. Top offset clears the fixed nav height. */}
      <ProgressiveBlur position="top" offset="82px" height="78px" />
      <ProgressiveBlur position="bottom" />
      <Footer />
    </>
  );
}
