import { html } from 'lit';
import './beam-select.js';
import type { Preview } from '../../preview/types.js';

const priorities = html`<option value="blocking">Blocking</option><option value="high" selected>High</option><option value="low">Low</option>`;

const preview: Preview = {
  id: 'beam-select',
  title: 'Select',
  group: 'Controls',
  description:
    'The native select. Closed, styled as a field with a chevron. Where the engine has appearance: base-select the open list is the theme\'s, with a check on the chosen option and an option\'s dot; elsewhere the list is the system\'s.',
  layout: 'grid-wide',
  states: [
    { name: 'default', render: () => html`<beam-select label="Priority">${priorities}</beam-select>` },
    {
      name: 'with dots',
      render: () => html`<beam-select label="Status" value="todo">
        <option value="backlog" data-color="var(--beam-tone-5)">Backlog</option>
        <option value="todo" data-color="var(--beam-tone-1)">To do</option>
        <option value="doing" data-color="var(--beam-tone-3)">Doing</option>
        <option value="done" data-color="var(--beam-tone-4)">Done</option>
      </beam-select>`,
    },
    { name: 'placeholder', render: () => html`<beam-select label="Assignee" placeholder="Nobody"><option value="ana">Ana</option><option value="sam">Sam</option></beam-select>` },
    { name: 'disabled', render: () => html`<beam-select label="Priority" disabled>${priorities}</beam-select>` },
    {
      name: 'error',
      render: () => html`<beam-select label="Status" value="waiting" error="Not a status on this board."><option value="todo">To do</option><option value="done">Done</option></beam-select>`,
    },
  ],
};

export default preview;
