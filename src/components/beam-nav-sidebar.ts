import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseCss } from '../theme/index.js';
import { NAVIGATE_EVENT, SIDEBAR_TOGGLE_EVENT, emit } from '../events.js';
import '../icons/icons.js';

export interface NavItem {
  id: string;
  label: string;
  /** Tag name of an icon element (`beam-icon-*`, or an app's own). */
  icon?: string;
  disabled?: boolean;
  /**
   * The heading of the group the item sits in. Consecutive items with the
   * same group are drawn together; items with none form the unlabelled group
   * at the top.
   */
  group?: string;
  /** A figure drawn at the item's right edge, such as a queue length. Hidden at 0. */
  count?: number;
  /** A few words in place of the figure, such as "1 blocking". Hidden when empty. */
  note?: string;
  /** Drawn in the footer, below every group, rather than in the list. */
  pinned?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

function groupsOf(items: NavItem[]): NavGroup[] {
  const groups: NavGroup[] = [];
  for (const item of items) {
    const current = groups[groups.length - 1];
    if (current && current.label === item.group) current.items.push(item);
    else groups.push({ label: item.group, items: [item] });
  }
  return groups;
}

/**
 * Primary navigation: the floating sidebar panel.
 *
 * Presentational: it renders the items it is given and announces intent.
 * Which items exist, which one is active and whether the panel is folded to
 * its rail are the app's business. The hamburger in its header asks for the
 * other state with `beam-sidebar-toggle`, the same request the shell's own
 * toggle makes.
 */
@customElement('beam-nav-sidebar')
export class BeamNavSidebar extends LitElement {
  static styles = [
    baseCss,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: none;
        box-sizing: border-box;
        width: var(--beam-sidebar-width);
        margin: var(--beam-window-inset) 0 var(--beam-window-inset) var(--beam-window-inset);
        background: var(--beam-color-panel);
        border: 1px solid var(--beam-color-border);
        border-radius: var(--beam-radius-xl);
        box-shadow: var(--beam-shadow-floating);
        overflow: hidden;
        font-family: var(--beam-font-family);
        transition: width var(--beam-transition-sidebar);
      }

      :host([collapsed]) {
        width: var(--beam-sidebar-collapsed-width);
      }

      .head {
        display: flex;
        align-items: center;
        gap: var(--beam-space-s);
        flex: none;
        height: var(--beam-header-height);
        padding: 0 10px;
        box-sizing: border-box;
      }

      .hamburger {
        display: inline-grid;
        place-items: center;
        flex: none;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 0;
        border-radius: var(--beam-radius-md);
        background: transparent;
        color: var(--beam-color-text);
        cursor: default;
        transition: background var(--beam-transition-fast);
      }

      .hamburger:hover {
        background: var(--beam-color-hover);
      }

      .wordmark {
        font-size: 15px;
        font-weight: var(--beam-font-weight-bold);
        letter-spacing: -0.01em;
        background: var(--beam-accent-image);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        white-space: nowrap;
      }

      nav {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }

      .groups {
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
        min-height: 0;
        /* 4px of room above the first item for its focus outline, which
           the scroll box would otherwise clip, taken back by the margin. */
        margin-top: -4px;
        padding: 4px var(--beam-space-s) var(--beam-space-s);
        overflow-x: hidden;
        overflow-y: auto;
      }

      .group-label {
        margin: 0;
        padding: 4px 10px 3px;
        font-size: var(--beam-font-size-label);
        font-weight: var(--beam-font-weight-medium);
        letter-spacing: var(--beam-letter-spacing-label);
        text-transform: uppercase;
        color: var(--beam-color-muted);
        white-space: nowrap;
      }

      ul {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 1px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .footer {
        flex: none;
        padding: var(--beam-space-s);
        border-top: 1px solid var(--beam-color-border-soft);
      }

      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        height: 32px;
        padding: 0 9px;
        box-sizing: border-box;
        border: 1px solid transparent;
        border-radius: var(--beam-radius-md);
        background: transparent;
        color: var(--beam-color-text);
        font: inherit;
        font-size: var(--beam-font-size-body);
        text-align: left;
        white-space: nowrap;
        cursor: default;
        transition: background var(--beam-transition-fast);
        --beam-icon-size: 17px;
      }

      .item:hover:not(.disabled, .active) {
        background: var(--beam-color-hover);
      }

      /* The accent hairline: the fill painted to the padding edge and the
         ramp to the border edge, so the transparent 1px border shows the
         ramp and nothing else does. */
      .item.active {
        background:
          linear-gradient(var(--beam-color-selected), var(--beam-color-selected)) padding-box,
          var(--beam-accent-image) border-box;
        font-weight: var(--beam-font-weight-medium);
      }

