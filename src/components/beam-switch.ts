import { css, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BeamField, fieldStyles, spinner } from './field.js';

/**
 * A switch (C-Controls): 38 × 22, its track `--beam-color-border` off and
 * `--beam-color-accent` on, the knob white off and `--beam-color-on-accent` on. A native
 * checkbox with the switch role underneath, so Space toggles it and a screen reader says
 * on or off. The label, the default slot, is part of what is pressed. `loading` shows a
 * spinner and refuses presses while a change is saved. Submits `value` (default `on`)
 * when on, like a checkbox.
 */
@customElement('beam-switch')
export class BeamSwitch extends BeamField {
  static styles = [
    fieldStyles,
    css`
      label.row {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-height: 28px;
        margin: 0;
        font-size: var(--beam-font-size-body);
        font-weight: normal;
        cursor: default;
      }

      input {
        appearance: none;
        -webkit-appearance: none;
        position: relative;
        flex: none;
        width: 38px;
        height: 22px;
        margin: 0;
        border-radius: var(--beam-radius-pill);
        background: var(--beam-color-border);
        transition: background var(--beam-transition-fast);
      }

      input::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--beam-color-field);
        box-shadow: 0 1px 2px var(--beam-color-overlay);
        transition: left var(--beam-transition-fast);
      }

      input:checked {
        background: var(--beam-color-accent);
      }

      input:checked::after {
        left: 19px;
        background: var(--beam-color-on-accent);
      }

      input:disabled,
      input:disabled + .text {
        opacity: var(--beam-opacity-disabled);
      }

      :host([loading]) input:disabled,
      :host([loading]) input:disabled + .text {
        opacity: 1;
      }

      .saving {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--beam-color-muted);
        font-size: var(--beam-font-size-caption);
      }

      @media (forced-colors: active) {
        input {
          border: 1px solid ButtonText;
        }
      }
    `,
  ];

  @property({ type: Boolean, reflect: true })
  checked = false;

  /** What the form gets when the switch is on. */
  @property({ type: String })
  value = 'on';

  @property({ type: Boolean, reflect: true })
  loading = false;

  private initial: boolean | null = null;

  @query('input')
  private input!: HTMLInputElement | null;

  protected get control(): HTMLElement | null {
    return this.input;
  }

  protected formValue(): string | null {
    return this.checked ? this.value : null;
  }

  protected isEmpty(): boolean {
    return !this.checked;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.initial === null) this.initial = this.checked;
  }

  formResetCallback(): void {
    this.checked = this.initial ?? false;
  }

  focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }

  private onChange(event: Event): void {
    this.checked = (event.target as HTMLInputElement).checked;
    this.changed();
  }

  render() {
    const described = this.describedBy();
    return html`<label class="row" part="row">
        <input
          part="switch"
          type="checkbox"
          role="switch"
          .checked=${this.checked}
          ?disabled=${this.disabled || this.loading}
          ?required=${this.required}
          aria-busy=${this.loading ? 'true' : nothing}
          aria-invalid=${this.error ? 'true' : 'false'}
          aria-describedby=${described || nothing}
          @change=${this.onChange}
        /><span class="text"><slot>${this.label}</slot></span>
        ${this.loading ? html`<span class="saving">${spinner}Saving</span>` : nothing}
      </label>
      ${this.renderNote()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-switch': BeamSwitch;
  }
}
