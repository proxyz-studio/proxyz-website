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
| `src/main.ts` | The film: from one playhead (the scroll position) to the light, the pictures, the words, the changes between scenes, the five marks. |
| `src/film/motion.ts` | How the film moves, as pure functions of the playhead: the change between two scenes, the drift of the pictures, the lines of words leaving and arriving. See "How the film moves" below. |
| `src/film/math.ts` | The light and mask arithmetic, shared by the film and the build. |
| `src/style.css` | The one style file for every page. |
| `build/pages.ts` | Writes the pages from the three data files (and the picture placement and the size of every giant line, used before the script runs and with no script at all). |
| `build/font.ts` | Reads the widths of the display face at build time, so each giant line gets its exact size in CSS (no script has to measure the words, so nothing jumps when the font arrives). |
| `pictures/sources.json` | Which drawing each web picture is made from. |
| `scripts/pictures.py` | Makes the web pictures in `public/pictures/` and `src/generated/pictures.json`. |
| `public/` | Files served as they are. See the email pictures below. |
| `src/film/board.json`, `scripts/board.mjs`, `build/board.ts` | Scene 6's board on the floor: its layout in millimetres and the two drawing cameras; the generator that projects it into picture pixels (`npm run board`, writes `src/generated/board.json`); the drawing of it in the page. See "Scene 6: the board" below. |
| `scripts/check.mjs`, `scripts/serve.mjs` | The proof (`npm run check`) and the local server that follows `vercel.json`. |
| `scripts/preview-file.mjs` | One self contained file of the real build, for looking at it without a server. |
| `src/world/` | The live 3D film (build 12): `film3d.ts` (what to draw from the playhead, the page layers, the fallbacks), `world.ts` (the world and its drawing, WebGL 2), `shaders.ts`, `path.ts` (the camera), `mat.ts`, `shots.json` (every still's camera and light), `world.bin` (the shapes). See "The live 3D film" below. |
| `scripts/world-pack.mjs`, `scripts/world-shots.mjs`, `scripts/stand-model.mjs` | Make `src/world/world.bin`, `src/world/shots.json` and `src/world/stand.bin`. |
| `src/fonts/` | IBM Plex Mono, Regular (400) and SemiBold (600): IBM's own split Latin 1 files from its package `@ibm/plex-mono` version 2.5.0 (licence OFL-1.1, source github.com/ibm/plex), byte for byte, with IBM's licence as `OFL.txt`. To prove it, unpack that package and compare: `fonts/split/woff2/IBMPlexMono-Regular-Latin1.woff2` sha256 `e8993d946649b9d01abb1ed06d574b19d8ea3e66b5c3948602db335c44c18e56`, `fonts/split/woff2/IBMPlexMono-SemiBold-Latin1.woff2` sha256 `b7acd05041ab65f3b7039e218ddd893065e11a07e85ea85019473152a51b6b7d`. The giant lines: Anton (400), the Latin file of the package `@fontsource/anton` version 5.3.0 (`files/anton-latin-400-normal.woff2`, Anton 2.116, licence OFL-1.1, copyright The Anton Project Authors, no reserved font name, source github.com/googlefonts/AntonFont), byte for byte, sha256 `d0fa07ff63dd60cbc0e2f58e29c802dca2a5ae0276c999f59c6111ab7bbaec3b`, with the package's licence as `OFL-Anton.txt`. |

## Names and links of ventures

In `content/site.json`, under `ventures`, each venture may have a `name` and a `url`.
With a `name`, the name shows beside its mark while its scene is on screen, and at the start of its plain text line.
With a `url` as well, the name in the border links to that address, and the plain text line ends with it.
Adding either is one line, for example `"name": "Example", "url": "https://example.com",`. A venture without a name
leaves no name anywhere in the built site.

## Doors: a product's own site under the studio's address

A product's site also opens at the studio's address (`/tapz/`), so the browser can blend the scene's picture into the
product's first picture (cross-document view transitions; the contract with the product sites is the hand-over
rulebook). Each door is one entry in `content/site.json` under `doors`:

