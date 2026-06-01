/* ABACUZ × PROXYZ — partner walkthrough.
 *
 * Route: /pipeline/abacuz — partner-gated via <PartnerGate partner="abacuz">.
 *
 * Purpose: present the full ABACUZ R&D corpus (six bilingual deliverables
 * shipped 2026-05-31) as a single editorial walkthrough Khun Joy can scroll
 * through and decide from. Bilingual (Thai default, English available); no
 * forms, no backend, no portrait photo — pure static React.
 *
 * Design surface is ABACUZ brand (Ledger Navy / Abacus Gold / Ivory), NOT
 * PROXYZ pink. PROXYZ chrome (Nav, Footer) frames it.
 *
 * Nine chapters, each distilled from one shipped deliverable:
 *   01 Welcome           ← 03-brand/...identity-direction-v1
 *   02 The Market        ← 01-research/...market-research-v1
 *   03 The Strategy      ← 02-strategy/...strategy-summary-v1
 *   04 The Offers        ← 04-go-to-market/...offers-and-pricing-v1
 *   05 How It Runs       ← 05-operations/...operations-model-v1
 *   06 The Tech          ← 07-tech-stack/...tech-stack-v1
 *   07 Legal Framework   ← 08-legal/...legal-entity-licensing-v1
 *   08 The Numbers       ← 06-finance/...finance-model-v1
 *   09 The Partnership   ← 00-partnership/...partnership-frame-v1
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import PartnerGate from '../components/PartnerGate';
import Footer from '../sections/Footer';

/* ─── Brand tokens (ABACUZ) ───────────────────────────────────────── */
const NAVY = '#14253B';      // Ledger Navy — anchor
const GOLD = '#C9A24B';      // Abacus Gold — accent
const IVORY = '#F6F1E7';     // dominant warm ground
const STONE = '#E7DECB';     // warm stone — section blocks
const INK = '#1C2433';       // body text (navy-black)
const RULE = 'rgba(28,36,51,0.14)';

const FONT_WORD = "'Cinzel', 'Cormorant Garamond', serif";
const FONT_HEAD = "'Cormorant Garamond', 'Noto Serif Thai', serif";
const FONT_HEAD_TH = "'Noto Serif Thai', 'Cormorant Garamond', serif";
const FONT_BODY = "'Hanken Grotesk', 'IBM Plex Sans Thai', system-ui, sans-serif";
const FONT_LABEL = "'Hanken Grotesk', 'IBM Plex Mono', monospace";

/* ─── Language toggle ─────────────────────────────────────────────── */
type Lang = 'th' | 'en';
type Bilingual = { th: string; en: string };
type BilingualList = { th: string[]; en: string[] };

/* ─── Content ─────────────────────────────────────────────────────── */

const META = {
  domain: 'abacuz.co',
  tagline: { th: 'บัญชีสะอาด ไม่มีเซอร์ไพรส์', en: 'Clean books. No surprises.' } as Bilingual,
  descriptor: 'ACCOUNTING · LEGAL · BUSINESS CONSULTING',
};

