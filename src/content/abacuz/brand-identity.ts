import type { Bilingual, PaletteRow } from '../../abacuz/types';

export const PALETTE: PaletteRow[] = [
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

export const TAGLINE_ALTS: Bilingual[] = [
  { th: 'ตัวเลขที่คุณเห็นได้', en: 'Numbers you can see.' },
  { th: 'ทุกตัวเลขอยู่ในสายตา', en: 'Every number in plain sight.' },
  { th: 'บัญชีชัดเจน คำตอบตรงไปตรงมา', en: 'Clear books. Straight answers.' },
];

export const VOICE_LINES: Bilingual[] = [
  { th: 'บัญชีสะอาด ไม่มีเซอร์ไพรส์', en: 'Clean books. No surprises.' },
  { th: 'คุณจะรู้เสมอว่ากำลังจ่ายอะไร และทำไม', en: 'You will always know what you are paying, and why.' },
  { th: 'ผู้สอบบัญชีรับอนุญาตเป็นผู้เซ็นรับรองบัญชีของคุณ และมีคนจริงคอยตอบคำถาม', en: 'A licensed CPA signs your accounts. A real person answers your questions.' },
  { th: 'ตัวเลขจริง อธิบายเข้าใจง่าย ทั้งภาษาอังกฤษและภาษาไทย', en: 'Real numbers, in plain English and Thai.' },
  { th: 'เคยถูกจัดให้อยู่ในโครงสร้างที่เสี่ยงมาก่อนไหม? เราจะบอกตามตรง และแก้ให้ถูกต้อง', en: 'Were you put into a risky structure before? We will tell you straight, and fix it properly.' },
];

export const TYPE_SPECIMENS: {
  role: Bilingual;
  family: string;
  sample: string;
  sampleTh?: string;
  size: string;
  weight: number;
  italic?: boolean;
}[] = [
  { role: { th: 'เวิร์ดมาร์ก / ตัวแสดงผลใหญ่', en: 'Wordmark / display' }, family: "'Cinzel', 'Cormorant Garamond', serif", sample: 'ABACUZ', size: '64px', weight: 700 },
  { role: { th: 'หัวเรื่อง', en: 'Headlines' }, family: "'Cormorant Garamond', 'Noto Serif Thai', serif", sample: 'Clean books. No surprises.', sampleTh: 'บัญชีสะอาด ไม่มีเซอร์ไพรส์', size: '36px', weight: 500, italic: true },
  { role: { th: 'เนื้อความและ UI', en: 'Body & UI' }, family: "'Hanken Grotesk', 'IBM Plex Sans Thai', system-ui, sans-serif", sample: 'Every number, in plain sight. A licensed CPA behind your accounts.', sampleTh: 'ทุกตัวเลขอยู่ในสายตา ผู้สอบบัญชีรับอนุญาตอยู่เบื้องหลังบัญชีของคุณ', size: '17px', weight: 400 },
  { role: { th: 'ภาษาไทย · หัวเรื่อง', en: 'Thai · headlines' }, family: "'Noto Serif Thai', 'Cormorant Garamond', serif", sample: 'บัญชีที่ชัดเจน', size: '36px', weight: 500 },
];

export const LOGO_LOCKUPS: { name: Bilingual; body: Bilingual }[] = [
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

export const PILLARS: { name: Bilingual; tagline: Bilingual; body: Bilingual }[] = [
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

export const HANDLES: Bilingual[] = [
  { th: 'abacuz.co · จดทะเบียนแล้ว', en: 'abacuz.co · registered' },
  { th: 'โดเมนเชิงป้องกัน · abacuz.finance / .tax / .net / .co.th', en: 'Defensive domains · abacuz.finance / .tax / .net / .co.th' },
  { th: 'LINE Official Account · @abacuz', en: 'LINE Official Account · @abacuz' },
  { th: 'Instagram · Facebook · LinkedIn · @abacuz', en: 'Instagram · Facebook · LinkedIn · @abacuz' },
  { th: 'Google Business Profile · ABACUZ', en: 'Google Business Profile · ABACUZ' },
  { th: 'ตรวจเครื่องหมายการค้าก่อนพิมพ์ · ยังเปิด', en: 'Trademark sanity check before any print · still open' },
];

export const LOCKED_ITEMS: Bilingual[] = [
  { th: 'ชื่อ โดเมน กฎการสะกดตัวพิมพ์ใหญ่ทั้งหมด', en: 'Name, domain, all-caps casing rule' },
  { th: 'โทนแบรนด์ · อบอุ่น น่าเชื่อถือ พรีเมียม', en: 'Warm trust-premium register' },
  { th: 'แก่นความคิด · ลูกคิดที่โปร่งใส', en: 'The transparent-abacus brand idea' },
  { th: 'พาเลตต์ · กรมท่า / ทอง / งาช้าง', en: 'Navy / gold / ivory palette' },
  { th: 'ทิศทางโลโก้ · ลูกคิดทอง + serif คลาสสิก', en: 'Logo direction · gold abacus + classical serif' },
];

export const OPEN_ITEMS: Bilingual[] = [
  { th: 'อาร์ตเวิร์กโลโก้ฉบับสมบูรณ์ (เวกเตอร์จากคอนเซ็ปต์)', en: 'Final logo artwork — vectorised from the concept' },
  { th: 'การปรับ hex และโทนทองบนจอและงานพิมพ์', en: 'Exact hex + gold tone on screen and in print' },
  { th: 'ทดสอบจับคู่ฟอนต์ไทยบนหน้าจอจริง', en: 'Thai type-pairing test on real screens' },
  { th: 'ถ้อยคำคำบรรยายบริการ · ยืนยันกับฝ่ายตรวจสอบกฎหมาย', en: 'Descriptor wording · confirm with the legal review' },
  { th: 'ภาพผู้ก่อตั้งที่ยืนยันแล้ว (คุณจอย)', en: 'Confirmed authentic founder photo (Khun Joy)' },
  { th: 'ตรวจเครื่องหมายการค้าก่อนงานพิมพ์ใด ๆ', en: 'Trademark sanity check before any print' },
];
