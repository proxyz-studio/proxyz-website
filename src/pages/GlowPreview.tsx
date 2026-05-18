import Nav from '../components/Nav';

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";
const PINK = '#ff4193';
const MINT = '#5BC9B8';
const BUTTER = '#F2D78C';

function SampleSection({
  number,
  heading,
  body,
}: {
  number: string;
  heading: string;
  body: string;
}) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '760px',
        margin: '0 auto',
        padding: '0 40px',
      }}
    >
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PINK,
          margin: '0 0 22px 0',
        }}
      >
        {number} · SAMPLE SECTION
      </p>
      <h3
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(32px, 4.4vw, 56px)',
          fontWeight: 400,
          lineHeight: 0.98,
          letterSpacing: '-0.015em',
          textTransform: 'uppercase',
          margin: '0 0 28px 0',
          color: '#fff',
          textWrap: 'balance',
        }}
      >
        {heading}
      </h3>
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
        {body}
      </p>
    </div>
  );
}

function OptionFrame({
  letter,
  name,
  oneLiner,
  pitch,
  children,
}: {
  letter: string;
  name: string;
  oneLiner: string;
  pitch: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        borderTop: '1px solid rgba(255,255,255,0.18)',
        padding: '64px 0',
      }}
    >
      <div style={{ padding: '0 40px', maxWidth: '1240px', margin: '0 auto 32px auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '32px',
            alignItems: 'baseline',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PINK,
            }}
          >
            Option {letter}
          </span>
          <h2
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(28px, 3.4vw, 44px)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              margin: 0,
              color: '#fff',
            }}
          >
            {name}
          </h2>
        </div>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '13px',
            letterSpacing: '0.04em',
            color: 'rgba(255,255,255,0.55)',
            margin: '0 0 12px 0',
            maxWidth: '70ch',
          }}
        >
          {oneLiner}
        </p>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.8)',
            margin: '0 0 32px 0',
            maxWidth: '70ch',
          }}
        >
          {pitch}
        </p>
      </div>
      {children}
    </section>
  );
}