const HERO: { greeting: Bilingual; lede: Bilingual; brief: Bilingual } = {
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
const PROOF_STRIP: { time: string; label: Bilingual }[] = [
  { time: '20:20', label: { th: 'อัตลักษณ์แบรนด์ v1', en: 'Brand identity v1' } },
  { time: '20:40', label: { th: 'บริการและราคาที่เปิดเผย v1', en: 'Offers + transparent pricing v1' } },
  { time: '21:00', label: { th: 'โครงสร้างการดำเนินงาน v1', en: 'Operations model v1' } },
  { time: '21:20', label: { th: 'สแต็กเทคโนโลยี v1', en: 'Tech stack v1' } },
  { time: '21:35', label: { th: 'กรอบกฎหมายและใบอนุญาต v1', en: 'Legal + licensing framework v1' } },
  { time: '21:50', label: { th: 'แบบจำลองการเงิน v1', en: 'Finance model v1' } },
];

/* ─── Decisions (the sticky tracker) ──────────────────────────────── */

type DecisionStatus = 'locked' | 'discuss' | 'joy';

type Decision = {
  id: string;
  label: Bilingual;
  status: DecisionStatus;
  chapter: number; // 1..9
};

const DECISIONS: Decision[] = [
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

const STATUS_LABEL: Record<DecisionStatus, Bilingual> = {
  locked: { th: 'ล็อกแล้ว', en: 'Locked' },
  discuss: { th: 'ต้องคุยกัน', en: 'Needs discussion' },
  joy: { th: 'รอคุณจอย', en: 'Waiting on Joy' },
};

const STATUS_COLOR: Record<DecisionStatus, string> = {
  locked: GOLD,
  discuss: NAVY,
  joy: '#A0623F', // a third warm tone — distinct from gold/navy without being garish
};

/* ─── Chapters ────────────────────────────────────────────────────── */

type Chapter = {
  num: string; // "01" .. "09"
  id: string;  // slug for anchor + nav
  title: Bilingual;
  source: Bilingual; // small line under the title
  eyebrow: Bilingual;
  pull?: Bilingual; // optional pull-quote highlight
  body: BilingualList; // array of paragraphs
  closing?: Bilingual; // small italic closing line
  inset?: 'compliance-calendar' | 'number-checklist'; // optional inline component
};

const CHAPTERS: Chapter[] = [
  /* 01 — WELCOME ────────────────────────────────────────────────── */
  {
    num: '01',
    id: 'welcome',
    eyebrow: { th: 'บทที่ 1 · ยินดีต้อนรับ', en: 'Chapter 1 · Welcome' },
    title: { th: 'ลูกคิดที่โปร่งใส', en: 'The transparent abacus' },
    source: { th: 'จาก 03-brand · ทิศทางอัตลักษณ์ v1', en: 'From 03-brand · identity direction v1' },
    pull: {
      th: 'ABACUZ คือบริษัทที่คุณเห็นทุกตัวเลขได้',
      en: 'ABACUZ is the firm where you can see every number.',
    },
    body: {
      th: [
        'ชื่อ ABACUZ มาจากคำว่า "abacus" (ลูกคิด) ผสมตัว Z อันเป็นลายเซ็นของสตูดิโอ (เช่นเดียวกับ PROXYZ, MAGNIZ, AUTOLOOM) สื่อถึงรากของการนับและการบัญชี จำง่าย และโดดเด่นพอที่จะเลี่ยงเครื่องหมายการค้าคำว่า "Abacus" ที่มีผู้ใช้จำนวนมาก โดเมน abacuz.co จดทะเบียนแล้ว',
        'การตีความที่เราเป็นเจ้าของคือ ลูกคิด = บัญชีแยกประเภทที่โปร่งใสตั้งแต่ต้นกำเนิด เม็ดทุกเม็ดมองเห็นได้ ใครก็ตรวจนับได้ ไม่มีอะไรซ่อนในกล่องดำ ตรงกับคำมั่นของเราในตลาดที่ปิดบังตัวเลข — ราคาที่เปิดเผย บัญชีที่สะอาด ไม่มีอะไรซ่อนเร้น',
        'โทนภาพคืออบอุ่น น่าเชื่อถือ พรีเมียม — กรมท่า + ทอง + งาช้าง ไม่ใช่โทนเทา-ฟ้าเย็นชาแบบ Big Four และไม่เป็นโทน editorial-dark ของ PROXYZ ตัวอักษรเป็น Cinzel + Cormorant Garamond + Hanken Grotesk คู่กับ Noto Serif Thai สำหรับภาษาไทย',
        'ชิ้นงานเอกลักษณ์ของแบรนด์มีสองชิ้น: Clear Statement (สรุปประจำเดือนสองภาษา เซ็นรับรองโดย CPA ส่งภายในวันที่ 20 ของทุกเดือน) และ Published Price List (ตารางราคาที่เปิดเผย) ทั้งสองทำให้คำมั่น "คุณเห็นทุกตัวเลขได้" เป็นจริง',
      ],
      en: [
        'ABACUZ is the real word "abacus" with the studio Z (alongside PROXYZ, MAGNIZ, AUTOLOOM). It carries counting and accounting heritage, it is memorable, and the Z makes it distinctive while dodging the crowded "Abacus" trademark field. The abacuz.co domain is registered.',
        'The reading we own: the abacus is the original transparent ledger. Every bead in plain sight; anyone can check the count. Nothing hidden inside a black box. That is exactly the promise in a market that hides its numbers — published prices, clean books, nothing buried.',
        'The visual register is warm, trustworthy, premium — navy plus gold plus warm ivory. Deliberately not the cold grey-blue of a Big Four firm, and deliberately distinct from PROXYZ editorial-dark. Type is Cinzel plus Cormorant Garamond plus Hanken Grotesk, paired with Noto Serif Thai for Thai.',
        'The brand carries two signature artifacts: the Clear Statement (a monthly bilingual plain-language summary, CPA-signed, delivered by day 20) and the Published Price List. Both make the promise — "every number, in plain sight" — literal.',
      ],
    },
    closing: {
      th: 'การออกแบบโลโก้ขั้นสุดท้าย (เวกเตอร์) และการตรวจเครื่องหมายการค้ายังเหลืออยู่ — ทิศทางล็อก งานเก็บละเอียดยังเปิด',
      en: 'Final logo artwork (vectorised) and the trademark check are still open — direction locked, finishing pass open.',
    },
  },

  /* 02 — THE MARKET ─────────────────────────────────────────────── */
  {
    num: '02',
    id: 'market',
    eyebrow: { th: 'บทที่ 2 · ตลาด', en: 'Chapter 2 · The Market' },
    title: { th: 'ช่องว่างที่ยังไม่มีใครยึด', en: 'The lane no one owns' },
    source: { th: 'จาก 01-research · งานวิจัยตลาดบัญชีและกฎหมายไทย v1', en: 'From 01-research · Thailand accounting + legal market v1' },
    pull: {
      th: 'ไม่มีบริษัทไทยที่ผสมประสิทธิภาพ AI + ราคาเปิดเผย + บัญชีและงานนิติบุคคลใต้หลังคาเดียว + ภาษาอังกฤษ-ไทย เข้าด้วยกัน',
      en: 'No Thai firm combines AI efficiency + published pricing + accounting plus corporate-legal under one roof + bilingual service.',
    },
    body: {
      th: [
        'งานวิจัยห้าทีมขนาน (ใช้แหล่งข้อมูลฟรี ค่าใช้จ่ายภายนอกเป็นศูนย์) พบว่าทฤษฎีเดิมของเราถูกต้อง — ตลาดบริการบัญชีและกฎหมายของ SMB ไทยเป็นแบบ manual ปิดบัง และช้า — พร้อมการแก้ไขสองข้อที่ทำให้ทฤษฎีแข็งแกร่งขึ้น ไม่ใช่อ่อนลง',
        'แก้ไขข้อที่หนึ่ง — มูทไม่ใช่ AI ชั้น AI กลายเป็นมาตรฐาน (FlowAccount, PEAK เปิดให้ทุกคน) มูทที่ทนทานคือใบอนุญาต CPA ของคุณจอย ความเชี่ยวชาญของไทย และความเชื่อใจ AI เป็นเครื่องยนต์ที่ช่วยให้ทีมเล็กรับลูกค้าได้ 3-4 เท่าของบริษัททั่วไป ไม่ใช่จุดขาย',
        'แก้ไขข้อที่สอง — ฝั่งกฎหมายง่ายกว่าที่กลัว เพราะผู้ก่อตั้งทั้งสองเป็นคนไทยและงาน "กฎหมาย" ของ SMB ส่วนใหญ่ไม่ใช่งานในศาล ABACUZ จึงให้บริการฝ่ายกฎหมายเป็นบริการงานนิติบุคคลแบบแพ็กเกจได้ — โดยไม่ต้องมีทนายในบริษัท คดีความเท่านั้นที่ส่งต่อทนายที่มีใบอนุญาต',
        'ความต่างของราคาแต่ละทีรีถึง 5-10 เท่าสำหรับงานปฏิบัติตามกฎที่คล้ายกัน และแทบไม่มีบริษัทไหนเปิดเผยราคา — Acclime กับ Plizz เป็นสองรายเดียว ช่องว่างนี้คือเวจของเรา จุดหักเหที่คมที่สุดในงานวิจัยคือ "nominee-shareholder trap" ในตลาดต่างชาติ — ลูกค้าต่างชาติถูกจัดให้อยู่ในโครงสร้างเสี่ยงและถือความรับผิดทางอาญา บริษัทที่เป็น CPA จริง + งานนิติบุคคลสะอาด + ภาษาอังกฤษ + โปร่งใส คือคำตอบเชิงโครงสร้างต่อบาดแผลความเชื่อใจที่ใหญ่ที่สุดในกลุ่มนั้น',
      ],
      en: [
        'Five parallel research beams (free sources only, $0 external) confirmed our thesis — the Thai SMB accounting + legal market is manual, opaque, and slow — with two corrections that make the thesis stronger.',
        'Correction one — AI is not the moat. The AI layer is commoditising (FlowAccount, PEAK are universal). The durable moat is Khun Joy\'s CPA license, Thai expertise, and client trust. AI is the multiplier that lets a thin team carry 3 to 4× the normal client load, not the billboard.',
        'Correction two — the legal half is easier than feared. Because both founders are Thai and most SMB "legal" work is non-courtroom, ABACUZ can deliver the legal arm as a productized corporate-services line with no lawyer in the firm. A licensed lawyer is needed only for litigation.',
        'The pricing spread is 5 to 10× for nominally similar compliance work, and almost nobody publishes pricing — Acclime and Plizz are the only two who do. That gap is our wedge. The sharpest single opportunity surfaced is the nominee-shareholder liability trap in the expat market: foreigners placed into risky structures by past advisors who now carry criminal exposure. A firm that is a real CPA plus clean corporate-legal plus English plus transparent is the structural answer to the biggest trust wound in that segment.',
      ],
    },
    closing: {
      th: 'รายละเอียดและแหล่งข้อมูลทั้งหมด: 01-research/2026-05-31-abacuz-thailand-accounting-legal-market-research-v1.md',
      en: 'Full sources and detail: 01-research/2026-05-31-abacuz-thailand-accounting-legal-market-research-v1.md',
    },
  },

  /* 03 — THE STRATEGY ──────────────────────────────────────────── */
  {
    num: '03',
    id: 'strategy',
    eyebrow: { th: 'บทที่ 3 · กลยุทธ์', en: 'Chapter 3 · The Strategy' },
    title: { th: 'ความเชื่อใจ + ความโปร่งใส คือเครื่องยนต์', en: 'Trust + transparency is the engine' },
    source: { th: 'จาก 02-strategy · สรุปกลยุทธ์ v1', en: 'From 02-strategy · strategy summary v1' },
    pull: {
      th: 'AI เป็นเครื่องยนต์ที่ทำให้ทีมเล็กทำงานเท่าทีมใหญ่ ไม่ใช่จุดขาย',
      en: 'AI is the quiet engine that lets a small team do the work of a big one, not the sales pitch.',
    },
    body: {
      th: [
        'งานวิจัยตอบสองห่วงใหญ่ที่สุดของเราแล้ว (ใบอนุญาตและกฎการถือครองของต่างชาติ) เปิดทางให้เรานำด้วยลูกค้าต่างชาติ-Phuket เป็นฐาน (อัตรากำไรสูงกว่า, ช่องว่างความเชื่อใจคม, ช่องทางออนไลน์เข้าถึงได้ทั่วโลก) ในขณะที่ฐานลูกค้า SMB ไทยของคุณจอยเป็นฐานอุ่นบน LINE ตั้งแต่วันแรก ด้วยคำมั่น "บัญชีสะอาด ไม่มีเซอร์ไพรส์"',
        'การให้บริการเป็น remote ทั่วประเทศ บริษัทดำเนินการบน Studio OS + ระบบอัตโนมัติ + ทีมงานบาง ๆ โดยที่คุณจอยอยู่ในคิวตรวจและเซ็นรับรอง — ไม่ใช่ในการทำบัญชีรายวัน',
        'จุดขายคือความเชื่อใจและความโปร่งใส ไม่ใช่ "AI" ขอบเขตของเราคือ "บริษัทบัญชีและงานนิติบุคคลที่โปร่งใส ไม่ใช่สำนักงานกฎหมาย" — งานบริการนิติบุคคลทั้งหมดเราทำเอง คดีความส่งต่อทนายที่มีใบอนุญาต ฝ่ายตรวจสอบกฎหมายจะยืนยันถ้อยคำที่แน่นอนก่อนเผยแพร่',
        'ความเสี่ยงที่ซื่อสัตย์: เพดานรายได้ของแต่ละเฟสคือชั่วโมงตรวจของคุณจอย ตราบใดที่ทำพาร์ทไทม์ เราเติบโตได้แค่เท่าที่ตรวจอย่างถูกต้อง และวางแผนจ้างผู้ตรวจสอบคนที่สองเมื่อขยาย ข้อมูลส่วนตัว (PDPA) จัดการอย่างละเอียด และเราจะยืนยันรายละเอียดใบอนุญาตทุกข้อกับผู้เชี่ยวชาญไทยก่อนดำเนินการ',
      ],
      en: [
        'The research closed our two biggest worries (the licensing question and the foreign-ownership question) and opens the lane: lead with foreign-owned, Phuket-anchored (higher margin, sharp trust gap, globally-reachable channels), with Khun Joy\'s Thai-SMB clients as a warm base on LINE from day one, under a "clean books, no surprises" promise.',
        'Delivery is remote and nationwide. The firm runs on Studio OS, automation, and a thin staff layer, with Khun Joy on review and sign-off — not on the day-to-day bookkeeping.',
        'The edge is trust and transparency, not "AI." Our scope is a transparent accounting and corporate-services firm, not a law firm — we do all the corporate-services work ourselves, court cases are referred to a licensed lawyer, and the legal review will confirm the exact wording before we publish.',
        'Honest risk: the firm\'s capacity is capped by Khun Joy\'s review hours while she is part-time, so we grow only as fast as we can review work properly, and we plan for the second senior reviewer as we scale. Client data privacy (PDPA) is handled carefully, and we confirm every Thai licensing detail with a professional before acting.',
      ],
    },
  },

  /* 04 — THE OFFERS ────────────────────────────────────────────── */
  {
    num: '04',
    id: 'offers',
    eyebrow: { th: 'บทที่ 4 · บริการ', en: 'Chapter 4 · The Offers' },
    title: { th: 'เปิดเผยทุกราคา', en: 'Published, packaged, no surprises' },
    source: { th: 'จาก 04-go-to-market · บริการและราคาที่เปิดเผย v1', en: 'From 04-go-to-market · offers + pricing v1' },
    pull: {
      th: 'ในตลาดที่ปิดบังราคา เราเปิดเผยราคา',
      en: 'In a market that hides its prices, we publish them.',
    },
    body: {
      th: [
        'ทุกความสัมพันธ์เริ่มจาก "ตรวจสุขภาพบริษัทฟรี" — รายงานภาษาเข้าใจง่ายว่าอะไรสะอาด อะไรเสี่ยง และมีค่าใช้จ่ายเท่าไรในการแก้ สำหรับเจ้าของต่างชาติเผยให้เห็นความเสี่ยงโครงสร้าง nominee สำหรับ SMB ไทยเผยให้เห็นบัญชีที่ยุ่งและการยื่นที่ตกหล่น',
        'แผนผังบริการจัดเป็นสามเสาหลัก: (A) บัญชีและภาษี — ทำบัญชี VAT/WHT เงินเดือน งบประจำปี การเซ็นรับรอง CPA; (B) งานนิติบุคคลและกฎหมาย — จดทะเบียนบริษัท ใบอนุญาตทำงาน วีซ่า BOI เครื่องหมายการค้า สัญญาภายในขอบเขตที่ปรึกษา (คดีความส่งต่อ); (C) Fractional CFO — ที่ปรึกษาการเงิน วางแผน การระดมทุน ตลาดไม่มีใครเปิดราคาส่วนนี้ เราจะเปิดเผย',
        'ผลิตภัณฑ์ทางเข้าสองตัว: "Start Right in Thailand" สำหรับเจ้าของต่างชาติ (จัดตั้ง + การปฏิบัติตามปีแรก + วีซ่า/ใบอนุญาตทำงานเลือกได้) และ "บัญชีรายเดือนที่สะอาด" บน LINE สำหรับ SMB ไทย พร้อม Clear Statement ทุกเดือน',
        'แผนรายเดือนเป็นขั้นที่เปิดเผย (Starter / Growing / Established) แบ่งตามขอบเขตงานจริง ไม่ใช่ต่อที่นั่ง บริการภาษาอังกฤษมีพรีเมียมที่ระบุชัดเจน (งานวิจัยพบว่างานภาษาอังกฤษมีราคาสูงกว่า 5-10 เท่า) ค่าธรรมเนียมราชการส่งผ่านตามจริงและแสดงแยก ทุกใบเสนอราคาและใบแจ้งหนี้สองภาษา ทุกราคารอคุณจอยกำหนดจากอัตราตลาดที่เห็นและต้นทุนการให้บริการ',
      ],
      en: [
        'Every relationship starts with a free Company Health Check — a plain-language report on what is clean, what is at risk, and what it costs to fix. For foreign owners, it surfaces the nominee structure risk many were placed in. For Thai SMBs, messy books and missed filings.',
        'The offer map is three pillars: (A) Accounting & Tax — bookkeeping, VAT/WHT, payroll, annual statements, CPA sign-off; (B) Corporate & Legal Services — formation, work permits, visas, BOI, trademarks, contracts within the advisory boundary (litigation referred); (C) Fractional CFO — financial modelling, budgeting, fundraising support. Nobody in the market publishes a price for fractional CFO. We will.',
        'Two entry products: "Start Right in Thailand" for foreign owners (formation + first-year compliance + optional visa/work permit) and "Clean Monthly Accounting" on LINE for Thai SMBs, with a Clear Statement delivered every month.',
        'Recurring plans are published tiers (Starter / Growing / Established), packaged by real scope (transactions, entities, payroll headcount), not per-seat. The English-service premium is named explicitly (research found English work commands a 5 to 10× premium). Government fees pass through at cost and are shown separately. Every quote and invoice is bilingual. The figures all wait on you — set from real market rates and your cost to deliver.',
      ],
    },
  },

  /* 05 — HOW IT RUNS ───────────────────────────────────────────── */
  {
    num: '05',
    id: 'ops',
    eyebrow: { th: 'บทที่ 5 · การดำเนินงาน', en: 'Chapter 5 · How It Runs' },
    title: { th: 'บริษัทที่ไม่พึ่งชั่วโมงผู้ก่อตั้ง', en: 'A firm that doesn\'t depend on either founder\'s hours' },
    source: { th: 'จาก 05-operations · โครงสร้างการดำเนินงาน v1', en: 'From 05-operations · operations model v1' },
    pull: {
      th: 'งานเดียวกันผ่านสามชั้น: ระบบอัตโนมัติ → พนักงาน → คุณจอย (CPA เซ็น)',
      en: 'The same task moves through three layers: automation → staff → Khun Joy (CPA sign-off).',
    },
    body: {
      th: [
        'กฎข้อเดียว: บริษัทไม่พึ่งชั่วโมงทำงานของผู้ก่อตั้งคนใดคนหนึ่ง ทั้งคู่พาร์ทไทม์โดยพื้นฐาน คำตอบทั่วไปคือเลือกระหว่างทำเต็มเวลาหรือยอมรับเพดานเล็ก เราตอบไม่เหมือนกัน — ระบบอัตโนมัติ + Studio OS + ทีมงานบางรับภาระงาน ส่วนเวลาของคุณจอยถูกเก็บไว้สำหรับสิ่งที่มีเพียงคุณจอยทำได้ คือการตรวจสอบและเซ็นรับรอง',
        'สามชั้น — ชั้น 1 ระบบอัตโนมัติ: รับเอกสาร จำแนกประเภท ติดตามกำหนดเวลา ร่าง สื่อสารสถานะ ร่าง Clear Statement ฉบับแรก; ชั้น 2 พนักงาน (พนักงานบัญชี + ผู้ประสานงาน): ตรวจผลของระบบ ตัดสินใจกรณีกำกวม ร่างการยื่น จัดแฟ้มให้พร้อมตรวจ; ชั้น 3 คุณจอย (CPA): เซ็นรับรอง สอบบัญชี ที่ปรึกษา/CFO ทุกอย่างที่ใช้ชื่อใบอนุญาต ไม่มีสิ่งใดที่คุณจอยเซ็นออกจากบริษัทโดยไม่ผ่านการตรวจของคุณจอย',
        'รอบรายเดือนขับเคลื่อนด้วยปฏิทินการปฏิบัติตามกฎของไทย Studio OS เก็บปฏิทินกลาง งานยิงอัตโนมัติต่อลูกค้า (ดูข้างล่าง) Clear Statement ถูกส่งภายในวันที่ 20 ของทุกเดือน — นี่ไม่ใช่บริการเสริม แต่เป็นพิธีกรรมความไว้วางใจ',
        'ตัวเลขสำคัญที่สุดเชิงปฏิบัติคือเพดานความสามารถในการตรวจสอบของคุณจอย — กี่รายต่อสัปดาห์ที่คุณจอยเซ็นรับรองได้อย่างถูกต้องในขณะพาร์ทไทม์ เมื่อกำหนดเพดานแล้ว เราติดตามการใช้งานรายสัปดาห์ การขายชะลอเมื่อใกล้เพดาน และเปิดรับสมัครผู้ตรวจสอบคนที่สองเมื่อใกล้ถึง',
      ],
      en: [
        'One rule: the firm does not depend on either founder\'s hours. Both founders are part-time by default. The conventional answer is to either go full-time or accept a small ceiling. We answer differently — automation plus Studio OS plus a thin staff layer carries the volume, and Khun Joy\'s time is preserved for the one thing only she can do: review and CPA sign-off.',
        'Three layers — Layer 1 Automation: intake, classification, deadline tracking, draft generation, status communication, the Clear Statement first draft. Layer 2 Staff (bookkeepers + coordinator): verifying automation\'s output, judgment calls on ambiguous transactions, draft filings, preparing the file for review. Layer 3 Khun Joy (CPA): sign-off, audit, advisory/CFO, anything that bears her licensed name. Nothing she signs leaves the firm without her review.',
        'The monthly cycle is calendar-driven by Thai compliance. Studio OS holds the master calendar; tasks fire automatically per client (see calendar below). The Clear Statement is delivered by day 20 of every month — not a courtesy, but the trust ritual.',
        'The single most important operational number is Khun Joy\'s review-capacity cap — how many clients you can review properly per week while part-time. Once set in writing, Studio OS tracks utilisation weekly; sales pacing slows as we near it; we open the second reviewer search before quality slips.',
      ],
    },
    inset: 'compliance-calendar',
  },

  /* 06 — THE TECH ──────────────────────────────────────────────── */
  {
    num: '06',
    id: 'tech',
    eyebrow: { th: 'บทที่ 6 · เทคโนโลยี', en: 'Chapter 6 · The Tech' },
    title: { th: 'Studio OS ประสาน ไม่แทนที่', en: 'Studio OS orchestrates, never replaces' },
    source: { th: 'จาก 07-tech-stack · สแต็กเทคโนโลยี v1', en: 'From 07-tech-stack · tech stack v1' },
    pull: {
      th: 'ไม่สร้างสิ่งที่ใช้งานได้แล้ว ทุกอย่างมีฉบับภาษาไทย',
      en: 'Never build what already works. Everything has a Thai-language fallback.',
    },
    body: {
      th: [
        'ABACUZ ทำงานบนสี่ชั้น: Studio OS (ประสาน workspace ต่อลูกค้า ปฏิทินการปฏิบัติตามกฎ คิวตรวจ แม่แบบสองภาษา) + ระบบบัญชี (FlowAccount เป็นมาตรฐาน SMB ไทย, Xero เสนอให้ลูกค้าต่างชาติ — คุณจอยยืนยัน) + พอร์ทัลของรัฐ (RD e-Filing, e-Withholding Tax, สปส., DBD, BOI) + ช่องทาง (LINE OA @abacuz, อีเมล Google Workspace, พอร์ทัลลูกค้า Studio OS)',
        'AI ทำงานจริงในหกจุด: จำแนกรายการ bank-feed/statement, จำแนกเอกสารขาเข้า, ระบบแปลสองภาษา (ตัดด้วย glossary คำศัพท์ภาษี), ร่าง Clear Statement, ข้อความสถานะรายเดือนบน LINE/อีเมล, และ Ask AI ภายในสำหรับสอบถามคู่มือบริษัท ไม่มีสิ่งที่ AI สร้างออกจากบริษัทโดยไม่ผ่านมนุษย์ — ชื่อ CPA ที่มีใบอนุญาตคือทรัพย์สิน',
        'ช่องว่างที่ซื่อสัตย์: bank feeds ในไทย KBank มี API ที่ใช้ได้ ที่เหลือส่วนใหญ่เป็น CSV/PDF เราใช้การนำเข้า statement ด้วย AI ช่วย (Claude อ่าน statement จำแนกบรรทัด พนักงานยืนยัน) เร็วกว่ามือทั้งหมด ซื่อสัตย์ว่าไม่ใช่เวทมนตร์',
        'ความปลอดภัย: SSO ผ่าน Google Workspace 2FA บังคับ ทุกที่ การเข้าถึงตามความจำเป็น เข้ารหัสในการส่งและจัดเก็บ 1Password สำหรับ credentials ที่ใช้ร่วมกัน สำรอง workspace รายวัน เอกสารสำเนาที่ Google Drive วินัย PDPA ตรวจสอบได้ที่นี่',
      ],
      en: [
        'ABACUZ runs on four layers: Studio OS (orchestration — one workspace per client, the compliance calendar, the review queue, bilingual templating) plus the books layer (FlowAccount as the Thai-SMB standard, Xero offered for foreign-owned clients — Khun Joy confirms) plus government portals (RD e-Filing, e-Withholding Tax, SSO, DBD, BOI) plus channels (LINE OA @abacuz, Google Workspace email, the Studio OS client portal).',
        'AI does real work in six specific places: bank-feed and statement categorisation, document intake classification, the bilingual translation pipeline (glossary-locked on tax terms), the Clear Statement draft, monthly LINE and email status messages, and an internal Ask AI for company-playbook queries. Nothing AI-generated leaves the firm without human review — the CPA\'s licensed name is the asset.',
        'The honest gap: bank feeds in Thailand. KBank has a usable API, most others are CSV/PDF. We use AI-assisted statement import (Claude reads the statement, categorises lines, staff verifies). Faster than full manual; honest about not being magic.',
        'Security: Google Workspace SSO, 2FA required everywhere, need-to-know access, encryption in transit and at rest, 1Password for shared credentials, daily Studio OS workspace backups, documents mirrored to Google Drive. PDPA discipline is auditable here.',
      ],
    },
  },

  /* 07 — LEGAL FRAMEWORK ───────────────────────────────────────── */
  {
    num: '07',
    id: 'legal',
    eyebrow: { th: 'บทที่ 7 · กฎหมาย', en: 'Chapter 7 · Legal Framework' },
    title: { th: 'โครงสร้างคำถามสำหรับผู้เชี่ยวชาญไทย', en: 'A structure for the Thai professional to confirm' },
    source: { th: 'จาก 08-legal · กรอบกฎหมาย v1', en: 'From 08-legal · legal & licensing framework v1' },
    pull: {
      th: 'ไม่มีสิ่งใดในเอกสารนี้คือคำแนะนำทางกฎหมาย ทุกรายการ "ยืนยัน" ต้องให้ผู้เชี่ยวชาญไทยรับรองก่อนเราดำเนินการ',
      en: 'Nothing here is legal advice. Every "CONFIRM" item needs a Thai-licensed advisor\'s sign-off before we act.',
    },
    body: {
      th: [
        'นิติบุคคล: บริษัทจำกัด (บริษัทจำกัด) ถือหุ้นข้างมากโดยคนไทย — Tew + คุณจอย ทั้งคู่เป็นคนไทย → ไม่มีปัญหา FBA เลย ตัดสินใจย่อยที่ยังเปิดอยู่: นิติบุคคลแยกสำหรับ ABACUZ (แนะนำเพื่อบัญชีและทุนสะอาด) เทียบกับแผนกใต้นิติบุคคล PROXYZ ที่มีอยู่ ชุด PROXYZ-Co-Registration นำมาใช้ซ้ำได้ตรงๆ สำหรับการจดทะเบียน',
        'CPA + TFAC: รายการที่สำคัญที่สุดในเอกสารทั้งเล่ม ต้องยืนยันกับที่ปรึกษาที่รู้ TFAC สี่ข้อ: (1) ABACUZ ตามขอบเขตปัจจุบันต้องจดทะเบียนเป็นสำนักงานสอบบัญชีกับ TFAC หรือไม่ หรือทริกเกอร์โดยปริมาณ; (2) เพดานการถือครอง CPA สำหรับกิจกรรมที่เราตั้งใจ; (3) สถานะ CPA ปัจจุบันของคุณจอย เงื่อนไข วันต่ออายุ การปฏิบัติตาม CPE; (4) กฎ dual-engagement / ความขัดแย้งกับนายจ้างที่ใช้กับ CFO เต็มเวลาที่ถือหุ้นในสำนักงาน CPA',
        'ขอบเขตกฎหมาย/นิติบุคคล: กลยุทธ์ระบุชัดว่า ABACUZ เป็น "บริษัทบัญชีและงานนิติบุคคลที่โปร่งใส ไม่ใช่สำนักงานกฎหมาย" คำบรรยาย "LEGAL · ACCOUNTING · BUSINESS CONSULTING" ต้องไม่สื่อถึงการประกอบวิชาชีพกฎหมายที่เราไม่มีใบอนุญาต ตรวจสอบกฎหมายจะยืนยันถ้อยคำ — นำด้วย "บัญชี" หรือนุ่มลงเป็น "Corporate & Legal Services" — ก่อนเผยแพร่ คดีความส่งต่อทนายที่มีใบอนุญาตเสมอ',
        'PDPA + AMLO/DNFBP: ทุกลูกค้ามีการ KYC และยืนยัน UBO บันทึกเก็บไว้ ห้ามถือเงินลูกค้า ค่าธรรมเนียมราชการเคลื่อนจากลูกค้าโดยตรง ธุรกรรมที่น่าสงสัยรายงานต่อ AMLO ภายใน 7 วัน ประกาศ PDPA สองภาษาเผยแพร่ก่อนเปิด ทั้งคู่ต้องการการยืนยันถ้อยคำกับทนายไทย ประกัน PI ของ ABACUZ เองเป็นรายการอื่น',
      ],
      en: [
        'Entity: Thai Co Ltd (บริษัทจำกัด), Thai-majority ownership — Tew and Khun Joy are both Thai → zero FBA exposure. Open sub-decision: dedicated entity for ABACUZ (recommended for clean accounting + capital) vs a division under an existing PROXYZ entity. The PROXYZ-Co-Registration kit is directly reusable for the mechanics.',
        'CPA + TFAC: the single most load-bearing item. Four things to confirm with a TFAC-aware advisor: (1) whether ABACUZ as currently scoped must register as a TFAC audit firm, or whether registration is gated on volume; (2) the CPA-ownership threshold for the activities we intend; (3) Khun Joy\'s live CPA status — current standing, conditions, renewal date, CPE compliance; (4) any dual-engagement / employer-conflict rules that apply because Khun Joy is a full-time CFO elsewhere.',
        'Legal / corporate-services boundary: the strategy is careful — ABACUZ is a transparent accounting + corporate-services firm, NOT a law firm. The descriptor "LEGAL · ACCOUNTING · BUSINESS CONSULTING" must not imply licensed legal practice we cannot perform. The legal review will confirm the wording — lead with Accounting or soften to "Corporate & Legal Services" — before anything is published. Litigation is always referred.',
        'PDPA + AMLO/DNFBP: every client KYC\'d and UBO-verified, records kept, never hold client funds (government fees move directly from the client), suspicious transactions reported to AMLO within 7 days, bilingual privacy notice published before launch. Both need final wording from the Thai lawyer. PI insurance for ABACUZ itself is a separate line.',
      ],
    },
  },

  /* 08 — THE NUMBERS ───────────────────────────────────────────── */
  {
    num: '08',
    id: 'numbers',
    eyebrow: { th: 'บทที่ 8 · ตัวเลข', en: 'Chapter 8 · The Numbers' },
    title: { th: 'ตัวเลขสิบค่าที่คุณจอยต้องกำหนด', en: 'The ten figures only you can set' },
    source: { th: 'จาก 06-finance · แบบจำลองการเงิน v1', en: 'From 06-finance · finance model v1' },
    pull: {
      th: 'เพดานความสามารถในการตรวจสอบของคุณจอยคือเพดานรายได้ — ทุกตัวเลขอื่นสร้างรอบสิ่งนั้น',
      en: 'Khun Joy\'s review-capacity cap is the revenue ceiling — every other figure is built around it.',
    },
    body: {
      th: [
        'ปรัชญา: เพดานรายได้ของแต่ละเฟส "ไม่ใช่ขายได้มากแค่ไหน" แต่เป็น "ตรวจได้กี่รายต่อสัปดาห์อย่างถูกต้อง" จนกว่าจะจ้างผู้ตรวจสอบคนที่สอง รายได้เกิดซ้ำมาก่อน บริการครั้งเดียวเป็นทางเข้าสู่ความสัมพันธ์ระยะยาว อัตรากำไรสร้างจากระบบอัตโนมัติทำงานปริมาณ ไม่ใช่จากการบีบเงินเดือน',
        'โมเดลรายได้สามชั้น: รายได้เกิดซ้ำ (Starter / Growing / Established + พรีเมียมภาษาอังกฤษ), บริการครั้งเดียว (จัดตั้ง วีซ่า BOI งบประจำปี), และ Advisory/Fractional CFO (รายเดือน + ตามโปรเจกต์) แผนเฟส 5 ระยะที่ผูกกับทริกเกอร์ปฏิบัติการ: เฟส 0 สร้าง (เดือน 1-3) → เฟส 1 ลูกค้ารายแรก (เดือน 4-9) → เฟส 2 สถานะปกติ (เดือน 10-18) → เฟส 3 จ้างผู้ตรวจสอบคนที่สอง → เฟส 4 ขยาย',
        'KPI สามตัวที่เฝ้าจริง: (1) MRR — เครื่องยนต์; (2) การใช้งานชั่วโมงตรวจเทียบกับเพดานของคุณจอย — ตัวตรวจคอขวด ตัวชี้นำของเวลาจ้างผู้ตรวจสอบคนที่สอง; (3) อัตรากำไรขั้นต้นต่อ tier — ยืนยันว่าระบบอัตโนมัติรับภาระจริง ถ้าตกต้องสงสัยว่ามีงานรั่วไปทำมือ',
        'สิบตัวเลขที่ต้องกำหนด (ดูข้างล่าง) ส่วนใหญ่คุณจอยเป็นผู้กำหนด — อัตราตลาดและต้นทุนการให้บริการของคุณจอย ทริกเกอร์เต็มเวลา เพดานตรวจ บริษัทพร้อมแล้ว ตัวเลขมาจากคุณจอย เงิน PROXYZ build investment + bootstrap จาก cashflow ลูกค้าเป็นโครงสร้างทุน — ไม่มีนักลงทุนภายนอก',
      ],
      en: [
        'Philosophy: the revenue ceiling per phase is not "how big can we sell" — it is "how much can Khun Joy review properly per week" until we hire the second reviewer. Recurring revenue first; lumpy one-offs are entry products into recurring relationships, not the main course. Margin is built by automation doing the volume, not by squeezing salaries.',
        'Revenue is three streams: recurring (Starter / Growing / Established + an English-service premium), one-off (formation, visa, BOI, annual statements), and Advisory / Fractional CFO (monthly + project). The phase plan ties to operations triggers: Phase 0 Build (months 1–3) → Phase 1 First clients (months 4–9) → Phase 2 Steady state (months 10–18) → Phase 3 Reviewer hire → Phase 4 Scale.',
        'Three KPIs we actually watch: (1) MRR — the engine; (2) review-hour utilisation vs your cap — the bottleneck check, the leading indicator of when to hire the second reviewer; (3) gross margin per recurring tier — verifies automation is carrying volume. If margin drops, work is leaking into manual.',
        'Ten figures are needed (list below). Most come from you — your market rates, your cost to deliver, your full-time trigger, your review cap. The model is ready; the numbers come from you. Capital is a hybrid PROXYZ build investment + bootstrap from client cashflow — no external investors planned.',
      ],
    },
    inset: 'number-checklist',
  },

  /* 09 — THE PARTNERSHIP ───────────────────────────────────────── */
  {
    num: '09',
    id: 'partnership',
    eyebrow: { th: 'บทที่ 9 · พาร์ทเนอร์', en: 'Chapter 9 · The Partnership' },
    title: { th: 'พื้นฐานที่ทุกอย่างวางอยู่บน', en: 'The foundation everything else rests on' },
    source: { th: 'จาก 00-partnership · กรอบพื้นฐานความเป็นหุ้นส่วน v1', en: 'From 00-partnership · partnership foundation frame v1' },
    pull: {
      th: 'ส่วนสำคัญที่สุดของบริษัท: เรา + คุณจอย และความตกลงระหว่างเรา',
      en: 'The most important part of the firm: us, you, and the agreement between us.',
    },
    body: {
      th: [
        'สองผู้ก่อตั้ง คุณจอยนำใบอนุญาต CPA ของไทย ความเชี่ยวชาญระดับ CFO ฐานลูกค้า SMB ที่มีอยู่ และเครือข่ายในประเทศ Tew นำทุนสร้างจาก PROXYZ แพลตฟอร์ม Studio OS การสร้างระบบอัตโนมัติและ AI แบรนด์ การออกแบบดีล และโครงสร้าง EOS/การดำเนินงาน ทั้งคู่เป็นคนไทย ทั้งคู่พาร์ทไทม์โดยพื้นฐาน',
        'รูปทรงการทำงาน: งานที่ได้รับใบอนุญาต คุณภาพ การปฏิบัติตามกฎ และการเซ็นรับรอง คือของคุณจอย; การสร้าง ระบบอัตโนมัติ แบรนด์ GTM และฝ่ายปฏิบัติการ คือของ Tew; กลยุทธ์ การตั้งราคา และการจ้างพนักงานที่มีใบอนุญาตเป็นเรื่องที่ทั้งคู่ตกลงร่วม รายการ "สงวน" (ต้องการทั้งสองคน) ครอบคลุมการเปลี่ยนแปลงหุ้น หนี้ การตัดสินใจเรื่องนิติบุคคล โมเดลราคา ข้อผูกพันใหญ่กับลูกค้า และกลไกฝ่ายกฎหมาย',
        'รายการที่ต้องคุยกันจริง (Tew + คุณจอย): สัดส่วนหุ้น + cap table; จำนวนทุนที่ PROXYZ ใส่และโครงสร้าง (เงินกู้ contribution หรือ convertible) + vesting; ทริกเกอร์เต็มเวลาของคุณจอย (รายได้รายเดือนหรือ milestone ที่ทำให้สมเหตุสมผลในการออกจาก CFO); ความขัดแย้ง/ไม่แข่งขันกับนายจ้าง CFO ปัจจุบัน (ต้องตรวจก่อนรับลูกค้ารายแรก); และกลไกฝ่ายกฎหมาย (ทนายในบริษัทเทียบกับพันธมิตรส่งต่อ — ผ่อนคลายไปยังเฟสกลยุทธ์)',
        'นี่คือพื้นฐานที่ทุกอย่างวางอยู่บน เนื้อหากลยุทธ์ทั้งหมดในเก้าบทนี้สมเหตุสมผลก็ต่อเมื่อกรอบนี้สมบูรณ์ ขั้นถัดไป — เรานั่งคุยกันและเติมข้อ 2 (รายละเอียดทุน) ข้อ 4 (สิทธิ์ตัดสินใจ) และข้อ 5 (รายการเปิด)',
      ],
      en: [
        'Two founders. Khun Joy brings the Thai CPA license, CFO-level expertise, an existing SMB accounting side-book, and the local network. Tew brings the PROXYZ build investment, the Studio OS platform, automation and AI build, brand, deal architecture, and EOS / operations. Both are Thai. Both are part-time by default.',
        'Working shape: licensed work, quality, compliance, and sign-off is Khun Joy\'s; build, automation, brand, GTM, and ops is Tew\'s; strategy, pricing, and hiring licensed staff are shared. Reserved matters (need both) cover equity changes, debt, entity decisions, the pricing model, major client commitments, and the legal-arm mechanism.',
        'Open items that need a real conversation between us: equity split + cap table; the capital amount PROXYZ contributes and the structure (loan, contribution, or convertible) plus any vesting; Khun Joy\'s full-time trigger (the monthly revenue or client milestone that makes it economic to leave her CFO role); the conflict / non-compete check with her current employer (must clear before the first client); and the legal-arm mechanism (lawyer in firm vs referral partner — deferred to the strategy phase).',
        'This is the foundation everything else rests on. All the strategic work in the prior eight chapters only makes sense on top of a complete frame. The next step — we sit together and fill section 2 (contribution detail), section 4 (decision rights), and section 5 (open items).',
      ],
    },
    closing: {
      th: 'อ่านจบแล้วโทรหา Tew หรือเขียนตามที่สะดวก ไม่มีความเร่งรีบในการตัดสินใจวันนี้ — แค่ต้องการความเห็นและทิศทางจากคุณจอย',
      en: 'When you\'ve read this through, call Tew or write back whenever suits. No rush on any decision today — just your read and your steer.',
    },
  },
];

/* ─── Page-scoped fonts injector ──────────────────────────────────── */
function useAbacuzFonts() {
  useEffect(() => {
    const HREF =
      'https://fonts.googleapis.com/css2' +
      '?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500' +
      '&family=Hanken+Grotesk:wght@400;500;600;700' +
      '&family=Noto+Serif+Thai:wght@400;500;600;700' +
      '&family=IBM+Plex+Sans+Thai:wght@400;500;600;700' +
      '&display=swap';
    let link = document.querySelector<HTMLLinkElement>(
      `link[data-abacuz-fonts]`
    );
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = HREF;
      link.setAttribute('data-abacuz-fonts', 'true');
      document.head.appendChild(link);
    }
    return () => {
      // Leave the link in place — repeated visits avoid re-fetching.
    };
  }, []);
}

/* ─── Components ─────────────────────────────────────────────────── */

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: 'inline-flex',
        gap: '2px',
        background: 'rgba(20,37,59,0.06)',
        borderRadius: '2px',
        padding: '3px',
        fontFamily: FONT_LABEL,
      }}
    >
      {(['th', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: lang === l ? IVORY : INK,
            background: lang === l ? NAVY : 'transparent',
            border: 'none',
            padding: '7px 14px',
            borderRadius: '1px',
            cursor: 'pointer',
            transition: 'background 180ms ease, color 180ms ease',
          }}
        >
          {l === 'th' ? 'ภาษาไทย' : 'English'}
        </button>
      ))}
    </div>
  );
}

