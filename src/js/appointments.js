import { normalizePhone, todayISO } from './validation.js';

export function buildAppointment(
  { doctorId, name, phone, reason, date, time },
  now = new Date()
) {
  return {
    doctorId: Number(doctorId),
    patientName: name.trim(),
    phone: normalizePhone(phone),
    reason: reason.trim(),
    date,
    time,
    status: 'Booked',
    createdAt: now.toISOString(),
  };
}

export function canModify(appointment, today = todayISO()) {
  return ['Booked', 'Confirmed'].includes(appointment.status) && appointment.date >= today;
}

export function sortAppointments(list, today = todayISO()) {
  const byDate = (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
  const upcoming = list.filter((a) => a.date >= today).sort(byDate);
  const past = list.filter((a) => a.date < today).sort((a, b) => byDate(b, a));
  return [...upcoming, ...past];
}

export function buildRescheduled(appointment, { date, time }, now = new Date()) {
  return {
    ...appointment,
    date,
    time,
    status: 'Booked',
    updatedAt: now.toISOString(),
  };
}
export function countByStatus(list) {
  const counts = { total: list.length, Booked: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
  list.forEach((a) => {
    if (a.status in counts) counts[a.status] += 1;
  });
  return counts;
}

export function filterAppointments(list, { date = '', doctorId = '', status = '' } = {}) {
  return list.filter(
    (a) =>
      (!date || a.date === date) &&
      (!doctorId || a.doctorId === Number(doctorId)) &&
      (!status || a.status === status)
  );
}

export function sortChronological(list) {
  return [...list].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}