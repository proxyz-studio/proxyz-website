import type { Bilingual } from './i18n/Bilingual';

export interface SiteConfig {
  language: string
  siteTitle: string
  siteDescription: string
}

export interface NavigationLink {
  label: string
  href: string
}

export interface NavigationConfig {
  brandName: string
  links: NavigationLink[]
  primaryCta: NavigationLink
}

export interface HeroConfig {
  eyebrow: Bilingual<string>
  titleLines: Bilingual<string[]>
  lead: Bilingual<string>
  primaryCta: { label: Bilingual<string>; href: string }
  secondaryLink: { label: Bilingual<string>; href: string }
}

export interface DiagnosisConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  paragraphs: Bilingual<string[]>
  videoPath?: string
}

export interface PrincipleItem {
  number: string
  text: Bilingual<string>
}

export interface PrinciplesConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  items: PrincipleItem[]
}

export interface WayCard {
  name: string
  body: Bilingual<string>
  link: { label: Bilingual<string>; href: string }
}

export interface TwoWaysConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  cards: WayCard[]
}

export interface ServiceCard {
  name: string
  label: string
  forLabel: string
  body: Bilingual<string>
  cta: { label: Bilingual<string>; href: string }
}

export interface ServicesConfig {
  sectionLabel: Bilingual<string>
  intro: Bilingual<string>
  cards: ServiceCard[]
}

export interface BuildWithConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  paragraphs: Bilingual<string[]>
  cta: { label: Bilingual<string>; href: string }
}

export interface StudioOSConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  lead: Bilingual<string>
  list: Bilingual<string[]>
  closing: Bilingual<string>
}

export interface BookingConfig {
  sectionLabel: string
  heading: string
  body: string
  calLink: string
}

export interface FooterConfig {
  left: string
  email: NavigationLink
  linkedin: NavigationLink
  right: string
}

export const siteConfig: SiteConfig = {
  language: "en",
  siteTitle: "PROXYZ",
  siteDescription:
    "PROXYZ goes inside your company, rebuilds how it runs, automates the work that doesn't need a human, and stays as your AI operating partner. Anchored in Thailand.",
}

export const navigationConfig: NavigationConfig = {
  brandName: "PROXYZ",
  links: [
    { label: "What we do", href: "/#services" },
    { label: "Studio OS", href: "/portal" },
    { label: "Media", href: "/media" },
    { label: "Partners", href: "/partners" },
  ],
  primaryCta: { label: "Login", href: "https://portal.proxyz.studio/sign-in" },
}

export const heroConfig: HeroConfig = {
  eyebrow: { en: "ISSUE 01 / OPERATOR STUDIO" },
  titleLines: { en: ["Your proxy", "on the", "inside."] },
  lead: { en: "PROXYZ goes inside your company, rebuilds how it runs, automates the work that doesn't need a human, and stays as your AI operating partner. Anchored in Thailand. Working with operators wherever the upside is real." },
  primaryCta: { label: { en: "Book the Audit" }, href: "#booking" },
  secondaryLink: { label: { en: "What we do →" }, href: "#services" },
}

export const diagnosisConfig: DiagnosisConfig = {
  sectionLabel: { en: "01 / THE DIAGNOSIS" },
  heading: { en: "Most companies don't have an AI problem. They have an operations problem." },
  paragraphs: { en: [
    "Tribal knowledge in someone's head. Decisions made in group chats. Spreadsheets duct taped to email. AI bolted on top of broken process and called transformation.",
    "Companies don't run badly because the technology is missing. They run badly because the operating system is.",
  ] },
}

export const principlesConfig: PrinciplesConfig = {
  sectionLabel: { en: "02 / WHAT WE BELIEVE" },
  heading: { en: "Three principles." },
  items: [
    { number: "01.", text: { en: "Automate first. Agentic where it earns it." } },
    { number: "02.", text: { en: "The system runs the company. Not the founder." } },
    { number: "03.", text: { en: "Thailand is not a market. It's an ecosystem." } },
  ],
}