- `on`: off means no door, no link, no forwarding. `path` and `target` (the product's public address, answering
  without a login); `open` (the address the door opens, for example with `?lang=en`); `label` (the link's name).
- `logo` (a file in `src/logos/`, copied byte for byte from the product's logo kit, plain shapes only), `lit` (the
  colour of its one moving part) and `move`: `press` (the lit Z presses like a key, two cream rings) or `route` (the
  red route draws itself).
- `scenes`: the product's own scene (its logo and an arrow) and the board (its name tag and its thing, one link).
- `pictures`: the product's first pictures, widest screens first, each with its `anchor` [left, right, middle height]
  in its own pixels. The studio's matching anchor per scene is in `src/film/scenes.json` (`doors`, with the thing's
  bounds and, on the board, the link's area). `python3 scripts/anchors.py <folder> disc <files>` measures them again
  when a product re-shoots its pictures.

`vercel.json` must agree (the check proves it): a rewrite of `<path>` and `<path>:path*` to the target for every door
that is on, the door paths left out of the studio's own headers (the product sends its own, one opener policy), and
the `Speculation-Rules` header on the home page (`/doors.json`, built from the open doors). The address hash of a door
(`/#tapz`) opens the film on its product's scene at rest; before leaving through a door the film saves that place, so
Back always lands there, with or without the back/forward cache.

`npm run check` never calls a product's live site: each open door needs a local copy of the product's build,
`DOOR_STANDIN_<ID>=<folder>` and `DOOR_STANDIN_<ID>_HEADERS=<its vercel.json>` (without it the check stops). Test 29
also uses a copy without the hand-over's asks, `DOOR_PLAIN_<ID>` and `DOOR_PLAIN_<ID>_HEADERS` (skipped with a warning
without it). `scripts/serve.mjs` serves the doors the same way.

## Pictures

Source drawings (large PNG files) are not kept here. To make the web pictures again:

```sh
npm run pictures -- <folder of the drawings> [--prefer <folder of bigger drawings>]
```

Each picture gets a 1x file (desktop 1440 wide, phone 786 wide) made from the drawing named in
`pictures/sources.json`, and a 2x file (2880, 1572) when a drawing twice that size exists. With `--prefer <folder>`
the script looks there for `<name>@2x.png` (a drawing named `<name>@1x.png` finds its `<name>@2x.png`); when the
folder has a `manifest.json`, a file is used only if its own entry (a picture or a matte) says `"status": "done"`. The script prints, for every picture, which drawings it used, and ends with a count such as
`28 of 32 pictures have a 2x file`, so a silent miss cannot happen.

Every file is AVIF (full colour detail, tuned for still pictures) with a WebP fallback. The quality was chosen by
looking at the dark floors brightened 4 to 12 times at full size; the script prints how much fine grain each file
keeps. In `sources.json` a picture may set its own `q`, a byte budget for its 2x file (`max2x`, used for the first
picture so a sharp phone's first load stays small), or `only1x` (smooth pictures with no detail). File names carry a
content hash, so they can be cached for a year. The film always places pictures from their logical size
(1440 x 900, 786 x 1704), so bigger files change nothing in the layout.

### The giant words and the pictures around them

Every scene has its giant lines (`lines` in `content/site.json`; `phoneLines` breaks the same words otherwise on an
upright screen). Scenes 1 and 7 hold them at the foot of the screen, the others at the top under the border
(`type.bottom` in `src/film/scenes.json`, where the size rules live too). A scene's `frame` can keep a picture clear of
them: `below: [row, gap]` keeps that picture row at least `gap` px under the giant words at the top, `above` the same
over the words at the foot, and `span: [y0, y1]` fits those picture rows between the giant words at the top and the
words at the foot (the picture made smaller on short screens). The words at the foot ride a phone browser's bar, so
`above` and `span` leave room for them where they sit with the bar showing (the small viewport, `100svh`); the
pictures never move when the bar slides. `later` lists the boxes of things that first appear in a later pass;
`npm run check` proves they never overlap the giant words, never touch the words at the foot and stay on screen, for
every bar layout it knows. The film places pictures in `src/main.ts` and the same arithmetic is written as CSS in
`build/pages.ts` for the page without scripts; the check proves the two agree.

### Mattes: the thing in front of the words

Where the thing a scene lights first overlaps its giant words, it stands in front of them: the letters are hidden
inside its outline. That needs its matte, a PNG with alpha (white thing, transparent elsewhere) framed exactly like the
scene's pictures, at 1x and if possible 2x (`<name>@2x.png` in the `--prefer` folder). To add one:

1. In `pictures/sources.json` add `"s2-desk-matte": { "src": "<file>.png", "matte": true }` (one per screen shape).
2. In `src/film/scenes.json` add `"matte": "s2-desk-matte"` to that scene's view.
3. Run `npm run pictures -- <folder> --prefer <big folder> --only s2-desk-matte,s2-phone-matte`.

A view that names a matte the manifest does not hold simply has no cut. With a matte, `frame.tuck` lets a span's top row
reach into the lowest giant line, as a share of its capitals' height (0.15: the thing hides at most the lowest 15% of
those letters). Then run `npm run check`: its cut-out tests run for every scene with a matte.

