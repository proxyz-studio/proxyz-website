// src/content/mira.ts
//
// MIRA Valley × PROXYZ — Month 1 proposal content (bilingual TH / EN).
//
// Source of truth: the send-ready FINAL proposal at
//   01-Clients/Prospects/MIRA/04-proposal/2026-06-02-mira-month-1-proposal-FINAL-bilingual.html
// The Thai and English BODY copy here is the approved FINAL text, verbatim.
// A small number of UI-chrome strings (cover eyebrow, meta labels, scroll hint,
// section-rail labels) are new for the live page and carry a TODO for Tew's
// native-Thai check — they are short, standard phrasings.
//
// This file is the *content layer*. The presentation + animation lives in
// src/pages/Mira.tsx. Keeping them separate is the seed of the reusable
// "live proposal" system: future proposals = a new content module + the
// same presentation shell.

export type MiraLocale = 'th' | 'en';

export interface MiraQuickWin {
  title: string;
}

export interface MiraClassWeek {
  week: string;
  title: string;
  detail: string;
}

export interface MiraPriceRow {
  label: string;
  /** Display value. The month-1 figure animates as a count-up; mark it. */
  value: string;
  countTo?: number;
  prefix?: string;
  emphasis?: boolean;
}

export interface MiraSectionMeta {
  num: string;
  /** Mono eyebrow label. */
  label: string;
  /** Serif headline. */
  title: string;
}

export interface MiraCopy {
  /** Toggle button label for this locale. */
  langName: string;
  cover: {
    eyebrow: string;
    lede: string;
    coBrandNote: string;
    parentNote: string;
    meta: { label: string; lines: string[] }[];
    scrollHint: string;
  };
  letter: { salutation: string; opening: string };
  /** Right-rail section index labels, in order. */
  rail: { id: string; label: string }[];
  s01: MiraSectionMeta & { body: string[] };
  s02: MiraSectionMeta & { body: string[]; chip: string };
  s03: MiraSectionMeta & {
    intro: string;
    piece1: { kicker: string; body: string; commitLead: string; quickWins: MiraQuickWin[] };
    piece2: { kicker: string; body: string; weeks: MiraClassWeek[]; outro: string };
    piece3: { kicker: string; body: string };
  };
  s04: MiraSectionMeta & { body: string[] };
  s05: MiraSectionMeta & { intro: string; items: string[]; outro: string };
  s06: MiraSectionMeta & { body: string[] };
  s07: MiraSectionMeta & { intro: string; rows: MiraPriceRow[]; note: string };
  signoff: {
    closing: string;
    signature: string;
    name: string;
    title: string;
    org: string;
    email: string;
    phone: string;
  };
  footer: {
    tagline: string;
    studio: { label: string; lines: string[] };
    contact: { label: string; lines: string[] };
    platform: { label: string; lines: string[] };
    copyright: string;
    confidential: string;
  };
}

