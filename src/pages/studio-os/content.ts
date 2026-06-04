/**
 * StudioOS page copy — v4, verbatim.
 *
 * Source: PROXYZ Studio Drive, New-Copy/S-OS/2026-06-02-studioos-page-copy-prospect-v4.md
 * Tew's explicit decision (2026-06-03): ship v4 word-for-word. The honesty
 * flags raised against ~5 lines (hero "runs the routine", 02 "stays current on
 * its own", 03/04 autonomy claims) were surfaced and overridden by the founder.
 * Do not silently edit this copy. Section structure 00-07 is locked.
 *
 * The MODULES block is NOT from v4 (v4 has no product tour). It is the approved
 * "show the product" block. Descriptions are plain and descriptive of what each
 * module IS, kept honest (no autonomy claims).
 */

export interface BulletItem {
  /** Bold lead-in (rendered in --fg). */
  lead: string;
  /** Remainder of the line (rendered muted). */
  rest: string;
}

export interface ModuleItem {
  name: string;
  description: string;
}

export const studioOsContent = {
  hero: {
    eyebrow: 'STUDIOOS',
    h1Lines: ['StudioOS.', 'The operating brain', 'for your company.'],
    h2: 'One place to run your whole company. It keeps the plan, runs the routine, and puts your data to work.',
    primaryCta: { label: 'Book a call', href: '/#booking' },
  },

  problem: {
    label: '01 / THE PROBLEM',
    heading: 'Running a company is harder than it should be.',
    bodyLines: [
      "Most companies aren't run by a system.",
      'They’re held together by the few people who remember how it all works.',
      'Updates scatter across chats, answers depend on who’s around, and every decision still runs through you.',
      "More tools won’t fix that. One place that holds it together will.",
    ],
  },

  whatItIs: {
    label: '02 / WHAT IT IS',
    heading: 'What StudioOS is.',
    paragraphs: [
      'StudioOS is the operating system for your company. Your plan, numbers, tasks, and meetings in one place that stays current on its own.',
      'Think of it as the brain of the business. It remembers everything, keeps everyone pointed the same way, and shows you exactly how the company is doing at any moment.',
      'If you can use a phone, you can run your company on it.',
    ],
  },

  // Approved "show the product" block. Not part of v4 copy.
  modules: {
    label: '✦ / INSIDE STUDIOOS',
    heading: 'Everything your company runs on, in one place.',
    intro: 'Six parts, one system. A live walkthrough drops in here soon.',
    items: [
      { name: 'Meetings', description: 'A fixed weekly rhythm. After each meeting the AI drafts the decisions and to-dos for you to approve.' },
      { name: 'To-dos', description: 'Every task with an owner and a due date. Who is doing what, due when, in one view.' },
      { name: 'Goals', description: 'Your quarterly goals with owners and progress. The targets the company commits to.' },
      { name: 'Issues', description: 'Surface the friction the moment it shows up. Discuss, decide, close. Nothing rots in a chat.' },
      { name: 'Scorecard', description: 'The weekly numbers that matter, one row each. The dashboard you actually read.' },
      { name: 'Vision & plan', description: 'Core values, focus, and the plan from this quarter to ten years out. The company’s true north.' },
    ] as ModuleItem[],
  },

  whatYouGet: {
    label: '03 / WHAT YOU GET',
    heading: 'What it does for you.',
    bullets: [
      { lead: 'Your time back.', rest: 'The day-to-day runs without you chasing people for updates.' },
      { lead: 'Nothing slips.', rest: 'Every task, decision, and number has a home, not a chat thread.' },
      { lead: 'A team that knows what to do.', rest: 'Everyone sees the plan, their tasks, and how the company is doing.' },
      { lead: 'Faster decisions.', rest: 'The numbers that matter, current, every week.' },
      { lead: 'The routine, handled.', rest: 'Reports, reminders, and follow-ups run on their own.' },
    ] as BulletItem[],
  },

  howAiHelps: {
    label: '04 / HOW THE AI HELPS',
    heading: 'The AI works for you, in plain English.',
    lead: 'StudioOS has AI built in. Nothing to set up, nothing technical to learn. It works in the background like an operator who already knows your business.',
    bullets: [
      { lead: 'It surfaces what matters without being asked.', rest: 'How sales are tracking, what’s overdue, what needs you today.' },
      { lead: 'It writes up your meetings,', rest: 'notes the decisions, and creates the tasks. You just approve.' },
      { lead: 'It handles the repetitive work', rest: 'so your team doesn’t have to.' },
      { lead: 'It never forgets', rest: 'a number, a decision, or a conversation.' },
    ] as BulletItem[],
    closing: 'The more it runs your operation, the sharper it gets.',
  },

  builtForYou: {
    label: '05 / BUILT FOR YOU',
    heading: 'Built around how you work.',
    paragraphs: [
      'StudioOS is not a one-size template. We shape it to your business, whether you run on staff, stock, clients, or jobs.',
      'You get a system that matches how you already work, only smoother.',
    ],
  },

  howYouGetIt: {
    label: '06 / HOW YOU GET IT',
    heading: 'We install it for you.',
    steps: [
      { lead: 'Book a call.', rest: 'We learn how you run today.' },
      { lead: 'We build and install StudioOS around it,', rest: 'and train your team.' },
      { lead: 'You run on it,', rest: 'with us alongside as long as you want.' },
    ] as BulletItem[],
  },

  bookACall: {
    label: '07 / LET’S TALK',
    heading: 'See what it would do for your company.',
    body: 'Book a call. We’ll show you StudioOS and where it would save you the most time. No tech talk.',
    closing: 'A company that runs on a system, not on you.',
    primaryCta: { label: 'Book a call', href: '/#booking' },
  },
} as const;
