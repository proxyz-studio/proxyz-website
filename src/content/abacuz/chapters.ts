import type { Chapter } from '../../abacuz/types';

export const CHAPTERS: Chapter[] = [
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
        "Correction one — AI is not the moat. The AI layer is commoditising (FlowAccount, PEAK are universal). The durable moat is Khun Joy's CPA license, Thai expertise, and client trust. AI is the multiplier that lets a thin team carry 3 to 4× the normal client load, not the billboard.",
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
        'การให้บริการเป็น remote ทั่วประเทศ บริษัทดำเนินการบน StudioOS + ระบบอัตโนมัติ + ทีมงานบาง ๆ โดยที่คุณจอยอยู่ในคิวตรวจและเซ็นรับรอง — ไม่ใช่ในการทำบัญชีรายวัน',
        'จุดขายคือความเชื่อใจและความโปร่งใส ไม่ใช่ "AI" ขอบเขตของเราคือ "บริษัทบัญชีและงานนิติบุคคลที่โปร่งใส ไม่ใช่สำนักงานกฎหมาย" — งานบริการนิติบุคคลทั้งหมดเราทำเอง คดีความส่งต่อทนายที่มีใบอนุญาต ฝ่ายตรวจสอบกฎหมายจะยืนยันถ้อยคำที่แน่นอนก่อนเผยแพร่',
        'ความเสี่ยงที่ซื่อสัตย์: เพดานรายได้ของแต่ละเฟสคือชั่วโมงตรวจของคุณจอย ตราบใดที่ทำพาร์ทไทม์ เราเติบโตได้แค่เท่าที่ตรวจอย่างถูกต้อง และวางแผนจ้างผู้ตรวจสอบคนที่สองเมื่อขยาย ข้อมูลส่วนตัว (PDPA) จัดการอย่างละเอียด และเราจะยืนยันรายละเอียดใบอนุญาตทุกข้อกับผู้เชี่ยวชาญไทยก่อนดำเนินการ',
      ],
      en: [
        "The research closed our two biggest worries (the licensing question and the foreign-ownership question) and opens the lane: lead with foreign-owned, Phuket-anchored (higher margin, sharp trust gap, globally-reachable channels), with Khun Joy's Thai-SMB clients as a warm base on LINE from day one, under a \"clean books, no surprises\" promise.",
        "Delivery is remote and nationwide. The firm runs on StudioOS, automation, and a thin staff layer, with Khun Joy on review and sign-off — not on the day-to-day bookkeeping.",
        'The edge is trust and transparency, not "AI." Our scope is a transparent accounting and corporate-services firm, not a law firm — we do all the corporate-services work ourselves, court cases are referred to a licensed lawyer, and the legal review will confirm the exact wording before we publish.',
        "Honest risk: the firm's capacity is capped by Khun Joy's review hours while she is part-time, so we grow only as fast as we can review work properly, and we plan for the second senior reviewer as we scale. Client data privacy (PDPA) is handled carefully, and we confirm every Thai licensing detail with a professional before acting.",
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
        'แผนผังบริการจัดเป็นสามเสาหลัก: (A) บัญชีและภาษี — ทำบัญชี VAT/WHT เงินเดือน งบประจำปี การเซ็นรับรอง CPA; (B) บริการนิติบุคคล — จดทะเบียนบริษัท ใบอนุญาตทำงาน วีซ่า BOI เครื่องหมายการค้า สัญญาภายในขอบเขตที่ปรึกษา (คดีความส่งต่อทนายที่มีใบอนุญาต); (C) Fractional CFO — ที่ปรึกษาการเงิน วางแผน การระดมทุน ตลาดไม่มีใครเปิดราคาส่วนนี้ เราจะเปิดเผย',
        'ผลิตภัณฑ์ทางเข้าสองตัว: "Start Right in Thailand" สำหรับเจ้าของต่างชาติ (จัดตั้ง + การปฏิบัติตามปีแรก + วีซ่า/ใบอนุญาตทำงานเลือกได้) และ "บัญชีรายเดือนที่สะอาด" บน LINE สำหรับ SMB ไทย พร้อม Clear Statement ทุกเดือน',
        'แผนรายเดือนเป็นขั้นที่เปิดเผย (Starter / Growing / Established) แบ่งตามขอบเขตงานจริง ไม่ใช่ต่อที่นั่ง บริการภาษาอังกฤษมีพรีเมียมที่ระบุชัดเจน (งานวิจัยพบว่างานภาษาอังกฤษมีราคาสูงกว่า 5-10 เท่า) ค่าธรรมเนียมราชการส่งผ่านตามจริงและแสดงแยก ทุกใบเสนอราคาและใบแจ้งหนี้สองภาษา ทุกราคารอคุณจอยกำหนดจากอัตราตลาดที่เห็นและต้นทุนการให้บริการ',
      ],
      en: [
        'Every relationship starts with a free Company Health Check — a plain-language report on what is clean, what is at risk, and what it costs to fix. For foreign owners, it surfaces the nominee structure risk many were placed in. For Thai SMBs, messy books and missed filings.',
        'The offer map is three pillars: (A) Accounting & Tax — bookkeeping, VAT/WHT, payroll, annual statements, CPA sign-off; (B) Corporate Services — formation, work permits, visas, BOI, trademarks, contracts within the advisory boundary (litigation referred to a licensed lawyer); (C) Fractional CFO — financial modelling, budgeting, fundraising support. Nobody in the market publishes a price for fractional CFO. We will.',
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
    title: { th: 'บริษัทที่ไม่พึ่งชั่วโมงผู้ก่อตั้ง', en: "A firm that doesn't depend on either founder's hours" },
    source: { th: 'จาก 05-operations · โครงสร้างการดำเนินงาน v1', en: 'From 05-operations · operations model v1' },
    pull: {
      th: 'งานเดียวกันผ่านสามชั้น: ระบบอัตโนมัติ → พนักงาน → คุณจอย (CPA เซ็น)',
      en: 'The same task moves through three layers: automation → staff → Khun Joy (CPA sign-off).',
    },
    body: {
      th: [
        'กฎข้อเดียว: บริษัทไม่พึ่งชั่วโมงทำงานของผู้ก่อตั้งคนใดคนหนึ่ง ทั้งคู่พาร์ทไทม์โดยพื้นฐาน คำตอบทั่วไปคือเลือกระหว่างทำเต็มเวลาหรือยอมรับเพดานเล็ก เราตอบไม่เหมือนกัน — ระบบอัตโนมัติ + StudioOS + ทีมงานบางรับภาระงาน ส่วนเวลาของคุณจอยถูกเก็บไว้สำหรับสิ่งที่มีเพียงคุณจอยทำได้ คือการตรวจสอบและเซ็นรับรอง',
        'สามชั้น — ชั้น 1 ระบบอัตโนมัติ: รับเอกสาร จำแนกประเภท ติดตามกำหนดเวลา ร่าง สื่อสารสถานะ ร่าง Clear Statement ฉบับแรก; ชั้น 2 พนักงาน (พนักงานบัญชี + ผู้ประสานงาน): ตรวจผลของระบบ ตัดสินใจกรณีกำกวม ร่างการยื่น จัดแฟ้มให้พร้อมตรวจ; ชั้น 3 คุณจอย (CPA): เซ็นรับรอง สอบบัญชี ที่ปรึกษา/CFO ทุกอย่างที่ใช้ชื่อใบอนุญาต ไม่มีสิ่งใดที่คุณจอยเซ็นออกจากบริษัทโดยไม่ผ่านการตรวจของคุณจอย',
        'รอบรายเดือนขับเคลื่อนด้วยปฏิทินการปฏิบัติตามกฎของไทย StudioOS เก็บปฏิทินกลาง งานยิงอัตโนมัติต่อลูกค้า (ดูข้างล่าง) Clear Statement ถูกส่งภายในวันที่ 20 ของทุกเดือน — นี่ไม่ใช่บริการเสริม แต่เป็นพิธีกรรมความไว้วางใจ',
        'ตัวเลขสำคัญที่สุดเชิงปฏิบัติคือเพดานความสามารถในการตรวจสอบของคุณจอย — กี่รายต่อสัปดาห์ที่คุณจอยเซ็นรับรองได้อย่างถูกต้องในขณะพาร์ทไทม์ เมื่อกำหนดเพดานแล้ว เราติดตามการใช้งานรายสัปดาห์ การขายชะลอเมื่อใกล้เพดาน และเปิดรับสมัครผู้ตรวจสอบคนที่สองเมื่อใกล้ถึง',
      ],
      en: [
        "One rule: the firm does not depend on either founder's hours. Both founders are part-time by default. The conventional answer is to either go full-time or accept a small ceiling. We answer differently — automation plus StudioOS plus a thin staff layer carries the volume, and Khun Joy's time is preserved for the one thing only she can do: review and CPA sign-off.",
        "Three layers — Layer 1 Automation: intake, classification, deadline tracking, draft generation, status communication, the Clear Statement first draft. Layer 2 Staff (bookkeepers + coordinator): verifying automation's output, judgment calls on ambiguous transactions, draft filings, preparing the file for review. Layer 3 Khun Joy (CPA): sign-off, audit, advisory/CFO, anything that bears her licensed name. Nothing she signs leaves the firm without her review.",
        'The monthly cycle is calendar-driven by Thai compliance. StudioOS holds the master calendar; tasks fire automatically per client (see calendar below). The Clear Statement is delivered by day 20 of every month — not a courtesy, but the trust ritual.',
        "The single most important operational number is Khun Joy's review-capacity cap — how many clients you can review properly per week while part-time. Once set in writing, StudioOS tracks utilisation weekly; sales pacing slows as we near it; we open the second reviewer search before quality slips.",
      ],
    },
    inset: 'compliance-calendar',
  },

  /* 06 — THE TECH ──────────────────────────────────────────────── */
  {
    num: '06',
    id: 'tech',
    eyebrow: { th: 'บทที่ 6 · เทคโนโลยี', en: 'Chapter 6 · The Tech' },
    title: { th: 'StudioOS ประสาน ไม่แทนที่', en: 'StudioOS orchestrates, never replaces' },
    source: { th: 'จาก 07-tech-stack · สแต็กเทคโนโลยี v1', en: 'From 07-tech-stack · tech stack v1' },
    pull: {
      th: 'ไม่สร้างสิ่งที่ใช้งานได้แล้ว ทุกอย่างมีฉบับภาษาไทย',
      en: 'Never build what already works. Everything has a Thai-language fallback.',
    },
    body: {
      th: [
        'ABACUZ ทำงานบนสี่ชั้น: StudioOS (ประสาน workspace ต่อลูกค้า ปฏิทินการปฏิบัติตามกฎ คิวตรวจ แม่แบบสองภาษา) + ระบบบัญชี (FlowAccount เป็นมาตรฐาน SMB ไทย, Xero เสนอให้ลูกค้าต่างชาติ — คุณจอยยืนยัน) + พอร์ทัลของรัฐ (RD e-Filing, e-Withholding Tax, สปส., DBD, BOI) + ช่องทาง (LINE OA @abacuz, อีเมล Google Workspace, พอร์ทัลลูกค้า StudioOS)',
        'AI ทำงานจริงในหกจุด: จำแนกรายการ bank-feed/statement, จำแนกเอกสารขาเข้า, ระบบแปลสองภาษา (ตัดด้วย glossary คำศัพท์ภาษี), ร่าง Clear Statement, ข้อความสถานะรายเดือนบน LINE/อีเมล, และ Ask AI ภายในสำหรับสอบถามคู่มือบริษัท ไม่มีสิ่งที่ AI สร้างออกจากบริษัทโดยไม่ผ่านมนุษย์ — ชื่อ CPA ที่มีใบอนุญาตคือทรัพย์สิน',
        'ช่องว่างที่ซื่อสัตย์: bank feeds ในไทย KBank มี API ที่ใช้ได้ ที่เหลือส่วนใหญ่เป็น CSV/PDF เราใช้การนำเข้า statement ด้วย AI ช่วย (Claude อ่าน statement จำแนกบรรทัด พนักงานยืนยัน) เร็วกว่ามือทั้งหมด ซื่อสัตย์ว่าไม่ใช่เวทมนตร์',
        'ความปลอดภัย: SSO ผ่าน Google Workspace 2FA บังคับ ทุกที่ การเข้าถึงตามความจำเป็น เข้ารหัสในการส่งและจัดเก็บ 1Password สำหรับ credentials ที่ใช้ร่วมกัน สำรอง workspace รายวัน เอกสารสำเนาที่ Google Drive วินัย PDPA ตรวจสอบได้ที่นี่',
      ],
      en: [
        "ABACUZ runs on four layers: StudioOS (orchestration — one workspace per client, the compliance calendar, the review queue, bilingual templating) plus the books layer (FlowAccount as the Thai-SMB standard, Xero offered for foreign-owned clients — Khun Joy confirms) plus government portals (RD e-Filing, e-Withholding Tax, SSO, DBD, BOI) plus channels (LINE OA @abacuz, Google Workspace email, the StudioOS client portal).",
        "AI does real work in six specific places: bank-feed and statement categorisation, document intake classification, the bilingual translation pipeline (glossary-locked on tax terms), the Clear Statement draft, monthly LINE and email status messages, and an internal Ask AI for company-playbook queries. Nothing AI-generated leaves the firm without human review — the CPA's licensed name is the asset.",
        'The honest gap: bank feeds in Thailand. KBank has a usable API, most others are CSV/PDF. We use AI-assisted statement import (Claude reads the statement, categorises lines, staff verifies). Faster than full manual; honest about not being magic.',
        'Security: Google Workspace SSO, 2FA required everywhere, need-to-know access, encryption in transit and at rest, 1Password for shared credentials, daily StudioOS workspace backups, documents mirrored to Google Drive. PDPA discipline is auditable here.',
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
      en: "Nothing here is legal advice. Every \"CONFIRM\" item needs a Thai-licensed advisor's sign-off before we act.",
    },
    body: {
      th: [
        'นิติบุคคล: บริษัทจำกัด (บริษัทจำกัด) ถือหุ้นข้างมากโดยคนไทย — Tew + คุณจอย ทั้งคู่เป็นคนไทย → ไม่มีปัญหา FBA เลย ตัดสินใจย่อยที่ยังเปิดอยู่: นิติบุคคลแยกสำหรับ ABACUZ (แนะนำเพื่อบัญชีและทุนสะอาด) เทียบกับแผนกใต้นิติบุคคล PROXYZ ที่มีอยู่ ชุด PROXYZ-Co-Registration นำมาใช้ซ้ำได้ตรงๆ สำหรับการจดทะเบียน',
        'CPA + TFAC: รายการที่สำคัญที่สุดในเอกสารทั้งเล่ม ต้องยืนยันกับที่ปรึกษาที่รู้ TFAC สี่ข้อ: (1) ABACUZ ตามขอบเขตปัจจุบันต้องจดทะเบียนเป็นสำนักงานสอบบัญชีกับ TFAC หรือไม่ หรือทริกเกอร์โดยปริมาณ; (2) เพดานการถือครอง CPA สำหรับกิจกรรมที่เราตั้งใจ; (3) สถานะ CPA ปัจจุบันของคุณจอย เงื่อนไข วันต่ออายุ การปฏิบัติตาม CPE; (4) กฎ dual-engagement / ความขัดแย้งกับนายจ้างที่ใช้กับ CFO เต็มเวลาที่ถือหุ้นในสำนักงาน CPA',
        'ขอบเขตกฎหมาย/นิติบุคคล: ABACUZ เป็นบริษัทบัญชีและงานนิติบุคคลที่โปร่งใส ไม่ใช่สำนักงานกฎหมาย คำบรรยายบริการล็อกแล้วเป็น "บัญชี · บริการนิติบุคคล" — ตัด "LEGAL" ออกให้ตรงกับสิ่งที่เรามีใบอนุญาตทำ และให้เวิร์ดมาร์กสะอาดสำหรับการตรวจใบอนุญาต DNFBP งานด้านนิติบุคคล (จดทะเบียนบริษัท BOI สัญญา PDPA ใบอนุญาตทำงาน เครื่องหมายการค้า) อยู่ในเสาบริการนิติบุคคลโดยมี CPA รับรอง คดีความส่งต่อทนายที่มีใบอนุญาตเสมอ กลไกฝ่ายกฎหมาย (มีทนายในทีมหรือใช้พันธมิตรส่งต่อ) ยังเปิดให้คุณจอยตัดสิน',
        'PDPA + AMLO/DNFBP: ทุกลูกค้ามีการ KYC และยืนยัน UBO บันทึกเก็บไว้ ห้ามถือเงินลูกค้า ค่าธรรมเนียมราชการเคลื่อนจากลูกค้าโดยตรง ธุรกรรมที่น่าสงสัยรายงานต่อ AMLO ภายใน 7 วัน ประกาศ PDPA สองภาษาเผยแพร่ก่อนเปิด ทั้งคู่ต้องการการยืนยันถ้อยคำกับทนายไทย ประกัน PI ของ ABACUZ เองเป็นรายการอื่น',
      ],
      en: [
        "Entity: Thai Co Ltd (บริษัทจำกัด), Thai-majority ownership — Tew and Khun Joy are both Thai → zero FBA exposure. Open sub-decision: dedicated entity for ABACUZ (recommended for clean accounting + capital) vs a division under an existing PROXYZ entity. The PROXYZ-Co-Registration kit is directly reusable for the mechanics.",
        "CPA + TFAC: the single most load-bearing item. Four things to confirm with a TFAC-aware advisor: (1) whether ABACUZ as currently scoped must register as a TFAC audit firm, or whether registration is gated on volume; (2) the CPA-ownership threshold for the activities we intend; (3) Khun Joy's live CPA status — current standing, conditions, renewal date, CPE compliance; (4) any dual-engagement / employer-conflict rules that apply because Khun Joy is a full-time CFO elsewhere.",
        'Legal / corporate-services boundary: ABACUZ is a transparent accounting + corporate-services firm, NOT a law firm. The wordmark descriptor is settled — "Accounting · Corporate Services" (Thai "บัญชี · บริการนิติบุคคล"); "LEGAL" was dropped to match what we are licensed to do and to keep the wordmark clean for the DNFBP licensing review. Legal-adjacent work (formation, BOI, contracts, PDPA, work permits, trademarks) lives inside Corporate Services with CPA sign-off; litigation is always referred to a licensed lawyer. The legal-arm mechanism (in-house lawyer vs referral partner) stays open for you to decide.',
        "PDPA + AMLO/DNFBP: every client KYC'd and UBO-verified, records kept, never hold client funds (government fees move directly from the client), suspicious transactions reported to AMLO within 7 days, bilingual privacy notice published before launch. Both need final wording from the Thai lawyer. PI insurance for ABACUZ itself is a separate line.",
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
      en: "Khun Joy's review-capacity cap is the revenue ceiling — every other figure is built around it.",
    },
    body: {
      th: [
        'ปรัชญา: เพดานรายได้ของแต่ละเฟส "ไม่ใช่ขายได้มากแค่ไหน" แต่เป็น "ตรวจได้กี่รายต่อสัปดาห์อย่างถูกต้อง" จนกว่าจะจ้างผู้ตรวจสอบคนที่สอง รายได้เกิดซ้ำมาก่อน บริการครั้งเดียวเป็นทางเข้าสู่ความสัมพันธ์ระยะยาว อัตรากำไรสร้างจากระบบอัตโนมัติทำงานปริมาณ ไม่ใช่จากการบีบเงินเดือน',
        'โมเดลรายได้สามชั้น: รายได้เกิดซ้ำ (Starter / Growing / Established + พรีเมียมภาษาอังกฤษ), บริการครั้งเดียว (จัดตั้ง วีซ่า BOI งบประจำปี), และ Advisory/Fractional CFO (รายเดือน + ตามโปรเจกต์) แผนเฟส 5 ระยะที่ผูกกับทริกเกอร์ปฏิบัติการ: เฟส 0 สร้าง (เดือน 1-3) → เฟส 1 ลูกค้ารายแรก (เดือน 4-9) → เฟส 2 สถานะปกติ (เดือน 10-18) → เฟส 3 จ้างผู้ตรวจสอบคนที่สอง → เฟส 4 ขยาย',
        'KPI สามตัวที่เฝ้าจริง: (1) MRR — เครื่องยนต์; (2) การใช้งานชั่วโมงตรวจเทียบกับเพดานของคุณจอย — ตัวตรวจคอขวด ตัวชี้นำของเวลาจ้างผู้ตรวจสอบคนที่สอง; (3) อัตรากำไรขั้นต้นต่อ tier — ยืนยันว่าระบบอัตโนมัติรับภาระจริง ถ้าตกต้องสงสัยว่ามีงานรั่วไปทำมือ',
        'สิบตัวเลขที่ต้องกำหนด (ดูข้างล่าง) ส่วนใหญ่คุณจอยเป็นผู้กำหนด — อัตราตลาดและต้นทุนการให้บริการของคุณจอย ทริกเกอร์เต็มเวลา เพดานตรวจ บริษัทพร้อมแล้ว ตัวเลขมาจากคุณจอย เงิน PROXYZ build investment + bootstrap จาก cashflow ลูกค้าเป็นโครงสร้างทุน — ไม่มีนักลงทุนภายนอก',
      ],
      en: [
        "Philosophy: the revenue ceiling per phase is not \"how big can we sell\" — it is \"how much can Khun Joy review properly per week\" until we hire the second reviewer. Recurring revenue first; lumpy one-offs are entry products into recurring relationships, not the main course. Margin is built by automation doing the volume, not by squeezing salaries.",
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
        'สองผู้ก่อตั้ง คุณจอยนำใบอนุญาต CPA ของไทย ความเชี่ยวชาญระดับ CFO ฐานลูกค้า SMB ที่มีอยู่ และเครือข่ายในประเทศ Tew นำทุนสร้างจาก PROXYZ แพลตฟอร์ม StudioOS การสร้างระบบอัตโนมัติและ AI แบรนด์ การออกแบบดีล และโครงสร้าง EOS/การดำเนินงาน ทั้งคู่เป็นคนไทย ทั้งคู่พาร์ทไทม์โดยพื้นฐาน',
        'รูปทรงการทำงาน: งานที่ได้รับใบอนุญาต คุณภาพ การปฏิบัติตามกฎ และการเซ็นรับรอง คือของคุณจอย; การสร้าง ระบบอัตโนมัติ แบรนด์ GTM และฝ่ายปฏิบัติการ คือของ Tew; กลยุทธ์ การตั้งราคา และการจ้างพนักงานที่มีใบอนุญาตเป็นเรื่องที่ทั้งคู่ตกลงร่วม รายการ "สงวน" (ต้องการทั้งสองคน) ครอบคลุมการเปลี่ยนแปลงหุ้น หนี้ การตัดสินใจเรื่องนิติบุคคล โมเดลราคา ข้อผูกพันใหญ่กับลูกค้า และกลไกฝ่ายกฎหมาย',
        'รายการที่ต้องคุยกันจริง (Tew + คุณจอย): สัดส่วนหุ้น + cap table; จำนวนทุนที่ PROXYZ ใส่และโครงสร้าง (เงินกู้ contribution หรือ convertible) + vesting; ทริกเกอร์เต็มเวลาของคุณจอย (รายได้รายเดือนหรือ milestone ที่ทำให้สมเหตุสมผลในการออกจาก CFO); ความขัดแย้ง/ไม่แข่งขันกับนายจ้าง CFO ปัจจุบัน (ต้องตรวจก่อนรับลูกค้ารายแรก); และกลไกฝ่ายกฎหมาย (ทนายในบริษัทเทียบกับพันธมิตรส่งต่อ — ผ่อนคลายไปยังเฟสกลยุทธ์)',
        'นี่คือพื้นฐานที่ทุกอย่างวางอยู่บน เนื้อหากลยุทธ์ทั้งหมดในเก้าบทนี้สมเหตุสมผลก็ต่อเมื่อกรอบนี้สมบูรณ์ ขั้นถัดไป — เรานั่งคุยกันและเติมข้อ 2 (รายละเอียดทุน) ข้อ 4 (สิทธิ์ตัดสินใจ) และข้อ 5 (รายการเปิด)',
      ],
      en: [
        "Two founders. Khun Joy brings the Thai CPA license, CFO-level expertise, an existing SMB accounting side-book, and the local network. Tew brings the PROXYZ build investment, the StudioOS platform, automation and AI build, brand, deal architecture, and EOS / operations. Both are Thai. Both are part-time by default.",
        "Working shape: licensed work, quality, compliance, and sign-off is Khun Joy's; build, automation, brand, GTM, and ops is Tew's; strategy, pricing, and hiring licensed staff are shared. Reserved matters (need both) cover equity changes, debt, entity decisions, the pricing model, major client commitments, and the legal-arm mechanism.",
        "Open items that need a real conversation between us: equity split + cap table; the capital amount PROXYZ contributes and the structure (loan, contribution, or convertible) plus any vesting; Khun Joy's full-time trigger (the monthly revenue or client milestone that makes it economic to leave her CFO role); the conflict / non-compete check with her current employer (must clear before the first client); and the legal-arm mechanism (lawyer in firm vs referral partner — deferred to the strategy phase).",
        "This is the foundation everything else rests on. All the strategic work in the prior eight chapters only makes sense on top of a complete frame. The next step — we sit together and fill section 2 (contribution detail), section 4 (decision rights), and section 5 (open items).",
      ],
    },
    closing: {
      th: 'อ่านจบแล้วโทรหา Tew หรือเขียนตามที่สะดวก ไม่มีความเร่งรีบในการตัดสินใจวันนี้ — แค่ต้องการความเห็นและทิศทางจากคุณจอย',
      en: "When you've read this through, call Tew or write back whenever suits. No rush on any decision today — just your read and your steer.",
    },
  },
];
