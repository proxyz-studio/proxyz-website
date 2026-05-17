import { Link, useLocation } from 'react-router-dom';
import { navigationConfig } from '../config';

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

function isRoute(href: string) {
  return href.startsWith('/') && !href.startsWith('/#');
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
          fontSize: '12px',
          fontWeight: 400 as const,
          color: '#000',
          background: '#fff',
          textTransform: 'uppercase' as const,
          textDecoration: 'none',
          letterSpacing: '0.08em',
          padding: '8px 14px',
          borderRadius: '999px',
          transition: 'opacity 0.2s',
        }
      : {
          fontSize: '12px',
          fontWeight: 400 as const,
          color: '#fff',
          textTransform: 'uppercase' as const,
          textDecoration: 'none',
          letterSpacing: '0.08em',
          borderBottom: '1px solid transparent',
          transition: 'border-color 0.2s',
          paddingBottom: '2px',
        };

  const hoverIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (variant === 'cta') {
      (e.target as HTMLElement).style.opacity = '0.85';
    } else {
      (e.target as HTMLElement).style.borderBottomColor = '#fff';
    }
  };
  const hoverOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (variant === 'cta') {
      (e.target as HTMLElement).style.opacity = '1';
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

  return (
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
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
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
        {navigationConfig.primaryCta && (
          <NavLink
            href={navigationConfig.primaryCta.href}
            label={navigationConfig.primaryCta.label}
            variant="cta"
          />
        )}
      </div>
    </nav>
  );
}
