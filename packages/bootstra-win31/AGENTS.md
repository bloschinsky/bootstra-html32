# AGENTS.md — bootstra-win31

Rules for the `packages/bootstra-win31/` package. They apply **only to this package**; repository-wide rules (structure, workspace commands, dependencies, Git and publishing safety) live in the root [`AGENTS.md`](../../AGENTS.md). Read both before changing anything here. Paths below are relative to this folder.

## Package overview

bootstra-win31 is a Bootstrap 5.3 theme inspired by Windows 3.1, Program Manager, File Manager and early-90s desktop GUIs. It is a sister theme of bootstra-html32 in spirit; the two packages share no code and each keeps its own rules.

It is a CSS-only theme that loads after Bootstrap's own stylesheet. It restyles Bootstrap components and adds a small set of `w31-` components. It is not a Bootstrap fork, a component framework, or a JavaScript library: the grid, utilities, components, and JavaScript plugins must keep working exactly as Bootstrap documents them. Only the look changes.

The package ships three things:

- the theme, published to npm as `bootstra-win31` (`dist/*.css`);
- the demo page, published on the collection site at `themes/bootstra-win31/`, which doubles as the documentation;
- a minimal starter template.

The theme should feel elaborate in presentation, not in architecture. A few clear CSS rules beat a clever generic system; derive colours from the scheme variables instead of repeating hex codes, but do not force DRY when it couples unrelated components.

## Package structure

```text
packages/bootstra-win31/
├── AGENTS.md                 this file
├── CLAUDE.md                 pointer to this file
├── README.md                 user documentation (install, schemes, components); shipped to npm
├── CHANGELOG.md              release history of this package
├── LICENSE                   shipped to npm
├── package.json              metadata, version, scripts, themeCollection entry
├── .stylelintrc.json
│
├── src/                      theme source
│   ├── bootstra-win31.css    entry: banner comment + ordered @import list
│   └── _*.css                one partial per section (schemes, desktop, base, window,
│                             icons, buttons, forms, cards, tables, navigation, feedback,
│                             overlays, scrollbars, responsive)
│
├── site/                     demo page
│   ├── index.html            shows every component; the living documentation
│   └── demo.css              showcase-only helpers, never part of the theme
│
├── examples/starter.html     minimal page using the theme
├── screenshots/              screenshot.png is the collection preview
└── scripts/build.mjs         build, watch, and local server
```

Generated, never committed, never edited by hand: `dist/`, `_site/`.

## Build

- `npm run build` runs `scripts/build.mjs`: it inlines the `@import` partials into `dist/bootstra-win31.css` (formatting and comments preserved), minifies it into `dist/bootstra-win31.min.css` with Lightning CSS, and assembles `_site/` from `site/`, `examples/`, and `dist/`. `npm run build:css` builds `dist/` only.
- The build injects the `package.json` version into the banner comment. Do not write the version into source files.
- `npm run dev` builds, watches `src/`, `site/`, and `examples/`, and serves `_site/` on `http://localhost:8080`.
- `_site/` is the `themeCollection.demo` folder. The collection site copies it to `themes/bootstra-win31/`, so the demo and the starter must keep linking `dist/bootstra-win31.css` by a relative path, and every link in `site/` and `examples/` must stay relative.
- Run scripts from the repository root with `--workspace bootstra-win31`, or from this folder.

## Theme rules

### Contract with Bootstrap

- Bootstrap 5.3 is a peer dependency (`^5.3.0`) loaded before the theme. Never bundle, copy, vendor, or patch Bootstrap, and never load it twice.
- Restyle Bootstrap components through their own selectors and `--bs-*` variables so plain Bootstrap markup works without extra classes.
- Do not change Bootstrap's layout behaviour (grid, spacing utilities, display utilities) or require JavaScript beyond Bootstrap's own bundle.
- The theme ships no JavaScript.

### Naming and public API

- Theme classes start with `w31-`, custom properties with `--w31-`, and the scheme attribute is `data-w31-scheme`.
- Theme classes that extend a Bootstrap component use the `w31-` prefix (`.w31-btn-dialog`); Bootstrap variants such as `.btn-primary` keep their Bootstrap names.
- Class names, variables, scheme names, pattern and wallpaper names are the public API. Renaming or removing one is a breaking change (see Versioning).

### Source organization

