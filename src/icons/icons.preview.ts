import { html } from 'lit';
import './icons.js';
import { ICON_TAGS } from './icons.js';
import type { Preview } from '../../preview/types.js';

const grid = (style = '') => html`
  <div
    style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:12px;${style}"
  >
    ${ICON_TAGS.map(
      (tag) => html`
        <div style="display:grid;justify-items:center;gap:6px;text-align:center;">
          ${document.createElement(tag)}
          <span style="font-size:10px;color:var(--beam-color-muted);"
            >${tag.replace('beam-icon-', '')}</span
          >
        </div>
      `,
    )}
  </div>
`;

/** Marks drawn in a run of text, sized by it with `inline`. */
const INLINE_TAGS = ['beam-icon-flag', 'beam-icon-chevron-down'] as const;

/** One icon sized to the text around it rather than to the token. */
function inlineIcon(tag: string) {
  const el = document.createElement(tag);
  el.setAttribute('inline', '');
  return el;
}

const preview: Preview = {
  id: 'icons',
  title: 'Icons',
  group: 'Foundations',
  description:
    'BeamIconBase subclasses. Sized by --beam-icon-size, or by the surrounding type with the inline attribute; colored by currentColor. Decorative unless given a label.',
  layout: 'stack',
  states: [
    { name: 'default', render: () => grid() },
    { name: 'large', render: () => grid('--beam-icon-size:28px;') },
    { name: 'small', render: () => grid('--beam-icon-size:14px;') },
    {
      name: 'colored',
      render: () => grid('color:var(--beam-color-accent);'),
    },
    {
      name: 'labelled',
      render: () =>
        html`<beam-icon-flag label="Flagged transaction"></beam-icon-flag>`,
    },
    {
      // An icon set in a run of text tracks the text with `inline`.
      name: 'inline-with-text',
      render: () => html`
        <p style="max-width:60ch;">
          ${INLINE_TAGS.map(
            (tag) => html`
              <span style="display:inline-flex;align-items:center;gap:4px;margin-inline-end:12px;">
                ${inlineIcon(tag)}${tag.replace('beam-icon-', '')}
              </span>
            `,
          )}
        </p>
      `,
    },
    {
      // The same marks at two text sizes, which is the claim `inline` makes:
      // the mark tracks the type, and `--beam-icon-size` does not enter into it.
      name: 'inline-follows-the-type-size',
      render: () => html`
        <p style="font-size:11px;">${INLINE_TAGS.map((tag) => inlineIcon(tag))} small</p>
        <p style="font-size:22px;">${INLINE_TAGS.map((tag) => inlineIcon(tag))} large</p>
      `,
    },
  ],
};

export default preview;
