import Reveal from '../components/Reveal';
import { Marginalia } from '../components/Editorial';
import { TiltCard } from '../components/Spatial';
import PictoIcon from '../components/PictoIcon';
import { twoWaysConfig, type WayCard } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';
import { withProxyzMark } from '../components/ProxyzMark';

const cardIcons = ['install', 'partnership'] as const;

function WayCardRow({ card, index }: { card: WayCard; index: number }) {
  const body = useBilingual(card.body);
  const linkLabel = useBilingual(card.link.label);
  return (
    <TiltCard
      style={{
        borderTop: '1px solid #000',
        paddingTop: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
        <PictoIcon name={cardIcons[index] ?? 'arrow'} size={40} stroke="#000" />
        <h3
          style={{
            fontSize: '26px',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            color: 'var(--accent-blue)',
            margin: 0,
          }}
        >
          {card.name}
        </h3>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '40ch',
          }}
        >
          {withProxyzMark(body, 'two-body')}
        </p>
        <a
          href={card.link.href}
          style={{
            fontSize: '12px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#000',
            textDecoration: 'none',
            borderBottom: '1px solid #000',
            paddingBottom: '2px',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.6';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        >
          {linkLabel}
        </a>
    </TiltCard>
  );
}

export default function TwoWays() {
  const { locale } = useLocale();
  const sectionLabel = useBilingual(twoWaysConfig.sectionLabel);
  const heading = useBilingual(twoWaysConfig.heading);
  const showBadge = anyFallback(
    locale,
    twoWaysConfig.sectionLabel,
    twoWaysConfig.heading,
    ...twoWaysConfig.cards.map((card) => card.body),
    ...twoWaysConfig.cards.map((card) => card.link.label),
  );

  if (twoWaysConfig.cards.length === 0) {
    return null;
  }

  return (
    <section
      id="two-ways"
      className="section-mobile"
      style={{
        position: 'relative',
        background: '#ffffff',
        color: '#000000',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
        borderTop: '1px solid #000',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '32px',
          right: '40px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      >
        <Marginalia number="03" color="dark" />
      </div>

      <div style={{ position: 'relative', maxWidth: '1360px', margin: '0 auto' }}>
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
            {withProxyzMark(sectionLabel, 'two-label')}
            <FallbackBadge show={showBadge} />
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h2
            style={{
              fontSize: 'clamp(32px, 3.8vw, 52px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              margin: '0 0 80px 0',
            }}
          >
            {heading}
          </h2>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px',
          }}
        >
          {twoWaysConfig.cards.map((card, index) => (
            <Reveal key={index} delay={140 + index * 100}>
              <WayCardRow card={card} index={index} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
