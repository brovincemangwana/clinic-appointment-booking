import { el } from './ui.js';
import { formatDateLong } from './dates.js';
import { formatTime } from './slots.js';
import { canModify } from './appointments.js';

export function statusBadge(status) {
  return el('span', `badge badge-${status.toLowerCase()}`, status);
}

function actionButton(label, className, onClick) {
  const button = el('button', className, label);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
}

export function renderAppointments(container, appointments, doctors, handlers = {}) {
  const byId = new Map(doctors.map((d) => [d.id, d]));
  const cards = appointments.map((appointment) => {
    const doctor = byId.get(appointment.doctorId);
    const card = el('article', 'card appt');

    const info = el('div');
    info.append(
      el('h3', '', doctor ? doctor.name : 'Doctor'),
      el('p', '', `${formatDateLong(appointment.date)} · ${formatTime(appointment.time)}`),
      el('p', 'muted small', `Reason: ${appointment.reason}`)
    );

    const side = el('div', 'appt-actions');
    side.append(statusBadge(appointment.status));
    if (canModify(appointment)) {
      if (handlers.onReschedule) {
        side.append(actionButton('Reschedule', 'btn', () => handlers.onReschedule(appointment)));
      }
      if (handlers.onCancel) {
        side.append(actionButton('Cancel', 'btn danger', () => handlers.onCancel(appointment)));
      }
    }

    card.append(info, side);
    return card;
  });
  container.replaceChildren(...cards);
}