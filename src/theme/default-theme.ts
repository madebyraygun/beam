import { css } from 'lit';

/**
 * A plain theme that fills every token, so a page that loads it and nothing
 * else gets working components. Neutral greys, one blue accent, the system
 * font. An app replaces it with its own theme rather than editing it.
 *
 * Dark values sit under both dark selectors: the system preference when the
 * page has not opted out (`.light-mode`), and `.dark-mode` to force it.
 */
const light = css`
  color-scheme: light dark;

  --beam-color-bg: #f5f5f5;
  --beam-color-surface: #ffffff;
  --beam-color-surface-alt: #f0f0f0;
  --beam-color-panel: #fafafa;
  --beam-color-border: #d4d4d4;
  --beam-color-border-soft: #e5e5e5;
  --beam-color-text: #1f1f1f;
  --beam-color-muted: #5c5c5c;
  --beam-color-accent: #2563eb;
  --beam-color-on-accent: #ffffff;
  --beam-color-focus: #2563eb;
  --beam-color-success: #15803d;
  --beam-color-warning: #a16207;
  --beam-color-danger: #b91c1c;
  --beam-color-hover: #ebebeb;
  --beam-color-selected: #e6edfc;
  --beam-color-overlay: rgb(0 0 0 / 20%);
  --beam-color-inverse-bg: #262626;
  --beam-color-inverse-text: #f5f5f5;
  --beam-color-inverse-border: rgb(255 255 255 / 12%);
  --beam-color-inverse-hover: rgb(255 255 255 / 16%);
  --beam-color-field: #ffffff;
  --beam-color-ring: rgb(37 99 235 / 22%);
  --beam-color-danger-ring: rgb(185 28 28 / 18%);
  --beam-color-on-tone: #1f1f1f;
  --beam-tone-1: #d6e4f5;
  --beam-tone-2: #f5d6d6;
  --beam-tone-3: #d6f0dc;
  --beam-tone-4: #f5ebcc;
  --beam-tone-5: #e4d6f5;
  --beam-tone-6: #ccecef;
  --beam-tone-7: #e6e6e6;
  --beam-accent-image: linear-gradient(#2563eb, #2563eb);

  --beam-font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --beam-font-size-base: 14px;
  --beam-font-size-display: 24px;
  --beam-font-size-body: 14px;
  --beam-font-size-control: 13px;
  --beam-font-size-caption: 12px;
  --beam-font-size-label: 11px;
  --beam-font-weight-medium: 500;
  --beam-font-weight-semibold: 600;
  --beam-font-weight-bold: 700;
  --beam-line-height: 1.5;
  --beam-letter-spacing-tight: -0.01em;
  --beam-letter-spacing-label: 0.06em;

  --beam-space-s: 8px;
  --beam-space-m: 12px;
  --beam-space-l: 16px;

  --beam-control-height: 32px;
  --beam-control-height-s: 28px;
  --beam-control-height-touch: 44px;
  --beam-opacity-disabled: 0.4;

  --beam-radius-xs: 2px;
  --beam-radius-sm: 4px;
  --beam-radius-md: 6px;
  --beam-radius-lg: 8px;
  --beam-radius-xl: 10px;
  --beam-radius-pill: 999px;

  --beam-shadow-floating: 0 1px 3px rgb(0 0 0 / 8%);
  --beam-shadow-raised: 0 8px 24px rgb(0 0 0 / 16%);

  --beam-transition-fast: 120ms ease;
  --beam-transition-base: 200ms ease;
  --beam-transition-sidebar: 180ms ease;
  --beam-duration-fast: 120ms;

  --beam-sidebar-width: 224px;
  --beam-sidebar-collapsed-width: 56px;
  --beam-header-height: 48px;
  --beam-window-inset: 8px;
  --beam-icon-size: 20px;
`;

const dark = css`
  --beam-color-bg: #161616;
  --beam-color-surface: #222222;
  --beam-color-surface-alt: #262626;
  --beam-color-panel: #1d1d1d;
  --beam-color-border: #3a3a3a;
  --beam-color-border-soft: #2c2c2c;
  --beam-color-text: #ececec;
  --beam-color-muted: #a3a3a3;
  --beam-color-accent: #7aa7ff;
  --beam-color-on-accent: #161616;
  --beam-color-focus: #7aa7ff;
  --beam-color-success: #86efac;
  --beam-color-warning: #fcd34d;
  --beam-color-danger: #fca5a5;
  --beam-color-hover: #2a2a2a;
  --beam-color-selected: #1f2a40;
  --beam-color-overlay: rgb(0 0 0 / 50%);
  --beam-color-field: #1b1b1b;
  --beam-color-ring: rgb(122 167 255 / 25%);
  --beam-color-danger-ring: rgb(252 165 165 / 22%);
  --beam-accent-image: linear-gradient(#7aa7ff, #7aa7ff);
  --beam-shadow-floating: 0 4px 16px rgb(0 0 0 / 40%);
  --beam-shadow-raised: 0 12px 32px rgb(0 0 0 / 55%);
`;

export const defaultTheme = css`
  :root {
    ${light}
  }

  @media (prefers-color-scheme: dark) {
    :root:not(.light-mode) {
      ${dark}
    }
  }

  :root.light-mode {
    color-scheme: light;
  }

  :root.dark-mode {
    color-scheme: dark;
    ${dark}
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
      --beam-transition-fast: 0ms linear;
      --beam-transition-base: 0ms linear;
      --beam-transition-sidebar: 0ms linear;
      --beam-duration-fast: 0ms;
    }
  }
`;
