// Release checks for workspace packages, used by .github/workflows/release.yml.
// A release tag is `<npm name>@<X.Y.Z>`, e.g. `bootstra-html32@0.1.1` or `@scope/theme@1.0.0`.
//
//   node scripts/release.mjs check  <tag>   validate the tag against the workspace packages
//   node scripts/release.mjs notes  <tag>   print the package's CHANGELOG section for that version
//   node scripts/release.mjs assets <tag>   check the packed files (after a build), print CSS files to attach

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TAG = /^((?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*)@(\d+\.\d+\.\d+)$/;
const NPM_REGISTRY = /^https:\/\/registry\.npmjs\.org\/?$/;

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const toPosix = (p) => p.split(path.sep).join('/');

export function parseTag(tag = '') {
  const match = TAG.exec(tag);
  if (!match) throw new Error(`Tag "${tag}" is not <package-name>@<X.Y.Z>`);
  return { name: match[1], version: match[2] };
}

// "owner/repo" from a package.json `repository` field.
function repoSlug(pkg) {
  const url = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url ?? '';
  return url.match(/github\.com[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/)?.[1] ?? '';
}

// Package folders matched by the root `workspaces` globs (only `dir/*` is supported).
export function listWorkspaces(root) {
  const { workspaces = [] } = readJson(path.join(root, 'package.json'));
  return workspaces.flatMap((pattern) => {
    if (!pattern.endsWith('/*')) throw new Error(`Unsupported workspace pattern "${pattern}"`);
    const parent = path.join(root, pattern.slice(0, -2));
    if (!fs.existsSync(parent)) return [];
    return fs.readdirSync(parent, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(parent, d.name, 'package.json')))
      .map((d) => path.join(parent, d.name));
  });
}

export function checkTag(root, tag) {
  const { name, version } = parseTag(tag);
  const rootPkg = readJson(path.join(root, 'package.json'));
  if (rootPkg.private !== true) throw new Error('The root package.json must be "private": true');

  const matches = listWorkspaces(root).filter((dir) => readJson(path.join(dir, 'package.json')).name === name);
  if (matches.length === 0) throw new Error(`No workspace package is named "${name}"`);
  if (matches.length > 1) throw new Error(`Several workspace packages are named "${name}"`);

  const dir = toPosix(path.relative(root, matches[0]));
  const pkg = readJson(path.join(matches[0], 'package.json'));
  if (pkg.private) throw new Error(`${name} is private and cannot be published`);
  if (pkg.version !== version) throw new Error(`Tag ${tag} does not match ${name} version ${pkg.version}`);
  const registry = pkg.publishConfig?.registry;
  if (registry && !NPM_REGISTRY.test(registry)) throw new Error(`${name} publishes to ${registry}, expected the npm registry`);
  if (!repoSlug(rootPkg) || repoSlug(pkg) !== repoSlug(rootPkg)) {
    throw new Error(`${name} repository.url must point to github.com/${repoSlug(rootPkg)} (required for provenance)`);
  }
  if (pkg.repository?.directory !== dir) throw new Error(`${name} repository.directory must be "${dir}"`);

  return { name, version, dir };
}

// The `## X.Y.Z` section of CHANGELOG.md, without its heading.
export function releaseNotes(root, tag) {
  const { version, dir } = checkTag(root, tag);
  const file = path.join(root, dir, 'CHANGELOG.md');
  const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/) : [];
  const start = lines.findIndex((line) => line.startsWith('## ') && line.split(/\s+/)[1] === version);
  if (start === -1) throw new Error(`${dir}/CHANGELOG.md has no "## ${version}" section`);
  const end = lines.findIndex((line, i) => i > start && line.startsWith('## '));
  const notes = lines.slice(start + 1, end === -1 ? undefined : end).join('\n').trim();
  if (!notes) throw new Error(`${dir}/CHANGELOG.md section "## ${version}" is empty`);
  return notes;
}

// Checks what `npm pack` would publish and returns the CSS files to attach to the GitHub Release.
export function releaseAssets(root, tag) {
  const { name, version, dir } = checkTag(root, tag);
  const out = execSync('npm pack --dry-run --json --ignore-scripts', {
    cwd: path.join(root, dir), encoding: 'utf8',
  });
  const [info] = JSON.parse(out);
  if (info.name !== name || info.version !== version) {
    throw new Error(`npm pack in ${dir} produced ${info.name}@${info.version}, expected ${name}@${version}`);
  }
  const files = info.files.map((f) => f.path);
  const pkg = readJson(path.join(root, dir, 'package.json'));
  for (const entry of [pkg.style, pkg.main].filter(Boolean)) {
    const file = entry.replace(/^\.\//, '');
    if (!files.includes(file)) throw new Error(`${name} declares ${file} but the package does not contain it (build first)`);
  }
  const css = files.filter((f) => f.endsWith('.css'));
  if (css.length === 0) throw new Error(`${name} package contains no CSS files`);
  return css.map((f) => `${dir}/${f}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const [command, tag] = process.argv.slice(2);
  try {
    if (command === 'check') {
      const target = checkTag(root, tag);
      console.log(`${target.name}@${target.version} (${target.dir}): OK`);
      if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `name=${target.name}\nversion=${target.version}\ndir=${target.dir}\n`);
      }
    } else if (command === 'notes') {
      console.log(releaseNotes(root, tag));
    } else if (command === 'assets') {
      console.log(releaseAssets(root, tag).join('\n'));
    } else {
      throw new Error('Usage: node scripts/release.mjs <check|notes|assets> <name>@<X.Y.Z>');
    }
  } catch (err) {
    console.error(`${process.env.GITHUB_ACTIONS ? '::error::' : ''}${err.message}`);
    process.exit(1);
  }
}
