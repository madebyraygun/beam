import { LitElement, html, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseCss } from '../theme/index.js';
import { NAVIGATE_EVENT, REFRESH_EVENT, SIDEBAR_TOGGLE_EVENT, emit } from '../events.js';
import './beam-toast.js';
import './beam-breadcrumb.js';
import './beam-search-pill.js';
import './beam-status-line.js';
import type { StatusSegment } from './beam-status-line.js';
import type { BreadcrumbItem } from './beam-breadcrumb.js';
import '../icons/icons.js';

/** The width at which the sidebar stops being a column and becomes a drawer. */
export const NARROW_QUERY = '(max-width: 48rem)';

/**
 * Enough of a `MediaQueryList` to answer "is this a phone" and say when that
 * changes. Injectable because jsdom's `matchMedia` answers false to
 * everything, the way the theme's dark-mode query is.
 */
export interface NarrowQuery {
  matches: boolean;
  addEventListener?(type: 'change', listener: () => void): void;
  removeEventListener?(type: 'change', listener: () => void): void;
}

function defaultNarrowQuery(): NarrowQuery | undefined {
  return typeof matchMedia === 'undefined' ? undefined : matchMedia(NARROW_QUERY);
}

/**
 * Whether the sidebar should start out of the way. The app owns the state but
 * not the breakpoint, so it asks here rather than naming the width again.
 */
export function narrowViewport(query: NarrowQuery | undefined = defaultNarrowQuery()): boolean {
  return query?.matches ?? false;
}

/**
 * The application frame: the floating sidebar slot, the top bar, a banner
 * slot, the scrolling content area, and the single toast region.
 *
 * The top bar is drawn here from properties — the breadcrumb (the open workspace, the screen,
 * any level below it), the search pill and the refresh button — and the
 * shell says what was asked for with events rather than acting on it:
 * `beam-palette-open` from the workspace name and the pill, `beam-navigate` from an earlier
 * breadcrumb level, `beam-refresh` from refresh, `beam-sidebar-toggle` from the
 * drawer's toggle. Which screen is showing is the app's screen registry's
 * business; the shell is handed its title and trail.
 */
