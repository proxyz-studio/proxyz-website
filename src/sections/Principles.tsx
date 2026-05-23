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
        borderTop: '1px solid rgba(255,255,255,0.3)',
        paddingTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <PictoIcon name={principleIcons[index] ?? 'principle'} size={36} stroke="#F2F2F2" />
      <p
        style={{
          fontSize: '12px',
          fontWeight: 400,
          letterSpacing: '0.08em',
          color: 'var(--accent-pink)',
          margin: 0,
        }}
      >
        {item.number}
      </p>
      <p
        style={{
          fontSize: '18px',
          fontWeight: 400,
          lineHeight: 1.45,
          margin: 0,
          textWrap: 'balance',
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
        padding: '120px 40px',
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
              margin: '0 0 80px 0',
            }}
          >
            {heading}
          </h2>
        </Reveal>

        <ol
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '40px',
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