// ============ Option A — Corner atmosphere ============
function CornerAtmosphere() {
  return (
    <div
      style={{
        position: 'relative',
        background: '#000',
        padding: '120px 0',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-200px',
          right: '-200px',
          width: '700px',
          height: '700px',
          background: `radial-gradient(circle, ${PINK} 0%, transparent 60%)`,
          opacity: 0.18,
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />
      <SampleSection
        number="A"
        heading="A distant signal hanging in the corner."
        body="One soft pink radial gradient sits in the top-right of the section. Filtered with blur, low opacity. Static — no motion. Adds atmosphere without competing with the type."
      />
    </div>
  );
}

// ============ Option B — Top aurora ============
function TopAurora() {
  return (
    <div
      style={{
        position: 'relative',
        background: '#000',
        padding: '120px 0',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '320px',
          background: `linear-gradient(180deg, ${PINK}33 0%, ${MINT}11 35%, transparent 100%)`,
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />
      <SampleSection
        number="B"
        heading="A pink-to-mint band fading down from the top edge."
        body="Linear gradient from pink through mint to black across the top 320px of the section. Heavy blur so it reads as light, not paint. Sections feel like transmissions coming through."
      />
    </div>
  );
}

// ============ Option C — Headline halo ============
function HeadlineHalo() {
  return (
    <div
      style={{
        position: 'relative',
        background: '#000',
        padding: '120px 0',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '700px',
          height: '320px',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse, ${PINK} 0%, transparent 65%)`,
          opacity: 0.16,
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }}
      />
      <SampleSection
        number="C"
        heading="A backlit halo behind the heading."
        body="Single elliptical glow centered behind the H2. Quiet pink wash that makes the heading feel lit from within. Only fires on sections we want to emphasize — Build with, Padel Z hero, Booking."
      />
    </div>
  );
}

// ============ Option D — Animated mesh ============
function AnimatedMesh() {
  return (
    <div
      style={{
        position: 'relative',
        background: '#000',
        padding: '120px 0',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div
        aria-hidden
        className="glow-mesh-a"
        style={{
          position: 'absolute',
          top: '-150px',
          left: '10%',
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${PINK} 0%, transparent 60%)`,
          opacity: 0.15,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        className="glow-mesh-b"
        style={{
          position: 'absolute',
          bottom: '-200px',
          right: '5%',
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${MINT} 0%, transparent 60%)`,
          opacity: 0.10,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        className="glow-mesh-c"
        style={{
          position: 'absolute',
          top: '30%',
          right: '30%',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${BUTTER} 0%, transparent 60%)`,
          opacity: 0.07,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <SampleSection
        number="D"
        heading="Slow color mesh drifting across the section."
        body="Three soft blobs — pink, mint, butter — drift on slow loops between 22 and 28 seconds. Heavy blur so they read as ambient light, not shapes. Most premium feel. Respects reduced motion."
      />
    </div>
  );
}

// ============ Option E — Top edge line + fade ============
function EdgeLine() {
  return (
    <div
      style={{
        position: 'relative',
        background: '#000',
        padding: '120px 0',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${PINK} 20%, ${PINK} 80%, transparent 100%)`,
          pointerEvents: 'none',
          opacity: 0.85,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: `linear-gradient(180deg, ${PINK}22 0%, transparent 100%)`,
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }}
      />
      <SampleSection
        number="E"
        heading="A pink edge rule with a vertical glow fade."
        body="2px horizontal pink line at the top of the section, fading at the edges. A soft pink wash extends down 180px and dissolves. Most editorial — feels like a magazine masthead divider."
      />
    </div>
  );
}

export default function GlowPreview() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <div style={{ padding: '140px 40px 40px', maxWidth: '1240px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PINK,
              margin: '0 0 22px 0',
            }}
          >
            INTERNAL · BACKGROUND GLOW OPTIONS
          </p>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(40px, 5.6vw, 76px)',
              fontWeight: 400,
              lineHeight: 0.98,
              letterSpacing: '-0.015em',
              margin: '0 0 24px 0',
              color: 'transparent',
              textTransform: 'uppercase',
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
            Five ways to add
            <br />
            contrast and warmth
            <br />
            to the dark sections.
          </h1>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '15px',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 24px 0',
              maxWidth: '70ch',
            }}
          >
            Scroll. Each option below is a working sample of how a dark section
            could feel with a subtle glow applied. Pick the one you want and I'll
            roll it across the strategic dark sections — Hero left panel, Build
            with, Booking, Padel Z hero, Fast-Fix hero, Partners hero.
          </p>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '12px',
              letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.4)',
              margin: 0,
            }}
          >
            Page is unlinked and dev-only. The production site is untouched
            until you choose.
          </p>
        </div>

        <OptionFrame
          letter="A"
          name="Corner atmosphere"
          oneLiner="One static blur in the corner · pink only · zero motion"
          pitch="A single soft pink radial sitting in a corner. Distant, atmospheric, doesn't move. Lowest visual cost, highest reliability — looks intentional, never gimmicky."
        >
          <CornerAtmosphere />
        </OptionFrame>

        <OptionFrame
          letter="B"
          name="Top aurora"
          oneLiner="Pink → mint band fading down from the top edge"
          pitch="Linear gradient from pink through mint to transparent across the top of the section. Heavy blur. Sections feel like a signal coming in from above — fits the operator-studio brand DNA."
        >
          <TopAurora />
        </OptionFrame>

        <OptionFrame
          letter="C"
          name="Headline halo"
          oneLiner="Centered backlight behind the H2 · use sparingly"
          pitch="A single soft elliptical glow centered behind the heading. Subtle, focused, premium. Only deploy on the 2–3 most important headings on the site — Build with, Padel Z hero, Booking."
        >
          <HeadlineHalo />
        </OptionFrame>

        <OptionFrame
          letter="D"
          name="Animated mesh"
          oneLiner="Three drifting blobs · pink / mint / butter · 22-28s loops"
          pitch="Multiple soft color blobs slowly drifting across the section on long loops. Most premium, most expressive. Highest perceived production value — but uses all three brand accent colors, so use only on flagship sections."
        >
          <AnimatedMesh />
        </OptionFrame>

        <OptionFrame
          letter="E"
          name="Edge rule + fade"
          oneLiner="2px pink horizontal line · soft glow fade below"
          pitch="A bright pink hairline at the section's top edge, with a 180px pink wash that fades into black below. Reads as a magazine masthead divider. Strongest editorial fit."
        >
          <EdgeLine />
        </OptionFrame>

        <section
          style={{
            borderTop: '1px solid rgba(255,255,255,0.18)',
            padding: '96px 40px',
            marginTop: '64px',
          }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                margin: '0 0 32px 0',
                color: '#fff',
              }}
            >
              How to pick.
            </h2>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                maxWidth: '70ch',
              }}
            >
              {[
                { k: 'A', v: 'Want minimum risk. Most universally tasteful.' },
                {
                  k: 'B',
                  v: 'Want the site to feel like a transmission — most on-brand.',
                },
                {
                  k: 'C',
                  v: 'Want to dramatize a few key headings without changing the whole feel.',
                },
                {
                  k: 'D',
                  v: 'Want the highest-end premium feel — Linear, Vercel, Stripe Press.',
                },
                {
                  k: 'E',
                  v: 'Want the strongest editorial / magazine feel — section dividers as the visual story.',
                },
              ].map((row, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.85)',
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr',
                    gap: '20px',
                  }}
                >
                  <span style={{ color: PINK, fontWeight: 600 }}>{row.k}</span>
                  <span>{row.v}</span>
                </li>
              ))}
            </ul>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '13px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.55)',
                margin: '32px 0 0 0',
                maxWidth: '70ch',
              }}
            >
              My pick: <span style={{ color: MINT }}>A or B</span>. Both stay
              quiet and never compete with content. <span style={{ color: MINT }}>D</span> is the
              showstopper but I'd reserve it for one or two flagship sections
              (Hero left panel, Padel Z hero) rather than every dark section, so
              it doesn't become noise. Tell me which letter and where to apply.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
