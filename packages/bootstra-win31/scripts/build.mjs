// Builds the theme and the demo site.
//
//   node scripts/build.mjs          dist/ + _site/
//   node scripts/build.mjs --css    dist/ only
//   node scripts/build.mjs --watch  rebuild on change and serve _site/ on http://localhost:8080

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'lightningcss';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const entry = path.join(root, 'src', `${pkg.name}.css`);
const distDir = path.join(root, 'dist');
const siteDir = path.join(root, '_site');
const args = new Set(process.argv.slice(2));

// Inline `@import "file.css";` lines, keeping the source formatting and comments intact.
function bundle(file) {
  const css = fs.readFileSync(file, 'utf8');
  return css.replace(/^@import\s+["']([^"']+)["'];[ \t]*\n?/gm, (_, rel) => {
    const part = bundle(path.resolve(path.dirname(file), rel));
    return part.endsWith('\n') ? part + '\n' : part + '\n\n';
  }).replace(/\n+$/, '\n');
}

function buildCss() {
  const css = bundle(entry).replace(`* ${pkg.name} —`, `* ${pkg.name} v${pkg.version} —`);
  const { code } = transform({ filename: `${pkg.name}.css`, code: Buffer.from(css), minify: true });

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, `${pkg.name}.css`), css);
  fs.writeFileSync(path.join(distDir, `${pkg.name}.min.css`), code);
  console.log(`dist/${pkg.name}.css (${Buffer.byteLength(css)} B), .min.css (${code.length} B)`);
}

function buildSite() {
  fs.rmSync(siteDir, { recursive: true, force: true });
  fs.cpSync(path.join(root, 'site'), siteDir, { recursive: true });
  fs.cpSync(path.join(root, 'examples'), path.join(siteDir, 'examples'), { recursive: true });
  fs.cpSync(distDir, path.join(siteDir, 'dist'), { recursive: true });
  console.log('_site/ ready');
}

function build() {
  try {
    buildCss();
    if (!args.has('--css')) buildSite();
  } catch (err) {
    console.error(err.message);
    if (!args.has('--watch')) process.exit(1);
  }
}

function serve(port = 8080) {
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
  http.createServer((req, res) => {
    let file = path.join(siteDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(siteDir)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`Serving _site/ on http://localhost:${port}`));
}

build();

if (args.has('--watch')) {
  let timer;
  for (const dir of ['src', 'site', 'examples']) {
    fs.watch(path.join(root, dir), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(build, 100);
    });
  }
  serve();
}
