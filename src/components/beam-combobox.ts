import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { BeamField, fieldStyles, spinner } from './field.js';

/** One choice in a combobox. */
export interface ComboOption {
  value: string;
  label: string;
  /** Options with the same group are drawn under its heading, in the order first seen. */
  group?: string;
  /** Up to two characters drawn on a small tile before the label, such as initials. */
  badge?: string;
  /** The tile's colour. */
  color?: string;
}

/** How many rows show before the list scrolls. */
const ROWS = 8;
const ROW_HEIGHT = 32;

/**
 * A combobox (C-Controls), from Nigel's category picker made general: a text field with a
 * list under it, for long or searchable lists such as people or records.
 *
 * Typing filters, and the matching part of each label is drawn in
 * `--beam-font-weight-semibold`. ↑ and ↓ move the highlight, Home and End go to the ends, ↵
 * picks, Esc closes the list. The list shows up to eight rows and scrolls. It sits in the top
 * layer (a popover), so nothing clips it, and is kept beside the field by a few lines of
 * script, on every engine.
 *
 * `options` is the list. Set `loading` while it is fetched (`input` events carry the typed
 * text, `query`); with no match one muted line says so (`no-match`, where `{query}` is the
 * text). `allow-free` lets ↵ commit typed text that matches nothing. `value` is the chosen
 * option's value, submitted with the form; `change` says it changed.
 */
@customElement('beam-combobox')
export class BeamCombobox extends BeamField {
  static styles = [
    fieldStyles,
    css`
      .field {
        position: relative;
      }

      .box {
        display: flex;
        align-items: center;
        height: var(--beam-control-height);
        min-height: 0;
        padding-right: 30px;
      }

      .chevron {
        position: absolute;
        right: 11px;
        top: 50%;
        width: 10px;
        height: 10px;
        margin-top: -5px;
        fill: none;
        stroke: var(--beam-color-muted);
        stroke-width: 1.6;
        pointer-events: none;
      }

      .list {
        position: fixed;
        inset: auto;
        margin: 0;
        box-sizing: border-box;
        max-height: calc(${ROWS} * ${ROW_HEIGHT}px + 10px);
        overflow-y: auto;
        padding: 4px;
        border: 1px solid var(--beam-color-border);
        border-radius: var(--beam-radius-md);
        background: var(--beam-color-surface);
        color: var(--beam-color-text);
        box-shadow: var(--beam-shadow-raised);
        font-family: var(--beam-font-family);
      }

      .list:not(:popover-open) {
        display: none;
      }

      .heading {
        padding: 6px 10px 2px;
        font-size: var(--beam-font-size-label);
        font-weight: var(--beam-font-weight-medium);
        letter-spacing: var(--beam-letter-spacing-label);
        text-transform: uppercase;
        color: var(--beam-color-muted);
      }

      [role='option'] {
        display: flex;
        align-items: center;
        gap: 8px;
        height: ${ROW_HEIGHT}px;
        padding: 0 10px;
        border-radius: var(--beam-radius-sm);
        font-size: var(--beam-font-size-body);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      [role='option'][aria-selected='true'] {
        background: var(--beam-color-selected);
      }

      mark {
        background: none;
        color: inherit;
        font-weight: var(--beam-font-weight-semibold);
      }

      .badge {
        flex: none;
        display: inline-grid;
        place-items: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--beam-color-surface-alt);
        color: var(--beam-color-on-tone);
        font-size: 8px;
        font-weight: var(--beam-font-weight-semibold);
      }

      .quiet {
        display: flex;
        align-items: center;
        gap: 8px;
        height: ${ROW_HEIGHT}px;
        padding: 0 10px;
        color: var(--beam-color-muted);
        font-size: var(--beam-font-size-body);
      }
    `,
  ];

  @property({ attribute: false })
  options: ComboOption[] = [];

  /** The chosen option's value; empty when none. */
  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = '';

  @property({ type: Boolean, reflect: true })
  loading = false;

  @property({ type: String, attribute: 'loading-text' })
  loadingText = 'Finding…';

  /** The line shown when nothing matches; `{query}` is the typed text. */
  @property({ type: String, attribute: 'no-match' })
  noMatch = 'Nothing matches "{query}".';

  /** ↵ commits typed text that matches no option as the value. */
  @property({ type: Boolean, attribute: 'allow-free' })
  allowFree = false;

  /** What is typed in the field. */
  @state()
  query = '';

  @state()
  private expanded = false;

  @state()
  private active = 0;

  private initial: string | null = null;
  private readonly follow = () => this.place();

  @query('input')
  private input!: HTMLInputElement | null;

  @query('.list')
  private list!: HTMLElement | null;

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

  disconnectedCallback(): void {
    this.unfollow();
    super.disconnectedCallback();
  }

  formResetCallback(): void {
    this.value = this.initial ?? '';
    this.query = '';
  }

  focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }

  /** The chosen option, if `value` names one. */
  get selected(): ComboOption | undefined {
    return this.options.find((option) => option.value === this.value);
  }

  /** The options that match what is typed, in the order they are drawn. */
  get shown(): ComboOption[] {
    const needle = this.query.trim().toLowerCase();
    const shown = this.selected && this.query === this.selected.label ? '' : needle;
    const found = shown ? this.options.filter((option) => option.label.toLowerCase().includes(shown)) : this.options;
    const groups: string[] = [];
    for (const option of found) if (!groups.includes(option.group ?? '')) groups.push(option.group ?? '');
    return groups.flatMap((group) => found.filter((option) => (option.group ?? '') === group));
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    if ((changed.has('value') || changed.has('options')) && !this.expanded) {
      this.query = this.selected?.label ?? this.value;
    }
  }

  protected updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    const list = this.list;
    if (!list) return;
    const open = this.expanded;
    let showing = false;
    try {
      showing = list.matches(':popover-open');
    } catch {
      // An engine without popovers: the list is drawn in place.
    }
    if (open && !showing) {
      list.showPopover?.();
      this.place();
      window.addEventListener('scroll', this.follow, true);
      window.addEventListener('resize', this.follow);
    } else if (!open && showing) {
      list.hidePopover?.();
      this.unfollow();
    } else if (open) {
      this.place();
    }
    list.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' });
  }

  private unfollow(): void {
    window.removeEventListener('scroll', this.follow, true);
    window.removeEventListener('resize', this.follow);
  }

  /**
   * Keep the list beside the field: under it, as wide, and above it when there is not room
   * below. The list is in the top layer, so it is placed in the window's coordinates.
   */
  private place(): void {
    const list = this.list;
    const input = this.input;
    if (!list || !input) return;
    const box = input.getBoundingClientRect();
    const height = Math.min(list.scrollHeight, ROWS * ROW_HEIGHT + 10);
    const below = window.innerHeight - box.bottom - 8;
    const above = box.top - 8;
    const up = below < height && above > below;
    list.style.left = `${Math.round(box.left)}px`;
    list.style.width = `${Math.round(box.width)}px`;
    list.style.top = up ? `${Math.round(box.top - 4 - height)}px` : `${Math.round(box.bottom + 4)}px`;
  }

  private open(): void {
    if (this.disabled) return;
    this.expanded = true;
  }

  private close(): void {
    this.expanded = false;
    this.query = this.selected?.label ?? this.value;
  }

  private choose(option: ComboOption | undefined): void {
    if (!option) return;
    this.value = option.value;
    this.query = option.label;
    this.expanded = false;
    this.active = 0;
    this.changed();
  }

  private onInput(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    this.expanded = true;
    this.active = 0;
  }

  private onKeydown(event: KeyboardEvent): void {
    const matches = this.shown;
    switch (event.key) {
      case 'ArrowDown':
        if (!this.expanded) this.open();
        else this.active = Math.min(this.active + 1, Math.max(matches.length - 1, 0));
        break;
      case 'ArrowUp':
        if (!this.expanded) this.open();
        else this.active = Math.max(this.active - 1, 0);
        break;
      case 'Home':
        if (!this.expanded) return;
        this.active = 0;
        break;
      case 'End':
        if (!this.expanded) return;
        this.active = Math.max(matches.length - 1, 0);
        break;
      case 'Enter':
        if (!this.expanded) return;
        if (matches[this.active]) this.choose(matches[this.active]);
        else if (this.allowFree && this.query.trim()) {
          this.value = this.query.trim();
          this.expanded = false;
          this.changed();
        }
        break;
      case 'Escape':
        // Only taken when there is a list to close; otherwise Escape belongs to the page.
        if (!this.expanded) return;
        this.close();
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  /** The label with the typed text drawn heavier. */
  private labelOf(option: ComboOption) {
    const needle = this.query.trim().toLowerCase();
    const at = needle ? option.label.toLowerCase().indexOf(needle) : -1;
    if (at < 0 || (this.selected && this.query === this.selected.label)) return option.label;
    return html`${option.label.slice(0, at)}<mark>${option.label.slice(at, at + needle.length)}</mark>${option.label.slice(at + needle.length)}`;
  }

  private renderList() {
    const matches = this.shown;
    let lastGroup: string | undefined;
    const rows = matches.map((option, index) => {
      const heading = option.group && option.group !== lastGroup ? html`<div class="heading" role="presentation">${option.group}</div>` : nothing;
      lastGroup = option.group;
      return html`${heading}<div
          role="option"
          id="option-${index}"
          aria-selected=${index === this.active ? 'true' : 'false'}
          @pointerdown=${(e: Event) => e.preventDefault()}
          @click=${() => this.choose(option)}
        >
          ${option.badge ? html`<span class="badge" aria-hidden="true" style=${option.color ? `background:${option.color}` : ''}>${option.badge}</span>` : nothing}<span>${this.labelOf(option)}</span>
        </div>`;
    });
    const body = this.loading
      ? html`<div class="quiet" role="status">${spinner}${this.loadingText}</div>`
      : matches.length === 0
        ? html`<div class="quiet" role="status">${this.noMatch.replace('{query}', this.query.trim())}</div>`
        : rows;
    return html`<div class="list" part="list" id="list" role="listbox" aria-label=${this.label || nothing} popover="manual">${body}</div>`;
  }

  render() {
    const matches = this.shown;
    const showing = this.expanded && !this.loading && matches.length > 0;
    const described = this.describedBy();
    return html`${this.renderLabel('input')}
      <div class="field">
        <input
          part="input"
          id="input"
          class="box"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded=${showing ? 'true' : 'false'}
          aria-controls="list"
          aria-activedescendant=${showing ? `option-${this.active}` : nothing}
          aria-invalid=${this.error ? 'true' : 'false'}
          aria-describedby=${described || nothing}
          autocomplete="off"
          spellcheck="false"
          .value=${live(this.query)}
          placeholder=${this.placeholder || nothing}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @input=${this.onInput}
          @keydown=${this.onKeydown}
          @focus=${this.open}
          @click=${this.open}
          @blur=${this.close}
        />
        <svg class="chevron" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" /></svg>
      </div>
      ${this.renderList()} ${this.renderNote()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-combobox': BeamCombobox;
  }
}
