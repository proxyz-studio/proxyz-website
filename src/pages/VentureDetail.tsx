/* /ventures/<slug> — venture detail page (multi-section).
 *
 * One component, parameterized by URL slug. AUTOLOOM and MAGNIZ both
 * render through here today. PRYZM (no detail) bounces back to /ventures.
 *
 * v1 architecture: single-page with an anchor-based sub-nav (sections
 * scroll into view on click). Future v2 can split each section into its
 * own route at /ventures/<slug>/<section> if the source-of-truth content
 * outgrows a single scroll.
 */

import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { MagneticAnchor } from '../components/Spatial';
import { Marginalia } from '../components/Editorial';
import { HeroMesh } from '../components/Glow';
import Nav from '../components/Nav';
import Footer from '../sections/Footer';
import { venturesPageConfig, type VentureBrand, type VentureCard } from '../config';

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', monospace";

/** PROXYZ default accent values, used when a venture has no brand override. */
const PROXYZ_PINK = '#FF4193';
const PROXYZ_PINK_SOFT = 'rgba(255,65,147,0.04)';
const PROXYZ_PINK_TINT = 'rgba(255,65,147,0.08)';

interface ResolvedBrand {
  accent: string;
  accentSoft: string;
  accentTint: string;
}

function resolveBrand(brand: VentureBrand | undefined): ResolvedBrand {
  return {
    accent: brand?.accent ?? PROXYZ_PINK,
    accentSoft: brand?.accentSoft ?? PROXYZ_PINK_SOFT,
    accentTint: brand?.accentTint ?? PROXYZ_PINK_TINT,
  };
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'how', label: 'How it works' },
  { id: 'modules', label: 'Modules' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'team', label: 'Team' },
] as const;

function getStatusPillStyle(status: string, brandAccent: string): React.CSSProperties {
  if (status === 'live') return { color: '#000', background: '#D2FF3B' };
  if (status === 'building') return { color: '#000', background: brandAccent };
  return {
    color: 'rgba(255,255,255,0.78)',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.32)',
  };
}

function getRoadmapStatusColor(status: string, brandAccent: string): string {
  if (status === 'done') return '#5BC9B8';
  if (status === 'active') return brandAccent;
  return 'rgba(255,255,255,0.35)';
}

function SubNav({ venture }: { venture: VentureCard }) {
  const brand = resolveBrand(venture.brand);
  return (
    <nav
      aria-label={`${venture.name} sections`}
      style={{
        position: 'sticky',
        // 82px clears the fixed main <Nav> (padding 20 + logo 42 + padding 20).
        // Sticky engages only when this element would scroll above 82px from
        // the viewport top, so it pins right below the main nav.
        top: '82px',
        zIndex: 30,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 40px',
      }}
      className="venture-subnav"
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          gap: '28px',
          alignItems: 'center',
          flexWrap: 'wrap',
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <Link
          to="/ventures"
          style={{
            color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none',
            marginRight: '8px',
          }}
        >
          ← Ventures
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{venture.name}</span>
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
              paddingBottom: '1px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#fff';
              (e.currentTarget as HTMLElement).style.borderBottomColor = brand.accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
              (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent';
            }}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function Hero({ venture }: { venture: VentureCard }) {
  const brand = resolveBrand(venture.brand);
  return (
    <section
      className="section-mobile"
      style={{
        position: 'relative',
        padding: '120px 40px 80px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <HeroMesh />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1360px', margin: '0 auto' }}>
        <Reveal>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: brand.accent,
              margin: '0 0 22px 0',
            }}
          >
            PROXYZ Ventures / {venture.name}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(56px, 8vw, 128px)',
              fontWeight: 400,
              lineHeight: 0.94,
              letterSpacing: '0.015em',
              textTransform: 'uppercase',
              margin: 0,
              color: '#fff',
            }}
          >
            {venture.name}
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: 'clamp(20px, 2.2vw, 28px)',
              lineHeight: 1.4,
              color: brand.accent,
              margin: '24px 0 0 0',
              maxWidth: '76ch',
            }}
          >
            {venture.tagline}
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div style={{ marginTop: '40px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '8px 14px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                ...getStatusPillStyle(venture.status, brand.accent),
              }}
            >
              ● {venture.statusLabel}
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '8px 14px',
                borderRadius: '999px',
                color: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.22)',
              }}
            >
              {venture.domain}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SectionHeading({ id, label, number }: { id: string; label: string; number: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'baseline',
        gap: '24px',
        marginBottom: '40px',
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: '12px',
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
        }}
      >
        {number}
      </span>
      <h2
        id={id}
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(32px, 4vw, 56px)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '0.015em',
          textTransform: 'uppercase',
          margin: 0,
          color: '#fff',
          scrollMarginTop: '80px',
        }}
      >
        {label}
      </h2>
    </div>
  );
}

