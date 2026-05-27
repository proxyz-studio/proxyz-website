import { useState } from 'react';
import { motion } from 'motion/react';
import Reveal from '../components/Reveal';
import { Marginalia } from '../components/Editorial';
import { TiltCard } from '../components/Spatial';
import BackgroundGrid from '../components/BackgroundGrid';
import { teamConfig, type StudioTeamMember } from '../config';
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';

function Avatar({ photo, initials }: { photo?: string; initials: string }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = photo && !imgError;

  return (
    <div
      style={{
        width: '88px',
        height: '88px',
        borderRadius: '50%',
        overflow: 'hidden',
        background: showPhoto ? 'transparent' : 'var(--accent-pink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.18)',
        flexShrink: 0,
      }}
    >
      {showPhoto ? (
        <img
          src={photo}
          alt=""
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '28px',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function MemberCard({ member, isLast, index }: { member: StudioTeamMember; isLast: boolean; index: number }) {
  const bio = useBilingual(member.bio);
  const initials = member.name
    .split(/\s|'/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);

  return (
    <motion.div
      initial={{ boxShadow: '0 0 0 0 rgba(0,0,0,0)' }}
      whileHover={{ boxShadow: '0 0 60px 0 rgba(255,65,147,0.18)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <TiltCard
        maxTiltX={3}
        maxTiltY={4}
        style={{
          minHeight: '100%',
          padding: '48px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          background: 'transparent',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
        >
          <Avatar photo={member.photo} initials={initials} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 + 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.14em',
            color: 'var(--accent-pink)',
            margin: '0 0 16px 0',
            textTransform: 'uppercase',
          }}
        >
          {String(index + 1).padStart(2, '0')} / {initials}
        </motion.p>

        <h3
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 'clamp(28px, 3vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            textTransform: 'uppercase',
            margin: '0 0 12px 0',
            color: member.accent ?? '#F2F2F2',
          }}
        >
          {member.name}
        </h3>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: 'var(--accent-pink)',
            margin: '0 0 28px 0',
            textTransform: 'uppercase',
          }}
        >
          {member.role}
        </p>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.78)',
            margin: 0,
          }}
        >
          {bio}
        </p>
      </TiltCard>
    </motion.div>
  );
}

export default function Team() {
  const { locale } = useLocale();
  const sectionLabel = useBilingual(teamConfig.sectionLabel);
  const heading = useBilingual(teamConfig.heading);
  const intro = useBilingual(teamConfig.intro);
  const showBadge = anyFallback(
    locale,
    teamConfig.sectionLabel,
    teamConfig.heading,
    teamConfig.intro,
    ...teamConfig.members.map((m) => m.bio),
  );

  if (teamConfig.members.length === 0) {
    return null;
  }

  return (
    <section
      id="team"
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
      <BackgroundGrid color="#FF4193" opacity={0.05} spacing={96} />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '32px',
          right: '40px',
          opacity: 0.4,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <Marginalia number="06" color="light" />
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
              margin: '0 0 24px 0',
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
              maxWidth: '52ch',
            }}
          >
            {intro}
          </p>
        </Reveal>

        <div
          className="team-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {teamConfig.members.map((member, index) => (
            <Reveal key={`${member.name}-${index}`} delay={200 + index * 100}>
              <MemberCard
                member={member}
                index={index}
                isLast={index === teamConfig.members.length - 1}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
