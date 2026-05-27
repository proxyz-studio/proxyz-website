import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';
import Reveal from '../components/Reveal';
import { Marginalia } from '../components/Editorial';
import { HeadlineHalo } from '../components/Glow';
import PictoIcon from '../components/PictoIcon';
import { bookingConfig } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { withProxyzMark } from '../components/ProxyzMark';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';

export default function Booking() {
  const { locale } = useLocale();
  const sectionLabel = useBilingual(bookingConfig.sectionLabel);
  const heading = useBilingual(bookingConfig.heading);
  const body = useBilingual(bookingConfig.body);
  const showBadge = anyFallback(
    locale,
    bookingConfig.sectionLabel,
    bookingConfig.heading,
    bookingConfig.body,
  );

  // Initialize Cal.com embed with editorial-dark theme matching the site.
  // This runs once per mount, idempotent.
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: 'walkthrough' });
      cal('ui', {
        theme: 'dark',
        cssVarsPerTheme: {
          light: {
            'cal-brand': '#FF4193',
          },
          dark: {
            'cal-brand': '#FF4193',
            'cal-bg': '#0A0A0A',
          },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, []);

  return (
    <section
      id="booking"
      className="section-mobile"
      style={{
        position: 'relative',
        background: '#0A0A0A',
        color: '#F2F2F2',
        padding: '120px 40px',
        fontFamily: "'IBM Plex Mono', monospace",
        overflow: 'hidden',
      }}
    >
      <HeadlineHalo top="32%" width="800px" opacity={0.13} />
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
        <Marginalia number="07" color="light" />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '0 0 64px 0' }}>
            <PictoIcon name="time" size={32} stroke="var(--accent-pink)" />
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
              fontSize: 'clamp(28px, 3.4vw, 44px)',
              fontWeight: 400,
              lineHeight: 1.18,
              margin: '0 0 32px 0',
              maxWidth: '24ch',
              textWrap: 'balance',
            }}
          >
            {heading}
          </h2>
        </Reveal>

        <Reveal delay={140}>
          <p
            style={{
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.7,
              margin: '0 0 56px 0',
              maxWidth: '56ch',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {withProxyzMark(body, 'booking-body')}
          </p>
        </Reveal>

        {/*
          Cal.com inline embed via @calcom/embed-react. The bare iframe
          approach (Cal.com page in a plain <iframe>) renders blank because
          Cal.com requires their embed protocol (postMessage handshake +
          init script) to bootstrap the booking widget. The official
          embed-react component handles all that and auto-sizes the embed
          to fit the calendar without manual height tuning.
        */}
        <div style={{ background: 'transparent', minHeight: '720px' }}>
          <Cal
            namespace="walkthrough"
            calLink={bookingConfig.calLink}
            style={{ width: '100%', height: '100%', minHeight: '720px' }}
            config={{ layout: 'month_view', theme: 'dark' }}
          />
        </div>
      </div>
    </section>
  );
}
