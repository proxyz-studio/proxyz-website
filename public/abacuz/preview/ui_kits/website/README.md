# ABACUZ — Website UI kit (abacuz.co)

A high-fidelity recreation of the ABACUZ marketing site, built from the locked brand direction (no shipped code existed yet). React + Babel, bilingual EN/TH from one content source.

## Run it
Open `index.html`. Use the **EN / ไทย** toggle in the header to switch the whole page between English and Thai.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: loads fonts, `../../colors_and_type.css`, `styles.css`, React/Babel, then the scripts below. |
| `styles.css` | All kit styling, built on the design tokens. |
| `data.js` | `window.ABZ` — the full bilingual content dictionary (`{ en, th }` nodes). Edit copy here. |
| `sections-a.jsx` | `StatementCard`, `Header`, `Hero`, `Pillars`. |
| `sections-b.jsx` | `Founder`, `StatementShowcase`, `PriceList`, `Footer`. |
| `app.jsx` | `App` root — holds the `lang` state and composes the sections. |

## Components
- **Header** — sticky lockup + nav + EN/ไทย toggle + primary CTA. Gains a shadow on scroll.
- **Hero** — eyebrow descriptor, two-beat Cormorant headline, sub, CTAs (note the green LINE button), trust row with the gold tick, and a live **Clear Statement** card.
- **StatementCard** — the signature monthly artifact in miniature (navy header, tabular rows, CPA sign-off footer). Reused in the hero and the showcase.
- **Pillars** — the three service pillars as cards with value lines and bullet lists.
- **Founder** — Khun Joy block. The portrait is a **clearly-labelled placeholder** (`.photo-slot`) — drop in the real, authentic photo to finish it. Never use stock or AI here.
- **StatementShowcase** — navy section that explains the Clear Statement, with the card alongside.
- **PriceList** — the Published Price List as a paper surface: itemised, bilingual, baht with tabular figures.
- **Footer** — navy-900, wordmark + tagline, link columns, CPA credential line.

## Conventions
- Pull all copy from `window.ABZ`; use the `tr(node, lang)` helper to resolve `{en, th}`.
- Brand glyphs come from `../../assets/` (`abacus-mark.svg`, `abacus-tick.svg`).
- Gold is accent only. Money uses `font-variant-numeric: tabular-nums`. No em-dashes in copy.

## Known caveats
- **Founder photo** is a placeholder pending the real portrait of Khun Joy.
- **Thai copy** is a working draft (machine-assisted) — needs a native pass before public use.
- Logo mark/tick are indicative direction, final vectorisation pending.
