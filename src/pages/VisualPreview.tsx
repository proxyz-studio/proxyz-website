import { useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav';

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";
const PINK = '#ff4193';
const MINT = '#5BC9B8';
const BUTTER = '#F2D78C';

// ============ Reusable bits ============

function DirectionFrame({
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
        padding: '96px 0',
      }}
    >
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
          Direction {letter}
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
          margin: '0 0 56px 0',
          maxWidth: '70ch',
        }}
      >
        {pitch}
      </p>
      {children}
    </section>
  );
}

// ============ Direction A — Choreographed ============

function ChoreographedDemo() {
  const [seed, setSeed] = useState(0);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => setSeed((s) => s + 1)}
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#fff',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.30)',
            borderRadius: '999px',
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'border-color 180ms, color 180ms',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = PINK;
            (e.currentTarget as HTMLElement).style.color = PINK;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.30)';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
        >
          ↻ Replay
        </button>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          stagger 60ms · 320ms ease
        </span>
      </div>

      <div
        key={seed}
        className="pvz-reveal"
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          rowGap: '6px',
          columnGap: '32px',
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: PINK,
          }}
        >
          04 / BUILD FOR
        </span>
        <span />
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: '#fff',
            letterSpacing: '-0.015em',
            lineHeight: 1.0,
            textTransform: 'uppercase',
          }}
        >
          The Audit.
        </span>
        <span />
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: '#fff',
            letterSpacing: '-0.015em',
            lineHeight: 1.0,
            textTransform: 'uppercase',
          }}
        >
          The Blueprint.
        </span>
        <span />
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: '#fff',
            letterSpacing: '-0.015em',
            lineHeight: 1.0,
            textTransform: 'uppercase',
          }}
        >
          The Install.
        </span>
        <span />
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.7)',
            margin: '24px 0 0 0',
            maxWidth: '60ch',
          }}
        >
          On scroll, each line rises 28px into place over 320ms with a
          60ms stagger. Section labels enter first, then headings, then
          body. Triggered by IntersectionObserver, not GSAP, to keep the
          bundle small.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginTop: '48px',
        }}
      >
        {[
          { value: '120+', label: 'meetings reviewed' },
          { value: '4', label: 'active partner co-builds' },
          { value: '60min', label: 'to your one-page memo' },
        ].map((m, i) => (
          <div
            key={i}
            className="pvz-count"
            style={{
              animationDelay: `${i * 80}ms`,
              borderTop: '1px solid rgba(255,255,255,0.18)',
              paddingTop: '20px',
            }}
          >
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(40px, 5vw, 60px)',
                color: '#fff',
                letterSpacing: '-0.015em',
                lineHeight: 1.0,
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '8px',
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Direction B — Pictogram ============

function StrokeIcon({ children, size = 56 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      className="pvz-icon"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function PictogramDemo() {
  const icons = [
    {
      label: 'The Audit',
      sub: '60 minutes',
      svg: (
        <>
          <circle cx="20" cy="20" r="11" />
          <line x1="28" y1="28" x2="40" y2="40" />
          <line x1="14" y1="20" x2="26" y2="20" />
          <line x1="20" y1="14" x2="20" y2="26" />
        </>
      ),
    },
    {
      label: 'The Blueprint',
      sub: '90 days',
      svg: (
        <>
          <rect x="6" y="6" width="36" height="36" />
          <line x1="6" y1="18" x2="42" y2="18" />
          <line x1="6" y1="30" x2="42" y2="30" />
          <line x1="18" y1="6" x2="18" y2="42" />
          <line x1="30" y1="6" x2="30" y2="42" />
        </>
      ),
    },
    {
      label: 'The Install',
      sub: '90 to 120 days',
      svg: (
        <>
          <rect x="6" y="14" width="36" height="20" />
          <line x1="6" y1="22" x2="42" y2="22" />
          <line x1="6" y1="26" x2="42" y2="26" />
          <circle cx="12" cy="18" r="1" fill="#fff" stroke="none" />
          <circle cx="12" cy="30" r="1" fill="#fff" stroke="none" />
        </>
      ),
    },
    {
      label: 'The Partnership',
      sub: 'monthly retainer',
      svg: (
        <>
          <circle cx="16" cy="24" r="8" />
          <circle cx="32" cy="24" r="8" />
          <line x1="20" y1="24" x2="28" y2="24" />
        </>
      ),
    },
    {
      label: 'Studio OS',
      sub: 'the engine',
      svg: (
        <>
          <circle cx="24" cy="24" r="6" />
          <circle cx="24" cy="24" r="14" />
          <line x1="24" y1="4" x2="24" y2="10" />
          <line x1="24" y1="38" x2="24" y2="44" />
          <line x1="4" y1="24" x2="10" y2="24" />
          <line x1="38" y1="24" x2="44" y2="24" />
        </>
      ),
    },
    {
      label: 'The Portal',
      sub: 'workspace',
      svg: (
        <>
          <polyline points="6,6 6,42 42,42" />
          <line x1="14" y1="34" x2="14" y2="24" />
          <line x1="22" y1="34" x2="22" y2="18" />
          <line x1="30" y1="34" x2="30" y2="12" />
          <line x1="38" y1="34" x2="38" y2="20" />
        </>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid rgba(255,255,255,0.18)',
          borderLeft: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        {icons.map((it, i) => (
          <div
            key={i}
            style={{
              padding: '36px 28px',
              borderRight: '1px solid rgba(255,255,255,0.18)',
              borderBottom: '1px solid rgba(255,255,255,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '20px',
            }}
          >
            <StrokeIcon>{it.svg}</StrokeIcon>
            <div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: '#fff',
                }}
              >
                {it.label}
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: PINK,
                  marginTop: '4px',
                }}
              >
                {it.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.55)',
          margin: '24px 0 0 0',
          maxWidth: '70ch',
        }}
      >
        Six custom SVG pictograms. 1.5px stroke, square caps, miter joins,
        48×48 viewBox. Hover any tile to see the stroke draw-on. One icon
        family, one stroke weight, one corner style across every section.
      </p>
    </div>
  );
}

// ============ Direction C — Editorial ============

function EditorialDemo() {
  return (
    <article
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(80px, 140px) 1fr',
        gap: '32px',
        background: 'rgba(255,255,255,0.02)',
        padding: '64px 48px',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div
        className="pvz-marginalia"
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(80px, 12vw, 160px)',
          lineHeight: 0.85,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.85)',
          fontWeight: 400,
          letterSpacing: '-0.02em',
        }}
      >
        04
      </div>

      <div>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PINK,
            margin: '0 0 16px 0',
          }}
        >
          Build for · Services
        </p>
        <h3
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(36px, 4.4vw, 56px)',
            fontWeight: 400,
            lineHeight: 1.02,
            letterSpacing: '-0.015em',
            margin: '0 0 28px 0',
            color: '#fff',
            textTransform: 'uppercase',
          }}
        >
          We come in, install systems, automate the work, and stay long term.
        </h3>

        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '16px',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.85)',
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          <span
            style={{
              float: 'left',
              fontFamily: FONT_DISPLAY,
              fontSize: '76px',
              lineHeight: 0.85,
              color: PINK,
              padding: '4px 12px 0 0',
              marginTop: '-4px',
            }}
          >
            T
          </span>
          he Audit is sixty minutes. The Blueprint is ninety days. The
          Install is ninety to one hundred and twenty days. The
          Partnership is forever, or until you don't need us anymore.
          Every engagement begins with a one-page memo and ends with a
          system that runs without the founder in every meeting.
        </p>

        <blockquote
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(20px, 2vw, 26px)',
            lineHeight: 1.35,
            color: '#fff',
            margin: '40px 0',
            paddingLeft: '24px',
            borderLeft: `2px solid ${PINK}`,
            fontStyle: 'italic',
            maxWidth: '50ch',
          }}
        >
          <span style={{ color: PINK, marginRight: '8px' }}>"</span>
          The system runs the company. Not the founder.
          <span style={{ color: PINK, marginLeft: '8px' }}>"</span>
        </blockquote>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {[
            { k: 'Issue', v: '01' },
            { k: 'Section', v: '04 / 11' },
            { k: 'Date', v: 'May 2026' },
          ].map((m, i) => (
            <div key={i}>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: '4px',
                }}
              >
                {m.k}
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '13px',
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {m.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

// ============ Direction D — Spatial ============

function TiltCard() {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateZ(0)`;
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  }
  return (
    <div
      ref={ref}
      className="pvz-tilt"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.18)',
        padding: '32px',
        cursor: 'crosshair',
      }}
    >
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PINK,
          margin: '0 0 16px 0',
        }}
      >
        05 / Build with
      </p>
      <h4
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(28px, 3.4vw, 40px)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.015em',
          margin: '0 0 16px 0',
          color: '#fff',
          textTransform: 'uppercase',
        }}
      >
        The Venture Arm.
      </h4>
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '13px',
          lineHeight: 1.65,
          color: 'rgba(255,255,255,0.75)',
          margin: 0,
        }}
      >
        Move your cursor across this card. It tilts toward you — up to
        6deg X, 8deg Y. Restores on leave. 240ms ease, no jank.
      </p>
    </div>
  );
}

function MagneticButton({ label }: { label: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `translate(${x * 12}px, ${y * 8}px)`;
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0, 0)';
  }
  return (
    <a
      ref={ref}
      href="#"
      className="pvz-magnetic"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={(e) => e.preventDefault()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 26px',
        background: BUTTER,
        color: '#000',
        fontFamily: FONT_MONO,
        fontSize: '12px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        borderRadius: '999px',
        cursor: 'pointer',
      }}
    >
      {label} →
    </a>
  );
}

function SpotlightCard() {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--pvz-x', `${x}%`);
    el.style.setProperty('--pvz-y', `${y}%`);
  }
  return (
    <div
      ref={ref}
      className="pvz-spotlight"
      onMouseMove={onMove}
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.18)',
        padding: '40px 32px',
        minHeight: '220px',
      }}
    >
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PINK,
          margin: '0 0 16px 0',
        }}
      >
        Hover anywhere in this card
      </p>
      <h4
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(28px, 3.4vw, 40px)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.015em',
          margin: '0 0 16px 0',
          color: '#fff',
          textTransform: 'uppercase',
        }}
      >
        Pink spotlight.
      </h4>
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '13px',
          lineHeight: 1.65,
          color: 'rgba(255,255,255,0.75)',
          margin: 0,
        }}
      >
        A soft 320px radial gradient follows your cursor, screen-blended
        against the card. Pure CSS — no JS frame loop. Add to hero,
        service cards, and partner entries for a quiet "alive" feel.
      </p>
    </div>
  );
}

function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      setActive(inside);
      if (inside) {
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }
    el.addEventListener('mousemove', onMove as unknown as EventListener);
    el.addEventListener('mouseleave', () => setActive(false));
    return () => {
      el.removeEventListener('mousemove', onMove as unknown as EventListener);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.18)',
        padding: '48px 32px',
        minHeight: '180px',
        cursor: active ? 'none' : 'auto',
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PINK,
          margin: '0 0 12px 0',
        }}
      >
        Hover this card
      </p>
      <h4
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(28px, 3.4vw, 40px)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.015em',
          margin: '0 0 12px 0',
          color: '#fff',
          textTransform: 'uppercase',
        }}
      >
        Custom cursor.
      </h4>
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '13px',
          lineHeight: 1.65,
          color: 'rgba(255,255,255,0.75)',
          margin: 0,
          maxWidth: '50ch',
        }}
      >
        Pink dot follows your pointer inside this card. Could expand to
        "→ READ" on links, "+ EXPAND" on cards, "× CLOSE" on overlays.
      </p>
      {active && (
        <div
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            width: '14px',
            height: '14px',
            marginLeft: '-7px',
            marginTop: '-7px',
            borderRadius: '50%',
            background: PINK,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            transition: 'transform 120ms ease-out',
          }}
        />
      )}
    </div>
  );
}

function SpatialDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
        }}
        className="pvz-spatial-row"
      >
        <TiltCard />
        <SpotlightCard />
      </div>
      <CustomCursor />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          flexWrap: 'wrap',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.18)',
          background: '#0a0a0a',
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          Magnetic CTA →
        </span>
        <MagneticButton label="Book the Audit" />
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.04em',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          The button drifts up to 12px toward your cursor.
        </span>
      </div>
    </div>
  );
}

// ============ Page ============

export default function VisualPreview() {
  return (
    <>
      <Nav />
      <main
        style={{
          background: '#000',
          color: '#fff',
          padding: '140px 40px 120px',
          minHeight: '100vh',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
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
            INTERNAL · VISUAL DIRECTIONS
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
            Four ways to make
            <br />
            the site feel alive.
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
            Scroll. Each direction is a working sketch you can interact
            with, not a screenshot. Pick one as the lead direction and
            we'll bake it across the homepage, /portal, /partners, and
            /media. They're not mutually exclusive — most strong sites
            blend two — but committing to a lead direction first keeps
            the visual story coherent.
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
            Page is unlinked and dev-only. Production hero glitch
            remains untouched until you choose. Animations respect
            prefers-reduced-motion.
          </p>

          <DirectionFrame
            letter="A"
            name="Choreographed"
            oneLiner="GSAP-grade scroll motion · without GSAP · ~3 KB"
            pitch="Every section enters on scroll. Section labels first, headings next, body last — 60ms stagger, 320ms ease-out, 28px rise. Numbers count up. Buttons get a subtle scale-on-press. The whole site stops feeling static. Most editorial of the four — adds rhythm without volume."
          >
            <ChoreographedDemo />
          </DirectionFrame>

          <DirectionFrame
            letter="B"
            name="Pictogram"
            oneLiner="Custom monoline icon family · 1.5px stroke · 48px viewBox · one style"
            pitch="A complete icon system designed around your typography. Sharp corners, square caps, identical stroke weight across every glyph. Hover triggers a stroke draw-on so they feel alive on first interaction. Highest visual impact — breaks up the text-heavy sections and makes the services instantly scannable."
          >
            <PictogramDemo />
          </DirectionFrame>

          <DirectionFrame
            letter="C"
            name="Editorial"
            oneLiner="Magazine-grade typography · marginal numbering · pull quotes · drop caps"
            pitch="Lean harder into what already works. Massive marginalia numbers in the gutter (outlined Fragment Mono). Drop caps in pink at the start of long paragraphs. Pull quotes with pink quotation marks and a left rule. Issue/section/date footers on every spread. Lowest risk — strengthens the existing editorial identity without changing the technology stack."
          >
            <EditorialDemo />
          </DirectionFrame>

          <DirectionFrame
            letter="D"
            name="Spatial"
            oneLiner="Cursor-aware · tilt-on-mouse · magnetic CTAs · spotlight glow"
            pitch="Every interactive element responds to the cursor. Cards tilt in 3D toward where you're pointing. CTAs drift slightly toward your cursor (magnetic). A soft pink spotlight glows under your pointer on key surfaces. Custom cursor swaps to readable cues on hover. Highest perceived production value — the site feels like a product, not a brochure."
          >
            <SpatialDemo />
          </DirectionFrame>

          <section
            style={{
              borderTop: '1px solid rgba(255,255,255,0.18)',
              padding: '96px 0 0 0',
              marginTop: '64px',
            }}
          >
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
                {
                  k: 'A',
                  v: 'Want the site to "wake up" on scroll without adding new visual elements.',
                },
                {
                  k: 'B',
                  v: 'Want to break up the text-heavy sections and make services scannable at a glance.',
                },
                {
                  k: 'C',
                  v: 'Want to push deeper into the editorial DNA you already chose — magazine spreads, not landing pages.',
                },
                {
                  k: 'D',
                  v: 'Want premium perceived quality — the site should feel like Linear, Vercel, or Stripe Press.',
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
              My recommendation: <span style={{ color: MINT }}>A + B</span> as
              the primary stack. Choreographed gives rhythm site-wide;
              Pictogram adds the visual language to break up text. Both layer
              cleanly on the existing design. C is a safe fallback; D is the
              most premium but the highest implementation cost. Tell me which
              letter (or combination) and I'll bake it into the production
              pages.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