@customElement('beam-app-shell')
export class BeamAppShell extends LitElement {
  static styles = [
    baseCss,
    css`
      /* Exactly the window: the document never scrolls, only the content
         area does. The dynamic viewport unit follows a phone browser's
         toolbars, so the status line is not left under them; 100vh is the
         fallback where dvh is not understood. */
      :host {
        display: flex;
        height: 100vh;
        height: 100dvh;
        background: var(--beam-color-bg);
        color: var(--beam-color-text);
        font-family: var(--beam-font-family);
        font-size: var(--beam-font-size-base);
        line-height: var(--beam-line-height);
      }

      :host([hide-sidebar]) ::slotted([slot='sidebar']) {
        display: none;
      }

      .column {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 0;
      }

      header {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: none;
        height: var(--beam-header-height);
        margin-top: var(--beam-window-inset);
        padding: 0 16px 0 20px;
        box-sizing: border-box;
      }

      beam-breadcrumb {
        flex: 0 1 auto;
      }

      .spacer {
        flex: 1;
      }

      .icon-button {
        display: inline-grid;
        place-items: center;
        flex: none;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--beam-color-muted);
        cursor: default;
        transition: background var(--beam-transition-fast);
        --beam-icon-size: 17px;
      }

      .icon-button:hover {
        background: var(--beam-color-hover);
      }

      /* Round, where the drawer toggle below is square. */
      .refresh {
        border-radius: var(--beam-radius-pill);
      }

      /* The drawer's toggle: the design's hamburger, a 32px square with 8px
         corners rather than the round icon button refresh is. Above the
         breakpoint it lives in the sidebar's own header, so this one only
         exists on a phone. */
      .nav-toggle {
        display: none;
        border-radius: var(--beam-radius-md);
        color: var(--beam-color-text);
      }

      /* Below the breakpoint the sidebar leaves the flow and lies over the
         content, so the backdrop is what says the rest of the app is not the
         thing being interacted with. Escape and the toggle close the drawer
         too, which is what keeps a pointer-only affordance from being the
         only way out. */
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 1;
        background: var(--beam-color-overlay);
      }

      .banner {
        display: none;
      }

      .banner.filled {
        display: block;
        margin: 0 16px var(--beam-space-s) 20px;
        padding: var(--beam-space-s) var(--beam-space-m);
        background: var(--beam-color-surface-alt);
        border: 1px solid var(--beam-color-border);
        border-radius: var(--beam-radius-md);
      }

      /* A column flex container, so a screen that wants the window can ask
         for it with flex-grow on its own host and get a definite height to
         divide up. A screen that does not stays content-sized, as a block
         child would.

         Positioned, so it is the containing block for every absolutely
         positioned descendant — a visually hidden label, a caption, a radio
         under its card. Without that their containing block is the window,
         this element's clip does not apply to them, and one sitting below
         the fold makes the document taller than the window: a second
         scrollbar, and a page that wheel, focus and scrollIntoView slide up
         under the frame. overscroll-behavior keeps a scroll that reaches
         either end here rather than handing it on. */
      .content {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 18px;
        overflow: auto;
        overscroll-behavior: contain;
        padding: 4px 16px 16px 20px;
        min-height: 0;
      }

      .page-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--beam-space-m);
        flex: none;
      }

      /* A screen whose toolbar is its first line keeps its heading for
         assistive technology, so heading navigation still finds the page,
         without spending the height on it. Out of flow, so the content
         column's gap does not open up for it either. */
      .title-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      /* A page action sits at the right of the title row, however many
         there are, and wraps under the title on a phone. */
      .page-head ::slotted([slot='page-actions']) {
        flex: none;
        margin-left: auto;
      }

      .title {
        margin: 0;
        font-size: var(--beam-font-size-display);
        font-weight: var(--beam-font-weight-medium);
        letter-spacing: var(--beam-letter-spacing-tight);
        line-height: 1.2;
      }

      /* The screen is the only thing in the default slot, and it gets the
         rest of the content area rather than as much of it as its own content
         fills — a screen has nothing to centre anything in otherwise.
         Content taller than the area still grows past it and scrolls,
         because a flex item's automatic minimum size is its content. */
      .content ::slotted(*) {
        flex: 1 1 auto;
      }

      /* A 224px column out of a 390px viewport leaves the content a
         40-character strip, so on a phone the sidebar stops being a column:
         it lies over the content and slides away when it is not wanted. The
         collapsed rail is the wide-viewport answer and stands down here —
         beam-nav-sidebar cancels its own rail styling at the same width. */
      @media (max-width: 48rem) {
        ::slotted([slot='sidebar']) {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 2;
          transition: transform var(--beam-transition-base);
        }

        /* Its own width plus the inset either side, so neither the panel's
           edge nor its shadow is left on screen. */
        :host([sidebar-collapsed]) ::slotted([slot='sidebar']) {
          transform: translateX(calc(-100% - 2 * var(--beam-window-inset)));
        }

        .nav-toggle {
          display: inline-grid;
        }

        :host([hide-sidebar]) .nav-toggle {
          display: none;
        }

        header {
          padding: 0 10px;
          gap: 6px;
        }

        /* 16px a side is a tenth of a phone's width spent on margin. */
        .content {
          padding: 10px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        ::slotted([slot='sidebar']) {
          transition: none;
        }
      }

      /* On paper the page is the content and nothing else. A rule that
         hides an element has to be in the tree that element is in, so it is
         here rather than in a document print sheet. */
      @media print {
        :host {
          display: block;
          height: auto;
        }

        header,
        .banner,
        .page-head {
          display: none;
        }

        ::slotted([slot='sidebar']) {
          display: none;
        }

        .column {
          overflow: visible;
        }

        .content {
          display: block;
          padding: 0;
          overflow: visible;
        }

        /* The screen goes back to block flow for the sheets. A flex container
           is not required to fragment and Safari and older Chromium slice
           through a row rather than break between two, and the leftover
           height a column hands out is a property of a viewport, which paper
           does not have. A normal declaration in the outer tree beats the
           inner tree's own :host rule, so this reaches every screen from
           here. */
        .content ::slotted(*) {
          display: block;
        }
      }
    `,
  ];