export const twoWaysConfig: TwoWaysConfig = {
  sectionLabel: { en: "03 / TWO WAYS TO WORK WITH PROXYZ" },
  heading: { en: "Build for. Build with." },
  cards: [
    {
      name: "Build for.",
      body: { en: "We come in. We install. We stay as your operator." },
      link: { label: { en: "See the services →" }, href: "#services" },
    },
    {
      name: "Build with.",
      body: { en: "We come in. We build alongside. We own a piece." },
      link: { label: { en: "See the venture arm →" }, href: "#build-with" },
    },
  ],
}

export const servicesConfig: ServicesConfig = {
  sectionLabel: { en: "04 / BUILD FOR" },
  intro: { en: "We come in, install systems, automate the work, and stay long term." },
  cards: [
    {
      name: "The Audit",
      label: "60 MINUTES",
      forLabel: "Anyone serious about running better.",
      body: { en: "A working session, not a sales call. We sit with you, walk the business, and leave you with a one page memo on the three highest leverage points in your operation. Yours to keep, even if we never work together." },
      cta: { label: { en: "Book the Audit" }, href: "#booking" },
    },
    {
      name: "The Blueprint",
      label: "90 DAYS",
      forLabel: "Founders launching a new venture.",
      body: { en: "We take your idea and turn it into a structured, validated, ready to operate company. Legal structure, deal architecture, partners, financial model, operating system spec, AI stack from day one. You walk out with a build ready blueprint and the introductions to make it real." },
      cta: { label: { en: "Start with the Audit" }, href: "#booking" },
    },
    {
      name: "The Install",
      label: "90 TO 120 DAYS",
      forLabel: "Existing companies modernizing their operation.",
      body: { en: "We install the Studio OS, automate the work that doesn't need a human, layer in AI where it earns its place, and train your team. You come out running on something that scales without the founder in every meeting." },
      cta: { label: { en: "Start with the Audit" }, href: "#booking" },
    },
    {
      name: "The Partnership",
      label: "MONTHLY RETAINER",
      forLabel:
        "Companies who want PROXYZ on retainer as the AI landscape shifts.",
      body: { en: "We stay as your fractional AI operating partner. Quarterly roadmap reviews, stack updates, team training, and a direct line as the landscape changes. This is what makes \"future proof\" something other than a slogan." },
      cta: { label: { en: "Add to any engagement" }, href: "#booking" },
    },
  ],
}

export const buildWithConfig: BuildWithConfig = {
  sectionLabel: { en: "05 / BUILD WITH" },
  heading: { en: "We don't sell this one. We choose it." },
  paragraphs: { en: [
    "For the rare founder where the upside is real and the chemistry is right. We come in, rebuild the business end to end, and stay as a long term operating partner. Compensation is equity, earned against committed deliverables. Two or three active at a time. By invitation only.",
    "This isn't a tier on a menu. It's a partnership.",
  ] },
  cta: {
    label: { en: "Pitch us. →" },
    href: "mailto:hello@proxyz.studio?subject=Build with PROXYZ",
  },
}

export const studioOSConfig: StudioOSConfig = {
  sectionLabel: { en: "06 / THE STUDIO OS" },
  heading: { en: "The system every engagement installs." },
  lead: { en: "The Studio OS is the operating layer PROXYZ installs inside every client. It's not software. It's how the company runs." },
  list: { en: [
    "A meeting cadence that compresses decision time",
    "Decision rights that stop bottlenecks at the founder",
    "Dashboards built around the metrics that move the business",
    "An automation layer that runs the work that doesn't need a human",
    "An AI stack tailored to the operation, not someone else's playbook",
  ] },
  closing: { en: "A real operator playbook, white labeled and rebuilt for every client. Whether we build for you or with you, the Studio OS is the system we install." },
}

export const bookingConfig: BookingConfig = {
  sectionLabel: "07 / BOOK YOUR AUDIT",
  heading: "60 minutes. One page memo. Yours to keep.",
  body: "Every PROXYZ engagement starts here. Pick a time below.",
  calLink: "proxyz/audit",
}

export const footerConfig: FooterConfig = {
  left: "PROXYZ. An operator studio.",
  email: {
    label: "hello@proxyz.studio",
    href: "mailto:hello@proxyz.studio",
  },
  linkedin: { label: "LinkedIn", href: "#" },
  right: "© 2026. All rights reserved.",
}

export interface PortalFeature {
  name: string
  description: string
}

