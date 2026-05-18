import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from 'motion/react';
import Nav from '../components/Nav';
import { HeroMesh, HeadlineHalo, EdgeRule } from '../components/Glow';
import { Marginalia, DropCap, PullQuote, MagazineFooter } from '../components/Editorial';
import PictoIcon from '../components/PictoIcon';

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";
const PINK = '#ff4193';
const MINT = '#5BC9B8';
const BUTTER = '#F2D78C';

// ============ HERO with everything ============

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // Smooth-spring cursor
  const cursorX = useSpring(0, { stiffness: 200, damping: 30 });
  const cursorY = useSpring(0, { stiffness: 200, damping: 30 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  }

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: '180px 40px 120px',
        borderBottom: '1px solid rgba(255,255,255,0.30)',
        overflow: 'hidden',
        cursor: 'none',
      }}
    >
      <HeroMesh intensity={1.4} />

      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          x: cursorX,
          y: cursorY,
          width: '20px',
          height: '20px',
          marginLeft: '-10px',
          marginTop: '-10px',
          borderRadius: '50%',
          background: PINK,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '100px',
          right: '40px',
          opacity: 0.45,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <Marginalia number="00" color="light" />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <motion.p
          style={{ opacity: eyebrowOpacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0 }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PINK,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <PictoIcon name="orbit" size={20} stroke={PINK} />
            SHOWCASE · MOTION · GLOW · EDITORIAL · SPATIAL
          </span>
        </motion.p>

        <motion.h1
          style={{
            y: titleY,
            opacity: titleOpacity,
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(56px, 8vw, 120px)',
            fontWeight: 400,
            lineHeight: 0.94,
            color: 'transparent',
            textTransform: 'uppercase',
            margin: '28px 0 0 0',
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
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
        >
          Your studio,
          <br />
          on the inside.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.25 }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: '18px',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.78)',
            margin: '48px 0 0 0',
            maxWidth: '56ch',
          }}
        >
          This is a sandbox demonstrating every technique we've built —
          stacked, layered, and operating together. Scroll. Move your cursor.
          Hover the buttons. The whole stack: Motion springs, scroll-linked
          transforms, mesh glow, headline halos, magnetic CTAs, custom cursor,
          editorial treatment, monoline icons, drop caps, pull quotes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.4 }}
          style={{ marginTop: '56px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}
        >
          <motion.a
            href="#layered"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            style={{
              fontFamily: FONT_MONO,
              fontSize: '12px',
              fontWeight: 500,
              color: '#000',
              background: '#fff',
              textTransform: 'uppercase',
              textDecoration: 'none',
              letterSpacing: '0.12em',
              padding: '14px 26px',
              borderRadius: '999px',
              display: 'inline-block',
              cursor: 'none',
            }}
          >
            Scroll the stack →
          </motion.a>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            style={{
              fontFamily: FONT_MONO,
              fontSize: '12px',
              fontWeight: 400,
              color: BUTTER,
              background: 'transparent',
              border: `1px solid ${BUTTER}`,
              textTransform: 'uppercase',
              textDecoration: 'none',
              letterSpacing: '0.12em',
              padding: '13px 26px',
              borderRadius: '999px',
              display: 'inline-block',
              cursor: 'none',
            }}
          >
            Back to home
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

// ============ Marquee strip ============

function Marquee() {
  return (
    <section
      style={{
        position: 'relative',
        background: '#0a0a0a',
        padding: '48px 0',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        overflow: 'hidden',
      }}
    >
      <EdgeRule color={MINT} />
      <motion.div
        animate={{ x: [0, -1200] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        style={{
          display: 'flex',
          gap: '64px',
          whiteSpace: 'nowrap',
        }}
      >
        {[...Array(2)].flatMap((_, dup) =>
          [
            'OPERATOR STUDIO',
            'BANGKOK',
            'PHUKET',
            'BUILD FOR',
            'BUILD WITH',
            'THE PORTAL',
            'PADEL Z',
            'FAST-FIX',
            'OPERATOR STUDIO',
            'AI INSIDE',
          ].map((word, i) => (
            <span
              key={`${dup}-${i}`}
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 'clamp(40px, 4.4vw, 64px)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: i % 3 === 0 ? PINK : i % 3 === 1 ? '#fff' : MINT,
                opacity: i % 3 === 1 ? 0.85 : 1,
              }}
            >
              {word} ·
            </span>
          ))
        )}
      </motion.div>
    </section>
  );
}

// ============ Layered scroll section ============

function ScrollProgressBar({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, [0, 1], ['0%', '100%']);
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '2px',
        background: PINK,
        width,
        boxShadow: `0 0 12px ${PINK}`,
        zIndex: 3,
      }}
    />
  );
}

function LayeredScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.4]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 30]);

  return (
    <section
      id="layered"
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '120vh',
        padding: '160px 40px',
        background: '#000',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      <ScrollProgressBar progress={scrollYProgress} />

      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          top: '20%',
          left: '60%',
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${PINK} 0%, transparent 60%)`,
          opacity: 0.18,
          filter: 'blur(60px)',
          scale: bgScale,
          rotate: bgRotate,
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '120px',
          right: '40px',
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      >
        <Marginalia number="01" color="light" />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1240px', margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PINK,
            margin: '0 0 48px 0',
          }}
        >
          01 · SCROLL-LINKED CHAPTER
        </motion.p>

        <motion.h2
          style={{
            y: headingY,
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(56px, 7vw, 96px)',
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
            margin: 0,
            color: '#fff',
            textWrap: 'balance',
            maxWidth: '20ch',
          }}
        >
          Everything responds.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            marginTop: '64px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px',
            alignItems: 'start',
          }}
        >
          <DropCap color={PINK}>
            Scroll tracks every value on this page. The heading above drifts
            backward as you progress through the section. The pink blob behind
            rotates and scales. The progress bar at the top of this section
            fills as you read. Every value is a live function of scroll
            position — no triggers, no on-screen detection, no flash.
          </DropCap>
          <div>
            <PullQuote color={MINT} align="left">
              Animation tied to scroll, not to time.
            </PullQuote>
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
              }}
            >
              When you scroll backward, the animations reverse smoothly.
              When you stop, everything stops. The page never feels like a
              one-shot demo — it feels like an instrument.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ Tilt grid ============

function TiltCard({
  num,
  title,
  body,
  icon,
  color,
}: {
  num: string;
  title: string;
  body: string;
  icon: 'audit' | 'blueprint' | 'install' | 'partnership' | 'studioOs' | 'portal';
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateZ(0)`;
  }
  function leave() {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18 }}
    >
      <div
        ref={ref}
        onMouseMove={move}
        onMouseLeave={leave}
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.18)',
          padding: '40px 32px',
          height: '100%',
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          transition: 'transform 240ms cubic-bezier(0.2, 0.7, 0.1, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        <PictoIcon name={icon} size={40} stroke={color} />
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: '11px',
            letterSpacing: '0.18em',
            color,
          }}
        >
          {num}
        </span>
        <h3
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '24px',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: '#fff',
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '13px',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.7)',
            margin: 0,
          }}
        >
          {body}
        </p>
      </div>
    </motion.div>
  );
}

function TiltGrid() {
  return (
    <section
      style={{
        position: 'relative',
        background: '#000',
        padding: '160px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        overflow: 'hidden',
      }}
    >
      <EdgeRule color={MINT} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1240px', margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PINK,
            margin: '0 0 24px 0',
          }}
        >
          02 · TILT + SPRING + ICONS
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.1 }}
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(40px, 5.2vw, 72px)',
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
            color: '#fff',
            margin: '0 0 64px 0',
          }}
        >
          The four engagements.
        </motion.h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
          }}
        >
          <TiltCard
            num="01"
            title="The Audit"
            body="60 minutes. Free. We diagnose the operating bottleneck and send you a one-page memo. Not a sales call."
            icon="audit"
            color={PINK}
          />
          <TiltCard
            num="02"
            title="The Blueprint"
            body="90 days. We take your idea and turn it into a structured, validated, ready-to-operate company."
            icon="blueprint"
            color={MINT}
          />
          <TiltCard
            num="03"
            title="The Install"
            body="90–120 days. We install the Studio OS, automate the work, layer in AI, train your team."
            icon="install"
            color={BUTTER}
          />
          <TiltCard
            num="04"
            title="The Partnership"
            body="Monthly retainer. PROXYZ as your fractional AI operating partner. Long arc, real accountability."
            icon="partnership"
            color={PINK}
          />
        </div>
      </div>
    </section>
  );
}

// ============ White editorial section ============

function EditorialSection() {
  return (
    <section
      style={{
        position: 'relative',
        background: '#fff',
        color: '#000',
        padding: '160px 40px',
        borderBottom: '1px solid #000',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PINK,
            margin: '0 0 24px 0',
          }}
        >
          03 · EDITORIAL INVERSION
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.1 }}
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(56px, 7vw, 96px)',
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
            color: '#000',
            margin: '0 0 64px 0',
            maxWidth: '20ch',
            textWrap: 'balance',
          }}
        >
          The system runs the company. Not the founder.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px',
            alignItems: 'start',
          }}
        >
          <div>
            <p style={{ margin: '0 0 16px 0' }}>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: '80px',
                  lineHeight: 0.85,
                  color: PINK,
                  float: 'left',
                  padding: '4px 16px 0 0',
                }}
              >
                T
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '17px',
                  lineHeight: 1.7,
                  color: 'rgba(0,0,0,0.78)',
                }}
              >
                ribal knowledge in someone's head. Decisions made in group
                chats. Spreadsheets duct-taped to email. AI bolted on top of
                broken process and called transformation. Companies don't run
                badly because the technology is missing. They run badly because
                the operating system is.
              </span>
            </p>
          </div>
          <div>
            <PullQuote color={PINK} variant="light">
              Most companies don't have an AI problem. They have an operations problem.
            </PullQuote>
            <MagazineFooter issue="01" section="03 / 06" date="May 2026" variant="light" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ Stagger icon grid ============

