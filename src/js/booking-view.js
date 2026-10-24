import { el } from './ui.js';
import { formatDays } from './doctors.js';
import { formatDateShort, formatDateLong } from './dates.js';
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

export function renderSlots(container, slots, selected, onSelect) {
  if (slots.length === 0) {
    container.replaceChildren(el('p', 'muted', 'No slots available on this date.'));
    return;
  }
  const buttons = slots.map(({ time, booked }) => {
    const button = el('button', `slot-btn${time === selected ? ' is-selected' : ''}`, formatTime(time));
    button.type = 'button';
    button.disabled = booked;
    button.dataset.time = time;
    button.setAttribute('aria-pressed', String(time === selected));
    button.addEventListener('click', () => onSelect(time));
    return button;
  });
  container.replaceChildren(...buttons);
}

export function renderSummary(container, doctor, date, time) {
  if (!date || !time) {
    container.textContent = 'Select a date and time to continue.';
    return;
  }
  container.replaceChildren(
    el('small', '', 'Selected slot'),
    el('b', '', `${formatDateLong(date)} · ${formatTime(time)}`),
    el('div', '', doctor.name)
  );
}

const FIELDS = ['name', 'phone', 'reason'];

export function showFormErrors(form, errors) {
  FIELDS.forEach((field) => {
    const input = form.querySelector(`#${field}`);
    const message = form.querySelector(`#${field}-error`);
    const text = errors[field] || '';
    message.textContent = text;
    input.classList.toggle('invalid', Boolean(text));
    input.setAttribute('aria-invalid', String(Boolean(text)));
  });
  form.querySelector('#slot-error').textContent = errors.time || errors.date || '';
}