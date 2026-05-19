# Thai / English Language Toggle — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Thai/English language toggle to the PROXYZ homepage. Wire up the i18n primitives, a nav-bar toggle UI, and per-section content swap with `[EN]` fallback badges where Thai copy is not yet written.

**Architecture:** A small pure-function i18n module at `src/i18n/*` holds the `Bilingual<T>` type and the `t() / isFallback() / anyFallback()` helpers. A React Context provides locale state, persisted in `localStorage`. A thin `useBilingual` hook lets components swap content. Each homepage section is refactored to wrap its translatable config fields in `Bilingual<T>` and to render via `useBilingual()` with a static `anyFallback()` check that drives a `<FallbackBadge />` in the section's eyebrow.

**Tech Stack:** React 19, Vite, TypeScript (strict), Tailwind v3, react-router-dom@7. No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-05-18-language-toggle-th-en-design.md`

**Branching:** Run on `feat/i18n-toggle` branch. Auto-deploy from `main` is ON per `~/.claude/rules/build-deploy-architecture.md`; using a feature branch lets Vercel preview deploys catch issues before merging. Open a PR after Chunk 3, merge after Chunk 4 smoke.

**Test discipline:** No Vitest setup in v1 (spec §"Verification"). Every task ends with `npm run typecheck` and `npm run build`. Manual smoke happens at the end of Chunk 2 (toggle visible, click works) and at the end of Chunk 3 (every section swaps). Final manual + post-deploy smoke is Chunk 4.

**Commits:** One commit per task, conventional commit prefix (`feat:` for new files, `refactor:` for section conversions). Commits compose into the PR.

---

## Chunk 1: i18n primitives + provider mount

This chunk builds the foundation. After Chunk 1 lands, no UI has changed yet — the i18n module exists, the provider is mounted, but nothing calls into them. This isolates the new infrastructure from any user-visible regressions.

### Task 1.1: Add typecheck script to package.json

**Why:** Spec §"Prerequisites" requires `npm run typecheck` for verification. `package.json` currently has `dev`, `build`, `lint`, `preview` — no `typecheck`.

**Files:**
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Read current scripts block**

Run: `cat package.json | head -15`
Expected: confirm `"scripts": { "dev": "vite", "build": "tsc -b && vite build", "lint": "eslint .", "preview": "vite preview" }`

- [ ] **Step 2: Add the typecheck script**

Add after the `lint` line:

```json
"typecheck": "tsc --noEmit -p .",
```

The final scripts block should look like:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit -p .",
  "preview": "vite preview"
},
```

- [ ] **Step 3: Verify the script runs**

Run: `npm run typecheck`
Expected: command runs to completion, no TypeScript errors (codebase is currently clean).

- [ ] **Step 4: Commit**

```bash
git checkout -b feat/i18n-toggle
git add package.json
git commit -m "chore: add typecheck script for i18n verification"
```

---

### Task 1.2: Create `Bilingual<T>` type and pure helpers

**Why:** Spec §"Unit 1". Pure functions, no React. Foundation everything else depends on.

**Files:**
- Create: `src/i18n/Bilingual.ts`

- [ ] **Step 1: Write the file**

```ts
// src/i18n/Bilingual.ts

/**
 * A translatable field. English is required; Thai is optional.
 * When Thai is absent in Thai mode, callers fall back to English.
 */
export type Bilingual<T> = { en: T; th?: T };

export type Locale = 'en' | 'th';

/**
 * Resolve a Bilingual value to the active locale's value.
 * Falls back to English when locale is Thai but `th` is undefined.
 * Never returns undefined (because `en` is required by the type).
 */
export function t<T>(value: Bilingual<T>, locale: Locale): T {
  if (locale === 'th' && value.th !== undefined) {
    return value.th;
  }
  return value.en;
}

/**
 * Returns true when the value WOULD fall back to English at the given locale.
 * Pure predicate. No side effects.
 */
export function isFallback(value: Bilingual<unknown>, locale: Locale): boolean {
  return locale === 'th' && value.th === undefined;
}

/**
 * Returns true if ANY of the passed Bilingual values would fall back
 * at the given locale. Sections use this to decide whether to render
 * the [EN] badge in their eyebrow.
 */
export function anyFallback(
  locale: Locale,
  ...values: Array<Bilingual<unknown>>
): boolean {
  if (locale !== 'th') return false;
  return values.some((v) => v.th === undefined);
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/Bilingual.ts
git commit -m "feat(i18n): add Bilingual<T> type and pure resolver helpers"
```

---

### Task 1.3: Create `LocaleContext` and `useLocale` hook