const TH: MiraCopy = {
  langName: 'ไทย',
  cover: {
    eyebrow: 'ข้อเสนอ · ฉบับที่ 01 · รากฐาน AI',
    lede:
      'เดือนแรกที่ออกแบบมาเพื่อวางรากฐาน AI ให้ทีม MIRA เวิร์กโฟลว์ที่คมขึ้น และให้เห็นว่าการที่เราเข้ามาร่วมงานสร้างความแตกต่างได้อย่างไร',
    coBrandNote: 'จัดทำด้วยความตั้งใจสำหรับ MIRA Valley',
    parentNote: 'โครงการในเครือ Ananda Development PCL',
    meta: [
      { label: 'จัดทำสำหรับ', lines: ['คุณกิ๊บ', 'ประธานเจ้าหน้าที่บริหาร MIRA Valley'] },
      { label: 'จาก', lines: ['อานนท์ (ทิว) ศักดิ์ศรี', 'PROXYZ Studio'] },
      { label: 'ขอบเขตงาน', lines: ['เดือนที่ 1', 'รากฐาน AI'] },
      { label: 'วันที่ · อ้างอิง', lines: ['2 มิถุนายน 2026', 'MIRA-2026-06'] },
    ],
    scrollHint: 'เลื่อนเพื่ออ่าน',
  },
  letter: {
    salutation: 'เรียน คุณกิ๊บ',
    opening:
      'ขอบคุณสำหรับการพูดคุยครับ ต่อไปนี้คือสิ่งที่ผมอยากทำให้ MIRA Valley ในเดือนแรกที่เราได้ร่วมงานกัน',
  },
  rail: [
    { id: 's01', label: 'สถานการณ์' },
    { id: 's02', label: 'เริ่มอย่างไร' },
    { id: 's03', label: 'เดือนแรก' },
    { id: 's04', label: 'แก่นของงาน' },
    { id: 's05', label: 'มองไปข้างหน้า' },
    { id: 's06', label: 'ทำไม PROXYZ' },
    { id: 's07', label: 'ข้อตกลง' },
  ],
  s01: {
    num: '01',
    label: 'สถานการณ์ตามที่ผมมองเห็น',
    title: 'รากฐานต้องมาก่อน',
    body: [
      'MIRA Valley ได้สร้างสิ่งที่หายากในตลาดบ้านพักหรูระดับสูงสุดของภูเก็ต เงินทุนได้ถูกลงทุนไปเป็นจำนวนมาก วิลล่ากำลังเป็นรูปเป็นร่างขึ้นอย่างต่อเนื่อง แต่ยอดพรีเซลส์ยังไม่ขยับในจังหวะที่โครงการสมควรได้รับ และทีมงานยังทำงานโดยไม่มีรากฐานด้าน AI ในตลาดที่นับวันยิ่งต้องการสิ่งนี้',
      'ยังมีงานอีกมากที่ต้องทำ คำถามที่ใหญ่ที่สุด ใครคือผู้ซื้อที่ใช่สำหรับวิลล่า MIRA ในตอนนี้ สมควรได้รับการวิจัยอย่างจริงจัง และเป็นสิ่งหนึ่งที่เราสามารถลงมือทำร่วมกันได้เป็นงานแยกในเดือนถัดไป',
      'แต่ก่อนถึงตรงนั้น ทีมงานต้องการรากฐานก่อน เวิร์กโฟลว์ที่ดีขึ้น การตอบสนองด้านการขายที่เร็วขึ้น ความคุ้นเคยกับเครื่องมือ AI ที่กำลังเปลี่ยนวิธีการขายอสังหาริมทรัพย์ทั่วโลก เดือนแรกคือการสร้างรากฐานนั้น',
    ],
  },
  s02: {
    num: '02',
    label: 'เราจะเริ่มอย่างไร',
    title: 'เริ่มด้วยการตรวจสอบฟรี',
    chip: 'ฟรี · ไม่มีพันธะ',
    body: [
      'ก่อนการตัดสินใจร่วมงานกัน ผมจะทำการตรวจสอบบริษัทของ MIRA Valley ให้ฟรี เราใช้เวลาด้วยกัน 60 นาที หรือมากกว่านั้น ผมจะเรียนรู้ว่า MIRA ดำเนินงานอย่างไรในวันนี้ คุยกันถึงสิ่งที่ทำงานได้ดี สิ่งที่ติดขัด และจุดที่ AI กับระบบอัตโนมัติช่วยได้',
      'หากหลังจากการตรวจสอบ MIRA Valley ตัดสินใจไม่ร่วมงานกัน ก็ไม่เป็นไรครับ ไม่มีคำถาม ไม่มีพันธะใด ๆ ผลการตรวจสอบเป็นของคุณกิ๊บที่จะเก็บไว้ใช้ได้ การตรวจสอบนี้คือของขวัญจากผม ไม่ว่าเราจะร่วมงานกันต่อหรือไม่ก็ตาม',
    ],
  },
  s03: {
    num: '03',
    label: 'สิ่งที่ผมจะทำให้ MIRA ในเดือนแรก',
    title: 'งานสามชิ้น ทำคู่กันตลอดสี่สัปดาห์',
    intro: 'งานสามชิ้นที่จะทำคู่กันไปตลอดสี่สัปดาห์',
    piece1: {
      kicker: '1 · เซสชั่นทำความเข้าใจการทำงาน และ Quick Wins',
      body:
        'ในช่วงต้นเดือน ผมจะนั่งคุยกับสมาชิกทีม MIRA คนสำคัญ และเรียนรู้ว่าพวกเขาทำงานกันอย่างไรจริง ๆ พวกเขาสื่อสารกันแบบไหน ใช้เครื่องมืออะไร ตรงไหนที่รู้สึกช้าหรือติดขัด เซสชั่นนี้เป็นทั้งการค้นพบสำหรับผม และการพูดคุยสำหรับทีม',
      commitLead: 'จากเซสชั่นนั้น ผมรับปากว่าจะสร้างหรือปรับปรุงสิ่งเหล่านี้ตลอดเดือน:',
      quickWins: [
        { title: 'เทมเพลตการตอบลูกค้าที่สนใจ ที่เป็นมาตรฐาน ส่งได้ภายในไม่กี่นาที รองรับหลายภาษา' },
        { title: 'ฟอร์มจับการสอบถามขาเข้าอัตโนมัติ จาก Facebook, Instagram และ LINE มาไว้ในที่เดียว พร้อมการแจ้งเตือนทันที' },
        { title: 'โครงสร้างการประชุมขายประจำสัปดาห์ 30 นาที ที่ทำให้คุณกิ๊บเห็นภาพรวมไปป์ไลน์ในเวลาไม่ถึงครึ่งชั่วโมง' },
        { title: 'คลังร่วมของ AI prompts ที่ทีมใช้สำหรับงานประจำวัน (สร้างร่วมกับทีมในสัปดาห์ที่ 4)' },
        { title: 'ระเบียบวินัยการบันทึกข้อมูล ในทุกขั้นตอนของกระบวนการขายและการตลาด ในรูปแบบที่ AI อ่านและนำไปใช้งานได้' },
        { title: 'คู่มือพื้นฐานเรื่อง AI Memory Layers ว่า AI จดจำอะไร ลืมอะไร และวิธีออกแบบการทำงานให้ AI ใช้งานได้ดี' },
        { title: 'โครงสร้างโฟลเดอร์โครงการที่เป็นมาตรฐาน ที่ทีมใช้กับทุกวิลล่า ทุกแคมเปญ และทุกงานกับลูกค้า' },
        { title: 'แผนผังการเชื่อมต่อ AI กับเครื่องมืออื่น ๆ ว่า AI ตัวไหนเชื่อมกับอะไร และแต่ละการเชื่อมต่อใช้เพื่ออะไร (วิจัย เนื้อหา ระบบอัตโนมัติ การสื่อสาร)' },
      ],
    },
    piece2: {
      kicker: '2 · คลาส AI ประจำสัปดาห์ (4 ครั้ง)',
      body:
        'ทุกสัปดาห์ คลาสออนไลน์ 60 นาทีในช่วงเวลาเดียวกัน ทุกคลาสบันทึกไว้ให้ดูย้อนหลังได้ ทั้งสี่คลาสต่อยอดกัน ออกแบบมาสำหรับทีมที่เริ่มจากศูนย์:',
      weeks: [
        { week: 'สัปดาห์ที่ 1', title: 'พื้นฐาน AI สำหรับนักพัฒนาอสังหาฯ', detail: 'เครื่องมือ AI สมัยใหม่คืออะไร แตกต่างกันอย่างไร (Claude, Perplexity, Grok)' },
        { week: 'สัปดาห์ที่ 2', title: 'การวิจัยด้วย AI', detail: 'วิจัยตลาด คู่แข่ง และพฤติกรรมผู้ซื้อ' },
        { week: 'สัปดาห์ที่ 3', title: 'การเขียนด้วย AI', detail: 'ร่างคำตอบลูกค้า คำบรรยายวิลล่า โพสต์โซเชียล ทั้งไทยและอังกฤษ' },
        { week: 'สัปดาห์ที่ 4', title: 'การดำเนินงานขายด้วย AI', detail: 'ร่วมกันสร้างคลัง prompts และลงมือใช้กับงานจริงของ MIRA' },
      ],
      outro:
        'หลังจบสี่สัปดาห์ ทีมจะทำงานด้วย AI ได้เองในทุก ๆ วัน พร้อมการบันทึกคลาส คลัง prompts และแผ่นสรุปหนึ่งหน้าจากแต่ละคลาส',
    },
    piece3: {
      kicker: '3 · การมีส่วนร่วมรายสัปดาห์ และทบทวนสิ้นเดือน',
      body:
        'ผมจะพบกับคุณกิ๊บ 30 นาทีทุกสัปดาห์ สั้น ๆ ตรงประเด็น เมื่อสิ้นเดือนเราจะคุยกันยาวขึ้น เกี่ยวกับสิ่งที่ได้ผล สิ่งที่เราเรียนรู้ และสิ่งที่ควรทำต่อไป',
    },
  },
  s04: {
    num: '04',
    label: 'สิ่งที่งานนี้เป็นเรื่องของจริง ๆ',
    title: 'สิ่งที่งานนี้เป็นเรื่องของจริง ๆ',
    body: [
      'เดือนแรกวางรากฐานไว้ ทุกอย่างที่เราทำต่อจากนั้นต่อยอดบนรากฐานนี้',
      'เดือนแรกนี้เป็นเรื่องของการแสดงให้เห็นว่าการที่ผมเข้ามามีส่วนร่วมสร้างความแตกต่างให้กับวิธีการทำงานของทีม MIRA อย่างไร สิ่งที่จับต้องได้เป็นส่วนหนึ่งของมัน แต่มูลค่าที่ยั่งยืนคือการมีคนคอยมองเห็นช่องว่างในการดำเนินงานและปิดมันลง และทีมที่จบเดือนด้วยความสามารถที่มากขึ้นอย่างมีนัยสำคัญจากตอนเริ่มต้น',
    ],
  },
  s05: {
    num: '05',
    label: 'มองไปข้างหน้า',
    title: 'มองไปข้างหน้า',
    intro: 'หากเดือนแรกได้ผลดี งานชิ้นต่อไปที่ลึกขึ้นโดยธรรมชาติ ได้แก่:',
    items: [
      'รายงาน Buyer Intelligence Brief ที่ตอบให้ชัดว่าใครคือผู้ซื้อวิลล่า MIRA ในตอนนี้ อยู่ที่ไหน และเข้าถึงได้อย่างไร',
      'ระบบ Lead Generation ของจริง มุ่งเป้าไปยังกลุ่มผู้ซื้อที่มีแนวโน้มสูงที่สุด',
      'โครงสร้างพื้นฐานด้าน AI ที่จริงจังขึ้น ที่ทีมพึ่งพาได้ในการทำงานประจำวัน',
    ],
    outro: 'เรายังไม่ตัดสินใจในสิ่งเหล่านี้ตอนนี้ เราทำเดือนแรกก่อน ดูว่าเราเรียนรู้อะไรร่วมกัน แล้วค่อยคุยกันต่อ',
  },
  s06: {
    num: '06',
    label: 'ทำไม PROXYZ',
    title: 'ทำไม PROXYZ',
    body: [
      'PROXYZ Studio เป็นกิจการที่ผมก่อตั้งขึ้นเมื่อต้นปีนี้ เรานำ AI และระบบอัตโนมัติเข้าสู่ธุรกิจในประเทศไทย MIRA Valley เป็นการรับงานอย่างเป็นทางการครั้งแรกภายใต้บริษัท PROXYZ Studio จำกัด ราคานี้สะท้อนว่านี่คือการรับงานครั้งแรกที่ตั้งใจ และเป็นรากฐานที่เราทั้งคู่กำลังลงทุนร่วมกัน งานนี้ผมเป็นผู้ทำเอง',
    ],
  },
  s07: {
    num: '07',
    label: 'ข้อตกลงของเรา',
    title: 'ข้อตกลงของเรา',
    intro: 'เมื่อเราพร้อมเดินหน้าต่อ ข้อตกลงเรียบง่ายและตรงไปตรงมา:',
    rows: [
      { label: 'การตรวจสอบ', value: 'ฟรี · ไม่มีพันธะ' },
      { label: 'เดือนแรก · ราคารวมทั้งหมด', value: '฿30,000', countTo: 30000, prefix: '฿', emphasis: true },
      { label: 'เดือนต่อ ๆ ไป', value: 'พูดคุยตกลงกันได้' },
    ],
    note:
      'ไม่มีค่าปรับใด ๆ หากต้องการหยุด แต่ละเดือนเป็นการตัดสินใจของตัวเอง ผมจะโทรหาคุณกิ๊บในสัปดาห์นี้เพื่อจัดเวลาการตรวจสอบฟรี',
  },
  signoff: {
    closing: 'ด้วยความนับถือ',
    signature: 'ทิว',
    name: 'อานนท์ (ทิว) ศักดิ์ศรี · ผู้ก่อตั้ง',
    title: '',
    org: 'บริษัท PROXYZ Studio จำกัด',
    email: 'tew@proxyz.studio',
    phone: '081 666 6969',
  },
  footer: {
    tagline: 'StudioOS. สมองที่ขับเคลื่อนการทำงานของบริษัทคุณ',
    studio: { label: 'สตูดิโอ', lines: ['บริษัท PROXYZ Studio จำกัด', 'Venture-operator studio', 'ประเทศไทย'] },
    contact: { label: 'ติดต่อ', lines: ['อานนท์ (ทิว) ศักดิ์ศรี', 'tew@proxyz.studio', '081 666 6969', 'proxyz.studio'] },
    platform: { label: 'แพลตฟอร์ม', lines: ['StudioOS', 'studioos.proxyz.studio'] },
    copyright: '© 2026 PROXYZ STUDIO CO., LTD.',
    confidential: 'เป็นความลับ · จัดทำสำหรับ MIRA VALLEY · ANANDA DEVELOPMENT PCL · REF MIRA-2026-06',
  },
};

