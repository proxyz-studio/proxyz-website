/* Lazy Tiger × PROXYZ — prospect page.
 *
 * Route: /partners/lazy-tiger (public for now per Tew's brief — he'll wrap
 * with <PartnerGate> after reviewing).
 *
 * All copy is verbatim from 2026-05-20-lazy-tiger-prospect-page-copy-v1.md.
 * Do not paraphrase. Editorial rules apply.
 *
 * 18 sections. 5 interactive moments:
 *   1. TigerHelmet (hero)        — SVG, breathing + cursor track + dual rim lights
 *   2. Leaderboard (Layer 02)    — scripted tick, HR pulse, score tick, rank swap
 *   3. MerchGrid (Layer 03)      — Vizcom 3-stage reverse-loop hover reveal
 *   4. AsiaMap (Section 10)      — GSAP ScrollTrigger scrub, city dots light up
 *   5. useBrandShift             — scroll-driven --lt-accent var swap (pink ↔ orange)
 */

import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Nav from '../components/Nav';
import PartnerSubNav from '../components/PartnerSubNav';
import PartnerGate from '../components/PartnerGate';
import PartnerMeetings from '../components/PartnerMeetings';
import Reveal from '../components/Reveal';
import { HeroMesh } from '../components/Glow';
import { MagneticAnchor } from '../components/Spatial';
import Footer from '../sections/Footer';
import { lazyTigerPageConfig } from '../config';

import TigerHelmet from '../components/lt/TigerHelmet';
import Leaderboard from '../components/lt/Leaderboard';
import MerchGrid from '../components/lt/MerchGrid';
import AsiaMap from '../components/lt/AsiaMap';
import CompoundCircle from '../components/lt/CompoundCircle';
import TigerCoachChat from '../components/lt/TigerCoachChat';
import TierLadder from '../components/lt/TierLadder';
import QuadrantGrid from '../components/lt/QuadrantGrid';
import HotelMap from '../components/lt/HotelMap';
import { CardioCircle, ReformerTriangle, YogaSquare } from '../components/lt/StudioShapes';

/* Brand: PROXYZ Brand Guide for this page. Editorial dark background,
   IBM Plex Mono for everything, hot pink as primary accent, neon lime
   as the single second accent (used sparingly for emphasis). */
const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'IBM Plex Mono', monospace";
const PINK = '#FF4193';
const LIME = '#D2FF3B';

/* ---------- Reusable bits ---------- */

function SectionEyebrow({ children, color = 'var(--lt-accent)' }: { children: React.ReactNode; color?: string }) {
  return (
    <p
      style={{
        fontFamily: FONT_MONO,
        fontSize: '11px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color,
        margin: '0 0 28px 0',
      }}
    >
      {children}
    </p>
  );
}

function DisplayHeading({
  children,
  size = 'lg',
  align = 'left',
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center';
}) {
  const fontSize = {
    sm: 'clamp(26px, 3vw, 36px)',
    md: 'clamp(32px, 4vw, 52px)',
    lg: 'clamp(38px, 5vw, 68px)',
    xl: 'clamp(46px, 6.4vw, 88px)',
  }[size];
  return (
    <h2
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 400,
        fontSize,
        lineHeight: 1.08,
        letterSpacing: '-0.015em',
        margin: 0,
        textWrap: 'balance',
        textAlign: align,
        color: '#F2F2F2',
      }}
    >
      {children}
    </h2>
  );
}