export interface PortalPageConfig {
  eyebrow: string
  titleLines: string[]
  lead: string
  primaryCta: NavigationLink
  secondaryLink: NavigationLink
  pillarsLabel: string
  pillars: PortalFeature[]
  modulesLabel: string
  modulesIntro: string
  modules: PortalFeature[]
  whoLabel: string
  whoHeading: string
  whoBody: string
  closingHeading: string
  closingBody: string
  closingCta: NavigationLink
}

export const portalPageConfig: PortalPageConfig = {
  eyebrow: "ISSUE 02 / THE PORTAL",
  titleLines: ["The Studio OS,", "operating live."],
  lead:
    "The Portal is the working surface every PROXYZ engagement runs on. Meeting cadence, decisions, automations, AI agents, scorecards, all in one workspace. Built by operators for operators.",
  primaryCta: { label: "Open the Portal →", href: "https://portal.proxyz.studio/sign-in" },
  secondaryLink: { label: "Book the Audit", href: "/#booking" },
  pillarsLabel: "01 / WHAT IT DOES",
  pillars: [
    {
      name: "Compresses decision time",
      description:
        "Meetings run on a fixed cadence. Decisions, blockers, and owners land in writing the moment they're made. No status update meetings. No tribal knowledge.",
    },
    {
      name: "Runs the work that doesn't need a human",
      description:
        "An automation layer wired into the operation, not bolted on. From inbound deal routing to weekly reports, the boring half of the company runs itself.",
    },
    {
      name: "AI partner, not AI features",
      description:
        "Meeting agent, drafting agent, research agent. Each tuned to the company. Each with a workspace memory and an audit trail.",
    },
  ],
  modulesLabel: "02 / INSIDE THE PORTAL",
  modulesIntro:
    "Every module is built around the same idea: the system runs the company, not the founder.",
  modules: [
    {
      name: "Meetings",
      description:
        "Calendar-aware. Meeting agent reviews each session, drafts decisions and todos, you approve. Costs and review history tracked per workspace.",
    },
    {
      name: "Todos",
      description:
        "Split-pane workflow. Status, owner, due date, rich-text notes. Keyboard nav. URL-persisted focus. Mobile sheet for on the road.",
    },
    {
      name: "Rocks",
      description:
        "Quarterly goals with owners and progress. The 12-week horizon the company commits to. Always visible, always honest.",
    },
    {
      name: "Issues",
      description:
        "Kanban-style. Surface the friction the moment it shows up. Discuss, decide, close, archive. Nothing rots in a doc.",
    },
    {
      name: "Scorecard",
      description:
        "Weekly numbers that matter. One row per metric, one column per week. The dashboard the operator actually reads.",
    },
    {
      name: "V/TO",
      description:
        "Vision and traction in one document. Core values, focus, ten-year target, three-year picture, annual plan, quarterly rocks. The company's true north.",
    },
  ],
  whoLabel: "03 / WHO RUNS ON IT",
  whoHeading: "Every PROXYZ engagement. Every partner company.",
  whoBody:
    "The Portal is what we install during The Install and The Blueprint. It's the operating surface for every Build-with venture. New workspace per company. Owner controls. Multi-org rollup for the studio team.",
  closingHeading: "Want a tour?",
  closingBody:
    "Audit clients get a working demo inside the first 60 minutes. Active engagements get a live workspace with their data inside week one.",
  closingCta: { label: "Book the Audit", href: "/#booking" },
}

export interface MediaFlywheelStep {
  label: string
  body: string
}

export interface MediaPropertyCard {
  name: string
  status: string
  tagline: string
  description: string
  lead: string
  detailHref?: string
}

export interface MediaPageConfig {
  eyebrow: string
  titleLines: string[]
  lead: string
  thesis: {
    heading: string
    paragraphs: string[]
  }
  principles: {
    heading: string
    items: string[]
  }
  flywheel: {
    heading: string
    steps: MediaFlywheelStep[]
  }
  properties: {
    heading: string
    subhead: string
    cards: MediaPropertyCard[]
    closingLine: string
  }
  operators: {
    heading: string
    paragraphs: string[]
  }
  cta: {
    heading: string
    lead: string
    primaryCta: NavigationLink
  }
}

