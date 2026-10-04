# AGENTS.md

This file is the single source of truth for working on this repository. Read it before making any change and follow it. If a rule changes, change it here; other files only point to this one.

## Project overview

bootstra-html32 is a Bootstrap 5.3 theme inspired by mid-90s web design, HTML 3.x pages, desktop UI chrome, and the early World Wide Web. Its visual language comes from the NOSEVIEW 1997 interface.

It is a CSS-only theme that loads after Bootstrap's own stylesheet. It restyles Bootstrap components and adds a small set of `nv-` components. It is not a Bootstrap fork, a component framework, or a JavaScript library: the grid, utilities, components, and JavaScript plugins must keep working exactly as Bootstrap documents them. Only the look changes.

The repository ships three things:

- the theme, published to npm as `bootstra-html32` (`dist/*.css`);
- the demo page, published to GitHub Pages, which doubles as the documentation;
- a minimal starter template.

## Language

- Use English throughout the repository: code, comments, identifiers, documentation, commit messages, changelog, demo copy, and workflow names.
- Keep terminology consistent with the surrounding text when editing.

## Development principles

Follow **KISS, DRY, and YAGNI**. Build the smallest solution that fully solves the current task.

- Prefer the simplest readable implementation. A few clear CSS rules beat a clever generic system.
- Do not add abstractions, dependencies, configuration, tooling, or features for hypothetical future needs.
- Avoid meaningful duplication of values: derive colours from the scheme variables instead of repeating hex codes.
- Do not force DRY when it couples unrelated components or makes a selector harder to read.
- Scripts are plain ES modules using Node.js built-in APIs. Plain functions are the default; do not introduce classes, factories, or layers for a build script.

Decision rule: when several approaches satisfy the task, choose the one with fewer moving parts, fewer dependencies, and the code a developer opening the repository later will understand fastest. The theme should feel elaborate in presentation, not in architecture.

## Repository structure

```text
/
├── AGENTS.md                 this file
├── CLAUDE.md                 pointer to AGENTS.md
├── README.md                 user documentation (install, schemes, components)
├── CHANGELOG.md              release history
├── package.json              metadata, version, scripts
├── .stylelintrc.json
│
├── src/                      theme source
│   ├── bootstra-html32.css   entry: banner comment + ordered @import list
│   └── _*.css                one partial per section (schemes, wallpapers, base, page,
│                             screen, buttons, forms, cards, tables, navigation, feedback,
│                             lists-overlays, furniture, responsive)
│
├── site/                     demo page (GitHub Pages)
│   ├── index.html            shows every component; the living documentation
│   └── demo.css              showcase-only helpers, never part of the theme
│
├── examples/starter.html     minimal page using the theme
├── scripts/build.mjs         build, watch, and local server
│
└── .github/
    ├── assets/               screenshots used by README
    └── workflows/            ci.yml, pages.yml, release.yml
```

Generated, never committed, never edited by hand: `dist/`, `_site/`, `node_modules/`.

Keep the structure compact. Do not create new top-level directories without a concrete reason.

## Build

- `npm run build` runs `scripts/build.mjs`: it inlines the `@import` partials into `dist/bootstra-html32.css` (formatting and comments preserved), minifies it into `dist/bootstra-html32.min.css` with Lightning CSS, and assembles `_site/` from `site/`, `examples/`, and `dist/`.
- The build injects the `package.json` version into the banner comment. Do not write the version into source files.
- `npm run dev` builds, watches `src/`, `site/`, and `examples/`, and serves `_site/` on `http://localhost:8080`.
- The demo and the starter link to `dist/bootstra-html32.css` by a relative path. GitHub Pages serves the site under `/bootstra-html32/`, so every link in `site/` and `examples/` must stay relative.

## Theme rules

### Contract with Bootstrap

- Bootstrap 5.3 is a peer dependency loaded before the theme. Never bundle, copy, vendor, or patch Bootstrap, and never load it twice.
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
- Development dependencies are `lightningcss`, `stylelint`, and `stylelint-config-recommended`. Add another only when the current task cannot be solved cleanly with them or with Node.js built-ins, and the benefit outweighs the maintenance cost.
- Do not upgrade or modernize dependencies or tooling unrelated to the current task.
- Keep `package-lock.json` committed and in sync; CI uses `npm ci`.

## Working on changes

Before editing:

1. read this file;
2. read the affected partials in `src/` and the related parts of `site/index.html`;
3. check how the change looks across schemes and wallpapers it affects.

During implementation:

- stay within the task scope and preserve working behaviour outside it;
- do not make unrelated refactors, reformat untouched code, or reorganize folders;
- reuse existing conventions before inventing new ones; if repeated code is genuinely obstructing the change, extract only the smallest useful shared part.

## Verification

Run checks appropriate to the change:

- `npm run lint` and `npm run build` for every change to `src/`, `site/`, `scripts/`, or `package.json` (`npm test` runs both).
- For visual changes, run `npm run dev` and check the affected components in the browser over HTTP: a desktop viewport, a narrow viewport, at least the `standard` scheme plus one contrasting scheme, and reduced motion when animation changed.
- For build or workflow changes, check the contents of `dist/` and `_site/` and `npm pack --dry-run`.

The final report states what was actually checked. Never claim a check passed that was not run.

## Versioning and releases

- Semantic Versioning, with `package.json` as the single source of truth (`package-lock.json` follows it). The version line started at `0.1.0`.
- While in `0.x`: **patch** for fixes and small visual corrections that keep the public API; **minor** for new components, schemes, wallpapers, or any breaking change to the public API (renamed or removed classes, variables, or scheme names). `1.0.0` is an explicit owner decision.
- Changes to documentation, the demo, CI, or tooling alone do not bump the version.
- Every user-visible change adds a line under `## Unreleased` in `CHANGELOG.md`. A release moves those lines under `## X.Y.Z — YYYY-MM-DD`.
- A minor release also updates the `@X.Y` version in the README CDN link.
- Release flow: `npm version <patch|minor>` creates the version commit and the `vX.Y.Z` tag; pushing the tag runs `release.yml`, which checks the tag against `package.json`, runs lint and build, publishes to npm through trusted publishing, and creates the GitHub Release.

## Git and publishing

These rules are mandatory.

- Agents may create local commits when a task is complete and verified. Commit messages are short, meaningful, and in English.
- Commit only files that belong to the current task; never include unrelated or pre-existing user changes.
- Agents may create a local `vX.Y.Z` tag (or run `npm version`) only when the user asks for a release.
- **Never run `git push`, push tags, or force-push.** The owner performs every remote push. A request to finish, release, or deploy something is not permission to push.
- **Never run `npm publish`, `gh release create`, or trigger, approve, or re-run workflows.** Publishing happens only through `release.yml` after the owner pushes a tag.
- Do not rewrite shared history, amend pushed commits, or delete branches or tags unless explicitly instructed.
- If a task cannot be fully completed or verified, do not create a misleading "done" commit or tag; leave the working tree in a safe state and report what remains.

## Security

- Never commit secrets, tokens, or credentials. npm publishing uses OIDC trusted publishing and needs no token.
- The demo makes only two third-party requests: Bootstrap from jsDelivr and the visitor counter badge from `88x31.lol` (a plain image, no JavaScript or cookies). Do not add analytics, tracking, or other third-party requests.

## Non-goals

Unless the owner explicitly changes scope, this project is not:

- a Bootstrap fork or a rebuilt Bootstrap with custom Sass variables;
- a JavaScript component library;
- an icon set, font package, or image asset pack;
- a framework integration (Vue, React, or similar wrappers);
- a theme generator or configurator beyond the two-variable schemes.
