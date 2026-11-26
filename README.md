# shared-ui

The theme and the application frame that more than one app is built on: design tokens,
the bundled typeface, and seven Lit components (the shell, the sidebar, the breadcrumb, the
status line, the search box, the monogram, the toast) with their icons.

The package name is a placeholder. It is set in one place, the `name` field of
`package.json`. Apps do not write that name in their source: each app's `package.json` gives
the dependency its own local name (`"shared-ui": "..."`), and its source imports `shared-ui`.
Renaming the package changes one line in each app.

## What is in it

| Import | What it gives |
| --- | --- |
| `shared-ui/theme.css` | The stylesheet: every token, light and dark, the font faces, the print sheet. Load it once, in the page. |
| `shared-ui/theme` | The same tokens as Lit styles, `controlsCss` (the shape and fill of Web Awesome's buttons and switches, for a component that hosts them), and the light and dark mode functions (`initColorMode` and the rest). |
| `shared-ui/components/<name>.js` | One component, registered on import: `wc-app-shell`, `wc-nav-sidebar`, `wc-breadcrumb`, `wc-status-line`, `wc-search-pill`, `wc-monogram`, `wc-toast`. |
| `shared-ui/icons` | The `wc-icon-*` elements. |
| `shared-ui` | All components and icons. |

`lit` and `@awesome.me/webawesome` are peer dependencies: the app installs them, so there is
one copy of each on the page.

## What an app passes in

```html
<wc-app-shell
  book-name="Example board"
  book-key="example"
  screen-title="Board"
  .trail=${[{ label: 'Board' }]}
  .statusSegments=${segments}
>
  <wc-nav-sidebar slot="sidebar" product-name="tack" .items=${items} active="board">
    <svg slot="mark" ...></svg>
  </wc-nav-sidebar>
  ...the screen...
</wc-app-shell>
```

- **The product's name and mark.** `wc-nav-sidebar` draws `product-name` beside its toggle,
  and whatever is in its `mark` slot before it. With neither, it draws only the toggle.
- **The status line.** `statusSegments` on the shell (or `segments` on `wc-status-line`) is
  the list of what the line holds after the name: each segment has an `id`, a `label`, and
  optionally an icon, a keycap, a tooltip, a side (`start` or `end` of the line), a tone, a
  kind (`text` for something to select and copy, `status` for an icon with a label that
  hides when narrow), and when it drops out as the line narrows. A segment with `navigate`,
  `palette` or `action` is a button; it sends `nc-navigate`, `nc-palette-open` or
  `nc-status-action` with its id. Leave `statusSegments` undefined and the shell draws no
  status line; pass an empty list for the name alone. `wc-status-line` also has `start` and
  `end` slots. The full type is `StatusSegment` in `src/components/wc-status-line.ts`.

`src/components/__mocks__/status.ts` holds the segment list of a bookkeeping app (folder,
lock, review count, palette hint, version) as a worked example; the tests and the demo page
use it.

## Working on it

```
npm install --ignore-scripts
npm run build       # tsc to dist/, then dist/css/nigel.css and dist/fonts/
npm test            # vitest: components in jsdom with axe, the theme's token and contrast tests, the source guards
npm run typecheck
npm run lint
npm run demo        # the demo page on http://localhost:9090
```

The demo page lists every component with its states, in light and dark, with no app
around it. A state is a `*.preview.ts` file beside the component. Build once before running
it: the page loads the built stylesheet.

Node 20.19 or newer. No package here needs its install scripts.

An app that uses the package from a folder beside it (`"shared-ui": "file:../shared-ui"`)
reads `dist/`, so build here first, and again after a change.

## Names that still belong to the first app

These came with the code and are left as they are so that the first app's pages do not
change. Each is a rename across both apps, to be done when the package has its name.

- The stylesheet file is `dist/css/nigel.css`; the theme export is `nigelTheme`; the palette
  is `NIGEL_PALETTE`. Apps import the stylesheet as `shared-ui/theme.css`, so the file name
  is not in their source.
- The colour mode is kept in local storage under `nigel.color-mode`. Two apps on one origin
  would share it.
- The shell, breadcrumb and status line call the first level of the trail a "book"
  (`book-name`, `book-key`, the tooltip "Switch books", the palette scope `books`).
- Custom properties are `--wa-*` (the names Web Awesome reads) and `--nc-*`; events are
  `nc-*`.
- Some tokens are for one app's screens (`--nc-color-arcade-*`, `--nc-color-income`,
  `--nc-color-document-bg`).

## Where the design comes from

Token values are typed by hand from the designer's handoff table. `theme-tests/handoff-tokens.test.ts`
carries a copy of that table and fails when a token and the table disagree, so a change
to either is made in both.

## Typeface

`src/theme/fonts/` holds four weights of IBM Plex Mono as subsets, with the SIL Open Font
License 1.1 beside them. The licence file is copied to `dist/fonts/` with the fonts.
`scripts/subset-fonts.mjs` remakes them and is run by hand only.

## Licence

Not chosen yet. Web Awesome is MIT and stays a dependency: none of its files are copied
here. The fonts are under the OFL as above.

## For CI

There are no workflow files here. A job that checks this repository needs Node 20.19 or
newer and these steps, in this order: install with `npm ci --ignore-scripts`; `npm run lint`;
`npm run typecheck`; `npm run build`; `npm test`. The tests need no browser. One test
runs the build itself, so the job needs no built output beforehand. Nothing is downloaded
beyond the npm packages.

A job that publishes would run the same steps and then `npm publish`, after `private` is
removed from `package.json` and the name is set.
