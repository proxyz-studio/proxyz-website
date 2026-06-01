/* ABACUZ — Product Deck content.
 *
 * The capital-raise-style pitch for the Product Deck zone (?zone=deck).
 * Subject: ABACUZ the venture AND Studio OS as the engine that runs it.
 * Spine: cover → problem → solution → market → engine → moat → model →
 * roadmap → the ask. Distilled from the 2026-05-31 R&D corpus (research,
 * strategy, offers, operations, tech, finance) reframed as a pitch.
 *
 * Bilingual EN + TH. The Thai is a working draft — Khun Joy is the sole
 * native reviewer and confirms before anything goes public.
 *
 * Pure data. Rendered by src/abacuz/zones/DeckZone.tsx.
 */

import type { Bilingual, BilingualList } from '../../abacuz/types';

export type DeckKind =
  | 'cover'
  | 'problem'
  | 'solution'
  | 'market'
  | 'engine'
  | 'moat'
  | 'model'
  | 'roadmap'
  | 'ask';

/** A labelled point — used for engine features, moat layers, model lanes. */
export type DeckPoint = { label: Bilingual; detail: Bilingual };

/** A headline figure — used on the market + model panels. */
export type DeckStat = { value: string; caption: Bilingual };

/** A roadmap phase. */
export type DeckPhase = { phase: Bilingual; when: Bilingual; body: Bilingual };

export type DeckSection = {
  id: string;
  kind: DeckKind;
  /** Panel ground — sections alternate for rhythm. */
  surface: 'navy' | 'ivory' | 'stone';
  eyebrow: Bilingual;
  headline: Bilingual;
  /** Optional standfirst under the headline. */
  lede?: Bilingual;
  body?: BilingualList;
  points?: DeckPoint[];
  stats?: DeckStat[];
  phases?: DeckPhase[];
  /** Optional emphasised line, set apart. */
  pull?: Bilingual;
};

