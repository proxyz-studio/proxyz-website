import AsciiCanvas from '../components/AsciiCanvas';
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
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '40%',
          minWidth: '320px',
          background: '#000',
          overflow: 'hidden',
        }}
      >
        {/* Navigation */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 50,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 40px',
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontFamily: "'IBM Plex Mono', monospace",
            boxSizing: 'border-box',
          }}
        >
          <a
            href="#hero"
            style={{
              fontSize: '18px',
              fontWeight: 400,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
            }}
          >
            {navigationConfig.brandName}
          </a>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {navigationConfig.links.map((item) => (
              <a
                key={`${item.label}-${item.href}`}
                href={item.href}
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#fff',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  letterSpacing: '0.08em',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color 0.2s',
                  paddingBottom: '2px',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderBottomColor = '#fff';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                }}
              >
                {item.label}
              </a>
            ))}
            {navigationConfig.primaryCta && (
              <a
                href={navigationConfig.primaryCta.href}
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#000',
                  background: '#fff',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  letterSpacing: '0.08em',
                  padding: '8px 14px',
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
                {navigationConfig.primaryCta.label}
              </a>
            )}
          </div>
        </nav>

        {/* Hero content */}
        <div
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
              fontFamily: "'Geist Pixel Square', 'Geist Pixel', monospace",
              fontSize: 'clamp(56px, 7.2vw, 108px)',
              fontWeight: 400,
              lineHeight: 0.94,
              color: '#fff',
              textTransform: 'uppercase',
              margin: 0,
              textWrap: 'balance',
              letterSpacing: '0.01em',
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
