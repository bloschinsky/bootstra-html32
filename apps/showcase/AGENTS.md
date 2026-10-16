# AGENTS.md — showcase

Rules for `apps/showcase/`, the collection site published to GitHub Pages. The repository-wide rules in the root [`AGENTS.md`](../../AGENTS.md) apply too; read both.

## What it is

A static gallery of every theme in the repository: one card per theme (preview, description, version, install snippets, links), plus each theme's own demo copied to `themes/<id>/`. It is private and never published to npm.

```text
apps/showcase/
├── build.mjs         discovery, validation, page rendering, local server
├── build.test.mjs    tests (node:test)
├── src/
│   ├── style.css     the gallery's own styles
│   └── copy.js       copy buttons for install snippets
└── _site/            build output, deployed by pages.yml (not committed)
```

## Rules

- **Neutral by design.** The gallery has its own plain look so each theme speaks for itself. Never load Bootstrap or any theme CSS into the gallery page, and never borrow a theme's visual style for it.
- **Isolation.** Each theme demo is a separate document under `themes/<id>/`. Never render two themes in the same DOM, and never modify a theme's demo files while copying them.
- **No theme-specific code.** Everything about a theme comes from its `package.json` (`themeCollection` and standard fields; see the root `AGENTS.md`). Adding a theme must not require any edit here. If a theme needs something the contract cannot express, extend the contract minimally, validate it in `collectThemes`, and document it in the root `AGENTS.md`.
- **Relative URLs only.** The site is served under `/bootstra-html32/` on GitHub Pages. Every link and asset in generated HTML is relative; the tests reject root-relative (`/…`) URLs.
- **Static and private.** Plain HTML, CSS, and a few lines of JavaScript. No framework, bundler, analytics, tracking, or runtime requests to remote APIs. External links (npm, GitHub, jsDelivr in snippets) are plain links or text.
- **Accessible.** Keep the skip link, visible focus, labelled controls, meaningful headings, the `aria-live` copy status, `prefers-color-scheme` support, and `prefers-reduced-motion`. The layout must work at 375 px width without horizontal scrolling.

## Build and checks

- `npm run build` (in this folder, or the root `npm run build`, which builds the themes first) writes `_site/`. It fails with an actionable message if a theme's metadata is invalid or its demo has not been built.
- `npm run serve` builds and serves `_site/` at `http://localhost:8090/bootstra-html32/`, the same base path as GitHub Pages; anything outside it returns 404.
- `npm test` runs stylelint, the build, and `build.test.mjs`.
- For visual changes, check the gallery and at least one theme demo through `npm run serve` at desktop and narrow widths, with the keyboard, and in light and dark mode.