**Why:** Spec §"Unit 2". React Context for locale state. localStorage persistence. Default to English on first visit.

**Files:**
- Create: `src/i18n/LocaleContext.tsx`

- [ ] **Step 1: Write the file**

```tsx
// src/i18n/LocaleContext.tsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Locale } from './Bilingual';

const STORAGE_KEY = 'proxyz-locale';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
};

// Default context value: English mode, no-op setter.
// Used when a component is rendered outside any <LocaleProvider>,
// which never happens in production but guards against accidental
// usage in tests, Storybook, or future routes.
const defaultValue: LocaleContextValue = {
  locale: 'en',
  setLocale: () => {},
};

const LocaleContext = createContext<LocaleContextValue>(defaultValue);

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'en' || raw === 'th') return raw;
  } catch {
    // localStorage may throw in private mode or with quota issues. Fall through.
  }
  return 'en';
}

function writeStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch (err) {
    console.warn('[i18n] failed to persist locale:', err);
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Initial state: synchronous read of localStorage so first paint is correct.
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  // Defensive: if localStorage was read pre-hydration, this is a no-op.
  // If anything else changes the stored value, we don't try to sync — locale
  // ownership lives in this provider for the duration of the session.
  useEffect(() => {
    writeStoredLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/LocaleContext.tsx
git commit -m "feat(i18n): add LocaleProvider with localStorage persistence"
```

---

### Task 1.4: Create `useBilingual` hook

**Why:** Spec §"Unit 3". Thin sugar over `t() + useLocale()` so component code reads cleanly.

**Files:**
- Create: `src/i18n/useBilingual.ts`

- [ ] **Step 1: Write the file**

```ts
// src/i18n/useBilingual.ts
import type { Bilingual } from './Bilingual';
import { t } from './Bilingual';
import { useLocale } from './LocaleContext';

/**
 * Resolves a Bilingual<T> field to the active locale's value.
 * Falls back to English when Thai is undefined in Thai mode.
 * Pure render-time function; no side effects.
 */
export function useBilingual<T>(value: Bilingual<T>): T {
  const { locale } = useLocale();
  return t(value, locale);
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/useBilingual.ts
git commit -m "feat(i18n): add useBilingual hook"
```

---

### Task 1.5: Create `<FallbackBadge />` presentational component

**Why:** Spec §"Unit 4". Dumb component, no state, no context. Renders `[EN]` when `show` is true.

**Files:**
- Create: `src/components/FallbackBadge.tsx`

- [ ] **Step 1: Write the file**

```tsx
// src/components/FallbackBadge.tsx

/**
 * Small [EN] indicator rendered in a section's eyebrow when the section
 * is displaying English content in Thai mode (because Thai copy is missing).
 *
 * Pure presentational. Each section computes its own `show` boolean via
 * the anyFallback() helper from src/i18n/Bilingual.
 */
export function FallbackBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      aria-label="English shown; Thai translation not yet available"
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.5em',
        color: 'rgba(255,255,255,0.5)',
        marginLeft: '0.75em',
        verticalAlign: 'middle',
        letterSpacing: '0.08em',
      }}
    >
      [EN]
    </span>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/FallbackBadge.tsx
git commit -m "feat(i18n): add FallbackBadge presentational component"
```

---

### Task 1.6: Mount `LocaleProvider` at the app root

**Why:** Without this, `useLocale()` returns the default `{ locale: 'en', setLocale: () => {} }` and nothing can actually switch locale. Wrap inside `BrowserRouter` so route-aware components (the toggle) work correctly.

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Read current main.tsx**

Run: `cat src/main.tsx`
Expected (current content):

```tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

- [ ] **Step 2: Add the provider**

Change `src/main.tsx` to:

```tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LocaleProvider } from './i18n/LocaleContext'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </BrowserRouter>
)
```

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Smoke test the provider**

Run: `npm run dev` in one terminal. Open the local URL (typically http://localhost:5173).
Open browser devtools console and run:

```js
localStorage.getItem('proxyz-locale')
```

Expected: returns `"en"` (the provider's `useEffect` writes the initial value on mount).

If it returns `null`, the provider is not mounted. Verify Step 2 changes saved correctly.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx
git commit -m "feat(i18n): mount LocaleProvider at app root"
```

---

## Chunk 2: Toggle UI

