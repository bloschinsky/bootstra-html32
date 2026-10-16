// Tests for scripts/release.mjs. Run with `node --test scripts/release.test.mjs` (part of `npm test`).

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkTag, parseTag, releaseAssets, releaseNotes } from './release.mjs';
import { listWorkspaces } from './workspaces.mjs';

const REPO = { type: 'git', url: 'git+https://github.com/owner/themes.git' };

// A temporary workspace: { 'theme-a': { package.json fields, changelog } }.
function fixture(packages, rootFields = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-test-'));
  const write = (file, data) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data));
  };
  write(path.join(root, 'package.json'), { name: 'root', private: true, workspaces: ['packages/*'], repository: REPO, ...rootFields });
  for (const [slug, { changelog, ...fields }] of Object.entries(packages)) {
    write(path.join(root, 'packages', slug, 'package.json'), {
      name: slug, version: '1.0.0', repository: { ...REPO, directory: `packages/${slug}` }, ...fields,
    });
    if (changelog) write(path.join(root, 'packages', slug, 'CHANGELOG.md'), changelog);
  }
  return root;
}

test('parseTag accepts <name>@<X.Y.Z>, including scoped names', () => {
  assert.deepEqual(parseTag('bootstra-html32@0.1.1'), { name: 'bootstra-html32', version: '0.1.1' });
  assert.deepEqual(parseTag('@scope/theme@1.0.0'), { name: '@scope/theme', version: '1.0.0' });
});

test('parseTag rejects malformed tags', () => {
  for (const tag of ['', 'v0.1.0', 'bootstra-html32', 'bootstra-html32@v0.1.0', 'bootstra-html32@0.1',
    'bootstra-html32@0.1.0-beta.1', 'Bootstra@1.0.0', '@1.0.0', 'a@b@1.0.0', 'theme@1.0.0 ', '@scope@1.0.0']) {
    assert.throws(() => parseTag(tag), /is not <package-name>@<X.Y.Z>/, tag);
  }
});

test('checkTag resolves the one matching package', () => {
  const root = fixture({ 'theme-a': {}, 'theme-b': { version: '2.0.0' } });
  assert.deepEqual(checkTag(root, 'theme-a@1.0.0'), { name: 'theme-a', version: '1.0.0', dir: 'packages/theme-a' });
  assert.equal(listWorkspaces(root).length, 2);
});

test('checkTag ignores the versions of other packages', () => {
  // theme-b is unchanged and unreleased; releasing theme-a must not need it.
  const root = fixture({ 'theme-a': { version: '1.1.0' }, 'theme-b': { version: '0.0.0', private: true } });
  assert.equal(checkTag(root, 'theme-a@1.1.0').name, 'theme-a');
  assert.throws(() => checkTag(root, 'theme-a@1.0.0'), /does not match theme-a version 1.1.0/);
});

test('checkTag fails safely on a bad target', () => {
  const cases = [
    [fixture({ 'theme-a': {} }), 'theme-x@1.0.0', /No workspace package is named "theme-x"/],
    [fixture({ 'theme-a': {} }), 'theme-a@1.0.1', /does not match theme-a version 1.0.0/],
    [fixture({ 'theme-a': { private: true } }), 'theme-a@1.0.0', /is private/],
    [fixture({ 'theme-a': {}, copy: { name: 'theme-a' } }), 'theme-a@1.0.0', /Several workspace packages/],
    [fixture({ 'theme-a': {} }, { private: false }), 'theme-a@1.0.0', /root package.json must be "private": true/],
    [fixture({ 'theme-a': { publishConfig: { registry: 'https://npm.example.com/' } } }), 'theme-a@1.0.0', /expected the npm registry/],
    [fixture({ 'theme-a': { repository: { url: 'https://github.com/someone/else.git', directory: 'packages/theme-a' } } }), 'theme-a@1.0.0', /repository.url must point/],
    [fixture({ 'theme-a': { repository: REPO } }), 'theme-a@1.0.0', /repository.directory must be "packages\/theme-a"/],
    [fixture({ 'theme-a': {} }, { version: '1.0.0' }), 'root@1.0.0', /No workspace package is named "root"/],
  ];
  for (const [root, tag, error] of cases) assert.throws(() => checkTag(root, tag), error, tag);
});

test('releaseNotes returns only the section for the version', () => {
  const changelog = '# Changelog\n\n## Unreleased\n\n- Next\n\n## 1.0.0 — 2026-10-16\n\n- Fixed\n- Added\n\n## 0.9.0 — 2026-09-01\n\n- Old\n';
  const root = fixture({ 'theme-a': { changelog } });
  assert.equal(releaseNotes(root, 'theme-a@1.0.0'), '- Fixed\n- Added');
});

test('releaseNotes fails when the section is missing or empty', () => {
  assert.throws(() => releaseNotes(fixture({ 'theme-a': {} }), 'theme-a@1.0.0'), /no "## 1.0.0" section/);
  const root = fixture({ 'theme-a': { changelog: '## Unreleased\n\n- Next\n\n## 1.0.0\n\n## 0.9.0\n\n- Old\n' } });
  assert.throws(() => releaseNotes(root, 'theme-a@1.0.0'), /section "## 1.0.0" is empty/);
  assert.throws(() => releaseNotes(fixture({ 'theme-a': { changelog: '## 1.0.0.1\n\n- x\n' } }), 'theme-a@1.0.0'), /no "## 1.0.0" section/);
});

test('releaseAssets requires the declared entry file', () => {
  const root = fixture({ 'theme-a': { style: 'dist/theme-a.css', files: ['dist/'] } });
  assert.throws(() => releaseAssets(root, 'theme-a@1.0.0'), /does not contain it/);
  fs.mkdirSync(path.join(root, 'packages/theme-a/dist'));
  fs.writeFileSync(path.join(root, 'packages/theme-a/dist/theme-a.css'), 'a{}');
  assert.deepEqual(releaseAssets(root, 'theme-a@1.0.0'), ['packages/theme-a/dist/theme-a.css']);
});

// Every publishable package in this repository is releasable at its current version.
// Runs after the workspace builds in `npm test`, so the packed files exist.
test('workspace packages are release-ready', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  for (const dir of listWorkspaces(root)) {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    if (pkg.private) continue;
    const tag = `${pkg.name}@${pkg.version}`;
    assert.equal(checkTag(root, tag).name, pkg.name);
    assert.ok(releaseAssets(root, tag).length > 0, tag);
  }
});