export default function VentureDetail() {
  const { slug } = useParams<{ slug: string }>();
  const venture = venturesPageConfig.ventures.find((v) => v.detail?.slug === slug);

  // Reset scroll on mount so the hero shows first, not whatever anchor was last.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!venture || !venture.detail) {
    return <Navigate to="/ventures" replace />;
  }

  const d = venture.detail;
  const brand = resolveBrand(venture.brand);

  return (
    <>
      <Nav />
      <main style={{ background: '#000', color: '#fff' }}>
        <Hero venture={venture} />
        <SubNav venture={venture} />

        {/* OVERVIEW */}
        <section
          className="section-mobile"
          style={{ padding: '120px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative' }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                opacity: 0.22,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <Marginalia number="01" color="light" size="clamp(96px, 12vw, 180px)" />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SectionHeading id="overview" label="Overview" number="01" />
              <div style={{ display: 'grid', gap: '24px', maxWidth: '76ch' }}>
                {d.overview.map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '16px',
                      lineHeight: 1.75,
                      color: 'rgba(255,255,255,0.86)',
                      margin: 0,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          className="section-mobile"
          style={{ padding: '120px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative' }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                opacity: 0.22,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <Marginalia number="02" color="light" size="clamp(96px, 12vw, 180px)" />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SectionHeading id="how" label="How it works" number="02" />
              <div
                className="venture-how-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '32px',
                }}
              >
                {d.howItWorks.map((step) => (
                  <div
                    key={step.num}
                    style={{
                      padding: '32px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '11px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: brand.accent,
                        margin: '0 0 16px 0',
                      }}
                    >
                      Step {step.num}
                    </p>
                    <h3
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: '24px',
                        fontWeight: 400,
                        margin: '0 0 14px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.015em',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '14px',
                        lineHeight: 1.7,
                        color: 'rgba(255,255,255,0.78)',
                        margin: 0,
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MODULES */}
        <section
          className="section-mobile"
          style={{ padding: '120px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative' }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                opacity: 0.22,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <Marginalia number="03" color="light" size="clamp(96px, 12vw, 180px)" />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SectionHeading id="modules" label="Modules" number="03" />
              <div
                className="venture-modules-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '24px',
                }}
              >
                {d.modulesDetail.map((m) => (
                  <div
                    key={m.name}
                    style={{
                      padding: '28px 32px',
                      borderTop: `1px solid ${brand.accent}`,
                      background: brand.accentSoft,
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '14px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        color: '#fff',
                        margin: '0 0 12px 0',
                      }}
                    >
                      {m.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '14px',
                        lineHeight: 1.7,
                        color: 'rgba(255,255,255,0.82)',
                        margin: 0,
                      }}
                    >
                      {m.body}
                    </p>
                    {m.details && m.details.length > 0 && (
                      <div
                        style={{
                          marginTop: '24px',
                          paddingTop: '24px',
                          borderTop: '1px dashed rgba(255,255,255,0.14)',
                        }}
                      >
                        <p
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: '10px',
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: brand.accent,
                            margin: '0 0 16px 0',
                            fontWeight: 600,
                          }}
                        >
                          Tuning
                        </p>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {m.details.map((d) => (
                            <li
                              key={d.label}
                              style={{
                                marginBottom: '14px',
                                fontFamily: FONT_MONO,
                                fontSize: '13px',
                                lineHeight: 1.65,
                                color: 'rgba(255,255,255,0.74)',
                              }}
                            >
                              <strong style={{ color: '#fff', fontWeight: 600 }}>
                                {d.label}.
                              </strong>{' '}
                              {d.body}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ROADMAP */}
        <section
          className="section-mobile"
          style={{ padding: '120px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative' }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                opacity: 0.22,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <Marginalia number="04" color="light" size="clamp(96px, 12vw, 180px)" />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SectionHeading id="roadmap" label="Roadmap" number="04" />
              <ul
                className="venture-roadmap"
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                }}
              >
                {d.roadmap.map((r) => (
                  <li
                    key={r.label}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '13px',
                      lineHeight: 1.5,
                      padding: '20px 18px',
                      border: `1px solid ${getRoadmapStatusColor(r.status, brand.accent)}`,
                      color: r.status === 'next' ? 'rgba(255,255,255,0.5)' : '#fff',
                      background: r.status === 'active' ? brand.accentTint : 'transparent',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        background: getRoadmapStatusColor(r.status, brand.accent),
                        borderRadius: '50%',
                        marginTop: '6px',
                        flexShrink: 0,
                        animation: r.status === 'active' ? 'pulse 2s infinite' : 'none',
                      }}
                    />
                    <span>{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section
          className="section-mobile"
          style={{ padding: '120px 40px 60px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative' }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                opacity: 0.22,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <Marginalia number="05" color="light" size="clamp(96px, 12vw, 180px)" />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SectionHeading id="team" label="Team" number="05" />
              <div
                className="venture-team-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '24px',
                  maxWidth: '900px',
                }}
              >
                {d.team.map((member) => (
                  <div
                    key={member.name}
                    style={{
                      padding: '24px 28px',
                      borderLeft: `2px solid ${brand.accent}`,
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: '22px',
                        fontWeight: 400,
                        textTransform: 'uppercase',
                        letterSpacing: '0.015em',
                        margin: '0 0 6px 0',
                      }}
                    >
                      {member.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '12px',
                        letterSpacing: '0.08em',
                        color: 'rgba(255,255,255,0.65)',
                        margin: 0,
                      }}
                    >
                      {member.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CLOSING — back to ventures + tease that more source-of-truth pages are coming */}
        <section
          className="section-mobile"
          style={{ padding: '80px 40px 120px', background: '#0a0a0a' }}
        >
          <div
            style={{
              maxWidth: '1360px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '32px',
              alignItems: 'center',
            }}
            className="venture-closing"
          >
            <div>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                  margin: '0 0 10px 0',
                }}
              >
                More on the way
              </p>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.78)',
                  margin: 0,
                  maxWidth: '60ch',
                }}
              >
                This is the v1 source-of-truth page for {venture.name}. Research dossiers,
                decisions log, install guides, and pricing detail will land here as the
                venture moves through launch.
              </p>
            </div>
            <MagneticAnchor
              href="/ventures"
              style={{
                fontFamily: FONT_MONO,
                fontSize: '12px',
                color: '#000',
                background: '#fff',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                padding: '14px 26px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                justifySelf: 'end',
              }}
            >
              ← Back to ventures
            </MagneticAnchor>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
