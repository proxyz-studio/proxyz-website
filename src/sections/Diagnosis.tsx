import Reveal from '../components/Reveal';
import { Marginalia, DropCap } from '../components/Editorial';
import { diagnosisConfig } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';

export default function Diagnosis() {
  const { locale } = useLocale();
  const sectionLabel = useBilingual(diagnosisConfig.sectionLabel);
  const heading = useBilingual(diagnosisConfig.heading);
  const paragraphs = useBilingual(diagnosisConfig.paragraphs);
  const showBadge = anyFallback(
    locale,
    diagnosisConfig.sectionLabel,
    diagnosisConfig.heading,
    diagnosisConfig.paragraphs,
  );

  return (
    <section
      id="diagnosis"
      className="section-mobile"
      style={{
        position: 'relative',
        background: '#F2F2F2',
        color: '#0A0A0A',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
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
        <Marginalia number="01" color="dark" />
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
            {sectionLabel}
            <FallbackBadge show={showBadge} />
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h2
            style={{
              fontSize: 'clamp(32px, 3.6vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              margin: '0 0 56px 0',
              maxWidth: '24ch',
              textWrap: 'balance',
            }}
          >
            {heading}
          </h2>
        </Reveal>

        <div style={{ maxWidth: '64ch' }}>
          {paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={120 + index * 60}>
              {index === 0 ? (
                <div style={{ margin: '0 0 24px 0' }}>
                  <DropCap>{paragraph}</DropCap>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 400,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {paragraph}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