After Chunk 2, the toggle is visible in the nav on the homepage. Clicking it changes the locale state and persists to localStorage, but no section content swaps yet (that's Chunk 3). The toggle's visual states (active pink, inactive dim) work end-to-end.

### Task 2.1: Create `<LanguageToggle />` component

**Why:** Spec §"Unit 5". The toggle UI. Two `<button>` elements styled as `EN | TH`. Active letter in `--accent-pink`, inactive at 60% white. Renders only on the homepage (`pathname === '/'`).

**Files:**
- Create: `src/components/LanguageToggle.tsx`

- [ ] **Step 1: Write the file**

```tsx
// src/components/LanguageToggle.tsx
import { useLocation } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleContext';
import type { Locale } from '../i18n/Bilingual';

const INACTIVE_COLOR = 'rgba(255,255,255,0.6)';
const HOVER_COLOR = 'rgba(255,255,255,0.85)';
const ACTIVE_COLOR_VAR = 'var(--accent-pink)';

function ToggleButton({
  label,
  target,
  active,
  onClick,
}: {
  label: string;
  target: Locale;
  active: boolean;
  onClick: (next: Locale) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={target === 'en' ? 'Switch to English' : 'Switch to Thai'}
      onClick={() => onClick(target)}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = HOVER_COLOR;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = INACTIVE_COLOR;
      }}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '12px',
        fontWeight: 400,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: active ? ACTIVE_COLOR_VAR : INACTIVE_COLOR,
        transition: 'color 0.2s',
      }}
    >
      {label}
    </button>
  );
}

export default function LanguageToggle() {
  const { pathname } = useLocation();
  const { locale, setLocale } = useLocale();

  // Homepage-only in v1 (per spec). Use exact match; React Router v7 strips
  // trailing slash, search, and hash from `pathname`.
  if (pathname !== '/') return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        marginLeft: '8px',
      }}
    >
      <ToggleButton
        label="EN"
        target="en"
        active={locale === 'en'}
        onClick={setLocale}
      />
      <span
        aria-hidden="true"
        style={{
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
        }}
      >
        |
      </span>
      <ToggleButton
        label="TH"
        target="th"
        active={locale === 'th'}
        onClick={setLocale}
      />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/LanguageToggle.tsx
git commit -m "feat(i18n): add LanguageToggle component (homepage-only)"
```

---

### Task 2.2: Integrate `<LanguageToggle />` into `Nav.tsx`

**Why:** Toggle component exists but isn't rendered. Insert it into the existing right-side cluster of nav links, immediately before the LOGIN pill.

**Files:**
- Modify: `src/components/Nav.tsx` (the right-cluster `<div>` near the bottom, around lines 161-175)

- [ ] **Step 1: Read the current right-cluster**

Run: `sed -n '160,177p' src/components/Nav.tsx`
Expected: shows the `<div className="hero-nav-links">` mapping over `navigationConfig.links` and rendering the primary CTA.

- [ ] **Step 2: Add the import**

At the top of `src/components/Nav.tsx`, add:

```tsx
import LanguageToggle from './LanguageToggle';
```

- [ ] **Step 3: Insert the toggle into the cluster**

Find this block:

```tsx
<div
  className="hero-nav-links"
  style={{ display: 'flex', gap: '24px', alignItems: 'center' }}
>
  {navigationConfig.links.map((item) => (
    <NavLink key={`${item.label}-${item.href}`} href={item.href} label={item.label} />
  ))}
  {navigationConfig.primaryCta && (
    <NavLink
      href={navigationConfig.primaryCta.href}
      label={navigationConfig.primaryCta.label}
      variant="cta"
    />
  )}
</div>
```

Insert `<LanguageToggle />` between the `links.map()` and the `primaryCta` block:

```tsx
<div
  className="hero-nav-links"
  style={{ display: 'flex', gap: '24px', alignItems: 'center' }}
>
  {navigationConfig.links.map((item) => (
    <NavLink key={`${item.label}-${item.href}`} href={item.href} label={item.label} />
  ))}
  <LanguageToggle />
  {navigationConfig.primaryCta && (
    <NavLink
      href={navigationConfig.primaryCta.href}
      label={navigationConfig.primaryCta.label}
      variant="cta"
    />
  )}
</div>
```

The toggle's own `marginLeft: '8px'` plus the cluster `gap: '24px'` gives roughly the visual spacing the spec calls for. When the toggle returns `null` on non-homepage routes, the cluster's `gap` makes the absence invisible.

- [ ] **Step 4: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: both succeed.

- [ ] **Step 5: Manual smoke**

Run: `npm run dev`. Open localhost:5173/.

Verify:
- Nav shows `EN | TH` between PARTNERS and LOGIN
- "EN" is hot pink (`#FF4193`), "TH" is dim white
- Click TH → "TH" turns pink, "EN" goes dim. localStorage `proxyz-locale` should be `"th"` (check devtools).
- Reload page → "TH" still pink (persistence works)
- Click EN → flips back
- Navigate to `/portal` → toggle disappears from nav
- Navigate back to `/` → toggle reappears

Note: at this point, clicking the toggle does NOT change any visible content. Only the toggle's own active state and localStorage change. Content swap arrives in Chunk 3.

- [ ] **Step 6: Reset to English before committing**

In the browser devtools console run:

```js
localStorage.removeItem('proxyz-locale')
```

This avoids shipping with a Thai-mode cookie in any browser used for testing.

- [ ] **Step 7: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat(nav): render LanguageToggle in nav cluster"
```

---

## Chunk 3: Per-section refactor

This chunk does the actual content work. Each task converts ONE section: updates the config interface to use `Bilingual<T>` for translatable fields, updates the config values to the new shape (with `en:` populated from the existing string and `th:` left absent), and refactors the section component to call `useBilingual()` and render `<FallbackBadge />`.

**Pattern repeated in every task in this chunk:**
1. Read the existing config interface + values
2. Update the interface: wrap translatable fields in `Bilingual<>`
3. Update the values: convert `field: 'text'` to `field: { en: 'text' }`
4. Update the section component: import `useBilingual`, `useLocale`, `anyFallback`, `FallbackBadge`; convert each direct field access to `useBilingual(...)`; compute the section's `showBadge` from `anyFallback(locale, ...trackedFields)`; render `<FallbackBadge show={showBadge} />` in the eyebrow.
5. Typecheck + commit

**Always-English fields** (do NOT wrap in `Bilingual`):
- All `NavigationLink.href` and `NavigationLink.label` values (these are nav-style)
- All `videoPath`, `calLink`, image paths
- Service `name` (the engagement-mode labels: `BUILD FOR`, `BUILD WITH`, `ACQUIRE`, `PARTNER`) — per spec §"Always-English elements"
- Service `forLabel` (the `FOR` literal that precedes the label) — same reasoning
- Footer `email` and `linkedin` `NavigationLink` fields — these are nav-style

**Translatable fields:** all `string` and `string[]` fields that carry editorial prose. Listed per-section below.

### Task 3.1: Hero — wrap `heroConfig` + refactor `Hero.tsx`

**Why:** Hero is the most visible section. Best to land first so the toggle has an obvious effect.

**Files:**
- Modify: `src/config.ts` (HeroConfig interface around lines 18-24; `heroConfig` values around line 117)
- Modify: `src/sections/Hero.tsx`

**Translatable fields:** `eyebrow`, `titleLines`, `lead`, `primaryCta.label`, `secondaryLink.label`.
**Plain (always English):** `primaryCta.href`, `secondaryLink.href`.

- [ ] **Step 1: Update HeroConfig interface**

Find:

```ts
export interface HeroConfig {
  eyebrow: string
  titleLines: string[]
  lead: string
  primaryCta: NavigationLink
  secondaryLink: NavigationLink
}
```

Replace with:

```ts
export interface HeroConfig {
  eyebrow: Bilingual<string>
  titleLines: Bilingual<string[]>
  lead: Bilingual<string>
  primaryCta: { label: Bilingual<string>; href: string }
  secondaryLink: { label: Bilingual<string>; href: string }
}
```

At the top of `src/config.ts`, add the import:

```ts
import type { Bilingual } from './i18n/Bilingual';
```

- [ ] **Step 2: Update heroConfig values**

Find the `heroConfig` definition (around line 117). Convert each translatable string to `{ en: '...' }`. Example:

Before:

```ts
export const heroConfig: HeroConfig = {
  eyebrow: 'ISSUE 01 / OPERATOR STUDIO',
  titleLines: ['Your proxy', 'on the', 'inside.'],
  lead: 'PROXYZ goes inside your company, rebuilds how it runs, ...',
  primaryCta: { label: 'BOOK THE AUDIT', href: '#booking' },
  secondaryLink: { label: 'WHAT WE DO →', href: '#services' },
};
```

After:

```ts
export const heroConfig: HeroConfig = {
  eyebrow: { en: 'ISSUE 01 / OPERATOR STUDIO' },
  titleLines: { en: ['Your proxy', 'on the', 'inside.'] },
  lead: { en: 'PROXYZ goes inside your company, rebuilds how it runs, ...' },
  primaryCta: { label: { en: 'BOOK THE AUDIT' }, href: '#booking' },
  secondaryLink: { label: { en: 'WHAT WE DO →' }, href: '#services' },
};
```

Note: do NOT add `th:` lines now. They land later, organically, when Thai copy is written.

- [ ] **Step 3: Update Hero.tsx imports**

At the top of `src/sections/Hero.tsx`, add:

```tsx
import { useLocale } from '../i18n/LocaleContext';
import { useBilingual } from '../i18n/useBilingual';
import { anyFallback } from '../i18n/Bilingual';
import { FallbackBadge } from '../components/FallbackBadge';
```

- [ ] **Step 4: Refactor Hero component to use useBilingual**

In the Hero component body, near the top (after existing `useRef` / `useScroll` calls), add:

```tsx
const { locale } = useLocale();
const eyebrow = useBilingual(heroConfig.eyebrow);
const titleLines = useBilingual(heroConfig.titleLines);
const lead = useBilingual(heroConfig.lead);
const primaryCtaLabel = useBilingual(heroConfig.primaryCta.label);
const secondaryLabel = useBilingual(heroConfig.secondaryLink.label);
const showBadge = anyFallback(
  locale,
  heroConfig.eyebrow,
  heroConfig.titleLines,
  heroConfig.lead,
  heroConfig.primaryCta.label,
  heroConfig.secondaryLink.label,
);
```

Then in the JSX, replace each direct config access:
- `heroConfig.eyebrow` → `eyebrow`
- `heroConfig.titleLines` → `titleLines`
- `heroConfig.lead` → `lead`
- `heroConfig.primaryCta.label` → `primaryCtaLabel`
- `heroConfig.secondaryLink.label` → `secondaryLabel`

Leave `href` references untouched (those are plain strings).

Where the eyebrow is rendered, append the badge. Example, if the current JSX is:

```tsx
<p className="hero-eyebrow">{heroConfig.eyebrow}</p>
```

Change to:

```tsx
<p className="hero-eyebrow">
  {eyebrow}
  <FallbackBadge show={showBadge} />
</p>
```

- [ ] **Step 5: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: both succeed.

- [ ] **Step 6: Manual smoke**

Run: `npm run dev`. Visit `/`.
- In EN mode: hero looks unchanged
- Click TH: hero text stays in English BUT a small `[EN]` badge appears next to `ISSUE 01 / OPERATOR STUDIO`
- Click EN: badge disappears

- [ ] **Step 7: Commit**

```bash
git add src/config.ts src/sections/Hero.tsx
git commit -m "refactor(hero): wrap heroConfig in Bilingual<T>, render FallbackBadge"
```

---

### Task 3.2: Diagnosis — wrap `diagnosisConfig` + refactor `Diagnosis.tsx`

**Files:**
- Modify: `src/config.ts` (DiagnosisConfig interface; `diagnosisConfig` values)
- Modify: `src/sections/Diagnosis.tsx`

**Translatable fields:** `sectionLabel`, `heading`, `paragraphs`.
**Plain:** `videoPath`.

- [ ] **Step 1: Update DiagnosisConfig interface**

Replace:

```ts
export interface DiagnosisConfig {
  sectionLabel: string
  heading: string
  paragraphs: string[]
  videoPath?: string
}
```

with:

```ts
export interface DiagnosisConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  paragraphs: Bilingual<string[]>
  videoPath?: string
}
```

- [ ] **Step 2: Update diagnosisConfig values**

Convert each string to `{ en: '...' }` and the paragraphs array to `{ en: [...] }`. Leave `videoPath` as a plain string.

- [ ] **Step 3: Refactor Diagnosis.tsx**

Add imports (same four as Task 3.1, Step 3). Inside the component, add:

```tsx
const { locale } = useLocale();
const sectionLabel = useBilingual(diagnosisConfig.sectionLabel);
const heading = useBilingual(diagnosisConfig.heading);
const paragraphs = useBilingual(diagnosisConfig.paragraphs);
const showBadge = anyFallback(
  locale,
  diagnosisConfig.sectionLabel,
  diagnosisConfig.heading,
  diagnosisConfig.paragraphs,
);
```

Replace direct config accesses with the local variables. Append `<FallbackBadge show={showBadge} />` inside the section's eyebrow / label rendering (the JSX element that displays `sectionLabel`).

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck && npm run build
git add src/config.ts src/sections/Diagnosis.tsx
git commit -m "refactor(diagnosis): wrap diagnosisConfig in Bilingual<T>"
```

