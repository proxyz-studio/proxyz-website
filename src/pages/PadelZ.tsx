import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import MediaGate from '../components/MediaGate';
import Footer from '../sections/Footer';

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";
const MINT = '#5BC9B8';

function ScanlineHeading({
  lines,
  size = 'clamp(44px, 6.4vw, 96px)',
}: {
  lines: { text: string; accent?: boolean }[];
  size?: string;
}) {
  return (
    <h1
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: size,
        fontWeight: 400,
        lineHeight: 0.96,
        color: 'transparent',
        textTransform: 'uppercase',
        margin: 0,
        letterSpacing: '0.015em',
        wordSpacing: '-0.45em',
        textWrap: 'balance',
        background:
          'repeating-linear-gradient(' +
          'to bottom, ' +
          '#fff 0px, ' +
          '#fff 2px, ' +
          'transparent 2px, ' +
          'transparent 5px' +
          ')',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {lines.map((line, i) => (
        <span
          key={`${line.text}-${i}`}
          style={line.accent ? { color: MINT, WebkitTextFillColor: MINT } : undefined}
        >
          {line.text}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </h1>
  );
}

export default function PadelZ() {
  return (
    <>
      <Nav />
      <MediaGate slug="padel-z" projectName="Padel Z">
        <main style={{ background: '#000', color: '#fff' }}>
          {/* HERO */}
          <section
            className="section-mobile"
            style={{
              padding: '180px 40px 120px',
              borderBottom: '1px solid rgba(255,255,255,0.30)',
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
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
                  to="/media"
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    textDecoration: 'none',
                    marginRight: '12px',
                  }}
                >
                  ← Media
                </Link>
                ISSUE 04 / PADEL Z · FOUNDATION 2026
              </p>
              <ScanlineHeading
                lines={[
                  { text: 'Padel' },
                  { text: 'Z.', accent: true },
                ]}
              />
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '18px',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.7)',
                  margin: '32px 0 0 0',
                  maxWidth: '60ch',
                }}
              >
                Matchmaking and social platform for the Phuket Padel scene. Web
                first, mobile to follow. Phuket as the opening beat. Coverage
                of every club, every notable match, every player worth
                following. Expansion by city, not by feature.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  marginTop: '56px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    border: '1px solid rgba(255,255,255,0.30)',
                    borderRadius: '999px',
                    fontFamily: FONT_MONO,
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: MINT,
                    }}
                  />
                  Foundation · 2026
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '8px 14px',
                    border: '1px solid rgba(255,255,255,0.30)',
                    borderRadius: '999px',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  Phuket · Sport &amp; Community
                </span>
              </div>
            </div>
          </section>

          {/* 01 · THE BEAT */}
          <section
            className="section-mobile"
            style={{
              padding: '96px 40px',
              borderBottom: '1px solid rgba(255,255,255,0.30)',
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-pink)',
                  margin: '0 0 48px 0',
                }}
              >
                01 · THE BEAT
              </p>
              <div
                className="ff-two-col"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.4fr',
                  gap: '80px',
                  alignItems: 'start',
                }}
              >
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
                    }}
                  >
                    Cover the sport,
                    <br />
                    own the audience.
                  </h2>
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
                    Padel is the fastest-growing racquet sport in Southeast
                    Asia, and Phuket sits at the center of it. Clubs are
                    opening monthly. Players have nowhere to find matches,
                    track form, or follow the local scene.
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
                    Padel Z is the answer. Matchmaking, club coverage, player
                    profiles, league standings, all in one place. Free for
                    players, indispensable to clubs, owned by us.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 02 · THE PIPE (strategic role) */}
          <section
            className="section-mobile"
            style={{
              padding: '96px 40px',
              background: '#fff',
              color: '#000',
              borderBottom: '1px solid #000',
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-pink)',
                  margin: '0 0 48px 0',
                }}
              >
                02 · THE PIPE
              </p>
              <div
                className="ff-two-col"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.4fr',
                  gap: '80px',
                  alignItems: 'start',
                }}
              >
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
                      color: '#000',
                    }}
                  >
                    The audience rail
                    <br />
                    for every PROXYZ
                    <br />
                    Phuket operator.
                  </h2>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '17px',
                      lineHeight: 1.65,
                      color: 'rgba(0,0,0,0.78)',
                      margin: 0,
                    }}
                  >
                    Padel Z is more than a media property. It's the
                    distribution layer for every PROXYZ operating company in
                    Phuket. Active players are villa owners, expats with
                    discretionary spend, business owners who need real
                    services.
                  </p>
                  <p
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '17px',
                      lineHeight: 1.65,
                      color: 'rgba(0,0,0,0.78)',
                      margin: '16px 0 0 0',
                    }}
                  >
                    Today, Fast-Fix gets a launch audience day one. Tomorrow,
                    every new PROXYZ Phuket operator rides the same rail.
                    Owned audience, applied across the portfolio.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 03 · WHAT'S INSIDE */}
          <section
            className="section-mobile"
            style={{
              padding: '96px 40px',
              borderBottom: '1px solid rgba(255,255,255,0.30)',
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-pink)',
                  margin: '0 0 48px 0',
                }}
              >
                03 · WHAT'S INSIDE
              </p>
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
                {[
                  {
                    num: '01',
                    title: 'Matchmaking',
                    body:
                      'Skill-rated player profiles. Find an opponent at your level, at your club, on the right day.',
                  },
                  {
                    num: '02',
                    title: 'Club coverage',
                    body:
                      'Every Phuket padel club indexed. Court availability, pricing, league schedules, who plays where.',
                  },
                  {
                    num: '03',
                    title: 'Leagues & ladders',
                    body:
                      'Citywide ladder. Monthly leagues. Match history that follows the player, not the club.',
                  },
                  {
                    num: '04',
                    title: 'The Phuket Beat',
                    body:
                      'Editorial coverage of the local scene. Player profiles, club openings, tournament recaps.',
                  },
                  {
                    num: '05',
                    title: 'Member directory',
                    body:
                      'Profiles with location, club, rating, availability. The community contact sheet.',
                  },
                  {
                    num: '06',
                    title: 'Partner inventory',
                    body:
                      'The slot where PROXYZ-owned operators land in front of the audience. Fast-Fix first.',
                  },
                ].map((card, i) => {
                  const col = i % 3;
                  const row = Math.floor(i / 3);
                  const isLastRow = row === 1;
                  return (
                    <div
                      key={card.num}
                      style={{
                        padding: '36px 28px',
                        borderRight:
                          col === 2 ? 'none' : '1px solid rgba(255,255,255,0.30)',
                        borderBottom: isLastRow
                          ? 'none'
                          : '1px solid rgba(255,255,255,0.30)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: '11px',
                          letterSpacing: '0.18em',
                          color: MINT,
                        }}
                      >
                        {card.num}
                      </span>
                      <h3
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: '20px',
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                          textTransform: 'uppercase',
                          margin: '14px 0 14px 0',
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: '13px',
                          lineHeight: 1.6,
                          color: 'rgba(255,255,255,0.7)',
                          margin: 0,
                        }}
                      >
                        {card.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 04 · ROADMAP */}
          <section
            className="section-mobile"
            style={{
              padding: '96px 40px',
              borderBottom: '1px solid rgba(255,255,255,0.30)',
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-pink)',
                  margin: '0 0 48px 0',
                }}
              >
                04 · ROADMAP
              </p>
              <div
                className="ff-two-col"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.4fr',
                  gap: '80px',
                  alignItems: 'start',
                }}
              >
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
                    }}
                  >
                    One city,
                    <br />
                    one beat,
                    <br />
                    one community.
                  </h2>
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
                    Phuket goes deep before Padel Z goes wide. Every club
                    onboarded, every active player indexed, every match worth
                    covering covered. When the platform is essential in
                    Phuket, the next city earns the rollout.
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
                    Expansion by city, not by feature. Bangkok, Chiang Mai,
                    Pattaya. Then Bali, KL, Singapore.
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
                {[
                  {
                    num: '01 · Q2 2026',
                    title: 'Web app live',
                    body:
                      'Matchmaking, club directory, player profiles. Phuket clubs onboarded.',
                  },
                  {
                    num: '02 · Q3 2026',
                    title: 'Phuket Beat',
                    body:
                      'Editorial channel launches. Tim Chang covering the local scene.',
                  },
                  {
                    num: '03 · Q4 2026',
                    title: 'Mobile + Fast-Fix slot',
                    body:
                      'iOS / Android. First PROXYZ partner operator appears in the partner inventory.',
                  },
                  {
                    num: '04 · 2027',
                    title: 'City 2',
                    body:
                      'Same playbook, next city. Bangkok or Bali based on signal.',
                  },
                ].map((step) => (
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
                        borderRadius: '999px',
                        background: '#000',
                        border: `1px solid ${MINT}`,
                        marginTop: '16px',
                        marginBottom: '8px',
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          inset: '4px',
                          borderRadius: '999px',
                          background: MINT,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '11px',
                        letterSpacing: '0.18em',
                        color: MINT,
                      }}
                    >
                      {step.num}
                    </span>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '17px',
                        color: '#fff',
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

          {/* CLOSING */}
          <section
            style={{
              padding: '120px 40px',
              background: '#0a0a0a',
              borderBottom: '1px solid rgba(255,255,255,0.30)',
              textAlign: 'center',
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
              <h2
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 'clamp(28px, 3.6vw, 44px)',
                  lineHeight: 1.15,
                  fontWeight: 400,
                  letterSpacing: '-0.015em',
                  maxWidth: '22ch',
                  margin: '0 auto',
                  color: '#fff',
                  textWrap: 'balance',
                }}
              >
                Build the audience.
                <br />
                Own the <span style={{ color: MINT }}>Z</span>.
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
                Padel Z is the first beat in a PROXYZ media studio designed
                to compound across every operator we own in Phuket and
                beyond.
              </p>
              <a
                href="mailto:hello@proxyz.studio?subject=Padel%20Z"
                style={{
                  marginTop: '40px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 22px',
                  border: `1px solid ${MINT}`,
                  borderRadius: '999px',
                  color: MINT,
                  fontFamily: FONT_MONO,
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 220ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = MINT;
                  (e.currentTarget as HTMLElement).style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = MINT;
                }}
              >
                Talk to us → hello@proxyz.studio
              </a>
            </div>
          </section>
        </main>
        <Footer />
      </MediaGate>
    </>
  );
}
