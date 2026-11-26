import type { StatusSegment } from '../beam-status-line.js';
import './icons.js';

/** What an example app says on its status line: the example the tests and previews use. */
export interface DemoStatus {
  path?: string;
  fullPath?: string;
  encrypted?: boolean;
  waitingCount?: number;
  version?: string;
  /** `store` omits the version. */
  distribution?: string;
  shortcut?: string;
  keyShortcuts?: string;
}

/** The folder, the lock, what is waiting, the palette hint and the version. */
export function demoSegments(status: DemoStatus = {}): StatusSegment[] {
  const { path = '', fullPath = '', encrypted = false, waitingCount, version = '', distribution = '' } = status;
  const segments: StatusSegment[] = [];
  if (path) {
    segments.push({ id: 'path', kind: 'text', label: path, title: fullPath || path });
  }
  segments.push({
    id: 'lock',
    kind: 'status',
    icon: encrypted ? 'demo-icon-lock' : 'demo-icon-lock-open',
    iconSize: 12,
    label: encrypted ? 'encrypted' : 'not encrypted',
    title: encrypted ? 'Encrypted' : 'Not encrypted',
  });
  if (waitingCount && waitingCount > 0) {
    segments.push({
      id: 'inbox',
      side: 'end',
      tone: 'warning',
      icon: 'demo-icon-warning',
      iconSize: 9,
      label: `${waitingCount} waiting`,
      navigate: 'inbox',
    });
  }
  segments.push({
    id: 'hint',
    side: 'end',
    drops: 'second',
    kbd: status.shortcut ?? '⌘K',
    keyShortcuts: status.keyShortcuts ?? 'Meta+K',
    label: 'palette',
    palette: 'all',
  });
  if (version !== '' && distribution !== 'store') {
    segments.push({ id: 'version', side: 'end', drops: 'first', label: `v${version.replace(/^v/, '')}` });
  }
  return segments;
}
