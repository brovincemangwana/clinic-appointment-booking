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