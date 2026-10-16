// Tests for build.mjs. Run with `npm test` in this folder (after the theme packages are built).

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildSite, collectThemes } from './build.mjs';

const REPO = { type: 'git', url: 'git+https://github.com/owner/themes.git' };
const META = (id) => ({ id, name: `Theme ${id}`, description: `The ${id} theme.` });

// A temporary workspace. `packages` maps folder names to package.json fields; `files` maps paths to contents.
function fixture(packages, files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showcase-test-'));
  const write = (file, data) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), typeof data === 'string' ? data : JSON.stringify(data));
  };
  write('package.json', { name: 'root', private: true, workspaces: ['packages/*', 'apps/*'], repository: REPO });
  for (const [dir, fields] of Object.entries(packages)) {
    write(`${dir}/package.json`, { name: path.basename(dir), version: '1.2.3', ...fields });
  }
  for (const [file, data] of Object.entries(files)) write(file, data);
  return root;
}

test('collectThemes reads themeCollection entries and skips other packages', () => {
  const root = fixture({
    'packages/zeta': { themeCollection: META('zeta'), style: 'dist/zeta.css', peerDependencies: { bootstrap: '^5.3.0' } },
    'packages/alpha': { themeCollection: { ...META('alpha'), name: 'Alpha' }, private: true },
    'apps/site': { private: true },
  }, { 'packages/zeta/dist/zeta.css': '', 'packages/zeta/dist/zeta.min.css': '' });
  const themes = collectThemes(root);
  assert.deepEqual(themes.map((t) => t.id), ['alpha', 'zeta']);
  const zeta = themes[1];
  assert.equal(zeta.cdnFile, 'dist/zeta.min.css');
  assert.equal(zeta.bootstrap, '^5.3.0');
  assert.equal(zeta.docsUrl, 'https://github.com/owner/themes/tree/HEAD/packages/zeta#readme');
  assert.equal(themes[0].publishable, false);
});

test('collectThemes rejects bad metadata with the file name', () => {
  const cases = [
    [{ themeCollection: 'zeta' }, /packages\/zeta\/package.json: themeCollection must be an object/],
    [{ themeCollection: { ...META('zeta'), url: 'x' } }, /unknown themeCollection field\(s\): url/],
    [{ themeCollection: { ...META('zeta'), id: 'Zeta Theme' } }, /id must be a lowercase slug/],
    [{ themeCollection: META('other') }, /id "other" must equal the folder name "zeta"/],
    [{ themeCollection: { ...META('zeta'), name: ' ' } }, /themeCollection.name is required/],
    [{ themeCollection: { id: 'zeta', name: 'Zeta' } }, /themeCollection.description is required/],
    [{ themeCollection: { ...META('zeta'), demo: '_site' } }, /demo "_site" does not exist \(run `npm run build --workspace zeta` first\?\)/],
    [{ themeCollection: { ...META('zeta'), demo: '../other' } }, /demo "..\/other" points outside the package/],
    [{ themeCollection: { ...META('zeta'), demo: '/tmp' } }, /demo must be a relative path/],
    [{ themeCollection: { ...META('zeta'), demo: 'empty' } }, /demo "empty" has no index.html/],
    [{ themeCollection: { ...META('zeta'), preview: 'notes.txt' } }, /preview must be an image file/],
  ];
  for (const [fields, error] of cases) {
    const root = fixture({ 'packages/zeta': fields }, { 'packages/zeta/empty/.keep': '', 'packages/zeta/notes.txt': '' });
    assert.throws(() => collectThemes(root), error);
  }
});

test('collectThemes rejects duplicate ids and an empty collection', () => {
  const root = fixture({ 'packages/zeta': { themeCollection: META('zeta') }, 'apps/zeta': { themeCollection: META('zeta') } });
  assert.throws(() => collectThemes(root), /id "zeta" is already used by (apps|packages)\/zeta/);
  assert.throws(() => collectThemes(fixture({ 'packages/zeta': {} })), /No workspace package has a themeCollection field/);
});

test('buildSite copies each demo into its own folder and escapes metadata', () => {
  const root = fixture({
    'packages/zeta': { themeCollection: { ...META('zeta'), name: 'Zeta <b>', demo: 'site', preview: 'shot.png' }, style: 'zeta.css' },
    'packages/beta': { themeCollection: META('beta') },
  }, {
    'packages/zeta/site/index.html': '<link rel="stylesheet" href="zeta.css">',
    'packages/zeta/site/zeta.css': 'body{}',
    'packages/zeta/zeta.css': 'body{}',
    'packages/zeta/shot.png': 'png',
  });
  const site = path.join(root, '_site');
  buildSite(root, site);
  assert.ok(fs.existsSync(path.join(site, 'themes/zeta/index.html')));
  assert.ok(fs.existsSync(path.join(site, 'themes/zeta/zeta.css')));
  assert.ok(fs.existsSync(path.join(site, 'previews/zeta.png')));
  assert.ok(!fs.existsSync(path.join(site, 'themes/beta')));
  const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
  assert.match(html, /Zeta &lt;b&gt;/);
  assert.match(html, /href="themes\/zeta\/"/);
  assert.match(html, /npm install zeta</);
  assert.match(html, /cdn.jsdelivr.net\/npm\/zeta@1.2\/zeta.css/);
  assert.match(html, /Demo coming soon/);
  assert.doesNotMatch(html, /(href|src)="\//, 'all site links must be relative');
});

// The real collection: every theme package is listed with its demo and its exact npm name.
test('the repository builds a site with every theme', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const site = fs.mkdtempSync(path.join(os.tmpdir(), 'showcase-site-'));
  const themes = buildSite(root, site);
  const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
  for (const t of themes) {
    assert.match(html, new RegExp(`id="${t.id}"`));
    if (t.demo) assert.ok(fs.existsSync(path.join(site, 'themes', t.id, 'index.html')), t.id);
    if (t.publishable) assert.ok(html.includes(`npm install ${t.bootstrap ? 'bootstrap ' : ''}${t.packageName}<`), t.id);
  }
  assert.doesNotMatch(html, /(href|src)="\//, 'all site links must be relative');
});
