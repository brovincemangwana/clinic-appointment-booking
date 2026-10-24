import { el } from './ui.js';
import { formatDays } from './doctors.js';
import { formatDateShort } from './dates.js';
import { formatTime } from './slots.js';

export function renderProfile(container, doctor) {
  const avatar = el('div', 'avatar lg');
  const info = el('div');
  info.append(
    el('h1', '', doctor.name),
    el('p', 'muted', doctor.specialty),
    el(
      'p',
      'muted small',
      `${formatDays(doctor.workingDays)} · ${formatTime(doctor.startTime)} – ${formatTime(doctor.endTime)} · ${doctor.slotMinutes}-minute slots`
    )
  );
  container.replaceChildren(avatar, info);
}

export function renderDates(container, dates, selected, onSelect) {
  const buttons = dates.map((iso) => {
    const { weekday, day } = formatDateShort(iso);
    const button = el('button', `date-btn${iso === selected ? ' is-selected' : ''}`);
    button.type = 'button';
    button.dataset.date = iso;
    button.setAttribute('aria-pressed', String(iso === selected));
    button.append(el('small', '', weekday), el('b', '', String(day)));
    button.addEventListener('click', () => onSelect(iso));
    return button;
  });
  container.replaceChildren(...buttons);
}