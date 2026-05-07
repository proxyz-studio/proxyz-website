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
  eyebrow: string
  titleLines: string[]
  lead: string
  primaryCta: NavigationLink
  secondaryLink: NavigationLink
}

export interface DiagnosisConfig {
  sectionLabel: string
  heading: string
  paragraphs: string[]
  videoPath?: string
}

export interface PrincipleItem {
  number: string
  text: string
}

export interface PrinciplesConfig {
  sectionLabel: string
  heading: string
  items: PrincipleItem[]
}

export interface WayCard {
  name: string
  body: string
  link: NavigationLink
}

export interface TwoWaysConfig {
  sectionLabel: string
  heading: string
  cards: WayCard[]
}

export interface ServiceCard {
  name: string
  label: string
  forLabel: string
  body: string
  cta: NavigationLink
}

export interface ServicesConfig {
  sectionLabel: string
  intro: string
  cards: ServiceCard[]
}

export interface BuildWithConfig {
  sectionLabel: string
  heading: string
  paragraphs: string[]
  cta: NavigationLink
}

export interface StudioOSConfig {
  sectionLabel: string
  heading: string
  lead: string
  list: string[]
  closing: string
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
    { label: "What we do", href: "#services" },
    { label: "Studio OS", href: "#studio-os" },
  ],
  primaryCta: { label: "Book the Audit", href: "#booking" },
}

export const heroConfig: HeroConfig = {
  eyebrow: "ISSUE 01 / OPERATOR STUDIO",
  titleLines: ["Your proxy", "on the", "inside."],
  lead: "PROXYZ goes inside your company, rebuilds how it runs, automates the work that doesn't need a human, and stays as your AI operating partner. Anchored in Thailand. Working with operators wherever the upside is real.",
  primaryCta: { label: "Book the Audit", href: "#booking" },
  secondaryLink: { label: "What we do →", href: "#services" },
}

export const diagnosisConfig: DiagnosisConfig = {
  sectionLabel: "01 / THE DIAGNOSIS",
  heading: "Most companies don't have an AI problem. They have an operations problem.",
  paragraphs: [
    "Tribal knowledge in someone's head. Decisions made in group chats. Spreadsheets duct taped to email. AI bolted on top of broken process and called transformation.",
    "Companies don't run badly because the technology is missing. They run badly because the operating system is.",
  ],
}

export const principlesConfig: PrinciplesConfig = {
  sectionLabel: "02 / WHAT WE BELIEVE",
  heading: "Three principles.",
  items: [
    { number: "01.", text: "Automate first. Agentic where it earns it." },
    { number: "02.", text: "The system runs the company. Not the founder." },
    { number: "03.", text: "Thailand is not a market. It's an ecosystem." },
  ],
}

export const twoWaysConfig: TwoWaysConfig = {
  sectionLabel: "03 / TWO WAYS TO WORK WITH PROXYZ",
  heading: "Build for. Build with.",
  cards: [
    {
      name: "Build for.",
      body: "We come in. We install. We stay as your operator.",
      link: { label: "See the services →", href: "#services" },
    },
    {
      name: "Build with.",
      body: "We come in. We build alongside. We own a piece.",
      link: { label: "See the venture arm →", href: "#build-with" },
    },
  ],
}

export const servicesConfig: ServicesConfig = {
  sectionLabel: "04 / BUILD FOR",
  intro:
    "Paid engagements. We come in, install systems, automate the work, and stay long term.",
  cards: [
    {
      name: "The Audit",
      label: "FREE / 60 MINUTES",
      forLabel: "Anyone serious about running better.",
      body: "A working session, not a sales call. We sit with you, walk the business, and leave you with a one page memo on the three highest leverage points in your operation. Yours to keep, even if we never work together.",
      cta: { label: "Book the Audit", href: "#booking" },
    },
    {
      name: "The Blueprint",
      label: "USD 12,000 / 90 DAYS",
      forLabel: "Founders launching a new venture.",
      body: "We take your idea and turn it into a structured, validated, ready to operate company. Legal structure, deal architecture, partners, financial model, operating system spec, AI stack from day one. You walk out with a build ready blueprint and the introductions to make it real.",
      cta: { label: "Start with the Audit", href: "#booking" },
    },
    {
      name: "The Install",
      label: "USD 25,000 to 40,000 / 90 TO 120 DAYS",
      forLabel: "Existing companies modernizing their operation.",
      body: "We install the Studio OS, automate the work that doesn't need a human, layer in AI where it earns its place, and train your team. You come out running on something that scales without the founder in every meeting.",
      cta: { label: "Start with the Audit", href: "#booking" },
    },
    {
      name: "The Partnership",
      label: "FROM USD 2,000 PER MONTH",
      forLabel:
        "Companies who want PROXYZ on retainer as the AI landscape shifts.",
      body: "We stay as your fractional AI operating partner. Quarterly roadmap reviews, stack updates, team training, and a direct line as the landscape changes. This is what makes \"future proof\" something other than a slogan.",
      cta: { label: "Add to any engagement", href: "#booking" },
    },
  ],
}

export const buildWithConfig: BuildWithConfig = {
  sectionLabel: "05 / BUILD WITH",
  heading: "We don't sell this one. We choose it.",
  paragraphs: [
    "For the rare founder where the upside is real and the chemistry is right. We come in, rebuild the business end to end, and stay as a long term operating partner. Compensation is equity, earned against committed deliverables. Two or three active at a time. By invitation only.",
    "This isn't a tier on a menu. It's a partnership.",
  ],
  cta: {
    label: "Pitch us. →",
    href: "mailto:hello@proxyz.studio?subject=Build with PROXYZ",
  },
}

export const studioOSConfig: StudioOSConfig = {
  sectionLabel: "06 / THE STUDIO OS",
  heading: "The system every engagement installs.",
  lead: "The Studio OS is the operating layer PROXYZ installs inside every client. It's not software. It's how the company runs.",
  list: [
    "A meeting cadence that compresses decision time",
    "Decision rights that stop bottlenecks at the founder",
    "Dashboards built around the metrics that move the business",
    "An automation layer that runs the work that doesn't need a human",
    "An AI stack tailored to the operation, not someone else's playbook",
  ],
  closing:
    "A real operator playbook, white labeled and rebuilt for every client. Whether we build for you or with you, the Studio OS is the system we install.",
}

export const bookingConfig: BookingConfig = {
  sectionLabel: "07 / BOOK YOUR AUDIT",
  heading: "60 minutes. One page memo. Yours to keep.",
  body: "Every PROXYZ engagement starts here. Pick a time below.",
  calLink: "YOUR-CAL-LINK",
}

export const footerConfig: FooterConfig = {
  left: "PROXYZ. An operator studio. Phuket and Bangkok.",
  email: {
    label: "hello@proxyz.studio",
    href: "mailto:hello@proxyz.studio",
  },
  linkedin: { label: "LinkedIn", href: "#" },
  right: "© 2026. All rights reserved.",
}
