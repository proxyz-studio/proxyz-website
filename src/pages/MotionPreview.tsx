import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import Nav from '../components/Nav';

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";
const PINK = '#ff4193';
const MINT = '#5BC9B8';

// ============ Demo A — Spring reveal vs CSS reveal ============

function SpringRevealDemo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '40px',
      }}
    >
      <div>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            margin: '0 0 24px 0',
          }}
        >
          Current CSS reveal · 320ms ease-out
        </p>
        <motion.div
          key={Math.random()}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.2, 0.7, 0.1, 1] }}
          style={{
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: '#0a0a0a',
          }}
        >
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: '28px',
              fontWeight: 400,
              margin: '0 0 16px 0',
              color: '#fff',
            }}
          >
            Operator studio.
          </h3>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}
          >
            Linear ease-out. Predictable. What the site uses today.
          </p>
        </motion.div>
      </div>
      <div>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            margin: '0 0 24px 0',
          }}
        >
          Motion spring · stiffness 90 · damping 18
        </p>
        <motion.div
          key={Math.random() + 1}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          style={{
            padding: '32px',
            border: `1px solid ${PINK}`,
            background: '#0a0a0a',
          }}
        >
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: '28px',
              fontWeight: 400,
              margin: '0 0 16px 0',
              color: '#fff',
            }}
          >
            Operator studio.
          </h3>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}
          >
            Settles with a tiny overshoot. Feels alive — not robotic.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ============ Demo B — Scroll-linked parallax ============

function ScrollParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Parallax title moves 0px → -180px while in view
  const titleY = useTransform(scrollYProgress, [0, 1], [180, -180]);
  // Body text fades in at 30%, out at 70%
  const bodyOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  // Background blob scales as you scroll
  const blobScale = useTransform(scrollYProgress, [0, 1], [0.6, 1.4]);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        height: '90vh',
        minHeight: '600px',
        background: '#000',
        border: '1px solid rgba(255,255,255,0.18)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${PINK}33 0%, transparent 60%)`,
          filter: 'blur(40px)',
          scale: blobScale,
          opacity: 0.6,
        }}
        aria-hidden
      />
      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '60ch' }}>
        <motion.h2
          style={{
            y: titleY,
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
            margin: '0 0 32px 0',
            color: '#fff',
            textWrap: 'balance',
          }}
        >
          Scroll-linked motion.
        </motion.h2>
        <motion.p
          style={{
            opacity: bodyOpacity,
            fontFamily: FONT_MONO,
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.85)',
            margin: 0,
          }}
        >
          The heading drifts up as you scroll. The background blob scales. The body
          text fades in at 30% of the section, out at 70%. All values are
          continuously tied to scroll position — no triggers, no timing functions.
        </motion.p>
      </div>
    </div>
  );
}

// ============ Demo C — Drag with spring return ============

function DragSpring() {
  return (
    <div
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.18)',
        padding: '48px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          margin: '0 0 32px 0',
        }}
      >
        Drag this. Let go.
      </p>
      <motion.div
        drag
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        dragElastic={0.4}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        style={{
          display: 'inline-block',
          padding: '24px 40px',
          background: PINK,
          color: '#000',
          fontFamily: FONT_MONO,
          fontSize: '14px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 500,
          borderRadius: '999px',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        Book the Audit
      </motion.div>
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '13px',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.65)',
          margin: '32px 0 0 0',
          maxWidth: '60ch',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Drag the button anywhere, release, and the spring pulls it back to its
        anchor. Hover scales up, tap scales down. All physics, no keyframes.
      </p>
    </div>
  );
}

// ============ Demo D — Smooth spring cursor follower ============

