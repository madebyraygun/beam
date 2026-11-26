import { html } from 'lit';
import './beam-toast.js';
import type { Preview } from '../../preview/types.js';
import type { ToastDetail } from './beam-toast.js';

/**
 * Long enough to hold still while a state is being looked at, and short of
 * `duration: 0`, which is the never-expires case that earns a close button.
 */
const PREVIEW_DURATION_MS = 10 * 60 * 1000;

const seeded = (initial: ToastDetail | ToastDetail[]) => {
  const held = (Array.isArray(initial) ? initial : [initial]).map((detail) => ({
    duration: PREVIEW_DURATION_MS,
    ...detail,
  }));
  return html`<beam-toast .initial=${held}></beam-toast>`;
};

const preview: Preview = {
  id: 'beam-toast',
  title: 'Toast',
  group: 'Feedback',
  description:
    'The polite live region terminating the beam-toast bus. It pins to the bottom-right corner of the viewport, clear of the sidebar and header, and stacks up to three toasts; a danger toast is its own alert. States seed toasts via .initial with a long duration so they stay visible — except never-expires, which is the duration-zero case and carries a close button.',
  layout: 'stack',
  states: [
    {
      name: 'info',
      render: () => seeded({ message: 'Changes re-applied.' } satisfies ToastDetail),
    },
    {
      name: 'success',
      render: () =>
        seeded({
          message: '42 transactions imported.',
          variant: 'success',
        } satisfies ToastDetail),
    },
    {
      name: 'danger',
      render: () =>
        seeded({
          message: 'Could not reach the server.',
          variant: 'danger',
        } satisfies ToastDetail),
    },
    {
      name: 'with-action',
      render: () =>
        seeded({
          message: 'Upload undone.',
          action: { label: 'Redo', onClick: () => {} },
        } satisfies ToastDetail),
    },
    {
      name: 'long-message',
      render: () =>
        seeded({
          message:
            'The label "Office Supplies" could not be deleted because 37 items still use it, and every one of them would be left without a label.',
          variant: 'danger',
        } satisfies ToastDetail),
    },
    {
      name: 'never-expires',
      render: () =>
        seeded({
          message: 'Could not reach the server.',
          variant: 'danger',
          duration: 0,
        } satisfies ToastDetail),
    },
    {
      name: 'stacked',
      render: () =>
        seeded([
          { message: 'Changes re-applied.' },
          { message: '42 transactions imported.', variant: 'success' },
          {
            message: 'Upload undone.',
            action: { label: 'Redo', onClick: () => {} },
          },
        ] satisfies ToastDetail[]),
    },
  ],
};

export default preview;
