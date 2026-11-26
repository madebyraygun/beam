import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { controlsCss } from '../theme/index.js';
import { dispatchPaletteOpen, type PaletteScope } from './wc-breadcrumb.js';
import './wc-monogram.js';
import '../icons/icons.js';

/**
 * One segment of the status line. The app says what its line holds; the
 * component draws it and gives each kind of segment its behaviour when the
 * line runs short of room.
 */
export interface StatusSegment {
  /**
   * Names the segment. It becomes a class on the element, so an app's tests
   * can find it, and it is the `id` in `nc-status-action`.
   */
  id: string;
  label: string;
  /** Tag name of a `wc-icon-*` element drawn before the label. */
  icon?: string;
  /** The icon's size in pixels. The icon's own default when absent. */
  iconSize?: number;
  /** A keycap drawn before the label, such as `⌘K`. */
  kbd?: string;
  /** The chord for `aria-keyshortcuts`, such as `Meta+K`. */
  keyShortcuts?: string;
  /** The tooltip. */
  title?: string;
  /** `start` sits after the name, `end` after the spacer. Default `start`. */
  side?: 'start' | 'end';
  /**
   * How the segment is drawn and how it gives way:
   * - `plain` (default): its label, never shortened.
   * - `text`: text a person may want to select and copy, such as a folder;
   *   it is cut short with an ellipsis when room runs out.
   * - `status`: an icon and a label; narrower than 560px the label is hidden
   *   from sight and the icon stands alone.
   */
  kind?: 'plain' | 'text' | 'status';
  /** A colour for the whole segment. */
  tone?: 'flagged' | 'danger' | 'ok';
  /**
   * When the line runs out of room: `first` goes below 760px, `second` below
   * 620px. Absent: the segment stays.
   */
  drops?: 'first' | 'second';
  /** Makes the segment a button that asks to go to this screen (`nc-navigate`). */
  navigate?: string;
  /** Makes the segment a button that asks for the palette (`nc-palette-open`). */
  palette?: PaletteScope;
  /** Makes the segment a button that sends `nc-status-action` with its `id`. */
  action?: boolean;
}

/**
 * The floating status line under the content: the open book's name, then
 * whatever segments the app passes, on either side of a spacer.
 *
 * Presentational, like the rest of the shell. The name opens the palette
 * scoped to books (`nc-palette-open`). A segment can ask to go to a screen
 * (`nc-navigate`), ask for the palette, or send `nc-status-action` with its
 * id; otherwise it is text. The slots `start` and `end` take anything else an
 * app wants on the line. The line is a desktop furnishing and stands down
 * below the mobile breakpoint.
 */
@customElement('wc-status-line')
export class WcStatusLine extends LitElement {
  static styles = [
    controlsCss,
    css`
      :host {
        display: flex;
        align-items: stretch;
        flex: none;
        height: 34px;
        margin: 0 var(--nc-window-inset) var(--nc-window-inset);
        box-sizing: border-box;
        background: var(--nc-color-sidebar-bg);
        border: 1px solid var(--wa-color-border);
        border-radius: var(--wa-radius-lg);
        box-shadow: var(--nc-shadow-floating);
        overflow: hidden;
        color: var(--wa-color-muted);
        font-family: var(--wa-font-family-sans);
        font-size: var(--nc-font-size-caption);
        white-space: nowrap;
        container-type: inline-size;
      }

      .segment {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: none;
        padding: 0 12px;
        border: 0;
        border-right: 1px solid var(--wa-color-border-soft);
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: default;
      }

      button.segment:focus-visible {
        outline-offset: -2px;
        border-radius: var(--wa-radius-sm);
      }

      .spacer {
        flex: 1;
        min-width: 0;
      }

      .spacer ~ .segment {
        border-right: 0;
        border-left: 1px solid var(--wa-color-border-soft);
      }

      button.segment {
        transition: background var(--nc-transition-fast);
      }

      button.segment:hover {
        background: var(--nc-color-hover);
      }

      /* Short of room the book's name gives way first, then a text segment;
         the monogram still says which book it is. */
      .book {
        flex: 0 8 auto;
        min-width: 0;
        color: var(--wa-color-text);
      }

      .book wc-monogram {
        --nc-monogram-size: 14px;
      }

      .book wc-monogram::part(tile) {
        border-radius: var(--wa-radius-xs);
        font-size: 7px;
        font-weight: var(--wa-font-weight-semibold);
      }

      .book-name {
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 32ch;
      }

      .text {
        flex: 0 1 auto;
        min-width: 0;
        display: block;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: text;
        cursor: text;
      }

      /* A status segment's label gives way after the book's name and before a
         text segment. */
      .status {
        position: relative;
        flex: 0 4 auto;
        min-width: 0;
      }

      .status .label {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .flagged {
        color: var(--nc-color-flagged);
      }

      .danger {
        color: var(--wa-color-danger);
      }

      .ok {
        color: var(--wa-color-success);
      }

      ::slotted(*) {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: none;
        padding: 0 12px;
      }

      kbd {
        font-family: inherit;
      }

      /* Segments marked to drop go first when the line runs out of room, so
         nothing else is clipped. */
      @container (max-width: 760px) {
        .drops-first {
          display: none;
        }
      }

      @container (max-width: 620px) {
        .drops-second {
          display: none;
        }
      }

      /* Narrower still, a status segment is its icon alone; the label stays in
         the accessibility tree and the tooltip. */
      @container (max-width: 560px) {
        .status .label {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip-path: inset(50%);
        }
      }

      @media (max-width: 48rem) {
        :host {
          display: none;
        }
      }

      @media print {
        :host {
          display: none;
        }
      }
    `,
  ];

