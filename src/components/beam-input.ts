import { html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { BeamField, fieldStyles } from './field.js';

/**
 * A text field (C-Controls) with its label, a hint, and an error under it. A refused value
 * stays as typed with the message; it does not snap back. Enter submits the form the field is
 * in. `input` events come from the field as typed; `change` when it is committed.
 */
@customElement('beam-input')
export class BeamInput extends BeamField {
  static styles = fieldStyles;

  @property({ type: String })
  value = '';

  @property({ type: String })
  type: 'text' | 'email' | 'url' | 'search' | 'tel' | 'password' | 'number' | 'date' | 'month' = 'text';

  @property({ type: String })
  placeholder = '';

  @property({ type: String })
  autocomplete = '';

  @property({ type: String })
  inputmode = '';

  @property({ type: String })
  min = '';

  @property({ type: String })
  max = '';

  @property({ type: String })
  step = '';

  @property({ type: Number })
  maxlength: number | undefined = undefined;

  /** What `form.reset()` puts back: the value the field started with. */
  private initial: string | null = null;

  @query('input')
  private input!: HTMLInputElement | null;

  protected get control(): HTMLElement | null {
    return this.input;
  }

  protected formValue(): string | null {
    return this.value;
  }

  protected isEmpty(): boolean {
    return this.value === '';
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.initial === null) this.initial = this.value;
  }

  formResetCallback(): void {
    this.value = this.initial ?? '';
  }

  focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }

  select(): void {
    this.input?.select();
  }

  private onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.isComposing) {
      this.changed();
      this.submitForm();
    }
  }

  render() {
    const described = this.describedBy();
    return html`${this.renderLabel('input')}
      <input
        part="input"
        id="input"
        class="box"
        .value=${live(this.value)}
        type=${this.type}
        placeholder=${this.placeholder || nothing}
        autocomplete=${(this.autocomplete || nothing) as never}
        inputmode=${(this.inputmode || nothing) as never}
        min=${this.min || nothing}
        max=${this.max || nothing}
        step=${this.step || nothing}
        maxlength=${this.maxlength ?? nothing}
        ?disabled=${this.disabled}
        ?required=${this.required}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${described || nothing}
        @input=${this.onInput}
        @change=${() => this.changed()}
        @keydown=${this.onKeydown}
      />
      ${this.renderNote()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-input': BeamInput;
  }
}
