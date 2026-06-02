import type { Lang } from '../../types';
import { NAVY, IVORY, GOLD, FONT_HEAD, FONT_BODY, FONT_LABEL, FONT_WORD } from '../../theme';

const NUMBERS: { en: string; th: string }[] = [
  { en: 'Tier prices — Starter / Growing / Established (THB / month)', th: 'ราคา tier — Starter / Growing / Established (บาท / เดือน)' },
  { en: 'One-off prices — formation, work permit, visa, BOI, trademark, annual statements', th: 'ราคาบริการครั้งเดียว — จัดตั้ง ใบอนุญาตทำงาน วีซ่า BOI เครื่องหมายการค้า งบประจำปี' },
  { en: 'Advisory retainer prices — light / full / project-based', th: 'ราคา advisory retainer — เบา / เต็ม / ตามโปรเจกต์' },
  { en: 'English-service premium — the size of the multiplier', th: 'พรีเมียมบริการภาษาอังกฤษ — ขนาดของตัวคูณ' },
  { en: 'Your part-time review draw (THB / month)', th: 'ค่าตอบแทนพาร์ทไทม์ของคุณจอย (บาท / เดือน)' },
  { en: 'Your review-hour cost — draw ÷ committed hours', th: 'ต้นทุนชั่วโมงตรวจของคุณจอย — ค่าตอบแทน ÷ ชั่วโมงที่ผูกพัน' },
  { en: "Tew's part-time draw (THB / month)", th: 'ค่าตอบแทนพาร์ทไทม์ของ Tew (บาท / เดือน)' },
  { en: 'Bookkeeper market rate — fully loaded (salary + statutory)', th: 'อัตราตลาดของพนักงานบัญชี — รวมเงินสมทบทั้งหมด' },
  { en: 'Your full-time trigger — the revenue / client milestone', th: 'ทริกเกอร์เต็มเวลาของคุณจอย — รายได้ / milestone ลูกค้า' },
  { en: 'Second-reviewer hire trigger — review-cap percentage (e.g. 80%)', th: 'ทริกเกอร์จ้างผู้ตรวจสอบคนที่สอง — เปอร์เซ็นต์ของเพดานตรวจ (เช่น 80%)' },
];

export function NumberChecklist({ lang }: { lang: Lang }) {
  return (
    <div
      style={{
        background: NAVY,
        color: IVORY,
        padding: '36px 32px',
        margin: '40px 0 8px 0',
      }}
    >
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: GOLD,
          margin: '0 0 6px 0',
        }}
      >
        {lang === 'th' ? 'สิบตัวเลขที่คุณจอยต้องกำหนด' : 'The 10 figures only you can set'}
      </p>
      <p
        style={{
          fontFamily: FONT_HEAD,
          fontSize: 'clamp(22px, 2.6vw, 28px)',
          fontWeight: 500,
          lineHeight: 1.25,
          color: IVORY,
          margin: '0 0 28px 0',
          fontStyle: 'italic',
          maxWidth: '54ch',
        }}
      >
        {lang === 'th'
          ? 'โครงสร้างพร้อมแล้ว ตัวเลขมาจากคุณจอย เมื่อกำหนดสิบตัวเลขนี้ โมเดลสร้างตัวเลขจริงสำหรับเฟส 1–3'
          : 'The structure is ready. The figures come from you. Once these ten are set, the model produces real numbers for phases 1–3.'}
      </p>
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '14px',
          counterReset: 'numz',
        }}
      >
        {NUMBERS.map((n, i) => (
          <li
            key={i}
            style={{
              counterIncrement: 'numz',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              padding: '14px 16px',
              background: 'rgba(246,241,231,0.05)',
              borderLeft: `2px solid ${GOLD}`,
            }}
          >
            <span
              aria-hidden
              style={{
                fontFamily: FONT_WORD,
                fontSize: '20px',
                fontWeight: 500,
                color: GOLD,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
                paddingTop: '2px',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: '13px',
                lineHeight: 1.55,
                color: IVORY,
              }}
            >
              {n[lang]}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
