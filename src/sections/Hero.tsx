import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import AsciiCanvas from '../components/AsciiCanvas';
import Nav from '../components/Nav';
import Reveal, { usePrefersReducedMotion } from '../components/Reveal';
import { MagneticAnchor } from '../components/Spatial';
import { heroConfig } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';
import { withProxyzMark } from '../components/ProxyzMark';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

/** Live Asia/Bangkok wall clock for the plate colophon. Updates every 30s. */
function useBangkokClock() {
  const [clock, setClock] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const tick = () => setClock(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return clock;
}

/** One corner crop mark of the illustration plate frame. */
function CropMark({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const inset = 24;
  // The fixed nav (~82px) overlays the top of the plate panel; drop the
  // top marks below it so the frame is actually visible.
  const topInset = 104;
  const pos: React.CSSProperties =
    corner === 'tl'
      ? { top: topInset, left: inset, borderTop: '1px solid #5E5E5E', borderLeft: '1px solid #5E5E5E' }
      : corner === 'tr'
        ? { top: topInset, right: inset, borderTop: '1px solid #5E5E5E', borderRight: '1px solid #5E5E5E' }
        : corner === 'bl'
          ? { bottom: inset, left: inset, borderBottom: '1px solid #5E5E5E', borderLeft: '1px solid #5E5E5E' }
          : { bottom: inset, right: inset, borderBottom: '1px solid #5E5E5E', borderRight: '1px solid #5E5E5E' };
  return (
    <span
      aria-hidden
      style={{ position: 'absolute', width: 12, height: 12, opacity: 0.8, ...pos }}
    />
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const leadOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const plateY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const { locale } = useLocale();
  const eyebrow = useBilingual(heroConfig.eyebrow);
  const titleLines = useBilingual(heroConfig.titleLines);
  const lead = useBilingual(heroConfig.lead);
  const primaryCtaLabel = useBilingual(heroConfig.primaryCta.label);
  const secondaryLabel = useBilingual(heroConfig.secondaryLink.label);
  const clock = useBangkokClock();
  const showBadge = anyFallback(
    locale,
    heroConfig.eyebrow,
    heroConfig.titleLines,
    heroConfig.lead,
    heroConfig.primaryCta.label,
    heroConfig.secondaryLink.label,
  );

  // Folio row: "ISSUE 01 / VENTURE STUDIO" splits at the first slash —
  // issue number prints in spot-color pink, the descriptor in gray ink.
  // A localized eyebrow without a slash renders whole, in pink.
  const slashIdx = eyebrow.indexOf('/');
  const folioIssue = slashIdx === -1 ? eyebrow : eyebrow.slice(0, slashIdx).trim();
  const folioDesc = slashIdx === -1 ? '' : eyebrow.slice(slashIdx + 1).trim();

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-section"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        background: '#0A0A0A',
      }}
    >
      <Nav />

      <div
        className="hero-left"
        style={{
          position: 'relative',
          width: '55%',
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '112px 48px 48px 64px',
          boxSizing: 'border-box',
        }}
      >
        {/* Folio row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '0 0 30px 0',
          }}
        >
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.32, delay: 0.1 }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              fontWeight: 500,
              lineHeight: 1.6,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: 'var(--accent-pink)' }}>{folioIssue}</span>
            {folioDesc && <span style={{ color: '#9A9A9A' }}>{' '}/ {folioDesc}</span>}
            <FallbackBadge show={showBadge} />
          </motion.p>
          <motion.span
            aria-hidden
            initial={prefersReducedMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            style={{
              flex: 1,
              height: '1px',
              background: '#232323',
              transformOrigin: 'left',
            }}
          />
        </div>

        {/* Headline — bare near-white ink, sentence case, no effects.
            The only color event in the sentence is the trailing period
            of each line that has one, printed in spot pink and inked in
            after the lines have settled. */}
        <motion.h1
          style={{
            y: titleY,
            opacity: titleOpacity,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 'clamp(38px, 4.35vw, 70px)',
            fontWeight: 600,
            lineHeight: locale === 'th' ? 1.3 : 1.04,
            letterSpacing: '-0.02em',
            color: '#F2F2F2',
            margin: 0,
          }}
        >
          {titleLines.map((line, index) => {
            const endsWithPeriod = line.endsWith('.');
            const body = endsWithPeriod ? line.slice(0, -1) : line;
            return (
              <span key={`${line}-${index}`} className="hero-line-mask">
                <motion.span
                  className="hero-line"
                  initial={prefersReducedMotion ? false : { y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.1 + index * 0.09 }}
                >
                  {body}
                  {endsWithPeriod && (
                    <motion.span
                      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.22, ease: EASE_OUT_QUART, delay: 1.2 + index * 0.06 }}
                      style={{ color: 'var(--accent-pink)', display: 'inline-block' }}
                    >
                      .
                    </motion.span>
                  )}
                </motion.span>
              </span>
            );
          })}
        </motion.h1>

        <Reveal delay={380}>
          <motion.p
            style={{
              opacity: leadOpacity,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: 1.65,
              color: '#C9C9C9',
              margin: '36px 0 0 0',
              maxWidth: '58ch',
            }}
          >
            {withProxyzMark(lead, 'hero-lead')}
          </motion.p>
        </Reveal>

        <Reveal delay={480}>
          <div
            className="hero-ctas"
            style={{
              display: 'flex',
              gap: '28px',
              alignItems: 'center',
              marginTop: '44px',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            <MagneticAnchor
              href={heroConfig.primaryCta.href}
              className="hero-cta-primary"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#0A0A0A',
                background: '#F2F2F2',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                padding: '14px 24px',
                borderRadius: 0,
              }}
            >
              {primaryCtaLabel}
            </MagneticAnchor>
            <a
              href={heroConfig.secondaryLink.href}
              style={{
                fontSize: '12px',
                fontWeight: 400,
                color: '#F2F2F2',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                borderBottom: '1px solid rgba(255,255,255,0.4)',
                paddingBottom: '2px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderBottomColor = '#F2F2F2';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderBottomColor = 'rgba(255,255,255,0.4)';
              }}
            >
              {secondaryLabel}
            </a>
          </div>
        </Reveal>
      </div>

      {/* Illustration plate: the ASCII moon as a captioned figure,
          framed by crop marks, with a live Bangkok-time colophon. */}
      <div
        className="hero-right"
        aria-hidden
        style={{
          position: 'relative',
          width: '45%',
          borderLeft: '1px solid #232323',
          overflow: 'hidden',
        }}
      >
        <motion.div style={{ y: plateY, position: 'absolute', inset: 0 }}>
          <AsciiCanvas />
        </motion.div>
        <CropMark corner="tl" />
        <CropMark corner="tr" />
        <CropMark corner="bl" />
        <CropMark corner="br" />
        <span
          style={{
            position: 'absolute',
            left: 48,
            bottom: 44,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#5E5E5E',
          }}
        >
          FIG. 01 {clock ? `/ ${clock} ICT` : ''}
        </span>
      </div>
    </section>
  );
}
