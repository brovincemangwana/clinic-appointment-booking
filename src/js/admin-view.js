import { el } from './ui.js';
import { formatDateLong } from './dates.js';
import { formatTime } from './slots.js';
import { statusBadge } from './my-appointments-view.js';

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

export function renderRows(tbody, appointments, doctors) {
  if (appointments.length === 0) {
    const row = el('tr');
    const cell = el('td', 'empty', 'No appointments match these filters.');
    cell.colSpan = 6;
    row.append(cell);
    tbody.replaceChildren(row);
    return;
  }

  const byId = new Map(doctors.map((d) => [d.id, d]));
  const rows = appointments.map((appointment) => {
    const doctor = byId.get(appointment.doctorId);
    const row = el('tr');
    const cells = [
      `${formatDateLong(appointment.date)} · ${formatTime(appointment.time)}`,
      appointment.patientName,
      appointment.phone,
      doctor ? doctor.name : 'Unknown',
      appointment.reason,
    ];
    cells.forEach((text) => row.append(el('td', '', text)));
    const statusCell = el('td');
    statusCell.append(statusBadge(appointment.status));
    row.append(statusCell);
    return row;
  });
  tbody.replaceChildren(...rows);
}