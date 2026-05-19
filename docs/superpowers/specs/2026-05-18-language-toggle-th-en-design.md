# Thai / English Language Toggle — Design Spec

**Date:** 2026-05-18
**Project:** PROXYZ Website-V1 (`05-build/`)
**Status:** Approved by user, pending spec review and implementation plan
**Scope:** Homepage only, v1

## Goal

Add a language toggle to the PROXYZ homepage that switches user-facing copy between English and Thai. The Thai version is a transcreated, curated experience aimed at Thai operator and SMB owner audiences (the actual buyer persona for the Acquire / Partner / Build-with modes). All other pages of the site stay English-only in v1.

## Decisions locked from brainstorming

| Decision | Choice |
|----------|--------|
| Target audience | Thai operators / SMB owners (mid-market business buyers) |
| Pages in scope | Homepage only |
| Editorial style | Transcreation — Thai is rewritten in a Thai operator voice, allowed to diverge from English in shape and length |
| Storage approach | Side-by-side fields in `src/config.ts` using a `Bilingual<T>` wrapper |
| Missing-translation fallback | Show English content with a small `[EN]` tag in the section eyebrow |
| URL behavior | Same URL, content swaps in place. No `/th` route. No SEO duplicates. |
| Toggle placement | Nav bar, immediately left of the LOGIN pill |
| Toggle visual | Monospace `EN | TH`, active letter in `var(--accent-pink)` (#FF4193), inactive at `rgba(255,255,255,0.6)` |
| First-visit default | English. User opts into Thai. Choice persists in `localStorage`. |

## Always-English elements (no `Bilingual<T>` wrapper, ever)

These remain plain strings even in the Thai version because they function as brand chassis or visual idents:

- Brand name `PROXYZ` and the wordmark (PROXY/Z color split, glitch animation)
- Engagement-mode labels: `BUILD FOR`, `BUILD WITH`, `ACQUIRE`, `PARTNER`
- Marquee strip words: `OPERATOR STUDIO`, `BANGKOK`, `PHUKET`, `BUILD FOR`, `BUILD WITH`, `THE PORTAL`, `PADEL Z`, `AI INSIDE`
- Nav labels in `navigationConfig`: stored Title Case (`"What we do"`, `"Studio OS"`, `"Media"`, `"Partners"`, `"Login"`), rendered uppercase via CSS `text-transform: uppercase` in `Nav.tsx`. Do not wrap, do not change source casing.
- The language toggle letters themselves (`EN`, `TH`)

## Translation targets (homepage prose only)

These fields get wrapped in `Bilingual<T>` and accept Thai copy. Thai may be omitted on initial commit; sections without Thai trigger the `[EN]` fallback badge.

- Hero: eyebrow, title lines, lead paragraph, primary CTA label, secondary CTA label
- Diagnosis section: heading, body
- Principles section: heading, each principle title and body
- TwoWays section: heading, both lane descriptions
- Services section: descriptive prose under each engagement-mode label (the labels stay English)
- BuildWith section: heading, body, supporting copy
- StudioOS homepage section: heading, body (the on-homepage preview, not the dedicated Portal page at `/portal`)
- Booking section: heading, body, button label
- Footer: any prose copy. Footer nav labels stay English.

## Architecture

The implementation breaks into four small units. Each has one responsibility and can be understood independently. There is no dynamic fallback-tracking context; the fallback signal is computed statically by each section from the same `Bilingual<T>` values it renders. This avoids React render-order bugs and the hidden-cycle pitfalls of a context-based tracker.

### Unit 1 — `Bilingual<T>` type and the `t()` helper

**Location:** `src/i18n/Bilingual.ts`

A type and a pure function. Zero React dependency.

- `Bilingual<T> = { en: T; th?: T }` — the wrapper type used in `config.ts`.
- `t<T>(value: Bilingual<T>, locale: 'en' | 'th'): T` — pure function. Returns `value.th` when present and locale is Thai, otherwise `value.en`. Never returns `undefined`.
- `isFallback(value: Bilingual<unknown>, locale: 'en' | 'th'): boolean` — pure predicate. Returns `true` if locale is Thai and `value.th` is undefined. Returns `false` otherwise.
- `anyFallback(locale: 'en' | 'th', ...values: Array<Bilingual<unknown>>): boolean` — convenience helper. Returns `true` if any of the passed values would fall back at the given locale.

**Interface contract:** all three are pure functions. No React. No side effects. The `en` field is required by the type, so a missing English value is a TypeScript compile error.

**Concrete example for arrays-of-objects:** sections with repeating items (Principles list, Services list, Footer columns) wrap each translatable field on each item, not the array itself:

```ts
// principlesConfig in src/config.ts
export const principlesConfig = {
  heading: { en: 'How we think', th: 'วิธีคิดของเรา' } satisfies Bilingual<string>,
  items: [
    {
      title: { en: 'Inside, not beside', th: 'อยู่ข้างใน ไม่ใช่ข้างเคียง' } satisfies Bilingual<string>,
      body:  { en: '...', th: '...' } satisfies Bilingual<string>,
    },
    // more items...
  ],
};
```

Sections then call `t()` per field per item. The array itself is plain, only the per-item fields are wrapped.

**Tested by:** TypeScript compile-time check (`npm run typecheck`) plus manual smoke (toggle the locale, watch the values flip). No Vitest runtime tests in v1 — see Verification section for why.

### Unit 2 — `LocaleContext` and `useLocale` hook

**Location:** `src/i18n/LocaleContext.tsx`

A React Context that holds the active locale and a setter.

- Provides `{ locale: 'en' | 'th', setLocale: (next) => void }`.
- On provider mount: reads `localStorage.getItem('proxyz-locale')`. Defaults to `'en'` if missing, malformed, or any unknown value.
- On `setLocale`: writes new value to `localStorage` synchronously inside a try/catch. localStorage failures are logged via `console.warn` but do not throw.
- Exposes a `useLocale()` hook. Outside the provider, the hook returns a default `{ locale: 'en', setLocale: () => {} }` so components never crash if accidentally rendered without the provider.
- The provider is mounted at the App root in `src/App.tsx`, wrapping `<RouterProvider />` (or equivalent).

**Interface contract:** consumers receive a stable object. Locale is guaranteed to be `'en'` or `'th'`. Setter always succeeds (no thrown exceptions).

### Unit 3 — `useBilingual` hook

**Location:** `src/i18n/useBilingual.ts`

A thin React hook over `t()`.

- Signature: `useBilingual<T>(value: Bilingual<T>): T`
- Reads locale from `useLocale()`.
- Returns `t(value, locale)`.
- Pure render-time function. No side effects, no refs, no context registration. Safe to call any number of times in any order.

**Interface contract:** drop-in replacement for direct field access. Components change `heroConfig.title` to `useBilingual(heroConfig.title)`. No render-order concerns because there is no fallback registration happening behind the scenes.

### Unit 4 — `<FallbackBadge />` component

**Location:** `src/components/FallbackBadge.tsx`

A dumb presentational component. No context, no tracking, no state.

- Props: `{ show: boolean }`
- Renders `<span>[EN]</span>` when `show === true`, otherwise renders `null`.
- Visual: IBM Plex Mono, half the font-size of normal eyebrow text, color `rgba(255,255,255,0.5)`, two non-breaking spaces of left margin to separate from the preceding eyebrow text.

**How sections use it:** each section computes its own `show` boolean from the `Bilingual<T>` fields it renders, using `anyFallback()`. Example:

```tsx
function HeroSection() {
  const { locale } = useLocale();
  const eyebrow = useBilingual(heroConfig.eyebrow);
  const titleLines = useBilingual(heroConfig.titleLines);
  const lead = useBilingual(heroConfig.lead);
  const showBadge = anyFallback(locale, heroConfig.eyebrow, heroConfig.titleLines, heroConfig.lead);

  return (
    <section>
      <p className="eyebrow">{eyebrow}<FallbackBadge show={showBadge} /></p>
      <h1>{titleLines.join(' ')}</h1>
      <p>{lead}</p>
    </section>
  );
}
```

**Why this beats the original context-based tracker design:**
- No React render-order bug (the badge no longer reads sibling state).
- No `report()` during render, no warnings, no double-renders.
- Each section's fallback signal is explicit and reviewable in one block of code.
- The trade-off (each section must list its tracked fields when computing `showBadge`) is acceptable because every section knows its own fields and the list is short.

### Unit 5 — `<LanguageToggle />` component

**Location:** `src/components/LanguageToggle.tsx`

The toggle UI.

- Renders two adjacent `<button>` elements with a `|` separator span between, styled to read as `EN | TH`.
- Each button reads locale from `useLocale()`. Active button: `color: var(--accent-pink)`. Inactive: `color: rgba(255,255,255,0.6)`.
- Each button has `aria-pressed={isActive}` and `aria-label="Switch to English"` / `"Switch to Thai"`.
- Click handler calls `setLocale('en' | 'th')`.
- Visual: IBM Plex Mono, same font-size as nav links. Buttons have no background, no border, no padding beyond their text. Cursor: `pointer`.
- Hover state on the inactive letter: brightens to `rgba(255,255,255,0.85)`.

**Route gating:** the toggle renders only on the homepage in v1. Implementation: the toggle reads `useLocation().pathname` and returns `null` unless `pathname === '/'`. This is robust enough for the current `react-router-dom@^7` setup; trailing-slash and query/hash variants normalize correctly under React Router 7 (`pathname` excludes search and hash).

**Placement in `Nav.tsx`:** inserted into the existing right-cluster of nav links, immediately before the `LOGIN` pill. The toggle adds a small left margin (16px) to separate from the preceding nav link.

**Mobile behavior:** the current site has no hamburger menu. At `≤480px` the nav-link strip is hidden via `display: none !important` on `.hero-nav-links a:not(.hero-nav-cta)` (see `src/index.css` lines 392-394). For v1, the `<LanguageToggle />` is NOT a nav link in that sense; it is rendered as a peer of the `LOGIN` pill and stays visible at mobile, slightly smaller (font-size matches the mobile LOGIN pill). No hamburger work in scope.

## Translation workflow

The first-pass workflow is direct editing of `src/config.ts`:

1. The developer (this session) wraps every translatable field in `Bilingual<T>` and writes the `en:` line using the existing English copy. The initial commit lands with all `th:` lines absent. Site behavior is unchanged for English visitors; Thai mode shows the toggle but every section displays `[EN]` badges.
2. Tew (or a Thai writer) opens `src/config.ts` and adds `th:` lines field by field at whatever pace fits. Each commit ships more Thai. `[EN]` badges shrink as translations land.
3. If translation work moves to an external Thai writer who does not want to edit TypeScript, build a one-time export script that turns the wrapped config into a markdown table or CSV. Not building this in v1.

## Edge cases and explicit decisions

- **Toggle on non-homepage routes** (e.g., `/portal`, `/partners/*`, `/media`): in v1, the toggle is rendered **only on the homepage route (`/`)**. The `<LanguageToggle />` component checks `useLocation().pathname === '/'` before rendering, returning `null` otherwise. This communicates clearly: "Thai is available here." When more pages get translations, lift the toggle to global nav. (Note: the existing Studio OS route is at `/portal`, not `/studio-os`; verified via `src/App.tsx`.)
- **Initial commit, Thai mode**: on the first commit that ships the toggle, no Thai copy has been written yet, so toggling to Thai will render the entire homepage with `[EN]` badges visible. This is intentional. The toggle's discoverability matters more than the appearance of completeness on day one. The badges become a useful progress indicator as Thai copy is added section by section.
- **Thai text length differs from English** (Thai often runs longer per equivalent thought): the design relies on existing responsive type sizing in `index.css`. No per-locale layout overrides in v1. If a specific section visibly breaks, fix that section's layout case by case rather than building generic locale-aware spacing.
- **Locale persistence across browsers / devices**: not in scope. localStorage is per-browser. If a user clears storage or switches devices, they get English again until they re-toggle.
- **Toggling in the middle of a session**: instant. No fade, no loading state. React re-renders with the new locale and content swaps.
- **Server-side rendering / static prerender**: the site is a Vite SPA, all rendering is client-side. No SSR considerations.
- **`navigationConfig` source-string format**: covered in the Always-English-elements section. Repeated here for emphasis: leave nav source strings in Title Case, let CSS handle the uppercase rendering. Do not wrap nav labels in `Bilingual<T>`.

## Out of scope (explicit non-goals for v1)

- Other pages (`/portal`, `/partners/*`, `/media`, `/the-audit`, `/preview/*`)
- Auto-detection of Thai browser locale
- Separate Thai URL (`/th` route)
- SEO hreflang tags or meta-language tags
- Translator export tooling (CSV / markdown export script)
- Pluralization rules, number formatting, currency formatting, date formatting
- Right-to-left language support
- Multi-language support beyond English and Thai
- Vitest / Jest / runtime test framework setup
- Hamburger mobile menu

## Prerequisites

Before implementation begins, add this script to `package.json` if it does not already exist:

```json
"scripts": {
  "typecheck": "tsc --noEmit -p ."
}
```

This is the command used in the Verification section below. The existing `build` script (`tsc -b && vite build`) also catches type errors, but a standalone `typecheck` script keeps the verification step fast and explicit.

## Verification

### Automated

- TypeScript compile check via `npm run typecheck`. This catches missing required `en` fields, malformed `Bilingual<T>` usage, missing imports, and type errors in the new i18n module. It is the primary correctness check for v1.
- `npm run lint` to confirm no ESLint regressions in the new files.
- `npm run build` to confirm the full production build succeeds.

**Vitest / runtime unit tests are out of scope for v1.** Reasoning: the `t()` helper logic is a single ternary expression. The `useBilingual` hook is a thin wrapper around `t()`. Setting up Vitest, test-runner config, and CI plumbing has higher cost than the test coverage value at this stage. If the i18n module grows beyond this spec (pluralization, interpolation, more locales), revisit and add Vitest as a follow-up.

### Manual smoke (local Vite preview, before deploy)

- Toggle EN → TH → EN, watch each homepage section swap content
- Reload after picking Thai, verify locale persists across reload
- Open in incognito window, verify default is English on first visit
- Resize to mobile breakpoint (≤480px), verify toggle still visible next to LOGIN
- Confirm nav labels, marquee words, BUILD FOR / WITH labels stay English in both modes (regression check on always-English elements)
- Confirm `[EN]` badges appear in Thai mode for un-translated sections, disappear once Thai is added for those sections
- Confirm toggle is hidden on non-homepage routes: navigate to `/portal`, `/partners`, `/media`, verify toggle returns `null`

### Post-deploy smoke (proxyz.studio)

- Fresh browser hits `proxyz.studio`, toggle visible in nav
- Click TH, content swaps with no page reload, no URL change
- View page source, confirm both English and Thai strings present in the bundle (Vite inlines them at build time)
- Navigate to `/portal`, confirm toggle does not render

## Risks and known unknowns

- **Translation quality**: transcreation depends on whoever writes the Thai. If Tew writes it solo, voice consistency is high. If a third party writes it, voice drift is the main risk. Mitigation: review every committed Thai string against the brand voice guide before merging.
- **Bundle size**: adding Thai strings to `config.ts` roughly doubles the size of translatable fields. For the homepage, that is maybe an extra 5 to 15 KB minified. Negligible on a site that already ships a 490 KB main bundle. No code-splitting needed for Thai in v1.
- **Brand consistency in Thai**: Thai marketing copy can drift toward formal `ครับ/ค่ะ` register or toward informal direct address. The brand voice guide should explicitly call out the desired register before any Thai copy is written. This is a content task, not an architecture task, and is out of scope for this spec.
