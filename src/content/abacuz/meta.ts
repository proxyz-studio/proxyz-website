import type { Bilingual } from '../../abacuz/types';

export const META = {
  domain: 'abacuz.co',
  tagline: { th: 'บัญชีสะอาด ไม่มีเซอร์ไพรส์', en: 'Clean books. No surprises.' } as Bilingual,
  descriptor: { th: 'บัญชี · บริการนิติบุคคล', en: 'ACCOUNTING · CORPORATE SERVICES' } as Bilingual,
};

export const HERO: { greeting: Bilingual; lede: Bilingual; brief: Bilingual } = {
  greeting: {
    th: 'คุณจอย — นี่คือ ABACUZ',
    en: 'Khun Joy — this is ABACUZ',
  },
  lede: {
    th: 'งานวิจัยและออกแบบบริษัทรอบแรก ทั้งหมดในที่เดียว สำหรับคุณจอยอ่านและตัดสินใจ',
    en: 'The whole R&D round-one for the firm, in one place, for you to read and decide on.',
  },
  brief: {
    th: 'เก้าบท ตั้งแต่อัตลักษณ์ของแบรนด์ไปจนถึงตัวเลขจริง เนื้อหาสรุปจากเอกสารหกฉบับที่ส่งมอบเมื่อ 31 พฤษภาคม 2026 — ส่งมอบในเซสชั่นเดียววันเดียว ส่วนที่ล็อกแล้วระบุชัด ส่วนที่รอการตัดสินใจของคุณก็ระบุชัดเช่นกัน',
    en: 'Nine chapters, from brand identity to the real numbers. Distilled from the six deliverables we shipped on 31 May 2026 — produced in a single session, in a single day. What is locked says so. What is waiting on you says so too.',
  },
};

/* "One day" proof strip — timestamps from the actual 2026-05-31 session.
 * Order is the working sequence, not strict clock order; copies the rhythm of
 * the day so Khun Joy sees the cadence: brand → offers → ops → tech → legal →
 * finance, all within one session. */
export const PROOF_STRIP: { time: string; label: Bilingual }[] = [
  { time: '20:20', label: { th: 'อัตลักษณ์แบรนด์ v1', en: 'Brand identity v1' } },
  { time: '20:40', label: { th: 'บริการและราคาที่เปิดเผย v1', en: 'Offers + transparent pricing v1' } },
  { time: '21:00', label: { th: 'โครงสร้างการดำเนินงาน v1', en: 'Operations model v1' } },
  { time: '21:20', label: { th: 'สแต็กเทคโนโลยี v1', en: 'Tech stack v1' } },
  { time: '21:35', label: { th: 'กรอบกฎหมายและใบอนุญาต v1', en: 'Legal + licensing framework v1' } },
  { time: '21:50', label: { th: 'แบบจำลองการเงิน v1', en: 'Finance model v1' } },
];
