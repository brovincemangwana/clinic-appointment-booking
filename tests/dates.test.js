import { describe, it, expect } from 'vitest';
import {
  toISODate,
  parseISODate,
  getUpcomingDates,
  formatDateShort,
  formatDateLong,
} from '../src/js/dates.js';

const doctor = { available: true, workingDays: [1, 2, 3, 4, 5] };

describe('toISODate', () => {
  it('formats a date with leading zeros', () => {
    expect(toISODate(new Date(2026, 9, 5))).toBe('2026-10-05');
  });
});

describe('parseISODate', () => {
  it('turns an ISO string back into a local date', () => {
    const date = parseISODate('2026-10-27');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(27);
  });
});

describe('getUpcomingDates', () => {
  it('starts today when the doctor works today', () => {
    const friday = new Date(2026, 9, 23);
    expect(getUpcomingDates(doctor, 3, friday)).toEqual(['2026-10-23', '2026-10-26', '2026-10-27']);
  });

  it('skips days off', () => {
    const saturday = new Date(2026, 9, 24);
    expect(getUpcomingDates(doctor, 2, saturday)).toEqual(['2026-10-26', '2026-10-27']);
  });

  it('continues across a month boundary', () => {
    const friday = new Date(2026, 9, 30);
    expect(getUpcomingDates(doctor, 3, friday)).toEqual(['2026-10-30', '2026-11-02', '2026-11-03']);
  });

  it('returns nothing when the doctor is unavailable', () => {
    expect(getUpcomingDates({ ...doctor, available: false }, 3, new Date(2026, 9, 23))).toEqual([]);
  });

  it('returns nothing when the doctor has no working days', () => {
    expect(getUpcomingDates({ available: true, workingDays: [] }, 3, new Date(2026, 9, 23))).toEqual([]);
  });
});

describe('date formatting', () => {
  it('formats a short label for the date picker', () => {
    expect(formatDateShort('2026-10-27')).toEqual({ weekday: 'Tue', day: 27 });
  });

  it('formats a long label for the summary', () => {
    expect(formatDateLong('2026-10-27')).toBe('Tue, 27 Oct');
  });
});