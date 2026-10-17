# AGENTS.md — bootstra-html32

Rules for the `packages/bootstra-html32/` package. They apply **only to this package**; repository-wide rules (structure, workspace commands, Git and publishing safety) live in the root [`AGENTS.md`](../../AGENTS.md). Read both before changing anything here. Paths below are relative to this folder unless stated otherwise.

## Package overview

bootstra-html32 is a Bootstrap 5.3 theme inspired by mid-90s web design, HTML 3.x pages, desktop UI chrome, and the early World Wide Web. Its visual language comes from the NOSEVIEW 1997 interface.

It is a CSS-only theme that loads after Bootstrap's own stylesheet. It restyles Bootstrap components and adds a small set of `nv-` components. It is not a Bootstrap fork, a component framework, or a JavaScript library: the grid, utilities, components, and JavaScript plugins must keep working exactly as Bootstrap documents them. Only the look changes.

The package ships three things:

- the theme, published to npm as `bootstra-html32` (`dist/*.css`);
- the demo page, published to GitHub Pages, which doubles as the documentation;
- a minimal starter template.

## Package structure

```text
packages/bootstra-html32/
├── AGENTS.md                 this file
├── CLAUDE.md                 pointer to this file
├── README.md                 user documentation (install, schemes, components); shipped to npm
├── CHANGELOG.md              release history of this package
├── LICENSE                   shipped to npm
├── package.json              metadata, version, scripts, themeCollection entry
├── .stylelintrc.json
├── src/
│   ├── bootstra-html32.css   entry: banner comment + ordered @import list
│   └── _*.css                one partial per section (schemes, wallpapers, base, page,
│                             screen, buttons, forms, cards, tables, navigation, feedback,
│                             lists-overlays, furniture, responsive)
├── site/
│   ├── index.html            shows every component; the living documentation
│   └── demo.css              showcase-only helpers, never part of the theme
├── examples/starter.html     minimal page using the theme
├── scripts/build.mjs         build, watch, and local server
└── screenshots/              images used by README (not shipped to npm)
```

Generated, never committed, never edited by hand: `dist/`, `_site/`.

## Build

- `npm run build` runs `scripts/build.mjs`: it inlines the `@import` partials into `dist/bootstra-html32.css` (formatting and comments preserved), minifies it into `dist/bootstra-html32.min.css` with Lightning CSS, and assembles `_site/` from `site/`, `examples/`, and `dist/`.
- The build injects the `package.json` version into the banner comment. Do not write the version into source files.
- `npm run dev` builds, watches `src/`, `site/`, and `examples/`, and serves `_site/` on `http://localhost:8080`.
- Run these from this folder, or from the repository root with `--workspace bootstra-html32`.
- The demo and the starter link to `dist/bootstra-html32.css` by a relative path. The collection site copies `_site/` (the `themeCollection.demo` folder) to `/bootstra-themes/themes/bootstra-html32/` on GitHub Pages, so every link in `site/` and `examples/` must stay relative.

## Development principles

Follow the repository's KISS / DRY / YAGNI rules. For this package specifically:

- A few clear CSS rules beat a clever generic system.
- Avoid meaningful duplication of values: derive colours from the scheme variables instead of repeating hex codes.
- Do not force DRY when it couples unrelated components or makes a selector harder to read.
- `scripts/build.mjs` is a plain ES module using Node.js built-in APIs and `lightningcss`. Plain functions only; no classes, factories, or layers.

The theme should feel elaborate in presentation, not in architecture.

## Theme rules

### Contract with Bootstrap

- Bootstrap 5.3 is a peer dependency (`^5.3.0`) loaded before the theme. Never bundle, copy, vendor, or patch Bootstrap, and never load it twice.
- Restyle Bootstrap components through their own selectors and `--bs-*` variables so plain Bootstrap markup works without extra classes.
- Do not change Bootstrap's layout behaviour (grid, spacing utilities, display utilities) or require JavaScript beyond Bootstrap's own bundle.
- The theme ships no JavaScript.

### Naming

- Theme classes start with `nv-`, custom properties with `--nv-`, and the scheme attribute is `data-nv-scheme`.
- Bootstrap variants keep Bootstrap names (`.btn-terminal`, `.table-terminal`, `.alert-terminal`) only when they extend a Bootstrap component.
- Class names, variables, scheme names, and wallpaper names are the public API. Renaming or removing one is a breaking change (see Versioning).

### Source organization

