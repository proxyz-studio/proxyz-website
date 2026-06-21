// src/content/mira-class.ts
//
// MIRA Valley × PROXYZ — AI Workshop team page content (English).
//
// This is the content layer for src/pages/MiraClass.tsx and the components
// under src/features/mira-class/. Keeping all human-readable copy here means a
// Thai pass is a content-only edit — swap the strings in this file and nothing
// in the components changes.
//
// Source of truth:
//   01-Clients/Prospects/MIRA/_output/2026-06-19-mira-ai-training-schedule-for-khun-gib-v1.md
//   01-Clients/Prospects/MIRA/_output/2026-06-19-mira-teaching-tool-what-were-building-v1.md
//
// TODO: Thai pass — translate all string values here for a TH locale.

export interface MiraClassSession {
  /** Short label, e.g. "Session 1" */
  tag: string;
  /** Full session title */
  title: string;
  /** One-line promise shown beneath the title */
  promise: string;
  /** "You'll walk away able to..." bullets (2 to 4) */
  outcomes: string[];
  /** Duration note */
  duration: string;
  /** Fill-in placeholder for date/time — Tew fills this in later */
  schedulePlaceholder: string;
  /** Fill-in placeholder for location — Tew fills this in later */
  locationPlaceholder: string;
}

/** One line in a fake chat exchange used by the prompt-demo toy. */
export interface MiraChatLine {
  /** Who is speaking — drives the bubble alignment + colour */
  role: 'you' | 'ai';
  /** The bubble text */
  text: string;
}

export interface MiraClassContent {
  /** Browser tab title */
  pageTitle: string;
  /** Top co-brand wordmark text */
  cobrand: string;

  hero: {
    eyebrow: string;
    /** First, smaller line above the big headline */
    kicker: string;
    /** Big kinetic headline — revealed per-line on load */
    headline: string;
    subline: string;
    /** The AI "reply" that types itself out, framing the journey */
    typedReply: string;
    /** Tiny "AI assistant" label above the typed reply */
    typedLabel: string;
    /** Scroll cue text at the bottom of the hero */
    scrollCue: string;
  };

  /** Short labels for the journey-spine nodes (one per section in order) */
  journey: string[];

  sessions: [MiraClassSession, MiraClassSession];

  /** The interactive "weak vs strong prompt" teaching toy */
  promptDemo: {
    eyebrow: string;
    heading: string;
    intro: string;
    /** Labels on the two ends of the toggle */
    toggleWeak: string;
    toggleStrong: string;
    weak: {
      /** Tiny tag describing this prompt style */
      badge: string;
      /** What the user "typed" */
      prompt: string;
      /** The AI exchange that results */
      chat: MiraChatLine[];
      /** One-line takeaway under the chat */
      verdict: string;
    };
    strong: {
      badge: string;
      prompt: string;
      /** The Role / Task / Context / Format parts, shown as chips */
      recipe: { label: string; value: string }[];
      chat: MiraChatLine[];
      verdict: string;
    };
    /** Closing line under the whole toy */
    footnote: string;
  };

  preClass: {
    heading: string;
    intro: string;
    /** What the personal link does (no URL — placeholder only) */
    linkCard: {
      heading: string;
      body: string;
      placeholder: string;
    };
  };

  prepare: {
    heading: string;
    items: string[];
  };

  schedule: {
    heading: string;
    note: string;
  };

  closing: string;

  footer: string;
}

