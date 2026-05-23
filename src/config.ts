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
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  body: Bilingual<string>
  calLink: string
}

export interface FooterConfig {
  left: Bilingual<string>
  email: NavigationLink
  linkedin: NavigationLink
  right: Bilingual<string>
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
    { label: "Pipeline", href: "/pipeline" },
    { label: "Ventures", href: "/ventures" },
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
  sectionLabel: { en: "07 / BOOK YOUR AUDIT" },
  heading: { en: "60 minutes. One page memo. Yours to keep." },
  body: { en: "Every PROXYZ engagement starts here. Pick a time below." },
  calLink: "proxyz/audit",
}

export const footerConfig: FooterConfig = {
  left: { en: "PROXYZ. An operator studio." },
  email: {
    label: "hello@proxyz.studio",
    href: "mailto:hello@proxyz.studio",
  },
  linkedin: { label: "LinkedIn", href: "#" },
  right: { en: "© 2026. All rights reserved." },
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
  pillarsLabel: "02 / WHAT IT DOES",
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
  modulesLabel: "03 / INSIDE THE PORTAL",
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
  whoLabel: "01 / WHO RUNS ON IT",
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

export interface PipelinePageConfig {
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

export const pipelinePageConfig: PipelinePageConfig = {
  eyebrow: "ISSUE 03 / THE PIPELINE",
  titleLines: ["Companies", "in play."],
  lead:
    "PROXYZ runs a Build-with arm in parallel with the studio. Two to three companies at a time. Equity, not retainer. Co-built end to end. These are the conversations in motion — not closed partnerships. This is the working table.",
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
      cta: { label: "View full pitch →", href: "/pipeline/fast-fix" },
      detailHref: "/pipeline/fast-fix",
    },
    {
      name: "Lazy Tiger",
      sector: "Boutique fitness",
      location: "Bangkok, Thailand",
      stage: "Active discussion",
      partnerLabel: "Founder",
      partner: "Cathal Kiely",
      proxyzRole:
        "The operating system that scales the brand across Asia. Portal install, AI Coach, Tiger Score, loyalty layer, the programming pipeline that codifies the IP.",
      partnerBrings:
        "The brand, the format, the InterContinental Bangkok flagship, the capital for studio buildouts, the instructor and class IP, the Thai studio network.",
      whyItMatters:
        "Gamified-cardio is category-of-one in Bangkok for 18 to 24 months. The brand-agnostic operating system Cathal and PROXYZ build together is the format other boutique fitness brands globally will want to install. Bangkok is the first installation. The Asia rollout is the proof.",
      milestones: [
        { label: "Week 1–2 · Introductions", status: 'done' },
        { label: "Week 3–6 · Pressure-test + architecture", status: 'done' },
        { label: "Week 7–10 · Engagement letter + financial model", status: 'active' },
        { label: "Week 11+ · Bangkok flagship launch", status: 'next' },
      ],
      lastUpdate:
        "Loyalty layer, IHG hotel network playbook, and the empty-quadrant positioning landed on the page v1.1. Engagement letter draft next.",
      cta: { label: "View full pitch →", href: "/pipeline/lazy-tiger" },
      detailHref: "/pipeline/lazy-tiger",
    },
  ],
  closingLabel: "BUILD WITH PROXYZ",
  closingHeading: "Two to three slots per year.",
  closingBody:
    "Build-with isn't a tier on a menu. It's a partnership. If the upside is real and the chemistry is right, we want to talk.",
  closingCta: {
    label: "Pitch us →",
    href: "mailto:hello@proxyz.studio?subject=Build with PROXYZ",
  },
}

export type VentureStatus = 'live' | 'building' | 'planning';

/** Per-venture brand colors. When set, override the PROXYZ hot-pink default
 * across the venture's card on /ventures and its full detail page at
 * /ventures/<slug>. PROXYZ pink (#FF4193) is the fallback. */
export interface VentureBrand {
  /** Primary accent color — replaces var(--accent-pink) for this venture only. */
  accent: string;
  /** Soft tint of the accent for backgrounds (recommend ~4% alpha). */
  accentSoft: string;
  /** Slightly stronger tint of the accent for hover / active states (~8% alpha). */
  accentTint: string;
}

export interface VentureHowStep {
  num: string;
  title: string;
  body: string;
}

export interface VentureModuleDetail {
  name: string;
  body: string;
  /** Optional tuning / drill-down bullets shown inside the module card */
  details?: { label: string; body: string }[];
}

export interface VentureRoadmapItem {
  label: string;
  status: 'done' | 'active' | 'next';
}

export interface VentureTeamMember {
  name: string;
  role: string;
}

export interface VentureDetail {
  /** Slug used in the URL: /ventures/<slug> */
  slug: string;
  /** Longer paragraphs for the detail page Overview section */
  overview: string[];
  /** Process steps */
  howItWorks: VentureHowStep[];
  /** Expanded module descriptions */
  modulesDetail: VentureModuleDetail[];
  /** Where this venture is on its arc */
  roadmap: VentureRoadmapItem[];
  /** Who runs it */
  team: VentureTeamMember[];
  /** Reference materials: research dossiers, decisions, etc. */
  references?: { label: string; href: string }[];
}

