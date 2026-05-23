/* /preview/lazy-tiger-styles — four brand-direction previews.
 *
 * Built after Cathal's call surfaced the new audience hypothesis:
 * ~75% women + gay men. Each direction restyles the hero with a different
 * visual language while keeping the helmet + copy intact. Tew picks one
 * (or mixes) and we apply it across the full /partners/lazy-tiger page.
 */

import { Link } from 'react-router-dom';
import TigerHelmet, { type TigerHelmetTheme } from '../components/lt/TigerHelmet';

interface StyleDirection {
  letter: 'D1' | 'D2' | 'D3' | 'D4';
  name: string;
  mood: string;
  audienceNote: string;
  bg: string;
  textColor: string;
  mutedColor: string;
  accent: string;
  highlight: string;
  displayFont: string;
  bodyFont: string;
  displayWeight: number;
  displayItalic?: boolean;
  displayUppercase?: boolean;
  letterSpacing: string;
  helmet: TigerHelmetTheme;
  /** Single-token "vibe word" displayed under the helmet */
  vibe: string;
  /** Reference cues (anti-spec, just informational) */
  references: string[];
  /** Optional CSS for background — overlays a gradient or noise */
  bgOverlay?: string;
  /** Optional CSS background for the H1 (used for gradient text fill) */
  headlineFill?: string;
  /** Optional accent for the vibe word */
  vibeAccent?: string;
}

/* All four variations stay inside the Liquid Pop family: hot pink + electric
   lime + chrome on near-black. They differ on which color leads, how the
   helmet body is treated, and whether the headline takes a gradient fill. */

const PINK = '#FF3B8A';
const LIME = '#D2FF3B';
const PINK_SOFT = '#FFB8D4';
const LIME_SOFT = '#E8FF8A';

