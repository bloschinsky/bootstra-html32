# bootsys-p31

A retro research-terminal theme for Bootstrap 5.3. It turns stock Bootstrap components into the screen of an old lab terminal: a P31 phosphor display, a monospaced typeface, square corners and optional scanlines. The grid, classes and JavaScript stay exactly the same, so you write ordinary Bootstrap markup and get a phosphor screen.

- CSS only, no JavaScript of its own.
- Mobile first: the menu, status bar and side cards fold behind buttons on phones and stay open on desktop.
- Three phosphor colours: green, amber, cyan.

## Quick start

```html
<!doctype html>
<html lang="en" class="p31" data-bs-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootsys-p31@1.0/dist/bootsys-p31.min.css" rel="stylesheet">
</head>
<body class="p31-crt">
  …
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

Or install from npm and load `node_modules/bootsys-p31/dist/bootsys-p31.min.css` after Bootstrap:

```bash
npm install bootstrap bootsys-p31
```

A complete page with a header, folders and a document is in [`examples/starter.html`](examples/starter.html).

| Goal | How |
|---|---|
| Turn the theme on | `p31` class on `<html>` plus `data-bs-theme="dark"` |
| Change the phosphor | `data-p31-phosphor="amber"` or `"cyan"` on `<html>` |
| Scanlines and vignette | `p31-crt` class on `<body>` |
| Colour a single block | `p31-accent-primary`, `-info`, `-warning`, `-danger`, `-secondary` |

## Project layout

```
packages/bootsys-p31/
├── src/bootsys-p31.css         ← theme source, edit here
├── dist/                       ← build output (npm run build)
│   ├── bootsys-p31.css
│   └── bootsys-p31.min.css
├── docs/                       ← component docs (the demo in the collection site)
│   ├── index.html
│   └── assets/bootsys-p31.css  ← build output
├── examples/
│   ├── starter.html            ← shell for a new page
│   └── prototype/index.html    ← the original encyclopedia prototype (standalone, no Bootstrap)
└── scripts/build.mjs           ← build script
```

## Development

The theme lives in the [bootstra-themes](https://github.com/bloschinsky/bootstra-themes) monorepo. From the repository root:

```bash
npm ci
npm run build --workspace bootsys-p31    # src → dist and docs/assets
npm run watch --workspace bootsys-p31    # rebuild on every save
npm run serve --workspace bootsys-p31    # local server, then open /docs/ or /examples/
```

Only edit `src/bootsys-p31.css`. Files in `dist/` and `docs/assets/` are generated.

### How the theme works

1. **`--p31-*` tokens** hold the base palette: `--p31-phos` (phosphor), `--p31-cyan`, `--p31-amber`, `--p31-red`, `--p31-muted`, `--p31-line`, `--p31-grid`, `--p31-bg` and so on.
2. **Bootstrap mapping**: `--bs-primary`, `--bs-info`, `--bs-border-radius` and others point at the tokens, so switching the phosphor recolours everything at once.
3. **Components**: each component’s own variables are overridden (`--bs-btn-*`, `--bs-card-*`, `--bs-table-*` …).
4. **`p31-*` patterns**: extra classes for technical documents.

Colour roles:

| Bootstrap | Token | Purpose |
|---|---|---|
| `primary` | `--p31-phos` | main screen colour, active elements |
| `info` | `--p31-cyan` | data, values, research |
| `warning` | `--p31-amber` | warnings, recommendations, RESTRICTED |
| `danger` | `--p31-red` | errors, prohibitions, SECRET |
| `secondary` | `--p31-muted` | captions, secondary data |

### Adding your own phosphor

Copy the `html.p31[data-p31-phosphor="amber"]` block in `src/bootsys-p31.css`, rename it and change the token values, including the `*-rgb` values and the `--p31-select-arrow`, `--p31-close-icon` and `--p31-switch-off` icons.

## Patterns

| Class | What it is |
|---|---|
| `p31-topbar`, `p31-statusbar`, `p31-subtitle` | header and status bar |
| `p31-side`, `p31-folders`, `p31-sub`, `p31-count`, `p31-label` | folder-style sidebar |
| `p31-titlebox`, `p31-memo` | document title and memo header |
| `p31-kv`, `p31-steps`, `p31-list` | key/value list, steps, bulleted list |
| `p31-figure` + SVG classes `p31-s`, `p31-sd`, `p31-f`, `p31-fd`, `p31-t`, `p31-tm`, `p31-ti`, `p31-gr` | figures drawn in the theme colour |
| `p31-tile` | thin panel for document lists |
| `p31-tag` | outlined label (clearance, section) |
| `p31-stats`, `p31-stat`, `p31-log`, `p31-keys`, `p31-cursor`, `p31-screen` | system blocks |
| `p31-crt` | scanlines and vignette |

Live examples with code are in [`docs/index.html`](docs/index.html).

## Docs online

The component docs are published with the Bootstra Themes collection at <https://bloschinsky.github.io/bootstra-themes/themes/bootsys-p31/>.

## Support

Bootstrap 5.3.x and current browsers (Chrome, Firefox, Safari, Edge). Animations are disabled under `prefers-reduced-motion`.

## License

[MIT](LICENSE). IBM Plex Mono is under the SIL Open Font License; Bootstrap is MIT.
