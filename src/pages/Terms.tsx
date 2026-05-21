/* /terms — PROXYZ Studio terms of service.
 *
 * v1, English only. Written to satisfy LINE OA Provider-level terms URL
 * requirement and to set a floor for site usage, in PROXYZ editorial
 * voice (humanizer rules apply: no em-dashes, no hype, plain prose).
 *
 * Engagement-specific terms (Acquire / Partner / Build with / Build for)
 * live in the engagement contract, not on this page. This page covers
 * use of the public site only.
 *
 * Have a Thai-licensed lawyer review before any Thai consumer service
 * launches under this domain.
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
        Thailand. It is owned and operated by Arnon (Tew) Saksri. Contact:{' '}
        <a href="mailto:hello@proxyz.studio" style={linkStyle}>
          hello@proxyz.studio
        </a>
        .
      </>
    ),
  },
  {
    heading: 'Using the site',
    body: (
      <>
        You can browse the public pages freely. Some pages are gated
        (partner prospects, internal previews, media). Do not attempt to
        bypass the gates or share unlock codes you were not given. Do not
        scrape the site for commercial use without our written permission.
      </>
    ),
  },
  {
    heading: 'The Audit and engagements',
    body: (
      <>
        When you book the Audit, the deliverables are described in the
        booking confirmation you receive. When PROXYZ engages a company
        through one of our four modes (Acquire, Partner, Build with,
        Build for), the specific terms live in the engagement contract,
        not on this page.
      </>
    ),
  },
  {
    heading: 'Content ownership',
    body: (
      <>
        All copy, design, code, photography, and visual identity on
        proxyz.studio are owned by PROXYZ Studio unless explicitly credited
        otherwise. You may share links to public pages. You may not
        republish substantial portions of the content as your own.
      </>
    ),
  },
  {
    heading: 'No warranty',
    body: (
      <>
        The site is provided as-is. We do our best to keep it accurate and
        available, but we cannot promise it is always either. Use what you
        find here at your own discretion.
      </>
    ),
  },
  {
    heading: 'Limitation of liability',
    body: (
      <>
        PROXYZ Studio is not liable for damages arising from your use of
        the site, except where Thai law does not permit such limitation.
        For paid engagements, the relevant contract sets the liability
        terms, not this page.
      </>
    ),
  },
  {
    heading: 'Jurisdiction',
    body: (
      <>
        These terms are governed by the laws of Thailand. Any dispute that
        cannot be resolved by discussion is handled in the courts of
        Bangkok.
      </>
    ),
  },
  {
    heading: 'Changes',
    body: (
      <>
        We can update these terms. The date at the top tells you when. If
        a change is material we will mark it on this page for at least 30
        days. Continuing to use the site after a change means you accept
        the updated version.
      </>
    ),
  },
];

export default function Terms() {
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
            Terms of Service
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
            These terms cover use of proxyz.studio. Engagement-specific
            terms (Acquire, Partner, Build with, Build for) live in the
            engagement contract, not on this page.
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
            <Link to="/privacy" style={linkStyle}>
              Privacy Policy
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
