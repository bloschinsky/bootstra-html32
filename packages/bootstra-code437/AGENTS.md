# AGENTS.md — bootstra-code437

Rules for the `packages/bootstra-code437/` package. They apply **only to this package**; repository-wide rules (structure, workspace commands, Git and publishing safety) live in the root [`AGENTS.md`](../../AGENTS.md). Read both before changing anything here. Paths below are relative to this folder.

## Package overview

bootstra-code437 is a Bootstrap 5.3 theme inspired by ANSI art, BBS interfaces, DOS-era terminals, and IBM Code Page 437. Regular Bootstrap markup gets a textmode look: one monospace face, frames with titles set into the border, `[ bracketed ]` buttons, dot leaders, and a muted dark palette with per-section accent colours.

It is a CSS-only theme loaded after Bootstrap's stylesheet, on a page with `data-bs-theme="dark"`. It ships no JavaScript; Bootstrap's own bundle drives every interactive component.

## Package structure

```text
packages/bootstra-code437/
├── AGENTS.md            this file
├── CLAUDE.md            pointer to this file
├── README.md            user documentation; shipped to npm
├── CHANGELOG.md         release history of this package
├── LICENSE              shipped to npm
├── package.json         metadata, version, scripts, themeCollection entry
├── .stylelintrc.json
├── src/code437.css      the whole theme in one file; shipped to npm
├── index.html           redirect to examples/
├── examples/
│   ├── index.html       every component on one page
│   └── blog.html        personal blog example (tabs, offcanvas menu, small inline script)
├── docs/                README screenshots; docs/blog-desktop.png is the collection preview
└── scripts/build.mjs    build
```

Generated, never committed, never edited by hand: `dist/`, `_site/`.

## Build

- `npm run build` runs `scripts/build.mjs`: it copies `src/code437.css` to `dist/code437.css` unchanged, minifies it into `dist/code437.min.css` with clean-css (level 1), and assembles `_site/` from `index.html`, `examples/`, and `dist/`.
- `_site/` is the `themeCollection.demo` folder. The collection site copies it to `themes/bootstra-code437/`, so the examples must keep linking the theme by the relative path `../dist/code437.css`, and every other link must stay relative.
- `npm start` serves this folder with `npx serve` (downloaded on demand, not in the lockfile). To check the demo inside the collection, use the root `npm run preview` instead.
- Run scripts from the repository root with `--workspace bootstra-code437`, or from this folder.

## Theme rules

### Contract with Bootstrap

- Bootstrap 5.3 is a peer dependency (`^5.3.0`) loaded before the theme. Never bundle, copy, or patch Bootstrap.
- Restyle Bootstrap components through their own selectors and `--bs-*` variables, so plain Bootstrap markup works. Do not change Bootstrap's grid, utilities, or JavaScript behaviour.

### Naming and public API

- Theme classes start with `cp-` (plus `.container-cp`), custom properties with `--cp-`, data attributes with `data-cp-` (some theme classes also read `data-n`, `data-label`, `data-off`, `data-off-short`).
- The classes, tokens, accent classes, and CSS-generated label variables listed in the README are the public API. Renaming or removing one is a breaking change.
- Accents are classes that set `--cp-acc` (`.cp-amber` default, `.cp-rose`, `.cp-teal`, `.cp-olive`, `.cp-orange`, `.cp-steel`). A new accent updates the CSS and the README table together.

### Source organization

- Plain CSS in a single file, `src/code437.css`. Keep that layout; do not split it or add a preprocessor without the owner's decision (Sass is on the author's roadmap, not decided).
- Follow the file's existing section order and compact style.

### Fonts

- The theme names JetBrains Mono first in `--cp-font` but ships no font files. The examples load it from Google Fonts. Do not bundle font files into the package.

### Accessibility, mobile, and browser support

- Mobile-first; interactive elements stay at least 44px tall. The menu pattern is Bootstrap's responsive offcanvas (`offcanvas-md`).
- Keep visible focus states and respect `prefers-reduced-motion` (cursor and spinner animations).
- Current Chrome, Edge, Firefox, and Safari. The theme relies on custom properties, `:has()`, `aspect-ratio`, and `env(safe-area-inset-*)`.

## Dependencies

- No runtime dependencies. Development dependencies are `clean-css`, `stylelint`, and `stylelint-config-recommended`.
- Stylelint uses the recommended config with `no-descending-specificity` disabled: the single-file cascade intentionally orders component overrides after their base rules.

## Verification

- `npm test` (lint + build) for every change to `src/`, `examples/`, `scripts/`, or `package.json`.
- For visual changes, check both examples over HTTP (root `npm run preview`, then `themes/bootstra-code437/`) at a desktop and a narrow (375px) viewport, including the dropdown, accordion, and modal on `examples/index.html` and the tabs and offcanvas menu on `examples/blog.html`.
- For build or packaging changes, check `dist/`, `_site/`, and `npm pack --workspace bootstra-code437 --dry-run` (only `dist/`, `src/`, `LICENSE`, `README.md`, and `package.json` may ship).

## Versioning and releases

- Semantic Versioning, with this package's `package.json` as the source of truth. The version line started at `0.1.0`.
- While in `0.x`: **patch** for fixes and small visual corrections that keep the public API; **minor** for new classes, accents, or tokens, and for any breaking change to the public API. `1.0.0` is an explicit owner decision.
- Every user-visible change adds a line under `## Unreleased` in `CHANGELOG.md`; a release moves them under `## X.Y.Z — YYYY-MM-DD`. A minor release also updates the `@X.Y` version in the README CDN link.
- Release tags are `bootstra-code437@X.Y.Z`. Follow [`docs/RELEASING.md`](../../docs/RELEASING.md); only the owner pushes tags.

## Demo security

The examples make only these third-party requests: Bootstrap CSS and JavaScript from jsDelivr, and the JetBrains Mono font from Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`). Do not add analytics, tracking, or other third-party requests.
