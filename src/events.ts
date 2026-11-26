/**
 * Every event a component sends is named `<prefix>-<what>`. The prefix is set
 * here and nowhere else; the custom property prefix (`--beam-`) is the same
 * word, written out in each stylesheet because CSS has no way to import it.
 */
export const EVENT_PREFIX = 'beam';

/** A nav item, a breadcrumb level or a status segment asks to show a screen. Detail `{ id }`. */
export const NAVIGATE_EVENT = `${EVENT_PREFIX}-navigate` as const;

/** The breadcrumb's first level, the search box or a status segment asks for the palette. Detail `{ scope }`. */
export const PALETTE_OPEN_EVENT = `${EVENT_PREFIX}-palette-open` as const;

/** A status segment with `action` was pressed. Detail `{ id }`. */
export const STATUS_ACTION_EVENT = `${EVENT_PREFIX}-status-action` as const;

/** The sidebar or the shell's drawer toggle asks to fold or unfold the sidebar. Detail `{ collapsed }`. */
export const SIDEBAR_TOGGLE_EVENT = `${EVENT_PREFIX}-sidebar-toggle` as const;

/** The shell's refresh button was pressed. No detail. */
export const REFRESH_EVENT = `${EVENT_PREFIX}-refresh` as const;

/** Show a toast. Detail `ToastDetail`. Listened for on `window`. */
export const TOAST_EVENT = `${EVENT_PREFIX}-toast` as const;

/** Send one of the events above from `from`: bubbling and composed, so it leaves every shadow root. */
export function emit<T>(from: EventTarget, type: string, detail?: T): void {
  from.dispatchEvent(new CustomEvent<T>(type, { detail, bubbles: true, composed: true }));
}
