# bootstra-win31

A Bootstrap 5 theme inspired by Windows 3.1, Program Manager, File Manager and early-90s desktop GUIs.

Black one-pixel outlines and two-pixel bevels. Navy title bars with a control-menu box on the left. White menus, X-marked checkboxes, an hourglass for a spinner and a teal desktop with an 8×8 pattern behind it all. Underneath, it's still Bootstrap 5.3: the grid, utilities, components and JavaScript plugins work exactly as documented. Only the look changes.

Sister theme of [bootstra-html32](https://bloschinsky.github.io/bootstra-themes/themes/bootstra-html32/). Part of the [Bootstra Themes](https://bloschinsky.github.io/bootstra-themes/) collection.

**[▶ Live demo](https://bloschinsky.github.io/bootstra-themes/themes/bootstra-win31/)**

## Install

The theme is a single CSS file with no images, fonts or JavaScript. Load Bootstrap 5.3 first, then the theme.

### CDN (versioned)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstra-win31@0.1/dist/bootstra-win31.min.css">
```

### npm

```sh
npm install bootstrap bootstra-win31
```

Then link or import `node_modules/bootstra-win31/dist/bootstra-win31.min.css` after Bootstrap's stylesheet. Bootstrap is a peer dependency (`^5.3.0`).

### Build from source

```sh
git clone https://github.com/bloschinsky/bootstra-themes.git
cd bootstra-themes
npm ci
npm run build --workspace bootstra-win31   # dist/bootstra-win31.css and dist/bootstra-win31.min.css
```

### Set up the page

Pick a colour scheme and a desktop on `<html>`:

```html
<html data-w31-scheme="default" class="w31-desktop w31-pattern-weave">
```

Then write normal Bootstrap markup, and wrap app-like parts in windows. See [`examples/starter.html`](examples/starter.html) for a minimal page.

```html
<div class="w31-window">
  <div class="w31-titlebar">
    <button class="w31-sysmenu" aria-label="Control menu"></button>
    <span class="w31-title">Notepad</span>
    <button class="w31-ctl w31-ctl-min" aria-label="Minimize"></button>
    <button class="w31-ctl w31-ctl-max" aria-label="Maximize"></button>
  </div>
  <nav class="w31-menubar"><a href="#"><u>F</u>ile</a><a href="#"><u>E</u>dit</a></nav>
  <div class="w31-window-body">…</div>
</div>
```

## Colour schemes

Named after the Control Panel palettes. Set `data-w31-scheme` on `<html>`, or on any element to recolour just that part of the page.

| Value       | Face      | Title bar | Desktop   |
| ----------- | --------- | --------- | --------- |
| `default`   | `#c0c0c0` | `#000080` | `#008080` |
| `arizona`   | `#c0c0c0` | `#008080` | `#b49a6c` |
| `bordeaux`  | `#c0c0c0` | `#800040` | `#603048` |
| `emerald`   | `#c0c0c0` | `#008000` | `#004000` |
| `ocean`     | `#c0c0c0` | `#004080` | `#000080` |
| `valentine` | `#d0c0c8` | `#c00040` | `#ff80c0` |
| `designer`  | `#c0c0c0` | `#404040` | `#808080` |
| `leather`   | `#a0a0a0` | `#000000` | `#202020` |
| `plasma`    | `#c0c0c0` | `#800080` | `#000000` |
| `rugby`     | `#c0c0c0` | `#800000` | `#000080` |
| `mono`      | `#ffffff` | `#000000` | `#ffffff` |
| `hotdog`    | `#ffff00` | `#ff0000` | `#ffff00` |

### Make your own

Bevels, menus, highlight and workspace are derived with `color-mix()`:

```css
[data-w31-scheme="cyber"] {
  --w31-face: #b4b4c8; --w31-title: #5a005a; --w31-title-rgb: 90,0,90;
  --w31-desktop: #200020; --w31-window: #ffffff; --w31-desktop-text: #fff;
}
```

## Desktop

Put `.w31-desktop` on `<html>` (or any element) and add one pattern or wallpaper class. Patterns are one-bit 8×8 bitmaps drawn in black over the desktop colour, doubled to 16 px (`--w31-pattern-size`).

| Class                | Tile             |
| -------------------- | ---------------- |
| `w31-pattern-fifty`  | 50% grey dither  |
| `w31-pattern-boxes`  | Nested boxes     |
| `w31-pattern-diamonds` | Diamond lattice |
| `w31-pattern-weave`  | Basket weave     |
| `w31-pattern-thatches` | Thatched roof  |
| `w31-pattern-waffle` | Waffle grid      |
| `w31-pattern-zigzag` | Chevrons         |
| `w31-pattern-spinner`| Pinwheels        |
| `w31-wall-tartan`    | Tartan wallpaper |
| `w31-wall-redbrick`  | Red brick wallpaper |
| `w31-wall-rivets`    | Riveted steel wallpaper |

## Bootstrap components

All of these are restyled and need no extra classes: buttons and button groups, forms (inputs, selects, checks, radios, switches, ranges, input groups, validation), cards, tables, nav tabs and pills, navbar, dropdowns, breadcrumbs, pagination, alerts, badges, progress bars, spinners, list groups, accordion, modals, offcanvas, toasts, tooltips and popovers.

Some get a 3.x meaning:

| Markup                                    | Result                                                       |
| ----------------------------------------- | ------------------------------------------------------------ |
| `.btn`                                    | Grey push button, label shifts when pressed                  |
| `.btn-primary`                            | Default push button with the thick black border              |
| `.btn-success` … `.btn-dark`              | Push buttons in the 16-colour VGA palette                    |
| `.form-check-input[type=checkbox]`        | White box with an X                                          |
| `.form-select`                            | Drop-down list with a separate arrow button                  |
| `.form-select[size]`                      | List box with highlighted selection                          |
| `.form-range`                             | Scroll-bar slider                                            |
| `.navbar`                                 | Menu bar; active item in the highlight colour                |
| `.dropdown-item.active`                   | Checked command (✓)                                          |
| `.breadcrumb`                             | DOS path with `\` separators                                 |
| `.alert-info` / `-warning` / `-danger` / `-success` | Message box with the matching symbol               |
| `.spinner-border`, `.spinner-grow`        | Hourglass                                                    |
| `.modal`, `.offcanvas`, `.toast`          | Window with a title bar; `.btn-close` becomes the control-menu box |
| `.card`                                   | Child window with a title-bar header                         |
| `.list-group`                             | List box                                                     |
| `a`                                       | Green underlined Help jump                                   |

## Theme components

| Class                                                                   | What it is                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------- |
| `.w31-window` (`.is-inactive`, `.w31-dialog`, `.w31-maximized`)          | Window with sizing border and corner notches       |
| `.w31-titlebar`, `.w31-title`                                           | Title bar with centred title                       |
| `.w31-sysmenu`, `.w31-ctl-min`, `.w31-ctl-max`, `.w31-ctl-restore`      | Control-menu box and title-bar buttons             |
| `.w31-menubar`                                                          | Menu bar (links, dropdowns or `.navbar.w31-menubar`) |
| `.w31-window-body`, `.w31-workspace`, `.w31-split`                      | Window body, MDI workspace, two-pane split view    |
| `.w31-toolbar`, `.w31-toolbar-sep`                                      | Tool bar                                           |
| `.w31-statusbar` > `.w31-status`                                        | Status bar with sunken panes                       |
| `.w31-icons` > `.w31-icon` > `.w31-icon-img` + `.w31-icon-label`        | Program icons                                      |
| `.w31-desktop-icons`, `.w31-glyph-group`                                | Minimised icons, program-group glyph               |
| `.w31-file` + `-folder` `-open` `-doc` `-app` `-drive` `-up`             | 16 px file glyphs                                  |
| `.w31-files`, `.w31-tree`                                               | File list and directory tree                       |
| `.w31-msgicon` + `-info` `-question` `-warning` `-stop`                  | Message-box symbols                                |
| `.w31-gauge`                                                            | Setup gauge (`style="--value:42" data-label="42%"`) |
| `.w31-groupbox`                                                         | Group box with the caption cut into the frame      |
| `.w31-3d`                                                               | Grey dialogs with sunken fields                    |
| `.w31-btn-dialog`                                                       | OK / Cancel width button                           |
| `.w31-key`                                                              | Right-aligned shortcut in a menu item              |
| `.w31-popup-link`                                                       | Dotted-underline popup link                        |
| `.w31-raised`, `.w31-sunken`, `.w31-field`, `.w31-face`, `.w31-sys`     | Bevel, field and font utilities                    |
| `.w31-page`, `.w31-page-narrow`                                         | Centred page frame (1000 px / 720 px)              |

The [demo page](https://bloschinsky.github.io/bootstra-themes/themes/bootstra-win31/) (`site/index.html`) shows every component in use and doubles as the documentation.

## Accessibility and motion

Focus is shown with a dotted rectangle, as in 3.x. The hourglass stops turning when the visitor's system asks for reduced motion. On narrow screens the split view stacks and icon grids tighten.

## Browser support

Any current browser that supports `color-mix()`: Chrome / Edge 111+, Firefox 113+, Safari 16.2+. The full scroll-bar look is drawn in Chromium and Safari; Firefox gets the colours only.

## Development

The theme lives in `packages/bootstra-win31/` of the [bootstra-themes](https://github.com/bloschinsky/bootstra-themes) repository.

```text
src/        theme source, one partial per section, bundled from bootstra-win31.css
site/       demo page published to GitHub Pages
examples/   starter template
scripts/    build script
```

Run from the repository root:

```sh
npm ci
npm run dev --workspace bootstra-win31     # build, watch and serve the demo on http://localhost:8080
npm run build --workspace bootstra-win31   # dist/ (readable + minified CSS) and _site/ (demo page)
npm run lint --workspace bootstra-win31    # stylelint
```

## Credits

Created by [Artem Bloschinsky](https://github.com/bloschinsky). Built on [Bootstrap](https://getbootstrap.com/) (MIT). Windows is a trademark of Microsoft Corporation; this project is not affiliated with or endorsed by Microsoft, and all icons and glyphs are original drawings.

## License

[MIT](LICENSE)
