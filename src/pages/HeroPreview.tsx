import Nav from '../components/Nav';

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";

const titleStyle: React.CSSProperties = {
  fontFamily: FONT_DISPLAY,
  fontSize: 'clamp(40px, 5.4vw, 76px)',
  fontWeight: 400,
  lineHeight: 0.96,
  color: 'transparent',
  textTransform: 'uppercase',
  margin: 0,
  letterSpacing: '0.015em',
  wordSpacing: '-0.45em',
  textWrap: 'balance' as React.CSSProperties['textWrap'],
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
};

const variants: {
  id: string;
  name: string;
  description: string;
  proxyClass?: string;
  proxyDataText?: boolean;
}[] = [
  {
    id: 'flicker',
    name: 'Signal-loss flicker',
    description:
      "Mostly stable. Every few seconds the word briefly drops opacity, blurs, and twitches sideways — like a satellite link losing lock and reacquiring. Quiet between events.",
    proxyClass: 'proxy-flicker',
  },
  {
    id: 'breathe',
    name: 'Soft breathe',
    description:
      'Continuous, slow. The word gently blurs and dims on a 3-second loop — feels like a signal being held, not broken. Most editorial of the bunch.',
    proxyClass: 'proxy-breathe',
  },
  {
    id: 'glitch',
    name: 'Glitch slice',
    description:
      'Mostly stable. Every ~5s the top and bottom halves of the word jolt in opposite directions for a fraction of a second. Pink top slice, white bottom — borrowed from the brand accent.',
    proxyClass: 'proxy-glitch',
    proxyDataText: true,
  },
  {
    id: 'chroma',
    name: 'Chromatic split',
    description:
      "Always on. A pink ghost left of the word and a teal ghost right, breathing slightly. Subtle CRT vibe. Most ambient — doesn't pull focus.",
    proxyClass: 'proxy-chroma',
    proxyDataText: true,
  },
  {
    id: 'static',
    name: 'Static noise wash',
    description:
      "Continuous fine grain. SVG turbulence overlaid on the word with screen-blend so it looks like analog interference. Reads as 'transmission in progress.'",
    proxyClass: 'proxy-static',
  },
];

function PreviewBlock({
  variant,
}: {
  variant: (typeof variants)[number];
}) {
  return (
    <article
      style={{
        borderTop: '1px solid rgba(255,255,255,0.18)',
        padding: '64px 0',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '32px',
          alignItems: 'baseline',
          marginBottom: '32px',
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent-pink)',
          }}
        >
          VARIANT · {variant.id}
        </span>
        <h2
          style={{
            fontFamily: FONT_MONO,
            fontSize: '22px',
            fontWeight: 500,
            margin: 0,
            color: '#fff',
            letterSpacing: '-0.005em',
          }}
        >
          {variant.name}
        </h2>
      </div>

      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--accent-pink)',
          margin: '0 0 22px 0',
        }}
      >
        ISSUE 01 / OPERATOR STUDIO
      </p>

      <h1 style={titleStyle}>
        Your{' '}
        <span
          className={variant.proxyClass}
          data-text={variant.proxyDataText ? 'PROXY' : undefined}
          style={{
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
          PROXY
        </span>
        <br />
        on the
        <br />
        inside.
      </h1>

      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '13px',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.66)',
          margin: '36px 0 0 0',
          maxWidth: '70ch',
        }}
      >
        {variant.description}
      </p>
    </article>
  );
}

export default function HeroPreview() {
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
              color: 'var(--accent-pink)',
              margin: '0 0 22px 0',
            }}
          >
            INTERNAL · HERO WORD EFFECTS
          </p>
          <h1
            style={{
              fontFamily: FONT_MONO,
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              margin: '0 0 18px 0',
              color: '#fff',
            }}
          >
            Five effects on the word PROXY.
          </h1>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '15px',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 24px 0',
              maxWidth: '64ch',
            }}
          >
            Scroll through the five variants below. Each renders the live hero
            title with a different effect applied to the word PROXY. Pick the
            one you want and tell me the variant id (e.g. <code style={{ color: '#F2D78C' }}>flicker</code>) — I'll wire
            it into the production homepage.
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
            This page is unlinked and dev-only. Production hero still uses the
            current scanline treatment until you choose.
          </p>

          <div style={{ marginTop: '56px' }}>
            {variants.map((v) => (
              <PreviewBlock key={v.id} variant={v} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
