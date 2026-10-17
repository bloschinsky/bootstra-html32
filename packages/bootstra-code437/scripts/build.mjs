// Copies src/code437.css to dist/, writes a minified build, and assembles the demo in _site/.
// Usage: npm run build
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import CleanCSS from 'clean-css';

const src = readFileSync('src/code437.css', 'utf8');
mkdirSync('dist', { recursive: true });
writeFileSync('dist/code437.css', src);

const out = new CleanCSS({ level: 1 }).minify(src);
if (out.errors.length) { console.error(out.errors); process.exit(1); }
writeFileSync('dist/code437.min.css', out.styles);
console.log(`dist/code437.css      ${src.length} B`);
console.log(`dist/code437.min.css  ${out.styles.length} B`);

// The demo keeps the package layout (index.html → examples/ → ../dist/), so its relative links work unchanged.
rmSync('_site', { recursive: true, force: true });
for (const path of ['index.html', 'examples', 'dist']) cpSync(path, `_site/${path}`, { recursive: true });
console.log('_site/ ready');
