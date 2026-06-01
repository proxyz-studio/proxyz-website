import type { Bilingual, Decision, DecisionStatus } from '../../abacuz/types';

export const DECISIONS: Decision[] = [
  // LOCKED
  {
    id: 'name',
    label: { th: 'ชื่อ + โดเมน — ABACUZ / abacuz.co', en: 'Name + domain — ABACUZ / abacuz.co' },
    status: 'locked',
    chapter: 1,
  },
  {
    id: 'register',
    label: {
      th: 'โทนแบรนด์ — อบอุ่น น่าเชื่อถือ พรีเมียม',
      en: 'Register — warm trust-premium',
    },
    status: 'locked',
    chapter: 1,
  },
  {
    id: 'palette',
    label: {
      th: 'พาเลตต์ — กรมท่า / ทอง / งาช้าง',
      en: 'Palette — navy / gold / ivory',
    },
    status: 'locked',
    chapter: 1,
  },
  {
    id: 'logo-dir',
    label: {
      th: 'ทิศทางโลโก้ — ลูกคิดสีทอง + serif คลาสสิก',
      en: 'Logo direction — gold abacus + classical serif',
    },
    status: 'locked',
    chapter: 1,
  },
  {
    id: 'fba',
    label: {
      th: 'โครงสร้างผู้ก่อตั้ง — ไทยทั้งคู่ ไม่มีปัญหา FBA',
      en: 'Founder structure — both Thai, zero FBA exposure',
    },
    status: 'locked',
    chapter: 7,
  },

  // NEEDS DISCUSSION (Tew + Joy together)
  {
    id: 'beachhead',
    label: {
      th: 'หัวหาด — นำด้วยลูกค้าต่างชาติ หรือ 50-50 จริง',
      en: 'Beachhead — expat-led vs true 50-50',
    },
    status: 'discuss',
    chapter: 3,
  },
  {
    id: 'cap-table',
    label: {
      th: 'สัดส่วนหุ้น + ทุน + ทริกเกอร์เต็มเวลา',
      en: 'Equity split + capital + full-time trigger',
    },
    status: 'discuss',
    chapter: 9,
  },
  {
    id: 'entity',
    label: {
      th: 'นิติบุคคล — บริษัทเฉพาะ หรือแผนกใน PROXYZ',
      en: 'Entity — dedicated Co Ltd vs PROXYZ division',
    },
    status: 'discuss',
    chapter: 7,
  },

  // WAITING FOR KHUN JOY (and/or Thai professional)
  {
    id: 'tfac',
    label: {
      th: 'TFAC + สถานะ CPA ของคุณจอย + เงื่อนไขนายจ้าง',
      en: 'TFAC + Khun Joy CPA status + employer conflict',
    },
    status: 'joy',
    chapter: 7,
  },
  {
    id: 'legal-wording',
    label: {
      th: 'ถ้อยคำ "LEGAL" — สำนักงานบัญชี ไม่ใช่สำนักงานกฎหมาย',
      en: 'Descriptor wording — "LEGAL" vs not a law firm',
    },
    status: 'joy',
    chapter: 7,
  },
  {
    id: 'pdpa-amlo',
    label: {
      th: 'PDPA + ขอบเขต AMLO/DNFBP',
      en: 'PDPA + AMLO/DNFBP scope',
    },
    status: 'joy',
    chapter: 7,
  },
  {
    id: 'numbers',
    label: {
      th: 'ตัวเลข 10 ค่า (ราคา ค่าตอบแทน ทริกเกอร์ ซอฟต์แวร์)',
      en: 'The 10 numbers (prices, draws, triggers, books baseline)',
    },
    status: 'joy',
    chapter: 8,
  },
];

export const STATUS_LABEL: Record<DecisionStatus, Bilingual> = {
  locked: { th: 'ล็อกแล้ว', en: 'Locked' },
  discuss: { th: 'ต้องคุยกัน', en: 'Needs discussion' },
  joy: { th: 'รอคุณจอย', en: 'Waiting on Joy' },
};

export const STATUS_COLOR: Record<DecisionStatus, string> = {
  locked: '#C9A24B',
  discuss: '#14253B',
  joy: '#A0623F', // a third warm tone — distinct from gold/navy without being garish
};