      .item.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .count {
        font-size: 11px;
        color: var(--beam-color-warning);
      }

      :host([collapsed]) .wordmark,
      :host([collapsed]) .group-label,
      :host([collapsed]) .label,
      :host([collapsed]) .count {
        display: none;
      }

      :host([collapsed]) .item {
        justify-content: center;
        padding: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          transition: none;
        }
      }

      /* At phone width the shell slides the whole sidebar off-canvas instead
         of narrowing it, so collapsed means "away" rather than "58px of
         icons" and the rail styling stands down: what slides back in is the
         full nav with its words. */
      @media (max-width: 48rem) {
        :host([collapsed]) {
          width: var(--beam-sidebar-width);
        }

        :host([collapsed]) .wordmark,
        :host([collapsed]) .group-label,
        :host([collapsed]) .label,
        :host([collapsed]) .count {
          display: revert;
        }

        :host([collapsed]) .item {
          justify-content: revert;
          padding: 0 9px;
        }
      }

      /* Screen chrome, not part of the printed page. This lives here rather than in
         a document print sheet because a rule that hides an element has to be
         in the tree that element is in. */
      @media print {
        :host {
          display: none;
        }
      }
    `,
  ];

  @property({ attribute: false })
  items: NavItem[] = [];

  /**
   * The product's name, drawn at the top beside the toggle. Empty draws none.
   * A mark (a logo) goes in the `mark` slot, before the name.
   */
  @property({ type: String, attribute: 'product-name' })
  productName = '';

  @property({ type: String })
  active = '';

  @property({ type: Boolean, reflect: true })
  collapsed = false;

  private handleClick(item: NavItem): void {
    if (item.disabled) return;
    emit<{ id: string }>(this, NAVIGATE_EVENT, { id: item.id });
  }

  private requestToggle(): void {
    emit<{ collapsed: boolean }>(this, SIDEBAR_TOGGLE_EVENT, { collapsed: !this.collapsed });
  }

  private renderIcon(item: NavItem) {
    if (!item.icon) return nothing;
    // Icon tags come from data, so the element is created imperatively.
    return document.createElement(item.icon);
  }

  private renderItem(item: NavItem) {
    const isActive = item.id === this.active;
    const classes = ['item', isActive ? 'active' : '', item.disabled ? 'disabled' : '']
      .filter(Boolean)
      .join(' ');
    const count = item.count && item.count > 0 ? item.count : 0;
    return html`
      <li>
        <button
          type="button"
          class=${classes}
          part=${isActive ? 'item active' : 'item'}
          data-nav=${item.id}
          aria-current=${isActive ? 'page' : 'false'}
          aria-disabled=${item.disabled ? 'true' : 'false'}
          title=${this.collapsed ? item.label : nothing}
          @click=${() => this.handleClick(item)}
        >
          ${this.renderIcon(item)}
          <span class="label">${item.label}</span>
          ${item.note ? html`<span class="count">${item.note}</span>` : count ? html`<span class="count">${count}</span>` : nothing}
        </button>
      </li>
    `;
  }

  render() {
    const listed = this.items.filter((item) => !item.pinned);
    const pinned = this.items.filter((item) => item.pinned);
    return html`
      <div class="head" part="head">
        <button
          type="button"
          class="hamburger"
          part="toggle"
          aria-label="Sidebar"
          aria-expanded=${this.collapsed ? 'false' : 'true'}
          @click=${this.requestToggle}
        >
          <beam-icon-menu></beam-icon-menu>
        </button>
        <slot name="mark"></slot>
        ${this.productName
          ? html`<span class="wordmark" part="product-name" aria-hidden="true">${this.productName}</span>`
          : nothing}
      </div>
      <nav aria-label="Primary">
        <div class="groups">
          ${groupsOf(listed).map(
            (group, index) => html`
              <div class="group">
                ${group.label
                  ? html`<p class="group-label" part="group-label" id="group-${index}">${group.label}</p>`
                  : nothing}
                <ul aria-labelledby=${group.label ? `group-${index}` : nothing}>
                  ${group.items.map((item) => this.renderItem(item))}
                </ul>
              </div>
            `,
          )}
        </div>
        ${pinned.length
          ? html`<div class="footer" part="footer">
              <ul>
                ${pinned.map((item) => this.renderItem(item))}
              </ul>
            </div>`
          : nothing}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-nav-sidebar': BeamNavSidebar;
  }
  interface HTMLElementEventMap {
    [NAVIGATE_EVENT]: CustomEvent<{ id: string }>;
    [SIDEBAR_TOGGLE_EVENT]: CustomEvent<{ collapsed: boolean }>;
  }
}
