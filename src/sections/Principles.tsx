import { motion } from 'motion/react';
import Reveal from '../components/Reveal';
import { Marginalia } from '../components/Editorial';
import { EdgeRule } from '../components/Glow';
import PictoIcon from '../components/PictoIcon';
import { principlesConfig, type PrincipleItem } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';

const principleIcons = ['spark', 'studioOs', 'orbit'] as const;

function PrincipleRow({ item, index }: { item: PrincipleItem; index: number }) {
  const text = useBilingual(item.text);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        paddingTop: '36px',
      }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 * index }}
        style={{
          height: '2px',
          background: 'var(--accent-pink)',
          transformOrigin: 'left center',
          width: '64px',
        }}
      />

      <PictoIcon name={principleIcons[index] ?? 'principle'} size={40} stroke="#F2F2F2" />

      <p
        style={{
          fontSize: 'clamp(28px, 3vw, 36px)',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'var(--accent-pink)',
          margin: 0,
          lineHeight: 1,
        }}
      >
        {item.number}
      </p>

      <p
        style={{
          fontSize: 'clamp(20px, 1.6vw, 24px)',
          fontWeight: 500,
          lineHeight: 1.35,
          margin: 0,
          textWrap: 'balance',
          color: '#F2F2F2',
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default function Principles() {
  const { locale } = useLocale();
  const sectionLabel = useBilingual(principlesConfig.sectionLabel);
  const heading = useBilingual(principlesConfig.heading);
  const showBadge = anyFallback(
    locale,
    principlesConfig.sectionLabel,
    principlesConfig.heading,
    ...principlesConfig.items.map((item) => item.text),
  );

  if (principlesConfig.items.length === 0) {
    return null;
  }

  return (
    <section
      id="principles"
      className="section-mobile"
      style={{
        position: 'relative',
        background: '#0A0A0A',
        color: '#F2F2F2',
        padding: '140px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
        borderTop: '1px solid #000',
        overflow: 'hidden',
      }}
    >
      <EdgeRule />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '32px',
          right: '40px',
          opacity: 0.45,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <Marginalia number="02" color="light" />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1360px', margin: '0 auto' }}>
        <Reveal>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-pink)',
              margin: '0 0 64px 0',
            }}
          >
            {sectionLabel}
            <FallbackBadge show={showBadge} />
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h2
            style={{
              fontSize: 'clamp(40px, 5vw, 68px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              textTransform: 'uppercase',
              margin: '0 0 24px 0',
            }}
          >
            {heading}
          </h2>
        </Reveal>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '1px',
            background: 'rgba(255,65,147,0.5)',
            transformOrigin: 'left center',
            margin: '0 0 80px 0',
            maxWidth: '480px',
          }}
        />

        <ol
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '64px 56px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {principlesConfig.items.map((item, index) => (
            <Reveal key={index} delay={140 + index * 80} as="li">
              <PrincipleRow item={item} index={index} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
