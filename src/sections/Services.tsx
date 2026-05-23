import Reveal from '../components/Reveal';
import { Marginalia, PullQuote } from '../components/Editorial';
import { TiltCard } from '../components/Spatial';
import PictoIcon from '../components/PictoIcon';
import { servicesConfig, type ServiceCard } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { withProxyzMark } from '../components/ProxyzMark';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';

const serviceIcons = ['audit', 'blueprint', 'install', 'partnership'] as const;

function ServiceColumn({
  card,
  isLast,
  iconName,
}: {
  card: ServiceCard;
  isLast: boolean;
  iconName: (typeof serviceIcons)[number];
}) {
  const body = useBilingual(card.body);
  const ctaLabel = useBilingual(card.cta.label);

  return (
    <TiltCard
      maxTiltX={3}
      maxTiltY={4}
      style={{
        borderRight: isLast ? 'none' : '1px solid #000',
        minHeight: '100%',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
        <PictoIcon name={iconName} size={36} stroke="#000" style={{ marginBottom: '24px' }} />
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: 'var(--accent-pink)',
            margin: '0 0 18px 0',
          }}
        >
          {card.label}
        </p>

        <h3
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            textTransform: 'uppercase',
            margin: '0 0 24px 0',
            color: '#000',
          }}
        >
          {card.name}
        </h3>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: 1.55,
            color: '#000',
            fontStyle: 'italic',
            margin: '0 0 24px 0',
          }}
        >
          For: {withProxyzMark(card.forLabel, 'service-for')}
        </p>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#000',
            margin: '0 0 32px 0',
          }}
        >
          {withProxyzMark(body, 'service-body')}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <a
            href={card.cta.href}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#000',
              textDecoration: 'none',
              borderBottom: '1px solid #000',
              paddingBottom: '2px',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderBottomWidth = '2px';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderBottomWidth = '1px';
            }}
          >
            {ctaLabel}
          </a>
        </div>
    </TiltCard>
  );
}

export default function Services() {
  const { locale } = useLocale();
  const sectionLabel = useBilingual(servicesConfig.sectionLabel);
  const intro = useBilingual(servicesConfig.intro);
  const showBadge = anyFallback(
    locale,
    servicesConfig.sectionLabel,
    servicesConfig.intro,
    ...servicesConfig.cards.map((card) => card.body),
    ...servicesConfig.cards.map((card) => card.cta.label),
  );

  if (servicesConfig.cards.length === 0) {
    return null;
  }

  return (
    <section
      id="services"
      className="section-mobile"
      style={{
        position: 'relative',
        background: '#ffffff',
        color: '#000000',
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
          zIndex: 0,
        }}
      >
        <Marginalia number="04" color="dark" />
      </div>

      <div style={{ position: 'relative', padding: '40px 40px 24px' }}>
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
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '17.5px',
              fontWeight: 400,
              lineHeight: 1.45,
              color: '#000',
              margin: '0 0 24px 0',
              maxWidth: '64ch',
            }}
          >
            {intro}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <PullQuote variant="light" align="left">
            Four engagements. One operating model. Every one starts with the Audit.
          </PullQuote>
        </Reveal>
      </div>

      <div
        className="services-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid #000',
        }}
      >
        {servicesConfig.cards.map((card, index) => (
          <Reveal key={`${card.name}-${index}`} delay={200 + index * 80}>
            <ServiceColumn
              card={card}
              isLast={index === servicesConfig.cards.length - 1}
              iconName={serviceIcons[index] ?? 'arrow'}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
