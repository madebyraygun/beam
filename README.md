# beam

The application frame that more than one app is built on: seven Lit components (the shell,
the sidebar, the breadcrumb, the status line, the search box, the monogram, the toast) and
their icons. Each app brings its own theme; beam reads it through one set of custom
properties, the token contract below, and ships a plain default theme so a new app works
before it has one.

The package is `@madebyraygun/beam`, set in the `name` field of `package.json`. Apps do not
write that name in their source: each app's `package.json` gives the dependency a local name
(`"beam": "..."`) and its source imports `beam`. Moving to another name or registry changes
one line in each app.

`lit` is the only peer dependency.

## What is in it

| Import | What it gives |
| --- | --- |
| `beam/default-theme.css` | The default theme: every token, light and dark. Load it in the page, or load your own theme instead. |
| `beam/theme` | `TOKENS` (the contract as data), `defaultTheme` (the same theme as a Lit style), `baseCss`, and the light and dark mode functions. |
| `beam/events` | The event names (`NAVIGATE_EVENT` and the rest) and `EVENT_PREFIX`. |
| `beam/components/<name>.js` | One component, registered on import: `beam-app-shell`, `beam-nav-sidebar`, `beam-breadcrumb`, `beam-status-line`, `beam-search-pill`, `beam-monogram`, `beam-toast`, and the controls: `beam-button`, `beam-input`, `beam-textarea`, `beam-select`, `beam-switch`, `beam-radio-group`, `beam-combobox`, `beam-dialog`. |
| `beam/icons` | `BeamIconBase` and the six `beam-icon-*` elements the shell draws and both apps use: dashboard, flag, menu, refresh, chevron-down, search. |
| `beam` | All of the above. Importing it registers every component. |

## Using it

```html
<beam-app-shell
  workspace-name="Example board"
  workspace-key="example"
  switch-label="Switch boards"
  switch-scope="boards"
  screen-title="Board"
  .trail=${[{ label: 'Board' }]}
  .statusSegments=${segments}
>
  <beam-nav-sidebar slot="sidebar" product-name="example" .items=${items} active="board">
    <svg slot="mark" ...></svg>
  </beam-nav-sidebar>
  ...the screen...
</beam-app-shell>
```

- **Words are the app's.** The first breadcrumb level is "what is open": `workspace-name`
  and `workspace-key` (which picks its monogram colour). Its tooltip is `switch-label`
  (default "Switch workspace") and pressing it asks for the palette at `switch-scope`
  (default `workspaces`). The search box's word is `label` on `beam-search-pill` (default
  "Search"); the refresh button's is `refresh-label` on the shell (default "Refresh").
- **The product's name and mark.** `beam-nav-sidebar` draws `product-name` beside its toggle,
  and whatever is in its `mark` slot before it. With neither, it draws only the toggle.
- **The status line.** `statusSegments` on the shell (or `segments` on `beam-status-line`) is
  what the line holds after the name: each segment has an `id`, a `label`, and optionally an
  icon, a keycap, a tooltip, a side (`start` or `end`), a tone (`ok`, `warning`, `danger`), a
  kind (`text` to select and copy, `status` for an icon whose label hides when narrow), and
  when it drops out as the line narrows. A segment with `navigate`, `palette` or `action` is a
  button. Leave `statusSegments` undefined for no status line; pass an empty list for the name
  alone. The full type is `StatusSegment` in `src/components/beam-status-line.ts`.
- **Events.** Every event bubbles out of every shadow root and is named `beam-<what>`:
  `beam-navigate` `{ id }`, `beam-palette-open` `{ scope }`, `beam-status-action` `{ id }`,
  `beam-sidebar-toggle` `{ collapsed }`, `beam-refresh`, and `beam-toast` (send it with
  `dispatchToast`; `beam-toast`, which the shell holds, listens on `window`). The prefix is
  `EVENT_PREFIX` in `src/events.ts`, the one place it is written; listen with the exported
  names rather than the strings.

## Controls

The controls wrap the native elements, so the keyboard, the screen reader and the platform's
pickers behave as they do for a plain `<input>` or `<select>`:

- **In a form.** Each one is form-associated: give it a `name` and it is in `FormData`;
  `form.reset()` puts back the value it started with; `required` and `error` make it invalid
  so the form will not submit; a disabled `<fieldset>` disables it. Enter in a field submits
  the form (⌘↵ or Ctrl↵ in a textarea). `beam-button type="submit"` and `type="reset"` act on
  their form. A `change` event says the value was committed.
