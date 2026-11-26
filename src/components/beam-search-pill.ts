import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseCss } from "../theme/index.js";
import { dispatchPaletteOpen } from "./beam-breadcrumb.js";
import "../icons/icons.js";

/**
 * The top bar's search control: a pill that asks for the whole palette
 * (`beam-palette-open` with scope `all`). The keycap shows the shortcut that
 * does the same; which key that is on this platform is the app's to say.
 */
@customElement("beam-search-pill")
export class BeamSearchPill extends LitElement {
  static styles = [
    baseCss,
    css`
      :host {
        display: inline-flex;
        flex: none;
      }

      button {
        display: inline-flex;
        align-items: center;
        gap: var(--beam-space-s);
        width: 240px;
        max-width: 100%;
        height: 32px;
        padding: 0 5px 0 12px;
        box-sizing: border-box;
        border: 1px solid var(--beam-color-border);
        border-radius: var(--beam-radius-pill);
        background: var(--beam-color-surface);
        color: var(--beam-color-muted);
        font-family: var(--beam-font-family);
        font-size: 12.5px;
        cursor: default;
        transition: border-color var(--beam-transition-fast);
      }

      button:hover {
        border-color: var(--beam-color-accent);
      }

      beam-icon-search {
        --beam-icon-size: 15px;
      }

      .word {
        flex: 1;
        text-align: left;
      }

      kbd {
        padding: 0 7px;
        border: 1px solid var(--beam-color-border);
        border-radius: var(--beam-radius-pill);
        background: var(--beam-color-bg);
        font-family: inherit;
        font-size: var(--beam-font-size-caption);
        line-height: 18px;
      }

      /* A phone has no room for the pill, so it folds to its magnifier. */
      @media (max-width: 48rem) {
        button {
          justify-content: center;
          width: 32px;
          padding: 0;
        }

        .word,
        kbd {
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

  /** The visible word and the accessible name. */
  @property({ type: String })
  label = "Search";

  /** The keycap's text. */
  @property({ type: String })
  shortcut = "⌘K";

  /** The same chord in `aria-keyshortcuts` form, e.g. `Meta+K`. */
  @property({ type: String, attribute: "key-shortcuts" })
  keyShortcuts = "Meta+K";

  render() {
    return html`
      <button
        type="button"
        part="button"
        aria-label=${this.label}
        aria-haspopup="dialog"
        aria-keyshortcuts=${this.keyShortcuts}
        @click=${(event: Event) => dispatchPaletteOpen(event.currentTarget as HTMLElement, "all")}
      >
        <beam-icon-search></beam-icon-search>
        <span class="word">${this.label}</span>
        <kbd part="keycap" aria-hidden="true">${this.shortcut}</kbd>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "beam-search-pill": BeamSearchPill;
  }
}