---

### Task 3.3: Principles — wrap `principlesConfig` + refactor `Principles.tsx`

**Files:**
- Modify: `src/config.ts` (PrincipleItem, PrinciplesConfig interfaces; `principlesConfig` values)
- Modify: `src/sections/Principles.tsx`

**Translatable fields:** `sectionLabel`, `heading`, each `item.text`.
**Plain:** each `item.number` (e.g., "01", "02") — these are numeric labels, leave English.

- [ ] **Step 1: Update interfaces**

```ts
export interface PrincipleItem {
  number: string
  text: Bilingual<string>
}

export interface PrinciplesConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  items: PrincipleItem[]
}
```

- [ ] **Step 2: Update principlesConfig values**

Convert per the new interface. Each item's `text` becomes `{ en: '...' }`; `number` stays a plain string.

- [ ] **Step 3: Refactor Principles.tsx**

Add the standard four imports. Inside the component:

```tsx
const { locale } = useLocale();
const sectionLabel = useBilingual(principlesConfig.sectionLabel);
const heading = useBilingual(principlesConfig.heading);
const showBadge = anyFallback(
  locale,
  principlesConfig.sectionLabel,
  principlesConfig.heading,
  ...principlesConfig.items.map((item) => item.text),
);
```

Note the spread of `items.map((item) => item.text)` so per-item fallbacks count toward the section badge.