- Plain CSS only: custom properties and `color-mix()`. Do not add Sass, PostCSS plugins, or another preprocessor.
- The `@import` order in `src/bootstra-html32.css` is the cascade order. Keep it unless a task requires a change, and check the result when you change it.
- Each partial starts with the numbered section header used in the existing files. A new section gets a new partial and an `@import` line in the entry file; a change to an existing component goes into its existing partial.
- Match the existing compact style: aligned one-line rules where the file already uses them, short comments that explain intent.

### Colour schemes

- A scheme sets exactly `--nv-face`, `--nv-title`, and their `-rgb` variants in `_schemes.css`. Every other colour is derived with `color-mix()`; do not hardcode scheme-dependent colours in components.
- Adding, renaming, or removing a scheme updates the banner list in the entry file, the README table, and the demo scheme picker in the same change.

### Wallpapers

- Tiles are drawn with CSS gradients and inline SVG data URIs. The theme ships no image files.
- Adding, renaming, or removing a wallpaper updates the banner list, the README table, and the demo in the same change.

### Accessibility and motion

- Keep visible focus states (the dotted outline) on every interactive element.
- Every animation stops under `prefers-reduced-motion: reduce` in `_responsive.css`.
- Keep readable contrast in every scheme, including `hotdog`.
- Keep narrow-screen behaviour working (the `575.98px` breakpoint).

### Browser support

Current browsers with `color-mix()` support: Chrome / Edge 111+, Firefox 113+, Safari 16.2+. Do not add fallbacks or hacks for older browsers, and do not use features newer than this baseline without updating the README.

### Documentation of components

The demo page is the documentation. A new or changed public component, variant, scheme, or wallpaper updates in the same change:

- its partial in `src/`;
- `site/index.html` (a working example);
- the matching README table;
- `CHANGELOG.md` under `## Unreleased`.

`site/demo.css` holds only showcase helpers. Anything a user of the theme needs belongs in `src/`.

## Dependencies

- The theme has no runtime dependencies. Bootstrap is a peer dependency.
- Development dependencies are `lightningcss`, `stylelint`, and `stylelint-config-recommended`, declared in this package's `package.json`. Add another only when the current task cannot be solved cleanly with them or with Node.js built-ins.

## Verification

- `npm test` (lint + build) for every change to `src/`, `site/`, `scripts/`, or `package.json`.
- For visual changes, run `npm run dev` and check the affected components in the browser over HTTP: a desktop viewport, a narrow viewport, at least the `standard` scheme plus one contrasting scheme, and reduced motion when animation changed.
- For build or packaging changes, check `dist/`, `_site/`, and `npm pack --dry-run` (only `dist/`, `LICENSE`, `README.md`, and `package.json` may ship).

## Versioning and releases

- Semantic Versioning, with this package's `package.json` as the single source of truth (the root `package-lock.json` follows it). The version line started at `0.1.0`.
- While in `0.x`: **patch** for fixes and small visual corrections that keep the public API; **minor** for new components, schemes, wallpapers, or any breaking change to the public API (renamed or removed classes, variables, or scheme names). `1.0.0` is an explicit owner decision.
- Changes to documentation, the demo, CI, or tooling alone do not bump the version.
- Every user-visible change adds a line under `## Unreleased` in `CHANGELOG.md`. A release moves those lines under `## X.Y.Z — YYYY-MM-DD`.
- A minor release also updates the `@X.Y` version in the README CDN link.
- Release tags are `bootstra-html32@X.Y.Z`. The old `v0.1.0` tag is history; do not create `v*` tags.
- Release flow (only when the owner asks for a release) follows the repository's [`docs/RELEASING.md`](../../docs/RELEASING.md): update `CHANGELOG.md` and the README CDN link, run `npm version <patch|minor> --workspace bootstra-html32` from the root, run the local checks, commit `Release bootstra-html32@X.Y.Z`, and create the local tag. The owner pushes it; `release.yml` validates, tests, publishes to npm through trusted publishing, and creates the GitHub Release with `dist/*.css` attached.

## Demo security

The demo makes only two third-party requests: Bootstrap from jsDelivr and the visitor counter badge from `88x31.lol` (a plain image, no JavaScript or cookies). Do not add analytics, tracking, or other third-party requests.

## Non-goals

Unless the owner explicitly changes scope, this package is not:

- a Bootstrap fork or a rebuilt Bootstrap with custom Sass variables;
- a JavaScript component library;
- an icon set, font package, or image asset pack;
- a framework integration (Vue, React, or similar wrappers);
- a theme generator or configurator beyond the two-variable schemes.
