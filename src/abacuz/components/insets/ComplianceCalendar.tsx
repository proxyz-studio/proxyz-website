import type { Lang, Bilingual } from '../../types';
import { NAVY, STONE, INK, GOLD, RULE, FONT_HEAD, FONT_BODY, FONT_LABEL } from '../../theme';

const CAL_ROWS: { day: string; task: Bilingual }[] = [
  { day: '5', task: { th: 'รับเอกสารลูกค้า (LINE / อีเมล / พอร์ทัล)', en: 'Client docs collected (LINE / email / portal)' } },
  { day: '7', task: { th: 'ภาษีหัก ณ ที่จ่าย — ร่างและยื่น (ภ.ง.ด. 1 / 3 / 53)', en: 'Withholding tax drafted + filed (PND.1 / 3 / 53)' } },
  { day: '10', task: { th: 'ลงบัญชีเสร็จ · คิวตรวจของคุณจอยเปิด', en: 'Bookkeeping posted · Khun Joy review queue opens' } },
  { day: '15', task: { th: 'VAT (ภ.พ.30) ยื่น · ประกันสังคมยื่น · เงินเดือนเสร็จ', en: 'VAT (PP.30) filed · social security filed · payroll done' } },
  { day: '20', task: { th: 'Clear Statement ส่งให้ลูกค้า (สองภาษา · CPA เซ็น)', en: 'Clear Statement delivered (bilingual · CPA-signed)' } },
];

export function ComplianceCalendar({ lang }: { lang: Lang }) {
  return (
    <div
      style={{
        background: STONE,
        padding: '32px',
        margin: '40px 0 8px 0',
        border: `1px solid ${RULE}`,
      }}
    >
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: NAVY,
          margin: '0 0 6px 0',
        }}
      >
        {lang === 'th' ? 'ปฏิทินการปฏิบัติตามกฎรายเดือน' : 'The monthly compliance cycle'}
      </p>
      <p
        style={{
          fontFamily: FONT_HEAD,
          fontSize: 'clamp(20px, 2.4vw, 26px)',
          fontWeight: 500,
          lineHeight: 1.25,
          color: NAVY,
          margin: '0 0 22px 0',
          fontStyle: 'italic',
        }}
      >
        {lang === 'th'
          ? 'ทุกขั้นเป็นงานเกิดซ้ำใน StudioOS มีเจ้าของและตัวบล็อกชัดเจน'
          : 'Every step is a recurring task in StudioOS with an owner and a blocker.'}
      </p>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: FONT_BODY,
          fontSize: '15px',
          color: INK,
        }}
      >
        <tbody>
          {CAL_ROWS.map((r) => (
            <tr key={r.day} style={{ borderBottom: `1px solid ${RULE}` }}>
              <td
                style={{
                  width: '88px',
                  padding: '14px 0',
                  verticalAlign: 'top',
                  fontFamily: FONT_LABEL,
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  color: GOLD,
                  textTransform: 'uppercase',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {lang === 'th' ? `วันที่ ${r.day}` : `By day ${r.day}`}
              </td>
              <td style={{ padding: '14px 0', lineHeight: 1.55 }}>{r.task[lang]}</td>
            </tr>
          ))}
          <tr>
            <td
              style={{
                width: '88px',
                padding: '14px 0',
                verticalAlign: 'top',
                fontFamily: FONT_LABEL,
                fontSize: '11px',
                letterSpacing: '0.14em',
                color: GOLD,
                textTransform: 'uppercase',
              }}
            >
              {lang === 'th' ? 'ทุกไตรมาส' : 'Quarterly'}
            </td>
            <td style={{ padding: '14px 0', lineHeight: 1.55 }}>
              {lang === 'th'
                ? 'ลูกค้า advisory / CFO — นัดทบทวนกลยุทธ์'
                : 'Advisory / CFO clients — strategy check-in'}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: '88px',
                padding: '14px 0',
                verticalAlign: 'top',
                fontFamily: FONT_LABEL,
                fontSize: '11px',
                letterSpacing: '0.14em',
                color: GOLD,
                textTransform: 'uppercase',
              }}
            >
              {lang === 'th' ? 'ทุกปี' : 'Annually'}
            </td>
            <td style={{ padding: '14px 0', lineHeight: 1.55 }}>
              {lang === 'th'
                ? 'ภ.ง.ด.50 / 51 · เตรียมสอบบัญชี · งบการเงินตรวจสอบ · เซ็นรับรอง'
                : 'PND.50 / 51 · audit prep · audited financial statements · sign-off'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
