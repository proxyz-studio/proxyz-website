import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import PartnerSubNav from '../components/PartnerSubNav';
import PartnerGate from '../components/PartnerGate';
import Reveal from '../components/Reveal';
import { MagneticAnchor, TiltCard } from '../components/Spatial';
import { HeroMesh, HeadlineHalo } from '../components/Glow';
import Footer from '../sections/Footer';
import { fastFixPageConfig } from '../config';

const FONT_MONO = "'IBM Plex Mono', monospace";

function StudioOSHub({ labels, coreLabel }: { labels: string[]; coreLabel: string }) {
  return (
    <svg
      viewBox="0 0 560 560"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', maxWidth: '480px', display: 'block' }}
    >
      <circle cx="280" cy="280" r="200" fill="none" stroke="rgba(255,65,147,0.10)" strokeWidth="1" />
      <circle cx="280" cy="280" r="150" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="280" cy="280" r="95" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

      <g className="svg-draw-lines" stroke="rgba(255,255,255,0.20)" strokeWidth="1">
        <line x1="280" y1="280" x2="280" y2="80" />
        <line x1="280" y1="280" x2="421" y2="139" />
        <line x1="280" y1="280" x2="480" y2="280" />
        <line x1="280" y1="280" x2="421" y2="421" />
        <line x1="280" y1="280" x2="280" y2="480" />
        <line x1="280" y1="280" x2="139" y2="421" />
        <line x1="280" y1="280" x2="80" y2="280" />
        <line x1="280" y1="280" x2="139" y2="139" />
      </g>

      <g fill="#ff4193">
        <circle cx="280" cy="80" r="5" />
        <circle cx="421" cy="139" r="5" />
        <circle cx="480" cy="280" r="5" />
        <circle cx="421" cy="421" r="5" />
        <circle cx="280" cy="480" r="5" />
        <circle cx="139" cy="421" r="5" />
        <circle cx="80" cy="280" r="5" />
        <circle cx="139" cy="139" r="5" />
      </g>

      <g fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="rgba(255,255,255,0.88)" letterSpacing="0.5">
        <text x="280" y="58" textAnchor="middle">{labels[0]}</text>
        <text x="436" y="124" textAnchor="start">{labels[1]}</text>
        <text x="498" y="284" textAnchor="start">{labels[2]}</text>
        <text x="436" y="441" textAnchor="start">{labels[3]}</text>
        <text x="280" y="506" textAnchor="middle">{labels[4]}</text>
        <text x="124" y="441" textAnchor="end">{labels[5]}</text>
        <text x="62" y="284" textAnchor="end">{labels[6]}</text>
        <text x="124" y="124" textAnchor="end">{labels[7]}</text>
      </g>

      <circle cx="280" cy="280" r="50" fill="#0a0a0a" stroke="#F2F2F2" strokeWidth="1" />
      <text x="280" y="272" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#ff4193" textAnchor="middle" letterSpacing="2">THE</text>
      <text x="280" y="292" fontFamily="IBM Plex Mono, monospace" fontSize="13" fill="#F2F2F2" textAnchor="middle" letterSpacing="2">{coreLabel.replace('THE ', '')}</text>
    </svg>
  );
}

function SectionLabel({ children, pink = true }: { children: React.ReactNode; pink?: boolean }) {
  return (
    <p
      style={{
        fontFamily: FONT_MONO,
        fontSize: '12px',
        fontWeight: 400,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: pink ? 'var(--accent-pink)' : 'rgba(255,255,255,0.6)',
        margin: '0 0 48px 0',
      }}
    >
      {children}
    </p>
  );
}

