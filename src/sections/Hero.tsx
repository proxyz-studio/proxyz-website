import AsciiCanvas from '../components/AsciiCanvas';
import Nav from '../components/Nav';
import { heroConfig, navigationConfig } from '../config';

export default function Hero() {
  const hasHeroContent =
    navigationConfig.brandName ||
    navigationConfig.links.length > 0 ||
    heroConfig.eyebrow ||
    heroConfig.titleLines.length > 0 ||
    heroConfig.lead;

  if (!hasHeroContent) {
    return null;
  }

  return (
    <section
      id="hero"
      className="hero-section"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <Nav />
      <div
        className="hero-left"
        style={{
          position: 'relative',
          width: '40%',
          minWidth: '320px',
          background: '#000',
          overflow: 'hidden',
        }}
      >
        {/* Hero content */}
        <div
          className="hero-content"
          style={{
            position: 'absolute',
            left: '40px',
            right: '40px',
            top: '22vh',
            zIndex: 10,
          }}
        >
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              fontWeight: 400,
              lineHeight: 1.6,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent-pink)',
              margin: '0 0 22px 0',
            }}
          >
            {heroConfig.eyebrow}
          </p>
          <h1
            style={{
              fontFamily: "'Fragment Mono', 'Courier New', monospace",
              fontSize: 'clamp(44px, 5.6vw, 82px)',
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
            {heroConfig.titleLines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < heroConfig.titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.66)',
              margin: '40px 0 0 0',
              maxWidth: '52ch',
            }}
          >
            {heroConfig.lead}
          </p>

          <div
            className="hero-ctas"
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
              marginTop: '36px',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            <a
              href={heroConfig.primaryCta.href}
              style={{
                fontSize: '12px',
                fontWeight: 400,
                color: '#000',
                background: '#fff',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                padding: '12px 22px',
                borderRadius: '999px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.opacity = '1';
              }}
            >
              {heroConfig.primaryCta.label}
            </a>
            <a
              href={heroConfig.secondaryLink.href}
              style={{
                fontSize: '12px',
                fontWeight: 400,
                color: '#fff',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                borderBottom: '1px solid rgba(255,255,255,0.4)',
                paddingBottom: '2px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderBottomColor = '#fff';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderBottomColor = 'rgba(255,255,255,0.4)';
              }}
            >
              {heroConfig.secondaryLink.label}
            </a>
          </div>
        </div>
      </div>

      <div
        className="hero-right"
        style={{
          position: 'relative',
          width: '60%',
          background: '#000',
          overflow: 'hidden',
        }}
      >
        <AsciiCanvas />
      </div>
    </section>
  );
}