export const mediaPageConfig: MediaPageConfig = {
  eyebrow: "PROXYZ MEDIA / OWNED PROPERTIES",
  titleLines: ["Media as", "a product,", "not a channel."],
  lead: "PROXYZ builds owned media properties. Each one is a brand, an audience, and a community in its own right. The product underneath is the data layer that feeds the camera. The media presence is the brand.",
  thesis: {
    heading: "Why this division exists.",
    paragraphs: [
      "Most companies treat media as marketing. They post when there is something to sell, hire an agency when reach drops, and outsource the voice to whoever is cheapest. The output looks like everyone else's output. The audience does not stay.",
      "PROXYZ treats media as infrastructure. Owned audiences are durable assets. The studio model lets us build them as products, with the same care we give to the apps and systems we ship for clients. A media property is not a content strategy. It is a company shape we can grow, partner with, or spin out.",
    ],
  },
  principles: {
    heading: "Principles we run on.",
    items: [
      "Media is the product, not an afterthought. The app is the substrate that feeds it.",
      "Hyperlocal first. Coverage we can defend by being closer than anyone else.",
      "Every event in the product is a piece of content. Match, milestone, club spotlight, tournament arc.",
      "Properties expand by beat, not by feature. New city, new beat. Same playbook.",
      "Tone over volume. We post less and mean more.",
    ],
  },
  flywheel: {
    heading: "The loop.",
    steps: [
      {
        label: "Events",
        body: "The product captures structured events. Matches played, results, photos, scores, club activity.",
      },
      {
        label: "Content",
        body: "A content engine turns those events into media. Player profiles, club spotlights, highlight reels, tournament narratives, beginner clips.",
      },
      {
        label: "Distribution",
        body: "Properties publish where the audience already is. Instagram first, TikTok for reach, YouTube for long-form, LINE and WhatsApp for direct community broadcast.",
      },
      {
        label: "Audience",
        body: "The audience funnels back. New players sign up. Clubs partner. Sponsors arrive. The product gets denser. The loop accelerates.",
      },
    ],
  },
  properties: {
    heading: "Properties.",
    subhead: "Currently in the studio.",
    cards: [
      {
        name: "Padel Z",
        status: "FOUNDATION / 2026",
        tagline: "Matchmaking and social platform for the Phuket Padel scene.",
        description:
          "Web first. Mobile to follow. Phuket as the opening beat. Coverage of every club, every notable match, every player worth following. Expansion by city, not by feature.",
        lead: "Tim Chang, Phuket beat.",
        detailHref: "/media/padel-z",
      },
    ],
    closingLine: "More properties to come. Same playbook, different beats.",
  },
  operators: {
    heading: "How the studio runs a property.",
    paragraphs: [
      "Every property has a head of beat. They run the scene. They know the players, the clubs, the rhythms. They decide what is worth covering and what is not.",
      "PROXYZ provides the engine. Brand voice, content workflows, AI-assisted operations, design system, distribution stack. The studio is the rails. The operator is the train.",
    ],
  },
  cta: {
    heading: "Want to build a beat?",
    lead: "If you operate a community PROXYZ should be inside, talk to us. We are not looking for content gigs. We are looking for properties that can grow into companies.",
    primaryCta: { label: "Talk to PROXYZ", href: "/#booking" },
  },
}

export interface PartnerCard {
  name: string
  sector: string
  location: string
  stage: string
  partnerLabel: string
  partner: string
  proxyzRole: string
  partnerBrings: string
  whyItMatters: string
  milestones: { label: string; status: 'done' | 'active' | 'next' }[]
  lastUpdate: string
  cta: NavigationLink
  detailHref?: string
}

export interface PartnersPageConfig {
  eyebrow: string
  titleLines: string[]
  lead: string
  filterLabel: string
  filterValues: string[]
  partners: PartnerCard[]
  closingLabel: string
  closingHeading: string
  closingBody: string
  closingCta: NavigationLink
}

