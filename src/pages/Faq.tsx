import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Nav from '../components/Nav';
import Footer from '../sections/Footer';
import Reveal from '../components/Reveal';
import BackgroundGrid from '../components/BackgroundGrid';
import { useHeroParallax } from '../lib/scrollChoreography';
import { faqConfig, type FaqItem } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';
import { withProxyzMark } from '../components/ProxyzMark';

function AnswerParagraph({ text, index }: { text: string; index: number }) {
  const isBullet = text.startsWith('- ');
  const content = isBullet ? text.slice(2) : text;
  return (
    <p
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '15px',
        fontWeight: 400,
        lineHeight: 1.7,
        color: 'rgba(255,255,255,0.82)',
        margin: index === 0 ? '0 0 16px 0' : '0 0 16px 0',
        paddingLeft: isBullet ? '20px' : 0,
        position: 'relative',
      }}
    >
      {isBullet && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            color: 'var(--accent-pink)',
            fontWeight: 600,
          }}
        >
          ›
        </span>
      )}
      {withProxyzMark(content, `faq-p-${index}`)}
    </p>
  );
}

function FaqRow({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const question = useBilingual(item.question);
  const answer = useBilingual(item.answer);

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '24px 0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          cursor: 'pointer',
          textAlign: 'left',
          color: '#F2F2F2',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.14em',
            color: 'var(--accent-pink)',
            minWidth: '32px',
            paddingTop: '4px',
            textTransform: 'uppercase',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: 'clamp(17px, 1.8vw, 21px)',
            fontWeight: 600,
            lineHeight: 1.35,
            letterSpacing: '-0.005em',
          }}
        >
          {question}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: '24px',
            fontWeight: 300,
            lineHeight: 1,
            color: 'var(--accent-pink)',
            display: 'inline-block',
            paddingTop: '2px',
          }}
        >
          +
        </motion.span>
      </button>

      <motion.div
        id={`faq-answer-${index}`}
        initial={false}
        animate={{
          height: open ? 'auto' : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div
          style={{
            paddingLeft: '52px',
            paddingRight: '32px',
            paddingBottom: '28px',
            maxWidth: '72ch',
          }}
        >
          {answer.map((p, i) => (
            <AnswerParagraph key={i} text={p} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function Faq() {
  const { locale } = useLocale();
  const heroRef = useRef<HTMLElement>(null);
  useHeroParallax(heroRef, { drift: 80, fadeTo: 0.4, inner: '.faq-hero-inner' });
  const eyebrow = useBilingual(faqConfig.eyebrow);
  const heading = useBilingual(faqConfig.heading);
  const intro = useBilingual(faqConfig.intro);
  const showBadge = anyFallback(
    locale,
    faqConfig.eyebrow,
    faqConfig.heading,
    faqConfig.intro,
    ...faqConfig.items.map((i) => i.question),
    ...faqConfig.items.map((i) => i.answer),
  );

  return (
    <>
      <Nav />
      <main
        style={{
          background: '#0A0A0A',
          color: '#F2F2F2',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <section
          ref={heroRef}
          style={{
            position: 'relative',
            padding: '160px 40px 100px',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <BackgroundGrid color="#FF4193" opacity={0.05} spacing={96} />
          <div
            className="faq-hero-inner"
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '880px',
              margin: '0 auto',
            }}
          >
            <Reveal>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-pink)',
                  margin: '0 0 28px 0',
                }}
              >
                {eyebrow}
                <FallbackBadge show={showBadge} />
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h1
                style={{
                  fontFamily: "'Fragment Mono', 'Courier New', monospace",
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  fontWeight: 400,
                  lineHeight: 1.05,
                  letterSpacing: '0.005em',
                  textTransform: 'uppercase',
                  margin: '0 0 32px 0',
                  textWrap: 'balance',
                  maxWidth: '20ch',
                }}
              >
                {heading}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.78)',
                  margin: 0,
                  maxWidth: '58ch',
                  paddingLeft: '18px',
                  borderLeft: '2px solid var(--accent-pink)',
                }}
              >
                {withProxyzMark(intro, 'faq-intro')}
              </p>
            </Reveal>
          </div>
        </section>

        <section
          style={{
            position: 'relative',
            padding: '80px 40px 120px',
            overflow: 'hidden',
          }}
        >
          <BackgroundGrid color="#FF4193" opacity={0.04} spacing={120} />
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '880px',
              margin: '0 auto',
              borderTop: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {faqConfig.items.map((item, index) => (
              <FaqRow key={index} item={item} index={index} />
            ))}
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '880px',
              margin: '64px auto 0',
              textAlign: 'center',
            }}
          >
            <Reveal delay={120}>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)',
                  margin: '0 0 16px 0',
                }}
              >
                Still have a question?
              </p>
              <Link
                to="/#booking"
                style={{
                  display: 'inline-block',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#0A0A0A',
                  background: '#F2F2F2',
                  padding: '14px 24px',
                  borderRadius: '2px',
                  textDecoration: 'none',
                }}
              >
                Book the Walkthrough →
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
