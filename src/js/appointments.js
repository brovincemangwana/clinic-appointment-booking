import { normalizePhone } from './validation.js';

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