When rendering items, use `useBilingual` per item via a child component:

```tsx
function PrincipleRow({ item }: { item: PrincipleItem }) {
  const text = useBilingual(item.text);
  return (
    <div className="principle-row">
      <span className="principle-number">{item.number}</span>
      <p>{text}</p>
    </div>
  );
}
```

Render `principlesConfig.items.map((item) => <PrincipleRow key={item.number} item={item} />)`. Hooks rules require the per-item hook call to happen at component-render top-level, hence the extracted child component.

Append `<FallbackBadge show={showBadge} />` to the section label rendering.

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck && npm run build
git add src/config.ts src/sections/Principles.tsx
git commit -m "refactor(principles): wrap principlesConfig items in Bilingual<T>"
```

---

### Task 3.4: TwoWays — wrap `twoWaysConfig` + refactor `TwoWays.tsx`

**Files:**
- Modify: `src/config.ts` (WayCard, TwoWaysConfig interfaces; `twoWaysConfig` values)
- Modify: `src/sections/TwoWays.tsx`

**Translatable fields:** `sectionLabel`, `heading`, each `card.body`, each `card.link.label`.
**Plain:** each `card.name` (these are the BUILD FOR / BUILD WITH engagement-mode labels — always English per spec), each `card.link.href`.

- [ ] **Step 1: Update interfaces**

```ts
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
```

- [ ] **Step 2: Update twoWaysConfig values** per the new shape.

- [ ] **Step 3: Refactor TwoWays.tsx** using the per-item child-component pattern from Task 3.3 for `cards.map`. Each `WayCard` row component calls `useBilingual` for its body and link label. The parent computes `showBadge` from `sectionLabel`, `heading`, and the spread of all card bodies + link labels.

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck && npm run build
git add src/config.ts src/sections/TwoWays.tsx
git commit -m "refactor(twoways): wrap twoWaysConfig cards in Bilingual<T>"
```