function StatusPill({ status, lang }: { status: DecisionStatus; lang: Lang }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: FONT_LABEL,
        fontSize: '10px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
        }}
      />
      {STATUS_LABEL[status][lang]}
    </span>
  );
}

function DecisionTracker({ lang }: { lang: Lang }) {
  const counts = useMemo(() => {
    return {
      locked: DECISIONS.filter((d) => d.status === 'locked').length,
      discuss: DECISIONS.filter((d) => d.status === 'discuss').length,
      joy: DECISIONS.filter((d) => d.status === 'joy').length,
    };
  }, []);

  return (
    <aside
      aria-label={lang === 'th' ? 'การติดตามการตัดสินใจ' : 'Decision tracker'}
      className="abacuz-tracker"
      style={{
        background: IVORY,
        border: `1px solid ${RULE}`,
        padding: '28px 26px',
        fontFamily: FONT_BODY,
        color: INK,
      }}
    >
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: NAVY,
          margin: '0 0 18px 0',
        }}
      >
        {lang === 'th' ? 'การตัดสินใจ · 12 รายการ' : 'Decisions · 12 items'}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        {(['locked', 'discuss', 'joy'] as const).map((s) => (
          <div
            key={s}
            style={{
              padding: '12px 10px',
              background: STONE,
              borderRadius: '2px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: FONT_HEAD,
                fontSize: '32px',
                fontWeight: 500,
                lineHeight: 1,
                color: STATUS_COLOR[s],
                marginBottom: '6px',
              }}
            >
              {counts[s]}
            </div>
            <div
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: INK,
                opacity: 0.7,
              }}
            >
              {STATUS_LABEL[s][lang]}
            </div>
          </div>
        ))}
      </div>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {DECISIONS.map((d) => (
          <li key={d.id}>
            <a
              href={`#chapter-${CHAPTERS[d.chapter - 1].id}`}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                paddingBottom: '12px',
                borderBottom: `1px dashed ${RULE}`,
              }}
            >
              <div style={{ marginBottom: '6px' }}>
                <StatusPill status={d.status} lang={lang} />
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: INK,
                }}
              >
                {d.label[lang]}
              </div>
              <div
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: NAVY,
                  opacity: 0.55,
                  marginTop: '6px',
                }}
              >
                {lang === 'th' ? 'บทที่ ' : 'Ch '}{d.chapter} · {CHAPTERS[d.chapter - 1].title[lang]}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function ChapterNav({ lang }: { lang: Lang }) {
  return (
    <nav
      aria-label={lang === 'th' ? 'สารบัญบท' : 'Chapter index'}
      className="abacuz-chapnav"
      style={{
        background: IVORY,
        border: `1px solid ${RULE}`,
        padding: '20px 22px',
        fontFamily: FONT_BODY,
        color: INK,
      }}
    >
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: NAVY,
          margin: '0 0 14px 0',
        }}
      >
        {lang === 'th' ? 'สารบัญ' : 'Index'}
      </p>
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          counterReset: 'chap',
        }}
      >
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <a
              href={`#chapter-${c.id}`}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'baseline',
                textDecoration: 'none',
                color: INK,
                padding: '4px 0',
                fontFamily: FONT_BODY,
                fontSize: '13px',
                lineHeight: 1.4,
                borderBottom: `1px solid transparent`,
                transition: 'color 160ms ease, border-color 160ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = GOLD;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = INK;
              }}
            >
              <span
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  color: GOLD,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                {c.num}
              </span>
              <span>{c.title[lang]}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* The Thai compliance calendar — rendered inside Chapter 5. */
