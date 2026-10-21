// Builds the theme and the demo site.
//
//   node scripts/build.mjs   src/ → dist/, then index.html + components.html + dist/ → _site/
//
// The theme is hand-written plain CSS and JavaScript. The build stamps the package version
// into each file's banner and adds a minified copy of the CSS; nothing else changes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'lightningcss';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const distDir = path.join(root, 'dist');
const siteDir = path.join(root, '_site');

// The banner's first line ` * bootstra-irix` becomes ` * bootstra-irix vX.Y.Z`.
function stamp(file) {
  return fs.readFileSync(path.join(root, 'src', file), 'utf8').replace(`* ${pkg.name}`, `* ${pkg.name} v${pkg.version}`);
}

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir);
const css = stamp(`${pkg.name}.css`);
const { code } = transform({ filename: `${pkg.name}.css`, code: Buffer.from(css), minify: true });
fs.writeFileSync(path.join(distDir, `${pkg.name}.css`), css);
fs.writeFileSync(path.join(distDir, `${pkg.name}.min.css`), code);
fs.writeFileSync(path.join(distDir, `${pkg.name}.js`), stamp(`${pkg.name}.js`));
console.log(`dist/${pkg.name}.css (${Buffer.byteLength(css)} B), .min.css (${code.length} B), .js`);

fs.rmSync(siteDir, { recursive: true, force: true });
fs.mkdirSync(siteDir);
for (const page of ['index.html', 'components.html']) fs.copyFileSync(path.join(root, page), path.join(siteDir, page));
fs.cpSync(distDir, path.join(siteDir, 'dist'), { recursive: true });
console.log('_site/ ready');