### Scene 6: the board

Scene 6's floor is one circuit board: a chip marked with the system's name in the middle, a live trace from it to
each thing (butter to the stand, mint to the race piece, pink to the coach phone), a quiet net of traces, and a dashed
trace to an empty place marked NEXT. It is drawn by the page over the drawing, not into it:

- `src/film/board.json`: the layout in millimetres on the floor, one per screen shape, with the camera of each drawing
  (copied from the drawing program's job). Change it here, then run `npm run board`, which projects every line
  through that camera into picture pixels and writes `src/generated/board.json`. The site build reads only that file;
  it never needs the drawings' folder. A route that never meets its pad stops the generator.
- `build/board.ts` writes the board into the page at rest (an SVG per screen shape, in the picture's own box, and the
  two labels as real text, from `board` in scene 6 of `content/site.json`). Lines keep their width in screen pixels.
- `src/main.ts` draws it in as a pure function of the scroll: the chip and the stand's trace as the scene comes in,
  the race piece's trace with the second pass, the phone's with the third, then the net, the darker floor, the dashed
  trace and NEXT. At rest small pulses run the three live traces (only while the scene is on screen). With less
  motion, the rest state and no pulses. With scripts off, or once the film gives up, the rest state.
- Behind the things: the board is hidden inside the matte of all three things (`things` in scene 6's view, a
  `-things-matte` picture in `pictures/sources.json`). No matte, no board.
- `npm run check` tests 19 to 23 prove it: placed as the picture, hidden inside the things, no tell before each step,
  clear of the giant words, the labels readable and on screen, still with less motion.

### The last scene's picture

`content/site.json`, last scene, `"picture"`: `"twin"` (the default: the pool of light of scene 6, now empty, framed
exactly like scene 6, so through the change the light stays in place and only the three things leave it) or `"own"` (the
alternative: its own small, faint pool of light). The twin's film data is `"7twin"` in `src/film/scenes.json`; its
pictures are `s7t-*`. While the twin fades in, scene 6 holds at full strength under it, so the pool does not dim.
Change the word, build, check.

### How the film moves

Everything the film shows is set on every frame from one number, the playhead: the scroll position, followed at once
for a script, a key or a scroll bar, within about 40 ms for a finger and within about 90 ms for a mouse wheel (which
moves the page in steps). Nothing runs on a timer, so scrolling back plays everything in reverse. The numbers live in
`src/film/motion.ts`:

- The change between two scenes plays over 0.8 screens of scroll, centred where the scene on screen changes. Each
  scene's stage has its own dark ground; the arriving scene comes in over the one leaving, held at full strength, so
  the light never dips and no frame is empty. The scene after 6 is the twin: nothing moves, only the three things
  leave the pool of light.
- A scene's picture, with its giant words at the top (and the matte cut, and scene 6's board and labels), rests a
  little below its place as the change into it starts, rises into place as the light comes, and keeps rising at the
  same pace after it; it grows 3% as it leaves. At each scene's rest (within 3 px) it is exactly in place.
- The lines of words leave and arrive one by one, moving 22 to 40 px: the giant lines at the top first, the words at
  the foot later. Words never pass over other words.
- Each light pass is eased at both ends of its step, resting exactly where the light arithmetic rests it.
- The door's logo shows as the light comes to rest and leaves first.
- With less motion: no movement, each scene at its rest, a plain cut between scenes.
- The scenes next to the one on screen are built and painted (unseen) while the page is still, after the first scroll.
- On every frame the film writes only transforms and opacity, on boxes that do not carry a mask: the camera moves a
  box inside the pictures' box (`.frame`, the passes and the board) and a box around the giant words' box (`.cam`);
  scene 6's growing light is an oval mask drawn once in a box (`.lm`) inside a box the film scales (`.lens`). A
  browser draws a masked box again whenever its style is touched, so the masked boxes are only touched on a resize.
