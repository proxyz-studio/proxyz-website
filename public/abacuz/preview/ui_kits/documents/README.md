# ABACUZ — Documents UI kit (the signature artifacts)

The two brand surfaces that make the transparency promise tangible: **The Clear Statement** and **The Published Price List**. Both are bilingual (EN · TH from one source), built on the design tokens, and styled as premium printed paper on a warm Stone backdrop.

## Run it
Open `index.html`. Use the toolbar to switch between **Clear Statement** and **Price List**, and the **EN / ไทย** toggle to switch the primary language. Line-item labels stay bilingual (primary language bold, the other language alongside) because that is the signature ABACUZ format.

## Files
| File | What it holds |
|---|---|
| `index.html` | Shell: fonts, `../../colors_and_type.css`, `styles.css`, React/Babel, then the scripts below. |
| `styles.css` | Document/paper styling on the tokens. |
| `data.js` | `window.DOCS` — bilingual content for both documents. |
| `ClearStatement.jsx` | `DocHeader`, `BiLabel`, and `ClearStatement`. |
| `PriceList.jsx` | `PriceList`. |
| `app.jsx` | `DocApp` root — doc switcher + language toggle. |

## The Clear Statement
A monthly, plain-language summary delivered by day 20, in five numbered blocks: **what came in · what went out · what is left · what tax is due · what is next**. Tax lines carry warm due-date chips. It closes with the **CPA sign-off** (the abacus seal, Khun Joy's name + credential line) and the signature line *"Every number, in plain sight."* The navy footer marks it confidential to the named client.

## The Published Price List
The boldest trust gesture in an opaque market: list prices in the open, grouped (monthly accounting · company & compliance · foreign business services), itemised and bilingual, in baht with tabular figures. Closes with a *"How our pricing works"* note: every engagement starts with a fixed quote you approve before work begins.

## Conventions
- `DocHeader` is shared — the navy lockup band with the descriptor **Accounting · Corporate Services**.
- `BiLabel` renders a bilingual line label (primary bold + the other language muted).
- Money always uses `font-variant-numeric: tabular-nums`. Gold appears only in the wordmark, the seal, the block numbers, and chips.
- These read as paper: white surface, `--sh-paper` shadow, hairline rules, no rounded "card" tropes.

## Caveats
- Figures and the client name are realistic sample data.
- Thai copy is a working draft pending a native pass.