- **Label, hint, error.** `label`, `hint` and `error` are properties. An error keeps the value
  as typed and shows the message under the field; it does not snap back.
- **Sizes.** `--beam-control-height`, with `size="s"` and `size="touch"` (44px) on a button
  and a radio group.
- **Select.** Options are `<option>` children. Where the engine has `appearance: base-select`
  the open list is drawn from the theme; elsewhere it is the system's. `data-color` on an
  option gives it a dot.
- **Radio group.** `<option>` children too; `variant="segmented"` draws it as segments.
- **Combobox.** `options` is a list of `{ value, label, group?, badge?, color? }`. Typing
  filters; ↑↓ move, ↵ picks, Esc closes. The list is a popover in the top layer. `loading`,
  `no-match` (with `{query}`) and `allow-free` cover fetching, no match and free text.
- **Dialog.** The native `<dialog>`, modal. `show()`, `close()`, and `requestClose()`, which
  sends a cancelable `cancel` first, as Escape does. `size="confirm"` (440) or `size="form"`
  (620); buttons go in the `footer` slot, the primary one last; `autofocus` picks where focus
  starts.

## Light and dark

Three states as two classes on `<html>`: none follows the system, `light-mode` opts out of
dark, `dark-mode` forces it. A theme puts its dark values under both
`@media (prefers-color-scheme: dark) { :root:not(.light-mode) { … } }` and
`:root.dark-mode { … }`, as `src/theme/default-theme.ts` does.

The app chooses where the choice is kept. Every function takes the storage key, and beam has
none of its own, so two apps on one origin keep separate choices:

```ts
import { initColorMode, writeMode, applyMode, colorModeBootScript } from 'beam/theme';

const KEY = 'example.color-mode';
initColorMode({ storageKey: KEY });        // at start-up
writeMode(KEY, 'dark'); applyMode('dark'); // when the person picks one
```

`colorModeBootScript(KEY)` returns the same start-up step as an inline script for `<head>`,
so a dark page does not flash light while the bundle loads.

## Extending and theming

There are three routes in, from lightest to heaviest, and one way round.

1. **Override tokens.** Set any token in the table below on `:root` (both modes) or under the
   dark selectors. Custom properties inherit through shadow roots, so one rule in the page
   reaches every component. To change one instance, set the token on that element:
   `beam-monogram.big { --beam-monogram-size: 48px; }`.
2. **Style exposed parts.** Each component names the pieces worth styling with `part`, and a
   rule in the tree that holds the component reaches them with `::part()`:
   `beam-nav-sidebar::part(item active) { font-weight: 700; }`. The parts:

   | Component | Parts |
   | --- | --- |
   | `beam-app-shell` | `sidebar`, `backdrop`, `header`, `nav-toggle`, `refresh`, `banner`, `content`, `page-head`, `status-line` |
   | `beam-nav-sidebar` | `head`, `toggle`, `product-name`, `group-label`, `item` (with `active` on the current one), `footer` |
   | `beam-breadcrumb` | `workspace`, `level` |
   | `beam-status-line` | `workspace`, `segment` |
   | `beam-search-pill` | `button`, `keycap` |
   | `beam-monogram` | `tile` |
   | `beam-toast` | `toast`, `action`, `close` |
   | `beam-button` | `button` |
   | `beam-input` | `label`, `input`, `hint`, `error` |
   | `beam-textarea` | `label`, `textarea`, `hint`, `error` |
   | `beam-select` | `label`, `select`, `hint`, `error` |
   | `beam-switch` | `row`, `switch`, `hint`, `error` |
   | `beam-radio-group` | `fieldset`, `label`, `options`, `option`, `hint`, `error` |
   | `beam-combobox` | `label`, `input`, `list`, `hint`, `error` |
   | `beam-dialog` | `dialog`, `header`, `body`, `footer` |

   A part rule is written in the tree that holds the component, and reaches one shadow root
   down: a rule in the document styles a shell that sits in the document, and a rule in your
   own component's styles styles a shell your component renders.
3. **Fill slots.** Put your own markup where the component leaves room:

   | Component | Slots |
   | --- | --- |
   | `beam-app-shell` | `sidebar`, `banner`, `page-actions`, `header-end` (after the breadcrumb, such as a status dot), and the default slot for the screen |
   | `beam-nav-sidebar` | `mark`, before the product name |
   | `beam-status-line` | `start` and `end`, beside the segments on each side of the spacer |

