// Builds the theme and the demo site.
//
//   node scripts/build.mjs   src/ → dist/, then index.html + components.html + dist/ → _site/
//
// The theme is hand-written plain CSS and JavaScript, so dist/ is an unchanged copy of src/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const siteDir = path.join(root, '_site');

fs.rmSync(distDir, { recursive: true, force: true });
fs.cpSync(path.join(root, 'src'), distDir, { recursive: true });
console.log('dist/ ready');

fs.rmSync(siteDir, { recursive: true, force: true });
fs.mkdirSync(siteDir);
for (const page of ['index.html', 'components.html']) fs.copyFileSync(path.join(root, page), path.join(siteDir, page));
fs.cpSync(distDir, path.join(siteDir, 'dist'), { recursive: true });
console.log('_site/ ready');
