import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationConfig } from '../config';
import LanguageToggle from './LanguageToggle';

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

function NavLink({
  href,
  label,
  variant = 'link',
}: {
  href: string;
  label: string;
  variant?: 'link' | 'cta';
}) {
  const linkStyle =
    variant === 'cta'
      ? {
          fontSize: '13px',
          fontWeight: 500 as const,
          color: '#F2D78C',
          background: 'transparent',
          border: '1px solid #F2D78C',
          textTransform: 'uppercase' as const,
          textDecoration: 'none',
          letterSpacing: '0.12em',
          padding: '10px 22px',
          borderRadius: '2px',
          transition: 'background 0.2s, color 0.2s',
        }
      : {
          fontSize: '12px',
          fontWeight: 400 as const,
          color: '#F2F2F2',
          textTransform: 'uppercase' as const,
          textDecoration: 'none',
          letterSpacing: '0.08em',
          borderBottom: '1px solid transparent',
          transition: 'border-color 0.2s',
          paddingBottom: '2px',
        };

  const hoverIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (variant === 'cta') {
      (e.currentTarget as HTMLElement).style.background = '#F2D78C';
      (e.currentTarget as HTMLElement).style.color = '#0A0A0A';
    } else {
      (e.target as HTMLElement).style.borderBottomColor = '#F2F2F2';
    }
  };
  const hoverOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (variant === 'cta') {
      (e.currentTarget as HTMLElement).style.background = 'transparent';
      (e.currentTarget as HTMLElement).style.color = '#F2D78C';
    } else {
      (e.target as HTMLElement).style.borderBottomColor = 'transparent';
    }
  };

  if (isExternal(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={variant === 'cta' ? 'hero-nav-cta' : undefined}
        style={linkStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        {label}
      </a>
    );
  }

  if (isRoute(href)) {
    return (
      <Link
        to={href}
        className={variant === 'cta' ? 'hero-nav-cta' : undefined}
        style={linkStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={variant === 'cta' ? 'hero-nav-cta' : undefined}
      style={linkStyle}
      onMouseEnter={hoverIn}
      onMouseLeave={hoverOut}
    >
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

  return (
    <>
      <nav
        className="hero-nav"
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
          // Solid tinted-dark fill instead of glass / backdrop-blur.
          // Impeccable bans glassmorphism as default decoration. This is the
          // most visible persistent element on the site; keeping it solid.
          background: 'rgba(10,10,10,0.94)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontFamily: "'IBM Plex Mono', monospace",
          boxSizing: 'border-box',
        }}
      >
        {isRoute(homeHref) ? (
          <Link
            to={homeHref}
            className="hero-nav-brand"
            aria-label={navigationConfig.brandName}
            style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <img
              src="/proxyz-tricolor.svg"
              alt={navigationConfig.brandName}
              style={{ height: '42px', width: 'auto', display: 'block' }}
            />
          </Link>
        ) : (
          <a
            href={homeHref}
            className="hero-nav-brand"
            aria-label={navigationConfig.brandName}
            style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <img
              src="/proxyz-tricolor.svg"
              alt={navigationConfig.brandName}
              style={{ height: '42px', width: 'auto', display: 'block' }}
            />
          </a>
        )}

        <div
          className="hero-nav-links"
          style={{ display: 'flex', gap: '24px', alignItems: 'center' }}
        >
          {navigationConfig.links.map((item) => (
            <NavLink key={`${item.label}-${item.href}`} href={item.href} label={item.label} />
          ))}
          <LanguageToggle />
          {navigationConfig.primaryCta && (
            <NavLink
              href={navigationConfig.primaryCta.href}
              label={navigationConfig.primaryCta.label}
              variant="cta"
            />
          )}
        </div>

        <div
          className="hero-nav-mobile-actions"
          style={{ display: 'none', alignItems: 'center', gap: '12px' }}
        >
          {navigationConfig.primaryCta && (
            <NavLink
              href={navigationConfig.primaryCta.href}
              label={navigationConfig.primaryCta.label}
              variant="cta"
            />
          )}
          <button
            type="button"
            className="hero-nav-toggle"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="hero-nav-mobile-panel"
            onClick={() => setMobileOpen((v) => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px',
              margin: 0,
              cursor: 'pointer',
              color: '#F2F2F2',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
            }}
          >
            {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
          </button>
        </div>
      </nav>

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
            paddingTop: '72px',
            // Mobile menu panel: solid near-opaque dark, no blur.
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
            <div style={{ paddingTop: '28px' }}>
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
