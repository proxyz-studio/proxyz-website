/* ─── Collaborate zone — the full partner walkthrough ────────────── */
/* Assembles what the current page body renders: HERO, PROOF_STRIP,
 * chapters (via ChapterSection, wiring the inset → the 3 inset components),
 * the sticky ChapterNav, and the DecisionTracker.
 * Receives lang as a prop. This is the full existing walkthrough, unchanged.
 */

import { Link } from 'react-router-dom';
import type { Lang } from '../types';
import {
  NAVY, IVORY, STONE, INK, GOLD, RULE,
  FONT_WORD, FONT_HEAD, FONT_HEAD_TH, FONT_BODY, FONT_LABEL,
} from '../theme';
import { META, HERO, PROOF_STRIP } from '../../content/abacuz/meta';
import { CHAPTERS } from '../../content/abacuz/chapters';
import { LangToggle } from '../components/LangToggle';
import { ChapterSection } from '../components/ChapterSection';
import { ChapterNav } from '../components/ChapterNav';
import { DecisionTracker } from '../components/DecisionTracker';

export function CollaborateZone({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <main
      className="abacuz-page"
      style={{
        background: IVORY,
        color: INK,
        fontFamily: FONT_BODY,
        minHeight: '100vh',
      }}
    >
      {/* Page-scoped style block — keeps brand surface isolated, lets the page
          override PROXYZ globals (e.g. Vanta background, scanline headings)
          without touching site-wide CSS. */}
      <style>{`
        .abacuz-page { color-scheme: light; }
        .abacuz-page ::selection {
          background: ${GOLD};
          color: ${NAVY};
        }
        .abacuz-side-stack {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 56px;
          align-items: start;
        }
        @media (max-width: 1100px) {
          .abacuz-side-stack {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .abacuz-tracker, .abacuz-chapnav { position: static !important; }
        }
        @media (max-width: 720px) {
          .abacuz-chapter-marginalia { display: none; }
        }
      `}</style>

      {/* HERO ─────────────────────────────────────── */}
      <section
        className="section-mobile"
        style={{
          padding: '180px 40px 80px',
          position: 'relative',
          background: IVORY,
          borderBottom: `1px solid ${RULE}`,
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: '56px',
            }}
          >
            <div
              style={{
                fontFamily: FONT_WORD,
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: NAVY,
              }}
            >
              ABACU<span style={{ color: GOLD }}>Z</span>
            </div>
            <LangToggle lang={lang} setLang={setLang} />
          </div>

          <p
            style={{
              fontFamily: FONT_LABEL,
              fontSize: '12px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: GOLD,
              margin: '0 0 22px 0',
            }}
          >
            {lang === 'th'
              ? 'พาร์ทเนอร์ · บทแนะนำการเดินทาง'
              : 'Partner · walkthrough'}
          </p>

          <h1
            style={{
              fontFamily: lang === 'th' ? FONT_HEAD_TH : FONT_HEAD,
              fontSize: 'clamp(46px, 6.4vw, 96px)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              color: NAVY,
              margin: '0 0 28px 0',
              textWrap: 'balance',
              maxWidth: '18ch',
            }}
          >
            {HERO.greeting[lang]}
          </h1>

          <p
            style={{
              fontFamily: lang === 'th' ? FONT_HEAD_TH : FONT_HEAD,
              fontSize: 'clamp(22px, 2.4vw, 28px)',
              lineHeight: 1.35,
              fontStyle: 'italic',
              color: INK,
              margin: '0 0 36px 0',
              maxWidth: '40ch',
              fontWeight: 500,
            }}
          >
            {HERO.lede[lang]}
          </p>

          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: '17px',
              lineHeight: 1.7,
              color: INK,
              opacity: 0.85,
              margin: 0,
              maxWidth: '64ch',
            }}
          >
            {HERO.brief[lang]}
          </p>

          {/* Wordmark descriptor + tagline */}
          <div
            style={{
              marginTop: '72px',
              paddingTop: '32px',
              borderTop: `1px solid ${RULE}`,
              display: 'flex',
              gap: '32px',
              flexWrap: 'wrap',
              alignItems: 'baseline',
            }}
          >
            <div
              style={{
                fontFamily: FONT_HEAD,
                fontSize: 'clamp(20px, 2.2vw, 26px)',
                fontStyle: 'italic',
                color: NAVY,
                fontWeight: 500,
              }}
            >
              {META.tagline[lang]}
            </div>
            <div
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: GOLD,
                textTransform: 'uppercase',
              }}
            >
              {META.descriptor} · {META.domain}
            </div>
          </div>
        </div>
      </section>

      {/* "ONE DAY" PROOF STRIP ───────────────────── */}
      <section
        aria-label={lang === 'th' ? 'ส่งมอบในวันเดียว' : 'Shipped in one day'}
        style={{
          background: NAVY,
          color: IVORY,
          padding: '48px 40px',
          borderBottom: `1px solid ${NAVY}`,
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: FONT_LABEL,
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: GOLD,
              margin: '0 0 28px 0',
            }}
          >
            {lang === 'th'
              ? '2026-05-31 · ส่งมอบในเซสชั่นเดียว'
              : '2026-05-31 · shipped in a single session'}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
            }}
          >
            {PROOF_STRIP.map((s) => (
              <div
                key={s.time}
                style={{
                  borderLeft: `2px solid ${GOLD}`,
                  paddingLeft: '14px',
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_LABEL,
                    fontSize: '12px',
                    letterSpacing: '0.14em',
                    color: GOLD,
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: '6px',
                  }}
                >
                  {s.time}
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '14px',
                    lineHeight: 1.45,
                    color: IVORY,
                  }}
                >
                  {s.label[lang]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTERS + STICKY SIDE STACK ────────────── */}
      <section
        className="section-mobile"
        style={{ padding: '80px 40px 120px' }}
      >
        <div
          style={{ maxWidth: '1320px', margin: '0 auto' }}
          className="abacuz-side-stack"
        >
          <div>
            {CHAPTERS.map((c, i) => (
              <ChapterSection key={c.id} chapter={c} lang={lang} index={i} />
            ))}
          </div>

          <div
            style={{
              position: 'sticky',
              top: '100px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: 'calc(100vh - 130px)',
              overflowY: 'auto',
            }}
            className="abacuz-side-rail"
          >
            <ChapterNav lang={lang} />
            <DecisionTracker lang={lang} />
          </div>
        </div>
      </section>

      {/* CLOSING ─────────────────────────────────── */}
      <section
        style={{
          background: STONE,
          color: INK,
          padding: '120px 40px',
          borderTop: `1px solid ${RULE}`,
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: FONT_LABEL,
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: GOLD,
              margin: '0 0 24px 0',
            }}
          >
            {lang === 'th' ? 'ขั้นถัดไป' : 'Next'}
          </p>
          <h2
            style={{
              fontFamily: lang === 'th' ? FONT_HEAD_TH : FONT_HEAD,
              fontSize: 'clamp(34px, 4.6vw, 52px)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: NAVY,
              margin: '0 0 24px 0',
              fontStyle: 'italic',
              textWrap: 'balance',
            }}
          >
            {lang === 'th'
              ? 'อ่านจบแล้วเรามาคุยกัน'
              : "When you've read through, let's sit together."}
          </h2>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: '17px',
              lineHeight: 1.7,
              color: INK,
              margin: '0 0 36px 0',
              maxWidth: '60ch',
            }}
          >
            {lang === 'th'
              ? 'ไม่มีความเร่งรีบ ระบุสิ่งที่เห็นด้วย ระบุสิ่งที่อยากเปลี่ยน และระบุสิ่งที่ยังไม่ชัดเจน เราเริ่มที่กรอบความเป็นหุ้นส่วน (สัดส่วนหุ้น ทุน ทริกเกอร์เต็มเวลา) แล้วลำดับขั้นถัดไปจะตามมาตามธรรมชาติ'
              : 'No rush. Mark what you agree with, what you want to change, and what is still unclear. We start with the partnership frame — equity split, capital, full-time trigger — and the rest sequences naturally from there.'}
          </p>
          <Link
            to="/pipeline"
            style={{
              fontFamily: FONT_LABEL,
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: IVORY,
              background: NAVY,
              padding: '14px 26px',
              textDecoration: 'none',
              display: 'inline-block',
              borderRadius: '2px',
              transition: 'background 180ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = GOLD;
              e.currentTarget.style.color = NAVY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = NAVY;
              e.currentTarget.style.color = IVORY;
            }}
          >
            ← {lang === 'th' ? 'กลับไปหน้าไปป์ไลน์' : 'Back to Pipeline'}
          </Link>
        </div>
      </section>
    </main>
  );
}