function BodyParagraph({
  children,
  size = 'md',
  align = 'left',
  maxWidth = '64ch',
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
  maxWidth?: string;
}) {
  const fontSize = { sm: '14px', md: '16px', lg: '18px' }[size];
  return (
    <p
      style={{
        fontFamily: FONT_MONO,
        fontSize,
        lineHeight: 1.7,
        color: 'rgba(255,255,255,0.82)',
        margin: 0,
        maxWidth,
        marginLeft: align === 'center' ? 'auto' : 0,
        marginRight: align === 'center' ? 'auto' : 0,
        textAlign: align,
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </p>
  );
}

function LayerNumber({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: FONT_MONO,
        fontSize: '11px',
        letterSpacing: '0.22em',
        color: 'rgba(255,255,255,0.45)',
        textTransform: 'uppercase',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {children}
    </span>
  );
}

/* ---------- Section visuals ---------- */

/** Heart-rate waveform background for Layer 01. */
function HRWaveform() {
  return (
    <svg
      viewBox="0 0 800 200"
      width="100%"
      height="200"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="hr-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={PINK} stopOpacity="0" />
          <stop offset="50%" stopColor={PINK} stopOpacity="0.7" />
          <stop offset="100%" stopColor={PINK} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Center baseline */}
      <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {/* Heart-rate trace — two beats across */}
      <path
        d="M 0 100 L 120 100 L 130 90 L 140 100 L 160 100 L 170 60 L 180 130 L 190 70 L 200 100
           L 320 100 L 330 90 L 340 100 L 360 100 L 370 60 L 380 130 L 390 70 L 400 100
           L 520 100 L 530 90 L 540 100 L 560 100 L 570 60 L 580 130 L 590 70 L 600 100
           L 720 100 L 730 90 L 740 100 L 760 100 L 770 60 L 780 130 L 790 70 L 800 100"
        fill="none"
        stroke="url(#hr-fade)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WearableIcon({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="22" fill="#0A0A0A" stroke={PINK} strokeWidth="1" />
      <text
        textAnchor="middle"
        y="4"
        fontFamily={FONT_MONO}
        fontSize="9"
        fill="#F2F2F2"
        letterSpacing="0.04em"
      >
        {label}
      </text>
    </g>
  );
}

function SensorNetworkDiagram() {
  return (
    <svg
      viewBox="0 0 600 380"
      width="100%"
      height="auto"
      aria-label="Sensor network diagram"
      style={{ maxWidth: '520px', margin: '0 auto', display: 'block' }}
    >
      <defs>
        <radialGradient id="sensor-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={PINK} stopOpacity="0.32" />
          <stop offset="100%" stopColor={PINK} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Lines from each wearable to center */}
      <g stroke={PINK} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 4">
        <line x1="80" y1="80" x2="300" y2="190" />
        <line x1="520" y1="80" x2="300" y2="190" />
        <line x1="80" y1="300" x2="300" y2="190" />
        <line x1="520" y1="300" x2="300" y2="190" />
      </g>
      {/* Center node — "Polar SDK spine" */}
      <circle cx="300" cy="190" r="80" fill="url(#sensor-glow)" />
      <circle cx="300" cy="190" r="48" fill="#0A0A0A" stroke={PINK} strokeWidth="1.5" />
      <text x="300" y="184" textAnchor="middle" fontFamily={FONT_MONO} fontSize="10" fill={PINK} letterSpacing="0.18em">
        POLAR
      </text>
      <text x="300" y="200" textAnchor="middle" fontFamily={FONT_MONO} fontSize="10" fill="#F2F2F2" letterSpacing="0.18em">
        SDK
      </text>
      {/* Wearable nodes */}
      <WearableIcon label="H10" x={80} y={80} />
      <WearableIcon label="Apple" x={520} y={80} />
      <WearableIcon label="Oura" x={80} y={300} />
      <WearableIcon label="Terra" x={520} y={300} />
    </svg>
  );
}

/* ---------- Page ---------- */

