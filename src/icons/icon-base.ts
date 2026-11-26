import { LitElement, html, css, svg, type SVGTemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * Base class for the icons: consistent sizing, color inheritance, and the
 * decorative-versus-meaningful accessibility split.
 *
 * An icon with no `label` is decorative and hidden from assistive tech — the
 * common case, since icons here sit beside their own text label. Setting
 * `label` promotes it to `role="img"` with an accessible name.
 *
 * Sizing has two modes. By default an icon is `--beam-icon-size` (20px), the
 * size a standalone mark wants — a toolbar button, an empty state. `inline`
 * makes it 1em instead, so a mark set in a run of text tracks the text rather
 * than the token, which is what every status mark needs.
 *
 * `--beam-icon-fill` fills the shape as well as stroking it; it inherits, so a
 * control sets it on itself for the icon inside.
 */
export abstract class WcIconBase extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--beam-icon-size);
      height: var(--beam-icon-size);
      color: inherit;
      flex-shrink: 0;
    }

    :host([inline]) {
      width: 1em;
      height: 1em;
    }

    /* Outline by default; --beam-icon-fill paints the shape solid, which is
       how a pressed toggle such as the register's flag reads as on. */
    svg {
      width: 100%;
      height: 100%;
      fill: var(--beam-icon-fill, none);
    }
  `;

  @property({ type: String })
  label = '';

  /** Size to the text this icon sits in rather than to `--beam-icon-size`. */
  @property({ type: Boolean, reflect: true })
  inline = false;

  protected abstract renderIcon(): SVGTemplateResult;

  render() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        role=${this.label ? 'img' : 'presentation'}
        aria-label=${this.label || ''}
        aria-hidden=${this.label ? 'false' : 'true'}
      >
        ${this.renderIcon()}
      </svg>
    `;
  }
}

export { svg };