  /** The open book's name. */
  @property({ type: String, attribute: 'book-name' })
  bookName = '';

  /** What picks the monogram's colour: something that names the book for good. */
  @property({ type: String, attribute: 'book-key' })
  bookKey = '';

  /** What the line holds besides the name, in order. */
  @property({ attribute: false })
  segments: StatusSegment[] = [];

  private act(segment: StatusSegment, from: EventTarget | null): void {
    if (segment.palette) {
      dispatchPaletteOpen(from as HTMLElement, segment.palette);
    } else if (segment.navigate) {
      this.dispatchEvent(
        new CustomEvent<{ id: string }>('nc-navigate', {
          detail: { id: segment.navigate },
          bubbles: true,
          composed: true,
        }),
      );
    } else {
      this.dispatchEvent(
        new CustomEvent<{ id: string }>('nc-status-action', {
          detail: { id: segment.id },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private iconOf(segment: StatusSegment) {
    if (!segment.icon) return nothing;
    const icon = document.createElement(segment.icon);
    if (segment.iconSize) icon.style.setProperty('--nc-icon-size', `${segment.iconSize}px`);
    return icon;
  }

  private renderSegment(segment: StatusSegment) {
    const kind = segment.kind ?? 'plain';
    const classes = [
      'segment',
      kind === 'plain' ? '' : kind,
      segment.id,
      segment.tone ?? '',
      segment.drops ? `drops-${segment.drops}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    const body =
      kind === 'status'
        ? html`${this.iconOf(segment)}<span class="label">${segment.label}</span>`
        : html`${this.iconOf(segment)}${segment.kbd ? html`<kbd>${segment.kbd}</kbd> ` : nothing}${segment.label}`;
    if (segment.navigate || segment.palette || segment.action) {
      return html`<button
        type="button"
        class=${classes}
        title=${ifDefined(segment.title)}
        aria-haspopup=${ifDefined(segment.palette ? 'dialog' : undefined)}
        aria-keyshortcuts=${ifDefined(segment.keyShortcuts)}
        @click=${(e: Event) => this.act(segment, e.currentTarget)}
      >
        ${body}
      </button>`;
    }
    return html`<span class=${classes} title=${ifDefined(segment.title)}>${body}</span>`;
  }

  render() {
    const start = this.segments.filter((segment) => (segment.side ?? 'start') === 'start');
    const end = this.segments.filter((segment) => segment.side === 'end');
    return html`
      ${
        this.bookName
          ? html`<button
              type="button"
              class="segment book"
              aria-haspopup="dialog"
              title="Switch books"
              @click=${(e: Event) => dispatchPaletteOpen(e.currentTarget!, 'books')}
            >
              <wc-monogram name=${this.bookName} seed=${this.bookKey}></wc-monogram>
              <span class="book-name">${this.bookName}</span>
            </button>`
          : nothing
      }
      ${start.map((segment) => this.renderSegment(segment))}
      <slot name="start"></slot>
      <span class="spacer"></span>
      <slot name="end"></slot>
      ${end.map((segment) => this.renderSegment(segment))}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-status-line': WcStatusLine;
  }
  interface HTMLElementEventMap {
    'nc-status-action': CustomEvent<{ id: string }>;
  }
}
