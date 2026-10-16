# AGENTS.md

This file is the single source of truth for working on this repository as a whole. Read it before making any change and follow it. If a repository-wide rule changes, change it here; other files only point to this one.

Every package also has its own `packages/<slug>/AGENTS.md`. **Before touching a package, read its `AGENTS.md` as well.** Package rules govern that package only; this file governs everything shared.

## Repository overview

This repository is a small collection of Bootstrap 5 themes managed as an npm-workspaces monorepo. Each theme is an autonomous package with its own source, build, demo, documentation, changelog, version, and npm name.

| Package | Folder | npm name | Rules |
| --- | --- | --- | --- |
| bootstra-html32 | `packages/bootstra-html32/` | `bootstra-html32` | [`packages/bootstra-html32/AGENTS.md`](packages/bootstra-html32/AGENTS.md) |

The root is private and is never published. It only wires the workspaces together and holds shared CI and documentation.

## Package boundaries

Shared infrastructure does not mean shared visual foundations.

- Each package owns its source, build script, tooling configuration, demo, README, CHANGELOG, LICENSE, and version. A change to one package must not silently change another.
- Do not import files from another package, and do not create a shared visual core (tokens, base CSS, mixins) across themes.
- A package's own rules (for example HTML32's CSS-only build, `nv-` prefix, Sass prohibition, and demo layout) apply to that package only. **Never impose them on another theme.** Each theme keeps its own build system, naming, preprocessors, and public CSS API.
- Move code to the root only when at least two packages genuinely need it and the owner agrees.

## Language

- Use English throughout the repository: code, comments, identifiers, documentation, commit messages, changelogs, demo copy, and workflow names.
- Keep terminology consistent with the surrounding text when editing.

## Development principles

Follow **KISS, DRY, and YAGNI**. Build the smallest solution that fully solves the current task.

- Prefer the simplest readable implementation.
- Do not add abstractions, dependencies, configuration, tooling, or features for hypothetical future needs.
- Root-level scripts are plain ES modules using Node.js built-in APIs; plain functions are the default.

Decision rule: when several approaches satisfy the task, choose the one with fewer moving parts, fewer dependencies, and the code a developer opening the repository later will understand fastest.

## Repository structure

```text
/
├── AGENTS.md                 this file (repository-wide rules)
├── CLAUDE.md                 pointer to AGENTS.md
├── README.md                 collection overview (not per-theme docs)
├── LICENSE
├── package.json              private workspace root, root scripts
├── package-lock.json         the single lockfile for all workspaces
├── docs/
│   └── ADDING_A_THEME.md     agent checklist for adding a theme
├── packages/
│   └── <slug>/               one theme package each, with its own AGENTS.md
├── incoming/                 staging area for themes to add (git-ignored)
└── .github/workflows/        ci.yml, pages.yml, release.yml
```

Generated, never committed, never edited by hand: `node_modules/` and each package's own build output (for HTML32: `dist/`, `_site/`).

Keep the structure compact. Do not create new top-level directories without a concrete reason.

## Workspace commands

Run from the repository root:

| Command | What it does |
| --- | --- |
| `npm ci` | Install every workspace from the root lockfile |
| `npm run build` | `build` in every package that has one |
| `npm run lint` | `lint` in every package that has one |
| `npm test` | `test` in every package that has one |
| `npm run dev` | Dev server of `bootstra-html32` (the only demo until the collection showcase exists) |
| `npm run <script> --workspace <name>` | Run one package's script |
| `npm pack --workspaces --dry-run` | Show what each package would publish |

Every package must provide `build`, `lint`, and `test` scripts (`test` may simply run lint and build) so the root scripts and CI cover it.

## Dependencies

- Dependencies are declared in the package that uses them. The root `package.json` has no dependencies.
- Keep exactly one `package-lock.json`, at the root, committed and in sync; CI uses `npm ci`. Do not commit package-level lockfiles.
- When editing the lockfile, update it incrementally with `npm install`; do not delete and regenerate it, which can drop platform-specific optional dependencies.
- Do not upgrade or modernize dependencies or tooling unrelated to the current task.

## Package metadata for the collection

Every theme package declares a small `themeCollection` field in its own `package.json`. It is the only registry: tooling discovers themes by reading `packages/*/package.json`, so never keep a separate hand-maintained list of themes.

```json
"themeCollection": {
  "id": "bootstra-html32",
  "name": "HTML32",
  "description": "Mid-90s web pages and desktop UI chrome: outset buttons, navy title bars, tiled wallpapers."
}
```

- `id`: stable, lowercase, URL-safe slug, equal to the package folder name. It will be used in URLs; never change it once released.
- `name`: short display name.
- `description`: one sentence, plain text.

Do not add more fields until a feature needs them.

## Adding a theme

The owner adds a theme by placing it in `incoming/<slug>/` (or giving a local path or repository URL) and asking an agent to "add this theme to the collection". Follow [`docs/ADDING_A_THEME.md`](docs/ADDING_A_THEME.md) step by step.

## Working on changes

Before editing:

1. read this file and the `AGENTS.md` of every package you will touch;
2. read the affected files;
3. for visual changes, check how the result looks in the affected package's demo.

During implementation:

- stay within the task scope and the affected package; preserve working behaviour outside it;
- do not make unrelated refactors, reformat untouched code, or reorganize folders;
- reuse existing conventions before inventing new ones.

## Verification

- `npm test` at the root for every change to a package, a root script, `package.json`, or the lockfile.
- Package-specific checks (visual review, pack contents) as listed in that package's `AGENTS.md`.
- For workflow or workspace changes: `npm ci`, the root scripts, and `npm pack --workspaces --dry-run`.

The final report states what was actually checked. Never claim a check passed that was not run.

## Versioning and releases

- Each package is versioned independently with Semantic Versioning; its own `package.json` is the source of truth and its own `CHANGELOG.md` records its changes. Follow the package's `AGENTS.md` for bump rules.
- Repository-only changes (root docs, CI, workspace tooling) do not bump any package version.
- The root package is `private` and must never be published.
- Until per-package release automation exists, `release.yml` publishes **only** `bootstra-html32`, and a `vX.Y.Z` tag always refers to that package. Do not create `v*` tags for other packages.

## Git and publishing

These rules are mandatory.

- Agents may create local commits when a task is complete and verified. Commit messages are short, meaningful, and in English.
- Commit only files that belong to the current task; never include unrelated or pre-existing user changes, and never commit the contents of `incoming/`.
- Agents may create a local tag (or run `npm version`) only when the user asks for a release.
- **Never run `git push`, push tags, or force-push.** The owner performs every remote push. A request to finish, release, or deploy something is not permission to push.
- **Never run `npm publish`, `gh release create`, or trigger, approve, or re-run workflows.** Publishing happens only through `release.yml` after the owner pushes a tag.
- Do not rewrite shared history, amend pushed commits, or delete branches or tags unless explicitly instructed.
- If a task cannot be fully completed or verified, do not create a misleading "done" commit or tag; leave the working tree in a safe state and report what remains.

## Security

- Never commit secrets, tokens, or credentials. npm publishing uses OIDC trusted publishing and needs no token.
- Demos must not add analytics or tracking. Each package's `AGENTS.md` lists the third-party requests its demo is allowed to make.

## Non-goals

Unless the owner explicitly changes scope, this repository is not:

- a shared theme runtime, theme switcher, or common visual CSS core;
- a theme generator or configurator;
- a fork of Bootstrap. Themes get Bootstrap from npm (as a peer dependency, or as a dependency when a Sass theme compiles Bootstrap's source); never copy Bootstrap's files into the repository.
