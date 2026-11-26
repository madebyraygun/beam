import type { NavItem } from '../beam-nav-sidebar.js';
import './icons.js';

/** A nav list shaped like the app's real one, for previews and tests. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'beam-icon-dashboard' },
  { id: 'items', label: 'Items', icon: 'demo-icon-items' },
  { id: 'inbox', label: 'Inbox', icon: 'demo-icon-inbox', count: 84 },
  { id: 'activity', label: 'Activity', icon: 'demo-icon-activity' },
  { id: 'uploads', label: 'Uploads', icon: 'demo-icon-uploads', group: 'Data' },
  { id: 'checks', label: 'Checks', icon: 'demo-icon-checks', group: 'Data' },
  { id: 'undo', label: 'Undo', icon: 'demo-icon-undo', group: 'Data' },
  { id: 'people', label: 'People', icon: 'demo-icon-people', group: 'Work' },
  { id: 'orders', label: 'Orders', icon: 'demo-icon-orders', group: 'Work' },
  { id: 'documents', label: 'Documents', icon: 'demo-icon-documents', group: 'Work' },
  { id: 'sources', label: 'Sources', icon: 'demo-icon-sources', group: 'Setup' },
  { id: 'labels', label: 'Labels', icon: 'demo-icon-labels', group: 'Setup' },
  { id: 'automations', label: 'Automations', icon: 'demo-icon-automations', group: 'Setup' },
  { id: 'settings', label: 'Settings', icon: 'demo-icon-settings', pinned: true },
];

export const NAV_ITEMS_WITH_DISABLED: NavItem[] = NAV_ITEMS.map((item) =>
  item.id === 'dashboard' ? item : { ...item, disabled: true },
);