const DIRECTIONS: StyleDirection[] = [
  {
    letter: 'D1',
    name: 'Bubblegum Chrome',
    mood: 'Pink-dominant. Chrome helmet. Lime is the single pop.',
    audienceNote:
      'Premium femme. SKIMS pop-up store reading. Hot pink does the heavy lifting; chrome holds the brand. Lime is reserved for the cursor + the vibe word — used once, used loud.',
    bg: '#0A0A0A',
    textColor: '#FFFFFF',
    mutedColor: '#A8A8AE',
    accent: PINK,
    highlight: LIME,
    displayFont: "'Cinzel', serif",
    bodyFont: "'IBM Plex Mono', monospace",
    displayWeight: 700,
    displayItalic: true,
    letterSpacing: '0.015em',
    helmet: {
      body: 'chrome',
      stripe: PINK,
      stripeHighlight: PINK_SOFT,
      rimLeft: PINK,
      rimRight: PINK,
    },
    vibe: 'bubblegum',
    vibeAccent: LIME,
    references: ['SKIMS', 'Mugler 2024 glossy', 'Charli XCX "Brat" cover', 'Diesel SS24'],
    bgOverlay:
      'radial-gradient(ellipse at 50% 30%, rgba(255,59,138,0.22) 0%, transparent 60%)',
  },
  {
    letter: 'D2',
    name: 'Acid Lime',
    mood: 'Lime leads. Pink is the energy partner — present, not loud.',
    audienceNote:
      'Underground-club reading with a femme charge. Lime owns the helmet and the headline; pink answers from the right side, lives inside the stripe glow, and washes the background. Queer-club, FKA Twigs, late-night Berghain — with a kiss of Mugler.',
    bg: '#080808',
    textColor: '#FFFFFF',
    mutedColor: '#9CA38C',
    accent: LIME,
    highlight: PINK,
    displayFont: "'Cinzel', serif",
    bodyFont: "'IBM Plex Mono', monospace",
    displayWeight: 700,
    displayItalic: true,
    letterSpacing: '0.015em',
    helmet: {
      body: 'chrome',
      stripe: LIME,
      stripeHighlight: PINK_SOFT,
      rimLeft: LIME,
      rimRight: PINK,
    },
    vibe: 'acid',
    vibeAccent: PINK,
    references: ['FKA Twigs visuals', 'Berghain print', 'Mugler couture', 'Arca', 'Y3 SS22'],
    bgOverlay:
      'radial-gradient(ellipse at 30% 35%, rgba(210,255,59,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 65%, rgba(255,59,138,0.18) 0%, transparent 55%)',
  },
  {
    letter: 'D3',
    name: 'Heat',
    mood: 'Pink + lime gradient blend. Both colors at full volume.',
    audienceNote:
      'Brat cover energy. Pink and lime fight for dominance and the result is heat. Most "energy in motion" of the four — strongest read for a brand that wants to be screenshotted and reposted.',
    bg: '#0A0A0A',
    textColor: '#FFFFFF',
    mutedColor: '#B0A8B0',
    accent: PINK,
    highlight: LIME,
    displayFont: "'Cinzel', serif",
    bodyFont: "'IBM Plex Mono', monospace",
    displayWeight: 700,
    displayItalic: true,
    letterSpacing: '0.015em',
    helmet: {
      body: 'chrome',
      stripe: PINK,
      stripeHighlight: LIME_SOFT,
      rimLeft: PINK,
      rimRight: LIME,
    },
    vibe: 'heat',
    vibeAccent: LIME,
    references: ['Charli XCX "Brat"', 'Mugler 2024 plasma', 'Pat McGrath gloss', 'Diesel cyber'],
    bgOverlay:
      'radial-gradient(ellipse at 15% 30%, rgba(255,59,138,0.26) 0%, transparent 55%), radial-gradient(ellipse at 85% 70%, rgba(210,255,59,0.20) 0%, transparent 55%)',
    headlineFill:
      'linear-gradient(110deg, #FF3B8A 0%, #FF3B8A 30%, #FF7AB5 50%, #D2FF3B 75%, #D2FF3B 100%)',
  },
  {
    letter: 'D4',
    name: 'Bubble Bath',
    mood: 'Pink-bodied helmet. Lime stripes contrast. Glossy inflated luxe.',
    audienceNote:
      'Most divergent from the other three. The helmet itself goes pink — chrome moves to the supporting cast. Lime cuts through as the linework. Reads Mugler couture, Y2K-revival, fashion-week back row.',
    bg: '#0A0A0A',
    textColor: '#FFFFFF',
    mutedColor: '#C9A8B8',
    accent: PINK,
    highlight: LIME,
    displayFont: "'Cinzel', serif",
    bodyFont: "'IBM Plex Mono', monospace",
    displayWeight: 700,
    displayItalic: true,
    letterSpacing: '0.015em',
    helmet: {
      body: 'bubble',
      stripe: LIME,
      stripeHighlight: LIME_SOFT,
      rimLeft: PINK,
      rimRight: PINK,
    },
    vibe: 'gloss',
    vibeAccent: LIME,
    references: ['Mugler couture 2024', 'Y2K mall pop', 'Heaven by Marc Jacobs', 'GCDS'],
    bgOverlay:
      'radial-gradient(ellipse at 50% 40%, rgba(255,59,138,0.30) 0%, transparent 60%)',
  },
];

const HERO_EYEBROW = 'PROXYZ × LAZY TIGER';
const HERO_TITLE_LINES = ['Operating-system install', 'for the gamified cardio category.'];
const HERO_SUBLINE = 'Build-with engagement. Active preview.';

