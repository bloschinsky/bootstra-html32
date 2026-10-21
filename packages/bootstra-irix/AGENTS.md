# AGENTS.md — bootstra-irix

Rules for the `packages/bootstra-irix/` package. They apply **only to this package**; repository-wide rules (structure, workspace commands, Git and publishing safety) live in the root [`AGENTS.md`](../../AGENTS.md). Read both before changing anything here. Paths below are relative to this folder.

## Package overview

bootstra-irix is a Bootstrap 5.3 theme inspired by the Indigo Magic desktop of early-90s Silicon Graphics workstations: bevelled Motif chrome, italic menus, thumbwheels, drop pockets, pink path fields, teal icon views, and slanted catalog tabs. Five colour schemes are available: IndigoMagic (default), KeyWest, Pacific, Mendocino, and Potrero.

It is a plain CSS file loaded after Bootstrap's stylesheet, on a page with `class="ix-desktop"` on `<body>`, plus an **optional** dependency-free script for the interactive desktop pieces (thumbwheels, clock, scheme switching, window drag / shade / maximize, icon selection, view modes, find bar). Bootstrap's own bundle drives its components; the theme script never replaces it.

## Package structure

```text
packages/bootstra-irix/
├── AGENTS.md                   this file
├── CLAUDE.md                   pointer to this file
├── README.md                   user documentation; shipped to npm
├── CHANGELOG.md                release history of this package
├── LICENSE                     shipped to npm
├── package.json                metadata, version, scripts, themeCollection entry
├── .stylelintrc.json
├── src/
│   ├── bootstra-irix.css       the whole theme in one file
│   └── bootstra-irix.js        optional behaviours
├── index.html                  demo desktop
├── components.html             component reference with copyable markup
├── screenshots/screenshot.png  collection preview (1280×860, taken from index.html)
└── scripts/build.mjs           build
```

Generated, never committed, never edited by hand: `dist/`, `_site/`.

## Build

- The theme is hand-written; there is no compiler or minifier. `npm run build` runs `scripts/build.mjs`, which copies `src/` to `dist/` unchanged, then assembles the demo in `_site/` from `index.html`, `components.html`, and `dist/`.
- `_site/` is the `themeCollection.demo` folder. The collection site copies it to `themes/bootstra-irix/`, so both pages must keep loading the theme from `dist/bootstra-irix.css` and `dist/bootstra-irix.js`, and every other link must stay relative.
- The version in the banner comments of `src/bootstra-irix.css` and `src/bootstra-irix.js` is written by hand; update it together with `package.json` on a release.
- Run scripts from the repository root with `--workspace bootstra-irix`, or from this folder. To check the demo, use the root `npm run preview` and open `themes/bootstra-irix/`.

## Theme rules

### Contract with Bootstrap

- Bootstrap 5.3 is a peer dependency (`^5.3.0`) loaded before the theme. Never bundle, copy, or patch Bootstrap.
- Restyle Bootstrap components through their own selectors and `--bs-*` variables, so plain Bootstrap markup works. Do not change Bootstrap's grid, utilities, or JavaScript behaviour.

### Naming and public API

- Theme classes start with `ix-`, custom properties with `--ix-`, data attributes with `data-ix-`; state classes are `is-*` (`is-active`, `is-shaded`, `is-max`, `is-selected`). Colour schemes use `data-scheme` and the automatic choice uses `data-theme="light|dark"` on `<html>`.
- Bootstrap components are restyled globally (not scoped under `.ix-desktop`); the `ix-desktop` class sets the desktop background, font, and scrollbars.
- The public API is what the README lists: the classes, tokens, scheme names, `data-ix-*` attributes, the `ix:change` and `ix:scheme` events, the `localStorage` key `bootstra-irix:scheme`, and `window.BootstraIrix` (`setScheme`, `init`, `initWheel`, `initClock`). Renaming or removing one is a breaking change.
- A new scheme redefines every token of the `[data-scheme="indigo"]` block under its own `[data-scheme="…"]` selector and is added to the README table.

### Source organization

- Plain CSS in a single file, `src/bootstra-irix.css`, in numbered sections: tokens and colour schemes, base / desktop, windows, views, thumbwheel, path bar, catalog tabs, Toolchest and desktop icons, buttons, forms, Bootstrap components, apps. Keep that layout and the file's compact style; do not split it or add a preprocessor without the owner's decision.
- Icons are original SVG drawings inlined as `data:` URIs; the theme loads no image or font files.
- `src/bootstra-irix.js` is one ES5 IIFE with no dependencies, using delegated event listeners. Keep it optional: the CSS must work without it.

### Fonts

- `--ix-font` falls back from Helvetica to Arimo and `--ix-mono` to Cousine. The demo loads Arimo and Cousine from Google Fonts; the package ships no font files. Do not bundle fonts.

### Accessibility, mobile, and browser support

- Keep visible focus states (`:focus-visible` dotted outline) and the ARIA the script sets (`role="slider"` and `aria-value*` on thumbwheels, `aria-pressed`, `aria-selected`). Thumbwheels work with drag, mouse wheel, arrow keys, Home, and End.
- Animations and transitions are disabled under `prefers-reduced-motion`. Window dragging is enabled only at 992px and wider; the demo layouts stack on phones.
- Bootstrap 5.3.x and current Chrome, Edge, Firefox, and Safari. The theme relies on custom properties, `:where()`, and `env(safe-area-inset-*)`.

## Dependencies

- No runtime dependencies. Development dependencies are `stylelint` and `stylelint-config-recommended`; `lint` also runs `node --check` on the script.
- Stylelint uses the recommended config with three rules disabled, so the source keeps its original order: `no-descending-specificity` and `no-duplicate-selectors`, because the single-file cascade adds later overrides (for example the `.ix-vbtn` pressed state) after their base rules; and `declaration-property-value-keyword-no-deprecated`, because icon labels use `word-break: break-word`, which every supported browser still implements.

## Verification

- `npm test` (lint + build) for every change to `src/`, the demo pages, `scripts/`, or `package.json`.
- For visual changes, check both demo pages over HTTP (root `npm run preview`, then `themes/bootstra-irix/`) at a desktop and a narrow (375px) viewport: the colour schemes and dark mode, thumbwheels, window drag / shade / maximize, icon selection and find bar, dropdown, modal, tooltip, and toast.
- For build or packaging changes, check `dist/` and `npm pack --workspace bootstra-irix --dry-run` (only `dist/`, `LICENSE`, `README.md`, and `package.json` may ship).

## Versioning and releases

- Semantic Versioning, with this package's `package.json` as the source of truth. The theme came into the collection at `0.1.0`.
- **Patch** for fixes and small visual corrections that keep the public API; **minor** for new classes, schemes, tokens, or behaviours; **major** for any breaking change to the public API (while the version is `0.x`, a breaking change is a minor bump).
- Every user-visible change adds a line under `## Unreleased` in `CHANGELOG.md`; a release moves them under `## X.Y.Z — YYYY-MM-DD`. A minor or major release also updates the `@X.Y` version in the README CDN links.
- Release tags are `bootstra-irix@X.Y.Z`. Follow [`docs/RELEASING.md`](../../docs/RELEASING.md); only the owner pushes tags.

## Demo security

The demo pages make only these third-party requests: Bootstrap CSS and JavaScript from jsDelivr, and the Arimo and Cousine fonts from Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`). Do not add analytics, tracking, or other third-party requests.
