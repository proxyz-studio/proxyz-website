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
- Nav labels: `WHAT WE DO`, `STUDIO OS`, `MEDIA`, `PARTNERS`, `LOGIN`
- The language toggle letters themselves (`EN`, `TH`)

## Translation targets (homepage prose only)

These fields get wrapped in `Bilingual<T>` and accept Thai copy. Thai may be omitted on initial commit; sections without Thai trigger the `[EN]` fallback badge.

- Hero: eyebrow, title lines, lead paragraph, primary CTA label, secondary CTA label
- Diagnosis section: heading, body
- Principles section: heading, each principle title and body
- TwoWays section: heading, both lane descriptions
- Services section: descriptive prose under each engagement-mode label (the labels stay English)
- BuildWith section: heading, body, supporting copy
- StudioOS homepage section: heading, body (the on-homepage preview, not the dedicated `/studio-os` page)
- Booking section: heading, body, button label
- Footer: any prose copy. Footer nav labels stay English.

## Architecture

The implementation breaks into five small units. Each has a single responsibility and can be understood and tested independently.

### Unit 1 — `Bilingual<T>` type and the `t()` helper

**Location:** `src/i18n/Bilingual.ts`

A type and a pure function. Zero React dependency.

- `Bilingual<T> = { en: T; th?: T }` — the wrapper type used in `config.ts`.
- `t(value: Bilingual<T>, locale: 'en' | 'th'): { value: T; fellBack: boolean }` — pure function. Returns Thai if present, otherwise English, plus a flag for whether fallback occurred.

**Interface contract:** never returns `undefined`. The `en` field is required by the type, so a missing English value is a compile error.

**Tested by:** unit tests in `src/i18n/__tests__/t.test.ts`. Three cases: English mode, Thai mode with translation present, Thai mode with translation missing.

### Unit 2 — `LocaleContext` and `useLocale` hook

**Location:** `src/i18n/LocaleContext.tsx`

A React Context that holds the active locale and a setter.

- Provides `{ locale: 'en' | 'th', setLocale: (next) => void }`.
- On provider mount: reads `localStorage.getItem('proxyz-locale')`. Defaults to `'en'` if missing, malformed, or set to an unknown value.
- On `setLocale`: writes the new value to `localStorage` synchronously.
- Exposes a `useLocale()` hook.

**Interface contract:** consumers receive a stable object with a guaranteed `'en'` or `'th'` locale and a setter that always succeeds (localStorage write is wrapped in try/catch; failures are logged but do not throw).

**Tested by:** smoke tested via the toggle behavior. No dedicated unit test in v1.

### Unit 3 — `useBilingual` hook

**Location:** `src/i18n/useBilingual.ts`

A React hook that wraps `t()` for component use.

- Signature: `useBilingual<T>(value: Bilingual<T>): T`
- Reads locale from `useLocale()`.
- Returns the resolved value.
- Calls `useFallbackTracker().report(fellBack)` so the enclosing section can detect whether any field in it fell back to English.

**Interface contract:** drop-in replacement for direct field access. Components change `heroConfig.title` to `useBilingual(heroConfig.title)`.

### Unit 4 — `FallbackTracker` context and badge

**Location:** `src/i18n/FallbackTracker.tsx`

A section-scoped React Context that collects fallback signals from `useBilingual` calls inside one section, then exposes a flag for the section's eyebrow to render the `[EN]` badge.

- `<FallbackTrackerProvider>` wraps a section. Children's `useBilingual` calls register their fallback state.
- A `useFellBack()` hook returns `true` if any wrapped field fell back in the current render.
- `<FallbackBadge />` renders the small `[EN]` indicator. It checks `useFellBack()` and `useLocale()` itself; it only renders when `locale === 'th'` AND `useFellBack() === true`.

**Visual:** monospace `[EN]`, half the size of normal eyebrow text, color `rgba(255,255,255,0.5)`. Appended to the existing eyebrow string, separated by two spaces.

**Interface contract:** sections that opt into fallback reporting wrap themselves in the provider and render `<FallbackBadge />` near their eyebrow. Sections that don't opt in still work, they just never show the badge.

### Unit 5 — `<LanguageToggle />` component

**Location:** `src/components/LanguageToggle.tsx`

The actual toggle UI.

- Renders two adjacent `<button>` elements styled to look like `EN | TH` text (with a `|` separator span between them).
- Each button reads locale from `useLocale()`. The active button gets `color: var(--accent-pink)`; the inactive gets `color: rgba(255,255,255,0.6)`.
- Each button has `aria-pressed={isActive}`, `aria-label="Switch to English"` / `"Switch to Thai"`, and keyboard support out of the box (native button element).
- Click handler calls `setLocale('en' | 'th')`.
- Visual: IBM Plex Mono, same font-size as nav links. Buttons have no background, no border, no padding beyond their text. Cursor is `pointer`.
- Hover state: inactive letter brightens to `rgba(255,255,255,0.85)`.

