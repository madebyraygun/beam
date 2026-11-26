import { customElement } from 'lit/decorators.js';
import { BeamIconBase, svg } from './icon-base.js';

/**
 * The icons the shell components draw and both apps use. An app draws its own
 * icons on `BeamIconBase` the same way, under its own tag names.
 *
 * The paths are plain geometry authored here rather than lifted from an icon
 * library, so there is no third-party licence riding along. Stroke width, caps
 * and joins come from BeamIconBase; each icon supplies only its geometry on a
 * 24x24 grid.
 */

@customElement('beam-icon-dashboard')
export class BeamIconDashboard extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>`;
  }
}

@customElement('beam-icon-search')
export class BeamIconSearch extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/><path d="M16 16l4 4"/>`;
  }
}

@customElement('beam-icon-flag')
export class BeamIconFlag extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M5 21V4h13l-3 4 3 4H5"/>`;
  }
}

@customElement('beam-icon-refresh')
export class BeamIconRefresh extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/>`;
  }
}

@customElement('beam-icon-chevron-down')
export class BeamIconChevronDown extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M6 9l6 6 6-6"/>`;
  }
}

@customElement('beam-icon-menu')
export class BeamIconMenu extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M4 7h16M4 12h16M4 17h16"/>`;
  }
}

/** Every tag this module registers. */
export const ICON_TAGS = [
  'beam-icon-dashboard',
  'beam-icon-search',
  'beam-icon-flag',
  'beam-icon-refresh',
  'beam-icon-chevron-down',
  'beam-icon-menu',
] as const;

export type IconTag = (typeof ICON_TAGS)[number];

declare global {
  interface HTMLElementTagNameMap {
    'beam-icon-dashboard': BeamIconDashboard;
    'beam-icon-search': BeamIconSearch;
    'beam-icon-flag': BeamIconFlag;
    'beam-icon-refresh': BeamIconRefresh;
    'beam-icon-chevron-down': BeamIconChevronDown;
    'beam-icon-menu': BeamIconMenu;
  }
}