  /** The page heading over the content. Empty draws none, for a screen with its own. */
  @property({ type: String, attribute: 'screen-title' })
  screenTitle = '';

  /**
   * Keep the page heading for assistive technology only. The breadcrumb
   * already names the screen to a sighted user, and a screen that opens on
   * its own toolbar gives the rows that height.
   */
  @property({ type: Boolean, attribute: 'title-hidden' })
  titleHidden = false;

  /** The name of what is open, first in the breadcrumb and the status line. */
  @property({ type: String, attribute: 'workspace-name' })
  workspaceName = '';

  /** What picks its monogram colour: something that names it for good. */
  @property({ type: String, attribute: 'workspace-key' })
  workspaceKey = '';

  /** The tooltip on the name, which opens the palette at `switch-scope`. */
  @property({ type: String, attribute: 'switch-label' })
  switchLabel = 'Switch workspace';

  /** The palette scope the name asks for. */
  @property({ type: String, attribute: 'switch-scope' })
  switchScope = 'workspaces';

  /** The refresh button's name and tooltip. */
  @property({ type: String, attribute: 'refresh-label' })
  refreshLabel = 'Refresh';

  /** The breadcrumb after the name: the screen, then any level below it. */
  @property({ attribute: false })
  trail: BreadcrumbItem[] = [];

  /** The search pill's keycap, and the same chord for `aria-keyshortcuts`. */
  @property({ type: String, attribute: 'search-shortcut' })
  searchShortcut = '⌘K';

  @property({ type: String, attribute: 'search-key-shortcuts' })
  searchKeyShortcuts = 'Meta+K';

  /**
   * What the status line holds besides the name. Absent draws no
   * status line, which is what a host window that draws its own chrome asks
   * for; an empty list draws the line with the name alone.
   */
  @property({ attribute: false })
  statusSegments: StatusSegment[] | undefined = undefined;

  @property({ type: Boolean, reflect: true, attribute: 'sidebar-collapsed' })
  sidebarCollapsed = false;

  /** No sidebar and no toggle for one: the host window draws its own. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-sidebar' })
  hideSidebar = false;

  /**
   * Changing this puts the content area back at the top. The app hands in
   * something that changes with the screen, so arriving on one never starts
   * partway down it.
   */
  @property({ attribute: false })
  scrollKey: unknown = undefined;

  @property({ attribute: false })
  narrowQuery: NarrowQuery | undefined = defaultNarrowQuery();

  /** Whether anything is in the banner slot; an empty banner draws nothing. */
  @state()
  private hasBanner = false;