**Placement in `Nav.tsx`:** inserted as the last child of the nav's right cluster, immediately before the `LOGIN` pill. Adds a small horizontal margin to separate visually.

**Mobile behavior:** when the nav collapses to a hamburger / mobile menu, the toggle sits at the top of the opened menu, same position relative to LOGIN. Same component, just rendered inside the mobile menu container.

## Translation workflow

The first-pass workflow is direct editing of `src/config.ts`:

1. The developer (this session) wraps every translatable field in `Bilingual<T>` and writes the `en:` line using the existing English copy. The initial commit lands with all `th:` lines absent. Site behavior is unchanged for English visitors; Thai mode shows the toggle but every section displays `[EN]` badges.
2. Tew (or a Thai writer) opens `src/config.ts` and adds `th:` lines field by field at whatever pace fits. Each commit ships more Thai. `[EN]` badges shrink as translations land.
3. If translation work moves to an external Thai writer who does not want to edit TypeScript, build a one-time export script that turns the wrapped config into a markdown table or CSV. Not building this in v1.

## Edge cases and explicit decisions

- **Toggle on non-homepage routes** (e.g., `/studio-os`, `/partners/*`, `/media`): in v1, the toggle is rendered **only on the homepage route (`/`)**. The `<LanguageToggle />` component checks `useLocation().pathname === '/'` before rendering, returning `null` otherwise. This communicates clearly: "Thai is available here." When more pages get translations, lift the toggle to global nav.
- **Thai text length differs from English** (Thai often runs longer per equivalent thought): the design relies on existing responsive type sizing in `index.css`. No per-locale layout overrides in v1. If a specific section visibly breaks, fix that section's layout case by case rather than building generic locale-aware spacing.
- **Locale persistence across browsers / devices**: not in scope. localStorage is per-browser. If a user clears storage or switches devices, they get English again until they re-toggle.
- **Toggling in the middle of a session**: instant. No fade, no loading state. React re-renders with the new locale and content swaps.
- **Server-side rendering / static prerender**: the site is a Vite SPA, all rendering is client-side. No SSR considerations.

## Out of scope (explicit non-goals for v1)

- Other pages (`/studio-os`, `/partners/*`, `/media`, `/the-audit`, `/preview/*`)
- Auto-detection of Thai browser locale
- Separate Thai URL (`/th` route)
- SEO hreflang tags or meta-language tags
- Translator export tooling (CSV / markdown export script)
- Pluralization rules, number formatting, currency formatting, date formatting
- Right-to-left language support
- Multi-language support beyond English and Thai

## Verification

### Automated

- Unit tests on `t()` helper at `src/i18n/__tests__/t.test.ts`:
  - Returns `value.en` when `locale === 'en'`, `fellBack === false`
  - Returns `value.th` when `locale === 'th'` AND `value.th` is defined, `fellBack === false`
  - Returns `value.en` when `locale === 'th'` AND `value.th` is undefined, `fellBack === true`
  - Never returns `undefined`
- TypeScript compile check (`npx tsc --noEmit -p .`) catches missing required `en` fields and missing imports.

### Manual smoke (local Vite preview, before deploy)

- Toggle EN → TH → EN, watch homepage sections swap content each time
- Reload after picking Thai; verify locale persists
- Open in incognito window; verify default is English
- Resize to mobile breakpoint; verify toggle exists in mobile menu and works
- Confirm nav labels, marquee words, BUILD FOR / WITH labels stay English in both modes
- Confirm `[EN]` badges appear in Thai mode for un-translated sections and disappear once Thai is added
- Confirm toggle is hidden on non-homepage routes (Studio OS, Partners, Media)

### Post-deploy smoke (proxyz.studio)

- Fresh browser hits `proxyz.studio`; toggle visible in nav
- Click TH; content swaps with no page reload, no URL change
- Page source contains both the structure and any Thai text that has been added

## Risks and known unknowns

- **Translation quality**: transcreation depends on whoever writes the Thai. If Tew writes it solo, voice consistency is high. If a third party writes it, voice drift is the main risk. Mitigation: review every committed Thai string against the brand voice guide before merging.
- **Bundle size**: adding Thai strings to `config.ts` roughly doubles the size of translatable fields. For the homepage, that is maybe an extra 5 to 15 KB minified. Negligible on a site that already ships a 490 KB main bundle. No code-splitting needed for Thai in v1.
- **Brand consistency in Thai**: Thai marketing copy can drift toward formal `ครับ/ค่ะ` register or toward informal direct address. The brand voice guide should explicitly call out the desired register before any Thai copy is written. This is a content task, not an architecture task, and is out of scope for this spec.
