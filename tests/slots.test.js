import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  formatTime,
  isWorkingDay,
  generateSlots,
  getAvailableSlots,
} from '../src/js/slots.js';

const doctor = {
  id: 1,
  available: true,
  workingDays: [1, 2, 3, 4, 5],
  startTime: '08:00',
  endTime: '10:00',
  slotMinutes: 30,
};

const TUESDAY = '2026-10-27';
const SATURDAY = '2026-10-24';

describe('time conversion', () => {
  it('converts a time to minutes', () => {
    expect(timeToMinutes('08:30')).toBe(510);
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('converts minutes back to a time', () => {
    expect(minutesToTime(510)).toBe('08:30');
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(905)).toBe('15:05');
  });

  it('formats times for display', () => {
    expect(formatTime('14:30')).toBe('2:30 PM');
    expect(formatTime('09:05')).toBe('9:05 AM');
    expect(formatTime('00:00')).toBe('12:00 AM');
    expect(formatTime('12:00')).toBe('12:00 PM');
  });
});

describe('isWorkingDay', () => {
  it('is true on a working day', () => {
    expect(isWorkingDay(doctor, TUESDAY)).toBe(true);
  });

  it('is false on a day off', () => {
    expect(isWorkingDay(doctor, SATURDAY)).toBe(false);
  });
});

describe('generateSlots', () => {
  it('creates slots from start to end time', () => {
    expect(generateSlots(doctor, TUESDAY)).toEqual(['08:00', '08:30', '09:00', '09:30']);
  });

  it('returns no slots on a day off', () => {
    expect(generateSlots(doctor, SATURDAY)).toEqual([]);
  });

  it('returns no slots when the doctor is unavailable', () => {
    expect(generateSlots({ ...doctor, available: false }, TUESDAY)).toEqual([]);
  });

  it('does not create a slot that runs past the end time', () => {
    const d = { ...doctor, startTime: '09:00', endTime: '10:00', slotMinutes: 45 };
    expect(generateSlots(d, TUESDAY)).toEqual(['09:00']);
  });

  it('respects a different slot length', () => {
    const d = { ...doctor, startTime: '09:00', endTime: '10:00', slotMinutes: 20 };
    expect(generateSlots(d, TUESDAY)).toEqual(['09:00', '09:20', '09:40']);
  });
});

describe('getAvailableSlots', () => {
  const appointment = (overrides) => ({
    doctorId: 1,
    date: TUESDAY,
    time: '08:30',
    status: 'Booked',
    ...overrides,
  });

  it('marks booked slots', () => {
    const slots = getAvailableSlots(doctor, TUESDAY, [appointment()]);
    expect(slots.find((s) => s.time === '08:30').booked).toBe(true);
    expect(slots.find((s) => s.time === '08:00').booked).toBe(false);
  });

  it('frees a slot when the appointment is cancelled', () => {
    const slots = getAvailableSlots(doctor, TUESDAY, [appointment({ status: 'Cancelled' })]);
    expect(slots.find((s) => s.time === '08:30').booked).toBe(false);
  });

  it('ignores appointments for other doctors', () => {
    const slots = getAvailableSlots(doctor, TUESDAY, [appointment({ doctorId: 2 })]);
    expect(slots.every((s) => !s.booked)).toBe(true);
  });

  it('ignores appointments on other dates', () => {
    const slots = getAvailableSlots(doctor, TUESDAY, [appointment({ date: '2026-10-28' })]);
    expect(slots.every((s) => !s.booked)).toBe(true);
  });
});