export const MIRA_CLASS_CONTENT: MiraClassContent = {
  pageTitle: 'MIRA Valley × PROXYZ — AI Workshop',
  cobrand: 'MIRA Valley × PROXYZ',

  hero: {
    eyebrow: 'AI Workshop · MIRA Valley Team',
    kicker: 'From',
    headline: 'confused\nto confident',
    subline:
      'Two hands-on sessions, two hours each. You will be on your own laptop, working on real MIRA tasks the whole time. No tech background needed. We start at zero.',
    typedLabel: 'Your AI assistant',
    typedReply:
      "Hi! By the end of this workshop, you'll go from \"what even is AI?\" to using it every day in your job. No jargon. Just you, your laptop, and real MIRA work.",
    scrollCue: 'Scroll to begin',
  },

  // 7 labels, one per data-spine-section in DOM order:
  // Hero · SessionsScene · PromptDemo · PreClassLink · WhatToBring · Schedule · Closing
  journey: ['Start', 'Session 1', 'Session 2', 'Try it', 'Your link', 'Bring', 'See you'],

  sessions: [
    {
      tag: 'Session 1',
      title: 'What AI Actually Is',
      promise:
        'By the end of this session you will understand what AI really is, why it can sound confident and still be wrong, and you will have written something real for MIRA with it.',
      outcomes: [
        'Explain in one sentence what AI does and does not do, with an example you saw go wrong on your own screen',
        'State the three golden rules and understand why each one matters',
        'Use a simple four-part recipe to turn a weak prompt into something genuinely useful',
        'Produce a real MIRA draft you would actually send',
      ],
      duration: '2 hours, hands-on',
      schedulePlaceholder: '[Session 1 — date / time]',
      locationPlaceholder: '[Session 1 — location]',
    },
    {
      tag: 'Session 2',
      title: 'Putting AI to Work in Your Job',
      promise:
        'By the end of this session you will research with sources you can click, draft and edit real work in the MIRA voice, and the team will leave with a shared prompt library you all keep using.',
      outcomes: [
        'Research a real question and verify the answer by clicking the source',
        'Run a draft-then-edit workflow: AI gets you 80 percent in 30 seconds, you bring the last 20 percent that sounds like MIRA',
        'Write a reusable prompt for your own department and add it to the shared team cookbook',
      ],
      duration: '2 hours, hands-on',
      schedulePlaceholder: '[Session 2 — date / time]',
      locationPlaceholder: '[Session 2 — location]',
    },
  ],

  promptDemo: {
    eyebrow: 'Try it yourself',
    heading: 'A weak prompt vs a strong one',
    intro:
      'This is the single biggest thing you will learn. Same AI, same question. The only difference is how you ask. Flip the switch and watch the answer change.',
    toggleWeak: 'Weak prompt',
    toggleStrong: 'Strong prompt',
    weak: {
      badge: 'Vague · one line',
      prompt: 'write something about our villas',
      chat: [
        { role: 'you', text: 'write something about our villas' },
        {
          role: 'ai',
          text: 'Our villas offer a luxurious living experience with modern amenities and beautiful surroundings. Perfect for discerning buyers seeking comfort and elegance in a prime location.',
        },
      ],
      verdict: 'Generic. Could be any developer, anywhere. You would never send this.',
    },
    strong: {
      badge: 'Role · Task · Context · Format',
      prompt:
        'You are a MIRA Valley sales writer. Write a 2-line Instagram caption for our 3-bedroom hillside villa, warm and confident, for buyers who want privacy and a view. End with a soft call to visit.',
      recipe: [
        { label: 'Role', value: 'A MIRA Valley sales writer' },
        { label: 'Task', value: 'Write a 2-line Instagram caption' },
        { label: 'Context', value: '3-bed hillside villa · privacy + view' },
        { label: 'Format', value: 'Warm, confident, soft call to visit' },
      ],
      chat: [
        {
          role: 'you',
          text: 'You are a MIRA Valley sales writer. Write a 2-line Instagram caption for our 3-bedroom hillside villa — warm, confident, for buyers who want privacy and a view. End with a soft call to visit.',
        },
        {
          role: 'ai',
          text: 'Wake up to the hills, not the neighbours. Three bedrooms, one unbroken view, all yours.\n\nCome see it before it is gone — DM us to book a private visit. 🌿',
        },
      ],
      verdict: 'Specific. Sounds like MIRA. You could post this today.',
    },
    footnote:
      'Role, Task, Context, Format. Four parts. That is the recipe we practise together in Session 1.',
  },

  preClass: {
    heading: 'Before we start — your personal link',
    intro:
      'A few days before Session 1, everyone on the team gets a personal link. It opens a short, friendly AI chat that takes about 3 minutes. A few easy questions: have you used AI before, what worries you, what would actually help your job. There are no wrong answers. Nothing to pass or fail. The chat helps tailor the session to the real room.',
    linkCard: {
      heading: 'Your personal link',
      body: 'Your link will be sent to you by LINE or email before Session 1. Open it on your phone or laptop at a time that suits you.',
      placeholder: 'Link sent individually before class',
    },
  },

  prepare: {
    heading: 'What to bring',
    items: [
      'A charged laptop and your charger. Any laptop with a web browser works. A phone is a backup, not a substitute.',
      'About 10 minutes to complete the personal pre-class chat when your link arrives.',
      'One real piece of your own work to practise on. A buyer enquiry, a villa caption, a site update. Nothing with private client or financial data. We will improve it live.',
      'An open mind. Come curious. The only wrong move is not trying.',
    ],
  },

  schedule: {
    heading: 'Schedule',
    note: 'Dates and locations will be confirmed and sent to you directly.',
  },

  closing: 'See you there.',

  footer: 'Prepared by PROXYZ Studio for MIRA Valley',
};

