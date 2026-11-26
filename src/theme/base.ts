import { css } from 'lit';

/**
 * What every component adopts before its own rules: the keyboard focus
 * outline. Adopted per component because a rule in the document cannot reach
 * into a shadow root; the colour still comes from the theme.
 */
export const baseCss = css`
  :focus-visible {
    outline: 2px solid var(--beam-color-focus);
    outline-offset: 2px;
  }

  @media (forced-colors: active) {
    :focus-visible {
      outline-color: Highlight;
    }
  }
`;
