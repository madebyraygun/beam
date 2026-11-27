/**
 * Light and dark mode: three states as two classes on `<html>`.
 *
 * - no class     — follow the system: the theme's `color-scheme: light dark`
 * - `light-mode` — force light: `color-scheme: light`
 * - `dark-mode`  — force dark: `color-scheme: dark`
 *
 * `system` writes no class, so the page follows an OS change live with no
 * listener: the browser picks the side of every `light-dark()` colour itself.
 * A theme writes each colour once as `light-dark(light, dark)` (see
 * `src/theme/default-theme.ts`).
 *
 * `resolveMode` and `darkModeQuery` ask `(prefers-color-scheme: dark)`,
 * which is what `system` means.
 *
 * Where the choice is kept is the app's: every function that reads or writes it
 * takes the storage key, and the package has none of its own, so two apps on
 * one origin keep separate choices.
 */

export const COLOR_MODES = ['light', 'dark', 'system'] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

/** What `system` currently resolves to. Never stored, only displayed. */
export type ResolvedMode = 'light' | 'dark';

export const LIGHT_CLASS = 'light-mode';
export const DARK_CLASS = 'dark-mode';

const DARK_QUERY = '(prefers-color-scheme: dark)';

type ModeStorage = Pick<Storage, 'getItem' | 'setItem'>;
type ClassTarget = { classList: Pick<DOMTokenList, 'add' | 'remove'> };
type DarkQuery = Pick<MediaQueryList, 'matches'>;

function isColorMode(value: unknown): value is ColorMode {
  return COLOR_MODES.includes(value as ColorMode);
}

function defaultStorage(): ModeStorage | undefined {
  return typeof localStorage === 'undefined' ? undefined : localStorage;
}

function defaultRoot(): ClassTarget | undefined {
  return typeof document === 'undefined' ? undefined : document.documentElement;
}

/**
 * The stored preference under `storageKey`, or `system`.
 *
 * With storage disabled `localStorage` throws on access, and a colour
 * preference is no reason for a page to fail to load, so every access is
 * wrapped. A value it does not recognise reads as `system` and is left alone.
 */
export function readMode(
  storageKey: string,
  storage: ModeStorage | undefined = defaultStorage(),
): ColorMode {
  try {
    const stored = storage?.getItem(storageKey);
    return isColorMode(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** Keep the preference under `storageKey`. A refusal is silent: the mode still applies to this page. */
export function writeMode(
  storageKey: string,
  mode: ColorMode,
  storage: ModeStorage | undefined = defaultStorage(),
): void {
  try {
    storage?.setItem(storageKey, mode);
  } catch {
    // Storage disabled: the class still holds for this page.
  }
}

/** Put the mode on the root element, leaving its other classes alone. */
export function applyMode(mode: ColorMode, root: ClassTarget | undefined = defaultRoot()): void {
  if (!root) return;
  if (mode === 'light') {
    root.classList.remove(DARK_CLASS);
    root.classList.add(LIGHT_CLASS);
  } else if (mode === 'dark') {
    root.classList.remove(LIGHT_CLASS);
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(LIGHT_CLASS, DARK_CLASS);
  }
}

function defaultQuery(): DarkQuery | undefined {
  return typeof matchMedia === 'undefined' ? undefined : matchMedia(DARK_QUERY);
}

/** What the user is looking at. Without `matchMedia`, `system` resolves to light. */
export function resolveMode(
  mode: ColorMode,
  query: DarkQuery | undefined = defaultQuery(),
): ResolvedMode {
  if (mode !== 'system') return mode;
  return query?.matches ? 'dark' : 'light';
}

/** The `matchMedia` handle to watch for an OS change. */
export function darkModeQuery(): MediaQueryList | undefined {
  return typeof matchMedia === 'undefined' ? undefined : matchMedia(DARK_QUERY);
}

/**
 * Read the preference under `storageKey` and apply it. Call once at start-up;
 * calling it again is harmless.
 */
export function initColorMode(options: {
  storageKey: string;
  storage?: ModeStorage;
  root?: ClassTarget;
}): ColorMode {
  const mode = readMode(options.storageKey, options.storage ?? defaultStorage());
  applyMode(mode, options.root ?? defaultRoot());
  return mode;
}

/**
 * The script for `<head>` that applies the stored mode before first paint, so
 * a dark page does not flash light while the bundle loads. Put the returned
 * text in an inline `<script>`; it does what `initColorMode` does.
 */
export function colorModeBootScript(storageKey: string): string {
  const key = JSON.stringify(storageKey);
  return (
    `try{var m=localStorage.getItem(${key});` +
    `if(m==='light'||m==='dark')document.documentElement.classList.add(m+'-mode')}catch(e){}`
  );
}
