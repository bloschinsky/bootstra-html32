# Releasing a theme

Every theme package is versioned and published on its own. A release is one Git tag that names one package and one version; the `release.yml` workflow validates it, publishes that package to npm with trusted publishing, and creates a GitHub Release for it. Nothing else is published.

Only the owner pushes tags. Agents may prepare a release (version bump, changelog, local commit and tag) when asked, but never push, publish, or run workflows. See the Git rules in [`AGENTS.md`](../AGENTS.md).

## Tags

A release tag is the package's npm name, `@`, and its exact version:

| Package | Tag |
| --- | --- |
| `bootstra-html32` version `0.1.1` | `bootstra-html32@0.1.1` |
| a future scoped package `@scope/theme` version `1.0.0` | `@scope/theme@1.0.0` |

Rules enforced by `scripts/release.mjs`:

- the version is plain `X.Y.Z` (no `v` prefix, no pre-release suffix);
- exactly one workspace package has that `name`; the root is not a workspace package, so it can never match;
- the package is not `private`, and its `version` equals the tag version;
- its `repository.url` points to this GitHub repository and `repository.directory` to its folder (npm provenance requires both);
- its `publishConfig.registry`, if set, is the public npm registry;
- its `CHANGELOG.md` has a non-empty `## X.Y.Z` section, which becomes the release notes;
- after the build, `npm pack` contains the files named in `style` / `main` and at least one CSS file.

The tag never selects a package by the root version, and other packages' versions are not read. Releasing one theme cannot publish or bump another.

Tags from before the monorepo (`v0.1.0`) belong to `bootstra-html32` and stay as they are. `v*` tags no longer trigger a release.

## Release steps

From the repository root, for package `<name>` in `packages/<slug>/`:

1. **Changelog.** In `packages/<slug>/CHANGELOG.md`, move the `## Unreleased` lines under a new `## X.Y.Z — YYYY-MM-DD` heading. Leave an empty `## Unreleased` above it.
2. **Version.** Choose `patch` or `minor` by the package's own rules (its `AGENTS.md`), then:

   ```sh
   npm version patch --workspace <name>   # updates packages/<slug>/package.json and package-lock.json
   ```

   Inside a workspace, `npm version` does not commit or tag.
3. **Package docs.** Update anything that names the version, such as a CDN link in the package README.
4. **Verify locally**, without publishing:

   ```sh
   npm test                                         # every package + release checks
   node scripts/release.mjs check  <name>@X.Y.Z     # tag ↔ package
   node scripts/release.mjs notes  <name>@X.Y.Z     # release notes preview
   node scripts/release.mjs assets <name>@X.Y.Z     # files attached to the GitHub Release
   npm pack --workspace <name> --dry-run            # exact npm contents
   ```

5. **Commit and tag** (an agent stops here):

   ```sh
   git commit -am "Release <name>@X.Y.Z"
   git tag <name>@X.Y.Z
   ```

6. **Push** (owner only): `git push origin master <name>@X.Y.Z`.

The workflow then runs: validate tag → extract notes → `npm ci` → `npm test --workspace <name>` → check pack contents → `npm publish --workspace <name>` → GitHub Release titled `<name> X.Y.Z` with the package's built CSS files (those next to its `style` / `main` file) attached.

CI and GitHub Pages run on pushes to `master` and are independent of releases. A release does not deploy the demo, and a demo deploy does not publish anything.

## Reruns and failures

Reruns are safe. If `<name>@X.Y.Z` is already on npm, the publish step is skipped (npm never overwrites a version) while validation and tests still run. If the GitHub Release already exists, it is left as it is.

| Failure | Cause and fix |
| --- | --- |
| `Tag "…" is not <package-name>@<X.Y.Z>` | Malformed tag. Delete the tag locally and remotely and create a correct one. |
| `No workspace package is named "…"` | Typo in the tag, or the package is not under `packages/`. |
| `Tag … does not match … version …` | The tag points to a commit before the version bump. Re-tag the release commit. |
| `… is private` | The package is not meant to be published. Remove `"private": true` only if the owner decides to publish it. |
| `repository.url must point …` / `repository.directory must be …` | Fix the package's `repository` field (see [Package metadata](#package-metadata)). |
| `CHANGELOG.md has no "## X.Y.Z" section` | Step 1 was skipped. Add the section, commit, re-tag. |
| `… does not contain it (build first)` | The build did not produce the `style` / `main` file, or `files` excludes it. |
| `npm test` fails | Fix on `master`, then move the tag to the fixed commit. |
| `npm publish` returns 404 / `ENEEDAUTH` / OIDC error | Trusted publishing is not configured for this package, or the workflow file name differs. See below. |
| `npm publish` returns 403 "cannot publish over" | The version already exists. Bump the version; never reuse one. |

To move a tag after a failed run that published nothing: `git tag -f <tag> <commit>`, `git push -f origin <tag>` (owner only). Never move a tag whose version is already on npm; release a new patch version instead.

## npm trusted publishing

Publishing uses npm [trusted publishing](https://docs.npmjs.com/trusted-publishers) (GitHub Actions OIDC). There is no npm token in the repository or its secrets, and provenance is attached automatically. Requirements: Node 24 and npm 11.5.1 or later in the workflow (it installs the latest npm), `id-token: write` on the release job, and (for provenance) a public GitHub repository.

Each package needs its own trusted publisher on npmjs.com. The owner sets it under **package → Settings → Trusted publishing → GitHub Actions**:

| Field | Value |
| --- | --- |
| Organization or user | `bloschinsky` |
| Repository | `bootstra-themes` |
| Workflow filename | `release.yml` |
| Environment name | *(empty)* |

Both `bootstra-html32` and `bootstra-code437` were set up when the repository was still called `bootstra-html32`. After the rename to `bootstra-themes`, the owner must edit the trusted publisher of **each** package and change **Repository** from `bootstra-html32` to `bootstra-themes` (owner `bloschinsky`, workflow `release.yml`, environment empty, as before). Until both are changed, a release tag fails at the publish step with an OIDC error. Do not publish a version just to test the change, and do not add an npm token as a workaround. Versions already on npm keep their old `repository` metadata; the new URLs appear from each package's next release. After setting it up, **Publishing access → Require two-factor authentication and disallow tokens** is recommended.

npm only allows a trusted publisher on a package that already exists. A new package's **first** version is therefore published once by the owner from a local machine (`npm login`, then `npm publish --workspace <name>` after `npm test`; scoped packages also need `--access public`). Push its tag afterwards so the GitHub Release is created; the workflow sees the version on npm and skips publishing. Every later version goes through the workflow.

## Package metadata

To be releasable, a package's `package.json` needs:

```json
{
  "name": "<npm name>",
  "version": "X.Y.Z",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/bloschinsky/bootstra-themes.git",
    "directory": "packages/<slug>"
  },
  "style": "dist/<file>.css",
  "files": ["dist/", "LICENSE", "README.md"],
  "scripts": { "build": "…", "lint": "…", "test": "…" }
}
```

plus a `CHANGELOG.md`. The root `npm test` checks every non-private package against these rules, so CI fails before a release could.

## Why not Changesets

[Changesets](https://github.com/changesets/changesets) solves coordinated releases: change files in every PR, a bot-maintained "Version Packages" PR, and version bumps that ripple through packages that depend on each other. These themes do not depend on each other, one owner decides when each is released, and each changelog is edited by hand. A tag per release plus a small, tested validation script (`scripts/release.mjs`, Node built-ins only) covers that with no new dependency, bot, or extra workflow. Reconsider if packages start depending on each other or several people release independently.
