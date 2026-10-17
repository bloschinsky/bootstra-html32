# AGENTS.md — bootsys-p31

Rules for the `packages/bootsys-p31/` package. They apply **only to this package**; repository-wide rules (structure, workspace commands, Git and publishing safety) live in the root [`AGENTS.md`](../../AGENTS.md). Read both before changing anything here. Paths below are relative to this folder.

## Package overview

bootsys-p31 is a Bootstrap 5.3 theme that turns stock components into the screen of an old research terminal: a P31 phosphor display, a monospaced typeface, square corners, and optional scanlines. Three phosphor colours are available: green (default), amber, and cyan.

It is a CSS-only theme loaded after Bootstrap's stylesheet, on a page with `class="p31"` and `data-bs-theme="dark"` on `<html>`. It ships no JavaScript; Bootstrap's own bundle drives every interactive component.

## Package structure

```text
packages/bootsys-p31/
├── AGENTS.md                  this file
├── CLAUDE.md                  pointer to this file
├── README.md                  user documentation; shipped to npm
├── CHANGELOG.md               release history of this package
├── LICENSE                    shipped to npm
├── package.json               metadata, version, scripts, themeCollection entry
├── .stylelintrc.json
├── .editorconfig
├── src/bootsys-p31.css        the whole theme in one file; shipped to npm
├── docs/index.html            component docs; the collection demo
├── screenshots/screenshot.jpg  collection preview
├── examples/
│   ├── starter.html           shell for a new page
│   └── prototype/index.html   the original encyclopedia prototype (standalone, no Bootstrap)
└── scripts/build.mjs          build
```

Generated, never committed, never edited by hand: `dist/`, `docs/assets/`.

## Build

- `npm run build` runs `scripts/build.mjs`: it copies `src/bootsys-p31.css` to `dist/bootsys-p31.css` and `docs/assets/bootsys-p31.css` unchanged, and minifies it with clean-css (level 1) into `dist/bootsys-p31.min.css` with a version banner. `npm run watch` rebuilds on every save.
- `docs/` is the `themeCollection.demo` folder. The collection site copies it to `themes/bootsys-p31/`, so `docs/index.html` must keep loading the theme from `assets/bootsys-p31.css`, and every other link must stay relative. `examples/` is not part of the demo.
- `npm run serve` serves this folder with `npx serve` (downloaded on demand, not in the lockfile). To check the demo inside the collection, use the root `npm run preview` instead.
- Run scripts from the repository root with `--workspace bootsys-p31`, or from this folder.

## Theme rules

### Contract with Bootstrap

- Bootstrap 5.3 is a peer dependency (`^5.3.0`) loaded before the theme. Never bundle, copy, or patch Bootstrap.
- Restyle Bootstrap components through their own selectors and `--bs-*` variables (`--bs-btn-*`, `--bs-card-*`, `--bs-table-*` and so on), so plain Bootstrap markup works. Do not change Bootstrap's grid, utilities, or JavaScript behaviour.

### Naming and public API

- Theme classes start with `p31-` (plus the `p31` switch class on `<html>`), custom properties with `--p31-`, data attributes with `data-p31-` (`data-p31-phosphor`).
- Every rule is scoped under `.p31`, so the theme does nothing until the switch class is set.
- The classes, tokens, phosphor values, accent classes (`p31-accent-*`), and SVG figure classes listed in the README are the public API. Renaming or removing one is a breaking change.
- Bootstrap colour roles map to tokens (`primary` → `--p31-phos`, `info` → `--p31-cyan`, `warning` → `--p31-amber`, `danger` → `--p31-red`, `secondary` → `--p31-muted`). A new phosphor copies the amber block, including the `*-rgb` values and the `--p31-select-arrow`, `--p31-close-icon`, and `--p31-switch-off` icons, and updates the README together.

### Source organization

- Plain CSS in a single file, `src/bootsys-p31.css`, in numbered sections: tokens, mapping to Bootstrap variables, base, buttons, header and navigation, panels, tables, forms, alerts and overlays, P31 patterns. Keep that layout and the file's compact style; do not split it or add a preprocessor without the owner's decision.
- Tokens (section 1) and their mapping to Bootstrap (section 2) intentionally use the same selector in two blocks.

### Fonts

- The theme names IBM Plex Mono first in `--p31-font` but ships no font files. The docs and examples load it from Google Fonts. Do not bundle font files into the package.

### Accessibility, mobile, and browser support

- Mobile-first: the menu, status bar, and side cards fold behind buttons on phones (Bootstrap's `offcanvas-lg` and `collapse`) and stay open on desktop.
- Keep visible focus states. Animations are disabled under `prefers-reduced-motion`.
- Bootstrap 5.3.x and current Chrome, Edge, Firefox, and Safari. The theme relies on custom properties and `env(safe-area-inset-*)`.

## Dependencies

- No runtime dependencies. Development dependencies are `clean-css`, `stylelint`, and `stylelint-config-recommended`.
- Stylelint uses the recommended config with two rules disabled: `no-descending-specificity`, because the single-file cascade intentionally orders component overrides after their base rules, and `no-duplicate-selectors`, because tokens and their Bootstrap mapping share the `html.p31, .p31 [data-p31-phosphor]` selector in separate sections.

## Verification

- `npm test` (lint + build) for every change to `src/`, `docs/`, `examples/`, `scripts/`, or `package.json`.
- For visual changes, check `docs/index.html` over HTTP (root `npm run preview`, then `themes/bootsys-p31/`) at a desktop and a narrow (375px) viewport: the phosphor switches and the scanline toggle, the offcanvas section menu, dropdown, modal, tooltip, popover, and toast.
- For build or packaging changes, check `dist/`, `docs/assets/`, and `npm pack --workspace bootsys-p31 --dry-run` (only `dist/`, `src/`, `LICENSE`, `README.md`, and `package.json` may ship).

## Versioning and releases

- Semantic Versioning, with this package's `package.json` as the source of truth. The theme came into the collection at `1.0.0`.
- **Patch** for fixes and small visual corrections that keep the public API; **minor** for new classes, phosphors, or tokens; **major** for any breaking change to the public API.
- Every user-visible change adds a line under `## Unreleased` in `CHANGELOG.md`; a release moves them under `## [X.Y.Z] — YYYY-MM-DD`. A minor or major release also updates the `@X.Y` version in the README CDN link.
- Release tags are `bootsys-p31@X.Y.Z`. Follow [`docs/RELEASING.md`](../../docs/RELEASING.md); only the owner pushes tags.

## Demo security

The docs and examples make only these third-party requests: Bootstrap CSS and JavaScript from jsDelivr, and the IBM Plex Mono font from Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`). Do not add analytics, tracking, or other third-party requests.