function Heading({ lines, accentIndex }: { lines: string[]; accentIndex?: number }) {
  return (
    <h2
      style={{
        fontFamily: FONT_MONO,
        fontSize: 'clamp(28px, 3.6vw, 48px)',
        fontWeight: 400,
        lineHeight: 1.1,
        letterSpacing: '-0.015em',
        textTransform: 'none',
        margin: '0 0 32px 0',
        textWrap: 'balance',
      }}
    >
      {lines.map((line, i) => (
        <span
          key={`${line}-${i}`}
          style={accentIndex === i ? { color: 'var(--accent-pink)' } : undefined}
        >
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </h2>
  );
}

export default function FastFix() {
  const c = fastFixPageConfig;

  return (
    <>
      <Nav />
      <PartnerGate partner="fast-fix">
      <PartnerSubNav
        name="FAST-FIX"
        sections={[
          { id: 'model', label: 'Model' },
          { id: 'os', label: 'OS' },
          { id: 'contributions', label: 'Contributions' },
          { id: 'partnership', label: 'Partnership' },
          { id: 'why-now', label: 'Why now' },
          { id: 'roadmap', label: 'Roadmap' },
        ]}
      />
      <main style={{ background: '#0A0A0A', color: '#F2F2F2' }}>
        {/* ====== HERO ====== */}
        <section
          className="section-mobile"
          style={{
            position: 'relative',
            padding: '180px 40px 120px',
            borderBottom: '1px solid rgba(255,255,255,0.30)',
            overflow: 'hidden',
          }}
        >
          <HeroMesh />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1240px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--accent-pink)',
                margin: '0 0 24px 0',
              }}
            >
              <Link
                to="/pipeline"
                style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', marginRight: '12px' }}
              >
                ← Pipeline
              </Link>
              {c.eyebrow}
            </p>
            <h1
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 400,
                fontSize: 'clamp(40px, 6.4vw, 84px)',
                lineHeight: 0.98,
                letterSpacing: '-0.02em',
                margin: 0,
                textWrap: 'balance',
              }}
            >
              {c.titleLines.map((line, i) => (
                <span
                  key={`${line}-${i}`}
                  style={i === c.accentLineIndex ? { color: 'var(--accent-pink)' } : undefined}
                >
                  {line}
                  {i < c.titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '18px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.66)',
                margin: '32px 0 0 0',
                maxWidth: '60ch',
              }}
            >
              {c.subtitle}
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '56px' }}>
              {c.pills.map((pill, i) => (
                <span
                  key={pill}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    border: '1px solid rgba(255,255,255,0.30)',
                    borderRadius: '2px',
                    fontFamily: FONT_MONO,
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {i === 0 && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--accent-pink)',
                      }}
                    />
                  )}
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 01 · THE MODEL ====== */}
        <section
          id="model"
          className="section-mobile"
          style={{ padding: '96px 40px', borderBottom: '1px solid rgba(255,255,255,0.30)' }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <SectionLabel>{c.modelLabel}</SectionLabel>
            <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '80px', alignItems: 'start' }}>
              <div>
                <Heading lines={c.modelHeadingLines} />
              </div>
              <div>
                {c.modelParagraphs.map((p, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '17px',
                      lineHeight: 1.65,
                      color: 'rgba(255,255,255,0.85)',
                      margin: i === 0 ? '0' : '16px 0 0 0',
                    }}
                  >
                    {p}
                  </p>
                ))}
                <div
                  style={{
                    // Replaces the 1px side-stripe blockquote with a pink
                    // pull-quote: pink eyebrow above + larger body type.
                    // Honors impeccable's "side-stripe → leading marker"
                    // rewrite path.
                    padding: '24px 28px',
                    margin: '32px 0 0 0',
                    background: 'rgba(255, 65, 147, 0.06)',
                    border: '1px solid rgba(255, 65, 147, 0.30)',
                    color: '#F2F2F2',
                    fontFamily: FONT_MONO,
                    fontSize: '17px',
                    lineHeight: 1.55,
                    fontStyle: 'italic',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--accent-pink)',
                      fontStyle: 'normal',
                      marginBottom: '10px',
                    }}
                  >
                    Model quote
                  </div>
                  {c.modelQuote}
                </div>
              </div>
            </div>

            <div
              className="ff-steps"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                marginTop: '48px',
              }}
            >
              {c.modelSteps.map((step) => (
                <div
                  key={step.num}
                  style={{
                    padding: '28px 24px',
                    border: '1px solid rgba(255,255,255,0.30)',
                    background: '#0a0a0a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                      color: 'var(--accent-pink)',
                    }}
                  >
                    {step.num}
                  </span>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#F2F2F2',
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {step.title}
                  </div>
                  <p
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.66)',
                      margin: 0,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 02 · THE OPERATING SYSTEM ====== */}
        <section
          id="os"
          className="section-mobile"
          style={{ padding: '96px 40px', borderBottom: '1px solid rgba(255,255,255,0.30)' }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <SectionLabel>{c.studioOSLabel}</SectionLabel>
            <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '80px', alignItems: 'start' }}>
              <div>
                <Heading lines={c.studioOSHeadingLines} />
                <p
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '17px',
                    lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.85)',
                    margin: '24px 0 0 0',
                  }}
                >
                  {c.studioOSParagraphs[0]}
                </p>
                <p
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '17px',
                    lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.85)',
                    margin: '16px 0 0 0',
                  }}
                >
                  {c.studioOSParagraphs[1]}
                </p>
              </div>

              <div
                className="ff-hub"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: '56px',
                  alignItems: 'center',
                }}
              >
                <div>
                  <StudioOSHub labels={c.studioOSHubLabels} coreLabel={c.studioOSHubLabel} />
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                  }}
                >
                  {c.studioOSBullets.map((bullet, i) => {
                    const [bold, rest] = bullet.split('.');
                    return (
                      <li
                        key={i}
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: '14px',
                          lineHeight: 1.55,
                          color: 'rgba(255,255,255,0.85)',
                          padding: '16px 0',
                          borderTop: i === 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONT_MONO,
                            fontSize: '11px',
                            letterSpacing: '0.18em',
                            color: 'var(--accent-pink)',
                            minWidth: '20px',
                            marginTop: '3px',
                          }}
                        >
                          →
                        </span>
                        <span>
                          <strong style={{ color: '#F2F2F2', fontWeight: 600 }}>{bold}.</strong>
                          {rest}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ====== 03 · CONTRIBUTIONS ====== */}
        <section
          id="contributions"
          className="section-mobile"
          style={{ padding: '96px 40px', borderBottom: '1px solid rgba(255,255,255,0.30)' }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <SectionLabel>{c.contribLabel}</SectionLabel>
            <div
              className="ff-two-col"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.4fr',
                gap: '80px',
                alignItems: 'start',
                marginBottom: '48px',
              }}
            >
              <div>
                <Heading lines={c.contribHeadingLines} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '17px',
                    lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.85)',
                    margin: 0,
                  }}
                >
                  {c.contribLead}
                </p>
              </div>
            </div>

            <div
              className="ff-cards"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 0,
                borderTop: '1px solid rgba(255,255,255,0.30)',
                borderLeft: '1px solid rgba(255,255,255,0.30)',
              }}
            >
              {c.contributions.map((card, i) => (
                <Reveal key={card.num} delay={i * 70}>
                <TiltCard
                  maxTiltX={3}
                  maxTiltY={4}
                  style={{
                    padding: '40px 32px',
                    borderRight: '1px solid rgba(255,255,255,0.30)',
                    borderBottom: '1px solid rgba(255,255,255,0.30)',
                    minHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    background: '#0A0A0A',
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                      color: 'var(--accent-pink)',
                    }}
                  >
                    {card.num}
                  </span>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '22px',
                      lineHeight: 1.15,
                      fontWeight: 400,
                      color: '#F2F2F2',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {card.title}
                  </div>
                  <p
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.66)',
                      margin: 0,
                    }}
                  >
                    {card.lead}
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      padding: '12px 0 0 0',
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {card.bullets.map((b, bi) => (
                      <li
                        key={bi}
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: '13px',
                          lineHeight: 1.55,
                          color: 'rgba(255,255,255,0.85)',
                          paddingLeft: '18px',
                          position: 'relative',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            color: 'var(--accent-pink)',
                            fontSize: '12px',
                          }}
                        >
                          →
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 04 · THE PARTNERSHIP ====== */}
        <section
          id="partnership"
          className="section-mobile"
          style={{ padding: '96px 40px', borderBottom: '1px solid rgba(255,255,255,0.30)' }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <SectionLabel>{c.partnershipLabel}</SectionLabel>
            <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '80px', alignItems: 'start' }}>
              <div>
                <Heading lines={c.partnershipHeadingLines} />
              </div>
              <div>
                {c.partnershipParagraphs.map((p, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '17px',
                      lineHeight: 1.65,
                      color: 'rgba(255,255,255,0.85)',
                      margin: i === 0 ? '0' : '16px 0 0 0',
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>

            <div
              className="ff-engine"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr 1fr',
                gap: 0,
                border: '1px solid rgba(255,255,255,0.30)',
                marginTop: '40px',
                background: '#0a0a0a',
              }}
            >
              <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-pink)',
                  }}
                >
                  {c.operatorBringsLabel}
                </span>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {c.operatorBrings.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '14px',
                        lineHeight: 1.5,
                        color: 'rgba(255,255,255,0.85)',
                        paddingLeft: '18px',
                        position: 'relative',
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0, color: 'var(--accent-pink)' }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="ff-engine-center"
                style={{
                  padding: '32px 28px',
                  background: '#0A0A0A',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '14px',
                  borderLeft: '1px solid rgba(255,255,255,0.30)',
                  borderRight: '1px solid rgba(255,255,255,0.30)',
                }}
              >
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    border: '1px solid rgba(255,255,255,0.30)',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    letterSpacing: '0.18em',
                    color: '#F2F2F2',
                    fontFamily: FONT_MONO,
                  }}
                >
                  {c.partnershipCoreTitle}
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '12px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.66)',
                  }}
                >
                  {c.partnershipCoreLabel}
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.85)',
                    maxWidth: '24ch',
                  }}
                >
                  {c.partnershipCoreTag}
                </div>
              </div>

              <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-pink)',
                  }}
                >
                  {c.proxyzBringsLabel}
                </span>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {c.proxyzBrings.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '14px',
                        lineHeight: 1.5,
                        color: 'rgba(255,255,255,0.85)',
                        paddingLeft: '18px',
                        position: 'relative',
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0, color: 'var(--accent-pink)' }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ====== 05 · WHY NOW (paper inversion) ====== */}
        <section
          id="why-now"
          className="section-mobile"
          style={{
            padding: '96px 40px',
            background: '#F2F2F2',
            color: '#0A0A0A',
            borderBottom: '1px solid #000',
          }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent-pink)',
                margin: '0 0 48px 0',
              }}
            >
              {c.whyLabel}
            </p>
            <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '80px', alignItems: 'start' }}>
              <div>
                <h2
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 'clamp(28px, 3.6vw, 48px)',
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: '-0.015em',
                    margin: 0,
                    textWrap: 'balance',
                    color: '#0A0A0A',
                  }}
                >
                  {c.whyHeadingLines.map((line, i) => (
                    <span key={`${line}-${i}`}>
                      {line}
                      {i < c.whyHeadingLines.length - 1 && <br />}
                    </span>
                  ))}
                </h2>
              </div>
              <div>
                {c.whyParagraphs.map((p, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '17px',
                      lineHeight: 1.65,
                      color: 'rgba(0,0,0,0.78)',
                      margin: i === 0 ? '0' : '16px 0 0 0',
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>

            <div
              className="ff-why"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 0,
                marginTop: '40px',
                borderTop: '1px solid #000',
                borderLeft: '1px solid #000',
              }}
            >
              {c.whyItems.map((item) => (
                <div
                  key={item.num}
                  style={{
                    padding: '32px 28px',
                    borderRight: '1px solid #000',
                    borderBottom: '1px solid #000',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                      color: 'var(--accent-pink)',
                    }}
                  >
                    {item.num}
                  </span>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '20px',
                      lineHeight: 1.2,
                      color: '#0A0A0A',
                      fontWeight: 400,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.title}
                  </div>
                  <p
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'rgba(0,0,0,0.78)',
                      margin: 0,
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 06 · ROADMAP ====== */}
        <section
          id="roadmap"
          className="section-mobile"
          style={{ padding: '96px 40px', borderBottom: '1px solid rgba(255,255,255,0.30)' }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <SectionLabel>{c.roadmapLabel}</SectionLabel>
            <div className="ff-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '80px', alignItems: 'start' }}>
              <div>
                <Heading lines={c.roadmapHeadingLines} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '17px',
                    lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.85)',
                    margin: 0,
                  }}
                >
                  {c.roadmapLead}
                </p>
              </div>
            </div>

            <div
              className="ff-timeline"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 0,
                marginTop: '48px',
                position: 'relative',
              }}
            >
              <div
                className="ff-timeline-line"
                style={{
                  position: 'absolute',
                  top: '24px',
                  left: '24px',
                  right: '24px',
                  height: '1px',
                  background: 'rgba(255,255,255,0.30)',
                  zIndex: 0,
                }}
              />
              {c.roadmapSteps.map((step) => (
                <div
                  key={step.num}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '0 16px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '2px',
                      background: '#0A0A0A',
                      border: '1px solid var(--accent-pink)',
                      marginTop: '16px',
                      marginBottom: '8px',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        inset: '4px',
                        borderRadius: '2px',
                        background: 'var(--accent-pink)',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                      color: 'var(--accent-pink)',
                    }}
                  >
                    {step.num}
                  </span>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '17px',
                      color: '#F2F2F2',
                      fontWeight: 500,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {step.title}
                  </div>
                  <p
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '13px',
                      lineHeight: 1.55,
                      color: 'rgba(255,255,255,0.66)',
                      margin: 0,
                      maxWidth: '28ch',
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== CLOSING ====== */}
        <section
          style={{
            position: 'relative',
            padding: '120px 40px',
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(255,255,255,0.30)',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <HeadlineHalo />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1240px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: FONT_MONO,
                fontSize: 'clamp(28px, 3.6vw, 44px)',
                lineHeight: 1.15,
                fontWeight: 400,
                letterSpacing: '-0.015em',
                maxWidth: '22ch',
                margin: '0 auto',
                color: '#F2F2F2',
                textWrap: 'balance',
              }}
            >
              {c.closingLines.map((line, i) => (
                <span
                  key={`${line}-${i}`}
                  style={i === c.closingAccentIndex ? { color: 'var(--accent-pink)' } : undefined}
                >
                  {line}
                  {i < c.closingLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p
              style={{
                fontFamily: FONT_MONO,
                marginTop: '24px',
                color: 'rgba(255,255,255,0.66)',
                fontSize: '15px',
                lineHeight: 1.6,
                maxWidth: '60ch',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {c.closingSub}
            </p>
            <MagneticAnchor
              href={c.closingCta.href}
              style={{
                marginTop: '40px',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 22px',
                border: '1px solid var(--accent-pink)',
                borderRadius: '2px',
                color: 'var(--accent-pink)',
                fontFamily: FONT_MONO,
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              {c.closingCta.label}
            </MagneticAnchor>
          </div>
        </section>
      </main>
      <Footer />
      </PartnerGate>
    </>
  );
}
