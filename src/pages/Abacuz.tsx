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
  inset?: 'compliance-calendar' | 'number-checklist' | 'brand-identity'; // optional inline component
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
        'ABACUZ คือเวนเจอร์ภายใต้ PROXYZ Studio ชื่อมาจากคำว่า "abacus" (ลูกคิด) เติม Z ไว้ท้าย — สื่อถึงรากของการนับและการบัญชี จำง่าย และทำให้ชื่อโดดเด่นพอที่จะเลี่ยงเครื่องหมายการค้าคำว่า "Abacus" ที่มีผู้ใช้จำนวนมาก โดเมน abacuz.co จดทะเบียนแล้ว',
        'การตีความที่เราเป็นเจ้าของคือ ลูกคิด = บัญชีแยกประเภทที่โปร่งใสตั้งแต่ต้นกำเนิด เม็ดทุกเม็ดมองเห็นได้ ใครก็ตรวจนับได้ ไม่มีอะไรซ่อนในกล่องดำ ตรงกับคำมั่นของเราในตลาดที่ปิดบังตัวเลข — ราคาที่เปิดเผย บัญชีที่สะอาด ไม่มีอะไรซ่อนเร้น',
        'โทนภาพคืออบอุ่น น่าเชื่อถือ พรีเมียม — กรมท่า + ทอง + งาช้าง ไม่ใช่โทนเทา-ฟ้าเย็นชาแบบ Big Four และไม่เป็นโทน editorial-dark ของ PROXYZ ตัวอักษรเป็น Cinzel + Cormorant Garamond + Hanken Grotesk คู่กับ Noto Serif Thai สำหรับภาษาไทย',
        'ชิ้นงานเอกลักษณ์ของแบรนด์มีสองชิ้น: Clear Statement (สรุปประจำเดือนสองภาษา เซ็นรับรองโดย CPA ส่งภายในวันที่ 20 ของทุกเดือน) และ Published Price List (ตารางราคาที่เปิดเผย) ทั้งสองทำให้คำมั่น "คุณเห็นทุกตัวเลขได้" เป็นจริง',
      ],
      en: [
        'ABACUZ is a venture under PROXYZ Studio. The name is the real word "abacus" with a Z on the end — carrying counting and accounting heritage, memorable, and distinctive enough to dodge the crowded "Abacus" trademark field. The abacuz.co domain is registered.',
        'The reading we own: the abacus is the original transparent ledger. Every bead in plain sight; anyone can check the count. Nothing hidden inside a black box. That is exactly the promise in a market that hides its numbers — published prices, clean books, nothing buried.',
        'The visual register is warm, trustworthy, premium — navy plus gold plus warm ivory. Deliberately not the cold grey-blue of a Big Four firm, and deliberately distinct from PROXYZ editorial-dark. Type is Cinzel plus Cormorant Garamond plus Hanken Grotesk, paired with Noto Serif Thai for Thai.',
        'The brand carries two signature artifacts: the Clear Statement (a monthly bilingual plain-language summary, CPA-signed, delivered by day 20) and the Published Price List. Both make the promise — "every number, in plain sight" — literal.',
      ],
    },
    inset: 'brand-identity',
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

/* ─── Brand Identity full content — rendered as chapter 1's inset ──── */

type PaletteRow = { role: Bilingual; name: string; hex: string; use: Bilingual };

const PALETTE: PaletteRow[] = [
  {
    role: { th: 'สีหลัก', en: 'Anchor' },
    name: 'Ledger Navy',
    hex: '#14253B',
    use: { th: 'สีแบรนด์ พื้นเข้ม หัวเรื่อง', en: 'brand colour, dark surfaces, headers' },
  },
  {
    role: { th: 'สีเน้น', en: 'Accent' },
    name: 'Abacus Gold',
    hex: '#C9A24B',
    use: { th: 'ตัวโลโก้ เส้นคั่นบาง จุดเน้น เครื่องหมาย "รับรองแล้ว"', en: 'the mark, fine rules, highlights, the "signed-off" tick' },
  },
  {
    role: { th: 'พื้น', en: 'Ground' },
    name: 'Ivory',
    hex: '#F6F1E7',
    use: { th: 'พื้นหลังขาวนวลอุ่น (ส่วนใหญ่ของหน้า)', en: 'warm off-white page background (most of the page)' },
  },
  {
    role: { th: 'ความอุ่น', en: 'Warmth' },
    name: 'Warm Stone',
    hex: '#E7DECB',
    use: { th: 'บล็อกเนื้อหา เพิ่มความอุ่น ถ่วงสมดุลกับสีกรมท่า', en: 'section blocks, warmth to balance the navy' },
  },
  {
    role: { th: 'ตัวอักษร', en: 'Text' },
    name: 'Ink',
    hex: '#1C2433',
    use: { th: 'เนื้อความ สีดำอมกรมท่า', en: 'body text, a navy-black' },
  },
];

