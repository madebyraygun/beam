import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { TOAST_EVENT } from '../events.js';

export type ToastVariant = 'info' | 'success' | 'danger';

/** Optional action button on a toast (e.g. "Undo" after a destructive edit). */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastDetail {
  message: string;
  variant?: ToastVariant;
  /**
   * Auto-dismiss after N ms. Defaults to 4000, or 8000 with an action so there
   * is time to read and click. Zero or negative disables auto-dismiss.
   */
  duration?: number;
  action?: ToastAction;
}


const DEFAULT_DURATION_MS = 4000;
const DEFAULT_ACTION_DURATION_MS = 8000;

/**
 * How many toasts share the corner. Past this the oldest goes, so a burst of
 * events cannot grow the column until it runs out of viewport.
 */
export const MAX_VISIBLE_TOASTS = 3;

interface QueuedToast {
  id: number;
  detail: ToastDetail;
}

/** Milliseconds until a toast withdraws itself; zero or less means never. */
function autoDismissMs(detail: ToastDetail): number {
  const fallback = detail.action ? DEFAULT_ACTION_DURATION_MS : DEFAULT_DURATION_MS;
  return detail.duration ?? fallback;
}

/**
 * A toast that neither expires nor carries an action has no way out on its
 * own, so it is given a close button.
 */
function needsCloseButton(detail: ToastDetail): boolean {
  return autoDismissMs(detail) <= 0 && !detail.action;
}

/**
 * Typed dispatcher for the toast bus. Use this instead of constructing a raw
 * CustomEvent — a raw event would accept any detail shape, this enforces it at
 * the call site.
 */
