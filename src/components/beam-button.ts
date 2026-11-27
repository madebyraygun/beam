import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseCss } from '../theme/index.js';
import { spinner } from './field.js';

/**
 * A button (C-Controls): a pill `--beam-control-height` tall.
 *
 * - `variant`: `secondary` (the default, an edge), `primary` (the accent fill), `danger`
 *   (danger edge and text), `ghost` (no edge), or `icon` (a square, muted; give it a `label`).
 * - `size`: `s`, the default, or `touch` (44px, for a finger).
 * - `loading`: keeps its width and label, shows a spinner in place of the icon, and is not
 *   pressable.
 * - `type="submit"` or `type="reset"` acts on the form the button is in, as a native one does.
 *
 * The label is the default slot; an icon goes in the `icon` slot, before it.
 */
@customElement('beam-button')
export class BeamButton extends LitElement {
  static formAssociated = true;
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
  static styles = [
    baseCss,
    css`
      :host {
        display: inline-flex;
        vertical-align: middle;
      }

      :host([hidden]) {
        display: none;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-sizing: border-box;
        width: 100%;
        height: var(--beam-control-height);
        padding: 0 14px;
        border: 1px solid var(--beam-color-border);
        border-radius: var(--beam-radius-pill);
        background: transparent;
        color: var(--beam-color-text);
        font: inherit;
        font-family: var(--beam-font-family);
        font-size: var(--beam-font-size-control);
        white-space: nowrap;
        cursor: default;
        transition: background var(--beam-transition-fast);
      }

      button:hover:not(:disabled) {
        background: var(--beam-color-hover);
      }

      :host([variant='primary']) button {
        background: var(--beam-color-accent);
        border-color: var(--beam-color-accent);
        color: var(--beam-color-on-accent);
        font-weight: var(--beam-font-weight-medium);
      }

      :host([variant='primary']) button:hover:not(:disabled) {
        background: color-mix(in srgb, var(--beam-color-accent) 88%, var(--beam-color-text));
      }

      :host([variant='danger']) button {
        border-color: var(--beam-color-danger);
        color: var(--beam-color-danger);
      }

      :host([variant='danger']) button:hover:not(:disabled) {
        background: color-mix(in srgb, var(--beam-color-danger) 10%, transparent);
      }

      :host([variant='ghost']) button {
        border-color: transparent;
      }

      :host([variant='icon']) button {
        width: var(--beam-control-height);
        padding: 0;
        border-color: transparent;
        border-radius: var(--beam-radius-md);
        color: var(--beam-color-muted);
      }

      :host([size='s']) button {
        height: var(--beam-control-height-s);
        padding: 0 10px;
      }

      :host([size='touch']) button {
        height: var(--beam-control-height-touch);
        padding: 0 18px;
      }

      :host([variant='icon'][size='touch']) button {
        width: var(--beam-control-height-touch);
      }

      button:disabled {
        opacity: var(--beam-opacity-disabled);
      }

      :host([loading]) button {
        opacity: 1;
        cursor: progress;
      }

      ::slotted(svg),
      ::slotted([slot='icon']) {
        flex: none;
      }

      .spinner {
        flex: none;
        width: 14px;
        height: 14px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (forced-colors: active) {
        button {
          border-color: ButtonText;
        }
      }
    `,
  ];

  private readonly internals = this.attachInternals();

  @property({ type: String, reflect: true })
  variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon' = 'secondary';

  @property({ type: String, reflect: true })
  size: 's' | 'm' | 'touch' = 'm';

  @property({ type: String, reflect: true })
  type: 'button' | 'submit' | 'reset' = 'button';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  loading = false;

  /** The accessible name, for an icon button whose content is only an icon. */
  @property({ type: String })
  label = '';

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  private onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const form = this.internals.form;
    if (!form) return;
    // Through the prototype, as a control named `submit` or `reset` shadows the form's own.
    if (this.type === 'submit') HTMLFormElement.prototype.requestSubmit.call(form);
    if (this.type === 'reset') HTMLFormElement.prototype.reset.call(form);
  }

  render() {
    return html`<button
      part="button"
      type="button"
      ?disabled=${this.disabled}
      aria-disabled=${this.loading ? 'true' : nothing}
      aria-busy=${this.loading ? 'true' : nothing}
      aria-label=${this.label || nothing}
      @click=${this.onClick}
    >
      ${this.loading ? spinner : html`<slot name="icon"></slot>`}<slot></slot>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-button': BeamButton;
  }
}