// ─────────────────────────────────────────────────────────────────────────────
// THAI (ไทย) — WORKING DRAFT. Needs Tew's native pass + iLing review before this
// reaches the MIRA team. Same shape as the English object above; the page picks
// one based on the language toggle. Plain, warm, non-technical Thai.
// ─────────────────────────────────────────────────────────────────────────────
export const MIRA_CLASS_CONTENT_TH: MiraClassContent = {
  pageTitle: 'MIRA Valley × PROXYZ — เวิร์กช็อป AI',
  cobrand: 'MIRA Valley × PROXYZ',

  hero: {
    eyebrow: 'เวิร์กช็อป AI · ทีม MIRA Valley',
    kicker: 'จาก',
    headline: 'งุนงง\nสู่มั่นใจ',
    subline:
      'สองคาบ ลงมือทำจริง คาบละสองชั่วโมง คุณจะได้นั่งหน้าโน้ตบุ๊กของตัวเอง ทำงานจริงของ MIRA ตลอดทั้งคาบ ไม่ต้องมีพื้นฐานด้านเทคโนโลยี เราเริ่มจากศูนย์ไปด้วยกัน',
    typedLabel: 'ผู้ช่วย AI ของคุณ',
    typedReply:
      'สวัสดีค่ะ! พอจบเวิร์กช็อปนี้ คุณจะเปลี่ยนจาก "AI คืออะไรกันแน่?" ไปเป็นใช้มันในงานทุกวัน ไม่มีศัพท์เทคนิค มีแค่คุณ โน้ตบุ๊กของคุณ และงานจริงของ MIRA',
    scrollCue: 'เลื่อนลงเพื่อเริ่ม',
  },

  journey: ['เริ่ม', 'คาบที่ 1', 'คาบที่ 2', 'ลองเลย', 'ลิงก์ของคุณ', 'เตรียมตัว', 'เจอกัน'],

  sessions: [
    {
      tag: 'คาบที่ 1',
      title: 'AI คืออะไรจริงๆ',
      promise:
        'พอจบคาบนี้ คุณจะเข้าใจว่า AI คืออะไรจริงๆ ทำไมมันถึงพูดอย่างมั่นใจแต่ก็ยังผิดได้ และคุณจะได้เขียนงานจริงของ MIRA ด้วย AI ไปแล้วหนึ่งชิ้น',
      outcomes: [
        'อธิบายได้ในหนึ่งประโยคว่า AI ทำอะไรได้และทำอะไรไม่ได้ พร้อมตัวอย่างที่คุณเห็นมันพลาดบนหน้าจอของคุณเอง',
        'บอกกฎทอง 3 ข้อได้ และเข้าใจว่าทำไมแต่ละข้อถึงสำคัญ',
        'ใช้สูตรง่ายๆ 4 ส่วน เปลี่ยนคำสั่งที่อ่อนให้กลายเป็นคำสั่งที่ใช้ได้จริง',
        'สร้างงานร่างจริงของ MIRA ที่คุณกล้าส่งออกไปได้จริง',
      ],
      duration: '2 ชั่วโมง ลงมือทำจริง',
      schedulePlaceholder: '[คาบที่ 1 — วัน / เวลา]',
      locationPlaceholder: '[คาบที่ 1 — สถานที่]',
    },
    {
      tag: 'คาบที่ 2',
      title: 'ใช้ AI ทำงานจริงในหน้าที่ของคุณ',
      promise:
        'พอจบคาบนี้ คุณจะค้นข้อมูลโดยมีแหล่งอ้างอิงที่คลิกดูได้ ร่างและแก้งานจริงในสไตล์ของ MIRA และทั้งทีมจะได้คลังคำสั่งร่วมกันที่ทุกคนใช้ต่อได้',
      outcomes: [
        'ค้นคำถามจริงหนึ่งข้อ แล้วตรวจคำตอบด้วยการคลิกดูแหล่งที่มา',
        'ทำงานแบบร่างก่อนแล้วค่อยแก้ AI พาคุณไปถึง 80% ใน 30 วินาที คุณเติมอีก 20% ที่ทำให้ฟังดูเป็น MIRA',
        'เขียนคำสั่งที่นำกลับมาใช้ซ้ำได้สำหรับแผนกของคุณเอง แล้วเพิ่มเข้าไปในคลังคำสั่งของทีม',
      ],
      duration: '2 ชั่วโมง ลงมือทำจริง',
      schedulePlaceholder: '[คาบที่ 2 — วัน / เวลา]',
      locationPlaceholder: '[คาบที่ 2 — สถานที่]',
    },
  ],

  promptDemo: {
    eyebrow: 'ลองด้วยตัวเอง',
    heading: 'คำสั่งที่อ่อน เทียบกับ คำสั่งที่ดี',
    intro:
      'นี่คือสิ่งสำคัญที่สุดที่คุณจะได้เรียน AI ตัวเดียวกัน คำถามเดียวกัน ต่างกันแค่วิธีถาม ลองสลับดูแล้วดูคำตอบเปลี่ยน',
    toggleWeak: 'คำสั่งที่อ่อน',
    toggleStrong: 'คำสั่งที่ดี',
    weak: {
      badge: 'กว้าง · บรรทัดเดียว',
      prompt: 'เขียนอะไรสักอย่างเกี่ยวกับวิลล่าของเรา',
      chat: [
        { role: 'you', text: 'เขียนอะไรสักอย่างเกี่ยวกับวิลล่าของเรา' },
        {
          role: 'ai',
          text: 'วิลล่าของเรามอบประสบการณ์การพักอาศัยอันหรูหรา พร้อมสิ่งอำนวยความสะดวกทันสมัยและสภาพแวดล้อมที่สวยงาม เหมาะสำหรับผู้ที่มองหาความสะดวกสบายและความสง่างามในทำเลชั้นเยี่ยม',
        },
      ],
      verdict: 'กลางๆ จะเป็นโครงการไหน ที่ไหนก็ได้ คุณคงไม่ส่งข้อความแบบนี้ออกไป',
    },
    strong: {
      badge: 'บทบาท · งาน · บริบท · รูปแบบ',
      prompt:
        'คุณคือนักเขียนฝ่ายขายของ MIRA Valley เขียนแคปชั่นอินสตาแกรม 2 บรรทัดสำหรับวิลล่า 3 ห้องนอนริมเขา โทนอบอุ่นและมั่นใจ สำหรับผู้ซื้อที่ต้องการความเป็นส่วนตัวและวิว ปิดท้ายด้วยคำชวนมาเยี่ยมชมแบบนุ่มนวล',
      recipe: [
        { label: 'บทบาท', value: 'นักเขียนฝ่ายขายของ MIRA Valley' },
        { label: 'งาน', value: 'เขียนแคปชั่นอินสตาแกรม 2 บรรทัด' },
        { label: 'บริบท', value: 'วิลล่า 3 ห้องนอนริมเขา · ความเป็นส่วนตัว + วิว' },
        { label: 'รูปแบบ', value: 'อบอุ่น มั่นใจ ปิดท้ายด้วยคำชวนแบบนุ่มนวล' },
      ],
      chat: [
        {
          role: 'you',
          text: 'คุณคือนักเขียนฝ่ายขายของ MIRA Valley เขียนแคปชั่นอินสตาแกรม 2 บรรทัดสำหรับวิลล่า 3 ห้องนอนริมเขา โทนอบอุ่นและมั่นใจ สำหรับผู้ซื้อที่ต้องการความเป็นส่วนตัวและวิว ปิดท้ายด้วยคำชวนมาเยี่ยมชมแบบนุ่มนวล',
        },
        {
          role: 'ai',
          text: 'ตื่นมาพบขุนเขา ไม่ใช่เพื่อนบ้าน สามห้องนอน หนึ่งวิวที่ไม่มีอะไรบดบัง เป็นของคุณทั้งหมด\n\nมาชมก่อนใคร ทักมาเพื่อจองเข้าชมแบบส่วนตัว 🌿',
        },
      ],
      verdict: 'เฉพาะเจาะจง ฟังดูเป็น MIRA โพสต์ได้เลยวันนี้',
    },
    footnote:
      'บทบาท งาน บริบท รูปแบบ สี่ส่วนนี้คือสูตรที่เราจะฝึกด้วยกันในคาบที่ 1',
  },

  preClass: {
    heading: 'ก่อนเริ่ม — ลิงก์ส่วนตัวของคุณ',
    intro:
      'ก่อนคาบที่ 1 ไม่กี่วัน ทุกคนในทีมจะได้ลิงก์ส่วนตัว เปิดแล้วจะเป็นแชตกับ AI สั้นๆ เป็นกันเอง ใช้เวลาประมาณ 3 นาที ถามคำถามง่ายๆ ไม่กี่ข้อ เช่น เคยใช้ AI ไหม กังวลเรื่องอะไร อะไรจะช่วยงานคุณได้จริง ไม่มีคำตอบผิด ไม่มีอะไรต้องสอบผ่านหรือตก แชตนี้ช่วยให้เราปรับคาบเรียนให้เข้ากับห้องเรียนจริงๆ',
    linkCard: {
      heading: 'ลิงก์ส่วนตัวของคุณ',
      body: 'ลิงก์ของคุณจะถูกส่งให้ทาง LINE หรืออีเมลก่อนคาบที่ 1 เปิดบนมือถือหรือโน้ตบุ๊กตอนไหนก็ได้ที่สะดวก',
      placeholder: 'ลิงก์จะส่งให้แต่ละคนก่อนเริ่มเรียน',
    },
  },

  prepare: {
    heading: 'สิ่งที่ต้องเตรียมมา',
    items: [
      'โน้ตบุ๊กที่ชาร์จเต็มพร้อมที่ชาร์จ โน้ตบุ๊กเครื่องไหนที่มีเว็บเบราว์เซอร์ก็ใช้ได้ มือถือเป็นแค่ตัวสำรอง ไม่ใช่ตัวแทน',
      'เวลาประมาณ 10 นาที สำหรับทำแชตเตรียมตัวก่อนเรียนเมื่อลิงก์มาถึง',
      'งานจริงของคุณเองหนึ่งชิ้นไว้ฝึก เช่น คำถามจากผู้ซื้อ แคปชั่นวิลล่า หรืออัปเดตหน้างาน อย่าใช้ข้อมูลส่วนตัวของลูกค้าหรือข้อมูลการเงิน เราจะช่วยกันปรับให้ดีขึ้นสดๆ',
      'ใจที่เปิดกว้าง มาแบบอยากรู้อยากเห็น สิ่งเดียวที่ผิดคือการไม่ลอง',
    ],
  },

  schedule: {
    heading: 'ตารางเรียน',
    note: 'วันและสถานที่จะยืนยันและส่งให้คุณโดยตรง',
  },

  closing: 'แล้วเจอกันนะคะ',

  footer: 'จัดทำโดย PROXYZ Studio สำหรับ MIRA Valley',
};