---

### Task 3.5: Services — wrap `servicesConfig` + refactor `Services.tsx`

**Files:**
- Modify: `src/config.ts` (ServiceCard, ServicesConfig interfaces; `servicesConfig` values)
- Modify: `src/sections/Services.tsx`

**Translatable fields:** `sectionLabel`, `intro`, each `card.body`, each `card.cta.label`.
**Plain (per spec):** each `card.name` (BUILD FOR / BUILD WITH / ACQUIRE / PARTNER engagement-mode labels), each `card.label` (display labels), each `card.forLabel` ("FOR" literal), each `card.cta.href`.

- [ ] **Step 1: Update interfaces**

```ts
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
```

- [ ] **Step 2: Update servicesConfig values** per the new shape. Keep engagement-mode names plain English.

- [ ] **Step 3: Refactor Services.tsx** using the per-item child component pattern. Each ServiceCard row component calls `useBilingual` for body and cta label. Parent computes `showBadge` from `sectionLabel`, `intro`, and spread of card bodies + cta labels.

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck && npm run build
git add src/config.ts src/sections/Services.tsx
git commit -m "refactor(services): wrap servicesConfig in Bilingual<T> (keep engagement-mode labels plain)"
```

---

### Task 3.6: BuildWith — wrap `buildWithConfig` + refactor `BuildWith.tsx`

**Files:**
- Modify: `src/config.ts` (BuildWithConfig interface; `buildWithConfig` values)
- Modify: `src/sections/BuildWith.tsx`

**Translatable fields:** `sectionLabel`, `heading`, `paragraphs`, `cta.label`.
**Plain:** `cta.href`.

- [ ] **Step 1: Update BuildWithConfig**

```ts
export interface BuildWithConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  paragraphs: Bilingual<string[]>
  cta: { label: Bilingual<string>; href: string }
}
```

- [ ] **Step 2: Update buildWithConfig values.**

- [ ] **Step 3: Refactor BuildWith.tsx** following the Task 3.1 pattern (single-section, no per-item children needed).

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck && npm run build
git add src/config.ts src/sections/BuildWith.tsx
git commit -m "refactor(buildwith): wrap buildWithConfig in Bilingual<T>"
```