function PreviewBlock({ d }: { d: StyleDirection }) {
  const isLight = d.bg.startsWith('#F') || d.bg === '#FFFFFF';
  const labelStyle: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: d.mutedColor,
    margin: 0,
  };
  return (
    <section
      id={`direction-${d.letter.toLowerCase()}`}
      style={{
        position: 'relative',
        background: d.bg,
        color: d.textColor,
        minHeight: '100vh',
        padding: '120px 40px 80px',
        borderBottom: isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      {d.bgOverlay && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: d.bgOverlay,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Direction badge — corner anchor */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          maxWidth: '1280px',
          margin: '0 auto 60px',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <p style={labelStyle}>Direction {d.letter}</p>
          <h2
            style={{
              fontFamily: d.displayFont,
              fontWeight: d.displayWeight,
              fontStyle: d.displayItalic ? 'italic' : 'normal',
              fontSize: 'clamp(28px, 3vw, 44px)',
              letterSpacing: d.letterSpacing,
              margin: '8px 0 0 0',
              color: d.textColor,
              textTransform: d.displayUppercase ? 'uppercase' : 'none',
            }}
          >
            {d.name}
          </h2>
        </div>
        <div style={{ textAlign: 'right', maxWidth: '40ch' }}>
          <p
            style={{
              fontFamily: d.bodyFont,
              fontSize: '13px',
              lineHeight: 1.5,
              color: d.mutedColor,
              margin: 0,
            }}
          >
            {d.mood}
          </p>
        </div>
      </div>

      {/* Hero centerpiece */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: d.bodyFont,
            fontSize: '11px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: d.mutedColor,
            margin: '0 0 40px 0',
          }}
        >
          {HERO_EYEBROW}
        </p>

        <div style={{ margin: '0 auto 48px', maxWidth: '440px' }}>
          <TigerHelmet size={440} theme={d.helmet} />
        </div>

        <h1
          style={{
            fontFamily: d.displayFont,
            fontWeight: d.displayWeight,
            fontStyle: d.displayItalic ? 'italic' : 'normal',
            fontSize: 'clamp(32px, 5vw, 72px)',
            lineHeight: 1.06,
            letterSpacing: d.letterSpacing,
            margin: 0,
            color: d.textColor,
            textWrap: 'balance',
            textTransform: d.displayUppercase ? 'uppercase' : 'none',
            ...(d.headlineFill
              ? {
                  background: d.headlineFill,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }
              : null),
          }}
        >
          {HERO_TITLE_LINES.map((line, i) => (
            <span key={i} style={{ display: 'block' }}>
              {line}
            </span>
          ))}
        </h1>

        <p
          style={{
            fontFamily: d.bodyFont,
            fontSize: '14px',
            letterSpacing: '0.04em',
            color: isLight ? d.mutedColor : 'rgba(255,255,255,0.7)',
            marginTop: '32px',
            marginBottom: 0,
          }}
        >
          {HERO_SUBLINE}
          <span
            style={{
              display: 'inline-block',
              width: '0.6ch',
              height: '1em',
              background: d.accent,
              verticalAlign: 'text-bottom',
              marginLeft: '4px',
              animation: 'lt-cursor-blink 1s steps(2) infinite',
            }}
          />
        </p>

        <p
          style={{
            fontFamily: d.displayFont,
            fontStyle: d.displayItalic ? 'italic' : 'normal',
            fontSize: '13px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: d.vibeAccent || d.accent,
            marginTop: '36px',
          }}
        >
          {d.vibe}
        </p>
      </div>

      {/* Token footer — palette, fonts, references */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1280px',
          margin: '80px auto 0',
          padding: '32px 0',
          borderTop: isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.12)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr 1.5fr',
          gap: '48px',
          alignItems: 'start',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
        }}
        className="lt-style-tokens"
      >
        {/* Palette */}
        <div>
          <p style={labelStyle}>Palette</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            {[d.bg, d.textColor, d.accent, d.highlight, d.mutedColor].map((c) => (
              <div
                key={c}
                title={c}
                style={{
                  width: '36px',
                  height: '36px',
                  background: c,
                  border: isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '4px',
                }}
              />
            ))}
          </div>
          <p
            style={{
              marginTop: '14px',
              fontSize: '11px',
              color: d.mutedColor,
              lineHeight: 1.5,
            }}
          >
            bg · text · accent · highlight · muted
          </p>
        </div>

        {/* Fonts */}
        <div>
          <p style={labelStyle}>Display</p>
          <p
            style={{
              fontFamily: d.displayFont,
              fontStyle: d.displayItalic ? 'italic' : 'normal',
              fontWeight: d.displayWeight,
              fontSize: '20px',
              color: d.textColor,
              margin: '10px 0 4px 0',
              letterSpacing: d.letterSpacing,
            }}
          >
            Aa Bb 01
          </p>
          <p style={{ color: d.mutedColor, fontSize: '11px', margin: 0 }}>
            {d.displayFont.replace(/'/g, '').split(',')[0]}
          </p>
        </div>

        <div>
          <p style={labelStyle}>Body</p>
          <p
            style={{
              fontFamily: d.bodyFont,
              fontSize: '14px',
              color: d.textColor,
              margin: '10px 0 4px 0',
            }}
          >
            Aa Bb 01
          </p>
          <p style={{ color: d.mutedColor, fontSize: '11px', margin: 0 }}>
            {d.bodyFont.replace(/'/g, '').split(',')[0]}
          </p>
        </div>

        {/* Audience + refs */}
        <div>
          <p style={labelStyle}>Audience read</p>
          <p
            style={{
              fontFamily: d.bodyFont,
              fontSize: '13px',
              lineHeight: 1.55,
              color: isLight ? d.mutedColor : 'rgba(255,255,255,0.75)',
              margin: '10px 0 14px 0',
            }}
          >
            {d.audienceNote}
          </p>
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: d.mutedColor,
              margin: 0,
            }}
          >
            Cues: {d.references.join(' · ')}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function LazyTigerStyles() {
  return (
    <main style={{ background: '#000', color: '#fff', overflow: 'hidden' }}>
      {/* Sticky chooser bar */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          gap: '8px',
          padding: '8px',
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '999px',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
        className="lt-chooser"
      >
        <Link
          to="/pipeline/lazy-tiger"
          style={{
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none',
            padding: '8px 14px',
            borderRadius: '999px',
          }}
        >
          ← Live page
        </Link>
        {DIRECTIONS.map((d) => (
          <a
            key={d.letter}
            href={`#direction-${d.letter.toLowerCase()}`}
            style={{
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#fff',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'transparent',
              transition: 'background 200ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
            }}
          >
            {d.letter}
          </a>
        ))}
      </div>

      {/* Intro */}
      <section
        style={{
          padding: '140px 40px 80px',
          background: '#000',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            margin: '0 0 28px 0',
          }}
        >
          Liquid Pop · Sub-variations · Internal review
        </p>
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 'clamp(34px, 4.6vw, 60px)',
            lineHeight: 1.06,
            margin: 0,
            color: '#fff',
            textWrap: 'balance',
            letterSpacing: '0.015em',
            maxWidth: '22ch',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Liquid Pop. Four ways to deploy{' '}
          <span style={{ color: '#FF3B8A' }}>pink</span> and{' '}
          <span style={{ color: '#D2FF3B' }}>lime</span>.
        </h1>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '14px',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.66)',
            marginTop: '28px',
            maxWidth: '60ch',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Same family — true black, hot pink, electric lime, chrome accents. The four variations
          below differ on which color leads, how the helmet body is treated, and whether the
          headline takes a gradient fill. Pick one to roll across the full Lazy Tiger page.
        </p>
      </section>

      {DIRECTIONS.map((d) => (
        <PreviewBlock key={d.letter} d={d} />
      ))}

      {/* Outro */}
      <section
        style={{
          padding: '120px 40px',
          background: '#000',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.55)',
            margin: 0,
          }}
        >
          Pick D1, D2, D3 or D4 — or call out which moves to combine
          (e.g. D3's gradient headline on D4's pink helmet body).
        </p>
      </section>
    </main>
  );
}
