# bootstra-irix

A Bootstrap 5 theme inspired by the Indigo Magic desktop of early-90s Silicon Graphics workstations: bevelled Motif chrome, italic menus, thumbwheels, drop pockets, pink path fields, teal icon views and slanted catalog tabs.

Part of the [Bootstra Themes](https://bloschinsky.github.io/bootstra-themes/) collection.

**[▶ Live demo](https://bloschinsky.github.io/bootstra-themes/themes/bootstra-irix/)**: the demo desktop (`index.html`) and the component reference (`components.html`), with every component as a live example and copyable markup.

## Install

Load Bootstrap 5.3 first, then the theme. The script is optional; it adds the behaviours listed in [Behaviours](#behaviours).

### CDN (versioned)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstra-irix@0.1/dist/bootstra-irix.min.css">

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstra-irix@0.1/dist/bootstra-irix.js"></script> <!-- optional -->

<body class="ix-desktop">
```

### npm

```sh
npm install bootstrap bootstra-irix
```

Then link `node_modules/bootstra-irix/dist/bootstra-irix.min.css` (or the readable `bootstra-irix.css`) after Bootstrap's stylesheet, and optionally `dist/bootstra-irix.js` after Bootstrap's bundle. Bootstrap is a peer dependency (`^5.3.0`).

### Build from source

```sh
git clone https://github.com/bloschinsky/bootstra-themes.git
cd bootstra-themes
npm ci
npm run build --workspace bootstra-irix   # dist/bootstra-irix.css, .min.css, .js and the demo in _site/
```

## Behaviours

`dist/bootstra-irix.js` has no dependencies (Bootstrap's JavaScript is optional) and exposes `window.BootstraIrix`. It wires up:

| Markup | Behaviour |
|---|---|
| `.ix-thumbwheel` | draggable thumbwheel, fires `ix:change` |
| `[data-ix-clock]` | analog desktop clock |
| `[data-ix-scheme="name"]` | click to switch colour scheme (saved in `localStorage`) |
| `[data-ix-drag]` | window can be dragged by its title bar (≥992px) |
| `.ix-tbtn--min` / `--max` | shade / maximize the parent `.ix-window` |
| `.ix-icons` | click to select, arrow keys move the selection |
| `[data-ix-view]`, `[data-ix-find]` | view-mode buttons and the "find an icon" bar |
| tab `data-page` + `[data-ix-page]` | page counter in the window title |
| `[data-ix-layer]` | container raised above windows when its dropdown opens |

## Colour schemes

Set on `<html>` or on any element (schemes cascade, so a single window can preview another scheme):

| `data-scheme` | Look |
|---|---|
| *(none)* | IndigoMagic in light mode, Potrero in dark mode |
| `indigo` | Lavender-blue chrome, cadet catalogs (default) |
| `keywest` | Neutral grey, later 6.x look |
| `pacific` | Sea-green chrome |
| `mendocino` | Clay and olive |
| `potrero` | Dark chrome, khaki title bars, violet catalog |

`data-theme="light"` / `"dark"` on `<html>` forces the automatic choice. From JS: `BootstraIrix.setScheme("pacific")`, or put `data-ix-scheme="pacific"` on any button.

## Window anatomy

```html
<section class="ix-window" data-ix-drag>
  <header class="ix-titlebar">
    <button class="ix-tbtn ix-tbtn--menu" aria-label="Window menu"></button>
    <h2 class="ix-title">/usr/people/kaya</h2>
    <button class="ix-tbtn ix-tbtn--min" aria-label="Shade"></button>
    <button class="ix-tbtn ix-tbtn--max" aria-label="Maximize"></button>
  </header>
  <nav class="ix-menubar">
    <a href="#"><u>S</u>elected</a><a href="#"><u>V</u>iew</a>
    <a href="#" class="ix-menu-help"><u>H</u>elp</a>
  </nav>
  <div class="ix-pathbar">
    <button class="ix-droppocket"><i class="ix-ico-folder-open"></i></button>
    <div class="ix-path"><input class="form-control" value="/usr/people/kaya"></div>
    <button class="ix-refresh" aria-label="Rescan"></button>
  </div>
  <div class="ix-viewframe">
    <div class="ix-vtools">
      <button class="ix-vbtn ix-vbtn--icons active"></button>
      <div class="ix-thumbwheel" data-min="28" data-max="72" data-value="48"></div>
    </div>
    <div class="ix-view ix-view--teal">
      <div class="ix-icons">
        <button class="ix-icon"><i class="ix-ico-folder"></i><span>Mail</span></button>
      </div>
    </div>
  </div>
  <ul class="nav ix-tabs">…</ul>
</section>
```

## Class reference

| Area | Classes |
|---|---|
| Desktop | `ix-desktop`, `ix-desktop--pattern`, `ix-desk-icon`, `ix-toolchest`, `ix-clock` + `data-ix-clock` |
| Window | `ix-window` (`is-active`, `is-shaded`, `is-max`), `ix-titlebar`, `ix-title`, `ix-tbtn--menu/min/max`, `ix-menubar`, `ix-window-body`, `ix-statusline` |
| Views | `ix-view` + `--teal / --cadet / --navajo / --catalog / --chrome`, `ix-viewframe`, `ix-vtools`, `ix-vbtn--icons/list/grid/face/stop`, `data-ix-view="icons|list|compact"`, `data-ix-find` |
| Icons | `ix-icons`, `ix-icons--list`, `ix-icons--compact`, `ix-icon` (`is-selected`), `ix-ico-folder`, `-folder-open`, `-file`, `-terminal`, `-app`, `-media`, `-dumpster`, `-cdrom`, `-mail`, `-clock`, `-printer`, `-disk` |
| Controls | `ix-thumbwheel`, `ix-thumbwheel--h`, `ix-pathbar`, `ix-path`, `ix-droppocket`, `ix-refresh`, `ix-iconbtn`, `ix-iconbtn--rec`, `ix-vrange`, `ix-frame` |
| Tabs | `nav ix-tabs` (+ `ix-tabs--teal`, `ix-tabs--navajo`); `data-page` on tabs + `data-ix-page` in the title updates “Page N” |
| Layering | Open dropdowns raise their `.ix-window`; add `data-ix-layer` to other containers (e.g. a Toolchest sidebar) |
| Apps | `ix-term` (+ `.hi`, `.cur`), `ix-osview`, `ix-vu`, `ix-vu-bar` (`--level: 0–100`), `ix-list`, `ix-table-wrap` |
| Utilities | `ix-raised`, `ix-sunken`, `ix-sep`, `ix-italic-bold`, `ix-mono` |

Restyled Bootstrap components: buttons (`.btn-primary` / `.btn-default` gets the Motif default ring), forms (pink fields, option-menu selects, red-tick checkboxes, diamond radios, switches, ranges), cards, dropdowns, tables, list groups, progress (stacked bars become gr_osview meters), badges, alerts (notifier glyphs), modals, nav tabs, pagination, tooltips and toasts.

## Thumbwheel events

```js
wheel.addEventListener("ix:change", e => console.log(e.detail.value));
```
Drag, mouse wheel, arrow keys, Home and End all work; it exposes `role="slider"`.

## Tokens

All colours are CSS custom properties on `:root` / `[data-scheme]`: `--ix-desk`, `--ix-chrome`, `--ix-light`, `--ix-light2`, `--ix-dark`, `--ix-darker`, `--ix-title`, `--ix-title-active`, `--ix-text`, `--ix-field`, `--ix-view-teal`, `--ix-view-cadet`, `--ix-view-navajo`, `--ix-view-catalog`, `--ix-sel`, `--ix-toggle`, `--ix-check`, `--ix-term-bg`. Write your own scheme by redefining them under `[data-scheme="yours"]`.

Fonts fall back from Helvetica to Arimo (load it from Google Fonts, as the demo does) and Cousine for monospace.

## License

MIT. Icons are original drawings. Not affiliated with Silicon Graphics or Hewlett Packard Enterprise; IRIX and Indigo Magic are trademarks of their respective owners.
