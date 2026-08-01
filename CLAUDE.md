# Portfolio — CLAUDE.md

## Project overview

Personal portfolio/resume site for Haris Saeed. Static HTML site built with Pug templates, Bootstrap 5, and SCSS. No framework — custom Node.js build pipeline outputs to `dist/`.

Deployed to GitHub Pages via `gh-pages`: `npm run deploy`

## Tech stack

| Layer | Tool | Version |
|---|---|---|
| Templates | Pug | 3.x |
| CSS | SCSS + Bootstrap 5 | sass 1.x, bootstrap 5.3.x |
| CSS post-processing | PostCSS + Autoprefixer | postcss 8.x |
| HTML formatting | Prettier | 3.x |
| Dev server | browser-sync + chokidar | 4.x |
| Process runner | concurrently | 10.x |
| Deploy | gh-pages | 6.x |

## Commands

```bash
npm run build          # full production build → dist/
npm run start          # build + dev server with file watching (browser-sync on http://localhost:3000)
npm run start:debug    # start with --inspect flag for Node.js debugger
npm run deploy         # build + push dist/ to GitHub Pages
npm run clean          # wipe dist/
```

## Project structure

```
src/
  pug/index.pug        # single-page template (all content lives here)
  scss/
    styles.scss        # entry point — imports variables, bootstrap, components, sections
    _variables.scss    # Bootstrap variable overrides
    _global.scss       # global base styles
    components/        # sidenav, icons
    sections/          # resume-section
  js/scripts.js        # vanilla JS — Bootstrap scrollspy + navbar collapse
  assets/img/          # profile photo, company logos, flag images

scripts/               # custom build pipeline (no webpack/vite)
  render-pug.js        # pug → HTML (async, uses prettier for formatting)
  render-scss.js       # SCSS → CSS via sass.compile + postcss/autoprefixer
  render-scripts.js    # copies src/js → dist/js
  render-assets.js     # copies src/assets → dist/assets
  build-*.js           # one-shot build runners for each asset type
  sb-watch.js          # chokidar watcher that calls render-* on file changes
  start.js             # concurrently: sb-watch + browser-sync
  start-debug.js       # same but with --inspect
  clean.js             # rm -rf dist/*

dist/                  # build output (committed for gh-pages deploy, excluded from code review)
```

## Build pipeline notes

- **Pug rendering is async** — `render-pug.js` returns a Promise (prettier v3 `format()` is async). `build-pug.js` uses `Promise.all` to run all files concurrently.
- **Sass uses the new synchronous API** — `sass.compile(filePath, { loadPaths })` not the removed `sass.renderSync`. `loadPaths` points to `node_modules` so `@import "bootstrap/scss/bootstrap"` resolves.
- **concurrently v7+ API** — `concurrently(...)` returns `{ result, commands }`, not a Promise directly. Use `result.then(...)` in start scripts.
- **chokidar v4** — CJS-compatible via the `require` export. API is the same as v3 for basic usage.
- **lodash is NOT a dependency** — `sb-watch.js` uses native `Object.keys().forEach()` instead of `_.each`.

## Content updates

All content is in [src/pug/index.pug](src/pug/index.pug). Sections in order: About, Experience, Education, Skills, Languages, Interests, Projects & Certifications.

Images go in `src/assets/img/` and are referenced as `assets/img/<filename>` in the pug file.

## Deployment

```bash
npm run deploy
```

Pushes `dist/` to the `gh-pages` branch. The site is served at: https://harris012.github.io/portfolio

## Dockerfile

Uses `node:22-alpine`. Copies `package.json` + `package-lock.json` first (layer caching), runs `npm ci`, then copies the rest. `CMD` runs `npm start` (build + browser-sync).
