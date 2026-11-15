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
| `content/site.json` | Every word on the site. The pages, `llms.txt` (with its closing list of page links), the meta tags and the structured data are all made from it at build time. Edit words here, nowhere else. |
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
| `src/fonts/` | IBM Plex Mono, Regular (400) and SemiBold (600): IBM's own split Latin 1 files from its package `@ibm/plex-mono` version 2.5.0 (licence OFL-1.1, source github.com/ibm/plex), byte for byte, with IBM's licence as `OFL.txt`. To prove it, unpack that package and compare: `fonts/split/woff2/IBMPlexMono-Regular-Latin1.woff2` sha256 `e8993d946649b9d01abb1ed06d574b19d8ea3e66b5c3948602db335c44c18e56`, `fonts/split/woff2/IBMPlexMono-SemiBold-Latin1.woff2` sha256 `b7acd05041ab65f3b7039e218ddd893065e11a07e85ea85019473152a51b6b7d`. |

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

Each picture gets a 1x file (desktop 1440 wide, phone 786 wide) made from the drawing named in
`pictures/sources.json`, and a 2x file (2880, 1572) when a drawing twice that size exists. With `--prefer <folder>`
the script looks there for `<name>@2x.png`; when the folder has a `manifest.json`, a file is used only if its own entry
says `"status": "done"`. The script prints, for every picture, which drawings it used, and ends with a count such as
`28 of 32 pictures have a 2x file`, so a silent miss cannot happen.

Every file is AVIF (full colour detail, tuned for still pictures) with a WebP fallback. The quality was chosen by
looking at the dark floors brightened 4 to 12 times at full size; the script prints how much fine grain each file
keeps. In `sources.json` a picture may set its own `q`, a byte budget for its 2x file (`max2x`, used for the first
picture so a sharp phone's first load stays small), or `only1x` (smooth pictures with no detail). File names carry a
content hash, so they can be cached for a year. The film always places pictures from their logical size
(1440 x 900, 786 x 1704), so bigger files change nothing in the layout.

### The last scene's picture

`content/site.json`, last scene, `"picture"`: `"twin"` (the default: the pool of light of scene 6, now empty, framed
exactly like scene 6, so at the cut the light stays in place and only the three things leave it) or `"own"` (the
alternative: its own small, faint pool of light). The twin's film data is `"7twin"` in `src/film/scenes.json`; its
pictures are `s7t-*`. While the twin fades in, scene 6 holds at full strength under it, so the pool does not dim.
Change the word, build, check.

### Replacing a drawing with a real photo

1. Shoot or crop the photo to the same shape: 1440 x 900 and 2880 x 1800 for wide screens, 786 x 1704 and
   1572 x 3408 for upright screens. Save them as PNG; name the big one `<name>@2x.png` in the `--prefer` folder.
2. In `pictures/sources.json`, point the picture's key (for example `s1-desk-p1`) at the new file.
3. Run `npm run pictures -- <folder> --prefer <big folder> --only s1-desk-p1,s1-phone-p1`.
4. In `content/site.json`, change that scene's `alt`: a photo's description does not start with "Drawing of". The
   line about the pictures (in `machines.pictures` and the first line of the legal credits) says every picture is a
   drawing and none is a photograph: as soon as one photo is on the site, change it in both places.
5. If the photo frames the thing differently, adjust the scene's `frame` in `src/film/scenes.json`.
6. Run `npm run check`, and look at the scene at phone and desktop size.

## The email pictures: never rename, move or change

Every company email already sent loads these straight from the site. `npm run check` proves their bytes are unchanged.

- `public/proxyz-lockup-e-horizontal-light-tight.png`
- `public/proxyz-lockup-e-horizontal-light.png`
- `public/icon-whatsapp-dark.png`
- `public/icon-line-dark.png`

Also kept at their addresses: `proxyz-lockup-e-horizontal.png`, `proxyz-tricolor.svg`, `favicon.svg`, `og.png`. The link preview picture the pages name is `og-2026-11.jpg` (the same picture, 143 KB; a new name so chat apps fetch it fresh).

## The host

`vercel.json` holds the rules: no catch all (unknown addresses get `404.html` with status 404), `/privacy` and `/terms`
redirect to the legal page (each listed with and without the trailing slash: the host adds the slash first and then
matches redirects exactly, capitals included; `scripts/serve.mjs` matches the same way), a strict content security policy (own host only, no inline script, no inline style
attributes: set styles from the script with `el.style`) on everything except the four email pictures, and a one year
cache for files with a hash in their name (`/assets/`, `/pictures/`).

## npm run check

Needs hidden browsers (Chromium, WebKit, Firefox) through `playwright-core`, which is not a dependency of the site:
set `PLAYWRIGHT_CORE` to a copy whose browsers are already installed. It never downloads anything. Set
`BLOCKED_WORDS_FILE` to an optional local file, one word or phrase per line, that must never ship: the check fails if
any of them appears in a tracked file, a file name or the build. Without it that test is skipped with a warning.
