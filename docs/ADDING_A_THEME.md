# Adding a theme to the collection

This is the checklist an agent follows when the owner asks to add an existing, finished Bootstrap 5 theme to this repository. It turns the theme into a new workspace package without changing the theme's design or any other package.

Read the root [`AGENTS.md`](../AGENTS.md) first. Its Git and publishing rules apply throughout: **no push, no tag, no `npm publish`, no workflow runs.**

## Owner workflow

1. Copy the finished theme into `incoming/<slug>/`, where `<slug>` is a lowercase, URL-safe name such as `bootstra-neon`. The `incoming/` folder is git-ignored. Alternatively, give the agent a local folder path or a repository URL.
2. Ask the agent, for example:

   > Add the theme in `incoming/bootstra-neon/` to the collection. Follow `docs/ADDING_A_THEME.md`. Publish it to npm as `bootstra-neon`, display name "Neon".

3. Review the agent's report and local commit, then push yourself when satisfied.

Anything the prompt leaves open (npm name, display name, licence questions) is either derived from the theme's own files or asked of the owner. It is never guessed in a way that affects publishing.

## Ground rules

- **Integrate, do not redesign.** Keep the theme's own build system (plain CSS, Sass, PostCSS, or other), file layout, naming prefix, public CSS API, demo, and visual tokens. Change only what is needed to run inside the workspace.
- **Do not apply another package's rules.** HTML32's CSS-only build, `nv-` prefix, Sass prohibition, `color-mix()` schemes, wallpapers, and demo layout belong to HTML32 alone. Do not copy them into the new theme, and do not copy the new theme's conventions into HTML32.
- **Do not touch other packages.** Adding a theme may change root files (README, AGENTS table, lockfile) but never another package's source, version, or changelog.
- **Do not publish.** The new package gets ready-to-release metadata; releasing it is a separate owner decision (per-package release automation does not exist yet, and `release.yml` publishes only `bootstra-html32`).

## Checklist

### 1. Inspect the incoming theme

- [ ] List its files. Identify the source, build tool, output files, demo or example pages, assets (fonts, images, icons), and any `package.json`.
- [ ] Read its README, licence, and changelog if present.
- [ ] Find how it consumes Bootstrap: loaded before the theme as plain CSS (peer dependency), or compiled from Bootstrap's Sass source. Note the Bootstrap version range.
- [ ] Build it as it is, before changing anything, and keep the output for comparison in step 6.

### 2. Check the licence and ownership

- [ ] The theme must have a licence that allows redistribution (the repository is MIT). Keep the theme's own `LICENSE` file in its package.
- [ ] Third-party assets (fonts, images, icon sets) must have compatible licences; keep their notices.
- [ ] If the licence is missing, unclear, or incompatible, **stop and ask the owner**. Do not add a licence on the author's behalf.

### 3. Choose the identity

- [ ] **Slug**: lowercase, URL-safe, used for the folder `packages/<slug>/` and `themeCollection.id`. Use the staging folder name unless the owner says otherwise.
- [ ] **npm name**: from the prompt, else from the theme's own `package.json`. If neither exists, ask the owner.
- [ ] **Collisions**: if the slug, npm name, or CSS prefix collides with an existing package, or the npm name is already taken on the registry by someone else (`npm view <name>` is a read-only check), stop and ask the owner. Never rename an existing package to make room.
- [ ] **Version**: keep the theme's existing version. If it has none, start at `0.1.0`.

### 4. Create the package

- [ ] Move the theme into `packages/<slug>/`, preserving its internal layout.
- [ ] Create or complete `packages/<slug>/package.json`:
  - `name`, `version`, `description`, `license`, `author`;
  - `repository` with `"directory": "packages/<slug>"`, plus `homepage` and `bugs`;
  - `files` listing only what users need (built CSS, licence, README); check it with `npm pack --dry-run`;
  - `style` / `main` pointing to the main built CSS file;
  - Bootstrap as a `peerDependency` when the theme loads after Bootstrap's CSS, or as a dependency or devDependency when it compiles Bootstrap's Sass. Never copy Bootstrap files into the package;
  - the theme's own build tools as `devDependencies`;
  - `build`, `lint`, and `test` scripts (add a minimal `lint` that fits the theme's language if it has none; `test` may be `npm run lint && npm run build`), and `dev` if it has a demo server;
  - the `themeCollection` field described in the root `AGENTS.md` (`id`, `name`, `description`).
- [ ] Add a package `.gitignore` for the theme's build output. Do not commit generated files unless the theme's design requires it, and say so in the report if it does.
- [ ] Make every path in the build script, demo, and examples relative to the package folder.
- [ ] Run `npm install` at the root to link the workspace and update the single root lockfile. Delete any lockfile that came with the theme.

### 5. Documentation

- [ ] `packages/<slug>/README.md`: what the theme is, install (CDN, npm), how to include it after Bootstrap, its public classes and variables, browser support, licence. Keep the author's existing text where it is accurate.
- [ ] `packages/<slug>/CHANGELOG.md`: keep the existing history, or start one with an `## Unreleased` section.
- [ ] `packages/<slug>/AGENTS.md`: the rules for this theme, written from what the theme actually is (its build, naming prefix, source organization, accessibility and browser support, public API, verification, versioning). Use HTML32's `AGENTS.md` as a model for structure only, not for content. Add a `CLAUDE.md` pointer next to it.
- [ ] Root `README.md` and root `AGENTS.md`: add one row to the package tables. Do not copy per-theme documentation into root files.

### 6. Verify

- [ ] `npm ci`, then root `npm run build`, `npm run lint`, and `npm test` all pass, and `npm test --workspace <name>` passes on its own.
- [ ] The built CSS is functionally equivalent to the output saved in step 1 (expect only path or banner differences).
- [ ] `npm pack --workspace <name> --dry-run` lists only the package's own files.
- [ ] The demo or example page works over HTTP with Bootstrap loaded first: desktop and narrow viewports, Bootstrap's JavaScript components (dropdown, modal, tooltip) still behave.
- [ ] Other packages' build output is unchanged.

### 7. Site registration

- [ ] When the collection showcase exists, follow its documented registration step (it reads `themeCollection` from each package). Until then, the theme's own demo is built by its `build` script and is not deployed to GitHub Pages; mention this in the report.

### 8. Clean up and report

- [ ] Remove `incoming/<slug>/` once its contents are in `packages/<slug>/`, unless the owner asked to keep it.
- [ ] Create one local commit with only the new package and the root files it required (for example `Add bootstra-neon theme`). Do not tag, push, or publish.
- [ ] Report: the package name and folder, the checks that were actually run and their results, anything changed in the theme and why, open questions (licence, naming, missing assets), and the next steps for releasing it.

## Incomplete themes

If the theme does not build, is missing files it references (fonts, images, partials), or is clearly unfinished:

- do not invent missing assets or rewrite large parts of the design to make it work;
- fix only mechanical problems (paths, a missing script entry) and list each fix in the report;
- if it still cannot build, leave it in `incoming/`, make no commit, and report what is missing.