const TAGLINE_ALTS: Bilingual[] = [
  { th: 'ตัวเลขที่คุณเห็นได้', en: 'Numbers you can see.' },
  { th: 'ทุกตัวเลขอยู่ในสายตา', en: 'Every number in plain sight.' },
  { th: 'บัญชีชัดเจน คำตอบตรงไปตรงมา', en: 'Clear books. Straight answers.' },
];

const VOICE_LINES: Bilingual[] = [
  { th: 'บัญชีสะอาด ไม่มีเซอร์ไพรส์', en: 'Clean books. No surprises.' },
  { th: 'คุณจะรู้เสมอว่ากำลังจ่ายอะไร และทำไม', en: 'You will always know what you are paying, and why.' },
  { th: 'ผู้สอบบัญชีรับอนุญาตเป็นผู้เซ็นรับรองบัญชีของคุณ และมีคนจริงคอยตอบคำถาม', en: 'A licensed CPA signs your accounts. A real person answers your questions.' },
  { th: 'ตัวเลขจริง อธิบายเข้าใจง่าย ทั้งภาษาอังกฤษและภาษาไทย', en: 'Real numbers, in plain English and Thai.' },
  { th: 'เคยถูกจัดให้อยู่ในโครงสร้างที่เสี่ยงมาก่อนไหม? เราจะบอกตามตรง และแก้ให้ถูกต้อง', en: 'Were you put into a risky structure before? We will tell you straight, and fix it properly.' },
];

const TYPE_SPECIMENS: { role: Bilingual; family: string; sample: string; sampleTh?: string; size: string; weight: number; italic?: boolean }[] = [
  { role: { th: 'เวิร์ดมาร์ก / ตัวแสดงผลใหญ่', en: 'Wordmark / display' }, family: FONT_WORD, sample: 'ABACUZ', size: '64px', weight: 700 },
  { role: { th: 'หัวเรื่อง', en: 'Headlines' }, family: FONT_HEAD, sample: 'Clean books. No surprises.', sampleTh: 'บัญชีสะอาด ไม่มีเซอร์ไพรส์', size: '36px', weight: 500, italic: true },
  { role: { th: 'เนื้อความและ UI', en: 'Body & UI' }, family: FONT_BODY, sample: 'Every number, in plain sight. A licensed CPA behind your accounts.', sampleTh: 'ทุกตัวเลขอยู่ในสายตา ผู้สอบบัญชีรับอนุญาตอยู่เบื้องหลังบัญชีของคุณ', size: '17px', weight: 400 },
  { role: { th: 'ภาษาไทย · หัวเรื่อง', en: 'Thai · headlines' }, family: FONT_HEAD_TH, sample: 'บัญชีที่ชัดเจน', size: '36px', weight: 500 },
];

const LOGO_LOCKUPS: { name: Bilingual; body: Bilingual }[] = [
  {
    name: { th: 'แนวนอน (หลัก)', en: 'Horizontal (primary)' },
    body: { th: 'สัญลักษณ์ลูกคิดด้านซ้าย เวิร์ดมาร์ก ABACUZ + คำบรรยายด้านขวา', en: 'Mark left, wordmark ABACUZ + descriptor right. The primary lockup.' },
  },
  {
    name: { th: 'ตราประทับ / เหรียญ', en: 'Seal / badge' },
    body: { th: 'ABACUZ โค้งล้อมรอบลูกคิดในวงแหวนเส้นบาง สำหรับเอกสารเซ็นรับรอง เครื่องหมาย "ตรวจแล้ว"', en: 'ABACUZ curved around the abacus in a fine ring. For stamps, document sign-off, the "verified / clean" tick.' },
  },
  {
    name: { th: 'แนวตั้ง', en: 'Stacked' },
    body: { th: 'สัญลักษณ์อยู่เหนือเวิร์ดมาร์ก สำหรับพื้นที่แคบ มือถือ และรูปโปรไฟล์', en: 'Mark above wordmark. For narrow / mobile / social avatar.' },
  },
];

