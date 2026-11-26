import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { BeamField, fieldStyles } from './field.js';

/** Whether this engine grows a field to its text by itself (Safari 26.2, Chrome 123). */
const sizesItself = typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content');

/**
 * A text area (C-Controls), styled as a field, that grows with its text up to `max-lines`
 * (12) and then scrolls. The text is kept exactly as typed. ⌘↵ or Ctrl↵ submits the form.
 */
@customElement('beam-textarea')
export class BeamTextarea extends BeamField {
  static styles = [
    fieldStyles,
    css`
      textarea.box {
        padding-top: 8px;
        padding-bottom: 8px;
        line-height: 1.5;
        resize: none;
        overflow-y: auto;
      }

      @supports (field-sizing: content) {
        textarea.box {
          field-sizing: content;
        }
      }
    `,
  ];

  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = '';

  /** The height when empty, in lines. */
  @property({ type: Number })
  rows = 3;

  @property({ type: Number, attribute: 'max-lines' })
  maxLines = 12;

  @property({ type: Number })
  maxlength: number | undefined = undefined;

  private initial: string | null = null;

  @query('textarea')
  private area!: HTMLTextAreaElement | null;

  protected get control(): HTMLElement | null {
    return this.area;
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
    this.area?.focus(options);
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    this.grow();
  }

  /** Below field-sizing: set the height to the text's, within the rows and the cap. */
  private grow(): void {
    const area = this.area;
    if (sizesItself || !area) return;
    area.style.height = 'auto';
    area.style.height = `${area.scrollHeight + 2}px`;
  }

  private onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      this.changed();
      this.submitForm();
    }
  }

  render() {
    const described = this.describedBy();
    return html`${this.renderLabel('area')}
      <textarea
        part="textarea"
        id="area"
        class="box"
        style="min-height: calc(${this.rows} * 1.5em + 18px); max-height: calc(${this.maxLines} * 1.5em + 18px)"
        .value=${live(this.value)}
        rows=${this.rows}
        placeholder=${this.placeholder || nothing}
        maxlength=${this.maxlength ?? nothing}
        ?disabled=${this.disabled}
        ?required=${this.required}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${described || nothing}
        @input=${this.onInput}
        @change=${() => this.changed()}
        @keydown=${this.onKeydown}
      ></textarea>
      ${this.renderNote()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-textarea': BeamTextarea;
  }
}
