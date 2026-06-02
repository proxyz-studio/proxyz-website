// src/pages/Mira.tsx
//
// MIRA Valley × PROXYZ — Month 1 proposal, as a live, gated, immersive page.
// Route: /pipeline/mira (PartnerGate, partner="mira"). Confidential — not
// listed on the public /pipeline index; reachable only via the direct link
// plus the 4-digit code.
//
// Presentation + animation only. Content lives in src/content/mira.ts.
// Motion engine: Framer Motion (motion/react), the site's standard. Impeccable
// discipline: cover is the "arrival" moment (richer motion); body sections are
// restrained — staggers capped ~480ms, subtle hovers, no infinite loops,
// tokenized exponential ease-outs. Reduced-motion respected via MotionConfig.

import { useState, useEffect, useRef } from 'react';
import {
  motion,
  MotionConfig,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
} from 'motion/react';
import Nav from '../components/Nav';
import PartnerGate from '../components/PartnerGate';
import { ease } from '../motion/tokens';
import {
  MIRA_CONTENT,
  MIRA_BRAND,
  MIRA_SECTION_ACCENTS,
  type MiraLocale,
} from '../content/mira';

const NUM = "'IBM Plex Mono', monospace";
const OUT = ease.outExpo; // ease-out-expo, tokenized (mirrors --ease-out-expo)

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const STAGGER_FAST = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const RISE = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: OUT } },
};

/** rAF count-up. Browser-side only; jumps to target under reduced motion. */
function useCountUp(target: number, active: boolean, duration = 1500, reduce = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setVal(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setVal(Math.round(target * easeOutQuart(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, reduce]);
  return val;
}

/** Headline mask reveal — text rises from behind a clipped edge. */
function MaskReveal({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.12em' }}>
      <motion.span
        style={{ display: 'block', ...style }}
        initial={{ y: '115%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: OUT, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function SectionHeader({
  num,
  label,
  title,
  accent,
  display,
  mono,
  isTh,
  chip,
}: {
  num: string;
  label: string;
  title: string;
  accent: string;
  display: string;
  mono: string;
  isTh: boolean;
  chip?: string;
}) {
  return (
    <div style={{ marginBottom: 34 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: NUM, fontSize: 13, color: accent, letterSpacing: '0.12em' }}>{num}</span>
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.5, ease: OUT }}
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: isTh ? '0.02em' : '0.18em',
            textTransform: isTh ? 'none' : 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          {label}
        </motion.span>
        {chip && (
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily: mono,
              fontSize: 10.5,
              letterSpacing: isTh ? '0' : '0.08em',
              textTransform: isTh ? 'none' : 'uppercase',
              color: accent,
              border: `1px solid ${accent}55`,
              borderRadius: 999,
              padding: '4px 12px',
            }}
          >
            {chip}
          </motion.span>
        )}
      </div>
      <MaskReveal
        style={{
          fontFamily: display,
          fontSize: 'clamp(30px, 4.6vw, 58px)',
          fontWeight: 300,
          lineHeight: 1.06,
          letterSpacing: isTh ? '0' : '-0.012em',
          color: MIRA_BRAND.ink,
        }}
      >
        {title}
      </MaskReveal>
    </div>
  );
}

function Paragraphs({ items, body }: { items: string[]; body: string }) {
  return (
    <motion.div variants={STAGGER} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
      {items.map((p, i) => (
        <motion.p
          key={i}
          variants={RISE}
          style={{
            fontFamily: body,
            fontSize: 'clamp(15px,1.45vw,17px)',
            lineHeight: 1.9,
            color: 'rgba(255,255,255,0.82)',
            margin: '0 0 20px',
            maxWidth: '64ch',
          }}
        >
          {p}
        </motion.p>
      ))}
    </motion.div>
  );
}

