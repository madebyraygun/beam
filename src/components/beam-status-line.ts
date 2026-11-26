import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { baseCss } from '../theme/index.js';
import { NAVIGATE_EVENT, STATUS_ACTION_EVENT, emit } from '../events.js';
import { dispatchPaletteOpen, type PaletteScope } from './beam-breadcrumb.js';
import './beam-monogram.js';
import '../icons/icons.js';

/**
 * One segment of the status line. The app says what its line holds; the
 * component draws it and gives each kind of segment its behaviour when the
 * line runs short of room.
 */
export interface StatusSegment {
  /**
   * Names the segment. It becomes a class on the element, so an app's tests
   * can find it, and it is the `id` in `beam-status-action`.
   */
  id: string;
  label: string;
  /** Tag name of an icon element (`beam-icon-*`, or an app's own) drawn before the label. */
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
  tone?: 'warning' | 'danger' | 'ok';
  /**
   * When the line runs out of room: `first` goes below 760px, `second` below
   * 620px. Absent: the segment stays.
   */
  drops?: 'first' | 'second';
  /** Makes the segment a button that asks to go to this screen (`beam-navigate`). */
  navigate?: string;
  /** Makes the segment a button that asks for the palette (`beam-palette-open`). */
  palette?: PaletteScope;
  /** Makes the segment a button that sends `beam-status-action` with its `id`. */
  action?: boolean;
}

/**
 * The floating status line under the content: the workspace name, then
 * whatever segments the app passes, on either side of a spacer.
 *
 * Presentational, like the rest of the shell. The name opens the palette
 * at `switch-scope` (`beam-palette-open`). A segment can ask to go to a screen
 * (`beam-navigate`), ask for the palette, or send `beam-status-action` with its
 * id; otherwise it is text. The slots `start` and `end` take anything else an
 * app wants on the line. The line is a desktop furnishing and stands down
 * below the mobile breakpoint.
 */
@customElement('beam-status-line')
export class BeamStatusLine extends LitElement {
  static styles = [
    baseCss,
    css`
      :host {
        display: flex;
        align-items: stretch;
        flex: none;
        height: 34px;
        margin: 0 var(--beam-window-inset) var(--beam-window-inset);
        box-sizing: border-box;
        background: var(--beam-color-panel);
        border: 1px solid var(--beam-color-border);
        border-radius: var(--beam-radius-lg);
        box-shadow: var(--beam-shadow-floating);
        overflow: hidden;
        color: var(--beam-color-muted);
        font-family: var(--beam-font-family);
        font-size: var(--beam-font-size-caption);
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
        border-right: 1px solid var(--beam-color-border-soft);
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: default;
      }

      button.segment:focus-visible {
        outline-offset: -2px;
        border-radius: var(--beam-radius-sm);
      }

      .spacer {
        flex: 1;
        min-width: 0;
      }

      .spacer ~ .segment {
        border-right: 0;
        border-left: 1px solid var(--beam-color-border-soft);
      }

      button.segment {
        transition: background var(--beam-transition-fast);
      }

      button.segment:hover {
        background: var(--beam-color-hover);
      }

      /* Short of room the workspace name gives way first, then a text
         segment; the monogram still says which one it is. */
      .workspace {
        flex: 0 8 auto;
        min-width: 0;
        color: var(--beam-color-text);
      }

      .workspace beam-monogram {
        --beam-monogram-size: 14px;
      }

      .workspace beam-monogram::part(tile) {
        border-radius: var(--beam-radius-xs);
        font-size: 7px;
        font-weight: var(--beam-font-weight-semibold);
      }

      .workspace-name {
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

      /* A status segment's label gives way after the workspace name and before a
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

      .warning {
        color: var(--beam-color-warning);
      }

      .danger {
        color: var(--beam-color-danger);
      }

      .ok {
        color: var(--beam-color-success);
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

  /** The name of what is open. Empty draws no name. */
  @property({ type: String, attribute: 'workspace-name' })
  workspaceName = '';

  /** What picks the monogram's colour: something that names it for good. */
  @property({ type: String, attribute: 'workspace-key' })
  workspaceKey = '';

  /** The tooltip on the name. */
  @property({ type: String, attribute: 'switch-label' })
  switchLabel = 'Switch workspace';

  /** The palette scope the name asks for. */
  @property({ type: String, attribute: 'switch-scope' })
  switchScope: PaletteScope = 'workspaces';

  /** What the line holds besides the name, in order. */
  @property({ attribute: false })
  segments: StatusSegment[] = [];

  private act(segment: StatusSegment, from: EventTarget | null): void {
    if (segment.palette) {
      dispatchPaletteOpen(from as HTMLElement, segment.palette);
    } else if (segment.navigate) {
      emit<{ id: string }>(this, NAVIGATE_EVENT, { id: segment.navigate });
    } else {
      emit<{ id: string }>(this, STATUS_ACTION_EVENT, { id: segment.id });
    }
  }

  private iconOf(segment: StatusSegment) {
    if (!segment.icon) return nothing;
    const icon = document.createElement(segment.icon);
    if (segment.iconSize) icon.style.setProperty('--beam-icon-size', `${segment.iconSize}px`);
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
        part="segment"
        title=${ifDefined(segment.title)}
        aria-haspopup=${ifDefined(segment.palette ? 'dialog' : undefined)}
        aria-keyshortcuts=${ifDefined(segment.keyShortcuts)}
        @click=${(e: Event) => this.act(segment, e.currentTarget)}
      >
        ${body}
      </button>`;
    }
    return html`<span class=${classes} part="segment" title=${ifDefined(segment.title)}>${body}</span>`;
  }

  render() {
    const start = this.segments.filter((segment) => (segment.side ?? 'start') === 'start');
    const end = this.segments.filter((segment) => segment.side === 'end');
    return html`
      ${
        this.workspaceName
          ? html`<button
              type="button"
              class="segment workspace"
              part="workspace"
              aria-haspopup="dialog"
              title=${this.switchLabel}
              @click=${(e: Event) => dispatchPaletteOpen(e.currentTarget!, this.switchScope)}
            >
              <beam-monogram name=${this.workspaceName} seed=${this.workspaceKey}></beam-monogram>
              <span class="workspace-name">${this.workspaceName}</span>
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
    'beam-status-line': BeamStatusLine;
  }
  interface HTMLElementEventMap {
    [STATUS_ACTION_EVENT]: CustomEvent<{ id: string }>;
  }
}
