import type { StatusSegment } from '../wc-status-line.js';

/** What a bookkeeping app says on its status line: the example the tests and previews use. */
export interface DemoStatus {
  path?: string;
  fullPath?: string;
  encrypted?: boolean;
  reviewCount?: number;
  version?: string;
  /** `store` omits the version. */
  distribution?: string;
  shortcut?: string;
  keyShortcuts?: string;
}

/** The folder, the lock, what waits in review, the palette hint and the version. */
export function demoSegments(status: DemoStatus = {}): StatusSegment[] {
  const { path = '', fullPath = '', encrypted = false, reviewCount, version = '', distribution = '' } = status;
  const segments: StatusSegment[] = [];
  if (path) {
    segments.push({ id: 'path', kind: 'text', label: path, title: fullPath || path });
  }
  segments.push({
    id: 'lock',
    kind: 'status',
    icon: encrypted ? 'wc-icon-lock' : 'wc-icon-lock-open',
    iconSize: 12,
    label: encrypted ? 'encrypted' : 'not encrypted',
    title: encrypted ? 'Encrypted' : 'Not encrypted',
  });
  if (reviewCount && reviewCount > 0) {
    segments.push({
      id: 'review',
      side: 'end',
      tone: 'flagged',
      icon: 'wc-icon-status-overdue',
      iconSize: 9,
      label: `${reviewCount} to review`,
      navigate: 'review',
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