function SmoothFollower() {
  const x = useSpring(0, { stiffness: 200, damping: 30 });
  const y = useSpring(0, { stiffness: 200, damping: 30 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  return (
    <div
      onMouseMove={handleMove}
      style={{
        position: 'relative',
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.18)',
        padding: '60px 40px',
        textAlign: 'center',
        cursor: 'none',
        overflow: 'hidden',
        minHeight: '300px',
      }}
    >
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          margin: '0 0 24px 0',
        }}
      >
        Move your cursor inside this card.
      </p>
      <h3
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(32px, 4vw, 52px)',
          fontWeight: 400,
          lineHeight: 0.98,
          letterSpacing: '-0.015em',
          textTransform: 'uppercase',
          margin: 0,
          color: '#fff',
        }}
      >
        Spring-tracked cursor.
      </h3>
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          x,
          y,
          width: '24px',
          height: '24px',
          marginLeft: '-12px',
          marginTop: '-12px',
          borderRadius: '50%',
          background: PINK,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default function MotionPreview() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <div style={{ padding: '140px 40px 40px', maxWidth: '1240px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PINK,
              margin: '0 0 22px 0',
            }}
          >
            INTERNAL · MOTION DEMO
          </p>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(40px, 5.6vw, 76px)',
              fontWeight: 400,
              lineHeight: 0.98,
              letterSpacing: '-0.015em',
              margin: '0 0 24px 0',
              color: 'transparent',
              textTransform: 'uppercase',
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
            Motion · v12.38
          </h1>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '15px',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 24px 0',
              maxWidth: '70ch',
            }}
          >
            Four things Motion does that the current CSS animations can't: spring
            physics, scroll-linked transforms, gesture-driven drag, and
            smoothly-tracked spring values. Scroll, hover, drag.
          </p>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '12px',
              letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.4)',
              margin: 0,
            }}
          >
            Page is unlinked. Once you pick what to use, I'll replace the current
            CSS Reveal with Motion's spring version site-wide, and add
            scroll-linked transforms to specific surfaces.
          </p>
        </div>

        {/* Demo A */}
        <section style={{ padding: '64px 40px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: PINK,
                margin: '0 0 12px 0',
              }}
            >
              Demo A · Spring vs ease-out
            </p>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                margin: '0 0 12px 0',
                color: '#fff',
              }}
            >
              Reveal with spring physics.
            </h2>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 32px 0',
                maxWidth: '70ch',
              }}
            >
              Two identical cards, two timing functions. The pink-bordered card on
              the right uses Motion spring physics — it overshoots a hair and
              settles. The left uses the site's current CSS ease-out. Refresh to
              compare from start.
            </p>
            <SpringRevealDemo />
          </div>
        </section>

        {/* Demo B */}
        <section style={{ padding: '64px 40px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: PINK,
                margin: '0 0 12px 0',
              }}
            >
              Demo B · Scroll-linked transforms
            </p>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                margin: '0 0 12px 0',
                color: '#fff',
              }}
            >
              Animation tied to scroll position.
            </h2>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 32px 0',
                maxWidth: '70ch',
              }}
            >
              The heading drifts, the background blob scales, the body fades in and
              out. Every value continuously interpolates from scroll progress, not
              a one-shot timing function.
            </p>
          </div>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 40px' }}>
            <ScrollParallax />
          </div>
        </section>

        {/* Demo C */}
        <section style={{ padding: '64px 40px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: PINK,
                margin: '0 0 12px 0',
              }}
            >
              Demo C · Drag + spring return
            </p>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                margin: '0 0 12px 0',
                color: '#fff',
              }}
            >
              Gesture-driven physics.
            </h2>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 32px 0',
                maxWidth: '70ch',
              }}
            >
              Drag the pink pill. Release. Spring pulls it home with overshoot.
              Hover and tap also use spring. Whole interaction is one declarative
              component.
            </p>
            <DragSpring />
          </div>
        </section>

        {/* Demo D */}
        <section style={{ padding: '64px 40px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: PINK,
                margin: '0 0 12px 0',
              }}
            >
              Demo D · Smooth spring values
            </p>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                margin: '0 0 12px 0',
                color: '#fff',
              }}
            >
              Custom cursor that lags with spring.
            </h2>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 32px 0',
                maxWidth: '70ch',
              }}
            >
              The pink dot tracks your cursor through a useSpring — slight lag,
              natural settle. Drop this on the hero or PadelZ page for a premium
              custom-cursor moment.
            </p>
            <SmoothFollower />
          </div>
        </section>

        {/* Closing */}
        <section style={{ padding: '96px 40px 120px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                margin: '0 0 32px 0',
                color: '#fff',
              }}
            >
              Where to use it.
            </h2>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                maxWidth: '70ch',
              }}
            >
              {[
                { k: 'A', v: 'Swap the current CSS Reveal for Motion spring reveal site-wide. Same component API, more natural feel.' },
                { k: 'B', v: 'Add scroll-linked transforms to the homepage Hero (the title drifts up as you scroll past it) and to the Padel Z hero.' },
                { k: 'C', v: 'Replace MagneticAnchor with the spring-drag pattern for primary CTAs. Tactile feedback.' },
                { k: 'D', v: 'Drop the smooth-spring cursor on the homepage hero left panel and the Padel Z hero.' },
              ].map((row, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.85)',
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr',
                    gap: '20px',
                  }}
                >
                  <span style={{ color: MINT, fontWeight: 600 }}>{row.k}</span>
                  <span>{row.v}</span>
                </li>
              ))}
            </ul>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '13px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.55)',
                margin: '32px 0 0 0',
                maxWidth: '70ch',
              }}
            >
              My pick: <span style={{ color: MINT }}>A + B</span>. A makes the
              whole site feel more alive immediately. B adds the "wow" moment to
              the two hero sections that matter most. C and D are nice-to-haves
              that can come later.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