const CAL_ROWS: { day: string; task: Bilingual }[] = [
  { day: '5', task: { th: 'รับเอกสารลูกค้า (LINE / อีเมล / พอร์ทัล)', en: 'Client docs collected (LINE / email / portal)' } },
  { day: '7', task: { th: 'ภาษีหัก ณ ที่จ่าย — ร่างและยื่น (ภ.ง.ด. 1 / 3 / 53)', en: 'Withholding tax drafted + filed (PND.1 / 3 / 53)' } },
  { day: '10', task: { th: 'ลงบัญชีเสร็จ · คิวตรวจของคุณจอยเปิด', en: 'Bookkeeping posted · Khun Joy review queue opens' } },
  { day: '15', task: { th: 'VAT (ภ.พ.30) ยื่น · ประกันสังคมยื่น · เงินเดือนเสร็จ', en: 'VAT (PP.30) filed · social security filed · payroll done' } },
  { day: '20', task: { th: 'Clear Statement ส่งให้ลูกค้า (สองภาษา · CPA เซ็น)', en: 'Clear Statement delivered (bilingual · CPA-signed)' } },
];

function ComplianceCalendar({ lang }: { lang: Lang }) {
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
          ? 'ทุกขั้นเป็นงานเกิดซ้ำใน Studio OS มีเจ้าของและตัวบล็อกชัดเจน'
          : 'Every step is a recurring task in Studio OS with an owner and a blocker.'}
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

