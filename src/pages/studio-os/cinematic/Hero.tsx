import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { studioOsContent } from '../content';
import { DISPLAY, FG, LIME, MONO, MUTED, PINK } from '../theme';
import { wordmark } from './parts';
import HeroBrain from './HeroBrain';

const { hero } = studioOsContent;

type HeroMode = 'lines' | 'words' | 'decode';

const H1: CSSProperties = {
  fontFamily: DISPLAY,
  fontSize: 'clamp(54px, 8vw, 124px)',
  fontWeight: 600,
  lineHeight: 1.04,
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
  margin: 0,
  color: FG,
};

const lineColor = (i: number) => (i === 1 ? PINK : FG);

/** Per-character tokens for the decode treatment, liming the StudioOS "OS". */
function charTokens(line: string, lineIdx: number) {
  const base = lineColor(lineIdx);
  const m = line.match(/studio\s?os/i);
  const osStart = m ? (m.index ?? 0) + m[0].length - 2 : -1;
  return Array.from(line).map((ch, i) => ({
    ch,
    color: osStart >= 0 && i >= osStart && i < osStart + 2 ? LIME : base,
  }));
}

const SCRAMBLE = '▓▒░#%&@/\\<>=+*0101';

function Headline({ mode }: { mode: HeroMode }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    if (mode === 'lines') {
      const ctx = gsap.context(() => {
        gsap.set('.h-line i', { yPercent: 118 });
        gsap.timeline({ delay: 0.12 }).to('.h-line i', { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.1 });
      }, ref);
      return () => ctx.revert();
    }

    if (mode === 'words') {
      const ctx = gsap.context(() => {
        gsap.set('.hw-word', { opacity: 0, y: 28, scale: 0.9, filter: 'blur(10px)' });
        gsap.to('.hw-word', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out', stagger: 0.05, delay: 0.12 });
      }, ref);
      return () => ctx.revert();
    }

    // decode — every char shows scramble glyphs, resolving left to right.
    const chars = Array.from(el.querySelectorAll<HTMLElement>('.hd-char'));
    const stagger = 26;
    const settle = 220;
    let raf = 0;
    let startTs = 0;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = ts - startTs;
      let done = true;
      chars.forEach((c, i) => {
        const target = c.dataset.ch ?? '';
        if (target === ' ') return;
        const revealAt = i * stagger;
        if (t >= revealAt + settle) {
          c.textContent = target;
        } else {
          c.textContent = SCRAMBLE[(Math.floor(t / 42) + i) % SCRAMBLE.length];
          done = false;
        }
      });
      if (!done) raf = requestAnimationFrame(tick);
      else chars.forEach((c) => { c.textContent = c.dataset.ch ?? ''; });
    };
    const fade = gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' });
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); fade.kill(); };
  }, [mode]);

  if (mode === 'lines') {
    return (
      <h1 ref={ref} style={H1}>
        {hero.h1Lines.map((line, i) => (
          <span key={line} className="h-line" style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
            <i style={{ display: 'block', fontStyle: 'normal', willChange: 'transform', color: lineColor(i) }}>{wordmark(line)}</i>
          </span>
        ))}
      </h1>
    );
  }

  if (mode === 'words') {
    return (
      <h1 ref={ref} style={H1}>
        {hero.h1Lines.map((line, i) => {
          const words = line.split(' ');
          return (
            <span key={line} style={{ display: 'block' }}>
              {words.map((w, wi) => (
                <span key={wi} className="hw-word" style={{ color: lineColor(i) }}>
                  {wordmark(w)}
                  {wi < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
          );
        })}
      </h1>
    );
  }

  return (
    <h1 ref={ref} style={H1}>
      {hero.h1Lines.map((line, i) => (
        <span key={line} style={{ display: 'block', textTransform: i === 0 ? 'none' : undefined }}>
          {charTokens(line, i).map((tk, ci) => {
            const display = tk.ch === ' ' ? ' ' : tk.ch;
            return (
              <span key={ci} className="hd-char" data-ch={display} style={{ color: tk.color }}>
                {display}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

const FLOATS = [
  { top: '22%', left: '11%', size: 4, color: PINK, delay: '0s' },
  { top: '63%', left: '19%', size: 3, color: LIME, delay: '1.1s' },
  { top: '40%', left: '44%', size: 3, color: PINK, delay: '2s' },
  { top: '74%', left: '38%', size: 4, color: 'rgba(255,255,255,0.6)', delay: '0.6s' },
  { top: '31%', left: '60%', size: 3, color: LIME, delay: '1.7s' },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  // Locked to the Words treatment for production (dev switcher removed).
  const mode: HeroMode = 'words';

  // Eyebrow / subhead / scroll fade-up + the background-brain parallax.
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('.h-fade', { opacity: 1, y: 0 });
        return;
      }
      gsap.set('.h-fade', { opacity: 0, y: 18 });
      gsap.to('.h-fade', { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12, delay: 0.5 });
      gsap.to('.h-glow', {
        yPercent: -16,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  // Mouse-follow glow, active only in the Words treatment.
  useEffect(() => {
    const g = glowRef.current;
    if (!g) return;
    if (mode !== 'words') {
      g.style.opacity = '0';
      return;
    }
    const onMove = (e: MouseEvent) => {
      g.style.left = `${e.clientX}px`;
      g.style.top = `${e.clientY}px`;
      g.style.opacity = '1';
    };
    const onLeave = () => { g.style.opacity = '0'; };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [mode]);

  return (
    <section
      ref={ref}
      style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '160px 40px 120px', boxSizing: 'border-box', overflow: 'hidden' }}
    >
      {/* Big "operating brain" constellation filling the right half. */}
      <div className="h-glow" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <HeroBrain cxPct={78} cyPct={50} />
      </div>

      {/* Drifting accent motes to fill the space the CTA left behind. */}
      {FLOATS.map((f, i) => (
        <span
          key={i}
          className="hero-float"
          aria-hidden
          style={{ top: f.top, left: f.left, width: f.size, height: f.size, background: f.color, boxShadow: `0 0 8px ${f.color}`, animationDelay: f.delay, zIndex: 1 }}
        />
      ))}

      <div className="sos-hero-glow" ref={glowRef} aria-hidden />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
        <p className="h-fade" style={{ fontFamily: MONO, fontSize: '13px', letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 30px', color: FG }}>
          S/<span style={{ color: LIME }}>OS</span> V1.2
        </p>
        <Headline mode={mode} />
        <p
          className="h-fade"
          style={{ fontFamily: MONO, fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.7, color: MUTED, margin: '40px 0 0', maxWidth: '60ch' }}
        >
          {hero.h2}
        </p>
      </div>
      {/* The scroll cue now lives in the page shell (ScrollCue) so it stays
          fixed and visible on every section, not just the hero. */}
    </section>
  );
}