- What moves gets a layer of its own only while it moves (a light pass while its light grows, the lines of words
  through a change, the board's labels while they move), so at rest everything is drawn as the page draws it.

### The live 3D film (build 12)

Once the visitor shows intent (a touch, the wheel, a key, the mouse moving), the whole film is also drawn live: one
WebGL 2 world with one camera that follows the playhead, from the letters of scene 1 to the empty pool of scene 7. The
still film above stays underneath it all the time: it is the first screen, and it takes over whenever the live film
cannot run.

- **One world.** The things stand where scene 6's drawing puts them (the stand, the race coin, the coach phone);
  scenes 1 and 2 are close visits to the stand, scene 4 to the coin, scene 5 to the phone, and scene 6 pulls back to
  show the three on one floor. Scene 3's race piece on its base has its own spot; scene 2's phone (the one that taps
  the tile) is there in scene 2 only.
- **Drawn from the stills.** Every surface is drawn from the very pictures the still film shows (the same files, so
  the browser's cache serves them), each cast back onto the shapes from the camera that drew it. At each scene's rest
  the camera is exactly that camera, framed where the page puts the picture, so the live frame is the still. While
  the camera moves, the shapes give the pictures their depth; what no picture saw is lit live by that scene's key
  light (the same light, colours and camera curve as the picture maker). The light passes mix as the page mixes the
  pictures; scene 6's later passes grow inside the same oval.
- **The camera** (`src/world/path.ts`, the moves in `SHAPES` in `src/world/film3d.ts`): at each rest exactly the
  still's camera; between rests it travels slowly out, does most of its move while the light changes, and settles
  slowly in, never stopping and never swinging past. Scene 1 holds still until its light rests; scenes 6 and 7 share
  one camera. The stills of two scenes are mixed by where the camera is (each strongest near its own camera).
- **In the page.** The live picture is one canvas inside the pictures' box of the lowest live scene on screen, so the
  dark band at the foot, scene 6's board and the giant words stay above it as above a still. The things that stand in
  front of the giant words are copied into a second canvas above the words (`.world-fg`). Scene 6's board and its
  labels follow the floor while the camera moves.
- **Loading.** Nothing of it loads with the first screen (test 11 counts the first load). The script (about 17 KB
  compressed) and the shapes (`src/world/world.bin`, about 500 KB) load at the first sign of intent, or at once when
  the visitor comes back through Back or a door's address. The stills go into the graphics chip in the order the film
  needs them, a strip at a time.
- **When it does not run:** less motion (never started), no WebGL 2, a chip too slow for it (two slow first frames, a
  software chip for example), a lost context (the stills at once; live again when the context comes back, or with a
  new one after 2 s). It draws only when something changes, never while the tab is hidden, and sends its work to the
  chip on every frame (a context left with its work queued stalled look 11 for up to 360 ms).
- **The shapes.** `node scripts/world-pack.mjs <the stills project's pt/tools/pt/coin-lines folder>` rebuilds
  `src/world/world.bin` (the stand's parts from `src/world/stand.bin`, made by `scripts/stand-model.mjs`; the coin's
  height field and its part colours from the coin's real triangles; the phone and the trophy's base as the stills
  make them). `node scripts/world-shots.mjs <the stills project folder>` rebuilds `src/world/shots.json`, every
  still's camera, key light and poses, from the settings the picture maker saved beside each drawing. Run both when a
  drawing is made again, then `npm run check` (tests 32 to 36 prove the live film).
- The page root carries `data-world` for the check: the scenes drawn live now, those whose stills are in the chip,
  and the first frame's time in ms.

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

Needs hidden browsers (Chromium, WebKit, Firefox, and Chromium's own build with the graphics chip, its `chromium`
channel, for the live film's tests 32 to 36) through `playwright-core`, which is not a dependency of the site:
set `PLAYWRIGHT_CORE` to a copy whose browsers are already installed. It never downloads anything. Set
`BLOCKED_WORDS_FILE` to an optional local file, one word or phrase per line, that must never ship: the check fails if
any of them appears in a tracked file, a file name or the build. Without it that test is skipped with a warning.
The cut-out test runs only for scenes that have a matte; without any it says so with a warning. While working on one
part, `CHECK_TESTS=14,17 npm run check` runs only those tests; the proof is always the full run.
