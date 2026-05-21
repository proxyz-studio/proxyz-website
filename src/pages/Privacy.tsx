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

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";

const LAST_UPDATED = '2026-05-21';

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

export default function Privacy() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <article
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
            PROXYZ Studio / Legal
          </p>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 400,
              lineHeight: 1.02,
              textTransform: 'uppercase',
              letterSpacing: '0.015em',
              margin: 0,
              color: '#fff',
              textWrap: 'balance',
            }}
          >
            Privacy Policy
          </h1>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              margin: '24px 0 0 0',
            }}
          >
            Last updated · {LAST_UPDATED}
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
            This page tells you what PROXYZ Studio collects, why, and what
            you can ask us to do about it. We aim for a short, honest policy
            instead of a long one written for lawyers.
          </p>

          <div style={{ marginTop: '64px', display: 'grid', gap: '48px' }}>
            {SECTIONS.map((s) => (
              <section key={s.heading}>
                <h2
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '13px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-pink)',
                    margin: '0 0 16px 0',
                    fontWeight: 600,
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
            ))}
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
