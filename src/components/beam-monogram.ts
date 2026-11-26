import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MONOGRAM_TONES } from '../theme/index.js';

/** Company-form suffixes that say nothing about which one this is. */
const SUFFIXES = new Set(['llc', 'inc', 'ltd', 'co', 'corp', 'plc', 'llp', 'lp', 'gmbh']);

/**
 * Up to two initials for a name: the first letter of its first two words, or
 * the first two letters of a single word. "Acme Consulting LLC" is "AC",
 * "Globex" is "GL". Legal suffixes are skipped, so "Initech, Inc." is "IN"
 * rather than "II".
 */
export function monogramInitials(name: string): string {
  const words = name
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word !== '' && !SUFFIXES.has(word.toLowerCase()));
  if (words.length === 0) return '';
  const letters =
    words.length === 1 ? [...words[0]].slice(0, 2) : [[...words[0]][0], [...words[1]][0]];
  return letters.join('').toUpperCase();
}

/**
 * Which tone a seed lands on, 1 to `MONOGRAM_TONES`.
 *
 * FNV-1a over the seed's UTF-16 code units: stable across sessions and
 * machines, so a name keeps its colour wherever it is shown, and spread well
 * enough that two in one list rarely share one.
 */
export function monogramTone(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return ((hash >>> 0) % MONOGRAM_TONES) + 1;
}

/**
 * A monogram: a name's initials on a tinted tile.
 *
 * The colour comes from `seed` rather than from the name, so renaming keeps the
 * colour; a caller passes whatever identifies the thing for good. Decorative — the name is always printed beside it — so it is
 * hidden from assistive tech.
 */
@customElement('beam-monogram')
export class BeamMonogram extends LitElement {
  static styles = css`
    :host {
      --beam-monogram-size: 20px;
      display: inline-flex;
      flex: none;
    }

    :host([size='l']) {
      --beam-monogram-size: 32px;
    }

    .tile {
      display: inline-grid;
      place-items: center;
      width: var(--beam-monogram-size);
      height: var(--beam-monogram-size);
      border-radius: var(--beam-radius-sm);
      background: var(--beam-tone-1);
      color: var(--beam-color-on-tone);
      font-family: var(--beam-font-family);
      font-size: calc(var(--beam-monogram-size) * 0.45);
      font-weight: var(--beam-font-weight-bold);
      line-height: 1;
      letter-spacing: 0;
    }

    :host([size='l']) .tile {
      border-radius: var(--beam-radius-md);
      font-size: var(--beam-font-size-caption);
    }

    .tone-2 {
      background: var(--beam-tone-2);
    }
    .tone-3 {
      background: var(--beam-tone-3);
    }
    .tone-4 {
      background: var(--beam-tone-4);
    }
    .tone-5 {
      background: var(--beam-tone-5);
    }
    .tone-6 {
      background: var(--beam-tone-6);
    }
    .tone-7 {
      background: var(--beam-tone-7);
    }
  `;

  /** The name; the initials come from it. */
  @property({ type: String })
  name = '';

  /** What picks the colour. Falls back to the name when empty. */
  @property({ type: String })
  seed = '';

  /** `s` is the 20px breadcrumb tile, `l` the 32px card tile. */
  @property({ type: String, reflect: true })
  size: 's' | 'l' = 's';

  render() {
    const tone = monogramTone(this.seed || this.name);
    return html`<span class="tile tone-${tone}" part="tile" aria-hidden="true"
      >${monogramInitials(this.name)}</span
    >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'beam-monogram': BeamMonogram;
  }
}