export const partnersPageConfig: PartnersPageConfig = {
  eyebrow: "ISSUE 03 / THE PARTNERS",
  titleLines: ["Live partner", "engagements."],
  lead:
    "PROXYZ runs a Build-with arm in parallel with the studio. Two to three companies at a time. Equity, not retainer. Co-built end to end. This is the working table.",
  filterLabel: "Status",
  filterValues: ["Active discussion", "Diligence", "Building", "Operating"],
  partners: [
    {
      name: "Fast-Fix",
      sector: "Hospitality maintenance",
      location: "Phuket, Thailand",
      stage: "Active discussion",
      partnerLabel: "Operating partner",
      partner: "Cathal",
      proxyzRole:
        "Software, AI, brand, accounting, legal. The studio side of a co-built operator.",
      partnerBrings:
        "Technician network, hospitality relationships, ground operations across Phuket villas, boutique hotels, serviced condos.",
      whyItMatters:
        "Phuket hospitality maintenance is a THB 7 to 10 billion market with no dominant challenger and zero formal SLA across existing operators. The first AI-native field service operator in the region wins the next decade.",
      milestones: [
        { label: "Week 1–2 · Introductions", status: 'done' },
        { label: "Week 3–6 · Diligence", status: 'active' },
        { label: "Week 7–10 · Co-write business plan", status: 'next' },
        { label: "Week 11+ · Form company, launch", status: 'next' },
      ],
      lastUpdate:
        "Market sizing, moat archetype, equity-partner-model research complete. Pitch document draft v1 with Cathal for review.",
      cta: { label: "View full pitch →", href: "/partners/fast-fix" },
      detailHref: "/partners/fast-fix",
    },
  ],
  closingLabel: "BECOME A PARTNER",
  closingHeading: "Two to three slots per year.",
  closingBody:
    "Build-with isn't a tier on a menu. It's a partnership. If the upside is real and the chemistry is right, we want to talk.",
  closingCta: {
    label: "Pitch us →",
    href: "mailto:hello@proxyz.studio?subject=Build with PROXYZ",
  },
}

export interface FastFixStep {
  num: string
  title: string
  body: string
}

export interface FastFixContribution {
  num: string
  title: string
  lead: string
  bullets: string[]
}

export interface FastFixWhyItem {
  num: string
  title: string
  body: string
}

export interface FastFixTimelineStep {
  num: string
  title: string
  body: string
}

export interface FastFixPageConfig {
  eyebrow: string
  titleLines: string[]
  accentLineIndex: number
  subtitle: string
  pills: string[]

  modelLabel: string
  modelHeadingLines: string[]
  modelParagraphs: string[]
  modelQuote: string
  modelSteps: FastFixStep[]

  portalLabel: string
  portalHeadingLines: string[]
  portalParagraphs: string[]
  portalBullets: string[]
  portalHubLabel: string
  portalHubLabels: string[]

  contribLabel: string
  contribHeadingLines: string[]
  contribLead: string
  contributions: FastFixContribution[]

  partnershipLabel: string
  partnershipHeadingLines: string[]
  partnershipParagraphs: string[]
  operatorBringsLabel: string
  operatorBrings: string[]
  proxyzBringsLabel: string
  proxyzBrings: string[]
  partnershipCoreTitle: string
  partnershipCoreLabel: string
  partnershipCoreTag: string

  whyLabel: string
  whyHeadingLines: string[]
  whyParagraphs: string[]
  whyItems: FastFixWhyItem[]

  roadmapLabel: string
  roadmapHeadingLines: string[]
  roadmapLead: string
  roadmapSteps: FastFixTimelineStep[]

  closingLines: string[]
  closingAccentIndex: number
  closingSub: string
  closingCta: NavigationLink
}

