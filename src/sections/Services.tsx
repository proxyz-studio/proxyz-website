import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { servicesConfig, type ServiceCard } from '../config';

gsap.registerPlugin(ScrollTrigger);

function ServiceColumn({ card, isLast }: { card: ServiceCard; isLast: boolean }) {
  return (
    <div
      style={{
        borderRight: isLast ? 'none' : '1px solid #000',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        gap: '0',
      }}
    >
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
        For: {card.forLabel}
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
        {card.body}
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
          {card.cta.label}
        </a>
      </div>
    </div>
  );
}

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    const cols = gridRef.current.children;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(cols),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (servicesConfig.cards.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="services"
      style={{
        background: '#ffffff',
        color: '#000000',
        borderTop: '1px solid #000',
      }}
    >
      <div style={{ padding: '40px 40px 24px' }}>
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
          {servicesConfig.sectionLabel}
        </p>

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
          {servicesConfig.intro}
        </p>
      </div>

      <div
        ref={gridRef}
        className="services-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid #000',
        }}
      >
        {servicesConfig.cards.map((card, index) => (
          <ServiceColumn
            key={`${card.name}-${index}`}
            card={card}
            isLast={index === servicesConfig.cards.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