- Plain CSS only: custom properties and `color-mix()`. Do not add Sass, PostCSS plugins, or another preprocessor.
- The `@import` order in `src/bootstra-win31.css` is the cascade order. Keep it unless a task requires a change, and check the result when you change it.
- Each partial starts with the numbered section header used in the existing files. A new section gets a new partial and an `@import` line in the entry file; a change to an existing component goes into its existing partial.
- Match the existing compact style: aligned one-line rules where the file already uses them, short comments that explain intent.

### Colour schemes

- A scheme sets exactly `--w31-face`, `--w31-title`, `--w31-title-rgb`, `--w31-desktop`, `--w31-window` and `--w31-desktop-text` in `_schemes.css`. Every other colour (bevels, highlight, menus, workspace) is derived; do not hardcode scheme-dependent colours in components.
- Fixed Windows 3.x colours (pure black outlines, white bevel highlight, the 16-colour VGA palette for button variants, the yellow help colour, green Help links) are intentional and are not scheme colours.
- Adding, renaming, or removing a scheme updates the banner list in the entry file, the README table, and the demo scheme picker in the same change.

### Desktop patterns and wallpapers

- Patterns are 8×8 one-bit bitmaps drawn as inline SVG data URIs in black over `--w31-desktop`, shown at 2× through `--w31-pattern-size`. Wallpapers are full-colour tiles made of CSS gradients or inline SVG. The theme ships no image files.
- Adding, renaming, or removing a pattern or wallpaper updates the banner list, the README table, and the demo in the same change.

### Fidelity

- The reference is Windows 3.1 itself: black one-pixel outlines, two-pixel bevels, bold System-font chrome, navy title bars with centred titles, white menus, inactive windows with white title bars, X-marked checkboxes, the control-menu box on the left instead of a close button. Prefer the authentic behaviour over Windows 95 conventions.
- Draw every glyph (icons, arrows, symbols) yourself as CSS or inline SVG. Never copy Microsoft icons, bitmaps, logos, or the Windows flag.

### Accessibility and motion

- Keep visible focus states (the dotted outline) on every interactive element.
- Every animation stops under `prefers-reduced-motion: reduce` in `_responsive.css`.
- Keep readable contrast in every scheme, including `hotdog` and `mono`.
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

- No runtime dependencies. Bootstrap is a peer dependency.
- Development dependencies are `lightningcss`, `stylelint`, and `stylelint-config-recommended`. Add another only when the current task cannot be solved cleanly with them or with Node.js built-ins.
- Stylelint uses the recommended config with `no-descending-specificity` disabled: the partials intentionally order component overrides after their base rules.

## Verification

- `npm test` (lint + build) for every change to `src/`, `site/`, `examples/`, `scripts/`, or `package.json`.
- For visual changes, run `npm run dev` (or the root `npm run preview`, then `themes/bootstra-win31/`) and check the affected components over HTTP: a desktop viewport, a narrow viewport, at least the `default` scheme plus one contrasting scheme, and reduced motion when animation changed.
- For build or packaging changes, check `dist/`, `_site/`, and `npm pack --workspace bootstra-win31 --dry-run` (only `dist/`, `LICENSE`, `README.md`, and `package.json` may ship).

## Versioning and releases

- Semantic Versioning, with this package's `package.json` as the source of truth. The version line started at `0.1.0`.
- While in `0.x`: **patch** for fixes and small visual corrections that keep the public API; **minor** for new components, schemes, wallpapers, or any breaking change to the public API (renamed or removed classes, variables, or scheme names). `1.0.0` is an explicit owner decision.
- Changes to documentation, the demo, or tooling alone do not bump the version.
- Every user-visible change adds a line under `## Unreleased` in `CHANGELOG.md`; a release moves those lines under `## X.Y.Z — YYYY-MM-DD`. A minor release also updates the `@X.Y` version in the README CDN link and the demo's install snippet and footer.
- Release tags are `bootstra-win31@X.Y.Z`. Follow [`docs/RELEASING.md`](../../docs/RELEASING.md); only the owner pushes tags.

## Demo security

The demo and the starter make only these third-party requests: Bootstrap CSS and JavaScript from jsDelivr. The demo's inline script stores the chosen scheme, pattern, and wallpaper in `localStorage` only. Do not add analytics, tracking, or other third-party requests.

## Non-goals

Unless the owner explicitly changes scope, this package is not:

- a Bootstrap fork or a rebuilt Bootstrap with custom Sass variables;
- a JavaScript component library;
- an icon set, font package, or image asset pack;
- a framework integration (Vue, React, or similar wrappers);
- a theme generator or configurator beyond the scheme variables.
