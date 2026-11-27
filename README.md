# beam

beam is a small library of [Lit](https://lit.dev) web components for building application
interfaces: an app shell with its navigation, breadcrumb, status line and toasts, and a set of
form controls. Every component takes its look from `--beam-` CSS custom properties and its
words from properties, so each app that uses it brings its own theme and its own labels.

It is the shared base of two apps, Nigel (accounting) and Tack (a file-based task board), and
it is for anyone who wants the same components under a theme of their own. A neutral default
theme, light and dark, is included. `lit` is the only peer dependency.

## Install

beam is installed from a GitHub release tarball, not from the npm registry. Install it under
the name `beam`, with `lit` beside it:

```
npm install lit beam@https://github.com/madebyraygun/beam/releases/download/v0.2.0/madebyraygun-beam-0.2.0.tgz
```

That writes this to the app's `package.json`:

```json
"beam": "https://github.com/madebyraygun/beam/releases/download/v0.2.0/madebyraygun-beam-0.2.0.tgz"
```

The package's own name is `@madebyraygun/beam`. The examples here import `beam` because the
dependency is installed under that name. Each release has its own tarball, listed at
<https://github.com/madebyraygun/beam/releases>.

The package is ES modules only.

## Quick start

Load a theme, import the components you use, and write their tags. Importing a component
registers its element.

```js
import 'beam/default-theme.css';
import 'beam/components/beam-input.js';
import 'beam/components/beam-button.js';
```

```html
<form>
  <beam-input name="email" type="email" label="Email" required></beam-input>
  <beam-button type="submit" variant="primary">Subscribe</beam-button>
</form>
```

The CSS import needs a bundler that handles CSS, such as Vite. Without one, link the file
from the page, or adopt the same theme from JavaScript:

```js
import { defaultTheme } from 'beam/theme';

document.adoptedStyleSheets.push(defaultTheme.styleSheet);
```

To change the look, set tokens in a rule that comes after the default theme:

```css
:root {
  --beam-font-family: Georgia, serif;
  --beam-radius-md: 2px;
  --beam-control-height: 36px;
}
```

A colour set like this is the same in light and dark. To give it a dark value, write both as
`light-dark(light, dark)`, as [Theming](#theming) shows.

### Entry points

| Import | What it gives |
| --- | --- |
| `beam` | Everything below. Importing it registers every component and icon. |
| `beam/components/<tag>.js` | One component, registered on import, such as `beam/components/beam-button.js`. |
| `beam/icons` | `BeamIconBase` and the six `beam-icon-*` elements. |
| `beam/theme` | `TOKENS`, `defaultTheme`, `baseCss` and the colour mode functions. |
| `beam/events` | The event names, `EVENT_PREFIX` and `emit`. |
| `beam/default-theme.css` | The default theme as a stylesheet. |

## Theming

A theme is a stylesheet that sets the `--beam-` tokens on `:root`. Custom properties inherit
through shadow roots, so one rule in the page reaches every component.

### Writing a theme

There are two ways to write one.

- **Override the default.** Load `beam/default-theme.css`, then set the tokens you want to
  change in a later `:root` rule, as in the quick start. A colour written as
  `light-dark(light, dark)` follows the mode; a plain colour is the same in both. The two
  shadows are the exception, as below.
- **Replace the default.** Load your own stylesheet in its place. It must set every token in
  the [token reference](#token-reference) except the four
  [component tokens](#component-tokens). The components have no fallback values, so a token
  the theme leaves out has no value. `src/theme/default-theme.ts` is a complete theme to copy.

A theme is one block of tokens, plus the two classes that pin a mode:

```css
:root {
  color-scheme: light dark;
  --beam-color-bg: light-dark(#f5f5f5, #161616);
  --beam-color-text: light-dark(#1f1f1f, #ececec);
  /* ...every other token... */
}

:root.light-mode {
  color-scheme: light;
}

:root.dark-mode {
  color-scheme: dark;
}
```

`light-dark()` gives its first colour where `color-scheme` is light and its second where it is
dark. `color-scheme: light dark` follows the system, and the two classes pin it;
[Colour mode](#colour-mode) explains them. `color-scheme` inherits into shadow roots, so every
component picks the same side.

`light-dark()` takes colours only, so a colour inside an image or a shadow uses it there:
`linear-gradient(light-dark(#2563eb, #7aa7ff), light-dark(#2563eb, #7aa7ff))`, or
`0 8px 24px light-dark(rgb(0 0 0 / 6%), rgb(0 0 0 / 35%))`.

Anything else that changes in the dark, such as a shadow that grows, needs a dark value under
both dark selectors: the system preference, unless the page has opted out, and the class
that forces dark. The default theme does this for its two shadows:

```css
@media (prefers-color-scheme: dark) {
  :root:not(.light-mode) {
    --beam-shadow-floating: 0 4px 16px rgb(0 0 0 / 40%);
  }
}

:root.dark-mode {
  --beam-shadow-floating: 0 4px 16px rgb(0 0 0 / 40%);
}
```

The dark selectors outrank `:root`, so a later `:root` rule does not reach a shadow's dark
value. To change one, set it under the same two selectors.

A script that reads a token with `getPropertyValue` gets the `light-dark(...)` text, not the
colour on screen. Read a property that uses the token, such as `background-color`, instead.

The default theme also sets the four motion tokens to zero under
`@media (prefers-reduced-motion: reduce)`. A replacement theme should do the same.

beam styles its own components and nothing else. Set the page's own background, text colour
and font from the tokens:

```css
body {
  margin: 0;
  background: var(--beam-color-bg);
  color: var(--beam-color-text);
  font-family: var(--beam-font-family);
  font-size: var(--beam-font-size-base);
  line-height: var(--beam-line-height);
}
```

To change one instance, set a token on that element:

```css
beam-monogram.big {
  --beam-monogram-size: 48px;
}
```

### Token reference

These are all the custom properties the components read. `TOKENS`, exported from
`beam/theme`, is the same list as data. The default values are in
`src/theme/default-theme.ts`.

#### Colour

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-color-bg` | color | The window behind everything: the shell, the search keycap. |
| `--beam-color-surface` | color | A raised surface: the search box, a dialog, an open select or combobox list, the chosen segment of a segmented radio group. |
| `--beam-color-surface-alt` | color | A recessed strip: the banner under the top bar, a dialog footer, the track of a segmented radio group. Also a combobox badge with no colour of its own. |
| `--beam-color-panel` | color | The floating sidebar and status line. |
| `--beam-color-border` | color | Edges: the panels, the banner, the search box, buttons, fields, dialogs. |
| `--beam-color-border-soft` | color | Dividers inside a surface: between status segments, above the sidebar footer, above a dialog footer. |
| `--beam-color-text` | color | Body text, nav items, the current breadcrumb level, text in controls. |
| `--beam-color-muted` | color | Secondary text: group labels, earlier breadcrumb levels, the status line, icon buttons, placeholders, hints. |
| `--beam-color-accent` | color | The accent: a primary button, a switch that is on, a chosen radio, a focused field's edge, the search box edge under the pointer. |
| `--beam-color-on-accent` | color | What sits on the accent: a primary button's text, the knob of a switch that is on. Also the text on a success or danger toast. |
| `--beam-color-focus` | color | The keyboard focus outline on every control. |
| `--beam-color-success` | color | A success toast; a status segment with tone `ok`. |
| `--beam-color-warning` | color | A nav item count or note; a status segment with tone `warning`. |
| `--beam-color-danger` | color | A danger button, a field in error and its message, a danger toast, a status segment with tone `danger`. |
| `--beam-color-hover` | color | What a button or nav item sits on under the pointer. |
| `--beam-color-selected` | color | The active nav item; the highlighted option in a select or combobox list. |
| `--beam-color-overlay` | color | The veil behind an open dialog, and behind the sidebar drawer on a narrow screen. |
| `--beam-color-inverse-bg` | color | An info toast: a chip that stays dark in both modes. |
| `--beam-color-inverse-text` | color | Text on an info toast. |
| `--beam-color-inverse-border` | color | Edge of an info toast. |
| `--beam-color-inverse-hover` | color | A toast button under the pointer. |
| `--beam-color-field` | color | The fill of a text field, a textarea, a select and a radio, and the knob of a switch that is off. |
| `--beam-color-ring` | color | The halo around a focused field, outside its accent edge. |
| `--beam-color-danger-ring` | color | The halo around a field in error. |
| `--beam-color-on-tone` | color | Initials on a monogram tile; the letters on a combobox badge. |
| `--beam-tone-1` | color | Monogram tile fill 1 of 7. The monogram's seed picks one. |
| `--beam-tone-2` | color | Monogram tile fill 2 of 7. |
| `--beam-tone-3` | color | Monogram tile fill 3 of 7. |
| `--beam-tone-4` | color | Monogram tile fill 4 of 7. |
| `--beam-tone-5` | color | Monogram tile fill 5 of 7. |
| `--beam-tone-6` | color | Monogram tile fill 6 of 7. |
| `--beam-tone-7` | color | Monogram tile fill 7 of 7. |
| `--beam-accent-image` | image | Fill of the product name in the sidebar and the edge of the active nav item. Any `<image>`; one colour is `linear-gradient(c, c)`. |

#### Type

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-font-family` | font-family | The one family every component sets in. |
| `--beam-font-size-base` | length | The shell and toast text. |
| `--beam-font-size-display` | length | The page heading. |
| `--beam-font-size-body` | length | Nav items, text in fields, dialog text. |
| `--beam-font-size-control` | length | The breadcrumb, buttons, field labels. |
| `--beam-font-size-caption` | length | The status line, keycaps, the large monogram, hints and error messages. |
| `--beam-font-size-label` | length | Uppercase group labels in the sidebar and in a combobox list. |
| `--beam-font-weight-medium` | font-weight | The page heading, the active nav item, the current breadcrumb level, toasts, field labels. |
| `--beam-font-weight-semibold` | font-weight | The status line monogram, a dialog heading, the matched text in a combobox. |
| `--beam-font-weight-bold` | font-weight | The product name, monogram initials, a toast action. |
| `--beam-line-height` | number | The shell line height. |
| `--beam-letter-spacing-tight` | length | The page heading. |
| `--beam-letter-spacing-label` | length | Uppercase group labels. |

#### Space

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-space-s` | length | Small gaps: inside the breadcrumb, the sidebar, between toasts. |
| `--beam-space-m` | length | Banner padding, page heading gap. |
| `--beam-space-l` | length | Inside a toast. |

#### Controls

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-control-height` | length | A button, a select, the combobox field, a segmented radio group. |
| `--beam-control-height-s` | length | A small button (`size="s"`). |
| `--beam-control-height-touch` | length | A button or radio row sized for a finger (`size="touch"`). |
| `--beam-opacity-disabled` | number | A disabled control. |

#### Radius

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-radius-xs` | length | The status line monogram. |
| `--beam-radius-sm` | length | The small monogram, toast buttons, a focused status segment, rows in a select or combobox list. |
| `--beam-radius-md` | length | Nav items, toggles, breadcrumb buttons, the banner, toasts, the large monogram, fields. |
| `--beam-radius-lg` | length | The status line, a dialog. |
| `--beam-radius-xl` | length | The sidebar. |
| `--beam-radius-pill` | length | Buttons, the search box and its keycap, a switch. |

#### Shadow

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-shadow-floating` | shadow | What the sidebar, the status line and the chosen segment of a segmented radio group cast. |
| `--beam-shadow-raised` | shadow | What a toast, a dialog and an open select or combobox list cast. |

#### Motion

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-transition-fast` | transition | Hover fills and edges. |
| `--beam-transition-base` | transition | The drawer sliding in on a narrow screen. |
| `--beam-transition-sidebar` | transition | The sidebar folding to its rail. |
| `--beam-duration-fast` | time | A toast arriving. |

#### Layout

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-sidebar-width` | length | The sidebar, open. |
| `--beam-sidebar-collapsed-width` | length | The sidebar folded to its icon rail. |
| `--beam-header-height` | length | The top bar and the sidebar header beside it. |
| `--beam-window-inset` | length | How far the floating panels sit in from the window edge. |
| `--beam-icon-size` | length | An icon that is not `inline`. Set it on an icon or its container to size it. |

#### Component tokens

A theme does not set these four. The monogram and the toast give theirs a value, and an icon
is an outline until `--beam-icon-fill` is set. Set one on the element to override it.

| Token | Type | Purpose |
| --- | --- | --- |
| `--beam-icon-fill` | color | Fills an icon's shape as well as stroking it. It inherits, so it can be set on the control around the icon. |
| `--beam-monogram-size` | length | The monogram tile edge: 20px, or 32px at `size="l"`. |
| `--beam-toast-gutter` | length | The distance from the toast column to the window corner. Defaults to `--beam-space-l`. |
| `--beam-toast-max-width` | length | The widest a toast grows: 360px. |

Sizes that only one component's layout depends on, such as the gap between a nav item's icon
and its label, are written in the component and are not tokens.

## Components

In the tables below, each attribute is also a property in camelCase: `workspace-name` is
`workspaceName`. A name written with a dot, such as `.trail`, is a property with no
attribute. Set it from JavaScript or with a Lit `.trail=${...}` binding.

Every `beam-` event bubbles and crosses shadow roots, so a listener on the shell or the
document hears events from any component inside it. [Events](#events) lists them all.

### Shell

#### `beam-app-shell`

The application frame: a sidebar slot, a top bar with the breadcrumb, the search box and a
refresh button, a banner, the scrolling content area, the status line, and the toast region.

```js
import { html, render } from 'lit';
import 'beam/default-theme.css';
import 'beam/components/beam-app-shell.js';
import 'beam/components/beam-nav-sidebar.js';

const items = [
  { id: 'board', label: 'Board', icon: 'beam-icon-dashboard' },
  { id: 'flagged', label: 'Flagged', icon: 'beam-icon-flag', count: 3 },
];

render(
  html`
    <beam-app-shell
      workspace-name="Example board"
      workspace-key="example"
      screen-title="Board"
      .trail=${[{ label: 'Board' }]}
      .statusSegments=${[{ id: 'count', label: '12 records' }]}
    >
      <beam-nav-sidebar slot="sidebar" product-name="example" .items=${items} active="board"></beam-nav-sidebar>
      <p>The screen goes here.</p>
    </beam-app-shell>
  `,
  document.body,
);
```

The shell draws what it is given and reports what was pressed. The app holds the state: it
listens for the events and sets the properties.

```js
import { NAVIGATE_EVENT, SIDEBAR_TOGGLE_EVENT } from 'beam/events';

const shell = document.querySelector('beam-app-shell');
const sidebar = document.querySelector('beam-nav-sidebar');

shell.addEventListener(SIDEBAR_TOGGLE_EVENT, (event) => {
  shell.sidebarCollapsed = event.detail.collapsed;
  sidebar.collapsed = event.detail.collapsed;
});

shell.addEventListener(NAVIGATE_EVENT, (event) => {
  sidebar.active = event.detail.id;
});
```

Below 48rem wide the sidebar becomes a drawer over the content. Escape, a press on the
backdrop, and navigating all ask to close it with `beam-sidebar-toggle`. `narrowViewport()`,
exported with the shell, says whether the window is that narrow, so an app can start with the
sidebar collapsed.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `workspace-name` | `''` | The name of what is open: first in the breadcrumb and the status line. |
| `workspace-key` | `''` | Picks the name's monogram colour. Use something that does not change when the name does. |
| `switch-label` | `Switch workspace` | The tooltip on the name. |
| `switch-scope` | `workspaces` | The palette scope the name asks for when pressed. |
| `no-switch` | `false` | There is one workspace: the name in the breadcrumb is plain text. |
| `screen-title` | `''` | The page heading over the content. Empty draws none. |
| `title-hidden` | `false` | Keeps the page heading for assistive technology only. |
| `.trail` | `[]` | The breadcrumb levels after the name: `{ label, id? }`. |
| `search-label` | `Search` | The search box's word and accessible name. |
| `search-shortcut` | `⌘K` | The search box's keycap. |
| `search-key-shortcuts` | `Meta+K` | The same chord for `aria-keyshortcuts`. |
| `refresh-label` | `Refresh` | The refresh button's name and tooltip. |
| `.statusSegments` | `undefined` | What the status line holds after the name. Undefined draws no status line; an empty list draws the name alone. |
| `sidebar-collapsed` | `false` | The sidebar is folded, or the drawer is closed on a narrow screen. |
| `hide-sidebar` | `false` | No sidebar and no toggle for one. |
| `.scrollKey` | `undefined` | Changing it scrolls the content area back to the top. Pass something that changes with the screen. |
| `.narrowQuery` | `matchMedia('(max-width: 48rem)')` | The media query that decides the drawer layout. Replaceable in tests. |

| | |
| --- | --- |
| Slots | `sidebar`; `header-end`, after the breadcrumb; `banner`; `page-actions`, beside the page heading; the default slot for the screen |
| Parts | `sidebar`, `backdrop`, `header`, `nav-toggle`, `refresh`, `banner`, `content`, `page-head`, `status-line` |
| Events | `beam-sidebar-toggle`, `beam-refresh`, and those of the components inside it: `beam-navigate`, `beam-palette-open`, `beam-status-action` |

#### `beam-nav-sidebar`

The primary navigation, a floating panel that folds to an icon rail. It goes in the shell's
`sidebar` slot.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `.items` | `[]` | The nav items, in order. |
| `product-name` | `''` | The product's name, drawn beside the toggle. Empty draws none. |
| `active` | `''` | The `id` of the current item. |
| `collapsed` | `false` | Folded to the icon rail. |

A nav item:

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | string | Names the item; the `id` in `beam-navigate`. |
| `label` | string | The item's text. |
| `icon` | string | The tag name of an icon element, one of beam's or the app's own. |
| `disabled` | boolean | Drawn dimmed; pressing it sends nothing. |
| `group` | string | A group heading. Consecutive items with the same group are drawn together. |
| `count` | number | A figure at the item's right edge. Hidden at 0. |
| `note` | string | A few words in place of the figure, such as "1 blocking". |
| `pinned` | boolean | Drawn in the footer, below every group. |

| | |
| --- | --- |
| Slots | `mark`, for a logo before the product name |
| Parts | `head`, `toggle`, `product-name`, `group-label`, `item` (with `active` on the current one), `footer` |
| Events | `beam-navigate` `{ id }`, `beam-sidebar-toggle` `{ collapsed }` |

#### `beam-breadcrumb`

Where the user is: the workspace name with its monogram, then the screen, then any level
below it. The shell draws one in its top bar.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `workspace-name` | `''` | The name of what is open. |
| `workspace-key` | `''` | Picks the monogram colour. |
| `switch-label` | `Switch workspace` | The tooltip on the name. |
| `switch-scope` | `workspaces` | The palette scope the name asks for. |
| `no-switch` | `false` | The name is plain text, not a button. |
| `.trail` | `[]` | The levels after the name, outermost first: `{ label, id? }`. A level with an `id` is a button, except the last, which is where the user is. |

| | |
| --- | --- |
| Parts | `workspace`, `level` |
| Events | `beam-palette-open` `{ scope }` from the name, `beam-navigate` `{ id }` from an earlier level |

#### `beam-status-line`

The floating line under the content: the workspace name, then the app's segments on either
side of a spacer. The shell draws one when it has `statusSegments`. The line is hidden below
48rem.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `workspace-name` | `''` | The name of what is open. Empty draws no name. |
| `workspace-key` | `''` | Picks the monogram colour. |
| `switch-label` | `Switch workspace` | The tooltip on the name. |
| `switch-scope` | `workspaces` | The palette scope the name asks for. |
| `.segments` | `[]` | What the line holds after the name. |

A status segment:

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | string | Names the segment. It is a class on the element and the `id` in `beam-status-action`. |
| `label` | string | The segment's text. |
| `icon` | string | The tag name of an icon element drawn before the label. |
| `iconSize` | number | The icon's size in pixels. |
| `kbd` | string | A keycap drawn before the label, such as `⌘K`. |
| `keyShortcuts` | string | The chord for `aria-keyshortcuts`, such as `Meta+K`. |
| `title` | string | The tooltip. |
| `side` | `start` \| `end` | `start` (the default) sits after the name, `end` after the spacer. |
| `kind` | `plain` \| `text` \| `status` | `plain` (the default) is never shortened. `text` can be selected and is cut short with an ellipsis. `status` is an icon and a label, and the label hides when the line is narrower than 560px. |
| `tone` | `ok` \| `warning` \| `danger` | A colour for the whole segment. |
| `drops` | `first` \| `second` | When the segment goes as the line narrows: `first` below 760px, `second` below 620px. |
| `palette` | string | Makes the segment a button that sends `beam-palette-open` with this scope. |
| `navigate` | string | Makes the segment a button that sends `beam-navigate` with this id. |
| `action` | boolean | Makes the segment a button that sends `beam-status-action` with its own `id`. |

| | |
| --- | --- |
| Slots | `start` and `end`, beside the segments on each side of the spacer |
| Parts | `workspace`, `segment` |
| Events | `beam-palette-open` `{ scope }`, `beam-navigate` `{ id }`, `beam-status-action` `{ id }` |

#### `beam-search-pill`

The top bar's search box: a button that asks for the palette. Below 48rem it folds to its
icon.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `label` | `Search` | The visible word and the accessible name. |
| `shortcut` | `⌘K` | The keycap's text. |
| `key-shortcuts` | `Meta+K` | The same chord for `aria-keyshortcuts`. |

| | |
| --- | --- |
| Parts | `button`, `keycap` |
| Events | `beam-palette-open` with `{ scope: 'all' }` |

The pill shows the shortcut and does not listen for it. The app binds the key.

#### `beam-monogram`

A name's initials on a tinted tile. It is decorative and hidden from assistive technology, so
print the name beside it.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `name` | `''` | The name the initials come from: "Acme Consulting LLC" is "AC", "Globex" is "GL". |
| `seed` | `''` | Picks one of the seven tones. The same seed always gives the same tone. Falls back to `name`. |
| `size` | `s` | `s` is 20px, `l` is 32px. |

| | |
| --- | --- |
| Parts | `tile` |

`monogramInitials(name)` and `monogramTone(seed)` are exported for an app that draws its own.

#### `beam-toast`

The toast region. The shell holds one, so an app that uses the shell sends toasts and does
not add the element.

```js
import { dispatchToast } from 'beam/components/beam-toast.js';

dispatchToast(window, { message: 'Saved.' });
dispatchToast(window, {
  message: 'Item deleted.',
  action: { label: 'Undo', onClick: () => console.log('undone') },
});
```

`dispatchToast(target, detail)` sends `beam-toast` from `target`. The element listens on
`window`, so a toast sent from anywhere in the page arrives, including from inside a dialog.
A toast sent before the element is in the page is not shown, so send the first one after the
shell has rendered.

| Detail field | Type | Purpose |
| --- | --- | --- |
| `message` | string | The text. A toast with no message is ignored. |
| `variant` | `info` \| `success` \| `danger` | `info` is the default. A danger toast is announced as an alert. |
| `duration` | number | Milliseconds until the toast goes: 4000, or 8000 with an action. Zero or less keeps it until dismissed, with a close button if it has no action. |
| `action` | `{ label, onClick }` | A button on the toast. Pressing it runs `onClick` and dismisses the toast. |

At most three toasts show at once; a fourth removes the oldest.

| | |
| --- | --- |
| Properties | `.initial`: one toast detail or a list, shown when the element connects |
| Methods | `show(detail)` shows a toast and returns its id; `dismiss(id)` removes one, and `dismiss()` removes all |
| Parts | `toast`, `action`, `close` |

#### Icons

Six icons, each an element: `beam-icon-dashboard`, `beam-icon-search`, `beam-icon-flag`,
`beam-icon-refresh`, `beam-icon-chevron-down`, `beam-icon-menu`. An icon takes the text
colour around it.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `label` | `''` | An accessible name. With none, the icon is decorative and hidden from assistive technology. |
| `inline` | `false` | Sizes the icon to the text it sits in (1em), not to `--beam-icon-size`. |

An app draws its own icons on `BeamIconBase` under its own tag names. A subclass supplies its
paths on a 24×24 grid; the stroke, sizing, `inline` and `label` come from the base.

```js
import { svg } from 'lit';
import { BeamIconBase } from 'beam/icons';

class MyIconInbox extends BeamIconBase {
  renderIcon() {
    return svg`<path d="M3 5h18v14H3zM3 10h18M9 10v9"/>`;
  }
}
customElements.define('my-icon-inbox', MyIconInbox);
```

The `icon` of a nav item or status segment is any registered tag name, so `'my-icon-inbox'`
works there.

### Form controls

The controls wrap the native elements, so the keyboard, the screen reader and the platform's
pickers behave as they do for a plain `<input>` or `<select>`.

```html
<form>
  <beam-input name="title" label="Title" required></beam-input>
  <beam-textarea name="body" label="Body"></beam-textarea>
  <beam-select name="priority" label="Priority">
    <option value="high">High</option>
    <option value="low" selected>Low</option>
  </beam-select>
  <beam-radio-group name="when" label="When" value="soon">
    <option value="now">Now</option>
    <option value="soon">Soon</option>
  </beam-radio-group>
  <beam-switch name="blocked">Blocked</beam-switch>
  <beam-button type="reset">Reset</beam-button>
  <beam-button type="submit" variant="primary">Save</beam-button>
</form>
```

#### Shared by every field

`beam-input`, `beam-textarea`, `beam-select`, `beam-switch`, `beam-radio-group` and
`beam-combobox` share these attributes.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `name` | `''` | The name the value is submitted under. |
| `label` | `''` | The label over the field. |
| `hint` | `''` | A line of help under the field. Hidden while an error shows. |
| `error` | `''` | A message saying why the value is refused. The field keeps the value as typed, shows the message, and is invalid while it is set. |
| `disabled` | `false` | Disables the control and leaves it out of the form's data. |
| `required` | `false` | The control is invalid while empty. |

Each one is form-associated through `ElementInternals`:

- A control with a `name` is in the form's `FormData`.
- `form.reset()` puts back the value the control started with.
- `required` and `error` make the control invalid, and an invalid control stops the form
  submitting.
- A disabled `<fieldset>` disables the controls inside it.
- Enter in a `beam-input` submits the form. In a `beam-textarea` it is ⌘↵ or Ctrl↵.

| | |
| --- | --- |
| Properties | `form`, `validity`, `validationMessage` |
| Methods | `checkValidity()`, `reportValidity()`, `focus()` |
| Events | `change`, when a value is committed. It bubbles. |

#### `beam-button`

| Attribute | Default | Purpose |
| --- | --- | --- |
| `variant` | `secondary` | `secondary` (an edge), `primary` (the accent fill), `danger`, `ghost` (no edge) or `icon` (a square; give it a `label`). |
| `size` | `m` | `s`, `m` or `touch` (44px in the default theme). |
| `type` | `button` | `submit` and `reset` act on the form the button is in. |
| `disabled` | `false` | Not pressable. |
| `loading` | `false` | Keeps its width, shows a spinner in place of the icon, and is not pressable. |
| `label` | `''` | The accessible name, for a button whose content is only an icon. |

| | |
| --- | --- |
| Slots | The default slot for the label; `icon`, before it |
| Parts | `button` |
| Events | `click`, as for a native button |

#### `beam-input`

A single-line text field.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `value` | `''` | The text. |
| `type` | `text` | `text`, `email`, `url`, `search`, `tel`, `password`, `number`, `date` or `month`. |
| `placeholder` | `''` | Shown while the field is empty. |
| `autocomplete`, `inputmode`, `min`, `max`, `step`, `maxlength` | unset | Passed to the native input. |
| `readonly` | `false` | Shown and submitted, and not typed into. |

| | |
| --- | --- |
| Methods | `select()` selects the text |
| Parts | `label`, `input`, `hint`, `error` |
| Events | `input` as the text is typed, `change` when it is committed |

#### `beam-textarea`

A text area that grows with its text up to `max-lines`, then scrolls.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `value` | `''` | The text, kept exactly as typed. |
| `placeholder` | `''` | Shown while the field is empty. |
| `rows` | `3` | The height when empty, in lines. |
| `max-lines` | `12` | The height at which it stops growing and scrolls. |
| `maxlength` | unset | Passed to the native textarea. |

| | |
| --- | --- |
| Parts | `label`, `textarea`, `hint`, `error` |
| Events | `input`, `change` |

#### `beam-select`

The native select. Options are `<option>` children, with `value`, `disabled` and `selected`
as usual. `data-color` on an option gives it a coloured dot.

Where the browser supports `appearance: base-select`, the open list is drawn from the theme.
Elsewhere the closed field is themed and the list is the system's.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `value` | `''` | The chosen option's value. With no `placeholder`, the first option is chosen to start with. |
| `placeholder` | `''` | Shown, and submitted as empty, while nothing is chosen. |

| | |
| --- | --- |
| Parts | `label`, `select`, `hint`, `error` |
| Events | `change` |

#### `beam-switch`

A checkbox with the switch role. It submits `value` when on and nothing when off.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `checked` | `false` | On. |
| `value` | `on` | What the form gets when the switch is on. |
| `loading` | `false` | Shows a spinner and refuses presses while a change is saved. |

| | |
| --- | --- |
| Slots | The default slot for the label. Without it, `label` is drawn. |
| Parts | `row`, `switch`, `hint`, `error` |
| Events | `change` |

#### `beam-radio-group`

A fieldset of native radios. Choices are `<option>` children, as for a select.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `value` | `''` | The chosen option's value. |
| `variant` | `list` | `segmented` draws the choices as segments side by side, for three or so short ones. |
| `size` | `m` | `touch` makes each row 44px in the default theme. |

| | |
| --- | --- |
| Parts | `fieldset`, `label`, `options`, `option`, `hint`, `error` |
| Events | `change` |

#### `beam-combobox`

A text field with a filtered list under it, for long or searchable lists such as people or
records.

```js
import 'beam/components/beam-combobox.js';

const who = document.querySelector('beam-combobox');
who.options = [
  { value: 'ana', label: 'Ana', badge: 'AN', note: 'Owner' },
  { value: 'sam', label: 'Sam', badge: 'SA' },
];
who.addEventListener('change', () => console.log(who.value));
```

Typing filters the list. ↑ and ↓ move the highlight, Home and End go to the ends, ↵ picks,
and Esc closes the list. The list shows up to eight rows, then scrolls. It is a popover in
the top layer, so no container clips it.

| Attribute | Default | Purpose |
| --- | --- | --- |
| `.options` | `[]` | The choices. |
| `value` | `''` | The chosen option's value. |
| `placeholder` | `''` | Shown while the field is empty. |
| `loading` | `false` | Shows `loading-text` in place of the list, while options are fetched. |
| `loading-text` | `Finding…` | The line shown while `loading`. |
| `no-match` | `Nothing matches "{query}".` | The line shown when nothing matches. `{query}` is the typed text. |
| `allow-free` | `false` | ↵ commits typed text that matches no option as the value. |

An option:

| Field | Type | Purpose |
| --- | --- | --- |
| `value` | string | What is submitted. |
| `label` | string | What is shown and filtered on. |
| `group` | string | Options with the same group are drawn under its heading. |
| `badge` | string | Up to two characters on a small tile before the label, such as initials. |
| `color` | string | The tile's colour. |
| `note` | string | A few muted words at the end of the row, such as a role. |

| | |
| --- | --- |
| Properties | `query`, the typed text; `selected`, the chosen option; `shown`, the options that match |
| Parts | `label`, `input`, `list`, `hint`, `error` |
| Events | `input` as the text is typed (read `query`), `change` when a value is chosen |

#### `beam-dialog`

A modal dialog on the native `<dialog>`. The browser provides the backdrop, makes the rest of
the page inert, and returns focus to the opener.

```html
<beam-dialog label="Delete this item?">
  <p>The file is removed at the next sync.</p>
  <beam-button slot="footer" autofocus>Cancel</beam-button>
  <beam-button slot="footer" variant="danger">Delete item</beam-button>
</beam-dialog>
```

```js
const dialog = document.querySelector('beam-dialog');
const opener = document.querySelector('#delete');

opener.addEventListener('click', () => dialog.show());
dialog.addEventListener('close', () => console.log(dialog.returnValue));
```

| Attribute | Default | Purpose |
| --- | --- | --- |
| `open` | `false` | Whether the dialog is showing. |
| `label` | `''` | The heading, which also names the dialog for a screen reader. |
| `size` | `confirm` | `confirm` is 440px wide, `form` is 620px. |

| | |
| --- | --- |
| Properties | `returnValue`, the value given to `close()` or `requestClose()` |
| Methods | `show()` opens it; `close(value)` closes it now; `requestClose(value)` sends `cancel` first, as Escape does |
| Slots | The default slot for the body; `footer` for the buttons, the primary one last |
| Parts | `dialog`, `header`, `body`, `footer` |
| Events | `cancel`, cancelable: call `preventDefault()` to keep the dialog open. Then `close`. |

Focus starts on the element with `autofocus`, else the first field, else the first button.

## Extending and wrapping

There are four ways to change a component, from lightest to heaviest.

1. **Set tokens.** On `:root` for the whole app, or on one element for one instance.
2. **Style parts.** Each component names the pieces worth styling, listed under Parts above.
   A rule reaches them with `::part()`:

   ```css
   beam-nav-sidebar::part(item active) {
     font-weight: 700;
   }
   ```

   A part rule reaches one shadow root down. A rule in the document styles a sidebar that
   sits in the document. A sidebar rendered inside your own component is styled from that
   component's styles.
3. **Fill slots.** Put your own markup where a component leaves room, listed under Slots above.
4. **Wrap it.** When a component needs behaviour or markup that none of these give, write
   your own element that renders the beam component and adds what is missing. Pass properties
   through, listen for its events, and style it with tokens and parts.

Subclassing also works: `class MyShell extends BeamAppShell`, registered under your own tag,
with ``static styles = [BeamAppShell.styles, css`...`]``. A subclass depends on a component's
internals, which can change between releases. A wrapper depends only on what this README
documents.

A new field can extend `BeamField`, exported from `beam`. It provides the label, hint, error
and form behaviour that the controls share.

### What belongs in beam

A component or an icon moves into beam only once both apps use it. Until then it lives in the
app that has it, built on the same tokens so that it can move later without change.

beam holds no product-specific words, colours or fonts. A component that moves in turns each
of those into a token, a property or a slot with a neutral default.

## Colour mode

Light and dark are three states held as two classes on `<html>`:

| State | Class on `<html>` | Result |
| --- | --- | --- |
| `system` | none | Follows `prefers-color-scheme`, live. |
| `light` | `light-mode` | Light, whatever the system says. |
| `dark` | `dark-mode` | Dark, whatever the system says. |

The app chooses where the choice is stored. Every function that reads or writes it takes the
app's own `localStorage` key, and beam has no key of its own, so two apps on one origin keep
separate choices.

```js
import { initColorMode, writeMode, applyMode } from 'beam/theme';

const KEY = 'example.color-mode';

initColorMode({ storageKey: KEY }); // at start-up

writeMode(KEY, 'dark'); // when the person picks one
applyMode('dark');
```

| Function | What it does |
| --- | --- |
| `initColorMode({ storageKey })` | Reads the stored mode and applies it. Returns the mode. |
| `readMode(storageKey)` | The stored mode, or `system`. |
| `writeMode(storageKey, mode)` | Stores the mode. |
| `applyMode(mode)` | Sets the classes on `<html>`. |
| `resolveMode(mode)` | `light` or `dark`: what `system` currently means. |
| `darkModeQuery()` | The `matchMedia` handle to watch for a system change. |
| `colorModeBootScript(storageKey)` | The text of an inline script that applies the stored mode. |

Put the text from `colorModeBootScript(KEY)` in an inline `<script>` in `<head>`, so a dark
page does not flash light while the bundle loads.

`COLOR_MODES`, `LIGHT_CLASS` and `DARK_CLASS` are exported as well.

## Events

Every event beam defines is named `beam-<what>`, bubbles, and crosses shadow roots. Listen
with the exported names, not the strings.

| Constant | Event | Detail | Sent by |
| --- | --- | --- | --- |
| `NAVIGATE_EVENT` | `beam-navigate` | `{ id }` | A nav item, an earlier breadcrumb level, a status segment with `navigate` |
| `PALETTE_OPEN_EVENT` | `beam-palette-open` | `{ scope }` | The workspace name, the search box (`all`), a status segment with `palette` |
| `STATUS_ACTION_EVENT` | `beam-status-action` | `{ id }` | A status segment with `action` |
| `SIDEBAR_TOGGLE_EVENT` | `beam-sidebar-toggle` | `{ collapsed }` | The sidebar's toggle, the shell's toggle, and the shell closing its drawer |
| `REFRESH_EVENT` | `beam-refresh` | none | The shell's refresh button |
| `TOAST_EVENT` | `beam-toast` | A toast detail | The app, with `dispatchToast` |

Every event but `beam-toast` is a request: the component says what was pressed and the app
acts on it. beam has no command palette, so `beam-palette-open` is the app's cue to open its
own. The first entry of `event.composedPath()` is the control that was pressed, so the app
can return focus to it when the palette closes.

`EVENT_PREFIX` is the `beam` in each name. `emit(from, type, detail)` sends an event the same
way the components do, and `dispatchPaletteOpen(from, scope)` sends `beam-palette-open`.

The form controls and the dialog use the standard names: `input`, `change`, `cancel` and
`close`.

## Development

Node 20.19 or newer.

```
npm install --ignore-scripts
npm run build
npm test
```

| Script | What it does |
| --- | --- |
| `npm run build` | Compiles `src/` to `dist/` with `tsc`, then writes `dist/css/default.css`. |
| `npm run dev` | The same compile, watching. It does not write the CSS file. |
| `npm test` | The unit tests, in Vitest with jsdom. |
| `npm run test:browser` | The browser tests, in Playwright. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint over `src`, `preview` and `e2e`. |
| `npm run demo` | The preview page, on <http://localhost:9090>. |
| `npm run clean` | Deletes `dist/`. |

### Tests

The unit tests cover each component's behaviour and run axe on every preview state. Two of
them are guards on the source:

- `src/__tests__/token-contract.test.ts` checks that the components read only the tokens in
  `TOKENS`, that every token is read, that the default theme sets every token except the four
  component tokens, and that the token tables in this README list the same names and types in
  the same order. A new token goes in `src/theme/tokens.ts`, the default theme and this README
  together.
- `src/__tests__/no-inline-colours.test.ts` fails on a colour literal in a component, an icon
  or the preview page. Colours come from tokens.

The browser tests need Chrome installed. They load the components in it under two themes, and
drive the form controls in a real form. Playwright starts its own server on port 9191. Run
`npm run build` first, because the test pages load `dist/css/default.css`. To use
Playwright's own Chromium, install it and set `BEAM_E2E_CHANNEL` to an empty string.

A CI job runs these in order: `npm ci --ignore-scripts`, `npm run lint`, `npm run typecheck`,
`npm run build`, `npm test`, `npm run test:browser`.

### The preview page

`npm run demo` lists every component with its states under the default theme, with a switch
for light, dark and system. Build first: the page loads `dist/css/default.css`.

A component's states are in a `*.preview.ts` file beside it, which the page finds by name.
`src/components/__mocks__/` holds the example data and icons the previews and tests use.

### Using a local copy in an app

An app can depend on a folder in place of a release:

```json
"beam": "file:../beam"
```

The app reads `dist/`, so run `npm run build` here first and again after each change.

## Releasing

A release is a tarball attached to a GitHub release. For version 0.2.0:

1. Set the version in `package.json` and `package-lock.json`, and commit the change.

   ```
   npm version 0.2.0 --no-git-tag-version
   ```

2. Build from clean. `tsc` does not delete the output of a source file that has been removed,
   and the tarball takes everything in `dist/`.

   ```
   npm run clean
   npm run build
   ```

3. Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run test:browser`.

4. Pack. This writes `madebyraygun-beam-0.2.0.tgz`.

   ```
   npm pack
   ```

5. Tag the commit and push the tag.

   ```
   git tag v0.2.0
   git push origin v0.2.0
   ```

6. Create a GitHub release for the tag and attach the tarball.

   ```
   gh release create v0.2.0 madebyraygun-beam-0.2.0.tgz
   ```

Apps then install
`https://github.com/madebyraygun/beam/releases/download/v0.2.0/madebyraygun-beam-0.2.0.tgz`.

## Licence

MIT. See [LICENSE](LICENSE).
