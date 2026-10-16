// Builds the theme collection site (GitHub Pages) into _site/.
//
//   node build.mjs          _site/
//   node build.mjs --serve  build, then serve _site/ under the Pages base path on http://localhost:8090
//
// A workspace package appears in the collection when its package.json has a `themeCollection`
// field (see the root AGENTS.md). Theme packages must be built first: their demos are copied as is.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listWorkspaces, readJson, repoSlug } from '../../scripts/workspaces.mjs';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FIELDS = ['id', 'name', 'description', 'demo', 'preview'];
const PREVIEW_TYPES = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

const toPosix = (p) => p.split(path.sep).join('/');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Reads and validates every `themeCollection` entry. Errors name the file and the fix.
export function collectThemes(root) {
  const rootSlug = repoSlug(readJson(path.join(root, 'package.json')));
  const themes = [];

  for (const dir of listWorkspaces(root)) {
    const pkg = readJson(path.join(dir, 'package.json'));
    const meta = pkg.themeCollection;
    if (meta === undefined) continue;

    const rel = toPosix(path.relative(root, dir));
    const fail = (msg) => { throw new Error(`${rel}/package.json: ${msg}`); };
    const build = `run \`npm run build --workspace ${pkg.name}\` first`;

    // A file or folder inside the package.
    const inPackage = (field) => {
      const value = meta[field];
      if (typeof value !== 'string' || !value || path.isAbsolute(value)) fail(`themeCollection.${field} must be a relative path`);
      const full = path.resolve(dir, value);
      if (!full.startsWith(dir + path.sep)) fail(`themeCollection.${field} "${value}" points outside the package`);
      if (!fs.existsSync(full)) fail(`themeCollection.${field} "${value}" does not exist (${build}?)`);
      return full;
    };

    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) fail('themeCollection must be an object');
    const unknown = Object.keys(meta).filter((key) => !FIELDS.includes(key));
    if (unknown.length) fail(`unknown themeCollection field(s): ${unknown.join(', ')}`);
    if (typeof meta.id !== 'string' || !ID.test(meta.id)) fail('themeCollection.id must be a lowercase slug such as "my-theme"');
    if (meta.id !== path.basename(dir)) fail(`themeCollection.id "${meta.id}" must equal the folder name "${path.basename(dir)}"`);
    for (const field of ['name', 'description']) {
      if (typeof meta[field] !== 'string' || !meta[field].trim()) fail(`themeCollection.${field} is required`);
    }
    const twin = themes.find((t) => t.id === meta.id);
    if (twin) fail(`themeCollection.id "${meta.id}" is already used by ${twin.dir}`);

    let demo = null;
    if (meta.demo !== undefined) {
      demo = inPackage('demo');
      if (!fs.existsSync(path.join(demo, 'index.html'))) fail(`themeCollection.demo "${meta.demo}" has no index.html (${build})`);
    }
    let preview = null;
    if (meta.preview !== undefined) {
      preview = inPackage('preview');
      if (!fs.statSync(preview).isFile() || !PREVIEW_TYPES.includes(path.extname(preview).toLowerCase())) {
        fail(`themeCollection.preview must be an image file (${PREVIEW_TYPES.join(', ')})`);
      }
    }

    // CDN file: the minified sibling of `style` when the build produced one.
    let cdnFile = null;
    if (pkg.style) {
      const min = pkg.style.replace(/^\.\//, '').replace(/(?<!\.min)\.css$/, '.min.css');
      cdnFile = fs.existsSync(path.join(dir, min)) ? min : pkg.style.replace(/^\.\//, '');
    }
    const slug = repoSlug(pkg) || rootSlug;

    themes.push({
      id: meta.id,
      name: meta.name.trim(),
      description: meta.description.trim(),
      dir: rel,
      packageName: pkg.name,
      version: pkg.version,
      publishable: !pkg.private,
      bootstrap: pkg.peerDependencies?.bootstrap ?? null,
      cdnFile,
      docsUrl: slug ? `https://github.com/${slug}/tree/HEAD/${pkg.repository?.directory ?? rel}#readme` : null,
      demo,
      preview,
    });
  }

  if (themes.length === 0) throw new Error('No workspace package has a themeCollection field');
  return themes.sort((a, b) => a.name.localeCompare(b.name));
}

function installSnippets(t) {
  if (!t.publishable) return [];
  const snippets = [{ key: 'npm', label: 'npm', code: `npm install ${t.bootstrap ? 'bootstrap ' : ''}${t.packageName}` }];
  if (t.cdnFile && t.version) {
    const minor = t.version.split('.').slice(0, 2).join('.');
    const bootstrap = t.bootstrap?.match(/\d+\.\d+/)?.[0];
    const links = [];
    if (bootstrap) links.push(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@${bootstrap}/dist/css/bootstrap.min.css">`);
    links.push(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/${t.packageName}@${minor}/${t.cdnFile}">`);
    snippets.push({ key: 'cdn', label: 'CDN', code: links.join('\n') });
  }
  return snippets;
}

function renderCard(t) {
  const demoUrl = `themes/${t.id}/`;
  const image = t.previewUrl
    ? `<img src="${esc(t.previewUrl)}" alt="" loading="lazy" decoding="async">`
    : `<span class="preview-empty">No preview</span>`;
  const preview = t.demo
    ? `<a class="preview" href="${demoUrl}" tabindex="-1" aria-hidden="true">${image}</a>`
    : `<div class="preview">${image}</div>`;

  const actions = [
    t.demo ? `<a class="button button-primary" href="${demoUrl}">Open demo<span class="visually-hidden"> of ${esc(t.name)}</span></a>` : `<span class="muted">Demo coming soon</span>`,
    t.docsUrl ? `<a class="button" href="${esc(t.docsUrl)}">Docs<span class="visually-hidden"> for ${esc(t.name)}</span></a>` : '',
    t.publishable ? `<a class="button" href="https://www.npmjs.com/package/${esc(t.packageName)}">npm<span class="visually-hidden"> package ${esc(t.packageName)}</span></a>` : '',
  ].filter(Boolean).join('\n          ');

  const snippets = installSnippets(t);
  const install = snippets.length === 0 ? '' : `
        <h3>Install</h3>${t.bootstrap ? `
        <p class="note">Needs Bootstrap <code>${esc(t.bootstrap)}</code>, loaded before the theme.</p>` : ''}${snippets.map((s) => `
        <div class="snippet">
          <div class="snippet-head"><span>${s.label}</span><button type="button" class="copy" data-copy="${t.id}-${s.key}">Copy<span class="visually-hidden"> ${s.label} snippet for ${esc(t.name)}</span></button></div>
          <pre id="${t.id}-${s.key}"><code>${esc(s.code)}</code></pre>
        </div>`).join('')}`;

  return `
      <article class="theme" id="${t.id}" aria-labelledby="${t.id}-title">
        <div class="theme-layout">
        ${preview}
        <div class="theme-body">
          <h2 id="${t.id}-title"><a href="#${t.id}">${esc(t.name)}</a></h2>
          <p class="meta"><code>${esc(t.packageName)}</code>${t.version ? ` · v${esc(t.version)}` : ''}</p>
          <p>${esc(t.description)}</p>
          <div class="actions">
          ${actions}
          </div>${install}
        </div>
        </div>
      </article>`;
}

export function renderIndex(themes, repoUrl) {
  const count = themes.length === 1 ? '1 theme' : `${themes.length} themes`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Bootstrap Theme Collection</title>
<meta name="description" content="Bootstrap 5 themes with live demos and install instructions: ${esc(themes.map((t) => t.name).join(', '))}.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='3' fill='%237952b3'/%3E%3Cpath d='M5 4h4a2 2 0 0 1 0 4H5zm0 4h4.5a2 2 0 0 1 0 4H5z' fill='none' stroke='%23fff' stroke-width='1.6'/%3E%3C/svg%3E">
<link rel="stylesheet" href="style.css">
</head>
<body>
  <a class="skip" href="#themes">Skip to themes</a>
  <header class="site-header">
    <div class="wrap">
      <h1>Bootstrap Theme Collection</h1>
      <p class="lead">Themes for Bootstrap 5. Each one is its own npm package with a live demo. Write plain Bootstrap markup, load a theme after Bootstrap's CSS, and only the look changes.</p>
    </div>
  </header>
  <main id="themes" class="wrap" tabindex="-1">
    <p class="count">${count}</p>
    <div class="grid">${themes.map(renderCard).join('')}
    </div>
  </main>
  <footer class="site-footer">
    <div class="wrap">${repoUrl ? `
      <a href="${esc(repoUrl)}">Source on GitHub</a>
      <a href="${esc(repoUrl)}/blob/HEAD/docs/ADDING_A_THEME.md">Add a theme</a>` : ''}
      <span>Each demo opens as its own page with its own CSS.</span>
    </div>
  </footer>
  <p id="copy-status" class="visually-hidden" aria-live="polite"></p>
  <script src="copy.js"></script>
</body>
</html>
`;
}

export function buildSite(root, siteDir) {
  const themes = collectThemes(root);
  const slug = repoSlug(readJson(path.join(root, 'package.json')));

  fs.rmSync(siteDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(siteDir, 'previews'), { recursive: true });
  for (const t of themes) {
    if (t.demo) fs.cpSync(t.demo, path.join(siteDir, 'themes', t.id), { recursive: true });
    if (t.preview) {
      t.previewUrl = `previews/${t.id}${path.extname(t.preview).toLowerCase()}`;
      fs.copyFileSync(t.preview, path.join(siteDir, t.previewUrl));
    }
  }
  for (const file of ['style.css', 'copy.js']) fs.copyFileSync(path.join(appDir, 'src', file), path.join(siteDir, file));
  fs.writeFileSync(path.join(siteDir, 'index.html'), renderIndex(themes, slug && `https://github.com/${slug}`));
  return themes;
}

// Serves _site/ under /<repository name>/, like GitHub Pages does for a project site,
// so links that ignore the base path fail locally too.
function serve(root, siteDir, port = 8090) {
  const base = `/${repoSlug(readJson(path.join(root, 'package.json'))).split('/')[1] || 'site'}/`;
  const types = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  };
  http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (url === '/') return res.writeHead(302, { Location: base }).end();
    if (!url.startsWith(base) && url !== base.slice(0, -1)) return res.writeHead(404).end('Outside the base path');
    let file = path.join(siteDir, url.slice(base.length));
    if (!file.startsWith(siteDir)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!url.endsWith('/')) return res.writeHead(301, { Location: `${url}/` }).end();
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`Serving _site/ on http://localhost:${port}${base}`));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(appDir, '../..');
  const siteDir = path.join(appDir, '_site');
  try {
    const themes = buildSite(root, siteDir);
    console.log(`_site/ ready: ${themes.map((t) => t.id + (t.demo ? '' : ' (no demo)')).join(', ')}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  if (process.argv.includes('--serve')) serve(root, siteDir);
}
