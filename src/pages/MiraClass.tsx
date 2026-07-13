// src/pages/MiraClass.tsx
//
// MIRA Valley × PROXYZ — AI Workshop team page.
// Route: /learn/mira (wired in App.tsx). No site Nav, no PartnerGate, no links
// to other pages, noindex. Khun Gib forwards this URL to her ~7 staff.
//
// This is a scroll-driven, heavily-animated "From confused to confident" journey
// built for two audiences at once: it must feel premium and alive (a portfolio
// showcase of what PROXYZ builds), while staying warm and fully legible for
// non-technical beginners. Animation serves the message; the copy is always
// readable.
//
// Engine map:
//   - Lenis smooth scroll (page-scoped, see useSmoothScroll) wired to GSAP
//     ScrollTrigger. Destroyed on unmount so other routes are untouched.
//   - GSAP + ScrollTrigger for scroll-linked moments (the journey spine draw,
//     the sessions connective fill, node lighting). Registered once here.
//   - Framer Motion (motion/react) for component-level reveals/hovers.
//   - vanilla-tilt for tactile session-card tilt (desktop, fine pointer).
//   - A hand-rolled canvas dot field behind the hero.
//
// Branching: reduced-motion → fully static/instant (no scrubs, pins, typing
// loop, particle motion). Mobile (< 880px / coarse pointer) → no spine, no
// tilt, no scrubbed beat; simple fade/stagger reveals, single column.
//
// All content lives in src/content/mira-class.ts so a Thai pass is content-only.

import { useEffect } from 'react';
import { MotionConfig, useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { MIRA_CLASS_CONTENT } from '../content/mira-class';
import { BG, INK, MONO, PINK } from '../features/mira-class/theme';

import { usePageChrome } from '../features/mira-class/hooks/usePageChrome';
import { useSmoothScroll } from '../features/mira-class/hooks/useSmoothScroll';
import { useResponsiveFlags } from '../features/mira-class/hooks/useResponsiveFlags';

import { Header, Footer } from '../features/mira-class/components/Chrome';
import Hero from '../features/mira-class/components/Hero';
import JourneySpine from '../features/mira-class/components/JourneySpine';
import SessionsScene from '../features/mira-class/components/SessionsScene';
import PromptDemo from '../features/mira-class/components/PromptDemo';
import PreClassLink from '../features/mira-class/components/PreClassLink';
import WhatToBring from '../features/mira-class/components/WhatToBring';
import Schedule from '../features/mira-class/components/Schedule';
import Closing from '../features/mira-class/components/Closing';
import { Section } from '../features/mira-class/components/primitives';

// Register the ScrollTrigger plugin exactly once for this page.
gsap.registerPlugin(ScrollTrigger);

export default function MiraClass() {
  const reduce = useReducedMotion() ?? false;
  const { isDesktop } = useResponsiveFlags();
  const c = MIRA_CLASS_CONTENT;

  usePageChrome(c.pageTitle);
  // Smooth scroll only when motion is allowed; native scroll under reduced motion.
  useSmoothScroll(!reduce);

  // Refresh ScrollTrigger once the layout/fonts have settled, and again on a
  // late tick to catch any reflow from the canvas / web-font swap. invalidate
  // recalculates start/end so scrubbed values stay correct after resize.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const t1 = window.setTimeout(refresh, 200);
    const t2 = window.setTimeout(refresh, 800);
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }
    window.addEventListener('load', refresh);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <style>{`
        @keyframes mira-blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }

        .mira-class-root ::selection { background: ${PINK}; color: #0A0A0A; }

        /* Tactile press + hover lift on the toggle buttons */
        .mira-toggle-btn:active { transform: scale(0.96); }

        /* Session-card hover: layered shadow + pink edge. Named props only. */
        @media (hover: hover) and (pointer: fine) {
          .mira-session-card:hover {
            box-shadow: 0 18px 50px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,65,147,0.35);
            border-color: rgba(255,65,147,0.45) !important;
          }
          .mira-link-card:hover {
            box-shadow: 0 0 0 1px rgba(255,65,147,0.5), 0 20px 60px -28px rgba(255,65,147,0.5);
            border-color: rgba(255,65,147,0.55) !important;
          }
        }

        /* Schedule grid stacks gracefully on small screens */
        @media (max-width: 520px) {
          .mira-schedule-row {
            grid-template-columns: auto 1fr !important;
            row-gap: 8px !important;
          }
          .mira-schedule-row .mira-location-col {
            grid-column: 1 / -1;
          }
        }

        /* Reduced motion: hard-stop every animation/transition on the page */
        @media (prefers-reduced-motion: reduce) {
          .mira-class-root *,
          .mira-class-root *::before,
          .mira-class-root *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div
        className="mira-class-root"
        style={{
          background: BG,
          color: INK,
          minHeight: '100vh',
          fontFamily: MONO,
          overflowX: 'hidden',
          // Smooth out the look of the whole page.
          WebkitFontSmoothing: 'antialiased',
          position: 'relative',
        }}
      >
        {/* Journey spine — desktop only, fixed behind content */}
        {isDesktop && !reduce && <JourneySpine labels={c.journey} />}

        <Header cobrand={c.cobrand} reduce={reduce} />

        {/* Hero is its own full-height section (first spine node) */}
        <div data-spine-section>
          <Hero c={c} reduce={reduce} />
        </div>

        {/* Sessions — centrepiece scene */}
        <SessionsScene c={c} isDesktop={isDesktop} reduce={reduce} />

        {/* Interactive teaching toy */}
        <Section ariaLabel="Try a prompt">
          <PromptDemo c={c.promptDemo} reduce={reduce} />
        </Section>

        {/* Pre-class personal link */}
        <Section ariaLabel="Your personal link">
          <PreClassLink c={c.preClass} reduce={reduce} />
        </Section>

        {/* What to bring */}
        <Section ariaLabel="What to bring">
          <WhatToBring c={c.prepare} reduce={reduce} />
        </Section>

        {/* Schedule */}
        <Section ariaLabel="Schedule">
          <Schedule c={c.schedule} sessions={c.sessions} />
        </Section>

        {/* Closing flourish */}
        <Closing text={c.closing} reduce={reduce} />

        <Footer text={c.footer} />
      </div>
    </MotionConfig>
  );
}
