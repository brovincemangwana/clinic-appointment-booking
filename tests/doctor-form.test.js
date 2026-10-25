import { describe, it, expect } from 'vitest';
import { validateDoctor, buildDoctor, hasActiveAppointments } from '../src/js/doctor-form.js';

const valid = {
  name: 'Dr. Amina Odhiambo',
  specialty: 'General practitioner',
  days: [1, 2, 3, 4, 5],
  startTime: '08:00',
  endTime: '17:00',
  slotMinutes: '30',
  available: true,
};

describe('validateDoctor', () => {
  it('accepts a valid doctor', () => {
    expect(validateDoctor(valid)).toEqual({});
  });

  it('requires a name', () => {
    expect(validateDoctor({ ...valid, name: '   ' }).name).toBe('Enter a name for the doctor.');
  });

  it('rejects a one-letter name', () => {
    expect(validateDoctor({ ...valid, name: 'A' }).name).toBe('Name must be at least 2 characters.');
  });

  it('requires a specialty', () => {
    expect(validateDoctor({ ...valid, specialty: '' }).specialty).toBe('Enter a specialty.');
  });

  it('requires at least one working day', () => {
    expect(validateDoctor({ ...valid, days: [] }).days).toBe('Choose at least one working day.');
  });

  it('requires start and end times', () => {
    expect(validateDoctor({ ...valid, startTime: '' }).time).toBe('Enter a start and end time.');
  });

  it('rejects an end time that is not after the start time', () => {
    expect(validateDoctor({ ...valid, endTime: '08:00' }).time).toBe('End time must be after start time.');
    expect(validateDoctor({ ...valid, endTime: '07:00' }).time).toBe('End time must be after start time.');
  });

  it('rejects working hours shorter than one slot', () => {
    const errors = validateDoctor({ ...valid, startTime: '08:00', endTime: '08:20' });
    expect(errors.time).toBe('The working hours must fit at least one slot.');
  });

  it('rejects slot lengths outside 10 to 120 minutes', () => {
    const message = 'Slot length must be between 10 and 120 minutes.';
    expect(validateDoctor({ ...valid, slotMinutes: '5' }).slotMinutes).toBe(message);
    expect(validateDoctor({ ...valid, slotMinutes: '150' }).slotMinutes).toBe(message);
    expect(validateDoctor({ ...valid, slotMinutes: 'abc' }).slotMinutes).toBe(message);
  });

  it('collects several errors at once', () => {
    const errors = validateDoctor({ ...valid, name: '', specialty: '', days: [] });
    expect(Object.keys(errors).sort()).toEqual(['days', 'name', 'specialty']);
  });
});

describe('buildDoctor', () => {
  it('builds a doctor in the db.json shape', () => {
    const doctor = buildDoctor({
      ...valid,
      name: '  Dr. Amina Odhiambo ',
      specialty: ' General practitioner ',
    });
    expect(doctor).toEqual({
      name: 'Dr. Amina Odhiambo',
      specialty: 'General practitioner',
      workingDays: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '17:00',
      slotMinutes: 30,
      available: true,
    });
  });

  it('sorts working days and removes duplicates', () => {
    expect(buildDoctor({ ...valid, days: [5, 1, 3, 1, 0] }).workingDays).toEqual([0, 1, 3, 5]);
  });

  it('converts the slot length to a number', () => {
    expect(buildDoctor({ ...valid, slotMinutes: '45' }).slotMinutes).toBe(45);
  });

  it('turns the availability checkbox into a boolean', () => {
    expect(buildDoctor({ ...valid, available: false }).available).toBe(false);
    expect(buildDoctor({ ...valid, available: undefined }).available).toBe(false);
  });
});

describe('hasActiveAppointments', () => {
  const TODAY = '2026-10-24';
  const list = [
    { doctorId: 1, date: '2026-10-27', status: 'Booked' },
    { doctorId: 2, date: '2026-10-20', status: 'Booked' },
    { doctorId: 3, date: '2026-10-27', status: 'Cancelled' },
    { doctorId: 4, date: '2026-10-27', status: 'Completed' },
    { doctorId: 6, date: '2026-10-24', status: 'Confirmed' },
  ];

  it('is true for an upcoming Booked appointment', () => {
    expect(hasActiveAppointments(list, 1, TODAY)).toBe(true);
  });

  it('ignores appointments in the past', () => {
    expect(hasActiveAppointments(list, 2, TODAY)).toBe(false);
  });

  it('ignores Cancelled appointments', () => {
    expect(hasActiveAppointments(list, 3, TODAY)).toBe(false);
  });

  it('ignores Completed appointments', () => {
    expect(hasActiveAppointments(list, 4, TODAY)).toBe(false);
  });

  it('is false for a doctor with no appointments', () => {
    expect(hasActiveAppointments(list, 5, TODAY)).toBe(false);
  });

  it('accepts the doctor id as a string', () => {
    expect(hasActiveAppointments(list, '1', TODAY)).toBe(true);
  });

  it('counts an appointment today', () => {
    expect(hasActiveAppointments(list, 6, TODAY)).toBe(true);
  });
});
describe('validateDoctor with missing values', () => {
  it('reports every required field when nothing is provided', () => {
    const errors = validateDoctor({});
    expect(Object.keys(errors).sort()).toEqual(['days', 'name', 'slotMinutes', 'specialty', 'time']);
  });
});