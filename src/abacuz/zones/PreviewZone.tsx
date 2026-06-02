/* ─── Preview zone ────────────────────────────────────────────────────
 * The ?zone=preview experience: the finished V1 surfaces a client would
 * see, embedded live. Two tabs — the abacuz.co website mock and the two
 * signature documents (Clear Statement + Published Price List). Each runs
 * as a self-contained Babel-in-browser mock served from
 * public/abacuz/preview/, shown in a browser-framed sandboxed iframe with
 * an "open full-screen" link.
 *
 * The mocks are the design system's own recreations (03-brand/
 * abacuz-design-system). Prices shown are illustrative until Khun Joy
 * locks the real numbers — flagged below.
 */

import { useState } from 'react';
import type { Lang, Bilingual } from '../types';
import {
  NAVY,
  GOLD,
  IVORY,
  INK,
  RULE,
  FONT_HEAD,
  FONT_HEAD_TH,
  FONT_BODY,
  FONT_LABEL,
} from '../theme';

type MockId = 'website' | 'documents';

type Mock = {
  id: MockId;
  tab: Bilingual;
  src: string;
  frameLabel: string;
  caption: Bilingual;
};

const MOCKS: Mock[] = [
  {
    id: 'website',
    tab: { th: 'เว็บไซต์', en: 'Website' },
    src: '/abacuz/preview/ui_kits/website/index.html',
    frameLabel: 'abacuz.co',
    caption: {
      th: 'ตัวอย่างเว็บไซต์ abacuz.co เวอร์ชันแรก สร้างจากดีไซน์ซิสเต็มที่ล็อกแล้ว ราคาที่แสดงเป็นตัวอย่าง รอคุณจอยกำหนดตัวเลขจริง',
      en: 'The first-build abacuz.co website, recreated from the locked design system. Prices shown are illustrative until Khun Joy sets the real numbers.',
    },
  },
  {
    id: 'documents',
    tab: { th: 'เอกสารตัวอย่าง', en: 'Documents' },
    src: '/abacuz/preview/ui_kits/documents/index.html',
    frameLabel: 'ABACUZ · Clear Statement + Price List',
    caption: {
      th: 'สองชิ้นงานที่ลูกค้าได้รับจริง: Clear Statement รายเดือน และราคาที่เปิดเผย สลับเอกสารและภาษาได้ในแถบเครื่องมือของตัวอย่าง',
      en: 'The two artifacts a client actually receives: the monthly Clear Statement and the published price list. Switch document + language inside the mock’s own toolbar.',
    },
  },
];

export function PreviewZone({ lang }: { lang: Lang }) {
  const [active, setActive] = useState<MockId>('website');
  const headFont = lang === 'th' ? FONT_HEAD_TH : FONT_HEAD;
  const current = MOCKS.find((m) => m.id === active) ?? MOCKS[0];

  return (
    <main style={{ background: IVORY, minHeight: '100vh' }}>
      {/* Intro */}
      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: 'clamp(56px, 9vh, 110px) 28px 28px',
        }}
      >
        <p
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '12px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: GOLD,
            margin: '0 0 18px 0',
          }}
        >
          {lang === 'th' ? 'ตัวอย่าง · เห็นก่อนเปิดจริง' : 'Preview · see it before it opens'}
        </p>
        <h2
          style={{
            fontFamily: headFont,
            fontSize: 'clamp(30px, 4.4vw, 52px)',
            fontWeight: 500,
            lineHeight: 1.1,
            color: NAVY,
            margin: '0 0 18px 0',
          }}
        >
          {lang === 'th' ? 'หน้าตาของ ABACUZ ที่ลูกค้าจะเห็น' : 'What a client will see'}
        </h2>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '17px',
            lineHeight: 1.7,
            color: INK,
            opacity: 0.85,
            maxWidth: '62ch',
            margin: 0,
          }}
        >
          {lang === 'th'
            ? 'นี่คือเวอร์ชันแรกของเว็บไซต์และเอกสารหลัก สร้างจากดีไซน์ซิสเต็มที่ล็อกแล้ว ใช้งานได้จริง สลับภาษาในแต่ละตัวอย่างได้'
            : 'The first build of the website and the signature documents, recreated from the locked design system. They are live — switch language inside each mock.'}
        </p>
      </section>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label={lang === 'th' ? 'เลือกตัวอย่าง' : 'Choose a preview'}
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 28px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {MOCKS.map((m) => {
          const isActive = m.id === active;
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(m.id)}
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '12px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '11px 20px',
                cursor: 'pointer',
                color: isActive ? IVORY : NAVY,
                background: isActive ? NAVY : 'transparent',
                border: `1px solid ${isActive ? NAVY : RULE}`,
                borderRadius: '2px',
                transition: 'background 0.18s ease, color 0.18s ease',
              }}
            >
              {m.tab[lang]}
            </button>
          );
        })}
      </div>

      {/* Caption + open full-screen */}
      <div
        style={{
          maxWidth: '960px',
          margin: '18px auto 0',
          padding: '0 28px',
          display: 'flex',
          gap: '20px',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: INK,
            opacity: 0.6,
            margin: 0,
            maxWidth: '58ch',
          }}
        >
          {current.caption[lang]}
        </p>
        <a
          href={current.src}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '12px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: GOLD,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            borderBottom: `1px solid ${GOLD}`,
            paddingBottom: '2px',
          }}
        >
          {lang === 'th' ? 'เปิดเต็มจอ ↗' : 'Open full-screen ↗'}
        </a>
      </div>

      {/* Browser-framed iframe */}
      <div
        style={{
          maxWidth: '1180px',
          margin: '22px auto 0',
          padding: '0 28px clamp(56px, 9vh, 110px)',
        }}
      >
        <div
          style={{
            borderRadius: '10px',
            overflow: 'hidden',
            border: `1px solid ${RULE}`,
            boxShadow: '0 24px 60px -28px rgba(20,37,59,0.45)',
            background: '#fff',
          }}
        >
          {/* faux browser top bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: NAVY,
              padding: '11px 16px',
            }}
          >
            <div style={{ display: 'flex', gap: '7px' }} aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '999px',
                    background: 'rgba(201,162,75,0.55)',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '11.5px',
                letterSpacing: '0.1em',
                color: 'rgba(246,241,231,0.78)',
                background: 'rgba(246,241,231,0.08)',
                borderRadius: '999px',
                padding: '4px 14px',
              }}
            >
              {current.frameLabel}
            </div>
          </div>
          <iframe
            key={active}
            src={current.src}
            title={
              active === 'website'
                ? lang === 'th'
                  ? 'ตัวอย่างเว็บไซต์ ABACUZ'
                  : 'ABACUZ website preview'
                : lang === 'th'
                  ? 'ตัวอย่างเอกสาร ABACUZ'
                  : 'ABACUZ documents preview'
            }
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{
              display: 'block',
              width: '100%',
              height: '78vh',
              border: 'none',
              background: '#fff',
            }}
          />
        </div>
      </div>
    </main>
  );
}
