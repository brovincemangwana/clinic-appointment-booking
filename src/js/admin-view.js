import { el } from './ui.js';
import { formatDateLong } from './dates.js';
import { formatTime } from './slots.js';
import { nextStatuses } from './appointments.js';
import { statusBadge } from './my-appointments-view.js';

const ACTION_LABELS = { Confirmed: 'Confirm', Completed: 'Complete', Cancelled: 'Cancel' };

export function renderStats(container, counts) {
  const items = [
    ['Total', counts.total],
    ['Booked', counts.Booked],
    ['Confirmed', counts.Confirmed],
    ['Completed', counts.Completed],
  ];
  container.replaceChildren(
    ...items.map(([label, value]) => {
      const card = el('div', 'card stat');
      card.append(el('span', 'muted small', label), el('b', '', String(value)));
      return card;
    })
  );
}

export function fillDoctorOptions(select, doctors) {
  doctors.forEach((doctor) => {
    const option = el('option', '', doctor.name);
    option.value = doctor.id;
    select.append(option);
  });
}

function actionCell(appointment, onStatus) {
  const cell = el('td');
  const options = nextStatuses(appointment.status);
  if (options.length === 0) {
    cell.append(el('span', 'muted', '—'));
    return cell;
  }
  const wrapper = el('div', 'row-actions');
  options.forEach((next) => {
    const button = el('button', `btn sm${next === 'Cancelled' ? ' danger' : ''}`, ACTION_LABELS[next]);
    button.type = 'button';
    button.addEventListener('click', () => {
      wrapper.querySelectorAll('button').forEach((b) => (b.disabled = true));
      onStatus(appointment, next);
    });
    wrapper.append(button);
  });
  cell.append(wrapper);
  return cell;
}

export function renderRows(tbody, appointments, doctors, onStatus) {
  if (appointments.length === 0) {
    const row = el('tr');
    const cell = el('td', 'empty', 'No appointments match these filters.');
    cell.colSpan = 7;
    row.append(cell);
    tbody.replaceChildren(row);
    return;
  }

  const byId = new Map(doctors.map((d) => [d.id, d]));
  const rows = appointments.map((appointment) => {
    const doctor = byId.get(appointment.doctorId);
    const row = el('tr');
    [
      `${formatDateLong(appointment.date)} · ${formatTime(appointment.time)}`,
      appointment.patientName,
      appointment.phone,
      doctor ? doctor.name : 'Unknown',
      appointment.reason,
    ].forEach((text) => row.append(el('td', '', text)));

    const statusCell = el('td');
    statusCell.append(statusBadge(appointment.status));
    row.append(statusCell, actionCell(appointment, onStatus));
    return row;
  });
  tbody.replaceChildren(...rows);
}