function MiraProposal() {
  const [lang, setLang] = useState<MiraLocale>('th');
  const [active, setActive] = useState('s01');
  const reduce = useReducedMotion() ?? false;

  const c = MIRA_CONTENT[lang];
  const isTh = lang === 'th';
  const display = isTh
    ? "'Noto Serif Thai', 'Cormorant Garamond', serif"
    : "'Cormorant Garamond', 'Noto Serif Thai', serif";
  const body = isTh ? "'IBM Plex Sans Thai', sans-serif" : "'IBM Plex Mono', monospace";
  const mono = isTh ? "'IBM Plex Sans Thai', sans-serif" : "'IBM Plex Mono', monospace";

  // Page-scoped fonts (Cormorant + Thai faces). IBM Plex Mono is already global.
  useEffect(() => {
    const href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=IBM+Plex+Sans+Thai:wght@300;400;500;600&family=Noto+Serif+Thai:wght@300;400;500;600&display=swap';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-mira-fonts', '');
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = 'MIRA Valley × PROXYZ — Month 1 proposal';
    return () => {
      document.title = prev;
    };
  }, []);

  // Scroll-spy for the section rail.
  useEffect(() => {
    const ids = ['s01', 's02', 's03', 's04', 's05', 's06', 's07'];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const { scrollY } = useScroll();
  const coverYraw = useTransform(scrollY, [0, 600], [0, -110]);
  const coverOraw = useTransform(scrollY, [0, 520], [1, 0]);

  const priceRef = useRef<HTMLDivElement>(null);
  const priceInView = useInView(priceRef, { once: true, amount: 0.5 });
  const count = useCountUp(30000, priceInView, 1500, reduce);

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, ease: OUT, delay },
  });

  const scrollToId = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const accent = (i: number) => MIRA_SECTION_ACCENTS[i];

  const sectionPad: React.CSSProperties = { padding: 'clamp(64px,9vh,118px) 6vw' };
  const inner: React.CSSProperties = { maxWidth: 1020, margin: '0 auto', width: '100%' };
  const divider = '1px solid rgba(255,255,255,0.08)';

  const eyebrow: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: isTh ? '0.02em' : '0.2em',
    textTransform: isTh ? 'none' : 'uppercase',
    color: MIRA_BRAND.z,
    margin: '0 0 22px',
  };

  const toggleBtn = (on: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: NUM,
    fontSize: 12,
    letterSpacing: '0.06em',
    color: on ? MIRA_BRAND.z : 'rgba(255,255,255,0.55)',
    transition: 'color 0.2s',
  });

  const pieceWrap: React.CSSProperties = {
    borderLeft: '1px solid rgba(255,255,255,0.12)',
    paddingLeft: 'clamp(18px,3vw,34px)',
    marginTop: 40,
  };

  return (
    <MotionConfig reducedMotion="user">
      <style>{`
        .mira-rail, .mira-toggle { display: flex; }
        @media (max-width: 1180px) { .mira-rail { display: none !important; } }
        @media (max-width: 640px) { .mira-toggle { top: 84px !important; right: 14px !important; } }
        .mira-root ::selection { background: ${MIRA_BRAND.z}; color: #0A0A0A; }
      `}</style>

      <main
        className="mira-root"
        style={{ background: MIRA_BRAND.bg, color: MIRA_BRAND.ink, position: 'relative', overflow: 'hidden' }}
      >
        {/* Language toggle */}
        <div
          className="mira-toggle"
          style={{
            position: 'fixed',
            top: 96,
            right: 22,
            zIndex: 60,
            alignItems: 'center',
            gap: 9,
            background: 'rgba(10,10,10,0.72)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '7px 13px',
            borderRadius: 999,
          }}
        >
          <button onClick={() => setLang('th')} aria-pressed={isTh} style={toggleBtn(isTh)}>
            ไทย
          </button>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: NUM, fontSize: 12 }}>/</span>
          <button onClick={() => setLang('en')} aria-pressed={!isTh} style={toggleBtn(!isTh)}>
            EN
          </button>
        </div>

        {/* Section rail */}
        <nav
          className="mira-rail"
          aria-label="Sections"
          style={{
            position: 'fixed',
            top: '50%',
            right: 20,
            transform: 'translateY(-50%)',
            zIndex: 55,
            flexDirection: 'column',
            gap: 13,
          }}
        >
          {c.rail.map((r, i) => {
            const on = active === r.id;
            return (
              <button
                key={r.id}
                onClick={() => scrollToId(r.id)}
                aria-current={on ? 'true' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    letterSpacing: isTh ? '0' : '0.1em',
                    textTransform: isTh ? 'none' : 'uppercase',
                    color: on ? accent(i) : 'rgba(255,255,255,0.4)',
                    opacity: on ? 1 : 0,
                    transform: on ? 'translateX(0)' : 'translateX(6px)',
                    transition: 'all 0.3s var(--ease-out-quart)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.label}
                </span>
                <span
                  style={{
                    width: on ? 20 : 8,
                    height: 2,
                    background: on ? accent(i) : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.3s var(--ease-out-quart)',
                  }}
                />
              </button>
            );
          })}
        </nav>

        {/* ===================== COVER — the arrival moment ===================== */}
        <section
          style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '150px 6vw 90px',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.2, ease: OUT }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(900px 520px at 16% 10%, ${MIRA_BRAND.z}14, transparent 60%), radial-gradient(820px 620px at 88% 92%, ${MIRA_BRAND.y}0E, transparent 62%)`,
            }}
          />
          <motion.div style={{ y: reduce ? 0 : coverYraw, opacity: reduce ? 1 : coverOraw }}>
            <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', width: '100%' }}>
              <motion.p {...rise(0.05)} style={eyebrow}>
                {c.cover.eyebrow}
              </motion.p>

              <div style={{ margin: '0 0 28px' }}>
                <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
                  <motion.span
                    initial={{ y: '115%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.05, ease: OUT, delay: 0.18 }}
                    style={{
                      display: 'block',
                      fontFamily: "'Cormorant Garamond', 'Noto Serif Thai', serif",
                      fontWeight: 300,
                      fontSize: 'clamp(46px, 9vw, 124px)',
                      lineHeight: 0.96,
                      letterSpacing: '0.03em',
                      color: MIRA_BRAND.cream,
                    }}
                  >
                    MIRA VALLEY
                  </motion.span>
                </span>
                <motion.div
                  {...rise(0.5)}
                  style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 16 }}
                >
                  <span style={{ fontFamily: NUM, fontSize: 'clamp(20px,3vw,30px)', color: 'rgba(255,255,255,0.4)' }}>
                    ×
                  </span>
                  <span style={{ fontFamily: NUM, fontSize: 'clamp(22px,3.4vw,34px)', fontWeight: 500, letterSpacing: '0.04em' }}>
                    <span style={{ color: MIRA_BRAND.ink }}>PRO</span>
                    <span style={{ color: MIRA_BRAND.x }}>X</span>
                    <span style={{ color: MIRA_BRAND.y }}>Y</span>
                    <span style={{ color: MIRA_BRAND.z }}>Z</span>
                  </span>
                </motion.div>
              </div>

              <motion.p
                {...rise(0.62)}
                style={{
                  fontFamily: body,
                  fontSize: 'clamp(17px,1.6vw,21px)',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.8)',
                  maxWidth: '50ch',
                  margin: '0 0 16px',
                }}
              >
                {c.cover.lede}
              </motion.p>
              <motion.p
                {...rise(0.7)}
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  letterSpacing: isTh ? '0' : '0.06em',
                  color: 'rgba(255,255,255,0.5)',
                  margin: '0 0 46px',
                }}
              >
                {c.cover.coBrandNote} · {c.cover.parentNote}
              </motion.p>

              <motion.div
                variants={STAGGER}
                initial="hidden"
                animate="show"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '24px 32px',
                  borderTop: '1px solid rgba(255,255,255,0.12)',
                  paddingTop: 28,
                  maxWidth: 880,
                }}
              >
                {c.cover.meta.map((m, i) => (
                  <motion.div key={i} variants={RISE}>
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        letterSpacing: isTh ? '0' : '0.16em',
                        textTransform: isTh ? 'none' : 'uppercase',
                        color: MIRA_BRAND.z,
                        marginBottom: 9,
                      }}
                    >
                      {m.label}
                    </div>
                    {m.lines.map((l, j) => (
                      <div
                        key={j}
                        style={{
                          fontFamily: j === 0 ? body : mono,
                          fontSize: j === 0 ? 15 : 12.5,
                          color: j === 0 ? MIRA_BRAND.ink : 'rgba(255,255,255,0.55)',
                          lineHeight: 1.5,
                        }}
                      >
                        {l}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            style={{
              position: 'absolute',
              bottom: 26,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: isTh ? '0' : '0.16em',
                textTransform: isTh ? 'none' : 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {c.cover.scrollHint}
            </span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: 2, ease: 'easeInOut' }}
              style={{ width: 1, height: 26, background: 'linear-gradient(rgba(255,255,255,0.5), transparent)' }}
            />
          </motion.div>
        </section>

        {/* ===================== LETTER ===================== */}
        <section style={{ ...sectionPad, borderBottom: divider }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <MaskReveal
              style={{
                fontFamily: display,
                fontSize: 'clamp(24px,3vw,34px)',
                fontWeight: 400,
                color: MIRA_BRAND.cream,
                lineHeight: 1.3,
              }}
            >
              {c.letter.salutation}
            </MaskReveal>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: OUT, delay: 0.15 }}
              style={{
                fontFamily: body,
                fontSize: 'clamp(16px,1.5vw,19px)',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.8)',
                marginTop: 18,
                maxWidth: '58ch',
              }}
            >
              {c.letter.opening}
            </motion.p>
          </div>
        </section>

        {/* ===================== 01 SITUATION ===================== */}
        <section id="s01" style={{ ...sectionPad, borderBottom: divider }}>
          <div style={inner}>
            <SectionHeader num={c.s01.num} label={c.s01.label} title={c.s01.title} accent={accent(0)} display={display} mono={mono} isTh={isTh} />
            <Paragraphs items={c.s01.body} body={body} />
          </div>
        </section>

        {/* ===================== 02 HOW WE START ===================== */}
        <section id="s02" style={{ ...sectionPad, borderBottom: divider }}>
          <div style={inner}>
            <SectionHeader num={c.s02.num} label={c.s02.label} title={c.s02.title} accent={accent(1)} display={display} mono={mono} isTh={isTh} chip={c.s02.chip} />
            <Paragraphs items={c.s02.body} body={body} />
          </div>
        </section>

        {/* ===================== 03 MONTH 1 ===================== */}
        <section id="s03" style={{ ...sectionPad, borderBottom: divider }}>
          <div style={inner}>
            <SectionHeader num={c.s03.num} label={c.s03.label} title={c.s03.title} accent={accent(2)} display={display} mono={mono} isTh={isTh} />
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: OUT }}
              style={{ fontFamily: body, fontSize: 'clamp(16px,1.5vw,18px)', lineHeight: 1.7, color: 'rgba(255,255,255,0.78)', maxWidth: '60ch' }}
            >
              {c.s03.intro}
            </motion.p>

            {/* Piece 1 — workflow session + quick wins */}
            <div style={pieceWrap}>
              <h3 style={{ fontFamily: display, fontSize: 'clamp(20px,2.4vw,28px)', fontWeight: 400, color: MIRA_BRAND.cream, margin: '0 0 16px' }}>
                {c.s03.piece1.kicker}
              </h3>
              <p style={{ fontFamily: body, fontSize: 'clamp(15px,1.4vw,16.5px)', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', maxWidth: '62ch', margin: '0 0 18px' }}>
                {c.s03.piece1.body}
              </p>
              <p style={{ fontFamily: mono, fontSize: 12.5, letterSpacing: isTh ? '0' : '0.04em', color: accent(2), margin: '0 0 4px' }}>
                {c.s03.piece1.commitLead}
              </p>
              <motion.div
                variants={STAGGER_FAST}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.12 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 14, marginTop: 22 }}
              >
                {c.s03.piece1.quickWins.map((q, i) => (
                  <motion.div
                    key={i}
                    variants={RISE}
                    whileHover={{ y: -2, borderColor: accent(2) }}
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      padding: '18px 20px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.015)',
                      borderRadius: 2,
                    }}
                  >
                    <span style={{ fontFamily: NUM, fontSize: 12, color: accent(2), marginTop: 2, minWidth: 20 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontFamily: body, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
                      {q.title}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Piece 2 — weekly classes timeline */}
            <div style={pieceWrap}>
              <h3 style={{ fontFamily: display, fontSize: 'clamp(20px,2.4vw,28px)', fontWeight: 400, color: MIRA_BRAND.cream, margin: '0 0 16px' }}>
                {c.s03.piece2.kicker}
              </h3>
              <p style={{ fontFamily: body, fontSize: 'clamp(15px,1.4vw,16.5px)', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', maxWidth: '62ch', margin: '0 0 8px' }}>
                {c.s03.piece2.body}
              </p>
              <div style={{ position: 'relative', marginTop: 26, paddingLeft: 32 }}>
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.0, ease: OUT }}
                  style={{ position: 'absolute', left: 9, top: 6, bottom: 6, width: 2, background: `linear-gradient(${accent(2)}, rgba(255,255,255,0.06))`, transformOrigin: 'top' }}
                />
                <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } } }} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
                  {c.s03.piece2.weeks.map((w, i) => (
                    <motion.div key={i} variants={RISE} style={{ position: 'relative', marginBottom: 24 }}>
                      <span style={{ position: 'absolute', left: -30, top: 4, width: 10, height: 10, borderRadius: '50%', background: MIRA_BRAND.bg, border: `2px solid ${accent(2)}` }} />
                      <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: isTh ? '0' : '0.14em', textTransform: isTh ? 'none' : 'uppercase', color: accent(2), marginBottom: 6 }}>
                        {w.week}
                      </div>
                      <div style={{ fontFamily: display, fontSize: 'clamp(19px,2.2vw,25px)', fontWeight: 400, color: MIRA_BRAND.ink, lineHeight: 1.2, marginBottom: 6 }}>
                        {w.title}
                      </div>
                      <div style={{ fontFamily: body, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', maxWidth: '56ch' }}>
                        {w.detail}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              <p style={{ fontFamily: body, fontSize: 14.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', maxWidth: '62ch', marginTop: 8 }}>
                {c.s03.piece2.outro}
              </p>
            </div>

            {/* Piece 3 — weekly involvement */}
            <div style={pieceWrap}>
              <h3 style={{ fontFamily: display, fontSize: 'clamp(20px,2.4vw,28px)', fontWeight: 400, color: MIRA_BRAND.cream, margin: '0 0 16px' }}>
                {c.s03.piece3.kicker}
              </h3>
              <p style={{ fontFamily: body, fontSize: 'clamp(15px,1.4vw,16.5px)', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', maxWidth: '62ch', margin: 0 }}>
                {c.s03.piece3.body}
              </p>
            </div>
          </div>
        </section>

        {/* ===================== 04 WHAT IT'S ABOUT ===================== */}
        <section id="s04" style={{ ...sectionPad, borderBottom: divider }}>
          <div style={inner}>
            <SectionHeader num={c.s04.num} label={c.s04.label} title={c.s04.title} accent={accent(3)} display={display} mono={mono} isTh={isTh} />
            <Paragraphs items={c.s04.body} body={body} />
          </div>
        </section>

        {/* ===================== 05 LOOKING AHEAD ===================== */}
        <section id="s05" style={{ ...sectionPad, borderBottom: divider }}>
          <div style={inner}>
            <SectionHeader num={c.s05.num} label={c.s05.label} title={c.s05.title} accent={accent(4)} display={display} mono={mono} isTh={isTh} />
            <p style={{ fontFamily: body, fontSize: 'clamp(15px,1.45vw,17px)', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', maxWidth: '60ch', margin: '0 0 8px' }}>
              {c.s05.intro}
            </p>
            <motion.ul
              variants={STAGGER}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              style={{ listStyle: 'none', padding: 0, margin: '18px 0 22px' }}
            >
              {c.s05.items.map((it, i) => (
                <motion.li
                  key={i}
                  variants={RISE}
                  style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span style={{ fontFamily: NUM, fontSize: 12, color: accent(4), marginTop: 3 }}>{`0${i + 1}`}</span>
                  <span style={{ fontFamily: body, fontSize: 'clamp(15px,1.4vw,16.5px)', lineHeight: 1.7, color: 'rgba(255,255,255,0.84)' }}>
                    {it}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
            <p style={{ fontFamily: body, fontSize: 14.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.66)', maxWidth: '60ch', fontStyle: isTh ? 'normal' : 'italic' }}>
              {c.s05.outro}
            </p>
          </div>
        </section>

        {/* ===================== 06 WHY PROXYZ ===================== */}
        <section id="s06" style={{ ...sectionPad, borderBottom: divider }}>
          <div style={inner}>
            <SectionHeader num={c.s06.num} label={c.s06.label} title={c.s06.title} accent={accent(5)} display={display} mono={mono} isTh={isTh} />
            <Paragraphs items={c.s06.body} body={body} />
          </div>
        </section>

        {/* ===================== 07 THE ARRANGEMENT — pricing climax ===================== */}
        <section id="s07" style={{ ...sectionPad, borderBottom: divider }}>
          <div style={inner}>
            <SectionHeader num={c.s07.num} label={c.s07.label} title={c.s07.title} accent={accent(6)} display={display} mono={mono} isTh={isTh} />
            <p style={{ fontFamily: body, fontSize: 'clamp(15px,1.45vw,17px)', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', maxWidth: '58ch', margin: '0 0 6px' }}>
              {c.s07.intro}
            </p>
            <div ref={priceRef} style={{ marginTop: 26, display: 'grid', gap: 14 }}>
              {c.s07.rows.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, ease: OUT, delay: i * 0.08 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 14,
                    padding: r.emphasis ? '26px 28px' : '20px 26px',
                    border: `1px solid ${r.emphasis ? accent(6) : 'rgba(255,255,255,0.14)'}`,
                    background: r.emphasis ? `${accent(6)}10` : 'transparent',
                    borderRadius: 2,
                  }}
                >
                  <span style={{ fontFamily: body, fontSize: r.emphasis ? 16 : 15, color: 'rgba(255,255,255,0.82)', maxWidth: '40ch' }}>
                    {r.label}
                  </span>
                  <span
                    style={{
                      fontFamily: NUM,
                      fontSize: r.emphasis ? 'clamp(34px,5.2vw,50px)' : 18,
                      fontWeight: r.emphasis ? 500 : 400,
                      color: r.emphasis ? accent(6) : MIRA_BRAND.ink,
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.countTo ? `${r.prefix ?? ''}${count.toLocaleString('en-US')}` : r.value}
                  </span>
                </motion.div>
              ))}
            </div>
            <p style={{ fontFamily: body, fontSize: 14.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.66)', maxWidth: '60ch', marginTop: 22 }}>
              {c.s07.note}
            </p>

            {/* Sign-off */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: OUT }}
              style={{ marginTop: 56, paddingTop: 30, borderTop: '1px solid rgba(255,255,255,0.12)' }}
            >
              <p style={{ fontFamily: body, fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px' }}>{c.signoff.closing}</p>
              <p style={{ fontFamily: display, fontSize: 'clamp(28px,3.4vw,40px)', fontWeight: 400, color: MIRA_BRAND.cream, margin: '0 0 14px', lineHeight: 1 }}>
                {c.signoff.signature}
              </p>
              <p style={{ fontFamily: mono, fontSize: 13, color: MIRA_BRAND.ink, margin: '0 0 4px' }}>{c.signoff.name}</p>
              <p style={{ fontFamily: mono, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                {c.signoff.org} · {c.signoff.email}
              </p>
              <p style={{ fontFamily: mono, fontSize: 12.5, color: MIRA_BRAND.z, marginTop: 4 }}>{c.signoff.phone}</p>
            </motion.div>
          </div>
        </section>

        {/* ===================== FOOTER ===================== */}
        <footer style={{ padding: 'clamp(56px,8vh,96px) 6vw 60px', background: '#070707' }}>
          <div style={{ maxWidth: 1020, margin: '0 auto' }}>
            <p style={{ fontFamily: display, fontSize: 'clamp(20px,2.6vw,30px)', fontWeight: 300, color: MIRA_BRAND.cream, margin: '0 0 44px', maxWidth: '30ch' }}>
              {c.footer.tagline}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 30 }}>
              {[c.footer.studio, c.footer.contact, c.footer.platform].map((col, i) => (
                <div key={i}>
                  <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: isTh ? '0' : '0.16em', textTransform: isTh ? 'none' : 'uppercase', color: MIRA_BRAND.z, marginBottom: 12 }}>
                    {col.label}
                  </div>
                  {col.lines.map((l, j) => (
                    <div key={j} style={{ fontFamily: mono, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                      {l}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 36, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>{c.footer.copyright}</span>
              <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: isTh ? '0' : '0.08em', color: 'rgba(255,255,255,0.4)' }}>{c.footer.confidential}</span>
            </div>
          </div>
        </footer>
      </main>
    </MotionConfig>
  );
}

export default function Mira() {
  return (
    <>
      <Nav />
      <PartnerGate partner="mira">
        <MiraProposal />
      </PartnerGate>
    </>
  );
}
