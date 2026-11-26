import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import type { Preview, PreviewBackground } from '../types.js';
import { parseRoute, routeToUrl, type Route } from '../router.js';
import { runA11y, type A11yResult } from '../a11y.js';
import {
  COLOR_MODES,
  applyMode,
  readMode,
  writeMode,
  type ColorMode,
} from '../../src/theme/index.js';

/** The demo page keeps its own choice, apart from any app on the same origin. */
export const DEMO_STORAGE_KEY = 'beam-demo.color-mode';

const BG_MAP: Record<PreviewBackground, string> = {
  default: 'var(--beam-color-bg)',
  surface: 'var(--beam-color-surface)',
  inverse: 'var(--beam-color-inverse-bg)',
  transparent: 'transparent',
};

@customElement('preview-app')
export class PreviewApp extends LitElement {
  @property({ attribute: false }) previews: Preview[] = [];
  @state() private route: Route = parseRoute(window.location.href);
  @state() private a11y: A11yResult | null = null;
  @state() private inspectorOpen = false;
  @state() private colorMode: ColorMode = readMode(DEMO_STORAGE_KEY);

  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 240px 1fr auto;
      height: 100vh;
      font-family: var(--beam-font-family);
      color: var(--beam-color-text);
      background: var(--beam-color-bg);
    }
    nav {
      border-right: 1px solid var(--beam-color-border);
      overflow-y: auto;
      padding: var(--beam-space-l);
    }
    nav h3 {
      font-family: var(--beam-font-family);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--beam-color-muted);
      margin: var(--beam-space-l) 0 var(--beam-space-xs);
    }
    nav a {
      display: block;
      padding: 6px 8px;
      border-radius: var(--beam-radius-sm);
      color: var(--beam-color-text);
      text-decoration: none;
      font-size: 13px;
    }
    nav a.active {
      background: var(--beam-color-selected);
      font-weight: var(--beam-font-weight-medium);
    }
    .modes {
      display: flex;
      gap: 4px;
      margin-bottom: var(--beam-space-m);
    }
    .modes button {
      flex: 1;
      padding: 4px 6px;
      font: inherit;
      font-size: 11px;
      text-transform: capitalize;
      color: var(--beam-color-text);
      background: var(--beam-color-surface);
      border: 1px solid var(--beam-color-border);
      border-radius: var(--beam-radius-sm);
      cursor: pointer;
    }
    .modes button[aria-pressed='true'] {
      background: var(--beam-color-selected);
      font-weight: var(--beam-font-weight-medium);
    }
    main {
      padding: var(--beam-space-xl);
      overflow-y: auto;
    }
    h1 {
      font-size: var(--beam-font-size-display);
      margin: 0 0 var(--beam-space-s);
    }
    .state-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--beam-space-l);
    }
    .state-grid[data-layout='grid-wide'] {
      grid-template-columns: repeat(auto-fit, minmax(540px, 1fr));
    }
    .state-grid[data-layout='stack'] {
      grid-template-columns: 1fr;
    }
    .state-card {
      border: 1px solid var(--beam-color-border);
      border-radius: var(--beam-radius-md);
      padding: var(--beam-space-l);
    }
    .state-card[data-bg='inverse'] {
      color: var(--beam-color-inverse-text);
    }
    .state-name {
      font-family: var(--beam-font-family);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--beam-color-muted);
      margin-bottom: var(--beam-space-s);
    }
    aside {
      width: 320px;
      border-left: 1px solid var(--beam-color-border);
      padding: var(--beam-space-l);
      overflow-y: auto;
      background: var(--beam-color-surface);
    }
    aside[hidden] {
      display: none;
    }
    .violation {
      padding: var(--beam-space-s);
      border-left: 3px solid var(--beam-color-danger);
      margin-bottom: var(--beam-space-s);
    }
    button.inspector-toggle {
      position: fixed;
      top: 12px;
      right: 12px;
      background: var(--beam-color-surface);
      color: var(--beam-color-text);
      border: 1px solid var(--beam-color-border);
      padding: 6px 10px;
      border-radius: var(--beam-radius-sm);
      cursor: pointer;
      font-family: var(--beam-font-family);
      font-size: 12px;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this.onPopState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.onPopState);
  }

  private onPopState = () => {
    this.route = parseRoute(window.location.href);
  };

  private navigate(route: Route) {
    history.pushState({}, '', routeToUrl(route));
    this.route = route;
    this.a11y = null;
  }

  private get activePreview(): Preview | undefined {
    return this.previews.find((p) => p.id === this.route.previewId);
  }

  private runInspector = async () => {
    const container = this.renderRoot.querySelector('.state-grid');
    if (!container) return;
    this.a11y = await runA11y(container as HTMLElement);
  };

  render() {
    if (this.route.mode === 'preview') return this.renderEmbedded();
    return html`
      ${this.renderSidebar()} ${this.renderMain()} ${this.renderInspector()}
      <button
        class="inspector-toggle"
        @click=${() => (this.inspectorOpen = !this.inspectorOpen)}
      >
        ${this.inspectorOpen ? 'Hide' : 'a11y'}
      </button>
    `;
  }

  /**
   * The harness's own control, deliberately plain buttons rather than
   * a mode switcher component. The harness is chrome around the components, and
   * reviewing a component while an instance of it drives the page it is
   * rendered on is a confusing way to look at anything.
   */
  private setColorMode(mode: ColorMode): void {
    this.colorMode = mode;
    writeMode(DEMO_STORAGE_KEY, mode);
    applyMode(mode);
  }

  private renderSidebar(): TemplateResult {
    const groups = new Map<string, Preview[]>();
    for (const p of this.previews) {
      const list = groups.get(p.group) ?? [];
      list.push(p);
      groups.set(p.group, list);
    }
    return html`
      <nav>
        <h3>Appearance</h3>
        <div class="modes" role="group" aria-label="Preview colour mode">
          ${COLOR_MODES.map(
            (mode) => html`
              <button
                type="button"
                aria-pressed=${this.colorMode === mode}
                @click=${() => this.setColorMode(mode)}
              >
                ${mode}
              </button>
            `,
          )}
        </div>
        ${Array.from(
          groups,
          ([group, items]) => html`
            <h3>${group}</h3>
            ${items.map(
              (p) => html`
                <a
                  href=${routeToUrl({ previewId: p.id })}
                  class=${this.route.previewId === p.id ? 'active' : ''}
                  @click=${(e: Event) => {
                    e.preventDefault();
                    this.navigate({ previewId: p.id });
                  }}
                  >${p.title}</a
                >
              `,
            )}
          `,
        )}
      </nav>
    `;
  }

  private renderMain(): TemplateResult {
    const preview = this.activePreview;
    if (!preview) {
      return html`<main><p>Select a preview from the sidebar.</p></main>`;
    }
    const states = this.route.stateName
      ? preview.states.filter((s) => s.name === this.route.stateName)
      : preview.states;
    return html`
      <main>
        <h1>${preview.title}</h1>
        ${preview.description ? html`<p>${preview.description}</p>` : ''}
        <div
          class="state-grid"
          data-storyloaded
          data-layout=${preview.layout ?? 'grid'}
        >
          ${states.map(
            (s) => html`
              <div
                class="state-card"
                data-bg=${s.background ?? 'default'}
                style="background:${BG_MAP[s.background ?? 'default']}"
              >
                <div class="state-name">${s.name}</div>
                ${s.render()}
              </div>
            `,
          )}
        </div>
      </main>
    `;
  }

  private renderEmbedded(): TemplateResult {
    const preview = this.activePreview;
    if (!preview) return html`<div></div>`;
    const state =
      preview.states.find((s) => s.name === this.route.stateName) ??
      preview.states[0];
    return html`
      <div
        data-storyloaded
        style="display:grid;place-items:center;min-height:100vh;background:${BG_MAP[
          state.background ?? 'default'
        ]};"
      >
        ${state.render()}
      </div>
    `;
  }

  private renderInspector(): TemplateResult {
    return html`
      <aside ?hidden=${!this.inspectorOpen}>
        <h3>Accessibility</h3>
        <button @click=${this.runInspector}>Run axe</button>
        ${this.a11y === null
          ? html`<p>Run axe to check the active preview.</p>`
          : this.a11y.violations.length === 0
            ? html`<p>✓ Zero violations.</p>`
            : this.a11y.violations.map(
                (v) => html`
                  <div class="violation">
                    <strong>${v.id}</strong> (${v.impact})
                    <div>${v.description}</div>
                    <a href=${v.helpUrl} target="_blank" rel="noreferrer">More</a>
                  </div>
                `,
              )}
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'preview-app': PreviewApp;
  }
}