  private readonly onBannerChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasBanner = slot.assignedNodes({ flatten: true }).length > 0;
  };

  private get narrow(): boolean {
    return this.narrowQuery?.matches ?? false;
  }

  /** Open here means the drawer is over the content, not the docked column. */
  private get drawerOpen(): boolean {
    return this.narrow && !this.hideSidebar && !this.sidebarCollapsed;
  }

  private readonly onViewportChange = () => this.requestUpdate();

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.drawerOpen) this.requestSidebar(true);
  };

  private readonly onNavigate = () => {
    // The drawer covers the screen it just navigated to. A docked sidebar
    // covers nothing, so navigating there leaves it alone.
    if (this.drawerOpen) this.requestSidebar(true);
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.narrowQuery?.addEventListener?.('change', this.onViewportChange);
    window.addEventListener('keydown', this.onKeyDown);
    this.addEventListener(NAVIGATE_EVENT, this.onNavigate);
  }

  disconnectedCallback(): void {
    this.narrowQuery?.removeEventListener?.('change', this.onViewportChange);
    window.removeEventListener('keydown', this.onKeyDown);
    this.removeEventListener(NAVIGATE_EVENT, this.onNavigate);
    super.disconnectedCallback();
  }

  updated(changed: PropertyValues<this>): void {
    // Focus went into the drawer; hand it back to the control that opened it
    // rather than dropping it on the body. Collapsing to the rail on a wide
    // viewport is not a dismissal and takes no focus with it.
    if (changed.has('sidebarCollapsed') && this.sidebarCollapsed && this.narrow) {
      this.shadowRoot?.querySelector<HTMLButtonElement>('.nav-toggle')?.focus();
    }
    if (changed.has('scrollKey') && changed.get('scrollKey') !== undefined) {
      const content = this.shadowRoot?.querySelector<HTMLElement>('.content');
      if (content) content.scrollTop = 0;
    }
  }

  /**
   * The state is the app's: the sidebar is its slotted child and only it can
   * pass `collapsed` down. The shell asks, and re-renders when the answer
   * comes back as a property.
   */
  private requestSidebar(collapsed: boolean): void {
    emit<{ collapsed: boolean }>(this, SIDEBAR_TOGGLE_EVENT, { collapsed });
  }

  private requestRefresh(): void {
    emit(this, REFRESH_EVENT);
  }

  render() {
    // The parts exist so a document-level stylesheet can reach the shell's
    // furniture — `::part()` pierces the shadow boundary, nothing else does.
    return html`
      <slot name="sidebar" part="sidebar"></slot>
      ${this.drawerOpen
        ? html`<div
            class="backdrop"
            part="backdrop"
            aria-hidden="true"
            @click=${() => this.requestSidebar(true)}
          ></div>`
        : nothing}
      <div class="column">
        <header part="header">
          ${this.hideSidebar
            ? nothing
            : html`<button
                type="button"
                class="icon-button nav-toggle"
                part="nav-toggle"
                aria-label="Navigation"
                aria-expanded=${this.sidebarCollapsed ? 'false' : 'true'}
                @click=${() => this.requestSidebar(!this.sidebarCollapsed)}
              >
                <beam-icon-menu></beam-icon-menu>
              </button>`}
          <beam-breadcrumb
            workspace-name=${this.workspaceName}
            workspace-key=${this.workspaceKey}
            switch-label=${this.switchLabel}
            switch-scope=${this.switchScope}
            .trail=${this.trail}
          ></beam-breadcrumb>
          <slot name="header-end"></slot>
          <span class="spacer"></span>
          <beam-search-pill
            shortcut=${this.searchShortcut}
            key-shortcuts=${this.searchKeyShortcuts}
          ></beam-search-pill>
          <button
            type="button"
            class="icon-button refresh"
            part="refresh"
            aria-label=${this.refreshLabel}
            title=${this.refreshLabel}
            @click=${this.requestRefresh}
          >
            <beam-icon-refresh></beam-icon-refresh>
          </button>
        </header>
        <div class=${this.hasBanner ? 'banner filled' : 'banner'} part="banner">
          <slot name="banner" @slotchange=${this.onBannerChange}></slot>
        </div>
        <main class="content" part="content">
          ${this.screenTitle && this.titleHidden
            ? html`<h1 class="title-hidden">${this.screenTitle}</h1>`
            : nothing}
          ${this.screenTitle && !this.titleHidden
            ? html`<div class="page-head" part="page-head">
                <h1 class="title">${this.screenTitle}</h1>
                <slot name="page-actions"></slot>
              </div>`
            : nothing}
          <slot></slot>
        </main>
        ${this.statusSegments
          ? html`<beam-status-line
              part="status-line"
              workspace-name=${this.workspaceName}
              workspace-key=${this.workspaceKey}
              switch-label=${this.switchLabel}
              switch-scope=${this.switchScope}
              .segments=${this.statusSegments}
            ></beam-status-line>`
          : nothing}
      </div>
      <beam-toast></beam-toast>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-app-shell': BeamAppShell;
  }
  interface HTMLElementEventMap {
    [REFRESH_EVENT]: CustomEvent<void>;
  }
}
