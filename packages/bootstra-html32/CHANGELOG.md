# Changelog

## Unreleased

- Theme source moved to `src/` and split into partials; `dist/` is now built by `npm run build` (readable + minified) and is no longer committed.
- Demo page moved to `site/` and deployed to GitHub Pages by GitHub Actions.
- CI workflow runs stylelint and the build on every push and pull request.
- The repository is now a monorepo of themes; this package lives in `packages/bootstra-html32/`. The unbuilt-source CDN URL changed to `…/bootstra-html32@master/packages/bootstra-html32/src/bootstra-html32.css`. The npm package, its files, and the demo URL are unchanged.
- The demo moved to <https://bloschinsky.github.io/bootstra-html32/themes/bootstra-html32/>; the old address is now the theme collection page. The "latest build" CSS moved from `…/bootstra-html32/dist/` to `…/bootstra-html32/themes/bootstra-html32/dist/`, and the starter to `…/themes/bootstra-html32/examples/starter.html`. The old CSS URLs no longer resolve. `homepage` in `package.json` points to the new demo address.
- Releases are now tagged `bootstra-html32@X.Y.Z` (previously `vX.Y.Z`), and GitHub Releases are titled `bootstra-html32 X.Y.Z`.

## 0.1.0 — 2026-10-02

First public release.

- Bootstrap 5.3 theme: buttons, forms, cards, tables, tabs, pills, navbar, dropdowns, breadcrumbs, pagination, alerts, badges, progress, toasts, tooltips, popovers, list groups, accordion, modals, offcanvas.
- 11 colour schemes driven by two variables (`--nv-face`, `--nv-title`).
- 8 repeating wallpaper tiles.
- 90s furniture: masthead, marquee ticker, screen shell with HUD, D-pad, LED toggles, terminal blocks, meters, visitor counter, 88×31 buttons, under-construction strip.
- Demo page (`index.html`) and a minimal starter template.