const PILLARS: { name: Bilingual; tagline: Bilingual; body: Bilingual }[] = [
  {
    name: { th: 'บัญชี · Accounting', en: 'Accounting' },
    tagline: { th: 'แม่นยำ · ชัดเจน · มั่นใจได้', en: 'Accuracy. Clarity. Confidence.' },
    body: { th: 'ฐานที่มีใบอนุญาต: ทำบัญชี ภาษี เซ็นรับรองงบ Fractional CFO', en: 'The licensed base: bookkeeping, tax, audit sign-off, fractional CFO.' },
  },
  {
    name: { th: 'กฎหมาย · Legal', en: 'Legal / Corporate Services' },
    tagline: { th: 'ให้คำแนะนำ · ปกป้อง · แก้ปัญหา', en: 'Guidance. Protection. Resolution.' },
    body: { th: 'จดทะเบียนบริษัท สัญญา ใบอนุญาตทำงาน วีซ่า BOI เครื่องหมายการค้า คดีความส่งต่อทนายที่มีใบอนุญาต', en: 'Company formation, contracts, work permits, visas, BOI, trademarks. Court cases referred to a licensed lawyer.' },
  },
  {
    name: { th: 'ที่ปรึกษาธุรกิจ', en: 'Business Consulting' },
    tagline: { th: 'กลยุทธ์ · เติบโต · สำเร็จ', en: 'Strategy. Growth. Success.' },
    body: { th: 'ที่ปรึกษา วางกลยุทธ์การเงิน', en: 'Advisory, financial strategy.' },
  },
];

const HANDLES: Bilingual[] = [
  { th: 'abacuz.co · จดทะเบียนแล้ว', en: 'abacuz.co · registered' },
  { th: 'โดเมนเชิงป้องกัน · abacuz.finance / .tax / .net / .co.th', en: 'Defensive domains · abacuz.finance / .tax / .net / .co.th' },
  { th: 'LINE Official Account · @abacuz', en: 'LINE Official Account · @abacuz' },
  { th: 'Instagram · Facebook · LinkedIn · @abacuz', en: 'Instagram · Facebook · LinkedIn · @abacuz' },
  { th: 'Google Business Profile · ABACUZ', en: 'Google Business Profile · ABACUZ' },
  { th: 'ตรวจเครื่องหมายการค้าก่อนพิมพ์ · ยังเปิด', en: 'Trademark sanity check before any print · still open' },
];

const LOCKED_ITEMS: Bilingual[] = [
  { th: 'ชื่อ โดเมน กฎการสะกดตัวพิมพ์ใหญ่ทั้งหมด', en: 'Name, domain, all-caps casing rule' },
  { th: 'โทนแบรนด์ · อบอุ่น น่าเชื่อถือ พรีเมียม', en: 'Warm trust-premium register' },
  { th: 'แก่นความคิด · ลูกคิดที่โปร่งใส', en: 'The transparent-abacus brand idea' },
  { th: 'พาเลตต์ · กรมท่า / ทอง / งาช้าง', en: 'Navy / gold / ivory palette' },
  { th: 'ทิศทางโลโก้ · ลูกคิดทอง + serif คลาสสิก', en: 'Logo direction · gold abacus + classical serif' },
];

const OPEN_ITEMS: Bilingual[] = [
  { th: 'อาร์ตเวิร์กโลโก้ฉบับสมบูรณ์ (เวกเตอร์จากคอนเซ็ปต์)', en: 'Final logo artwork — vectorised from the concept' },
  { th: 'การปรับ hex และโทนทองบนจอและงานพิมพ์', en: 'Exact hex + gold tone on screen and in print' },
  { th: 'ทดสอบจับคู่ฟอนต์ไทยบนหน้าจอจริง', en: 'Thai type-pairing test on real screens' },
  { th: 'ถ้อยคำคำบรรยายบริการ · ยืนยันกับฝ่ายตรวจสอบกฎหมาย', en: 'Descriptor wording · confirm with the legal review' },
  { th: 'ภาพผู้ก่อตั้งที่ยืนยันแล้ว (คุณจอย)', en: 'Confirmed authentic founder photo (Khun Joy)' },
  { th: 'ตรวจเครื่องหมายการค้าก่อนงานพิมพ์ใด ๆ', en: 'Trademark sanity check before any print' },
];

function BrandSubSection({
  number,
  eyebrow,
  title,
  lang,
  children,
}: {
  number: string;
  eyebrow: Bilingual;
  title?: Bilingual;
  lang: Lang;
  children: ReactNode;
}) {
  const headFont = lang === 'th' ? FONT_HEAD_TH : FONT_HEAD;
  return (
    <section style={{ marginBottom: '56px' }}>
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: GOLD,
          margin: '0 0 10px 0',
        }}
      >
        {number} · {eyebrow[lang]}
      </p>
      {title && title[lang] && (
        <h3
          style={{
            fontFamily: headFont,
            fontSize: 'clamp(24px, 2.6vw, 32px)',
            fontWeight: 500,
            lineHeight: 1.2,
            color: NAVY,
            margin: '0 0 22px 0',
            textWrap: 'balance',
            maxWidth: '32ch',
          }}
        >
          {title[lang]}
        </h3>
      )}
      {children}
    </section>
  );
}

