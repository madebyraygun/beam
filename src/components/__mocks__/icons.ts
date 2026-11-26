import { customElement } from 'lit/decorators.js';
import { BeamIconBase, svg } from '../../icons/icon-base.js';

/**
 * Icons for the example app the previews and tests describe. An app draws its
 * own icons this way: a subclass of BeamIconBase under its own tag name.
 */

@customElement('demo-icon-items')
export class DemoIconItems extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M3 5h18v14H3zM3 10h18M9 10v9"/>`;
  }
}

@customElement('demo-icon-inbox')
export class DemoIconInbox extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/><path d="M8 12l2.5 2.5L16 9"/>`;
  }
}

@customElement('demo-icon-activity')
export class DemoIconActivity extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M3 20h18M6 20V11M12 20V4M18 20v-6"/>`;
  }
}

@customElement('demo-icon-uploads')
export class DemoIconUploads extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M12 3v12M8 11l4 4 4-4M4 19h16"/>`;
  }
}

@customElement('demo-icon-checks')
export class DemoIconChecks extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M4 8h13l-3-3M20 16H7l3 3"/>`;
  }
}

@customElement('demo-icon-undo')
export class DemoIconUndo extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M4 10h10a5 5 0 0 1 0 10H8M4 10l4-4M4 10l4 4"/>`;
  }
}

@customElement('demo-icon-people')
export class DemoIconPeople extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.5a3 3 0 0 1 0 6"/><path d="M17.5 14.2a5.5 5.5 0 0 1 4 5.3"/>`;
  }
}

@customElement('demo-icon-orders')
export class DemoIconOrders extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>`;
  }
}

@customElement('demo-icon-documents')
export class DemoIconDocuments extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/>`;
  }
}

@customElement('demo-icon-sources')
export class DemoIconSources extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M3 7h18v12H3zM3 7l3-3h12l3 3M16 13h2"/>`;
  }
}

@customElement('demo-icon-labels')
export class DemoIconLabels extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M3 12l9-9h8v8l-9 9z"/><path d="M16.5 7.5h.01"/>`;
  }
}

@customElement('demo-icon-automations')
export class DemoIconAutomations extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M3 4h18l-7 8v7l-4 2v-9z"/>`;
  }
}

@customElement('demo-icon-settings')
export class DemoIconSettings extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>`;
  }
}

@customElement('demo-icon-lock')
export class DemoIconLock extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M6 11h12v9H6zM9 11V7a3 3 0 0 1 6 0v4"/>`;
  }
}

@customElement('demo-icon-lock-open')
export class DemoIconLockOpen extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M6 11h12v9H6zM9 11V7a3 3 0 0 1 5.8-1.1"/>`;
  }
}

@customElement('demo-icon-warning')
export class DemoIconWarning extends BeamIconBase {
  protected renderIcon() {
    return svg`<path d="M12 5l8 14H4z" fill="currentColor"/>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'demo-icon-items': DemoIconItems;
    'demo-icon-inbox': DemoIconInbox;
    'demo-icon-activity': DemoIconActivity;
    'demo-icon-uploads': DemoIconUploads;
    'demo-icon-checks': DemoIconChecks;
    'demo-icon-undo': DemoIconUndo;
    'demo-icon-people': DemoIconPeople;
    'demo-icon-orders': DemoIconOrders;
    'demo-icon-documents': DemoIconDocuments;
    'demo-icon-sources': DemoIconSources;
    'demo-icon-labels': DemoIconLabels;
    'demo-icon-automations': DemoIconAutomations;
    'demo-icon-settings': DemoIconSettings;
    'demo-icon-lock': DemoIconLock;
    'demo-icon-lock-open': DemoIconLockOpen;
    'demo-icon-warning': DemoIconWarning;
  }
}
