# Design

> Visual system for proxyz.studio. Follows the Google Stitch DESIGN.md format. Pairs with [PRODUCT.md](PRODUCT.md) (strategic register, users, voice).

## Theme

**Editorial dark.**

Scene sentence: a partner-founder reading the studio's manifesto at 11pm on a 27-inch monitor, after a long day of work, looking for evidence that this studio is real before booking a call. The room is dim. Eye comfort matters; warmth and trust matter more than crispness.

This is not "tools mode dark because everything is dark". This is dark because the studio voice is a printed magazine column, and magazine pages with a printed-ink feel work better dark on near-black than light.

Color strategy: **Restrained**. Tinted near-black neutrals + one accent (hot pink) used at ≤10% of any given surface, with two venture accents (AUTOLOOM teal, MAGNIZ lime) appearing only on their own surfaces.

## Color

All colors stored as hex in CSS custom properties. OKLCH migration is acceptable but not required; the current hex palette is calibrated and works.

### Surface

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0A0A` | Page background. Never `#000`; tinted toward warm-neutral. |
| `--bg-elev` | `#141414` | Card surfaces, hover backgrounds, slight elevation. |
| `--bg-card` | `#161616` | Filled cards, agent diagram surround. |

### Foreground

| Token | Value | Use |
|---|---|---|
| `--fg` | `#F2F2F2` | Body text default. Never `#FFF`. |
| `--fg-mute` | `#9A9A9A` | Secondary copy, eyebrows, captions. |
| `--fg-dim` | `#5E5E5E` | Tertiary detail, dividers, deemphasized labels. |

### Borders

| Token | Value | Use |
|---|---|---|
| `--border` | `#232323` | Default 1px borders, dividers. |
| `--border-bright` | `#3A3A3A` | Card edges, accent borders. |

### Brand accent

| Token | Value | Use |
|---|---|---|
| `--pink` | `#FF4193` | PROXYZ brand accent. Used for: links, key headings, accent rules, current-state markers, hot focus. Cap at ≤10% of any given surface (Restrained strategy). |

### Venture accents

Each venture brand gets its own accent that replaces pink only on that venture's surfaces (`/ventures/<slug>`). The pink stays primary on shared studio chrome (nav, footer, hero) even within a venture page.

| Token | Value | Venture |
|---|---|---|
| `--autoloom` | `#5BC9B8` | AUTOLOOM (teal, matches the "Y" letter in the PROXYZ wordmark) |
| `--magniz` | `#D2FF3B` | MAGNIZ (neon lime) |
| `--pryzm` | `#FF4193` | PRYZM (defaults to PROXYZ pink until externalization) |

### Status / signal

| Token | Value | Use |
|---|---|---|
| `--green` | `#7CD992` | Pass, ready, success states. |
| `--amber` | `#F2C14E` | Warn, in-progress, attention. |

### Never

- Never `#000` or `#FFF`. Always `#0A0A0A` / `#F2F2F2`.
- Never gradient text (`background-clip: text` with multi-stop gradient). Banned.
- Never side-stripe `border-left` greater than 1px as colored accent. Banned.

## Typography

### Family