export function dispatchToast(target: EventTarget, detail: ToastDetail): void {
  target.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

declare global {
  interface HTMLElementEventMap {
    [TOAST_EVENT]: CustomEvent<ToastDetail>;
  }
}

/**
 * The single aria-live region that terminates the toast bus.
 *
 * Listens on `window` rather than on a parent element: toast events are
 * composed and bubbling, so a window listener also catches toasts dispatched
 * from inside a modal dialog's top layer or from any component that is not nested
 * under the app shell. Anchoring the listener to a host element loses those.
 */
@customElement('wc-toast')
export class WcToast extends LitElement {
  static styles = css`
    :host {
      /* The region is fixed-position; the host itself takes no space. */
      display: contents;
      --beam-toast-gutter: var(--beam-space-l);
      --beam-toast-max-width: 360px;
    }

    /*
     * Pinned to the bottom-right corner of the viewport.
     *
     * Both inline insets are set rather than one inset plus a translate: the
     * region spans the viewport minus its gutters, so a percentage width
     * inside it is viewport-relative and no offset can carry a toast past an
     * edge. The corner also keeps clear of the app chrome that owns the
     * others — the sidebar on the left, the header on the top.
     */
    .region {
      position: fixed;
      inset-block: auto var(--beam-toast-gutter);
      inset-inline: var(--beam-toast-gutter);
      z-index: 11000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--beam-space-s);
      pointer-events: none;
      /* Reset the UA popover styles so the region flows the same way whether
       * or not it is currently in the top layer. */
      border: 0;
      padding: 0;
      margin: 0;
      background: transparent;
      color: inherit;
      overflow: visible;
      inline-size: auto;
      block-size: auto;
    }

    .region:not(:popover-open) {
      /* The region must stay rendered for the aria-live subscription to hold,
       * but a UA hides closed popovers by default. */
      display: flex;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: var(--beam-space-l);
      padding: 10px 16px;
      border-radius: var(--beam-radius-md);
      font-family: var(--beam-font-family);
      font-size: var(--beam-font-size-base);
      font-weight: var(--beam-font-weight-medium);
      box-shadow: var(--beam-shadow-raised);
      animation: toast-in var(--beam-duration-fast) ease;
      /* A consistently dark chip in both themes; see --beam-color-inverse-bg. */
      background: var(--beam-color-inverse-bg);
      color: var(--beam-color-inverse-text);
      border: 1px solid var(--beam-color-inverse-border);
      /* 100% is the region, which is the viewport minus its gutters, so a long
       * message wraps inside the chip instead of widening it off-screen. */
      max-width: min(var(--beam-toast-max-width), 100%);
      box-sizing: border-box;
    }

    .message {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .toast[data-variant='success'] {
      background: var(--beam-color-success);
      border-color: var(--beam-color-success);
      color: var(--beam-color-on-accent);
    }

    .toast[data-variant='danger'] {
      background: var(--beam-color-danger);
      border-color: var(--beam-color-danger);
      color: var(--beam-color-on-accent);
    }

    .action {
      background: transparent;
      border: 0;
      color: inherit;
      font: inherit;
      font-weight: var(--beam-font-weight-bold);
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: default;
      padding: 4px 8px;
      border-radius: var(--beam-radius-sm);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .action:hover,
    .action:focus-visible {
      background: var(--beam-color-inverse-hover);
    }

    .close {
      background: transparent;
      border: 0;
      color: inherit;
      font: inherit;
      line-height: 1;
      cursor: default;
      padding: 2px 4px;
      margin-inline-start: calc(-1 * var(--beam-space-s));
      border-radius: var(--beam-radius-sm);
      flex-shrink: 0;
    }

    .close:hover,
    .close:focus-visible {
      background: var(--beam-color-inverse-hover);
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .toast {
        animation: none;
      }
    }

    /* Screen chrome, not part of the report. This lives here rather than in
       the theme's print sheet because a rule that hides an element has to
       be in the tree that element is in, and every wc-* here sits inside
       the app's shadow root where a document rule cannot reach it. */
    @media print {
      :host {
        display: none;
      }
    }
  `;

  /**
   * Seeds toasts on first render, one or several. Previews and tests use this;
   * the app does not.
   */
  @property({ attribute: false })
  initial: ToastDetail | ToastDetail[] | null = null;

  @state()
  private toasts: QueuedToast[] = [];

  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  private nextId = 0;

  /** The most recent arrival, and the arrival the region was last promoted for. */
  private arrivedId: number | null = null;

  private promotedId: number | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(TOAST_EVENT, this.handleToast as EventListener);
    if (this.initial) {
      for (const detail of Array.isArray(this.initial) ? this.initial : [this.initial]) {
        this.show(detail);
      }
    }
  }

  disconnectedCallback(): void {
    window.removeEventListener(TOAST_EVENT, this.handleToast as EventListener);
    this.clearTimers();
    this.toasts = [];
    this.arrivedId = null;
    this.promotedId = null;
    super.disconnectedCallback();
  }

  /**
   * Show a toast directly, bypassing the event bus. Answers the id to pass to
   * `dismiss`, or null when the detail carried no message.
   */
  show(detail: ToastDetail): number | null {
    if (typeof detail?.message !== 'string' || detail.message.length === 0) {
      console.error('[wc-toast] ignored a toast with no message:', detail);
      return null;
    }
    const id = this.nextId++;
    const next = [...this.toasts, { id, detail }];
    for (const dropped of next.splice(0, next.length - MAX_VISIBLE_TOASTS)) {
      this.clearTimer(dropped.id);
    }
    this.toasts = next;
    this.arrivedId = id;

    const duration = autoDismissMs(detail);
    if (duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.drop(id), duration),
      );
    }
    return id;
  }

  /** Dismiss one toast by id, or every visible toast when called bare. */
  dismiss(id?: number): void {
    if (id === undefined) {
      this.clearTimers();
      this.toasts = [];
      return;
    }
    this.drop(id);
  }

  /** Named for what it takes off the stack — `remove` is HTMLElement's. */
  private drop(id: number): void {
    this.clearTimer(id);
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private clearTimers(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  private handleToast = (event: Event): void => {
    const detail = (event as CustomEvent<Partial<ToastDetail>>).detail;
    if (!detail || typeof detail.message !== 'string' || detail.message.length === 0) {
      console.error('[wc-toast] ignored an event with an invalid detail:', detail);
      return;
    }
    this.show(detail as ToastDetail);
  };

  /**
   * Promote the region into the browser's top layer so it paints above
   * a dialog opened with showModal(). The top layer is ordered by open
   * time, so getting back above a dialog opened since means hiding and
   * re-showing the popover.
   *
   * That happens on **arrival** and nowhere else. An expiry leaves the region
   * where it is, which is a trade: toasts that were already on screen when a
   * modal opened stay behind it until the next one arrives. Re-showing on
   * expiry would fix that by putting survivors — toasts the user has already
   * had time to read — above a modal they never covered, and would restart the
   * entry animation of every toast still in the column.
   */
  protected updated(): void {
    const region = this.shadowRoot?.querySelector<HTMLElement>('[data-toast-region]');
    if (!region || typeof region.showPopover !== 'function') return;
    try {
      if (this.toasts.length === 0) {
        if (region.matches(':popover-open')) region.hidePopover();
        this.promotedId = null;
        return;
      }
      if (this.arrivedId === this.promotedId) return;
      if (region.matches(':popover-open')) region.hidePopover();
      region.showPopover();
      this.promotedId = this.arrivedId;
    } catch (error) {
      console.warn('[wc-toast] could not sync the popover state:', error);
    }
  }

  private runAction(toast: QueuedToast): void {
    const action = toast.detail.action;
    if (!action) return;
    try {
      action.onClick();
    } catch (error) {
      console.error('[wc-toast] the toast action threw:', error);
    }
    this.drop(toast.id);
  }

  /**
   * The region is the polite live region and stays polite whatever is in it. A
   * danger toast is its own alert instead, so it announces assertively without
   * escalating the info toasts beside it — and without `aria-atomic`, so an
   * arrival re-reads itself rather than the whole column.
   */
  render() {
    return html`
      <div class="region" data-toast-region popover="manual" role="status" aria-live="polite">
        ${repeat(
          this.toasts,
          (toast) => toast.id,
          (toast) => {
            const danger = toast.detail.variant === 'danger';
            return html`
              <div
                class="toast"
                part="toast"
                data-variant=${toast.detail.variant ?? 'info'}
                role=${danger ? 'alert' : nothing}
                aria-live=${danger ? 'assertive' : nothing}
              >
                <span class="message">${toast.detail.message}</span>
                ${toast.detail.action
                  ? html`<button
                      type="button"
                      class="action"
                      part="action"
                      data-toast-action
                      @click=${() => this.runAction(toast)}
                    >
                      ${toast.detail.action.label}
                    </button>`
                  : nothing}
                ${needsCloseButton(toast.detail)
                  ? html`<button
                      type="button"
                      class="close"
                      part="close"
                      data-toast-close
                      aria-label="Dismiss"
                      @click=${() => this.drop(toast.id)}
                    >
                      &times;
                    </button>`
                  : nothing}
              </div>
            `;
          },
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-toast': WcToast;
  }
}
