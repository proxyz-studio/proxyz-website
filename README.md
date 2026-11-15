# PROXYZ website

This repo holds the website at https://proxyz.studio: a slow dark film in seven scenes, plus the same site as plain
text at `/machines/` and one plain page at `/legal/`.

A static site: Vite and TypeScript, no framework, nothing loaded from any other host.

## Run it

```sh
npm ci
npm run dev        # work on it
npm run build      # the finished site, in dist/
npm run lint
npm run typecheck
npm run check      # builds, serves dist/ locally and proves the rules (see below)
```

## Where things live

| Path | What it is |
|---|---|
| `content/site.json` | Every word on the site. The pages, `llms.txt`, the meta tags and the structured data are all made from it at build time. Edit words here, nowhere else. |
| `src/film/scenes.json` | How the film moves: the light passes of each scene, where each picture sits (`frame`), how far the light travels (`rest`, `hold`, `still`), scene 6's growing light (`opens`), the height line. |
| `src/main.ts` | The film: scroll position to light, scene changes, the five marks. |
| `src/film/math.ts` | The light and mask arithmetic, shared by the film and the build. |
| `src/style.css` | The one style file for every page. |
| `build/pages.ts` | Writes the pages from the three data files (and the picture placement used before the script runs). |
| `pictures/sources.json` | Which drawing each web picture is made from. |
| `scripts/pictures.py` | Makes the web pictures in `public/pictures/` and `src/generated/pictures.json`. |
| `public/` | Files served as they are. See the email pictures below. |
| `scripts/check.mjs`, `scripts/serve.mjs` | The proof (`npm run check`) and the local server that follows `vercel.json`. |
| `scripts/preview-file.mjs` | One self contained file of the real build, for looking at it without a server. |
| `src/fonts/` | IBM Plex Mono (400 and 600) and its licence, `OFL.txt`. |

## Names and links of ventures

In `content/site.json`, under `ventures`, each venture may have a `name` and a `url`.
With a `name`, the name shows beside its mark while its scene is on screen, and at the start of its plain text line.
With a `url` as well, the name in the border links to that address, and the plain text line ends with it.
Adding either is one line, for example `"name": "Example", "url": "https://example.com",`. A venture without a name
leaves no name anywhere in the built site.

## Pictures

Source drawings (large PNG files) are not kept here. To make the web pictures again:

```sh
npm run pictures -- <folder of the drawings> [--prefer <folder of bigger drawings>]
```

Each picture gets a 1x file (desktop 1440 wide, phone 786 wide) and, when the source is at least twice that size, a
2x file (2880, 1572). WebP always; AVIF too when it comes out smaller. File names carry a content hash, so they can be
cached for a year. The film always places pictures from their logical size (1440 x 900, 786 x 1704), so bigger
files change nothing in the layout. With `--prefer`, a bigger drawing of the same name in that folder is used when it
is complete (when the folder has a `manifest.json`, only the files it names are used).

### Replacing a drawing with a real photo

1. Shoot or crop the photo to the same shape: 1440 x 900 (or 2880 x 1800) for wide screens, 786 x 1704 (or 1572 x 3408)
   for upright screens. Save it as PNG.
2. In `pictures/sources.json`, point the picture's key (for example `s1-desk-p1`) at the new file.
3. Run `npm run pictures -- <folder> --only s1-desk-p1,s1-phone-p1`.
4. In `content/site.json`, change that scene's `alt`: a photo's description does not start with "Drawing of". If no
   drawing is left on the site, change the line about drawings in `machines.pictures` and in the legal credits too.
5. If the photo frames the thing differently, adjust the scene's `frame` in `src/film/scenes.json`.
6. Run `npm run check`, and look at the scene at phone and desktop size.

## The email pictures: never rename, move or change

Every company email already sent loads these straight from the site. `npm run check` proves their bytes are unchanged.

- `public/proxyz-lockup-e-horizontal-light-tight.png`
- `public/proxyz-lockup-e-horizontal-light.png`
- `public/icon-whatsapp-dark.png`
- `public/icon-line-dark.png`

Also kept at their addresses: `proxyz-lockup-e-horizontal.png`, `proxyz-tricolor.svg`, `favicon.svg`, `og.png`.

## The host

`vercel.json` holds the rules: no catch all (unknown addresses get `404.html` with status 404), `/privacy` and `/terms`
redirect to the legal page, a strict content security policy (own host only, no inline script, no inline style
attributes: set styles from the script with `el.style`) on everything except the four email pictures, and a one year
cache for files with a hash in their name (`/assets/`, `/pictures/`).

## npm run check

Needs hidden browsers (Chromium, WebKit, Firefox) through `playwright-core`, which is not a dependency of the site:
set `PLAYWRIGHT_CORE` to a copy whose browsers are already installed. It never downloads anything. Set
`HIDDEN_NAMES_FILE` to a file with one name per line that must appear nowhere in the repository or the build; without
it that test is skipped with a warning.