function BrandIdentity({ lang }: { lang: Lang }) {
  const headFont = lang === 'th' ? FONT_HEAD_TH : FONT_HEAD;

  return (
    <div
      style={{
        marginTop: '64px',
        paddingTop: '56px',
        borderTop: `1px solid ${RULE}`,
      }}
    >
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: GOLD,
          margin: '0 0 8px 0',
        }}
      >
        {lang === 'th' ? 'อัตลักษณ์แบรนด์ฉบับเต็ม · v1' : 'Full brand identity · v1'}
      </p>
      <h3
        style={{
          fontFamily: headFont,
          fontSize: 'clamp(32px, 4vw, 44px)',
          fontWeight: 500,
          lineHeight: 1.15,
          color: NAVY,
          margin: '0 0 56px 0',
          fontStyle: 'italic',
          textWrap: 'balance',
          maxWidth: '32ch',
        }}
      >
        {lang === 'th'
          ? 'หน้าตา ความรู้สึก น้ำเสียง — ทุกอย่างที่ทำให้ ABACUZ เป็น ABACUZ'
          : 'The look, the feel, the voice — every choice that makes ABACUZ feel like ABACUZ.'}
      </h3>

      {/* 02 · BRAND IDEA */}
      <BrandSubSection
        number="02"
        eyebrow={{ th: 'แก่นความคิดของแบรนด์', en: 'The brand idea' }}
        title={{ th: 'ลูกคิด = บัญชีแยกประเภทดั้งเดิมที่โปร่งใส', en: 'Abacus = the original transparent ledger' }}
        lang={lang}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '16.5px',
            lineHeight: 1.75,
            color: INK,
            margin: 0,
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'การตีความที่ "ผิด" ของลูกคิดคือ เก่า โบราณ ทำมือ — ตรงข้ามกับบริษัทยุคใหม่ที่ขับเคลื่อนด้วย AI การตีความที่ "ถูก" และเป็นสิ่งที่เราเป็นเจ้าของ: ลูกคิดคือบัญชีแยกประเภทที่โปร่งใสตั้งแต่ต้นกำเนิด เม็ดทุกเม็ดมองเห็นได้ ใครก็ตรวจนับได้ ไม่มีอะไรซ่อนในกล่องดำ ตรงกับคำมั่นของเราในตลาดที่ปิดบังตัวเลข — ราคาที่เปิดเผย บัญชีที่สะอาด ไม่มีอะไรซ่อนเร้น'
            : 'The wrong reading of "abacus" is old, manual, dusty — the opposite of a modern, AI-first firm. The right reading we own: the abacus is the original transparent ledger. Every bead is in plain sight; anyone can see the count and check it. Nothing is hidden inside a black box. That is exactly the promise in a market that hides its numbers — published prices, clean books, nothing buried.'}
        </p>
      </BrandSubSection>

      {/* 03 · POSITIONING LINE — highlighted */}
      <BrandSubSection
        number="03"
        eyebrow={{ th: 'จุดยืน · เข็มทิศภายใน', en: 'Positioning · internal north star' }}
        lang={lang}
      >
        <blockquote
          style={{
            fontFamily: headFont,
            fontSize: 'clamp(20px, 2.4vw, 26px)',
            fontStyle: 'italic',
            fontWeight: 500,
            lineHeight: 1.4,
            color: NAVY,
            background: STONE,
            padding: '32px 36px',
            margin: 0,
            borderLeft: `3px solid ${GOLD}`,
            textWrap: 'balance',
            maxWidth: '52ch',
          }}
        >
          {lang === 'th'
            ? 'ABACUZ คือบริษัท "บัญชีที่ชัดเจน" ของประเทศไทย: บริการบัญชี ภาษี และงานนิติบุคคล สำหรับธุรกิจของชาวต่างชาติและธุรกิจไทย ด้วยราคาที่เปิดเผย คำตอบตรงไปตรงมาทั้งภาษาอังกฤษและภาษาไทย และมีผู้สอบบัญชีรับอนุญาต (CPA) อยู่เบื้องหลังทุกตัวเลข'
            : 'ABACUZ is Thailand\'s clear-books firm: accounting, tax, and corporate services for foreign-owned and Thai businesses, with published prices, plain answers in English and Thai, and a licensed CPA behind every number.'}
        </blockquote>
      </BrandSubSection>

      {/* 04 · TAGLINES */}
      <BrandSubSection
        number="04"
        eyebrow={{ th: 'สโลแกน', en: 'Taglines' }}
        title={{ th: 'ประโยคหลัก + ทางเลือก + คำบรรยายบริการ', en: 'Trust line + alternatives + descriptor' }}
        lang={lang}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '62ch' }}>
          <div>
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: INK,
                opacity: 0.55,
                margin: '0 0 8px 0',
              }}
            >
              {lang === 'th' ? 'ประโยคหลัก (แนะนำ)' : 'Trust line (recommended)'}
            </p>
            <p
              style={{
                fontFamily: headFont,
                fontSize: 'clamp(28px, 3.4vw, 40px)',
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1.2,
                color: NAVY,
                margin: 0,
              }}
            >
              {lang === 'th' ? 'บัญชีสะอาด ไม่มีเซอร์ไพรส์' : 'Clean books. No surprises.'}
            </p>
          </div>

          <div>
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: INK,
                opacity: 0.55,
                margin: '0 0 10px 0',
              }}
            >
              {lang === 'th' ? 'ทางเลือกในโทนเดียวกัน' : 'Alternatives in the same register'}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {TAGLINE_ALTS.map((t, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: headFont,
                    fontSize: '18px',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    color: INK,
                    opacity: 0.85,
                  }}
                >
                  · {t[lang]}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: INK,
                opacity: 0.55,
                margin: '0 0 8px 0',
              }}
            >
              {lang === 'th' ? 'คำบรรยายบริการ (ใช้คู่กับโลโก้)' : 'Descriptor (logo lockup, formal use, SEO)'}
            </p>
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '13px',
                letterSpacing: '0.18em',
                color: GOLD,
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              ACCOUNTING · LEGAL · BUSINESS CONSULTING — {lang === 'th' ? 'ทั้งภาษาอังกฤษและภาษาไทย' : 'in English and Thai'}
            </p>
          </div>
        </div>
      </BrandSubSection>

      {/* 05 · VOICE */}
      <BrandSubSection
        number="05"
        eyebrow={{ th: 'น้ำเสียง', en: 'Voice' }}
        title={{ th: 'อบอุ่น · เรียบง่าย · แม่นยำ · ทำให้อุ่นใจ', en: 'Warm · plain · exact · reassuring' }}
        lang={lang}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '15px',
            lineHeight: 1.65,
            color: INK,
            opacity: 0.85,
            margin: '0 0 20px 0',
            maxWidth: '60ch',
          }}
        >
          {lang === 'th'
            ? 'เราคือผู้เชี่ยวชาญที่ใจเย็นและให้คำตอบตรงไปตรงมา ไม่ใช้ศัพท์เทคนิคโดยไม่อธิบาย สองภาษาโดยพื้นฐาน ทุกประโยคที่สื่อกับลูกค้าควรใช้ได้ดีทั้งภาษาอังกฤษและภาษาไทย'
            : 'We are the calm expert who gives a straight answer. No jargon unless we explain it. Bilingual by default: every client-facing line should work cleanly in both English and Thai.'}
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxWidth: '60ch',
          }}
        >
          {VOICE_LINES.map((v, i) => (
            <li
              key={i}
              style={{
                fontFamily: headFont,
                fontSize: '17px',
                fontStyle: 'italic',
                lineHeight: 1.5,
                color: NAVY,
                paddingLeft: '18px',
                borderLeft: `2px solid ${GOLD}`,
              }}
            >
              {v[lang]}
            </li>
          ))}
        </ul>
      </BrandSubSection>

      {/* 06 · PALETTE — visual swatches */}
      <BrandSubSection
        number="06"
        eyebrow={{ th: 'สี', en: 'Palette' }}
        title={{ th: 'อบอุ่น · น่าเชื่อถือ · พรีเมียม — กรมท่า + ทอง + งาช้าง', en: 'Warm trust-premium — navy + gold + ivory' }}
        lang={lang}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
          }}
        >
          {PALETTE.map((p) => {
            const isLight = p.hex === IVORY || p.hex === STONE;
            return (
              <div
                key={p.hex}
                style={{
                  background: p.hex,
                  border: `1px solid ${RULE}`,
                  padding: '20px 18px',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  color: isLight ? INK : IVORY,
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: FONT_LABEL,
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      margin: '0 0 4px 0',
                      opacity: 0.7,
                    }}
                  >
                    {p.role[lang]}
                  </p>
                  <p
                    style={{
                      fontFamily: headFont,
                      fontSize: '20px',
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    {p.name}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: FONT_LABEL,
                      fontSize: '12px',
                      letterSpacing: '0.08em',
                      fontVariantNumeric: 'tabular-nums',
                      margin: '0 0 6px 0',
                      opacity: 0.85,
                    }}
                  >
                    {p.hex}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '11.5px',
                      lineHeight: 1.4,
                      margin: 0,
                      opacity: 0.75,
                    }}
                  >
                    {p.use[lang]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '13px',
            fontStyle: 'italic',
            color: INK,
            opacity: 0.65,
            margin: '18px 0 0 0',
            maxWidth: '60ch',
          }}
        >
          {lang === 'th'
            ? 'กฎสำคัญ: สีทองเป็นสีเน้น ไม่ใช้กับเนื้อความ (ทองบนงาช้างคอนทราสต์ต่ำเกินไป)'
            : 'Rule: gold is an accent, never body text (gold on ivory is too low-contrast to read).'}
        </p>
      </BrandSubSection>

      {/* 07 · TYPOGRAPHY — real specimens */}
      <BrandSubSection
        number="07"
        eyebrow={{ th: 'ตัวอักษร', en: 'Typography' }}
        title={{ th: 'คลาสสิก · สง่างาม · เหนือกาลเวลา', en: 'Classical, elegant, timeless' }}
        lang={lang}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {TYPE_SPECIMENS.map((t, i) => (
            <div
              key={i}
              style={{
                padding: '24px 26px',
                background: IVORY,
                border: `1px solid ${RULE}`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  margin: '0 0 14px 0',
                }}
              >
                {t.role[lang]} · {t.family.split(',')[0].replace(/'/g, '')}
              </p>
              <p
                style={{
                  fontFamily: t.family,
                  fontSize: t.size,
                  fontWeight: t.weight,
                  fontStyle: t.italic ? 'italic' : 'normal',
                  color: NAVY,
                  lineHeight: 1.2,
                  letterSpacing: t.role.en === 'Wordmark / display' ? '0.08em' : '-0.005em',
                  margin: 0,
                  textWrap: 'balance',
                }}
              >
                {lang === 'th' && t.sampleTh ? t.sampleTh : t.sample}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '13px',
            fontStyle: 'italic',
            color: INK,
            opacity: 0.65,
            margin: '18px 0 0 0',
            maxWidth: '60ch',
          }}
        >
          {lang === 'th'
            ? 'ภาษาไทย · Noto Serif Thai สำหรับหัวเรื่อง, IBM Plex Sans Thai สำหรับเนื้อความ ไม่ใช้ IBM Plex Mono (นั่นคือหน้าตา PROXYZ Studio)'
            : 'Thai pairing: Noto Serif Thai for headlines, IBM Plex Sans Thai for body and UI. Not IBM Plex Mono — that is PROXYZ Studio\'s corporate face.'}
        </p>
      </BrandSubSection>

      {/* 08 · LOGO SYSTEM */}
      <BrandSubSection
        number="08"
        eyebrow={{ th: 'โลโก้และสัญลักษณ์', en: 'Logo system' }}
        title={{ th: 'ลูกคิดสีทองที่เรียบหรู + เวิร์ดมาร์ก serif คลาสสิก', en: 'Refined gold abacus + classical serif wordmark' }}
        lang={lang}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '15px',
            lineHeight: 1.7,
            color: INK,
            opacity: 0.85,
            margin: '0 0 22px 0',
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'สัญลักษณ์: ลูกคิดเชิงเรขาคณิตที่สง่างาม เส้นทองบาง แม่นยำ เรียบน้อย ไม่ใช่ภาพคลิปอาร์ต ไม่หนา ไม่ 3 มิติ ไม่มีลายไม้ เป็น "บัญชีแยกประเภทที่โปร่งใส" ที่ถูกแปลงเป็นสัญลักษณ์ เวิร์ดมาร์ก: ABACUZ ในตัวพิมพ์ใหญ่โรมันแบบ Cinzel เว้นระยะกว้าง สีทองบนกรมท่า หรือกรมท่าบนงาช้าง'
            : 'The mark: an elegant, geometric abacus — thin gold strokes, precise, minimal. Not clip-art, not heavy, no 3D, no wood texture. The transparent ledger turned into a symbol. The wordmark: ABACUZ in Cinzel-style Roman caps with generous tracking, gold on navy or navy on ivory.'}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '22px',
          }}
        >
          {LOGO_LOCKUPS.map((l, i) => (
            <div
              key={i}
              style={{
                background: STONE,
                padding: '20px 22px',
                borderLeft: `2px solid ${GOLD}`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  margin: '0 0 8px 0',
                }}
              >
                {String(i + 1).padStart(2, '0')} · {l.name[lang]}
              </p>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '13px',
                  lineHeight: 1.55,
                  color: INK,
                  margin: 0,
                }}
              >
                {l.body[lang]}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '13px',
            fontStyle: 'italic',
            color: INK,
            opacity: 0.65,
            margin: 0,
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'แนวกันพลาด: เส้นบางสม่ำเสมอ แม่นยำเชิงเรขาคณิต สีทองเป็นโทนเรียบ (ไม่ใช่ไล่เฉดวาวหรือนูน) ทดสอบขนาดเล็กให้แถวเม็ดลูกคิดยังอ่านออก'
            : 'Guardrails: thin even strokes, geometric precision, gold as a flat metallic tone (not a shiny gradient or bevel). Test it tiny — the bead rows must still read at favicon size.'}
        </p>
      </BrandSubSection>

      {/* 09 · THREE PILLARS */}
      <BrandSubSection
        number="09"
        eyebrow={{ th: 'สามเสาหลักของบริการ', en: 'The three pillars' }}
        title={{ th: 'สิ่งที่ ABACUZ ให้บริการ — แบ่งเป็นสามเสา', en: 'What ABACUZ delivers — three pillars' }}
        lang={lang}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          {PILLARS.map((p, i) => (
            <div
              key={i}
              style={{
                background: NAVY,
                color: IVORY,
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <p
                style={{
                  fontFamily: headFont,
                  fontSize: '20px',
                  fontWeight: 500,
                  margin: 0,
                  color: IVORY,
                }}
              >
                {p.name[lang]}
              </p>
              <p
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  margin: 0,
                }}
              >
                {p.tagline[lang]}
              </p>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '13px',
                  lineHeight: 1.55,
                  color: IVORY,
                  opacity: 0.85,
                  margin: 0,
                }}
              >
                {p.body[lang]}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '13px',
            fontStyle: 'italic',
            color: INK,
            opacity: 0.7,
            margin: '18px 0 0 0',
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'ข้อควรระวัง · ถ้อยคำ "LEGAL" ต้องยืนยันกับฝ่ายตรวจสอบกฎหมายก่อนพิมพ์เผยแพร่ ABACUZ คือบริษัทบัญชีและงานนิติบุคคล ไม่ใช่สำนักงานกฎหมาย'
            : 'Flag · the descriptor "LEGAL" must be confirmed with the legal review before anything is printed. ABACUZ is a transparent accounting and corporate-services firm, NOT a law firm.'}
        </p>
      </BrandSubSection>

      {/* 10 · FOUNDER FACE + IMAGERY */}
      <BrandSubSection
        number="10"
        eyebrow={{ th: 'ใบหน้าผู้ก่อตั้ง และภาพประกอบ', en: 'Founder face + imagery' }}
        title={{ th: 'คุณจอย คือใบหน้าของเว็บไซต์', en: 'Khun Joy is the website face' }}
        lang={lang}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '15.5px',
            lineHeight: 1.7,
            color: INK,
            margin: '0 0 18px 0',
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'ภาพถ่ายมืออาชีพที่อบอุ่นและมั่นใจสร้างโทน "ที่ปรึกษาที่เป็นมนุษย์" — คนจริงที่คุณไว้ใจให้ดูแลตัวเลข บรรทัดคุณวุฒิที่เห็นได้: Mayura "Joy" Chimdee, CPA (ผู้สอบบัญชีรับอนุญาต)'
            : 'A warm, confident professional portrait sets the human-advisor tone — a real person you would trust with your numbers. Credential line in view: Mayura "Joy" Chimdee, CPA (ผู้สอบบัญชีรับอนุญาต).'}
        </p>
        <div
          style={{
            background: STONE,
            padding: '20px 24px',
            borderLeft: `3px solid ${GOLD}`,
            maxWidth: '62ch',
          }}
        >
          <p
            style={{
              fontFamily: FONT_LABEL,
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: GOLD,
              margin: '0 0 8px 0',
            }}
          >
            {lang === 'th' ? 'ข้อควรระวัง' : 'Flag'}
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: '14px', lineHeight: 1.6, color: INK, margin: 0 }}>
            {lang === 'th'
              ? 'ภาพที่เผยแพร่ต้องเป็นภาพคุณจอยจริง ความจริงแท้นี้คือสัญญาณความน่าเชื่อถือ ภาพที่สร้างด้วย AI หรือสังเคราะห์หนักจะบั่นทอนจุดยืนทั้งหมดอย่างเงียบ ๆ'
              : 'The published photo must authentically represent Khun Joy (a real, recent photo). That authenticity IS the trust signal — an AI-generated or heavily-synthetic face would quietly undercut the entire positioning.'}
          </p>
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '14px',
            lineHeight: 1.6,
            color: INK,
            opacity: 0.75,
            margin: '20px 0 0 0',
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'ภาพประกอบที่เหลือ · เอกสารสะอาด ตารางราคาที่เปิดเผย โต๊ะทำงานเป็นระเบียบ UI สองภาษาที่อบอุ่น จริงและเฉพาะเจาะจง ไม่ใช่ภาพสต็อก "จับมือ/ตึกระฟ้า"'
            : 'Supporting imagery: clean documents, the published price list, a tidy workspace, warm bilingual UI. Honest and specific, never generic "handshake / skyscraper" stock.'}
        </p>
      </BrandSubSection>

      {/* 11 · SIGNATURE ARTIFACT */}
      <BrandSubSection
        number="11"
        eyebrow={{ th: 'ชิ้นงานเอกลักษณ์', en: 'The signature artifact' }}
        title={{ th: 'Clear Statement + ตารางราคาที่เปิดเผย', en: 'The Clear Statement + the Published Price List' }}
        lang={lang}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: IVORY,
              border: `1px solid ${RULE}`,
              padding: '24px 24px',
            }}
          >
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: GOLD,
                margin: '0 0 10px 0',
              }}
            >
              {lang === 'th' ? '01 · Clear Statement' : '01 · The Clear Statement'}
            </p>
            <p
              style={{
                fontFamily: headFont,
                fontSize: '18px',
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1.4,
                color: NAVY,
                margin: '0 0 14px 0',
              }}
            >
              {lang === 'th' ? 'ทุกตัวเลข อยู่ในสายตา' : 'Every number, in plain sight.'}
            </p>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: '14px',
                lineHeight: 1.65,
                color: INK,
                opacity: 0.82,
                margin: 0,
              }}
            >
              {lang === 'th'
                ? 'สรุปประจำเดือนแบบสองภาษา เข้าใจง่าย — เงินเข้าเท่าไร ออกเท่าไร ภาษีที่ต้องจ่าย สิ่งที่ต้องทำต่อ พร้อมการเซ็นรับรองของ CPA ตราลูกคิดประทับ'
                : 'A monthly, bilingual, plain-language summary — what came in, what went out, what tax is due, what is next — with the CPA\'s sign-off and the abacus seal.'}
            </p>
          </div>
          <div
            style={{
              background: IVORY,
              border: `1px solid ${RULE}`,
              padding: '24px 24px',
            }}
          >
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: GOLD,
                margin: '0 0 10px 0',
              }}
            >
              {lang === 'th' ? '02 · ตารางราคาที่เปิดเผย' : '02 · The Published Price List'}
            </p>
            <p
              style={{
                fontFamily: headFont,
                fontSize: '18px',
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1.4,
                color: NAVY,
                margin: '0 0 14px 0',
              }}
            >
              {lang === 'th' ? 'ราคาที่ไม่ปิดบัง' : 'Prices, in the open.'}
            </p>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: '14px',
                lineHeight: 1.65,
                color: INK,
                opacity: 0.82,
                margin: 0,
              }}
            >
              {lang === 'th'
                ? 'การแสดงความโปร่งใสที่กล้าที่สุดในตลาดที่ปิดบัง — ราคาของเราเปิดเผยชัดเจน ทั้งภาษาอังกฤษและภาษาไทย เป็นพื้นผิวของแบรนด์ ไม่ใช่แค่หน้าเว็บ'
                : 'The boldest trust gesture in an opaque market — our prices, in the open, in English and Thai. A brand surface, not just a page.'}
            </p>
          </div>
        </div>
      </BrandSubSection>

      {/* 13 · DIGITAL HANDLES TO SECURE */}
      <BrandSubSection
        number="13"
        eyebrow={{ th: 'ช่องทางดิจิทัลที่ต้องจอง', en: 'Digital handles to secure' }}
        title={{ th: 'สิ่งที่คุณต้องทำเพื่อปิดช่องทาง', en: 'What you need to lock down' }}
        lang={lang}
      >
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '10px',
          }}
        >
          {HANDLES.map((h, i) => (
            <li
              key={i}
              style={{
                fontFamily: FONT_BODY,
                fontSize: '14px',
                lineHeight: 1.55,
                color: INK,
                padding: '12px 16px',
                background: STONE,
                borderLeft: `2px solid ${GOLD}`,
              }}
            >
              {h[lang]}
            </li>
          ))}
        </ul>
      </BrandSubSection>

      {/* 14 · LOCKED VS OPEN */}
      <BrandSubSection
        number="14"
        eyebrow={{ th: 'อะไรล็อกแล้ว · อะไรต้องเก็บงานต่อ', en: 'What\'s locked · what needs a finishing pass' }}
        lang={lang}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: NAVY,
              color: IVORY,
              padding: '24px 24px',
            }}
          >
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: GOLD,
                margin: '0 0 16px 0',
              }}
            >
              {lang === 'th' ? 'ล็อกแล้ว · 5 รายการ' : 'Locked · 5 items'}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {LOCKED_ITEMS.map((l, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: IVORY,
                    paddingLeft: '14px',
                    borderLeft: `2px solid ${GOLD}`,
                  }}
                >
                  {l[lang]}
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              background: STONE,
              color: INK,
              padding: '24px 24px',
            }}
          >
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: NAVY,
                margin: '0 0 16px 0',
              }}
            >
              {lang === 'th' ? 'ต้องเก็บงานต่อ · 6 รายการ' : 'Finishing pass · 6 items'}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {OPEN_ITEMS.map((o, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: INK,
                    paddingLeft: '14px',
                    borderLeft: `2px solid ${NAVY}`,
                  }}
                >
                  {o[lang]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </BrandSubSection>
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
      {chapter.inset === 'brand-identity' && <BrandIdentity lang={lang} />}
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