export default function LazyTiger() {
  const c = lazyTigerPageConfig;

  // Update document title + meta
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Lazy Tiger × PROXYZ — Active preview';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <>
      <Nav />
      <PartnerGate partner="lazy-tiger">
      <PartnerSubNav
        name="LAZY-TIGER"
        accent={PINK}
        sections={[
          { id: 'meetings', label: 'Meetings' },
          { id: 'brief', label: 'Brief' },
          { id: 'frame', label: 'Frame' },
          { id: 'layers', label: 'Layers' },
          { id: 'engagement', label: 'Engagement' },
          { id: 'team', label: 'Team' },
          { id: '/partners/lazy-tiger/cost-overview/', label: 'Cost overview →', external: true },
        ]}
      />
      <main style={{ background: '#0A0A0A', color: '#F2F2F2', overflow: 'hidden' }}>
        {/* ================================================================
            SECTION 1 — HERO
        ================================================================ */}
        <section
          data-brand-mode="proxyz"
          className="lt-hero-padding"
          style={{
            position: 'relative',
            padding: '180px 40px 100px',
            background: '#0A0A0A',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <HeroMesh intensity={0.55} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
            <Reveal>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '11px',
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.55)',
                  margin: '0 0 60px 0',
                }}
              >
                <Link to="/pipeline" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginRight: '14px' }}>
                  ← Pipeline
                </Link>
                {c.hero.eyebrow}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div style={{ margin: '0 auto 60px', maxWidth: '520px' }}>
                <TigerHelmet
                  size={520}
                  theme={{
                    body: 'matte',
                    stripe: PINK,
                    stripeHighlight: '#FFE0F0',
                    rimLeft: PINK,
                    rimRight: LIME,
                  }}
                />
              </div>
            </Reveal>

            <Reveal delay={260}>
              <h1
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 400,
                  fontSize: 'clamp(40px, 6.4vw, 84px)',
                  lineHeight: 0.98,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: '#F2F2F2',
                  textWrap: 'balance',
                }}
              >
                {c.hero.titleLines.map((line, i) => (
                  <span key={i} style={{ display: 'block' }}>
                    {line}
                  </span>
                ))}
              </h1>
            </Reveal>

            <Reveal delay={380}>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '14px',
                  letterSpacing: '0.04em',
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: '36px',
                  marginBottom: 0,
                }}
              >
                {c.hero.subline}
                <span className="lt-cursor-blink" />
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 1.5 — MEETINGS (gated to Tew + Cathal via MeetingsGate)
        ================================================================ */}
        <section
          id="meetings"
          data-brand-mode="proxyz"
          className="lt-section-padding"
          style={{
            padding: '120px 40px',
            background: '#0A0A0A',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow>MEETINGS · NOTES FROM THE ROOM</SectionEyebrow>
            </Reveal>
            <Reveal delay={80}>
              <DisplayHeading size="lg">What we've discussed.</DisplayHeading>
            </Reveal>
            <Reveal delay={160}>
              <div style={{ marginTop: '24px', maxWidth: '60ch' }}>
                <BodyParagraph>
                  Summaries of every working conversation between Tew, Cathal,
                  and the rest of the build team. Scoped to the people in the
                  room.
                </BodyParagraph>
              </div>
            </Reveal>
            <PartnerMeetings partner="lazy-tiger" accent={PINK} />
          </div>
        </section>

        {/* ================================================================
            SECTION 2 — THE BRIEF
        ================================================================ */}
        <section
          id="brief"
          data-brand-mode="proxyz"
          className="lt-section-padding"
          style={{
            padding: '140px 40px',
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
            <Reveal>
              <SectionEyebrow>01 · THE BRIEF</SectionEyebrow>
            </Reveal>
            <Reveal delay={80}>
              <DisplayHeading size="lg" align="center">
                {c.brief.headline}
              </DisplayHeading>
            </Reveal>
            <Reveal delay={160}>
              <div style={{ marginTop: '44px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {c.brief.paragraphs.map((p, i) => (
                  <BodyParagraph key={i} size="lg" align="center" maxWidth="60ch">
                    {p}
                  </BodyParagraph>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 3 — THE GAP
        ================================================================ */}
        <section
          data-brand-mode="proxyz"
          className="lt-section-padding"
          style={{
            padding: '140px 40px',
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow>02 · THE GAP</SectionEyebrow>
            </Reveal>

            <div className="lt-two-col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '64px', alignItems: 'start' }}>
              <div>
                <Reveal>
                  <DisplayHeading size="lg">{c.gap.headline}</DisplayHeading>
                </Reveal>
                <Reveal delay={120}>
                  <p
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 500,
                      fontSize: 'clamp(20px, 2.2vw, 30px)',
                      lineHeight: 1.25,
                      color: LIME,
                      marginTop: '24px',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {c.gap.subhead}
                  </p>
                </Reveal>
              </div>

              <div>
                <Reveal delay={200}>
                  <BodyParagraph size="md">{c.gap.body}</BodyParagraph>
                </Reveal>
              </div>
            </div>

            {/* The visual: a horizontal rule with above/below labels. The gap is the empty space below. */}
            <div style={{ marginTop: '80px', borderTop: '1px solid rgba(255,255,255,0.18)', position: 'relative', paddingTop: '12px' }}>
              <span
                style={{
                  position: 'absolute',
                  top: '-9px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#0a0a0a',
                  padding: '0 14px',
                  fontFamily: FONT_MONO,
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  color: 'rgba(255,255,255,0.55)',
                  textTransform: 'uppercase',
                }}
              >
                {c.gap.midLabel}
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: '12px', color: '#F2F2F2' }}>
                <span>{c.gap.aboveLabel}</span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>{c.gap.belowLabel}</span>
              </div>
              <div style={{ height: '120px' }} />
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 4 — THE FRAME (Tiger mode begins)
        ================================================================ */}
        <section
          id="frame"
          data-brand-mode="tiger"
          className="lt-section-padding"
          style={{
            padding: '160px 40px 120px',
            background: '#0A0A0A',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow color={PINK}>03 · THE FRAME</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <h2
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: 500,
                  fontSize: 'clamp(34px, 5.4vw, 76px)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.015em',
                  margin: 0,
                  color: '#F2F2F2',
                  textWrap: 'balance',
                }}
              >
                {c.frame.titleLines[0]}
                <br />
                <span style={{ color: LIME }}>{c.frame.titleLines[1]}</span>
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <p style={{ fontFamily: FONT_MONO, fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '36px', letterSpacing: '0.04em' }}>
                {c.frame.subline}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 5 — LAYER 01: SENSOR NETWORK
        ================================================================ */}
        <div id="layers" />
        <LayerSection layer={c.layers[0]} num={1}>
          <SensorNetworkDiagram />
          <div style={{ marginTop: '20px', opacity: 0.4 }}>
            <HRWaveform />
          </div>
        </LayerSection>

        {/* ================================================================
            SECTION 6 — LAYER 02: GAMING FLYWHEEL
        ================================================================ */}
        <LayerSection layer={c.layers[1]} num={2}>
          <Leaderboard seed={c.leaderboard} />
        </LayerSection>

        {/* ================================================================
            SECTION 7 — LAYER 03: MERCH FLYWHEEL
        ================================================================ */}
        <LayerSection layer={c.layers[2]} num={3}>
          <MerchGrid items={c.merch} />
        </LayerSection>

        {/* ================================================================
            SECTION 8 — LAYER 04: TIGER COACH
        ================================================================ */}
        <LayerSection layer={c.layers[3]} num={4}>
          <TigerCoachChat messages={c.coachChat} />
        </LayerSection>

        {/* ================================================================
            SECTION 8.5 — LAYER 05: THE LOYALTY LAYER
        ================================================================ */}
        <section
          data-brand-mode="tiger"
          className="lt-section-padding"
          style={{
            padding: '160px 40px',
            background: '#0A0A0A',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow color={PINK}>{`08 · ${c.loyalty.name.toUpperCase()}`}</SectionEyebrow>
            </Reveal>

            <div
              className="lt-two-col"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '64px',
                alignItems: 'start',
                marginBottom: '64px',
              }}
            >
              <div>
                <Reveal>
                  <LayerNumber>{c.loyalty.num}</LayerNumber>
                  <h2
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 400,
                      fontSize: 'clamp(34px, 4.6vw, 60px)',
                      lineHeight: 1.08,
                      letterSpacing: '-0.015em',
                      margin: '16px 0 20px 0',
                      color: '#F2F2F2',
                    }}
                  >
                    {c.loyalty.name}
                  </h2>
                  <p
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 500,
                      fontSize: 'clamp(18px, 2vw, 26px)',
                      lineHeight: 1.3,
                      color: PINK,
                      margin: '0 0 32px 0',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {c.loyalty.tagline}
                  </p>
                </Reveal>
              </div>

              <div>
                <Reveal delay={120}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {c.loyalty.paragraphs.map((p, i) => (
                      <BodyParagraph key={i} size="md">
                        {p}
                      </BodyParagraph>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>

            <Reveal delay={200}>
              <TierLadder tiers={c.loyalty.tiers} />
            </Reveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 9 — HOW THE LAYERS COMPOUND
        ================================================================ */}
        <section
          data-brand-mode="tiger"
          className="lt-section-padding"
          style={{
            padding: '160px 40px',
            background: '#0A0A0A',
            borderTop: '1px solid rgba(255,110,31,0.12)',
            borderBottom: '1px solid rgba(255,110,31,0.12)',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow color={PINK}>09 · COMPOUNDING</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading size="lg" align="center">
                {c.compound.headline}
              </DisplayHeading>
            </Reveal>

            <div className="lt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', marginTop: '64px' }}>
              {/* Four beats */}
              <div>
                {c.compound.beats.map((beat, i) => (
                  <Reveal key={beat} delay={i * 120}>
                    <p
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 500,
                        fontSize: 'clamp(20px, 2.2vw, 30px)',
                        lineHeight: 1.3,
                        color: i === c.compound.beats.length - 1 ? LIME : '#F2F2F2',
                        margin: '0 0 18px 0',
                        textAlign: 'left',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {beat}
                    </p>
                  </Reveal>
                ))}
              </div>

              {/* Circle diagram */}
              <Reveal delay={400}>
                <CompoundCircle centerLabel={c.compound.centerLabel} />
              </Reveal>
            </div>

            <Reveal delay={600}>
              <p
                style={{
                  marginTop: '64px',
                  fontFamily: FONT_MONO,
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.7)',
                  maxWidth: '60ch',
                  margin: '64px auto 0',
                }}
              >
                {c.compound.closing}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 10 — ASIA ROLLOUT
        ================================================================ */}
        <section
          data-brand-mode="tiger"
          className="lt-section-padding"
          style={{
            padding: '160px 40px',
            background: '#0A0A0A',
            borderBottom: '1px solid rgba(255,110,31,0.12)',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow color={PINK}>10 · ASIA ROLLOUT</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading size="lg">{c.asia.headline}</DisplayHeading>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontFamily: FONT_MONO, fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginTop: '16px', maxWidth: '60ch' }}>
                {c.asia.subline}
              </p>
            </Reveal>

            <div style={{ marginTop: '64px' }}>
              <AsiaMap cities={c.asia.cities} sequence={c.asia.sequence} />
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 11 — HARDWARE PHASING
        ================================================================ */}
        <section
          data-brand-mode="tiger"
          className="lt-section-padding"
          style={{
            padding: '160px 40px',
            background: '#0A0A0A',
            borderBottom: '1px solid rgba(255,110,31,0.12)',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow color={PINK}>11 · HARDWARE PHASING</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading size="lg">{c.hardware.headline}</DisplayHeading>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontFamily: FONT_MONO, fontSize: '15px', color: LIME, marginTop: '20px', letterSpacing: '0.02em' }}>
                {c.hardware.subline}
              </p>
            </Reveal>

            <div
              className="lt-hardware-row"
              style={{
                marginTop: '72px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0',
                position: 'relative',
                borderTop: `1px solid rgba(255,110,31,0.2)`,
                borderBottom: `1px solid rgba(255,110,31,0.2)`,
              }}
            >
              {c.hardware.phases.map((phase, i) => (
                <Reveal key={phase.version} delay={i * 100}>
                  <div
                    style={{
                      padding: '36px 24px',
                      borderRight: i < 3 ? '1px solid rgba(255,110,31,0.2)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      minHeight: '260px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '11px',
                        letterSpacing: '0.18em',
                        color: PINK,
                        textTransform: 'uppercase',
                      }}
                    >
                      {phase.version}
                    </span>
                    {/* Stylized device icon — gradient outline */}
                    <DeviceIcon kind={phase.device} index={i} />
                    <h3
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 500,
                        fontSize: '22px',
                        margin: 0,
                        color: '#F2F2F2',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {phase.device}
                    </h3>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '11px',
                        color: LIME,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {phase.timing}
                    </span>
                    <p
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '12px',
                        lineHeight: 1.55,
                        color: 'rgba(255,255,255,0.65)',
                        margin: 0,
                      }}
                    >
                      {phase.spec}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={500}>
              <p
                style={{
                  marginTop: '48px',
                  fontFamily: FONT_MONO,
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.8)',
                  maxWidth: '60ch',
                }}
              >
                {c.hardware.body}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 12 — WHY THIS PARTNERSHIP WORKS
        ================================================================ */}
        <section
          data-brand-mode="proxyz"
          className="lt-section-padding"
          style={{
            padding: '160px 40px',
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow>12 · DIVISION OF LABOR</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading size="lg" align="center">
                {c.partnership.headline}
              </DisplayHeading>
            </Reveal>

            <Reveal delay={220}>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.78)',
                  maxWidth: '64ch',
                  margin: '32px auto 0',
                  textAlign: 'center',
                }}
              >
                {c.partnership.openingLine}
              </p>
            </Reveal>

            <div className="lt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginTop: '64px', border: '1px solid rgba(255,255,255,0.12)' }}>
              {/* Lazy Tiger column */}
              <Reveal>
                <div style={{ padding: '40px 32px', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                  <h3
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: '20px',
                      letterSpacing: '0.2em',
                      color: PINK,
                      margin: '0 0 28px 0',
                      fontWeight: 500,
                    }}
                  >
                    {c.partnership.lazyTigerLabel}
                  </h3>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {c.partnership.lazyTigerBullets.map((b, i) => (
                      <li
                        key={b}
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: '15px',
                          lineHeight: 1.6,
                          color: '#F2F2F2',
                          paddingLeft: '24px',
                          position: 'relative',
                          opacity: 0,
                          animation: `lt-bullet-in 400ms ease-out ${i * 120}ms forwards`,
                        }}
                      >
                        <span style={{ position: 'absolute', left: 0, top: 0, color: PINK }}>→</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              {/* PROXYZ column */}
              <Reveal delay={140}>
                <div style={{ padding: '40px 32px' }}>
                  <h3
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: '20px',
                      letterSpacing: '0.2em',
                      color: 'var(--accent-pink)',
                      margin: '0 0 28px 0',
                      fontWeight: 500,
                    }}
                  >
                    {c.partnership.proxyzLabel}
                  </h3>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {c.partnership.proxyzBullets.map((b, i) => (
                      <li
                        key={b}
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: '15px',
                          lineHeight: 1.6,
                          color: '#F2F2F2',
                          paddingLeft: '24px',
                          position: 'relative',
                          opacity: 0,
                          animation: `lt-bullet-in 400ms ease-out ${i * 120 + 200}ms forwards`,
                        }}
                      >
                        <span style={{ position: 'absolute', left: 0, top: 0, color: 'var(--accent-pink)' }}>→</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
            <style>{`
              @keyframes lt-bullet-in {
                from { opacity: 0; transform: translateX(-8px); }
                to   { opacity: 1; transform: translateX(0); }
              }
            `}</style>

            {/* Studio shapes row — visual echo of the in-app design */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', marginTop: '64px', opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                <CardioCircle size={24} /> Cardio
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                <ReformerTriangle size={24} /> Reformer
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                <YogaSquare size={24} /> Yoga
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 12.5 — THE FORMAT OTHERS WILL WANT TO INSTALL
        ================================================================ */}
        <section
          data-brand-mode="proxyz"
          className="lt-section-padding"
          style={{
            padding: '160px 40px',
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow>{c.formatQuadrant.eyebrow}</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading size="lg">{c.formatQuadrant.headline}</DisplayHeading>
            </Reveal>

            <div
              className="lt-two-col"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '64px',
                alignItems: 'start',
                marginTop: '48px',
                marginBottom: '64px',
              }}
            >
              <Reveal delay={200}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {c.formatQuadrant.paragraphs.map((p, i) => (
                    <BodyParagraph key={i} size="md">
                      {p}
                    </BodyParagraph>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={320}>
                <QuadrantGrid
                  xLeftLabel={c.formatQuadrant.xLeftLabel}
                  xRightLabel={c.formatQuadrant.xRightLabel}
                  yTopLabel={c.formatQuadrant.yTopLabel}
                  yBottomLabel={c.formatQuadrant.yBottomLabel}
                  placements={c.formatQuadrant.placements}
                  emptyQuadrantLabel={c.formatQuadrant.emptyQuadrantLabel}
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 12.6 — THE HOTEL NETWORK OPPORTUNITY
        ================================================================ */}
        <section
          data-brand-mode="proxyz"
          className="lt-section-padding"
          style={{
            padding: '160px 40px',
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow>{c.hotelNetwork.eyebrow}</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading size="lg">{c.hotelNetwork.headline}</DisplayHeading>
            </Reveal>

            <div
              className="lt-two-col"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr',
                gap: '64px',
                alignItems: 'center',
                marginTop: '64px',
              }}
            >
              <Reveal delay={200}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {c.hotelNetwork.paragraphs.map((p, i) => (
                    <BodyParagraph key={i} size="md">
                      {p}
                    </BodyParagraph>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={320}>
                <HotelMap markers={c.hotelNetwork.markers} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 13 — THE ENGAGEMENT MODEL
        ================================================================ */}
        <section
          id="engagement"
          data-brand-mode="proxyz"
          className="lt-section-padding"
          style={{
            padding: '140px 40px',
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow>15 · ENGAGEMENT MODEL</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading size="md">{c.engagement.headline}</DisplayHeading>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {c.engagement.paragraphs.map((p, i) => (
                  <BodyParagraph key={i} size="md" maxWidth="64ch">
                    {p}
                  </BodyParagraph>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 14 — DILIGENCE IN MOTION
        ================================================================ */}
        <section
          data-brand-mode="proxyz"
          className="lt-section-padding"
          style={{
            padding: '160px 40px',
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow>16 · DILIGENCE IN MOTION</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading size="lg">{c.diligence.headline}</DisplayHeading>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontFamily: FONT_MONO, fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginTop: '20px', maxWidth: '60ch' }}>
                {c.diligence.subline}
              </p>
            </Reveal>

            <div className="lt-three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '64px' }}>
              {c.diligence.cards.map((card, i) => (
                <Reveal key={card.label} delay={i * 100}>
                  <article
                    style={{
                      padding: '32px 28px',
                      background: '#0A0A0A',
                      // Replaces the 3px side-stripe (impeccable absolute ban)
                      // with a pink-tinted full-border treatment. The label
                      // span inside already carries the pink accent.
                      border: `1px solid ${PINK}`,
                      boxShadow: 'inset 0 0 0 1px rgba(255, 65, 147, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      minHeight: '100%',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '10px',
                        letterSpacing: '0.2em',
                        color: LIME,
                        textTransform: 'uppercase',
                      }}
                    >
                      {card.label}
                    </span>
                    <h3
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: '22px',
                        lineHeight: 1.2,
                        margin: 0,
                        fontWeight: 500,
                        color: '#F2F2F2',
                        letterSpacing: '0.005em',
                      }}
                    >
                      {card.headline}
                    </h3>
                    <p
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '13px',
                        lineHeight: 1.65,
                        color: 'rgba(255,255,255,0.72)',
                        margin: 0,
                      }}
                    >
                      {card.body}
                    </p>
                    <span
                      style={{
                        marginTop: 'auto',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        fontFamily: FONT_MONO,
                        fontSize: '10px',
                        letterSpacing: '0.04em',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {c.diligence.sourceLine}
                    </span>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 14 — TEAM
        ================================================================ */}
        <section
          id="team"
          data-brand-mode="proxyz"
          className="lt-section-padding"
          style={{
            padding: '140px 40px',
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <Reveal>
              <SectionEyebrow>17 · WHO IS WORKING ON THIS</SectionEyebrow>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading size="md">{c.team.headline}</DisplayHeading>
            </Reveal>

            <div
              className="lt-team-grid"
              style={{
                marginTop: '56px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px',
              }}
            >
              {c.team.members.map((m, i) => (
                <Reveal key={m.name} delay={i * 120}>
                  <div
                    style={{
                      padding: '36px 32px',
                      background: '#111',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '88px',
                        height: '88px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        overflow: 'hidden',
                        background: `linear-gradient(135deg, ${PINK}, ${LIME})`,
                        boxShadow: `0 0 0 1px ${PINK}, 0 0 20px rgba(199,124,63,0.18)`,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: FONT_DISPLAY,
                          fontSize: '26px',
                          fontWeight: 500,
                          color: '#0A0A0A',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {m.initials}
                      </span>
                      {m.photo && (
                        <img
                          src={m.photo}
                          alt={m.name}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center top',
                            display: 'block',
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: '20px',
                          margin: 0,
                          color: '#F2F2F2',
                          fontWeight: 500,
                        }}
                      >
                        {m.name}
                      </h3>
                      <p
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: '11px',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.5)',
                          margin: '4px 0 14px 0',
                        }}
                      >
                        {m.role}
                      </p>
                      <p
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: '14px',
                          lineHeight: 1.6,
                          color: 'rgba(255,255,255,0.78)',
                          margin: 0,
                        }}
                      >
                        {m.bio}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 15 — FOOTER
        ================================================================ */}
        <section
          data-brand-mode="proxyz"
          style={{
            padding: '160px 40px 120px',
            background: '#0A0A0A',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <HeroMesh intensity={0.4} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
            {/* Master logo stamp — copper tiger-and-rider */}
            <Reveal>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
                <MasterLogo />
              </div>
            </Reveal>

            <Reveal delay={120}>
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 'clamp(36px, 5vw, 72px)',
                  letterSpacing: '0.18em',
                  margin: 0,
                  color: LIME,
                  textWrap: 'balance',
                  textShadow: `0 0 32px rgba(210,255,59,0.32)`,
                }}
              >
                {c.footer.closing}
                <span className="lt-cursor-blink" style={{ background: LIME }} />
              </h2>
            </Reveal>

            <Reveal delay={240}>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.55)',
                  marginTop: '40px',
                  whiteSpace: 'pre-line',
                  letterSpacing: '0.04em',
                }}
              >
                {c.footer.sub}
              </p>
            </Reveal>

            <Reveal delay={360}>
              <div style={{ marginTop: '48px' }}>
                <MagneticAnchor
                  href="mailto:hello@proxyz.studio?subject=Lazy Tiger × PROXYZ"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#0A0A0A',
                    background: PINK,
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    letterSpacing: '0.16em',
                    padding: '14px 26px',
                    borderRadius: '2px',
                  }}
                >
                  Talk to PROXYZ →
                </MagneticAnchor>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      </PartnerGate>
    </>
  );
}

/* ---------- Helper components inlined here for cohesion ---------- */

function LayerSection({
  layer,
  num,
  children,
}: {
  layer: { num: string; name: string; tagline: string; body: string };
  num: number;
  children: React.ReactNode;
}) {
  const reverse = num % 2 === 0; // alternate copy-vs-visual positions
  const labelIdx = String(num + 3).padStart(2, '0'); // section number on the page

  return (
    <section
      data-brand-mode="tiger"
      className="lt-section-padding"
      style={{
        padding: '160px 40px',
        background: '#0A0A0A',
        borderBottom: '1px solid rgba(255,110,31,0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <Reveal>
          <SectionEyebrow color={PINK}>{`${labelIdx} · ${layer.name.toUpperCase()}`}</SectionEyebrow>
        </Reveal>

        <div
          className="lt-leaderboard-host"
          style={{
            display: 'grid',
            gridTemplateColumns: reverse ? '1.1fr 1fr' : '1fr 1.1fr',
            gap: '64px',
            alignItems: 'center',
          }}
        >
          <div style={{ order: reverse ? 2 : 1 }}>
            <Reveal>
              <LayerNumber>{layer.num}</LayerNumber>
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 'clamp(34px, 4.6vw, 60px)',
                  lineHeight: 1.1,
                  letterSpacing: '0.005em',
                  margin: '16px 0 20px 0',
                  color: '#F2F2F2',
                }}
              >
                {layer.name}
              </h2>
              <p
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 500,
                  fontSize: 'clamp(18px, 2vw, 26px)',
                  lineHeight: 1.3,
                  color: PINK,
                  margin: '0 0 32px 0',
                  letterSpacing: '0.01em',
                }}
              >
                {layer.tagline}
              </p>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.78)',
                  margin: 0,
                }}
              >
                {layer.body}
              </p>
            </Reveal>
          </div>

          <div style={{ order: reverse ? 1 : 2, position: 'relative' }}>
            <Reveal delay={120}>{children}</Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function DeviceIcon({ kind, index }: { kind: string; index: number }) {
  // Map device kind to a stylized SVG icon
  const stroke = `url(#device-grad-${index})`;
  let path = '';
  switch (kind) {
    case 'Phone':
      path = 'M 30 10 L 70 10 Q 76 10 76 16 L 76 84 Q 76 90 70 90 L 30 90 Q 24 90 24 84 L 24 16 Q 24 10 30 10 Z M 38 78 L 62 78';
      break;
    case 'Studio kiosk':
      path = 'M 10 10 L 90 10 L 90 60 L 10 60 Z M 50 60 L 50 80 M 30 80 L 70 80 M 20 20 L 80 20 L 80 50 L 20 50 Z';
      break;
    case 'Member pod':
      path = 'M 50 12 C 26 12 14 30 14 50 C 14 70 30 84 50 84 C 70 84 86 70 86 50 C 86 30 74 12 50 12 Z M 36 46 L 36 56 M 50 42 L 50 60 M 64 46 L 64 56';
      break;
    case 'Tiger Glass':
      path = 'M 8 38 L 30 32 L 70 32 L 92 38 L 88 56 L 60 60 L 50 50 L 40 60 L 12 56 Z M 28 38 L 28 54 M 72 38 L 72 54';
      break;
    default:
      path = 'M 20 20 L 80 20 L 80 80 L 20 80 Z';
  }
  return (
    <div style={{ width: '64px', height: '64px' }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id={`device-grad-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={LIME} />
            <stop offset="100%" stopColor={PINK} />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function MasterLogo() {
  return (
    <img
      src="/lazy-tiger/master-logo.png"
      alt="Lazy Tiger master logo — copper tiger and rider"
      width={320}
      height={170}
      style={{ display: 'block', height: 'auto', maxWidth: '100%' }}
    />
  );
}