function StaggerIcons() {
  const items: { icon: 'meetings' | 'todos' | 'rocks' | 'issues' | 'scorecard' | 'vto'; label: string; body: string }[] = [
    { icon: 'meetings', label: 'Meetings', body: 'L10s, weekly, quarterly. The rhythm that compresses decision time.' },
    { icon: 'todos', label: 'Todos', body: 'Action items live in one place. Nothing falls off the L10.' },
    { icon: 'rocks', label: 'Rocks', body: 'Quarterly priorities. Everyone knows what matters this quarter.' },
    { icon: 'issues', label: 'Issues', body: 'Open issues list. Every blocker, every IDS, every commitment.' },
    { icon: 'scorecard', label: 'Scorecard', body: 'Weekly numbers. The five to fifteen that move the business.' },
    { icon: 'vto', label: 'V/TO', body: 'Vision, traction, organization. The compass for every operator.' },
  ];

  return (
    <section
      style={{
        position: 'relative',
        background: '#000',
        padding: '160px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        overflow: 'hidden',
      }}
    >
      <HeadlineHalo top="32%" opacity={0.13} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1240px', margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PINK,
            margin: '0 0 24px 0',
          }}
        >
          04 · STAGGERED ENTRANCE
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.1 }}
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(40px, 5.2vw, 72px)',
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
            color: '#fff',
            margin: '0 0 64px 0',
            textWrap: 'balance',
          }}
        >
          The Portal modules.
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}
        >
          {items.map((item) => (
            <motion.div
              key={item.label}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 100, damping: 18 },
                },
              }}
              style={{
                padding: '32px 28px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <PictoIcon name={item.icon} size={32} stroke="#fff" />
              <h4
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  margin: 0,
                }}
              >
                {item.label}
              </h4>
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '13px',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.65)',
                  margin: 0,
                }}
              >
                {item.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ Closing with magnetic CTA ============

function MagneticCTA({ label, color }: { label: string; color: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  function move(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `translate(${x * 14}px, ${y * 8}px)`;
  }
  function leave() {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  }
  return (
    <motion.a
      ref={ref}
      href="/"
      onMouseMove={move}
      onMouseLeave={leave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 250, damping: 18 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 36px',
        background: color,
        color: '#000',
        fontFamily: FONT_MONO,
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        borderRadius: '999px',
        cursor: 'pointer',
      }}
    >
      {label} →
    </motion.a>
  );
}

function ClosingSection() {
  return (
    <section
      style={{
        position: 'relative',
        background: '#0a0a0a',
        padding: '180px 40px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <HeadlineHalo color={PINK} opacity={0.22} width="900px" height="400px" />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1240px', margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: MINT,
            margin: '0 0 32px 0',
          }}
        >
          05 · END OF SHOWCASE
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 80, damping: 16, delay: 0.1 }}
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(48px, 7vw, 96px)',
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
            color: '#fff',
            margin: '0 auto 32px auto',
            maxWidth: '22ch',
            textWrap: 'balance',
          }}
        >
          The whole stack,{' '}
          <span style={{ color: PINK }}>at once.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.25 }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.7)',
            margin: '0 auto 48px auto',
            maxWidth: '60ch',
          }}
        >
          Motion springs. Scroll-linked transforms. Custom cursor. Mesh + halo
          + edge-rule glows. Editorial drop caps, pull quotes, marginalia,
          magazine footers. 21 monoline icons. Tilt cards. Magnetic CTAs.
          Marquee. Staggered grids. This is the maximum-effort version of the
          PROXYZ site.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.4 }}
          style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}
        >
          <MagneticCTA label="Apply this to production" color={PINK} />
          <MagneticCTA label="Cherry-pick pieces" color={MINT} />
        </motion.div>
      </div>
    </section>
  );
}

// ============ Page ============

export default function ShowcasePreview() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000', color: '#fff' }}>
        <HeroSection />
        <Marquee />
        <LayeredScroll />
        <TiltGrid />
        <EditorialSection />
        <StaggerIcons />
        <ClosingSection />
      </main>
    </>
  );
}
