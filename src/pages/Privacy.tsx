/* /privacy — PROXYZ Studio privacy policy.
 *
 * v1, English only. Written to satisfy Thai PDPA disclosure baseline and
 * LINE OA Provider-level privacy URL requirement, in PROXYZ editorial
 * voice (humanizer rules apply: no em-dashes, no hype, plain prose).
 *
 * If a real Thai customer ever pushes for full localization, layer Thai
 * inside the same component using the LocaleContext + a parallel block.
 * Have a Thai-licensed lawyer review before B2C launch.
 */

import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../sections/Footer';
import { ProxyzMark } from '../components/ProxyzMark';

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";

const LAST_UPDATED = '2026-05-21';

/** Renders an ISO date as a sentence-cased human date.
 * 2026-05-21 → "21 May 2026". Used to replace the "Last updated · 2026-05-21"
 * pattern which read as a Termly / CMS template per audit. */
function formatHumanDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${months[m - 1]} ${y}`;
}

/** Slugify a section heading for in-page anchor links. */
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const linkStyle: React.CSSProperties = {
  color: 'var(--accent-pink)',
  textDecoration: 'none',
  borderBottom: '1px solid currentColor',
};

const listStyle: React.CSSProperties = {
  margin: '12px 0 0 0',
  paddingLeft: '20px',
  display: 'grid',
  gap: '8px',
};

interface Section {
  heading: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    heading: 'Who we are',
    body: (
      <>
        PROXYZ Studio is a venture-operator studio based in Bangkok,
        Thailand. It is owned and operated by Arnon (Tew) Saksri. You can
        reach us at{' '}
        <a href="mailto:hello@proxyz.studio" style={linkStyle}>
          hello@proxyz.studio
        </a>
        .
      </>
    ),
  },
  {
    heading: 'What we collect',
    body: (
      <>
        Only the information you give us. In practice that means:
        <ul style={listStyle}>
          <li>Your name and email when you book the Audit or write to us.</li>
          <li>The contents of any message you send us.</li>
          <li>
            A signed cookie when you unlock a gated partner page. The cookie
            stores the unlock state for that partner only. It does not contain
            personal data and is not used for tracking.
          </li>
        </ul>
        We do not use analytics that profiles individual visitors. We do not
        place advertising pixels. We do not sell or share your data with
        third parties for marketing.
      </>
    ),
  },
  {
    heading: 'Why we collect it',
    body: (
      <>
        To reply to you, to deliver the Audit or the engagement you booked,
        and to keep partner pages private. Nothing else.
      </>
    ),
  },
  {
    heading: 'How long we keep it',
    body: (
      <>
        Until you ask us to delete it, or until the engagement ends and there
        is no contractual reason to keep it. Whichever comes first.
      </>
    ),
  },
  {
    heading: 'Where it lives',
    body: (
      <>
        Email and message content stays in our work email (Google Workspace).
        Booking notes stay in our internal CRM. Signed-cookie material stays
        on your device and on the Vercel edge that serves the site. We do
        not export your data outside these systems without telling you.
      </>
    ),
  },
  {
    heading: 'Your rights under Thailand’s PDPA',
    body: (
      <>
        Under the Personal Data Protection Act B.E. 2562, you can:
        <ul style={listStyle}>
          <li>Ask what personal data we hold about you.</li>
          <li>Ask us to correct it if it is wrong.</li>
          <li>Ask us to delete it.</li>
          <li>Withdraw consent to processing at any time.</li>
          <li>
            Lodge a complaint with the Personal Data Protection Committee
            of Thailand.
          </li>
        </ul>
        To exercise any of these, email{' '}
        <a href="mailto:hello@proxyz.studio" style={linkStyle}>
          hello@proxyz.studio
        </a>
        . We respond within 30 days.
      </>
    ),
  },
  {
    heading: 'Children',
    body: (
      <>
        The site and the studio are aimed at founders and operators. We do
        not knowingly collect data from anyone under 18. If you believe a
        minor has sent us personal data, write to us and we will delete it.
      </>
    ),
  },
  {
    heading: 'Changes to this policy',
    body: (
      <>
        We can update this page. The date at the top tells you when it was
        last changed. If a change is material we will mark it on this page
        for at least 30 days.
      </>
    ),
  },
];

const PAGE_TITLE_ID = 'privacy-title';

export default function Privacy() {
  const sections = SECTIONS.map((s) => ({ ...s, id: slugify(s.heading) }));

  return (
    <>
      <Nav />
      <main style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>
        <article
          aria-labelledby={PAGE_TITLE_ID}
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            padding: '180px 24px 120px',
          }}
        >
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent-pink)',
              margin: '0 0 22px 0',
            }}
          >
            <ProxyzMark /> Studio / Legal
          </p>
          <h1
            id={PAGE_TITLE_ID}
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 400,
              lineHeight: 1.02,
              textTransform: 'uppercase',
              letterSpacing: '0.015em',
              margin: 0,
              color: 'var(--fg)',
              textWrap: 'balance',
            }}
          >
            Privacy Policy
          </h1>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.6)',
              margin: '24px 0 0 0',
            }}
          >
            Revised {formatHumanDate(LAST_UPDATED)}
          </p>

          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.85)',
              margin: '48px 0 0 0',
            }}
          >
            This page tells you what <ProxyzMark /> Studio collects, why, and what
            you can ask us to do about it. We aim for a short, honest policy
            instead of a long one written for lawyers.
          </p>

          {/* In-page TOC — anchors land at each <section id="...">.
              Replaces the wall-of-text scan that the audit flagged as
              hard to navigate on mobile. */}
          <nav
            aria-label="On this page"
            style={{
              marginTop: '56px',
              padding: '24px 28px',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--accent-pink)',
                margin: '0 0 16px 0',
              }}
            >
              On this page
            </p>
            <ol
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'grid',
                gap: '8px',
                fontFamily: FONT_MONO,
                fontSize: '14px',
                lineHeight: 1.55,
              }}
            >
              {sections.map((s, i) => (
                <li key={s.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <a
                    href={`#${s.id}`}
                    style={{
                      color: 'var(--fg)',
                      textDecoration: 'none',
                      borderBottom: '1px dotted rgba(255,255,255,0.25)',
                    }}
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div style={{ marginTop: '64px', display: 'grid', gap: '56px' }}>
            {sections.map((s) => {
              const h2Id = `${s.id}-h`;
              return (
                <section
                  key={s.id}
                  id={s.id}
                  aria-labelledby={h2Id}
                  style={{ scrollMarginTop: '96px' }}
                >
                  <h2
                    id={h2Id}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 'clamp(16px, 2vw, 20px)',
                      lineHeight: 1.35,
                      color: 'var(--fg)',
                      margin: '0 0 18px 0',
                      fontWeight: 600,
                      letterSpacing: 0,
                      textTransform: 'none',
                    }}
                  >
                    {s.heading}
                  </h2>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '15px',
                      lineHeight: 1.7,
                      color: 'rgba(255,255,255,0.82)',
                    }}
                  >
                    {s.body}
                  </div>
                </section>
              );
            })}
          </div>

          <hr
            style={{
              border: 0,
              borderTop: '1px solid rgba(255,255,255,0.12)',
              margin: '80px 0 32px 0',
            }}
          />

          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '13px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.55)',
              margin: 0,
            }}
          >
            Questions? Write to{' '}
            <a href="mailto:hello@proxyz.studio" style={linkStyle}>
              hello@proxyz.studio
            </a>
            . See also the{' '}
            <Link to="/terms" style={linkStyle}>
              Terms of Service
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
