import { motion } from 'motion/react';
import Reveal from '../components/Reveal';
import { Marginalia } from '../components/Editorial';
import { TiltCard } from '../components/Spatial';
import PictoIcon from '../components/PictoIcon';
import BackgroundGrid from '../components/BackgroundGrid';
import { howItWorksConfig, type StepCard } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { withProxyzMark } from '../components/ProxyzMark';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';

const stepIcons = ['audit', 'install', 'partnership'] as const;

function StepColumn({
  card,
  isLast,
  iconName,
}: {
  card: StepCard;
  isLast: boolean;
  iconName: (typeof stepIcons)[number];
}) {
  const body = useBilingual(card.body);
  const ctaLabel = useBilingual(card.cta.label);

  return (
    <motion.div
      initial={{ y: 0, boxShadow: '0 0 0 0 rgba(0,0,0,0)' }}
      whileHover={{
        y: -4,
        boxShadow: '0 18px 48px -12px rgba(255, 65, 147, 0.22)',
      }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        borderRight: isLast ? 'none' : '1px solid #000',
      }}
    >
      <TiltCard
        maxTiltX={3}
        maxTiltY={4}
        style={{
          minHeight: '100%',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
        }}
      >
        <PictoIcon name={iconName} size={36} stroke="#0A0A0A" style={{ marginBottom: '24px' }} />

        {card.badge && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-block',
              alignSelf: 'flex-start',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              background: 'var(--accent-pink)',
              padding: '5px 10px',
              margin: '0 0 14px 0',
              borderRadius: '2px',
              lineHeight: 1,
            }}
          >
            {card.badge}
          </motion.span>
        )}

        <motion.p
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: 'var(--accent-pink)',
            margin: '0 0 18px 0',
            textTransform: 'uppercase',
          }}
        >
          {card.step} / {card.duration}
        </motion.p>

        <h3
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            textTransform: 'uppercase',
            margin: '0 0 24px 0',
            color: '#0A0A0A',
          }}
        >
          {card.name}
        </h3>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#0A0A0A',
            margin: '0 0 32px 0',
          }}
        >
          {withProxyzMark(body, 'how-it-works-body')}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <motion.a
            href={card.cta.href}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#0A0A0A',
              textDecoration: 'none',
              borderBottom: '1px solid #000',
              paddingBottom: '2px',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderBottomWidth = '2px';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderBottomWidth = '1px';
            }}
          >
            {ctaLabel}
          </motion.a>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function HowItWorks() {
  const { locale } = useLocale();
  const sectionLabel = useBilingual(howItWorksConfig.sectionLabel);
  const heading = useBilingual(howItWorksConfig.heading);
  const intro = useBilingual(howItWorksConfig.intro);
  const showBadge = anyFallback(
    locale,
    howItWorksConfig.sectionLabel,
    howItWorksConfig.heading,
    howItWorksConfig.intro,
    ...howItWorksConfig.steps.map((step) => step.body),
    ...howItWorksConfig.steps.map((step) => step.cta.label),
  );

  if (howItWorksConfig.steps.length === 0) {
    return null;
  }

  return (
    <section
      id="how-it-works"
      className="section-mobile"
      style={{
        position: 'relative',
        background: '#F2F2F2',
        color: '#0A0A0A',
        borderTop: '1px solid #000',
        overflow: 'hidden',
      }}
    >
      <BackgroundGrid color="#0A0A0A" opacity={0.04} spacing={96} />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '32px',
          right: '40px',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <Marginalia number="03" color="dark" />
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '40px 40px 32px' }}>
        <Reveal>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-pink)',
              margin: '0 0 32px 0',
            }}
          >
            {sectionLabel}
            <FallbackBadge show={showBadge} />
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h2
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 'clamp(28px, 3.4vw, 44px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              margin: '0 0 24px 0',
              maxWidth: '24ch',
              color: '#0A0A0A',
              textWrap: 'balance',
            }}
          >
            {heading}
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.6,
              color: '#0A0A0A',
              margin: 0,
              maxWidth: '64ch',
            }}
          >
            {intro}
          </p>
        </Reveal>
      </div>

      <div
        className="how-it-works-grid services-grid"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid #000',
          background: '#F2F2F2',
        }}
      >
        {howItWorksConfig.steps.map((card, index) => (
          <Reveal key={`${card.step}-${index}`} delay={200 + index * 80}>
            <StepColumn
              card={card}
              isLast={index === howItWorksConfig.steps.length - 1}
              iconName={stepIcons[index] ?? 'audit'}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