export const DECK: DeckSection[] = [
  /* ── COVER ─────────────────────────────────────────────────────── */
  {
    id: 'cover',
    kind: 'cover',
    surface: 'navy',
    eyebrow: { th: 'สไลด์นำเสนอผลิตภัณฑ์', en: 'Product deck' },
    headline: { th: 'บัญชีสะอาด ไม่มีเซอร์ไพรส์', en: 'Clean books. No surprises.' },
    lede: {
      th: 'บริษัทบัญชีและงานนิติบุคคลที่โปร่งใสสำหรับเมืองไทย ขับเคลื่อนด้วย Studio OS',
      en: 'A transparent accounting and corporate-services firm for Thailand, run on Studio OS.',
    },
    pull: {
      th: 'ABACUZ คือบริษัทที่คุณเห็นทุกตัวเลขได้',
      en: 'ABACUZ is the firm where you can see every number.',
    },
  },

  /* ── PROBLEM ───────────────────────────────────────────────────── */
  {
    id: 'problem',
    kind: 'problem',
    surface: 'ivory',
    eyebrow: { th: '01 · ปัญหา', en: '01 · The problem' },
    headline: {
      th: 'ตลาดบัญชีไทยซ่อนราคา และพึ่งคนคนเดียว',
      en: 'Thai accounting hides its prices and leans on one person.',
    },
    body: {
      th: [
        'งานปฏิบัติตามกฎแบบเดียวกันมีราคาต่างกัน 5–10 เท่า และแทบไม่มีใครเปิดเผยราคา เจ้าของธุรกิจไม่รู้ว่ากำลังจ่ายแพงเกินไปหรือไม่',
        'เจ้าของต่างชาติเจอหนักกว่า — ถูกจัดให้อยู่ในโครงสร้าง nominee ที่เสี่ยงและถือความรับผิดทางอาญา โดยมักไม่รู้ตัว',
        'และสำนักงานส่วนใหญ่พึ่งชั่วโมงของผู้ก่อตั้งคนเดียว งานจึงโตไม่ได้และความเชื่อใจก็เปราะ',
      ],
      en: [
        'The same compliance work runs a 5 to 10x price spread, and almost nobody publishes a price. Owners cannot tell whether they are overpaying.',
        'Foreign owners get it worse — quietly placed in risky nominee structures that leave them holding criminal liability they never understood.',
        'And most firms depend on one founder’s hours, so the work cannot scale and the trust stays fragile.',
      ],
    },
    pull: {
      th: 'ความเชื่อใจคือบาดแผล ไม่ใช่ AI',
      en: 'Trust is the wound. Not AI.',
    },
  },

  /* ── SOLUTION ──────────────────────────────────────────────────── */
  {
    id: 'solution',
    kind: 'solution',
    surface: 'navy',
    eyebrow: { th: '02 · ทางออก', en: '02 · The solution' },
    headline: {
      th: 'ลูกคิดที่โปร่งใส — เห็นทุกเม็ด',
      en: 'A transparent abacus — every bead in view.',
    },
    lede: {
      th: 'ABACUZ เปิดเผยราคาทุกบริการ ส่งสรุปบัญชีรายเดือนภาษาเข้าใจง่าย และมีผู้สอบบัญชีรับอนุญาตเซ็นรับรองเบื้องหลังทุกตัวเลข',
      en: 'ABACUZ publishes every price, sends a plain-language monthly statement, and puts a licensed CPA behind every number.',
    },
    points: [
      {
        label: { th: 'ราคาที่เปิดเผย', en: 'Published prices' },
        detail: { th: 'ทุกบริการมีขอบเขตและราคาชัดเจน คนที่อยากได้ของถูกและขุ่นมัวจะคัดตัวเองออก', en: 'Every service has a clear scope and a clear price. The cheap-and-shady self-select out.' },
      },
      {
        label: { th: 'Clear Statement รายเดือน', en: 'The monthly Clear Statement' },
        detail: { th: 'สรุปบัญชีสองภาษาที่อ่านรู้เรื่อง ส่งทุกวันที่ 20 รายได้ ค่าใช้จ่าย คงเหลือ ภาษีที่ต้องจ่าย ขั้นต่อไป', en: 'A bilingual, readable summary by the 20th: income, expenses, what is left, VAT due, next steps.' },
      },
      {
        label: { th: 'CPA เซ็นรับรอง', en: 'CPA sign-off' },
        detail: { th: 'ไม่มีสิ่งใดออกจากบริษัทโดยไม่ผ่านการตรวจของผู้สอบบัญชีรับอนุญาต', en: 'Nothing leaves the firm without a licensed CPA’s review.' },
      },
    ],
  },

  /* ── MARKET ────────────────────────────────────────────────────── */
  {
    id: 'market',
    kind: 'market',
    surface: 'ivory',
    eyebrow: { th: '03 · ตลาด', en: '03 · The market' },
    headline: {
      th: 'ช่องว่างที่ยังไม่มีใครยึด',
      en: 'An unoccupied lane.',
    },
    lede: {
      th: 'ไม่มีบริษัทไทยรายใดผสม ประสิทธิภาพ AI + ราคาเปิดเผย + บัญชีและงานนิติบุคคลใต้หลังคาเดียว + ภาษาอังกฤษ-ไทย เข้าด้วยกัน',
      en: 'No Thai firm combines AI efficiency, published pricing, accounting plus corporate services under one roof, and English-default service.',
    },
    stats: [
      { value: '5–10×', caption: { th: 'ช่วงราคางานปฏิบัติตามกฎแบบเดียวกัน', en: 'price spread on identical compliance work' } },
      { value: '~2', caption: { th: 'บริษัทที่เปิดราคาจริง (Acclime, Plizz)', en: 'firms that actually publish prices (Acclime, Plizz)' } },
      { value: '0', caption: { th: 'คู่แข่งที่เปิดราคา Fractional CFO', en: 'rivals publishing a fractional-CFO price' } },
    ],
    body: {
      th: ['เริ่มที่ลูกค้าต่างชาติ (มาร์จิ้นสูงจากพรีเมียมภาษาอังกฤษ) ใช้ฐานลูกค้า SMB ไทยบน LINE เป็นฐานอุ่น'],
      en: ['Lead with foreign-owned clients (higher margin from the English premium); serve Thai SMBs on LINE as the warm base.'],
    },
  },

  /* ── ENGINE (Studio OS) ────────────────────────────────────────── */
  {
    id: 'engine',
    kind: 'engine',
    surface: 'navy',
    eyebrow: { th: '04 · เครื่องยนต์', en: '04 · The engine' },
    headline: {
      th: 'Studio OS รันบริษัท ไม่ใช่แค่ซอฟต์แวร์บัญชี',
      en: 'Studio OS runs the firm. This is not bookkeeping software.',
    },
    lede: {
      th: 'นี่คือสิ่งที่ทำให้ ABACUZ มากกว่าสำนักงานบัญชี ระบบทำงานปริมาณมากให้ มาร์จิ้นจึงไม่ได้มาจากการกดเงินเดือน',
      en: 'This is why ABACUZ is more than an accounting shop. The system does the volume, so margin is not bought by squeezing salaries.',
    },
    points: [
      {
        label: { th: 'ปฏิทินปฏิบัติตามกฎ', en: 'Compliance calendar' },
        detail: { th: 'งานยิงอัตโนมัติต่อลูกค้า: เก็บเอกสารวันที่ 5 ยื่นภาษีหัก ณ ที่จ่ายวันที่ 7 VAT วันที่ 15 Clear Statement วันที่ 20', en: 'Tasks fire automatically per client: docs by the 5th, withholding tax by the 7th, VAT by the 15th, Clear Statement by the 20th.' },
      },
      {
        label: { th: 'พื้นที่ทำงานต่อลูกค้า', en: 'A workspace per client' },
        detail: { th: 'หนึ่งห้องต่อหนึ่งลูกค้า เอกสาร สถานะ คิวตรวจ ทุกอย่างในที่เดียว', en: 'One room per client — documents, status, the review queue, all in one place.' },
      },
      {
        label: { th: 'คิวตรวจ + ร่างอัตโนมัติ', en: 'Review queue + auto-drafts' },
        detail: { th: 'ระบบจำแนกและร่างก่อน คนตรวจ CPA เซ็น', en: 'The system classifies and drafts first; staff verify, the CPA signs.' },
      },
      {
        label: { th: 'ทุกอย่างสองภาษา', en: 'Bilingual everything' },
        detail: { th: 'เทมเพลตและการสื่อสารไทย-อังกฤษในตัว', en: 'Thai and English templating and comms, built in.' },
      },
    ],
    pull: {
      th: 'ระบบทำปริมาณ คนทำการตัดสินใจ ใบอนุญาตทำการรับรอง',
      en: 'The system does volume. People do judgment. The license does sign-off.',
    },
  },

  /* ── MOAT ──────────────────────────────────────────────────────── */
  {
    id: 'moat',
    kind: 'moat',
    surface: 'ivory',
    eyebrow: { th: '05 · เหตุผลที่จะชนะ', en: '05 · Why it wins' },
    headline: {
      th: 'คูเมืองสี่ชั้นที่ลอกยาก',
      en: 'Four layers a copycat cannot stack.',
    },
    points: [
      {
        label: { th: 'ใบอนุญาต CPA', en: 'A CPA license' },
        detail: { th: 'คุณจอยเป็นผู้สอบบัญชีรับอนุญาตของไทย — ฐานที่ผู้รับจ้างทำบัญชีราคาถูกลอกไม่ได้', en: 'Khun Joy is a Thai CPA — a base a cheap bookkeeper cannot copy.' },
      },
      {
        label: { th: 'ความโปร่งใส', en: 'Radical transparency' },
        detail: { th: 'ราคาเปิดเผยในตลาดที่ซ่อนราคา คือสัญญาณความเชื่อใจที่คู่แข่งเลียนแบบยากโดยไม่เสียมาร์จิ้น', en: 'Published prices in a market that hides them — a trust signal rivals cannot fake without giving up margin.' },
      },
      {
        label: { th: 'ประสิทธิภาพ AI', en: 'AI efficiency' },
        detail: { th: 'Studio OS ทำให้ต้นทุนส่วนเพิ่มต่อลูกค้าต่ำ — Big Four แข่งราคานี้ไม่ได้', en: 'Studio OS keeps marginal cost per client low — a price the Big Four cannot match.' },
      },
      {
        label: { th: 'วินัยเพดานการตรวจ', en: 'Review-capacity discipline' },
        detail: { th: 'เราโตเท่าที่ตรวจไหว คุณภาพจึงไม่หล่นเพื่อแลกการเติบโต', en: 'We grow only as fast as we can review — quality never drops to chase growth.' },
      },
    ],
  },

  /* ── MODEL ─────────────────────────────────────────────────────── */
  {
    id: 'model',
    kind: 'model',
    surface: 'navy',
    eyebrow: { th: '06 · โมเดลธุรกิจ', en: '06 · The business model' },
    headline: {
      th: 'รายได้เกิดซ้ำ + งานครั้งเดียว + ที่ปรึกษา',
      en: 'Recurring + one-off + advisory.',
    },
    points: [
      {
        label: { th: 'แพ็กเกจรายเดือน', en: 'Recurring tiers' },
        detail: { th: 'Starter / Growing / Established คิดตามปริมาณงาน ไม่ใช่ต่อหัว', en: 'Starter / Growing / Established, priced by workload — never per seat.' },
      },
      {
        label: { th: 'บริการครั้งเดียว ราคาคงที่', en: 'Fixed-scope one-offs' },
        detail: { th: 'จดทะเบียนบริษัท VAT ใบอนุญาตทำงาน วีซ่า BOI เครื่องหมายการค้า — ราคาเปิด ค่าราชการแยกชัด', en: 'Formation, VAT, work permits, visas, BOI, trademarks — published prices, government fees shown separately.' },
      },
      {
        label: { th: 'ที่ปรึกษา / Fractional CFO', en: 'Advisory / fractional CFO' },
        detail: { th: 'ความเชี่ยวชาญของคุณจอย ตลาดไม่เปิดราคาส่วนนี้ เราจะเปิด', en: 'Khun Joy’s specialty. The market publishes no price for this. We will.' },
      },
    ],
    pull: {
      th: 'ไม่คิดต่อหัว ไม่คิดตามการใช้ AI รายได้เกิดซ้ำมาก่อน',
      en: 'No per-seat. No metered AI. Recurring revenue first.',
    },
  },

  /* ── ROADMAP ───────────────────────────────────────────────────── */
  {
    id: 'roadmap',
    kind: 'roadmap',
    surface: 'ivory',
    eyebrow: { th: '07 · เส้นทาง', en: '07 · The roadmap' },
    headline: {
      th: 'ห้าเฟส ผูกกับเพดานการตรวจ ไม่ใช่เงินสด',
      en: 'Five phases, gated on review capacity — not cash.',
    },
    phases: [
      { phase: { th: 'เฟส 0 · สร้าง', en: 'Phase 0 · Build' }, when: { th: 'เดือน 1–3', en: 'Months 1–3' }, body: { th: 'จดทะเบียน ตั้ง Studio OS เปิดบริการตรวจสุขภาพบริษัทฟรี', en: 'Incorporate, stand up Studio OS, open the free Company Health Check.' } },
      { phase: { th: 'เฟส 1 · ลูกค้ารายแรก', en: 'Phase 1 · First clients' }, when: { th: 'เดือน 4–9', en: 'Months 4–9' }, body: { th: 'ลูกค้าต่างชาติกลุ่มแรก + ฐาน SMB ไทยบน LINE', en: 'First foreign-owned clients + the Thai SMB base on LINE.' } },
      { phase: { th: 'เฟส 2 · สถานะปกติ', en: 'Phase 2 · Steady state' }, when: { th: 'เดือน 10–18', en: 'Months 10–18' }, body: { th: 'รายได้เกิดซ้ำมั่นคง มาร์จิ้นต่อแพ็กเกจชัด', en: 'Stable recurring revenue, clear margin per tier.' } },
      { phase: { th: 'เฟส 3 · จ้างผู้ตรวจคนที่สอง', en: 'Phase 3 · Reviewer hire' }, when: { th: 'เมื่อถึงทริกเกอร์', en: 'On the trigger' }, body: { th: 'ยกเพดานการตรวจเมื่ออัตราการใช้ถึงเกณฑ์', en: 'Lift the review ceiling when utilisation hits the threshold.' } },
      { phase: { th: 'เฟส 4 · ขยาย', en: 'Phase 4 · Scale' }, when: { th: 'หลังเฟส 3', en: 'After Phase 3' }, body: { th: 'เพิ่มทีม คงวินัยคุณภาพและการรับรอง', en: 'Add team, keep the quality-and-sign-off discipline.' } },
    ],
  },

  /* ── THE ASK / PARTNERSHIP ─────────────────────────────────────── */
  {
    id: 'ask',
    kind: 'ask',
    surface: 'navy',
    eyebrow: { th: '08 · ความร่วมมือ', en: '08 · The partnership' },
    headline: {
      th: 'สองผู้ก่อตั้ง ใบอนุญาตหนึ่ง เครื่องยนต์หนึ่ง',
      en: 'Two founders. One license. One engine.',
    },
    points: [
      {
        label: { th: 'คุณจอยนำมา', en: 'Khun Joy brings' },
        detail: { th: 'ใบอนุญาต CPA ของไทย ความเชี่ยวชาญระดับ CFO ฐานลูกค้า SMB และเครือข่ายในประเทศ', en: 'The Thai CPA license, CFO-level expertise, an SMB client base, and the local network.' },
      },
      {
        label: { th: 'PROXYZ (Tew) นำมา', en: 'PROXYZ (Tew) brings' },
        detail: { th: 'แพลตฟอร์ม Studio OS ระบบอัตโนมัติและ AI แบรนด์ การออกแบบดีล และทุนสร้าง', en: 'The Studio OS platform, automation and AI, brand, deal architecture, and build investment.' },
      },
      {
        label: { th: 'ยังเปิดให้ตัดสินร่วมกัน', en: 'Still ours to settle together' },
        detail: { th: 'สัดส่วนหุ้น ทุน ทริกเกอร์เต็มเวลา นิติบุคคล และตัวเลขสิบค่า', en: 'Equity split, capital, the full-time trigger, the entity, and the ten numbers.' },
      },
    ],
    pull: {
      th: 'สไลด์นี้คือข้อเสนอ ส่วนที่ยังเปิด คือสิ่งที่เราจะตัดสินด้วยกัน',
      en: 'This deck is the pitch. The open items are what we decide together.',
    },
  },
];
