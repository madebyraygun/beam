import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { baseCss } from '../theme/index.js';

/**
 * What every form control shares: a label, a hint, an error message, and its part in a
 * `<form>` through `ElementInternals`, so `FormData`, `form.reset()`, `required` and a
 * disabled `<fieldset>` all work as they do for a native control.
 *
 * The native element lives in the control's shadow root, which is outside the page's form.
 * The control therefore submits the form itself when Enter is pressed in a field, as a
 * native field would.
 */
export abstract class BeamField extends LitElement {
  static formAssociated = true;
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  protected readonly internals: ElementInternals = this.attachInternals();

  /** The name the value is submitted under. */
  @property({ type: String, reflect: true })
  name = '';

  @property({ type: String })
  label = '';

  /** A line of help under the field. Hidden while an error shows. */
  @property({ type: String })
  hint = '';

  /**
   * A message saying why the value is refused. The field keeps the value as typed and
   * shows the message under it; the form will not submit while it is set.
   */
  @property({ type: String })
  error = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  /** The element that takes focus and that a validity message points at. */
  protected abstract get control(): HTMLElement | null;

  /** The value as the form submits it; null submits nothing. */
  protected abstract formValue(): string | null;

  /** True when `required` and nothing is chosen or typed. */
  protected abstract isEmpty(): boolean;

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    return this.internals.validity;
  }

  get validationMessage(): string {
    return this.internals.validationMessage;
  }

  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    this.sync();
  }

  /** Tell the form the value and whether it is valid. */
  protected sync(): void {
    const anchor = this.control ?? undefined;
    this.internals.setFormValue(this.formValue());
    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.required && this.isEmpty()) {
      this.internals.setValidity({ valueMissing: true }, 'Fill this in.', anchor);
    } else {
      this.internals.setValidity({});
    }
  }

  /** Submit the form this control is in, as Enter in a native field does. */
  protected submitForm(): void {
    const form = this.internals.form;
    if (!form) return;
    const submitter = form.querySelector('button[type="submit"], input[type="submit"]');
    const requestSubmit = HTMLFormElement.prototype.requestSubmit;
    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) requestSubmit.call(form, submitter);
    else requestSubmit.call(form);
  }

  /** `change` does not leave a shadow root, so the control sends its own. */
  protected changed(): void {
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  protected describedBy(): string {
    return this.error ? 'error' : this.hint ? 'hint' : '';
  }

  protected renderLabel(forId: string): TemplateResult | typeof nothing {
    return this.label ? html`<label part="label" for=${forId}>${this.label}</label>` : nothing;
  }

  protected renderNote(): TemplateResult | typeof nothing {
    if (this.error) {
      return html`<span part="error" id="error" class="error" role="alert"
        ><svg aria-hidden="true" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" /><path d="M8 4.5v4.2M8 11.2v.3" /></svg
        >${this.error}</span
      >`;
    }
    return this.hint ? html`<span part="hint" id="hint" class="hint">${this.hint}</span>` : nothing;
  }
}

/** A spinner the size of a line of control text. */
export const spinner = html`<span class="spinner" aria-hidden="true"></span>`;

/**
 * The styles every field shares (C-Controls): a 36px box on `--beam-color-field`, its edge
 * moving toward the accent on hover, an accent edge and `--beam-color-ring` on focus, the
 * danger edge and `--beam-color-danger-ring` in error.
 */
export const fieldStyles = [
  baseCss,
  css`
    :host {
      display: block;
      font-family: var(--beam-font-family);
      color: var(--beam-color-text);
    }

    :host([hidden]) {
      display: none;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    label,
    legend {
      display: block;
      margin-bottom: 6px;
      font-size: var(--beam-font-size-control);
      font-weight: var(--beam-font-weight-medium);
    }

    .box {
      display: block;
      width: 100%;
      min-height: 36px;
      padding: 0 11px;
      border: 1px solid var(--beam-color-border);
      border-radius: var(--beam-radius-md);
      background: var(--beam-color-field);
      color: var(--beam-color-text);
      font: inherit;
      font-size: var(--beam-font-size-body);
      transition:
        border-color var(--beam-transition-fast),
        box-shadow var(--beam-transition-fast);
    }

    .box::placeholder {
      color: var(--beam-color-muted);
      opacity: 1;
    }

    .box:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--beam-color-accent) 45%, var(--beam-color-border));
    }

    .box:focus,
    .box:focus-visible {
      outline: none;
      border-color: var(--beam-color-accent);
      box-shadow: 0 0 0 3px var(--beam-color-ring);
    }

    .box[aria-invalid='true'] {
      border-color: var(--beam-color-danger);
      box-shadow: 0 0 0 3px var(--beam-color-danger-ring);
    }

    .box:disabled {
      opacity: var(--beam-opacity-disabled);
    }

    .hint,
    .error {
      display: flex;
      gap: 5px;
      align-items: center;
      margin-top: 5px;
      font-size: var(--beam-font-size-caption);
    }

    .hint {
      color: var(--beam-color-muted);
    }

    .error {
      color: var(--beam-color-danger);
    }

    .error svg {
      flex: none;
      width: 13px;
      height: 13px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.6;
      stroke-linecap: round;
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

    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation-duration: 2.4s;
      }
    }

    @media (forced-colors: active) {
      .box:focus {
        outline: 2px solid Highlight;
      }
    }
  `,
];
