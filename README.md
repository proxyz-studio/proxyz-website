# PROXYZ website

This repo holds the website at https://proxyz.studio.

Right now the site is one static holding page: the PROXYZ name on a dark screen. A new site will replace it.

Two plain pages stay beside it, `/privacy` and `/terms` (`public/privacy.html` and `public/terms.html`), because other services link to them.

## Run it

```sh
npm ci
npm run dev
npm run build
```

`npm run build` writes the finished site to `dist/`.

## Files in `public/` that must keep their names

Emails load these six images straight from the site. Do not rename, move or change them, or those emails show a broken picture.

- `proxyz-lockup-e-horizontal-light-tight.png`
- `proxyz-lockup-e-horizontal-light.png`
- `proxyz-lockup-e-horizontal.png`
- `icon-whatsapp-dark.png`
- `icon-line-dark.png`
- `proxyz-tricolor.svg`

## Dependencies

The package list still holds the tools of the old site. It gets trimmed when the new site lands.
