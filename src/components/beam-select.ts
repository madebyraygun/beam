import { css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { BeamField, fieldStyles } from './field.js';

interface Choice {
  value: string;
  label: string;
  disabled: boolean;
  /** A colour for the dot before the label, such as a status's. */
  color: string;
}

/**
 * A select (C-Controls): the native element, so the keyboard, the screen reader and the
 * picker are the platform's. Where the engine has the styleable select (`appearance:
 * base-select`, Safari 27 and Chrome 135), the open list is drawn from the theme: on
 * `--beam-color-surface` with `--beam-shadow-raised`, the highlighted option on
 * `--beam-color-selected`, a check on the chosen one, and an option's dot. Before that the
 * closed field is styled the same and the list is the system's.
 *
 * Options are `<option>` children: `<beam-select label="Priority"><option value="high">High
 * </option>…</beam-select>`. `data-color` on an option gives it a dot.
 */
@customElement('beam-select')
export class BeamSelect extends BeamField {
  static styles = [
    fieldStyles,
    css`
      select.box {
        appearance: none;
        -webkit-appearance: none;
        height: var(--beam-control-height);
        min-height: 0;
        padding-right: 30px;
        background-image: linear-gradient(45deg, transparent 50%, var(--beam-color-muted) 50%),
          linear-gradient(135deg, var(--beam-color-muted) 50%, transparent 50%);
        background-position:
          calc(100% - 15px) 52%,
          calc(100% - 10px) 52%;
        background-size:
          5px 5px,
          5px 5px;
        background-repeat: no-repeat;
      }

      .dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 6px;
        border-radius: 50%;
      }

      @supports (appearance: base-select) {
        select.box,
        select.box::picker(select) {
          appearance: base-select;
        }

        select.box {
          display: flex;
          align-items: center;
          background-image: none;
          padding-right: 11px;
        }

        select.box::picker-icon {
          color: var(--beam-color-muted);
        }

        select.box::picker(select) {
          margin-top: 4px;
          padding: 4px;
          border: 1px solid var(--beam-color-border);
          border-radius: var(--beam-radius-md);
          background: var(--beam-color-surface);
          box-shadow: var(--beam-shadow-raised);
        }

        option {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 32px;
          padding: 0 10px;
          border-radius: var(--beam-radius-sm);
          color: var(--beam-color-text);
          font-size: var(--beam-font-size-body);
        }

        option:hover,
        option:focus-visible {
          background: var(--beam-color-selected);
          outline: none;
        }

        option::checkmark {
          order: 2;
          margin-left: auto;
          color: var(--beam-color-accent);
        }

        option:disabled {
          opacity: var(--beam-opacity-disabled);
        }
      }
    `,
  ];

  @property({ type: String })
  value = '';

  /** Shown, and submitted as empty, while nothing is chosen. Leave unset to always choose. */
  @property({ type: String })
  placeholder = '';

  @state()
  private choices: Choice[] = [];

  private initial: string | null = null;
  private readonly watcher = new MutationObserver(() => this.readOptions());

  @query('select')
  private select!: HTMLSelectElement | null;

  protected get control(): HTMLElement | null {
    return this.select;
  }

  protected formValue(): string | null {
    return this.value;
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
    this.select?.focus(options);
  }

  /** The `<option>` children, read again whenever they change. */
  private readOptions(): void {
    const options = [...this.querySelectorAll('option')];
    this.choices = options.map((option) => ({
      value: option.value,
      label: option.textContent?.trim() ?? option.value,
      disabled: option.disabled,
      color: option.dataset.color ?? '',
    }));
    if (this.initial === null) {
      const chosen = options.find((option) => option.selected && option.hasAttribute('selected'));
      if (!this.value && chosen) this.value = chosen.value;
      if (!this.value && !this.placeholder && this.choices[0]) this.value = this.choices[0].value;
      this.initial = this.value;
    }
  }

  private onChange(event: Event): void {
    this.value = (event.target as HTMLSelectElement).value;
    this.changed();
  }

  render() {
    const described = this.describedBy();
    const known = this.choices.some((choice) => choice.value === this.value);
    return html`${this.renderLabel('select')}
      <select
        part="select"
        id="select"
        class="box"
        ?disabled=${this.disabled}
        ?required=${this.required}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${described || nothing}
        @change=${this.onChange}
      >
        ${this.placeholder ? html`<option value="" ?selected=${this.value === ''}>${this.placeholder}</option>` : nothing}
        ${!known && this.value ? html`<option value=${this.value} selected>${this.value}</option>` : nothing}
        ${this.choices.map(
          (choice) => html`<option value=${choice.value} ?disabled=${choice.disabled} ?selected=${choice.value === this.value}>
            ${choice.color ? html`<span class="dot" style="background:${choice.color}"></span>` : nothing}${choice.label}
          </option>`,
        )}
      </select>
      ${this.renderNote()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-select': BeamSelect;
  }
}