---

### Task 3.7: StudioOS — wrap `studioOSConfig` + refactor `StudioOS.tsx`

**Files:**
- Modify: `src/config.ts` (StudioOSConfig interface; `studioOSConfig` values)
- Modify: `src/sections/StudioOS.tsx`

**Translatable fields:** `sectionLabel`, `heading`, `lead`, `list`, `closing`.

- [ ] **Step 1: Update StudioOSConfig**

```ts
export interface StudioOSConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  lead: Bilingual<string>
  list: Bilingual<string[]>
  closing: Bilingual<string>
}
```

- [ ] **Step 2: Update studioOSConfig values.**

- [ ] **Step 3: Refactor StudioOS.tsx** following the Task 3.1 single-section pattern.

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck && npm run build
git add src/config.ts src/sections/StudioOS.tsx
git commit -m "refactor(studioos): wrap studioOSConfig homepage section in Bilingual<T>"
```

---

### Task 3.8: Booking — wrap `bookingConfig` + refactor `Booking.tsx`

**Files:**
- Modify: `src/config.ts` (BookingConfig interface; `bookingConfig` values)
- Modify: `src/sections/Booking.tsx`

**Translatable fields:** `sectionLabel`, `heading`, `body`.
**Plain:** `calLink`.

- [ ] **Step 1: Update BookingConfig**

```ts
export interface BookingConfig {
  sectionLabel: Bilingual<string>
  heading: Bilingual<string>
  body: Bilingual<string>
  calLink: string
}
```

- [ ] **Step 2: Update bookingConfig values.**

- [ ] **Step 3: Refactor Booking.tsx** following the Task 3.1 pattern.

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck && npm run build
git add src/config.ts src/sections/Booking.tsx
git commit -m "refactor(booking): wrap bookingConfig in Bilingual<T>"
```

---

### Task 3.9: Footer — wrap `footerConfig` prose + refactor `Footer.tsx`

**Files:**
- Modify: `src/config.ts` (FooterConfig interface; `footerConfig` values)
- Modify: `src/sections/Footer.tsx`

**Translatable fields:** `left` (the left-side prose), `right` (the right-side prose).
**Plain (per spec):** `email` and `linkedin` `NavigationLink` objects — these are nav-style.

- [ ] **Step 1: Update FooterConfig**

```ts
export interface FooterConfig {
  left: Bilingual<string>
  email: NavigationLink
  linkedin: NavigationLink
  right: Bilingual<string>
}
```

- [ ] **Step 2: Update footerConfig values** — wrap `left` and `right`, leave `email` and `linkedin` untouched.

- [ ] **Step 3: Refactor Footer.tsx**

Footer has no eyebrow per se. The `<FallbackBadge />` placement is up to the existing layout. Suggested: append it inside the left-prose paragraph, e.g.:

```tsx
<p className="footer-left">
  {left}
  <FallbackBadge show={showBadge} />
</p>
```

Compute `showBadge = anyFallback(locale, footerConfig.left, footerConfig.right)`.

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck && npm run build
git add src/config.ts src/sections/Footer.tsx
git commit -m "refactor(footer): wrap footerConfig prose in Bilingual<T>"
```

---

## Chunk 4: Smoke + ship

After Chunk 3, every homepage section swaps language. This chunk runs the full verification list from the spec and ships.

### Task 4.1: Full manual smoke (local dev)

**Why:** Verify the integrated experience matches the spec before opening a PR.

- [ ] **Step 1: Start dev server, fresh browser**

Open an incognito window. Navigate to `http://localhost:5173/`.

- [ ] **Step 2: Confirm English default**

Verify:
- Page loads in English
- `EN` is hot pink, `TH` is dim
- Devtools console: `localStorage.getItem('proxyz-locale')` returns `"en"`

- [ ] **Step 3: Toggle to Thai, observe all sections**

Click `TH`. Walk down the homepage. For each section, verify:
- The section's prose is still English (because Thai copy is not yet written)
- A small `[EN]` badge appears next to the section's eyebrow / section label
- Brand chassis stays English: PROXYZ wordmark, marquee words, BUILD FOR/WITH labels, nav links

Sections to check: Hero, Diagnosis, Principles (each principle item — but the section-level badge shows once), TwoWays, Services, Marquee (stays plain English, no badge — Marquee was not refactored), BuildWith, StudioOS, Booking, Footer.

