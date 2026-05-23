import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationConfig } from '../config';
import NavVertical from './NavVertical';

/**
 * Editorial floating navigation.
 *
 * Layout (no full-width horizontal ribbon):
 *   - Top-left: PROXYZ tricolor wordmark, fixed position.
 *   - Top-right (desktop): <NavVertical /> with hover-arrow menu items.
 *     Hidden below 820px viewport via CSS class.
 *   - Top-right (mobile): burger button. Tap → full-viewport sheet.
 *
 * The language toggle moves OUT of Nav entirely — it's now mounted in
 * App.tsx as a fixed bottom-right element (see LanguageToggleFloating).
 *
 * z-index map: NavVertical = 50, mobile burger = 51, mobile sheet = 49.
 */

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

function isRoute(href: string) {
  return href.startsWith('/') && !href.startsWith('/#');
}

function BurgerIcon() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
      <rect x="0" y="0" width="22" height="1.5" fill="currentColor" />
      <rect x="0" y="6.25" width="22" height="1.5" fill="currentColor" />
      <rect x="0" y="12.5" width="22" height="1.5" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="3" x2="3" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MobileNavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  const style = {
    fontSize: '20px',
    fontWeight: 400 as const,
    color: '#F2F2F2',
    textTransform: 'uppercase' as const,
    textDecoration: 'none',
    letterSpacing: '0.08em',
    padding: '20px 0',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'block',
    fontFamily: "'IBM Plex Mono', monospace",
  };

  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} style={style}>
        {label}
      </a>
    );
  }
  if (isRoute(href)) {
    return (
      <Link to={href} onClick={onNavigate} style={style}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} onClick={onNavigate} style={style}>
      {label}
    </a>
  );
}

export default function Nav() {
  const { pathname } = useLocation();
  const homeHref = pathname === '/' ? '#hero' : '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const brandStyle: React.CSSProperties = {
    position: 'fixed',
    top: '24px',
    left: '40px',
    zIndex: 50,
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
  };

  const brandImg = (
    <img
      src="/proxyz-tricolor.svg"
      alt={navigationConfig.brandName}
      style={{ height: '42px', width: 'auto', display: 'block' }}
    />
  );

  return (
    <>
      {/* Brand wordmark — fixed top-left. No horizontal ribbon behind it. */}
      {isRoute(homeHref) ? (
        <Link to={homeHref} className="hero-nav-brand" aria-label={navigationConfig.brandName} style={brandStyle}>
          {brandImg}
        </Link>
      ) : (
        <a href={homeHref} className="hero-nav-brand" aria-label={navigationConfig.brandName} style={brandStyle}>
          {brandImg}
        </a>
      )}

      {/* Desktop vertical menu — top-right, hover-arrow effect. Hidden on
          mobile via CSS (.nav-vertical-hidden-on-mobile media query). */}
      <div className="nav-vertical-desktop-only">
        <NavVertical />
      </div>

      {/* Mobile burger button — top-right, mobile only via CSS. */}
      <button
        type="button"
        className="hero-nav-toggle nav-burger-mobile-only"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        aria-controls="hero-nav-mobile-panel"
        onClick={() => setMobileOpen((v) => !v)}
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 51,
          background: 'rgba(10, 10, 10, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '8px',
          margin: 0,
          cursor: 'pointer',
          color: '#F2F2F2',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '44px',
          minHeight: '44px',
        }}
      >
        {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
      </button>

      {mobileOpen && (
        <div
          id="hero-nav-mobile-panel"
          className="hero-nav-mobile-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            paddingTop: '88px',
            background: 'rgba(10,10,10,0.98)',
            zIndex: 49,
            fontFamily: "'IBM Plex Mono', monospace",
            overflowY: 'auto',
            animation: 'hero-nav-panel-fade 0.18s ease-out',
          }}
        >
          <div style={{ padding: '8px 24px 40px' }}>
            {navigationConfig.links.map((item) => (
              <MobileNavLink
                key={`m-${item.label}-${item.href}`}
                href={item.href}
                label={item.label}
                onNavigate={closeMobile}
              />
            ))}
            {navigationConfig.primaryCta && (
              <MobileNavLink
                href={navigationConfig.primaryCta.href}
                label={navigationConfig.primaryCta.label}
                onNavigate={closeMobile}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
