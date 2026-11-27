/**
 * The token contract: every custom property a component reads.
 *
 * A theme sets these on `:root` (and again under the dark-mode selectors for
 * the ones that change). The README's token table is this list, and a test
 * holds the two together, holds the components to reading nothing else, and
 * holds the default theme to filling every entry.
 *
 * `local` tokens are a component's own knobs: the component gives them a
 * value on its host, so a theme need not set them, and a rule on the element
 * from outside overrides that value.
 */
export interface TokenSpec {
  name: `--beam-${string}`;
  /** The CSS value it must hold. */
  type: 'color' | 'image' | 'length' | 'font-family' | 'font-weight' | 'number' | 'shadow' | 'transition' | 'time';
  purpose: string;
  local?: true;
}

export const MONOGRAM_TONES = 7;

const tones: TokenSpec[] = Array.from({ length: MONOGRAM_TONES }, (_, i) => ({
  name: `--beam-tone-${i + 1}` as const,
  type: 'color' as const,
  purpose: `Monogram tile fill number ${i + 1} of ${MONOGRAM_TONES}; a seed picks one.`,
}));

export const TOKENS: readonly TokenSpec[] = [
  // Colour
  { name: '--beam-color-bg', type: 'color', purpose: 'The window behind everything: the shell, the search keycap.' },
  { name: '--beam-color-surface', type: 'color', purpose: 'A raised control on the window: the search box.' },
  { name: '--beam-color-surface-alt', type: 'color', purpose: 'The banner strip under the top bar.' },
  { name: '--beam-color-panel', type: 'color', purpose: 'The floating sidebar and status line.' },
  { name: '--beam-color-border', type: 'color', purpose: 'Edges of the panels, the banner and the search box.' },
  { name: '--beam-color-border-soft', type: 'color', purpose: 'Dividers inside a panel: between status segments, above the sidebar footer.' },
  { name: '--beam-color-text', type: 'color', purpose: 'Body text, nav items, the current breadcrumb level.' },
  { name: '--beam-color-muted', type: 'color', purpose: 'Secondary text: group labels, earlier breadcrumb levels, the status line, icon buttons.' },
  { name: '--beam-color-accent', type: 'color', purpose: 'The accent: the search box edge under the pointer.' },
  { name: '--beam-color-on-accent', type: 'color', purpose: 'Text on a success or danger toast.' },
  { name: '--beam-color-focus', type: 'color', purpose: 'The keyboard focus outline on every control.' },
  { name: '--beam-color-success', type: 'color', purpose: 'A success toast; a status segment with tone `ok`.' },
  { name: '--beam-color-warning', type: 'color', purpose: 'A nav item count or note; a status segment with tone `warning`.' },
  { name: '--beam-color-danger', type: 'color', purpose: 'A danger toast; a status segment with tone `danger`.' },
  { name: '--beam-color-hover', type: 'color', purpose: 'What a button or nav item sits on under the pointer.' },
  { name: '--beam-color-selected', type: 'color', purpose: 'The active nav item fill.' },
  { name: '--beam-color-overlay', type: 'color', purpose: 'The veil behind the open drawer on a narrow screen.' },
  { name: '--beam-color-inverse-bg', type: 'color', purpose: 'An info toast: a chip that stays dark in both modes.' },
  { name: '--beam-color-inverse-text', type: 'color', purpose: 'Text on an info toast.' },
  { name: '--beam-color-inverse-border', type: 'color', purpose: 'Edge of an info toast.' },
  { name: '--beam-color-inverse-hover', type: 'color', purpose: 'A toast button under the pointer.' },
  { name: '--beam-color-field', type: 'color', purpose: 'The fill of a text field, select and textarea.' },
  { name: '--beam-color-ring', type: 'color', purpose: 'The halo around a focused text field, outside its accent edge.' },
  { name: '--beam-color-danger-ring', type: 'color', purpose: 'The halo around a field in error.' },
  { name: '--beam-color-on-tone', type: 'color', purpose: 'Initials on a monogram tile.' },
  ...tones,
  {
    name: '--beam-accent-image',
    type: 'image',
    purpose: 'Fill of the product name in the sidebar and the edge of the active nav item. Any `<image>`; one colour is `linear-gradient(c, c)`.',
  },

  // Type
  { name: '--beam-font-family', type: 'font-family', purpose: 'The one family every component sets in.' },
  { name: '--beam-font-size-base', type: 'length', purpose: 'The shell and toast text.' },
  { name: '--beam-font-size-display', type: 'length', purpose: 'The page heading.' },
  { name: '--beam-font-size-body', type: 'length', purpose: 'Nav items.' },
  { name: '--beam-font-size-control', type: 'length', purpose: 'The breadcrumb.' },
  { name: '--beam-font-size-caption', type: 'length', purpose: 'The status line, keycaps, the large monogram.' },
  { name: '--beam-font-size-label', type: 'length', purpose: 'Uppercase nav group labels.' },
  { name: '--beam-font-weight-medium', type: 'font-weight', purpose: 'The page heading, the active nav item, the current breadcrumb level, toasts.' },
  { name: '--beam-font-weight-semibold', type: 'font-weight', purpose: 'The status line monogram.' },
  { name: '--beam-font-weight-bold', type: 'font-weight', purpose: 'The product name, monogram initials, a toast action.' },
  { name: '--beam-line-height', type: 'number', purpose: 'The shell line height.' },
  { name: '--beam-letter-spacing-tight', type: 'length', purpose: 'The page heading.' },
  { name: '--beam-letter-spacing-label', type: 'length', purpose: 'Nav group labels.' },

  // Space
  { name: '--beam-space-s', type: 'length', purpose: 'Small gaps: inside the breadcrumb, the sidebar, between toasts.' },
  { name: '--beam-space-m', type: 'length', purpose: 'Banner padding, page heading gap.' },
  { name: '--beam-space-l', type: 'length', purpose: 'Inside a toast.' },

  // Controls
  { name: '--beam-control-height', type: 'length', purpose: 'A button, a select and the combobox field.' },
  { name: '--beam-control-height-s', type: 'length', purpose: 'A small button (`size="s"`).' },
  { name: '--beam-control-height-touch', type: 'length', purpose: 'A control sized for a finger (`size="touch"`), and a radio row on touch.' },
  { name: '--beam-opacity-disabled', type: 'number', purpose: 'A disabled control.' },

  // Radius
  { name: '--beam-radius-xs', type: 'length', purpose: 'The status line monogram.' },
  { name: '--beam-radius-sm', type: 'length', purpose: 'The small monogram, toast buttons, a focused status segment.' },
  { name: '--beam-radius-md', type: 'length', purpose: 'Nav items, toggles, breadcrumb buttons, the banner, toasts, the large monogram.' },
  { name: '--beam-radius-lg', type: 'length', purpose: 'The status line.' },
  { name: '--beam-radius-xl', type: 'length', purpose: 'The sidebar.' },
  { name: '--beam-radius-pill', type: 'length', purpose: 'The search box, its keycap, the refresh button.' },

  // Shadow
  { name: '--beam-shadow-floating', type: 'shadow', purpose: 'What the sidebar and status line cast.' },
  { name: '--beam-shadow-raised', type: 'shadow', purpose: 'What a toast casts.' },

  // Motion
  { name: '--beam-transition-fast', type: 'transition', purpose: 'Hover fills and edges.' },
  { name: '--beam-transition-base', type: 'transition', purpose: 'The drawer sliding in on a narrow screen.' },
  { name: '--beam-transition-sidebar', type: 'transition', purpose: 'The sidebar folding to its rail.' },
  { name: '--beam-duration-fast', type: 'time', purpose: 'A toast arriving.' },

  // Layout
  { name: '--beam-sidebar-width', type: 'length', purpose: 'The sidebar, open.' },
  { name: '--beam-sidebar-collapsed-width', type: 'length', purpose: 'The sidebar folded to its icon rail.' },
  { name: '--beam-header-height', type: 'length', purpose: 'The top bar and the sidebar header beside it.' },
  { name: '--beam-window-inset', type: 'length', purpose: 'How far the floating panels sit in from the window edge.' },
  { name: '--beam-icon-size', type: 'length', purpose: 'An icon that is not `inline`. Set it on an icon or its container to size it.' },

  // A component's own knobs
  { name: '--beam-icon-fill', type: 'color', purpose: 'Fills an icon shape as well as stroking it. Unset: outline only.', local: true },
  { name: '--beam-monogram-size', type: 'length', purpose: 'The monogram tile edge. 20px, or 32px at `size="l"`.', local: true },
  { name: '--beam-toast-gutter', type: 'length', purpose: 'The toast column distance from the window corner. `--beam-space-l`.', local: true },
  { name: '--beam-toast-max-width', type: 'length', purpose: 'The widest a toast grows. 360px.', local: true },
];

export const TOKEN_NAMES: ReadonlySet<string> = new Set(TOKENS.map((token) => token.name));
