import { timeToMinutes } from './slots.js';
import { todayISO } from './validation.js';

export const SLOT_OPTIONS = [10, 15, 20, 30, 45, 60];

const TIME_PATTERN = /^\d{2}:\d{2}$/;

export function validateDoctor(values) {
  const errors = {};
  const name = String(values.name ?? '').trim();
  const specialty = String(values.specialty ?? '').trim();
  const slot = Number(values.slotMinutes);

  if (!name) errors.name = 'Enter a name for the doctor.';
  else if (name.length < 2) errors.name = 'Name must be at least 2 characters.';

  if (!specialty) errors.specialty = 'Enter a specialty.';

  if (!values.days || values.days.length === 0) errors.days = 'Choose at least one working day.';

  const startOk = TIME_PATTERN.test(String(values.startTime ?? ''));
  const endOk = TIME_PATTERN.test(String(values.endTime ?? ''));
  if (!startOk || !endOk) {
    errors.time = 'Enter a start and end time.';
  } else {
    const minutes = timeToMinutes(values.endTime) - timeToMinutes(values.startTime);
    if (minutes <= 0) errors.time = 'End time must be after start time.';
    else if (Number.isInteger(slot) && slot > 0 && minutes < slot) {
      errors.time = 'The working hours must fit at least one slot.';
    }
  }

  if (!Number.isInteger(slot) || slot < 10 || slot > 120) {
    errors.slotMinutes = 'Slot length must be between 10 and 120 minutes.';
  }
  return errors;
}

export function buildDoctor({ name, specialty, days, startTime, endTime, slotMinutes, available }) {
  return {
    name: name.trim(),
    specialty: specialty.trim(),
    workingDays: [...new Set(days.map(Number))].sort((a, b) => a - b),
    startTime,
    endTime,
    slotMinutes: Number(slotMinutes),
    available: Boolean(available),
  };
}

export function hasActiveAppointments(list, doctorId, today = todayISO()) {
  return list.some(
    (a) =>
      a.doctorId === Number(doctorId) &&
      a.date >= today &&
      ['Booked', 'Confirmed'].includes(a.status)
  );
}