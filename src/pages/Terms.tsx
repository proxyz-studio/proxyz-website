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

interface Section {
  heading: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    heading: 'Who we are',
    body: (
      <>
        <ProxyzMark /> Studio is a venture-operator studio based in Bangkok,
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
        booking confirmation you receive. When <ProxyzMark /> engages a company
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
        proxyz.studio are owned by <ProxyzMark /> Studio unless explicitly credited
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
        <ProxyzMark /> Studio is not liable for damages arising from your use of
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

const PAGE_TITLE_ID = 'terms-title';

export default function Terms() {
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
            Terms of Service
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
            These terms cover use of proxyz.studio. Engagement-specific
            terms (Acquire, Partner, Build with, Build for) live in the
            engagement contract, not on this page.
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