export interface VentureCard {
  name: string;
  tagline: string;
  status: VentureStatus;
  statusLabel: string;
  domain: string;
  /** Live outbound link to the venture's own domain. Null until the domain ships. */
  href: string | null;
  /** Internal proxyz.studio detail page. Null if no detail page yet (e.g. PRYZM today). */
  internalHref: string | null;
  pitch: string;
  modules: string[];
  /** Optional brand override. When absent, the card and detail page use the
   * PROXYZ default hot pink accent. */
  brand?: VentureBrand;
  /** Richer content for the detail page. Optional — only filled when a detail page exists. */
  detail?: VentureDetail;
}

export interface VenturesPageConfig {
  eyebrow: string;
  titleLines: string[];
  lead: string;
  ventures: VentureCard[];
  closingLabel: string;
  closingHeading: string;
  closingBody: string;
  closingCta: { label: string; href: string };
}

export const venturesPageConfig: VenturesPageConfig = {
  eyebrow: "ISSUE 04 / THE VENTURES",
  titleLines: ["What we", "build."],
  lead:
    "PROXYZ runs an operator studio and a venture studio in parallel. The studio installs the operating system into companies we acquire, partner with, or take equity in. The venture arm builds and runs our own brands. Each one lives at its own domain. This is what's in motion.",
  ventures: [
    {
      name: "AUTOLOOM",
      tagline: "Thai SMB agent bundles. Service-for-cash, no SaaS tier.",
      status: "building",
      statusLabel: "BUILDING · LAUNCHING SOON",
      domain: "autoloom.tech",
      href: null,
      internalHref: "/ventures/autoloom",
      pitch:
        "Agent-as-a-Service bundles installed into Thai SMBs by industry. Marketing agencies, law, insurance, manufacturing, wholesalers, real estate. Each install ships in a week. LINE-native by default.",
      modules: ["Agent runtime", "LINE OA bridge", "Industry playbooks", "Install pipeline"],
      brand: {
        // The "Y" letter on the PROXYZ tricolor wordmark — teal/mint #5BC9B8.
        accent: "#5BC9B8",
        accentSoft: "rgba(91,201,184,0.04)",
        accentTint: "rgba(91,201,184,0.08)",
      },
      detail: {
        slug: "autoloom",
        overview: [
          "AUTOLOOM is PROXYZ's venture arm for installing agent bundles into Thai small and mid-sized businesses by industry. Each bundle is a tested set of agents, configured for a specific vertical, that ships in under a week and operates the customer's most expensive recurring workflow.",
          "The pricing model is service-for-cash. No SaaS tier, no per-seat pricing, no metered AI. The customer pays once to install and a flat monthly fee to operate. The agents run on infrastructure PROXYZ owns; the customer never sees a cloud bill.",
          "LINE OA is the default customer-facing channel. The bundle for any Thai vertical assumes the buyer's customer base is on LINE, and the install ships with a Composio HTTP and LINE Messaging API bridge as the first integration.",
        ],
        howItWorks: [
          {
            num: "01",
            title: "Pick a bundle",
            body: "Six industry bundles ship at launch: marketing agencies, law, insurance, manufacturing, wholesalers, real estate. Each one is built around the highest-value agent for that vertical, surrounded by supporting agents the install needs to land.",
          },
          {
            num: "02",
            title: "Install in under a week",
            body: "The install team configures the agents for the customer's specific stack, wires LINE OA and email channels, runs the cohort tests, and hands off the operating runbook. No long discovery cycle, no committee, no SaaS contract.",
          },
          {
            num: "03",
            title: "Operate as service",
            body: "PROXYZ runs the agents from PROXYZ infrastructure. The customer reports issues, requests new behaviors, reads the monthly outcome report. Updates ship through the same channel an employee would use.",
          },
          {
            num: "04",
            title: "Expand by vertical",
            body: "Once a bundle is paying, the next one for the same vertical (next-tier agent, adjacent workflow) is one Audit away. Repeated installs into the same industry compound into a moat.",
          },
        ],
        modulesDetail: [
          {
            name: "Agent runtime",
            body: "The execution layer that runs each customer's agents. Sits behind a Composio MCP bridge so agents can call email, calendar, CRM, and LINE OA tools through a unified interface.",
          },
          {
            name: "LINE OA bridge",
            body: "Composio does not natively support the LINE Messaging API. AUTOLOOM ships with a 1 to 2 day reusable bridge built once, deployed per install. Blocking dependency for every Thai vertical.",
          },
          {
            name: "Industry playbooks",
            body: "Each bundle ships with a playbook for the vertical: the buyer profile, the pain it solves, the test cohort, the rollout sequence. Codified from six parallel research agents in May 2026.",
          },
          {
            name: "Install pipeline",
            body: "The studio side: discovery script, install checklist, handoff document, monthly outcome report template. Same shape across all six verticals so the install team scales.",
          },
        ],
        roadmap: [
          { label: "Phase 0 · Six-industry research synthesis", status: "done" },
          { label: "Phase 1 · Magnus install (reference VM)", status: "active" },
          { label: "Phase 2 · First five paid installs", status: "next" },
          { label: "Phase 3 · Industry-specific scale", status: "next" },
        ],
        team: [
          { name: "Tew", role: "Founder, architect, install lead" },
          { name: "iLing", role: "Head of sales and discovery, T002 owner" },
        ],
        references: [
          {
            label: "Six-industry research rollup",
            href: "https://obsidian.md (internal)",
          },
        ],
      },
    },
    {
      name: "MAGNIZ",
      tagline: "Hosted agents per customer. One agent, one inbox, one operator.",
      status: "building",
      statusLabel: "BUILDING · LAUNCHING SOON",
      domain: "magniz.io",
      href: null,
      internalHref: "/ventures/magniz",
      pitch:
        "Individual hosted agents for operators who need their own. Each customer gets a dedicated Orgo VM running the Hermes runtime with full Agent Mail and LINE OA integration. End-state proof passed on 23 May 2026.",
      modules: ["Hermes runtime", "Agent Mail", "LINE OA", "Orgo isolation"],
      brand: {
        accent: "#D2FF3B",
        accentSoft: "rgba(210,255,59,0.04)",
        accentTint: "rgba(210,255,59,0.08)",
      },
      detail: {
        slug: "magniz",
        overview: [
          "MAGNIZ is PROXYZ's venture arm for hosting individual agents per customer. One agent, one inbox, one operator. Each customer owns the agent's identity, the agent's behavior, and the agent's outputs.",
          "The hosting model is per-customer Orgo VMs running the Hermes runtime. Customer A cannot read Customer B's data because they live on different infrastructure. Agent Mail provides the inbox; LINE OA provides the customer-facing channel.",
          "End-state proof passed on 23 May 2026: a real LINE inbound message produced both a Spanish-language reply (Liz) and an English-language reply (Tew) through the same agent. The runtime is production-ready.",
        ],
        howItWorks: [
          {
            num: "01",
            title: "Discovery",
            body: "Audit-style conversation to scope the agent's identity, role, and the systems it needs to touch. Outputs the install runbook.",
          },
          {
            num: "02",
            title: "Install",
            body: "Spin up the customer's Orgo VM, deploy the Hermes runtime, provision the Agent Mail inbox under the customer's domain, wire the LINE OA channel. Hardening passes run automatically.",
          },
          {
            num: "03",
            title: "Train and operate",
            body: "The agent's playbook is loaded into its Obsidian vault. The customer interacts with the agent through LINE or email; updates to the playbook flow back through the same channel.",
          },
          {
            num: "04",
            title: "Iterate",
            body: "New behaviors, new tools, new escalation paths land as commits to the customer's vault. The same install pattern survives the agent's growth.",
          },
        ],
        modulesDetail: [
          {
            name: "Hermes runtime",
            body: "The execution layer that gives each agent its identity, memory, and tool access. One Hermes process per customer. Verified end-to-end on real LINE traffic.",
            details: [
              {
                label: "Multi-model routing",
                body: "The runtime picks the cheapest capable model for each task and escalates only when a task warrants it. Token cost is a margin lever we own, not a customer surprise.",
              },
              {
                label: "Skill loop",
                body: "New skills get written from successful execution traces and persist. The agent's capability surface compounds with use.",
              },
              {
                label: "Memory",
                body: "Every prior session is searchable. The agent never starts cold and never re-learns what you already taught it.",
              },
              {
                label: "Code-once pattern",
                body: "Recurring tasks become deterministic code on the first run, then execute forever with no model spend.",
              },
            ],
          },
          {
            name: "Agent Mail",
            body: "Inbox infrastructure. Each customer gets their own inbox under agents.magniz.io with SPF, DKIM, and DMARC configured. Native MCP server, no Composio bridge needed.",
          },
          {
            name: "LINE OA",
            body: "Customer-facing channel for Thai operators. Composio HTTP plus LINE Messaging API bridge that ships with the install. Same bridge AUTOLOOM uses.",
          },
          {
            name: "Orgo isolation",
            body: "Each customer runs on a separate Orgo VM. Isolation is by infrastructure, not by application logic. Cross-customer data exposure is impossible by construction.",
          },
        ],
        roadmap: [
          { label: "Phase 0 · Hermes-LINE end-state proof", status: "done" },
          { label: "Phase 1 · Magnus reference install", status: "active" },
          { label: "Phase 2 · First paid installs", status: "next" },
          { label: "Phase 3 · Install kit hardening", status: "next" },
        ],
        team: [
          { name: "Tew", role: "Founder, runtime architect" },
          { name: "iLing", role: "Sales and operator onboarding" },
        ],
      },
    },
    {
      name: "PRYZM",
      tagline: "Synthesis intelligence. Research to decision in one motion.",
      status: "planning",
      statusLabel: "PLANNING · INTERNAL TOOL TODAY",
      domain: "pryzm.io",
      href: null,
      internalHref: null,
      pitch:
        "Started as PROXYZ's internal market-synthesis tool. Generates deep cohort comparisons, industry deployment plans, decision briefs from raw research. Targeted for externalization as a standalone venture.",
      modules: ["Cohort comparison", "Deployment plans", "Decision briefs", "Source aggregation"],
    },
  ],
  closingLabel: "BUILD WITH PROXYZ",
  closingHeading: "We build our own. Then we install it.",
  closingBody:
    "Every venture on this page is also a proving ground. The patterns that survive end up inside the operating system we install into the companies we take equity in. If you want the same treatment for your business, the door is the Audit.",
  closingCta: {
    label: "Book the Audit →",
    href: "/#booking",
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

/* ===========================================================================
 * Lazy Tiger × PROXYZ — prospect page config
 * Source of truth: 2026-05-20-lazy-tiger-prospect-page-copy-v1.md
 * All prose is verbatim from the copy doc. Do not paraphrase.
 * ========================================================================= */

export type LayerModality = 'cardio' | 'reformer' | 'yoga';

export interface LeaderboardMember {
  rank: number;
  name: string;
  hr: number;
  score: number;
  modality: LayerModality;
}

export interface LayerSection {
  num: string;
  name: string;
  tagline: string;
  body: string;
}

export interface AsiaCity {
  label: string;
  timing: string;
  type: 'operating' | 'license';
  /** SVG viewBox 0..1000 x 0..640 */
  x: number;
  y: number;
}

export interface HardwarePhase {
  version: string;
  device: string;
  timing: string;
  spec: string;
}

export interface DiligenceCard {
  label: string;
  headline: string;
  body: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  /** Path under public/ to a headshot photo. Falls back to the initials circle when absent. */
  photo?: string;
}

export interface OtherPartnerCard {
  name: string;
  sector: string;
  status: string;
  href?: string;
  current?: boolean;
}

export interface LoyaltyTier {
  /** Tier name shown on the ladder. */
  name: 'Cub' | 'Tiger' | 'Black Tiger';
  /** Visual tone — drives the rung color in the ladder. */
  tone: 'bronze' | 'pink' | 'lime';
  /** Short positioning line under the tier name. */
  blurb: string;
  /** Perks listed under the tier. */
  perks: string[];
}

export interface QuadrantPlacement {
  /** Brand name to render in the quadrant cell. */
  brand: string;
  /** Quadrant: tl = brand-coupled+full-stack, tr = brand-agnostic+full-stack (empty),
   *  bl = brand-coupled+partial-layer, br = brand-agnostic+partial-layer. */
  quadrant: 'tl' | 'tr' | 'bl' | 'br';
}

export interface HotelMarker {
  city: string;
  hotel: string;
  status: 'active' | 'pending' | 'mapped';
  /** Same coordinate system as AsiaCity (viewBox ~200..900 x 50..600). */
  x: number;
  y: number;
}

export interface LazyTigerPageConfig {
  hero: {
    eyebrow: string;
    titleLines: string[];
    subline: string;
  };
  brief: {
    headline: string;
    paragraphs: string[];
  };
  gap: {
    headline: string;
    subhead: string;
    body: string;
    aboveLabel: string;
    belowLabel: string;
    midLabel: string;
  };
  frame: {
    titleLines: string[];
    subline: string;
  };
  layers: LayerSection[];
  loyalty: {
    num: string;
    name: string;
    tagline: string;
    paragraphs: string[];
    tiers: LoyaltyTier[];
  };
  compound: {
    headline: string;
    beats: string[];
    closing: string;
    centerLabel: string;
  };
  asia: {
    headline: string;
    subline: string;
    sequence: string[];
    cities: AsiaCity[];
  };
  hardware: {
    headline: string;
    subline: string;
    phases: HardwarePhase[];
    body: string;
  };
  partnership: {
    headline: string;
    openingLine: string;
    lazyTigerLabel: string;
    lazyTigerBullets: string[];
    proxyzLabel: string;
    proxyzBullets: string[];
  };
  formatQuadrant: {
    eyebrow: string;
    headline: string;
    paragraphs: string[];
    xLeftLabel: string;
    xRightLabel: string;
    yTopLabel: string;
    yBottomLabel: string;
    placements: QuadrantPlacement[];
    emptyQuadrantLabel: string;
  };
  hotelNetwork: {
    eyebrow: string;
    headline: string;
    paragraphs: string[];
    markers: HotelMarker[];
  };
  engagement: {
    headline: string;
    paragraphs: string[];
  };
  diligence: {
    headline: string;
    subline: string;
    cards: DiligenceCard[];
    sourceLine: string;
  };
  currentStage: {
    headline: string;
    paragraphs: string[];
  };
  team: {
    headline: string;
    members: TeamMember[];
  };
  otherPartners: {
    headline: string;
    cards: OtherPartnerCard[];
  };
  footer: {
    closing: string;
    sub: string;
  };
  leaderboard: LeaderboardMember[];
  merch: string[];
  coachChat: { speaker: 'coach' | 'member'; text: string }[];
}

export const lazyTigerPageConfig: LazyTigerPageConfig = {
  hero: {
    eyebrow: 'PROXYZ × LAZY TIGER',
    titleLines: ['Operating-system install', 'for the gamified cardio category.'],
    subline: 'Build-with engagement. Active preview.',
  },

  brief: {
    headline: "What we're working on.",
    paragraphs: [
      'Lazy Tiger is a Bangkok boutique fitness brand built around gamified Bike, Ski, and Row cardio with a Yoga adjunct. Founded by Cathal Kiely, launching at the InterContinental Bangkok in mid-2026, with an Asia expansion plan from Singapore to Hong Kong and beyond.',
      "We're building this with the founding team to make Lazy Tiger the gamified-cardio brand the world wants to install.",
    ],
  },

  gap: {
    headline: 'Great studios fail at scale for one reason.',
    subhead: "The experience doesn't travel with the member.",
    body:
      'The product inside the room is excellent. What happens between sessions? What happens when the member travels? What happens at studio three, in Singapore, with a new instructor and a different crowd? Every boutique brand that has tried to scale has hit this. SoulCycle. Peloton. Barry’s. The ones that survived got lucky with timing or pivoted to software. The ones that didn’t had great in-room experiences and no connective tissue.\n\nThat connective tissue is what we build.',
    midLabel: 'Member experience',
    aboveLabel: 'Inside the studio.',
    belowLabel: 'Everywhere else.',
  },

  frame: {
    titleLines: ["Lazy Tiger isn't a fitness studio.", "It's a brand operating system."],
    subline: 'Four stacked flywheels. Each layer feeds the next.',
  },

  layers: [
    {
      num: 'LAYER 01',
      name: 'Sensor network',
      tagline: 'We read what members already wear.',
      body:
        'Polar SDK is the spine. Polar H10 chest straps in the studio capture beat-to-beat heart rate accurate to under a millisecond. Apple HealthKit, Oura Cloud, and the Terra API aggregator layer the take-home wearables on top. The result: a cardiac-truth data layer that no rhythm-cycling competitor can match. Most premium boutique brands estimate heart rate from wrist sensors that degrade above 75 percent max HR. Lazy Tiger sees the actual heart.',
    },
    {
      num: 'LAYER 02',
      name: 'Gaming flywheel',
      tagline: 'Apex Legends ranking, applied to the cardio studio.',
      body:
        'The Bike, Ski, and Row machines are the hero hardware. Reactive lighting, music sync, and a live leaderboard wall turn every class into a session with stakes. Tiger Score is the composite metric, heart rate reserve weighted by modality, normalized across body type and fitness level, recalibrated seasonally. The gaming layer drives weekly engagement. The leaderboard drives the rivalry. The rivalry drives retention.\n\nAnd every personal record is unpredictable in advance because Tiger Score depends on sleep, stress, effort, and HRV. That uncertainty is the hook. The same psychological mechanic that drives the best games, applied to the work the body is already doing.',
    },
    {
      num: 'LAYER 03',
      name: 'Merch flywheel',
      tagline: 'AI-designed drops that compound brand identity.',
      body:
        'Apparel and accessories designed through an AI loop (Vizcom, Midjourney, Dynamic Mockups, Shopify), manufactured small-batch in Vietnam, dropped on a quarterly cadence with member-tier exclusivity. The Tiger Helmet becomes the badge of belonging. Drops compound demand between sessions. Members who hit milestones unlock earned merch the public cannot buy. The flywheel sells brand identity, not unit economics.',
    },
    {
      num: 'LAYER 04',
      name: 'Tiger Coach',
      tagline: 'A coach that knows the member across years.',
      body:
        'The AI Coach lives in the Lazy Tiger app. v1 runs on a VPS, tiered between Gemini 2.5 Flash for daily check-ins and Claude Sonnet for weekly periodization. Every conversation, every session, every recovery prompt accumulates into a personalized memory layer. The Coach knows your last six weeks of training load. It knows your sleep, your HRV, your weakness on the Row. It adapts the next session before you ask. Year three, the Coach is the relationship a competitor cannot clone.',
    },
  ],

  loyalty: {
    num: 'LAYER 05',
    name: 'The loyalty layer',
    tagline: 'The members who show up the most get the most.',
    paragraphs: [
      "Tiger Score isn't just a leaderboard number. It's how members compound value the more they show up. Every class earns Tiger Score. Tiger Score earns loyalty status. Loyalty status unlocks earned drops, premium content, VIP coaching tiers, and partner hotel access. We reward members for doing the thing that was already good for them.",
      'Three tiers. Cub. Tiger. Black Tiger. Founding members start as Tiger for the first six months. The earn rate is calibrated to effort, not attendance. The system rewards intensity over presence.',
    ],
    tiers: [
      {
        name: 'Cub',
        tone: 'bronze',
        blurb: 'Where every member starts.',
        perks: [
          'Tiger Score visible',
          'Leaderboard access',
          'Member app',
          'Monthly drop preview',
        ],
      },
      {
        name: 'Tiger',
        tone: 'pink',
        blurb: 'Founding members start here for six months.',
        perks: [
          'Everything in Cub',
          '14-day class booking window',
          'Founding-member drop access',
          'AI Coach tier upgrade',
          'Partner hotel guest passes',
        ],
      },
      {
        name: 'Black Tiger',
        tone: 'lime',
        blurb: 'For the members who show up the hardest.',
        perks: [
          'Everything in Tiger',
          'VIP Coaching Tier eligibility',
          'Founder events',
          'Annual Tournament invitation',
          'Cross-city access at every Lazy Tiger location',
        ],
      },
    ],
  },

  compound: {
    headline: 'Four beats. One member.',
    beats: [
      'Sensors give us the body.',
      'Gaming gives us the session.',
      'Merch gives us the identity.',
      'Tiger Coach gives us the relationship.',
    ],
    closing:
      "Year one it's a system. Year three it's a moat. Every member session deepens what the next member experience can be.",
    centerLabel: 'The compounding member graph.',
  },

  asia: {
    headline: 'Three operating cities in 24 months.',
    subline: 'The rest come through master-license partners we sign together. The format travels; we don’t have to.',
    sequence: [
      'Bangkok / Flagship          → mid-2026',
      'Bangkok / Second site       → Q1 2027',
      'Singapore                   → Q3 2027',
      'Hong Kong                   → 2028',
      'Tokyo · Manila · Jakarta · KL  → master-license, year 3+',
    ],
    cities: [
      { label: 'Bangkok', timing: 'mid-2026', type: 'operating', x: 540, y: 410 },
      { label: 'Singapore', timing: 'Q3 2027', type: 'operating', x: 590, y: 510 },
      { label: 'Hong Kong', timing: '2028', type: 'operating', x: 680, y: 360 },
      { label: 'Tokyo', timing: 'year 3+', type: 'license', x: 800, y: 290 },
      { label: 'Manila', timing: 'year 3+', type: 'license', x: 730, y: 440 },
      { label: 'Jakarta', timing: 'year 3+', type: 'license', x: 640, y: 560 },
      { label: 'KL', timing: 'year 3+', type: 'license', x: 560, y: 480 },
    ],
  },

  hardware: {
    headline: 'Phil Knight sold shoes out of a car trunk before he built Nike.',
    subline: 'We earn the right to build the dream.',
    phases: [
      {
        version: 'v1',
        device: 'Phone',
        timing: 'Today',
        spec: 'Tiger Coach in the pocket. Daily check-ins, weekly periodization, full session history.',
      },
      {
        version: 'v2',
        device: 'Studio kiosk',
        timing: 'Year 2',
        spec: 'Lounge-side check-in. Tiger Score on the wall. Pre-class briefing and post-class debrief.',
      },
      {
        version: 'v3',
        device: 'Member pod',
        timing: 'Year 2 to 3',
        spec: 'Locker-room voice pod. Recovery prompts, scheduling, member-only audio drops.',
      },
      {
        version: 'v4',
        device: 'Tiger Glass',
        timing: 'Year 3+',
        spec: 'Earned wearable. Heart rate, recovery, and Coach prompts in the field of view.',
      },
    ],
    body:
      'The Tiger Coach ships in software first. As revenue compounds, the hardware comes back layer by layer. A kiosk in the studio lounge. A voice-pod in the locker room. A wearable that members earn rather than buy. Each upgrade is gated by what the previous wave generated.',
  },

  partnership: {
    headline: 'Two operators building one operating system together.',
    openingLine:
      "Cathal brings the brand and the room. PROXYZ brings the system that makes the room scale. Together we build the format other operators will want to install.",
    lazyTigerLabel: 'LAZY TIGER',
    lazyTigerBullets: [
      'The brand. The format. The founder vision.',
      'The InterContinental Bangkok partnership.',
      'The capital for studio buildouts.',
      'The instructor and class IP.',
      'The Thai network on the studio side.',
    ],
    proxyzLabel: 'PROXYZ',
    proxyzBullets: [
      'The operating system that scales it.',
      'The Portal install, the AI Coach, the data layer.',
      'The strategic + technical post-launch operator.',
      'The programming pipeline that codifies the IP.',
      'The Thai network on the operator side, plus EOS / Traction methodology.',
    ],
  },

  formatQuadrant: {
    eyebrow: '13 · THE LONG GAME',
    headline: 'What we’re building lives past the Bangkok flagship.',
    paragraphs: [
      "The boutique fitness world has plenty of brand operating systems. None of them are brand-agnostic. F45 forces you to be F45. Orangetheory forces you to be Orangetheory. Xponential forces you into one of their nine brands. Mindbody and Glofox give you booking software but no gamification, no scoring, no AI coaching.",
      "We’re building something that doesn't exist yet: the operating system a boutique fitness brand can install while keeping its own identity. Lazy Tiger Bangkok is the first installation. The Asia rollout is the proof. Five years from now, the system Cathal and PROXYZ build together is the format other operators globally choose to run on.",
    ],
    xLeftLabel: 'Brand-coupled',
    xRightLabel: 'Brand-agnostic',
    yTopLabel: 'Full-stack',
    yBottomLabel: 'Partial-layer',
    placements: [
      { brand: 'F45', quadrant: 'tl' },
      { brand: 'Orangetheory', quadrant: 'tl' },
      { brand: 'Xponential', quadrant: 'tl' },
      { brand: 'Technogym Mywellness', quadrant: 'bl' },
      { brand: 'Mindbody', quadrant: 'br' },
      { brand: 'Glofox', quadrant: 'br' },
    ],
    emptyQuadrantLabel: 'Lazy Tiger × PROXYZ. The format we’re building.',
  },

  hotelNetwork: {
    eyebrow: '14 · THE HOTEL NETWORK',
    headline: 'The hotel that hosts the flagship is the first partner.',
    paragraphs: [
      'The InterContinental Bangkok is the flagship. It is also the first Lazy Tiger hotel partner. IHG One Rewards has 130 million enrolled members globally. The Platinum and Diamond tiers are the right wallet for Lazy Tiger, and they travel.',
      'The bilateral mechanic is simple. IHG top-tier members get a complimentary Lazy Tiger class per stay, booked through the concierge. IHG pays per class redeemed. Lazy Tiger gets two to seven new paying members per month at zero acquisition cost. The hotel gets a wellness amenity its competitors can’t match. Everybody wins.',
      'That’s one hotel partnership. Singapore comes next. Then Hong Kong. Then a turnkey playbook Cathal and PROXYZ walk into every premium hotel partnership across Asia.',
    ],
    markers: [
      { city: 'Bangkok', hotel: 'InterContinental Bangkok', status: 'active', x: 540, y: 410 },
      { city: 'Singapore', hotel: 'InterContinental Singapore', status: 'pending', x: 590, y: 510 },
      { city: 'Hong Kong', hotel: 'Regent Hong Kong', status: 'pending', x: 680, y: 360 },
    ],
  },

  engagement: {
    headline: 'How we come in.',
    paragraphs: [
      "We engage under PROXYZ’s Build-with mode: a partnership that aligns our work with Lazy Tiger’s outcomes across the Asia rollout. The commercial details we work out together, in the room, the way operators do.",
      'What we do not do: SaaS-tier billing, per-seat pricing, metered AI. Pricing is engagement-mode-based. Always.',
      'What we always do: transparent diligence, board observer rights at install, exit-design discipline from day one.',
    ],
  },

  diligence: {
    headline: "What we're bringing to the room.",
    subline:
      'Three pieces of the operating system already designed. Surfaced here because depth is the work.',
    cards: [
      {
        label: 'LOYALTY · MEMBER VALUE LAYER',
        headline:
          'A three-tier loyalty system that rewards intensity, not attendance.',
        body:
          'Cub. Tiger. Black Tiger. The earn rate is calibrated to Tiger Score, not class count. Founding members start as Tiger for six months. Black Tiger unlocks VIP Coaching, partner hotel passes, cross-city access, and the annual Lazy Tiger International Tournament invitation. The system rewards the members who show up the hardest, not just the most often.',
      },
      {
        label: 'PARTNERSHIPS · HOTEL NETWORK PLAYBOOK',
        headline: 'The InterContinental is the first hotel partner, not the only one.',
        body:
          'IHG One Rewards has 130 million enrolled members globally. The bilateral mechanic at the Bangkok flagship sends top-tier IHG guests into Lazy Tiger as a complimentary perk. IHG pays per redemption. Lazy Tiger gets paying members at zero acquisition cost. The same playbook runs at the Singapore and Hong Kong properties when they come online.',
      },
      {
        label: 'POSITIONING · THE FORMAT THE WORLD WANTS TO INSTALL',
        headline:
          "There's an empty quadrant in the global boutique fitness landscape. We're building toward it.",
        body:
          "F45, Orangetheory, and Xponential force operators to adopt their brand. Mindbody and Glofox give you software but no gamification or scoring. No one currently sells a full-stack brand-agnostic operating system to boutique fitness brands. Lazy Tiger and PROXYZ are building it. Bangkok is the first installation. The Asia rollout is the proof. The empty quadrant is the long game.",
      },
    ],
    sourceLine: 'Lazy Tiger × PROXYZ, 2026-05-20',
  },

  currentStage: {
    headline: 'Currently in conversation.',
    paragraphs: [
      'Active engagement preview. The pressure-test, the architecture, the rollout sequencing, the financial model — all of it is on the table with Cathal as we figure out the right shape together.',
      'We share our work in motion because that’s how we operate.',
    ],
  },

  team: {
    headline: 'The PROXYZ team on Lazy Tiger.',
    members: [
      {
        name: 'Arnon (Tew) Saksri',
        role: 'Founder, PROXYZ Studio',
        bio: 'Architect of the Lazy Tiger engagement. Bridges design and AI automation across PROXYZ’s portfolio. Based in Bangkok.',
        initials: 'AT',
        photo: '/lazy-tiger/team/tew.jpg',
      },
      {
        name: 'iLing Sorum',
        role: 'Head of Sales + Media',
        bio: 'Onboarding as PROXYZ’s Integrator across cities. Owns the relationship surface area for partners through the engagement lifecycle.',
        initials: 'iL',
        photo: '/lazy-tiger/team/iling.jpg',
      },
    ],
  },

  otherPartners: {
    headline: 'Other partners in the studio.',
    cards: [
      {
        name: 'LAZY TIGER',
        sector: 'Bangkok · Boutique fitness',
        status: 'Active preview',
        current: true,
      },
      {
        name: 'FAST-FIX',
        sector: 'Phuket · Hospitality maintenance',
        status: 'Active discussion',
        href: '/pipeline/fast-fix',
      },
      {
        name: 'PUSHERS',
        sector: 'Thailand',
        status: 'In conversation',
      },
      {
        name: 'WILDER',
        sector: 'In progress',
        status: 'Active engagement',
      },
    ],
  },

  footer: {
    closing: 'DRIVE EACH OTHER.',
    sub: 'PROXYZ Studio operates from Bangkok.\nEngagements: Acquire · Partner · Build-with · Build-for.',
  },

  /* 20 scripted leaderboard members. HR ranges (60-185), Tiger Score baselines.
     Component animates ranks + scores; this is the seed. */
  leaderboard: [
    { rank: 1, name: 'Nawat P.', hr: 168, score: 9420, modality: 'cardio' },
    { rank: 2, name: 'Cathal K.', hr: 162, score: 9385, modality: 'cardio' },
    { rank: 3, name: 'Pim S.', hr: 174, score: 9201, modality: 'cardio' },
    { rank: 4, name: 'Marcus L.', hr: 159, score: 8944, modality: 'reformer' },
    { rank: 5, name: 'Aoy T.', hr: 171, score: 8810, modality: 'cardio' },
    { rank: 6, name: 'Daniel R.', hr: 165, score: 8702, modality: 'cardio' },
    { rank: 7, name: 'Sarawut V.', hr: 154, score: 8534, modality: 'reformer' },
    { rank: 8, name: 'Mai N.', hr: 178, score: 8401, modality: 'cardio' },
    { rank: 9, name: 'Hugo D.', hr: 161, score: 8298, modality: 'cardio' },
    { rank: 10, name: 'Apinya C.', hr: 144, score: 8120, modality: 'yoga' },
    { rank: 11, name: 'Liam O.', hr: 152, score: 7984, modality: 'reformer' },
    { rank: 12, name: 'Yui W.', hr: 169, score: 7820, modality: 'cardio' },
    { rank: 13, name: 'Tom H.', hr: 148, score: 7711, modality: 'yoga' },
    { rank: 14, name: 'Bee K.', hr: 163, score: 7544, modality: 'cardio' },
    { rank: 15, name: 'Erica Z.', hr: 138, score: 7380, modality: 'yoga' },
    { rank: 16, name: 'Joon S.', hr: 156, score: 7215, modality: 'reformer' },
    { rank: 17, name: 'Ploy A.', hr: 172, score: 7088, modality: 'cardio' },
    { rank: 18, name: 'Andrew B.', hr: 145, score: 6924, modality: 'reformer' },
    { rank: 19, name: 'Mint J.', hr: 140, score: 6781, modality: 'yoga' },
    { rank: 20, name: 'Niko F.', hr: 167, score: 6602, modality: 'cardio' },
  ],

  merch: [
    'Tiger Helmet Tee',
    'Drive Each Other Hoodie',
    'Neon Orange Cropped Jacket',
    'Cardio Studio Singlet',
    'Reformer Studio Long-sleeve',
    'Yoga Studio Mat Tote',
    'Master Logo Cap',
    'Tron Stripe Cycling Shorts',
    'Apex Member-Tier Anorak',
  ],

  coachChat: [
    {
      speaker: 'coach',
      text: 'Your HRV dropped 12 percent overnight. Same Wednesday pattern as last week.',
    },
    { speaker: 'member', text: 'I felt it. Pulled an 11 hour day.' },
    {
      speaker: 'coach',
      text: 'I’ve adjusted your Thursday session. Zone 2 on the Bike, 30 minutes. No leaderboard pressure tonight.',
    },
    { speaker: 'member', text: 'Thanks.' },
  ],
};
