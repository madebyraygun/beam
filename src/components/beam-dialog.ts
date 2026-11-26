import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { baseCss } from '../theme/index.js';

/**
 * A modal dialog (C-Controls): the native `<dialog>` opened with `showModal()`, so the top
 * layer, the backdrop, the inert page and focus that returns to the opener are the browser's.
 * 440 wide (`size="confirm"`) or 620 (`size="form"`), on `--beam-color-surface`, the footer
 * on `--beam-color-surface-alt`.
 *
 * Escape and `requestClose()` send a cancelable `cancel` event first: a dialog that is saving
 * cancels it to stay open. Then `close`, with `returnValue`. Focus starts on an element with
 * `autofocus` (put it on Cancel for a destructive confirm), else on the first field.
 *
 * The body is the default slot; buttons go in the `footer` slot, the primary one last.
 */
@customElement('beam-dialog')
export class BeamDialog extends LitElement {
  static styles = [
    baseCss,
    css`
      dialog {
        box-sizing: border-box;
        width: min(440px, calc(100vw - 32px));
        max-height: calc(100dvh - 48px);
        padding: 0;
        border: 1px solid var(--beam-color-border);
        border-radius: var(--beam-radius-lg);
        background: var(--beam-color-surface);
        color: var(--beam-color-text);
        box-shadow: var(--beam-shadow-raised);
        font-family: var(--beam-font-family);
        font-size: var(--beam-font-size-body);
      }

      :host([size='form']) dialog {
        width: min(620px, calc(100vw - 32px));
      }

      dialog::backdrop {
        background: var(--beam-color-overlay);
      }

      dialog[open] {
        display: flex;
        flex-direction: column;
      }

      header {
        padding: 18px 20px 0;
      }

      h2 {
        margin: 0;
        font-size: 16px;
        font-weight: var(--beam-font-weight-semibold);
      }

      .body {
        padding: 10px 20px 18px;
        overflow: auto;
      }

      footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 20px;
        border-top: 1px solid var(--beam-color-border-soft);
        background: var(--beam-color-surface-alt);
        border-radius: 0 0 var(--beam-radius-lg) var(--beam-radius-lg);
      }

      footer.empty {
        display: none;
      }
    `,
  ];

  @property({ type: Boolean, reflect: true })
  open = false;

  /** The heading, which also names the dialog for a screen reader. */
  @property({ type: String })
  label = '';

  @property({ type: String, reflect: true })
  size: 'confirm' | 'form' = 'confirm';

  /** The value given to `close()` or `requestClose()`, as for the native dialog. */
  returnValue = '';

  @query('dialog')
  private dialog!: HTMLDialogElement | null;

  private footerFilled = false;

  /** Open as a modal. */
  show(): void {
    this.open = true;
  }

  /** Close now, with no `cancel`. */
  close(returnValue?: string): void {
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dialog?.close(returnValue);
  }

  /**
   * Ask to close: `cancel` first, which a listener can cancel to keep the dialog open, then
   * `close`. Escape does the same.
   */
  requestClose(returnValue?: string): void {
    const cancel = new Event('cancel', { cancelable: true });
    if (!this.dispatchEvent(cancel)) return;
    this.close(returnValue);
  }

  protected updated(changed: PropertyValues<this>): void {
    const dialog = this.dialog;
    if (!dialog || !changed.has('open')) return;
    if (this.open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      this.focusFirst();
    } else if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  /** `autofocus` first, then the first field, then the first button: in the page's tree. */
  private focusFirst(): void {
    const own = this.querySelector<HTMLElement>('[autofocus]') ??
      this.querySelector<HTMLElement>('beam-input, beam-textarea, beam-select, beam-combobox, input, textarea, select') ??
      this.querySelector<HTMLElement>('beam-button, button');
    own?.focus();
  }

  private onKeydown(event: KeyboardEvent): void {
    // Escape is handled here rather than by the browser, so `cancel` can always keep the
    // dialog open, whatever the engine's rules for a repeated Escape.
    if (event.key === 'Escape') {
      event.preventDefault();
      this.requestClose();
    }
  }

  private onNativeCancel(event: Event): void {
    event.preventDefault();
    this.requestClose();
  }

  private onClose(): void {
    this.open = false;
    if (this.dialog) this.returnValue = this.dialog.returnValue || this.returnValue;
    this.dispatchEvent(new Event('close'));
  }

  private onFooterSlot(event: Event): void {
    const filled = (event.target as HTMLSlotElement).assignedNodes({ flatten: true }).length > 0;
    if (filled !== this.footerFilled) {
      this.footerFilled = filled;
      this.requestUpdate();
    }
  }

  render() {
    return html`<dialog
      part="dialog"
      aria-labelledby=${this.label ? 'title' : nothing}
      @keydown=${this.onKeydown}
      @cancel=${this.onNativeCancel}
      @close=${this.onClose}
    >
      ${this.label ? html`<header part="header"><h2 id="title">${this.label}</h2></header>` : nothing}
      <div class="body" part="body"><slot></slot></div>
      <footer part="footer" class=${this.footerFilled ? '' : 'empty'}><slot name="footer" @slotchange=${this.onFooterSlot}></slot></footer>
    </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-dialog': BeamDialog;
  }
}