/* The 10 numbers Khun Joy must set — Chapter 8. */
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

function NumberChecklist({ lang }: { lang: Lang }) {
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

function ChapterSection({ chapter, lang, index }: { chapter: Chapter; lang: Lang; index: number }) {
  const headFont = lang === 'th' ? FONT_HEAD_TH : FONT_HEAD;
  return (
    <article
      id={`chapter-${chapter.id}`}
      className="abacuz-chapter"
      style={{
        padding: '96px 0',
        borderTop: index === 0 ? 'none' : `1px solid ${RULE}`,
        position: 'relative',
      }}
    >
      {/* Big outlined chapter number — top-right marginalia */}
      <div
        aria-hidden
        className="abacuz-chapter-marginalia"
        style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          fontFamily: FONT_WORD,
          fontSize: 'clamp(120px, 16vw, 220px)',
          lineHeight: 0.85,
          color: 'transparent',
          WebkitTextStroke: `2px ${GOLD}`,
          opacity: 0.18,
          letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        {chapter.num}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>
        <p
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: GOLD,
            margin: '0 0 18px 0',
          }}
        >
          {chapter.eyebrow[lang]}
        </p>
        <h2
          style={{
            fontFamily: headFont,
            fontSize: 'clamp(34px, 4.6vw, 56px)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.005em',
            color: NAVY,
            margin: '0 0 14px 0',
            textWrap: 'balance',
          }}
        >
          {chapter.title[lang]}
        </h2>
        <p
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '12px',
            letterSpacing: '0.06em',
            color: INK,
            opacity: 0.55,
            margin: '0 0 36px 0',
          }}
        >
          {chapter.source[lang]}
        </p>

        {chapter.pull && (
          <blockquote
            style={{
              fontFamily: headFont,
              fontSize: 'clamp(20px, 2.4vw, 28px)',
              fontStyle: 'italic',
              fontWeight: 500,
              lineHeight: 1.35,
              color: NAVY,
              padding: '0 0 0 28px',
              borderLeft: `2px solid ${GOLD}`,
              margin: '0 0 36px 0',
              maxWidth: '46ch',
              textWrap: 'balance',
            }}
          >
            <span style={{ color: GOLD, marginRight: '4px' }}>"</span>
            {chapter.pull[lang]}
            <span style={{ color: GOLD, marginLeft: '4px' }}>"</span>
          </blockquote>
        )}

        {chapter.body[lang].map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: FONT_BODY,
              fontSize: '16.5px',
              lineHeight: 1.75,
              color: INK,
              margin: '0 0 22px 0',
              maxWidth: '62ch',
            }}
          >
            {p}
          </p>
        ))}

        {chapter.closing && (
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: '14px',
              fontStyle: 'italic',
              lineHeight: 1.7,
              color: INK,
              opacity: 0.7,
              margin: '32px 0 0 0',
              maxWidth: '62ch',
            }}
          >
            {chapter.closing[lang]}
          </p>
        )}
      </div>

      {chapter.inset === 'compliance-calendar' && <ComplianceCalendar lang={lang} />}
      {chapter.inset === 'number-checklist' && <NumberChecklist lang={lang} />}
    </article>
  );
}

/* ─── The page itself ─────────────────────────────────────────────── */

function AbacuzPage() {
  useAbacuzFonts();
  const [lang, setLang] = useState<Lang>('th');

  // Set document.title for the page session
  useEffect(() => {
    const prev = document.title;
    document.title = 'ABACUZ × PROXYZ — Partner walkthrough';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <>
      <Nav />
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
                : 'When you\'ve read through, let\'s sit together.'}
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
      <Footer />
    </>
  );
}

/* The PartnerGate wrapper picks up the abacuz slug and enforces the 4-digit
 * code (PARTNERS_AUTH_CODE_ABACUZ env var on Vercel). Dev environment auto-
 * unlocks per PartnerGate.tsx. */
export default function Abacuz(): ReactNode {
  return (
    <PartnerGate partner="abacuz">
      <AbacuzPage />
    </PartnerGate>
  );
}