export const fastFixPageConfig: FastFixPageConfig = {
  eyebrow: "FAST-FIX × PROXYZ STUDIO · 2026",
  titleLines: ["Operator on the", "ground.", "Engine in the", "cloud."],
  accentLineIndex: 3,
  subtitle:
    "PROXYZ Studio is a venture studio. We don't pitch decks and walk away — we co-build operating companies and stay in the game. This is what we bring to Fast-Fix: the engine, the brand, the systems, and the long-game commitment.",
  pills: ["Draft · For partner review", "Phuket · Hospitality maintenance"],

  modelLabel: "01 · THE MODEL",
  modelHeadingLines: ["We're not", "consultants.", "We co-build."],
  modelParagraphs: [
    "Most agencies sell you a service and disappear when the invoice clears. Venture studios are built differently. We invest our team's time, our software, our brand, and our network into a partner company — and we share the upside.",
    "That means we win when you win. We're locked in for the long game, not the launch.",
  ],
  modelQuote:
    "For Fast-Fix, this looks like a partnership: you bring the operator instinct and the local network. We bring the engine, the brand, and the back-office. Together, we build a company that can't be replicated by either side alone.",
  modelSteps: [
    {
      num: "01",
      title: "We invest, we don't bill",
      body:
        "PROXYZ contributes software, team time, brand, and infrastructure as equity, not as a monthly invoice. We're betting on the company with you.",
    },
    {
      num: "02",
      title: "We co-build, you operate",
      body:
        "You run the day-to-day on the ground. We run the engine in the background — software, automation, brand, accounting, legal.",
    },
    {
      num: "03",
      title: "We stay for years",
      body:
        "A studio relationship isn't a 6-month engagement. We're committed for the long arc — through growth, hiring, and eventually, the exit.",
    },
  ],

  portalLabel: "02 · THE OPERATING SYSTEM",
  portalHeadingLines: ["One brain.", "Every partner", "company."],
  portalParagraphs: [
    "We call it the Portal. Think of it as the central nervous system that every PROXYZ company runs on — the place where your bookings, your team, your customers, your invoices, your AI, and your reports all live together.",
    "When you join the studio, you don't build any of this from scratch. You plug in.",
  ],
  portalBullets: [
    "One login, every tool. Your team uses one platform — not eight different apps stitched with email.",
    "Data lives in one place. Customers, jobs, photos, invoices, owner reports — all connected.",
    "AI works behind the scenes. Translation, dispatch, reporting — it runs without you thinking about it.",
    "Built once, polished by all partners. Every new PROXYZ company makes the Portal better.",
  ],
  portalHubLabel: "THE PORTAL",
  portalHubLabels: [
    "SOFTWARE",
    "AUTOMATION",
    "BRAND",
    "CONTENT",
    "OPERATIONS",
    "BACK-OFFICE",
    "LEGAL",
    "ACCOUNTING",
  ],

  contribLabel: "03 · OUR CONTRIBUTION",
  contribHeadingLines: ["What we bring", "to Fast-Fix."],
  contribLead:
    "Six things. Each one is a department you would otherwise have to build, hire, or outsource. We bring all six as part of the partnership — already running, already polished, ready on day one.",
  contributions: [
    {
      num: "01",
      title: "Customer Software",
      lead: "The booking, dispatch, and owner-facing apps — built once, polished across every PROXYZ partner.",
      bullets: [
        "Owner mobile app with monthly maintenance reports",
        "Booking + dispatch console for the coordinator",
        "Job photos auto-archived to each owner's account",
      ],
    },
    {
      num: "02",
      title: "AI & Smart Automation",
      lead: "AI that does real work — not chatbot theater.",
      bullets: [
        "Thai voice intake → auto-translated English work order",
        "Owner reports written in their language (Russian, Mandarin, English)",
        "Predictive alerts when equipment is about to fail",
      ],
    },
    {
      num: "03",
      title: "Brand & Storytelling",
      lead: "Identity, photo, video, social — every job becomes marketing material.",
      bullets: [
        "Logo, identity system, website — all in-house",
        "Job-site photo and video shoots, packaged for social",
        "Content built for villa owners and hotel managers",
      ],
    },
    {
      num: "04",
      title: "Operations Playbook",
      lead: "Battle-tested templates instead of inventing from scratch.",
      bullets: [
        "Hiring scripts for technicians and coordinators",
        "Service standards, response-time SLAs, pricing frameworks",
        "Training materials in Thai and English",
      ],
    },
    {
      num: "05",
      title: "Back-Office Services",
      lead: "Accounting, legal, HR — shared across the studio portfolio, cheaper than going solo.",
      bullets: [
        "Monthly accounting and tax compliance",
        "Contract templates: customers, vendors, employees",
        "HR onboarding and payroll infrastructure",
      ],
    },
    {
      num: "06",
      title: "Strategic Intelligence",
      lead: "Market data, competitive intel, and lessons from across the PROXYZ portfolio.",
      bullets: [
        "Quarterly market reviews specific to Phuket hospitality",
        "Pricing and benchmark data from comparable markets",
        "Lessons from other PROXYZ partner companies — applied to Fast-Fix",
      ],
    },
  ],

  partnershipLabel: "04 · THE PARTNERSHIP",
  partnershipHeadingLines: ["Operator on", "the ground.", "Engine in the", "cloud."],
  partnershipParagraphs: [
    "Fast-Fix runs on the ground with the operating partner driving it — customer trust, technician relationships, daily execution.",
    "PROXYZ runs in the background — software, brand, AI, back-office, intelligence. We're not in your way. We're behind the curtain making the whole thing work.",
    "You focus on the customer, the tech, the job. We handle everything else.",
  ],
  operatorBringsLabel: "OPERATOR BRINGS",
  operatorBrings: [
    "Local network of trades and contractors",
    "Customer relationships and trust",
    "Operating instinct on Phuket conditions",
    "Day-to-day execution and quality control",
    "Cultural and language fluency",
  ],
  proxyzBringsLabel: "PROXYZ BRINGS",
  proxyzBrings: [
    "The Portal — software for every part of the business",
    "AI and automation that does real work",
    "Brand, identity, and content production",
    "Accounting, legal, HR infrastructure",
    "Strategic intelligence and portfolio learnings",
  ],
  partnershipCoreTitle: "FAST-FIX",
  partnershipCoreLabel: "THE COMPANY",
  partnershipCoreTag:
    "Where the two sides click together into one operating company.",

  whyLabel: "05 · WHY NOW",
  whyHeadingLines: ["Phuket has a", "problem.", "Nobody is fixing", "it well."],
  whyParagraphs: [
    "Hospitality maintenance in Phuket is a real, large market with a clear gap. Property managers all outsource the trades — but nobody has built a serious operator that owns the standard. Customers complain about the same things over and over: no-shows, opaque billing, language barriers, broken promises.",
    "That's the opening. We have a 12- to 18-month head start before anyone with real capital notices.",
  ],
  whyItems: [
    {
      num: "01",
      title: "The market is large.",
      body:
        "Phuket hospitality maintenance is a multi-billion-baht annual market, growing every year with tourism. The addressable outsourced segment alone is hundreds of millions in USD.",
    },
    {
      num: "02",
      title: "Nobody owns the trades.",
      body:
        "Every property management company in Phuket outsources maintenance. None of them coordinate it well. That's the structural gap Fast-Fix occupies.",
    },
    {
      num: "03",
      title: "Villas suffer most.",
      body:
        "Hotels have engineering teams and procurement processes. Luxury villas have WhatsApp threads and crossed fingers. That's the wedge customer — owners willing to pay for a real service.",
    },
    {
      num: "04",
      title: "No serious competitor.",
      body:
        "No AI-native player has entered Southeast Asia hospitality services. The closest international comparable is a North America-only operator. We have first-mover advantage in the region.",
    },
  ],

  roadmapLabel: "06 · WHAT HAPPENS NEXT",
  roadmapHeadingLines: ["Four steps.", "No rush."],
  roadmapLead:
    "A studio partnership isn't a handshake on the back of a napkin. We move deliberately — both sides need to know this is the right fit before we start building together.",
  roadmapSteps: [
    {
      num: "01 · WEEK 1-2",
      title: "Introductions",
      body:
        "We meet your trade partners. You meet our team. Honest conversations about what each side actually brings.",
    },
    {
      num: "02 · WEEK 3-6",
      title: "Diligence",
      body:
        "We walk through the operations, the relationships, the market together. Both sides decide if it's a fit. Either side can say no.",
    },
    {
      num: "03 · WEEK 7-10",
      title: "Plan",
      body:
        "We co-write the business plan — who does what, how we measure success, what good looks like in year one.",
    },
    {
      num: "04 · WEEK 11+",
      title: "Build",
      body:
        "We form the company together. The engine goes live. Fast-Fix opens for business in Phuket.",
    },
  ],

  closingLines: ["The right operator.", "The right engine.", "The right time."],
  closingAccentIndex: 2,
  closingSub:
    "Fast-Fix isn't a moonshot. It's a clear gap in a real market — and we'd like to build it with you.",
  closingCta: {
    label: "Let's talk → hello@proxyz.studio",
    href: "mailto:hello@proxyz.studio?subject=Fast-Fix",
  },
}
