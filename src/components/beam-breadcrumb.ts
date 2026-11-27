import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseCss } from "../theme/index.js";
import { NAVIGATE_EVENT, PALETTE_OPEN_EVENT, emit } from "../events.js";
import "./beam-monogram.js";
import "../icons/icons.js";

/** One level of the trail after the workspace name. */
export interface BreadcrumbItem {
  label: string;
  /**
   * The screen this level returns to. A level with an id is a button; the
   * last level is where the user is and never is one.
   */
  id?: string;
}

/**
 * Which part of the palette a control asks for: `all` from the search box, the
 * breadcrumb's `switch-scope` from the workspace name, or whatever an app puts
 * on a status segment.
 */
export type PaletteScope = string;

export interface PaletteOpenDetail {
  scope: PaletteScope;
}

/**
 * Ask for the palette. Bubbles and composes, so it reaches the document.
 * `from` is the control that was pressed, not its host: the palette hands
 * focus back to the event's origin on close.
 */
export function dispatchPaletteOpen(
  from: EventTarget,
  scope: PaletteScope,
): void {
  emit<PaletteOpenDetail>(from, PALETTE_OPEN_EVENT, { scope });
}

/**
 * Where the user is: the open workspace, then the screen, then anything below it.
 *
 * `[monogram] Name ▾ / Screen`, or `… / Items / #12` a level down.
 * The name is a button that asks for the palette at `switch-scope`
 * (`beam-palette-open`); an earlier level is a button that navigates back to
 * its screen (`beam-navigate`), the same event the sidebar sends.
 */
@customElement("beam-breadcrumb")
export class BeamBreadcrumb extends LitElement {
  static styles = [
    baseCss,
    css`
      :host {
        display: block;
        min-width: 0;
        font-family: var(--beam-font-family);
        font-size: var(--beam-font-size-control);
      }

      ol {
        display: flex;
        align-items: center;
        min-width: 0;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      li {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      /* Short of room, the workspace name gives way before the screen's:
         the monogram still says which one it is. */
      li + li {
        flex-shrink: 0;
      }

      button {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        height: 30px;
        border: 0;
        border-radius: var(--beam-radius-md);
        background: transparent;
        font: inherit;
        cursor: default;
        transition: background var(--beam-transition-fast);
      }

      button:hover {
        background: var(--beam-color-hover);
      }

      .workspace {
        gap: var(--beam-space-s);
        padding: 0 6px 0 4px;
        color: var(--beam-color-text);
      }

      .workspace-name,
      .level {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .workspace beam-icon-chevron-down {
        --beam-icon-size: 14px;
        color: var(--beam-color-muted);
      }

      .sep {
        padding: 0 6px;
        color: var(--beam-color-muted);
      }

      .level {
        color: var(--beam-color-muted);
      }

      button.level {
        padding: 0 4px;
      }

      /* The last level of a deeper trail is the thing on screen, and reads
         as text; a lone screen name stays muted beside the workspace name. */
      .level.current.deep {
        color: var(--beam-color-text);
        font-weight: var(--beam-font-weight-medium);
      }

      @media print {
        :host {
          display: none;
        }
      }
    `,
  ];

  /** The name of what is open. */
  @property({ type: String, attribute: "workspace-name" })
  workspaceName = "";

  /** What picks the monogram's colour: something that names it for good. */
  @property({ type: String, attribute: "workspace-key" })
  workspaceKey = "";

  /** The tooltip on the name. */
  @property({ type: String, attribute: "switch-label" })
  switchLabel = "Switch workspace";

  /** One workspace only: its name is plain text, with nothing to switch to. */
  @property({ type: Boolean, attribute: "no-switch" })
  noSwitch = false;

  /** The palette scope the name asks for. */
  @property({ type: String, attribute: "switch-scope" })
  switchScope: PaletteScope = "workspaces";

  /** The levels after the name, outermost first. */
  @property({ attribute: false })
  trail: BreadcrumbItem[] = [];

  private navigate(id: string): void {
    emit<{ id: string }>(this, NAVIGATE_EVENT, { id });
  }

  render() {
    const last = this.trail.length - 1;
    const deep = this.trail.length > 1;
    return html`
      <nav aria-label="Breadcrumb">
        <ol>
          <li>
            ${this.noSwitch
              ? html`<span class="workspace" part="workspace"
                  ><beam-monogram name=${this.workspaceName} seed=${this.workspaceKey}></beam-monogram
                  ><span class="workspace-name">${this.workspaceName}</span></span
                >`
              : html`<button
              type="button"
              class="workspace"
              part="workspace"
              aria-haspopup="dialog"
              title=${this.switchLabel}
              @click=${(event: Event) => dispatchPaletteOpen(event.currentTarget as HTMLElement, this.switchScope)}
            >
              <beam-monogram
                name=${this.workspaceName}
                seed=${this.workspaceKey}
              ></beam-monogram>
              <span class="workspace-name">${this.workspaceName}</span>
              <beam-icon-chevron-down></beam-icon-chevron-down>
            </button>`}
          </li>
          ${this.trail.map((item, index) => {
            const current = index === last;
            const classes = `level${current ? " current" : ""}${deep ? " deep" : ""}`;
            return html`
              <li>
                <span class="sep" aria-hidden="true">/</span>
                ${
                  !current && item.id
                    ? html`<button
                        type="button"
                        class=${classes}
                        part="level"
                        data-level=${item.id}
                        @click=${() => this.navigate(item.id!)}
                      >
                        ${item.label}
                      </button>`
                    : html`<span
                        class=${classes}
                        aria-current=${current ? "page" : nothing}
                        >${item.label}</span
                      >`
                }
              </li>
            `;
          })}
        </ol>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "beam-breadcrumb": BeamBreadcrumb;
  }
  interface HTMLElementEventMap {
    [PALETTE_OPEN_EVENT]: CustomEvent<PaletteOpenDetail>;
  }
}
