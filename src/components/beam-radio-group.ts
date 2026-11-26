import { css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { BeamField, fieldStyles } from './field.js';

interface Choice {
  value: string;
  label: string;
  disabled: boolean;
}

let groups = 0;

/**
 * A radio group (C-Controls): a fieldset with its legend and native radios, so the arrow
 * keys move the choice and a screen reader counts the options. An 18px dot, chosen as a
 * 5.5px `--beam-color-accent` ring. Rows are 28px, 44px with `size="touch"`.
 *
 * `variant="segmented"` is the same control drawn as segments side by side, for three or so
 * short choices: the chosen segment on `--beam-color-surface`, on a `--beam-color-surface-alt`
 * track.
 *
 * Choices are `<option>` children, as for a select.
 */
@customElement('beam-radio-group')
export class BeamRadioGroup extends BeamField {
  static styles = [
    fieldStyles,
    css`
      fieldset {
        margin: 0;
        padding: 0;
        border: 0;
        min-width: 0;
      }

      .options {
        display: grid;
        gap: 2px;
      }

      .option {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 28px;
        margin: 0;
        font-size: var(--beam-font-size-body);
        font-weight: normal;
      }

      :host([size='touch']) .option {
        min-height: var(--beam-control-height-touch);
      }

      .option input {
        appearance: none;
        -webkit-appearance: none;
        flex: none;
        width: 18px;
        height: 18px;
        margin: 0;
        border: 1.5px solid var(--beam-color-border);
        border-radius: 50%;
        background: var(--beam-color-field);
        transition: border-width var(--beam-transition-fast);
      }

      .option input:checked {
        border: 5.5px solid var(--beam-color-accent);
      }

      fieldset[aria-invalid='true'] .option input {
        border-color: var(--beam-color-danger);
      }

      fieldset[aria-invalid='true'] .option input:checked {
        border-color: var(--beam-color-accent);
      }

      .option:has(input:disabled) {
        opacity: var(--beam-opacity-disabled);
      }

      /* The segmented form. */
      :host([variant='segmented']) .options {
        display: inline-flex;
        gap: 2px;
        padding: 2px;
        border-radius: var(--beam-radius-md);
        background: var(--beam-color-surface-alt);
        border: 1px solid var(--beam-color-border-soft);
      }

      :host([variant='segmented']) .option {
        position: relative;
        min-height: calc(var(--beam-control-height) - 6px);
        padding: 0 12px;
        border-radius: var(--beam-radius-sm);
        font-size: var(--beam-font-size-control);
        color: var(--beam-color-muted);
      }

      :host([variant='segmented'][size='touch']) .option {
        min-height: calc(var(--beam-control-height-touch) - 6px);
      }

      :host([variant='segmented']) .option input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
        border-radius: inherit;
        background: transparent;
        opacity: 0;
      }

      :host([variant='segmented']) .option:has(input:checked) {
        background: var(--beam-color-surface);
        color: var(--beam-color-text);
        box-shadow: var(--beam-shadow-floating);
      }

      :host([variant='segmented']) .option:has(input:focus-visible) {
        outline: 2px solid var(--beam-color-focus);
        outline-offset: 2px;
      }

      @media (forced-colors: active) {
        .option input:checked {
          border-color: Highlight;
        }
      }
    `,
  ];

  @property({ type: String })
  value = '';

  @property({ type: String, reflect: true })
  variant: 'list' | 'segmented' = 'list';

  @property({ type: String, reflect: true })
  size: 'm' | 'touch' = 'm';

  @state()
  private choices: Choice[] = [];

  private initial: string | null = null;
  private readonly group = `group-${++groups}`;
  private readonly watcher = new MutationObserver(() => this.readOptions());

  @query('input:checked, input')
  private first!: HTMLInputElement | null;

  protected get control(): HTMLElement | null {
    return this.first;
  }

  protected formValue(): string | null {
    return this.value === '' ? null : this.value;
  }

  protected isEmpty(): boolean {
    return this.value === '';
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.readOptions();
    this.watcher.observe(this, { childList: true, subtree: true, attributes: true, characterData: true });
  }

  disconnectedCallback(): void {
    this.watcher.disconnect();
    super.disconnectedCallback();
  }

  formResetCallback(): void {
    this.value = this.initial ?? '';
  }

  focus(options?: FocusOptions): void {
    (this.renderRoot.querySelector<HTMLInputElement>('input:checked') ?? this.first)?.focus(options);
  }

  private readOptions(): void {
    this.choices = [...this.querySelectorAll('option')].map((option) => ({
      value: option.value,
      label: option.textContent?.trim() ?? option.value,
      disabled: option.disabled,
    }));
    if (this.initial === null) {
      const chosen = [...this.querySelectorAll('option')].find((option) => option.hasAttribute('selected'));
      if (!this.value && chosen) this.value = chosen.value;
      this.initial = this.value;
    }
  }

  private choose(value: string): void {
    this.value = value;
    this.changed();
  }

  render() {
    const described = this.describedBy();
    return html`<fieldset
        part="fieldset"
        ?disabled=${this.disabled}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${described || nothing}
      >
        ${this.label ? html`<legend part="label">${this.label}</legend>` : nothing}
        <div class="options" part="options">
          ${this.choices.map(
            (choice) => html`<label class="option" part="option">
              <input
                type="radio"
                name=${this.group}
                value=${choice.value}
                .checked=${choice.value === this.value}
                ?disabled=${choice.disabled}
                ?required=${this.required}
                @change=${() => this.choose(choice.value)}
              /><span>${choice.label}</span>
            </label>`,
          )}
        </div>
      </fieldset>
      ${this.renderNote()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-radio-group': BeamRadioGroup;
  }
}