**Wrapping one in your own.** When a component needs behaviour or markup none of the routes
give, write your own element that renders it and adds what is missing, and use yours in the
app. Pass properties through and re-send or listen for its events; style it from your
element's styles with tokens and parts as above. Subclassing works too (`class MyShell
extends BeamAppShell`, registered under your own tag, with `static styles = [BeamAppShell.styles,
css\`…\`]`), but a subclass depends on internals beam may change; a wrapper depends only on
what is documented here.

**Icons.** An app draws its own icons on `BeamIconBase` (from `beam/icons`) under its own
tag names: a subclass supplies only its paths on a 24×24 grid, and sizing, stroke,
`inline` and the label come with the base. A nav item's or status segment's `icon` is any
registered tag name. `src/components/__mocks__/icons.ts` is a worked example.

**What goes into beam.** A component or an icon moves into the package only once both apps use it.
Until then it lives in the app that has it, built on the same tokens so that it can move
later without change. A component that moves in leaves behind every word, colour, font and
value that belongs to one app: those become tokens, properties or slots with neutral
defaults, and each app's theme or markup sets them.

## The token contract

Every custom property a component reads, all prefixed `--beam-`. `TOKENS` in
`src/theme/tokens.ts` is the same list as data; a test holds the two together, holds the
components to reading nothing else, and holds the default theme to filling every row that is
not a component's own knob. The default theme's values are in `src/theme/default-theme.ts`.

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-color-bg` | color | The window behind everything: the shell, the search keycap. |
| `--beam-color-surface` | color | A raised control on the window: the search box. |
| `--beam-color-surface-alt` | color | The banner strip under the top bar. |
| `--beam-color-panel` | color | The floating sidebar and status line. |
| `--beam-color-border` | color | Edges of the panels, the banner and the search box. |
| `--beam-color-border-soft` | color | Dividers inside a panel: between status segments, above the sidebar footer. |
| `--beam-color-text` | color | Body text, nav items, the current breadcrumb level. |
| `--beam-color-muted` | color | Secondary text: group labels, earlier breadcrumb levels, the status line, icon buttons. |
| `--beam-color-accent` | color | The accent: the search box edge under the pointer. |
| `--beam-color-on-accent` | color | Text on a success or danger toast. |
| `--beam-color-focus` | color | The keyboard focus outline on every control. |
| `--beam-color-success` | color | A success toast; a status segment with tone `ok`. |
| `--beam-color-warning` | color | A nav item count; a status segment with tone `warning`. |
| `--beam-color-danger` | color | A danger toast; a status segment with tone `danger`. |
| `--beam-color-hover` | color | What a button or nav item sits on under the pointer. |
| `--beam-color-selected` | color | The active nav item fill. |
| `--beam-color-overlay` | color | The veil behind the open drawer on a narrow screen. |
| `--beam-color-inverse-bg` | color | An info toast: a chip that stays dark in both modes. |
| `--beam-color-inverse-text` | color | Text on an info toast. |
| `--beam-color-inverse-border` | color | Edge of an info toast. |
| `--beam-color-inverse-hover` | color | A toast button under the pointer. |
| `--beam-color-field` | color | The fill of a text field, select and textarea. |
| `--beam-color-ring` | color | The halo around a focused text field, outside its accent edge. |
| `--beam-color-danger-ring` | color | The halo around a field in error. |
| `--beam-color-on-tone` | color | Initials on a monogram tile. |
| `--beam-tone-1` | color | Monogram tile fill number 1 of 7; a seed picks one. |
| `--beam-tone-2` | color | Monogram tile fill number 2 of 7; a seed picks one. |
| `--beam-tone-3` | color | Monogram tile fill number 3 of 7; a seed picks one. |
| `--beam-tone-4` | color | Monogram tile fill number 4 of 7; a seed picks one. |
| `--beam-tone-5` | color | Monogram tile fill number 5 of 7; a seed picks one. |
| `--beam-tone-6` | color | Monogram tile fill number 6 of 7; a seed picks one. |
| `--beam-tone-7` | color | Monogram tile fill number 7 of 7; a seed picks one. |
| `--beam-accent-image` | image | Fill of the product name in the sidebar and the edge of the active nav item. Any `<image>`; one colour is `linear-gradient(c, c)`. |
| `--beam-font-family` | font-family | The one family every component sets in. |
| `--beam-font-size-base` | length | The shell and toast text. |
| `--beam-font-size-display` | length | The page heading. |
| `--beam-font-size-body` | length | Nav items. |
| `--beam-font-size-control` | length | The breadcrumb. |
| `--beam-font-size-caption` | length | The status line, keycaps, the large monogram. |
| `--beam-font-size-label` | length | Uppercase nav group labels. |
| `--beam-font-weight-medium` | font-weight | The page heading, the active nav item, the current breadcrumb level, toasts. |
| `--beam-font-weight-semibold` | font-weight | The status line monogram. |
| `--beam-font-weight-bold` | font-weight | The product name, monogram initials, a toast action. |
| `--beam-line-height` | number | The shell line height. |
| `--beam-letter-spacing-tight` | length | The page heading. |
| `--beam-letter-spacing-label` | length | Nav group labels. |
| `--beam-space-s` | length | Small gaps: inside the breadcrumb, the sidebar, between toasts. |
| `--beam-space-m` | length | Banner padding, page heading gap. |
| `--beam-space-l` | length | Inside a toast. |
| `--beam-control-height` | length | A button, a select and the combobox field. |
| `--beam-control-height-s` | length | A small button (`size="s"`). |
| `--beam-control-height-touch` | length | A control sized for a finger (`size="touch"`), and a radio row on touch. |
| `--beam-opacity-disabled` | number | A disabled control. |
| `--beam-radius-xs` | length | The status line monogram. |
| `--beam-radius-sm` | length | The small monogram, toast buttons, a focused status segment. |
| `--beam-radius-md` | length | Nav items, toggles, breadcrumb buttons, the banner, toasts, the large monogram. |
| `--beam-radius-lg` | length | The status line. |
| `--beam-radius-xl` | length | The sidebar. |
| `--beam-radius-pill` | length | The search box, its keycap, the refresh button. |
| `--beam-shadow-floating` | shadow | What the sidebar and status line cast. |
| `--beam-shadow-raised` | shadow | What a toast casts. |
| `--beam-transition-fast` | transition | Hover fills and edges. |
| `--beam-transition-base` | transition | The drawer sliding in on a narrow screen. |
| `--beam-transition-sidebar` | transition | The sidebar folding to its rail. |
| `--beam-duration-fast` | time | A toast arriving. |
| `--beam-sidebar-width` | length | The sidebar, open. |
| `--beam-sidebar-collapsed-width` | length | The sidebar folded to its icon rail. |
| `--beam-header-height` | length | The top bar and the sidebar header beside it. |
| `--beam-window-inset` | length | How far the floating panels sit in from the window edge. |
| `--beam-icon-size` | length | An icon that is not `inline`. Set it on an icon or its container to size it. |
| `--beam-icon-fill` | color | Fills an icon shape as well as stroking it. Unset: outline only. Set by the component; override on the element. |
| `--beam-monogram-size` | length | The monogram tile edge. 20px, or 32px at `size="l"`. Set by the component; override on the element. |
| `--beam-toast-gutter` | length | The toast column distance from the window corner. `--beam-space-l`. Set by the component; override on the element. |
| `--beam-toast-max-width` | length | The widest a toast grows. 360px. Set by the component; override on the element. |

Sizes inside a component that only that component's layout depends on (a 32px button, the
gap between a nav item's icon and label) are written in the component, not tokens. Ask for a
token when an app needs to change one.

## Working on it

```
npm install --ignore-scripts
npm run build          # tsc to dist/, then dist/css/default.css
npm test               # vitest: components in jsdom with axe, the token contract, the source guards
npm run test:browser   # Playwright, in the Chrome on this computer: every component under two themes
npm run typecheck
npm run lint
npm run demo           # the demo page on http://localhost:9090, under the default theme
```

Build before `npm run demo` and `npm run test:browser`: both load `dist/css/default.css`.
The browser tests use the installed Chrome (`channel: 'chrome'`), so nothing is downloaded;
set `BEAM_E2E_CHANNEL` to nothing to use Playwright's own Chromium.

The demo page lists every component with its states, in light and dark. A state is a
`*.preview.ts` file beside the component.

Node 20.19 or newer. No package here needs its install scripts.

An app that uses the package from a folder beside it (`"beam": "file:../beam"`) reads
`dist/`, so build here first, and again after a change.

## Licence

MIT; see `LICENSE`.

## For CI

There are no workflow files here. A job that checks this repository needs Node 20.19 or
newer and these steps, in this order: `npm ci --ignore-scripts`; `npm run lint`;
`npm run typecheck`; `npm run build`; `npm test`; then `npm run test:browser`, which needs a
Chrome or Chromium on the runner. Nothing is downloaded beyond the npm packages.
