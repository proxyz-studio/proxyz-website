import Reveal from '../components/Reveal';
import { Marginalia } from '../components/Editorial';
import { TiltCard } from '../components/Spatial';
import { proofConfig, type ProofVentureCard } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';

function VentureColumn({ card, isLast }: { card: ProofVentureCard; isLast: boolean }) {
  const body = useBilingual(card.body);

  return (
    <TiltCard
      maxTiltX={3}
      maxTiltY={4}
      style={{
        borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.12)',
        minHeight: '100%',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        background: 'transparent',
      }}
    >
      <h3
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '-0.005em',
          lineHeight: 1.1,
          textTransform: 'uppercase',
          margin: '0 0 24px 0',
          color: '#F2F2F2',
        }}
      >
        {card.name}
      </h3>

      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
        }}
      >
        {body}
      </p>
    </TiltCard>
  );
}

export default function Proof() {
  const { locale } = useLocale();
  const sectionLabel = useBilingual(proofConfig.sectionLabel);
  const heading = useBilingual(proofConfig.heading);
  const lead = useBilingual(proofConfig.lead);
  const tailLinkLabel = useBilingual(proofConfig.tailLink.label);
  const showBadge = anyFallback(
    locale,
    proofConfig.sectionLabel,
    proofConfig.heading,
    proofConfig.lead,
    proofConfig.tailLink.label,
    ...proofConfig.cards.map((card) => card.body),
  );

  return (
    <section
      id="proof"
      className="section-mobile"
      style={{
        position: 'relative',
        background: '#0A0A0A',
        color: '#F2F2F2',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
        borderTop: '1px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '32px',
          right: '40px',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      >
        <Marginalia number="05" color="light" />
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
              margin: '0 0 40px 0',
            }}
          >
            {sectionLabel}
            <FallbackBadge show={showBadge} />
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h2
            style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              margin: '0 0 32px 0',
              maxWidth: '22ch',
              color: '#F2F2F2',
              textWrap: 'balance',
            }}
          >
            {heading}
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <p
            style={{
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 64px 0',
              maxWidth: '64ch',
            }}
          >
            {lead}
          </p>
        </Reveal>

        <div
          className="proof-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            border: '1px solid rgba(255,255,255,0.12)',
            margin: '0 0 48px 0',
          }}
        >
          {proofConfig.cards.map((card, index) => (
            <Reveal key={`${card.name}-${index}`} delay={200 + index * 80}>
              <VentureColumn card={card} isLast={index === proofConfig.cards.length - 1} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <a
            href={proofConfig.tailLink.href}
            style={{
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#F2F2F2',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.4)',
              paddingBottom: '2px',
              transition: 'border-color 0.2s',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderBottomColor = '#F2F2F2';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderBottomColor = 'rgba(255,255,255,0.4)';
            }}
          >
            {tailLinkLabel} →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