const EN: MiraCopy = {
  langName: 'EN',
  cover: {
    eyebrow: 'PROPOSAL · ISSUE 01 · AI FOUNDATION',
    lede:
      'A first month built to give the MIRA team an AI foundation, sharper workflows, and a sense of the difference our involvement makes.',
    coBrandNote: 'Prepared with care for MIRA Valley',
    parentNote: 'A project of Ananda Development PCL',
    meta: [
      { label: 'Prepared for', lines: ['Khun Gib', 'CEO, MIRA Valley'] },
      { label: 'From', lines: ['Arnon (Tew) Saksri', 'PROXYZ Studio'] },
      { label: 'Engagement', lines: ['Month 1', 'AI foundation'] },
      { label: 'Date · Ref', lines: ['2 June 2026', 'MIRA-2026-06'] },
    ],
    scrollHint: 'Scroll to read',
  },
  letter: {
    salutation: 'Dear Khun Gib,',
    opening:
      'Thank you for the conversation. Here is what I would like to do for MIRA Valley in our first month together.',
  },
  rail: [
    { id: 's01', label: 'Situation' },
    { id: 's02', label: 'How we start' },
    { id: 's03', label: 'Month 1' },
    { id: 's04', label: "What it's about" },
    { id: 's05', label: 'Looking ahead' },
    { id: 's06', label: 'Why PROXYZ' },
    { id: 's07', label: 'The arrangement' },
  ],
  s01: {
    num: '01',
    label: 'The situation as I see it',
    title: 'The foundation comes first',
    body: [
      'MIRA Valley has built something genuinely worth selling at the highest tier of the Phuket luxury market. Significant capital has gone in. The villas are taking shape on the ground. But pre-sales have not yet moved at the pace the project deserves, and the team is operating without an AI foundation in a market that increasingly demands one.',
      'There is a lot of work ahead. The biggest question, who exactly are the right buyers for MIRA villas right now, deserves serious research and is one of the things we can take on together as a separate piece of work in the months ahead.',
      'But before that, the team needs a foundation. Better workflows. Faster sales response. Familiarity with the AI tools that are reshaping how property is sold around the world. Month 1 is about building that foundation.',
    ],
  },
  s02: {
    num: '02',
    label: "How we'll start",
    title: 'We start with a free audit',
    chip: 'Free · no obligation',
    body: [
      'Before any commitment, I will perform a free, complimentary audit of MIRA Valley. We sit down together for 60 minutes, or more. I learn how MIRA actually operates today. We talk through what is working, what is stuck, and where AI and automation can help.',
      'If after the audit MIRA Valley decides not to work with me, no questions asked. No strings attached. The audit findings are yours to keep. The audit is my gift, whether or not we continue together.',
    ],
  },
  s03: {
    num: '03',
    label: 'What I will do for MIRA in month 1',
    title: 'Three pieces of work, running together',
    intro: 'Three pieces of work, running together across the four weeks.',
    piece1: {
      kicker: '1 · A workflow understanding session, and operational quick wins',
      body:
        'Early in the month, I sit with key members of the MIRA team and learn how they actually work. How they communicate. What tools they use today. Where they feel slow or stuck. The session is half discovery for me, half discussion for the team. Most teams discover their own bottlenecks once someone asks the right questions.',
      commitLead: 'Out of that session, I commit to building or improving the following over the course of the month:',
      quickWins: [
        { title: 'A standardized inquiry response template the sales team can send within minutes of any new inquiry, in multiple languages' },
        { title: 'An automated inquiry capture form that pulls inbound from Facebook, Instagram, and LINE into one place, with a notification the moment each one lands' },
        { title: "A weekly 30-minute sales pulse meeting structure that gives you a clear picture of the week's pipeline in under half an hour" },
        { title: 'A shared AI prompt library the team uses for daily work (built together with the team in week 4)' },
        { title: 'A data logging discipline so every step of your sales and marketing process is captured in a format AI can read and act on' },
        { title: 'A foundational explainer on AI memory layers covering what models remember, what they forget, and how to design around it' },
        { title: 'A standardized project folder structure the team uses for every villa, every campaign, every client engagement' },
        { title: 'A clear AI tool stack connectivity map showing which AI tool connects to which other tools, and what each connection is for (research, content, automation, communication)' },
      ],
    },
    piece2: {
      kicker: '2 · A weekly AI class for the team (4 sessions)',
      body:
        'Each week, a 60-minute online class at the same time slot, all recorded. The four sessions build on each other, designed for a team starting from zero AI experience:',
      weeks: [
        { week: 'Week 1', title: 'AI basics for a property developer', detail: 'What modern AI tools are. How they differ (Claude, Perplexity, Grok).' },
        { week: 'Week 2', title: 'Research with AI', detail: 'Researching the market, competitors, and buyer behavior.' },
        { week: 'Week 3', title: 'Writing with AI', detail: 'Inquiry responses, villa descriptions, social posts in Thai and English.' },
        { week: 'Week 4', title: 'Sales operations with AI', detail: "Building the team's shared prompt library and using AI on real MIRA tasks." },
      ],
      outro:
        'By the end of the four weeks, the team can do AI-assisted work on their own day to day, with the recordings, the shared prompt library they built, and a one-page reference card from each session.',
    },
    piece3: {
      kicker: '3 · Weekly involvement and a month-end review',
      body:
        'I meet with you for 30 minutes every week. Short, focused, just enough to stay aligned. At the end of the month, a longer conversation about what worked, what we both learned, and what makes sense to do next.',
    },
  },
  s04: {
    num: '04',
    label: 'What this is really about',
    title: 'What this is really about',
    body: [
      'Month 1 sets the foundation. Everything we do together after that builds on it.',
      "This first month is about demonstrating the kind of difference my involvement makes to the way MIRA's team works. The visible artifacts are part of it. The lasting value is having someone in the loop who can see operational gaps and close them, and a team that ends the month meaningfully more capable than they started.",
    ],
  },
  s05: {
    num: '05',
    label: 'Looking ahead',
    title: 'Looking ahead',
    intro: 'If month 1 lands well, the natural next pieces of work are deeper:',
    items: [
      'A proper Buyer Intelligence Brief that answers exactly who is buying MIRA villas right now, where they are, and how to reach them.',
      'A real lead-generation engine targeting the highest-conviction buyer segment.',
      'A more substantial AI infrastructure the team can rely on day to day.',
    ],
    outro: 'We do not commit to any of that now. We do month 1, see what we learn together, and then talk.',
  },
  s06: {
    num: '06',
    label: 'Why PROXYZ',
    title: 'Why PROXYZ',
    body: [
      'PROXYZ Studio is a venture I founded earlier this year. We bring AI and automation into Thai businesses. MIRA Valley is the first formal engagement under PROXYZ Studio Co., Ltd. The price reflects that this is a deliberate first engagement and a foundation we are both investing in. The work is done by me directly.',
    ],
  },
  s07: {
    num: '07',
    label: 'The arrangement',
    title: 'The arrangement',
    intro: 'When we are ready to move forward, the arrangement is simple and transparent:',
    rows: [
      { label: 'The audit discovery session', value: 'Free · no obligation' },
      { label: 'Month 1 all-inclusive · friendly first-engagement', value: '฿30,000', countTo: 30000, prefix: '฿', emphasis: true },
      { label: 'Subsequent months by scope', value: 'Negotiable' },
    ],
    note:
      'There is no penalty for stopping at any point. Each month is its own decision. I will call you this week to schedule the free audit.',
  },
  signoff: {
    closing: 'Warm regards,',
    signature: 'Tew',
    name: 'Arnon (Tew) Saksri · Founder',
    title: '',
    org: 'PROXYZ Studio Co., Ltd.',
    email: 'tew@proxyz.studio',
    phone: '081 666 6969',
  },
  footer: {
    tagline: 'StudioOS. The operating brain for your company.',
    studio: { label: 'Studio', lines: ['PROXYZ Studio Co., Ltd.', 'Venture-operator studio', 'Thailand'] },
    contact: { label: 'Contact', lines: ['Arnon (Tew) Saksri', 'tew@proxyz.studio', '081 666 6969', 'proxyz.studio'] },
    platform: { label: 'Platform', lines: ['StudioOS', 'studioos.proxyz.studio'] },
    copyright: '© 2026 PROXYZ STUDIO CO., LTD.',
    confidential: 'CONFIDENTIAL · PREPARED FOR MIRA VALLEY · ANANDA DEVELOPMENT PCL · REF MIRA-2026-06',
  },
};

export const MIRA_CONTENT: Record<MiraLocale, MiraCopy> = { th: TH, en: EN };

/** Brand surface for the MIRA proposal page. Dark editorial + XYZ trichrome. */
export const MIRA_BRAND = {
  bg: '#0A0A0A',
  ink: '#F2F2F2',
  cream: '#E3D6C7', // MIRA VALLEY light serif wordmark
  // XYZ trichrome + extended accents, mapped one-per-section.
  x: '#F2D78C', // butter
  y: '#5BC9B8', // mint
  z: '#FF4193', // pink (PROXYZ accent)
  blue: '#1E90FF',
  orange: '#FF8A3D',
  lavender: '#B8A4FF',
} as const;

/** Per-section accent, in section order s01..s07. */
export const MIRA_SECTION_ACCENTS = [
  MIRA_BRAND.y, // 01 situation
  MIRA_BRAND.x, // 02 how we start
  MIRA_BRAND.z, // 03 month 1
  MIRA_BRAND.blue, // 04 what it's about
  MIRA_BRAND.orange, // 05 looking ahead
  MIRA_BRAND.lavender, // 06 why proxyz
  MIRA_BRAND.z, // 07 arrangement (climax, brand pink)
] as const;