- [ ] **Step 4: Persistence**

Reload the page. Verify the toggle is still in TH state and all `[EN]` badges remain. localStorage value is still `"th"`.

- [ ] **Step 5: Toggle back**

Click `EN`. All badges disappear. All sections look exactly like they did pre-feature.

- [ ] **Step 6: Route gating**

Navigate to `/portal`. Verify:
- The toggle disappears from the nav (because `pathname !== '/'`)
- Nothing else on the page changes

Navigate back to `/`. Toggle reappears. Whatever locale was set is preserved.

- [ ] **Step 7: Mobile**

Resize the browser to ≤480px. Verify:
- Other nav links hide (existing behavior)
- Toggle stays visible next to the LOGIN pill (because it's not an `<a>` and not matched by `.hero-nav-links a:not(.hero-nav-cta)`)
- Clicking the toggle still works at mobile width

- [ ] **Step 8: Clean localStorage before pushing**

In incognito window devtools:

```js
localStorage.removeItem('proxyz-locale')
```

(Incognito clears on close anyway, but make this explicit habit.)

- [ ] **Step 9: No commit needed for this task** — manual smoke is verification, not a code change.

---

### Task 4.2: PR, merge, deploy, post-deploy smoke

**Why:** Ship to proxyz.studio with the production safety net of a PR review on Vercel preview.

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/i18n-toggle
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "feat: Thai / English language toggle (homepage v1)" --body "$(cat <<'EOF'
## Summary
- Adds a nav-bar language toggle (EN | TH) on the homepage
- Wires up the Bilingual<T> type, useBilingual hook, LocaleProvider, and FallbackBadge
- Refactors every homepage section to use Bilingual<T> for translatable fields
- Thai copy is not yet written; every section shows the [EN] fallback badge in Thai mode
- Per spec: brand chassis (PROXYZ, BUILD FOR/WITH, marquee, nav links) stays English in both modes
- Per spec: no Vitest setup; verification is npm run typecheck + manual smoke

## Spec
docs/superpowers/specs/2026-05-18-language-toggle-th-en-design.md

## Test plan
- [ ] Vercel preview loads
- [ ] Toggle visible on homepage, hidden on /portal /partners /media
- [ ] Click TH: page stays English with [EN] badges visible on each section
- [ ] Reload after TH: locale persists
- [ ] Click EN: badges disappear, page identical to current production
- [ ] Mobile (≤480px): toggle still visible next to LOGIN

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Smoke the Vercel preview**

Wait for Vercel's preview deploy. Click the preview URL from the PR. Run through Steps 2–7 of Task 4.1 against the preview URL.

- [ ] **Step 4: Merge to main**

After preview smoke passes:

```bash
gh pr merge --squash --delete-branch
```

- [ ] **Step 5: Post-deploy smoke on production**

Wait for Vercel's production deploy (auto-triggers on main merge). Open a fresh browser, navigate to `https://proxyz.studio`. Verify:
- Toggle visible in nav
- Click TH: page swaps, `[EN]` badges appear
- Click EN: badges disappear, baseline matches the pre-feature site
- Page source via View Source contains the Bilingual structure (search for `"en":` — should appear in inlined config)
- Navigate to `https://proxyz.studio/portal`: toggle gone

- [ ] **Step 6: Update primer**

Edit `~/.claude/primer.md` to record: feature shipped, latest commit SHA, status of Thai copy (none yet, next task is for Tew to write Thai per section). Note that Thai content writing is OUT of scope for the engineering plan and lives as a separate content task.

---

## Out of scope (explicit non-goals)

- Writing the actual Thai copy. The infrastructure lands; Thai strings get added in follow-up content commits.
- Vitest setup or any runtime test framework.
- Hamburger / mobile menu work.
- Other pages (`/portal`, `/partners/*`, `/media`, preview routes).
- SEO hreflang tags, `/th` route, browser-language auto-detect.
- A translator-facing export script.
- Pluralization, number formatting, currency, RTL.

## Risks and known unknowns

- **Per-item hook calls (Principles, TwoWays, Services):** each item gets its own child component so `useBilingual` follows the Rules of Hooks. If a section is later changed to conditional rendering, the child component pattern still holds.
- **Thai text overflow:** Thai often runs longer than equivalent English. If a specific section visibly breaks at Thai content time, fix that section's layout case by case (out of scope for this plan because no Thai copy lands here).
- **localStorage in private mode:** the provider catches errors and logs a warning. The user sees English; toggle works in-session but does not persist. Acceptable for v1.
- **Race between provider mount and first paint:** `useState(() => readStoredLocale())` runs synchronously, so first paint is in the saved locale. No flicker.
