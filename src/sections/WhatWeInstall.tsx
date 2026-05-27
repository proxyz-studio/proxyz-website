import Reveal from '../components/Reveal';
import { Marginalia, DropCap } from '../components/Editorial';
import PictoIcon from '../components/PictoIcon';
import BackgroundGrid from '../components/BackgroundGrid';
import { whatWeInstallConfig } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { withProxyzMark } from '../components/ProxyzMark';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';

const listIcons = ['meetings', 'principle', 'scorecard', 'install', 'spark'] as const;

export default function WhatWeInstall() {
  const { locale } = useLocale();
  const sectionLabel = useBilingual(whatWeInstallConfig.sectionLabel);
  const heading = useBilingual(whatWeInstallConfig.heading);
  const lead = useBilingual(whatWeInstallConfig.lead);
  const list = useBilingual(whatWeInstallConfig.list);
  const closing = useBilingual(whatWeInstallConfig.closing);
  const showBadge = anyFallback(
    locale,
    whatWeInstallConfig.sectionLabel,
    whatWeInstallConfig.heading,
    whatWeInstallConfig.lead,
    whatWeInstallConfig.list,
    whatWeInstallConfig.closing,
  );

  return (
    <section
      id="what-we-install"
      className="section-mobile"
      style={{
        position: 'relative',
        background: '#F2F2F2',
        color: '#0A0A0A',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
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
        <Marginalia number="04" color="dark" />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1360px', margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '0 0 64px 0' }}>
            <PictoIcon name="studioOs" size={32} stroke="#0A0A0A" />
            <p
              style={{
                fontSize: '12px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent-pink)',
                margin: 0,
              }}
            >
              {sectionLabel}
              <FallbackBadge show={showBadge} />
            </p>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <h2
            style={{
              fontSize: 'clamp(36px, 4.4vw, 60px)',
              fontWeight: 700,
              lineHeight: 1.12,
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

        <Reveal delay={140}>
          <div style={{ margin: '0 0 48px 0', maxWidth: '64ch' }}>
            <DropCap color="#0A0A0A">{withProxyzMark(lead, 'whatweinstall-lead')}</DropCap>
          </div>
        </Reveal>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 48px 0',
            borderTop: '1px solid #000',
          }}
        >
          {list.map((item, index) => (
            <Reveal key={index} delay={220 + index * 70} as="li">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr',
                  gap: '20px',
                  alignItems: 'center',
                  padding: '20px 0',
                  borderBottom: '1px solid #000',
                }}
              >
                <PictoIcon name={listIcons[index] ?? 'principle'} size={28} stroke="#0A0A0A" />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 400,
                    lineHeight: 1.55,
                  }}
                >
                  {item}
                </span>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={620}>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: 1.7,
              margin: 0,
              maxWidth: '64ch',
              color: 'rgba(0,0,0,0.7)',
            }}
          >
            {closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
