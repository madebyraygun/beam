import { html } from 'lit';
import './beam-nav-sidebar.js';
import { NAV_ITEMS, NAV_ITEMS_WITH_DISABLED } from './__mocks__/nav.js';
import type { NavItem } from './beam-nav-sidebar.js';
import type { Preview } from '../../preview/types.js';

/** The panel floats in a window-high column, so it gets one to float in. */
const frame = (items: NavItem[], active: string, collapsed = false) => html`
  <div style="display:flex;height:620px;background:var(--beam-color-bg);">
    <beam-nav-sidebar product-name="example" .items=${items} active=${active} ?collapsed=${collapsed}></beam-nav-sidebar>
  </div>
`;

const preview: Preview = {
  id: 'beam-nav-sidebar',
  title: 'Nav Sidebar',
  group: 'Layout',
  description:
    'The floating sidebar panel: hamburger and wordmark, grouped nav, the Inbox count and Settings pinned in the footer. Presentational — the app screen registry supplies the items and the active id.',
  layout: 'grid-wide',
  states: [
    { name: 'expanded', render: () => frame(NAV_ITEMS, 'dashboard') },
    { name: 'collapsed', render: () => frame(NAV_ITEMS, 'dashboard', true) },
    { name: 'active in a group', render: () => frame(NAV_ITEMS, 'orders') },
    { name: 'active in the footer', render: () => frame(NAV_ITEMS, 'settings') },
    {
      name: 'collapsed, active in a group',
      render: () => frame(NAV_ITEMS, 'orders', true),
    },
    {
      name: 'nothing waiting',
      render: () =>
        frame(
          NAV_ITEMS.map((item) => (item.id === 'inbox' ? { ...item, count: 0 } : item)),
          'inbox',
        ),
    },
    { name: 'with-disabled', render: () => frame(NAV_ITEMS_WITH_DISABLED, 'dashboard') },
    {
      name: 'no-icons',
      render: () =>
        frame(
          NAV_ITEMS.map((item) => ({ ...item, icon: undefined })),
          'dashboard',
        ),
    },
    {
      name: 'another name, with a mark',
      render: () => html`
        <div style="height:520px;width:232px;display:flex;">
          <beam-nav-sidebar
            product-name="tack"
            active="board"
            .items=${[
              { id: 'board', label: 'Board', icon: 'beam-icon-dashboard' },
              { id: 'list', label: 'List', icon: 'demo-icon-items' },
              { id: 'problems', label: 'Problems', icon: 'beam-icon-flag', count: 2, pinned: true },
            ]}
          >
            <span slot="mark" aria-hidden="true">▣</span>
          </beam-nav-sidebar>
        </div>
      `,
    },
    {
      name: 'no name',
      render: () => html`
        <div style="height:320px;width:232px;display:flex;">
          <beam-nav-sidebar active="dashboard" .items=${NAV_ITEMS.slice(0, 4)}></beam-nav-sidebar>
        </div>
      `,
    },
  ],
};

export default preview;
