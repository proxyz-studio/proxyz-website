import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { navigationConfig } from '../config';

/**
 * Top-right vertical navigation menu with hover-arrow reveal.
 *
 * Editorial layout: instead of a horizontal nav bar across the top, every
 * route's nav items live in a vertical column in the upper-right corner.
 * On hover of each item, an arrow slides in from the left, the text
 * shifts right, and both shift to PROXYZ pink. Same motion vocabulary
 * the founder's brief uses (exponential ease-outs, ~300ms duration).
 *
 * Items come from `navigationConfig.links` plus an appended Login entry
 * derived from `navigationConfig.primaryCta`. External hrefs (http*) get
 * an <a target="_blank">; internal routes (/foo) get <Link>; in-page hash
 * targets (/#foo) also use <a> so the browser handles the anchor scroll.
 */

type MenuItem = {
  label: string;
  href: string;
};

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

function isRoute(href: string) {
  return href.startsWith('/') && !href.startsWith('/#');
}

const HOVER_COLOR = 'var(--accent-pink)';

const MotionLink = motion.create(Link);
const MotionAnchor = motion.create('a');

function MenuRow({ item }: { item: MenuItem }) {
  const external = isExternal(item.href);
  const route = isRoute(item.href);

  // The arrow icon animates from offscreen-left into the cluster. The
  // link itself shifts ~28px right on hover so the arrow has room to
  // land in the gap without text reflow.
  const arrowVariants = {
    initial: { x: '-100%', opacity: 0, color: 'inherit' },
    hover: { x: 0, opacity: 1, color: HOVER_COLOR },
  };
  const linkVariants = {
    initial: { x: -28, color: 'inherit' },
    hover: { x: 0, color: HOVER_COLOR },
  };
  // ease-out-quint — Motion wants the bezier as a 4-tuple, not a generic number[].
  const transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  const linkClass = 'nav-vertical-link';
  const linkStyle: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  };

  return (
    <motion.div
      className="nav-vertical-row"
      initial="initial"
      whileHover="hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        color: '#F2F2F2',
        overflow: 'hidden', // clip the arrow's initial offscreen position
      }}
    >
      <motion.span
        variants={arrowVariants}
        transition={transition}
        aria-hidden="true"
        style={{ display: 'inline-flex', alignItems: 'center' }}
      >
        <ArrowRight strokeWidth={2} size={18} />
      </motion.span>

      {external ? (
        <MotionAnchor
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          variants={linkVariants}
          transition={transition}
          className={linkClass}
          style={linkStyle}
        >
          {item.label}
        </MotionAnchor>
      ) : route ? (
        <MotionLink
          to={item.href}
          variants={linkVariants}
          transition={transition}
          className={linkClass}
          style={linkStyle}
        >
          {item.label}
        </MotionLink>
      ) : (
        <MotionAnchor
          href={item.href}
          variants={linkVariants}
          transition={transition}
          className={linkClass}
          style={linkStyle}
        >
          {item.label}
        </MotionAnchor>
      )}
    </motion.div>
  );
}

export default function NavVertical() {
  const items: MenuItem[] = [
    ...navigationConfig.links,
    ...(navigationConfig.primaryCta
      ? [{ label: navigationConfig.primaryCta.label, href: navigationConfig.primaryCta.href }]
      : []),
  ];

  return (
    <nav
      aria-label="Primary"
      className="nav-vertical"
      style={{
        position: 'fixed',
        top: '32px',
        right: '40px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        // Right-align the cluster so longer / shorter labels keep a
        // consistent right edge while the arrows enter from the left.
        alignItems: 'flex-end',
        // pointerEvents handled per-row; the wrapper itself is decorative.
        pointerEvents: 'none',
      }}
    >
      {items.map((item) => (
        <div
          key={`${item.href}-${item.label}`}
          style={{ pointerEvents: 'auto' }}
        >
          <MenuRow item={item} />
        </div>
      ))}
    </nav>
  );
}
