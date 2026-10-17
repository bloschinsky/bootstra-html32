// Builds the theme: src/bootstra-p31.css → dist/bootstra-p31.css, dist/bootstra-p31.min.css and a copy for docs/.
// Run: npm run build   (or npm run watch to rebuild on every save)
import { readFileSync, writeFileSync, mkdirSync, watch } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import CleanCSS from "clean-css";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const src = resolve(root, "src/bootstra-p31.css");

function build() {
  const css = readFileSync(src, "utf8");
  const banner = `/*! bootstra-p31 v${pkg.version} | MIT | Bootstrap 5.3 theme */\n`;
  const min = new CleanCSS({ level: 1 }).minify(css);
  if (min.errors.length) throw new Error(min.errors.join("\n"));

  mkdirSync(resolve(root, "dist"), { recursive: true });
  mkdirSync(resolve(root, "docs/assets"), { recursive: true });
  writeFileSync(resolve(root, "dist/bootstra-p31.css"), css);
  writeFileSync(resolve(root, "dist/bootstra-p31.min.css"), banner + min.styles);
  writeFileSync(resolve(root, "docs/assets/bootstra-p31.css"), css);

  const kb = (n) => (n / 1024).toFixed(1) + " KB";
  console.log(`✓ built: bootstra-p31.css ${kb(css.length)}, bootstra-p31.min.css ${kb(min.styles.length)}`);
}

build();
if (process.argv.includes("--watch")) {
  console.log("Watching src/bootstra-p31.css …");
  watch(src, () => { try { build(); } catch (e) { console.error(e.message); } });
}