- **IBM Plex Mono** is the only family across the site. Headings, body, eyebrows, labels, tabular data, code. Loaded from Google Fonts CDN, weights 300 / 400 / 500 / 600 / 700.
- IBM Plex Sans is loaded in some surfaces (founder's brief at `/brief/ananda`) but is not used in the main studio chrome.

### Scale

Hierarchy is carried by weight contrast and scale jumps ≥1.25 ratio per step. No flat scales.

| Role | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Eyebrow / section label | 11px | 500-600 | 0.12-0.18em | 1.4 |
| Body (default) | 14-15px | 400 | 0 | 1.6-1.7 |
| Lede / introductory | 18-22px | 400 | 0 | 1.55 |
| Section heading (h2) | clamp(28px, 4vw, 44px) | 600 | -0.01em | 1.15 |
| Hero heading (h1) | clamp(40px, 6vw, 72px) | 600 | -0.02em | 1.05 |

### Rules

- Cap body line length at 65-75 characters. Container widths derive from this (typical: `max-width: 720px` for prose, `max-width: 1080px` for layout).
- Uppercase eyebrows always carry letter-spacing 0.12-0.18em.
- Headings never wrap to fewer than 2 lines via forced breaks; let them flow.
- Numerals: tabular when comparing (pricing-adjacent tables), proportional otherwise.

## Spacing

8px base. Tailwind defaults align (`p-2 = 8px`, `p-4 = 16px`, etc.).

Section vertical rhythm: **96px** top/bottom for major sections, **64px** for sub-sections. Hero gets 96px top, 80px bottom.

Container side padding: 32px desktop, 16-24px mobile.

Card padding: 28-36px depending on content density. Stack rows (13-row layer tables): 16px-24px.

**Rule**: vary spacing to create rhythm. Same padding everywhere is monotony (impeccable layout law).

## Motion

The motion token system is the canonical source for every transition, animation, and scroll-driven effect. Defined in `src/index.css :root`, mirrored as Tailwind utilities.

### Easings (exponential ease-outs only; no bounce, no elastic)

| Token | Value | Use |
|---|---|---|
| `--ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` | Smooth, refined. Default for state-change transitions (opacity, color, border). |
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | Slightly snappier. Hover lifts. |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Confident, decisive. Entrances, transforms, hero choreography. |
| `--ease-in-quart` | `cubic-bezier(0.5, 0, 0.75, 0)` | Exits only. |

### Durations (the 100/300/500 rule)

| Token | Value | Use |
|---|---|---|
| `--dur-instant` | 120ms | Button press, toggle, color shift. |
| `--dur-quick` | 220ms | Hover, tooltip, micro-state change. |
| `--dur-base` | 320ms | Default state change (open, close, fade). |
| `--dur-layout` | 480ms | Layout shifts, accordion, modal. |
| `--dur-entrance` | 720ms | Section reveal on scroll. |
| `--dur-hero` | 1100ms | Hero line clip-mask reveal, signature one-shot moments. |
| `--dur-exit` | 180ms | Exit = ~75% of enter, faster. |

### Rules

- **No bounce, no elastic** easing. Banned.
- **Don't animate layout-driving properties** (`width`, `height`, `top`, `left`, margins). Use `transform` and `opacity`. Filters / blurs / shadows / clip-paths are allowed when bounded and verified smooth.
- **Stagger total time ≤500ms.** For long lists (13 stack rows), shorten the per-item step rather than letting the total run long.
- **Exit < enter.** Use `--dur-exit` or 75% of the enter duration on un-hover / leave transitions.
- **One signature moment per page.** Hero line reveal + section number count-up + closing pink-phrase underline carry the weight. Don't compete.
- **Ambient loops finite or quiet.** Avoid `animation-iteration-count: infinite` unless the loop is genuinely required (current-state pulse on the studio arc, conductor pulse on agent diagram). Even then, slow it (≥3s cycle, dim glow).
- **`will-change` only on `:hover`** or when an animation is imminent. Never preemptive.
- **`prefers-reduced-motion`** honored on every animation. Vanta NET and other WebGL effects disabled. All entrance reveals collapse to instant opacity.

## Components

### Existing in src/components/

| Component | Role |
|---|---|
| `Nav.tsx` | Top nav, language toggle, mobile hamburger. PROXYZ wordmark + 4 nav links + Login. |
| `Reveal.tsx` | IntersectionObserver-based scroll reveal wrapper. Consumes motion tokens. |
| `Marquee.tsx` | Horizontal scrolling brand strip (homepage hero, partner gates). |
| `Glow.tsx` | Pink glow effect for emphasis. |
| `Editorial.tsx` | Editorial typographic wrapper. |
| `Spatial.tsx` | Spatial 3D wrapper. |
| `LanguageToggle.tsx` | EN / TH toggle in nav cluster. |
| `FallbackBadge.tsx` | `[EN]` badge when Thai copy is missing. |
| `PartnerGate.tsx` | Code-gated partner pages (Cathal, FAST-FIX, LAZY-TIGER, etc.). |
| `MediaGate.tsx` | Code-gated media surfaces. |
| `MeetingsGate.tsx` | Code-gated meeting surfaces. |
| `AsciiCanvas.tsx` | ASCII-art canvas for editorial moments. |
| `PictoIcon.tsx` | Pictographic icon system. |
| `lt/` | LAZY-TIGER-specific components (TigerHelmet, AsiaMap, HotelMap, Leaderboard, MerchGrid, QuadrantGrid, StudioShapes, TierLadder, TigerCoachChat, CompoundCircle). |
| `ui/` | shadcn vendor components (excluded from lint). |

### Section pattern (home)

Each section in `src/sections/` follows the same shape:

1. **Section eyebrow** (`<span class="kicker">`): 11px uppercase, letter-spacing 0.18em, pink or fg-mute.
2. **Section number** (optional): 11px pink with optional terminal-cursor blink.
3. **H2 heading**: clamp(28px, 4vw, 44px), weight 600.
4. **Prose / content**: max-width 720px, line-height 1.7.
5. **Inset element**: grid, table, card-strip, or callout that holds the section's specifics.

### Banned shapes

Per impeccable absolute bans:

- Side-stripe `border-left` greater than 1px as colored accent → use full borders, background tints, or numbered leading icons.
- Gradient text → single solid color, hierarchy through weight or size.
- Glassmorphism (`backdrop-filter: blur`) as default decoration → rare and purposeful or none.
- Hero-metric template (big number + small label + supporting stats + gradient accent) → SaaS cliché.
- Identical card grids → vary shape, content, or hierarchy.
- Modal as first thought → exhaust inline / progressive alternatives.

## Layout

- Two grid widths: **prose** (max-width 720px) and **layout** (max-width 1080px).
- Hero allows wider headings (max-width 920px on the h1).
- Sections are bordered top + bottom with `1px solid var(--border)`.
- Cards: 28-36px padding, no nested cards (banned), full-bleed borders.
- Mobile breakpoint: 820px (single-column collapse for grids).
- Hamburger nav at ≤480px.

## Iconography

The studio does not lean on icon libraries. When icons appear:

- Use **PictoIcon** for pictographic glyphs (custom set).
- Use **Lucide React** (already imported via shadcn) for utility icons (chevron, close, menu).
- Never use Font Awesome, Material Icons, or emoji as decorative iconography.
- Strokes 1.5px, color via `currentColor` so accent state inherits.

## Accessibility & inclusion

See [PRODUCT.md § Accessibility & Inclusion](PRODUCT.md#accessibility--inclusion). Visual implications captured below for reference.

- Color contrast 4.5:1 minimum on body text against `--bg`.
- Focus rings always visible (`outline: 2px solid var(--pink)` with appropriate offset, or `box-shadow` ring).
- Hover-only affordances are paired with `:focus-visible` equivalents.
- Touch targets ≥44px.
- Thai (TH) script tested in every section; line-heights bumped where Thai vowel marks would clip.
