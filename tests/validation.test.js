import { describe, it, expect } from 'vitest';
import {
  todayISO,
  normalizePhone,
  validateName,
  validatePhone,
  validateReason,
  validateDate,
  validateTime,
  validateBooking,
} from '../src/js/validation.js';

const TODAY = '2026-10-23';

describe('todayISO', () => {
  it('formats a date as YYYY-MM-DD with leading zeros', () => {
    expect(todayISO(new Date(2026, 9, 5))).toBe('2026-10-05');
  });
});

describe('normalizePhone', () => {
  it('accepts local numbers with spaces', () => {
    expect(normalizePhone('0712 345 678')).toBe('0712345678');
  });

  it('converts +254 numbers to local format', () => {
    expect(normalizePhone('+254 712 345 678')).toBe('0712345678');
  });

  it('converts 254 numbers without a plus', () => {
    expect(normalizePhone('254712345678')).toBe('0712345678');
  });

  it('accepts numbers that start with 01', () => {
    expect(normalizePhone('0112345678')).toBe('0112345678');
  });

  it('rejects invalid numbers', () => {
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone('0812345678')).toBeNull();
    expect(normalizePhone('abc')).toBeNull();
    expect(normalizePhone(null)).toBeNull();
  });
});

describe('validateName', () => {
  it('rejects empty or blank names', () => {
    expect(validateName('')).toBe('Enter your full name.');
    expect(validateName('   ')).toBe('Enter your full name.');
  });

  it('rejects names that are too short', () => {
    expect(validateName('A')).toBe('Name must be at least 2 characters.');
  });

  it('accepts a valid name', () => {
    expect(validateName('Jane Wanjiru')).toBe('');
  });
});

describe('validatePhone', () => {
  it('rejects an empty number', () => {
    expect(validatePhone('')).toBe('Enter your phone number.');
  });

  it('rejects an invalid number', () => {
    expect(validatePhone('abc')).toBe('Enter a valid Kenyan number, like 0712 345 678.');
  });

  it('accepts a valid number', () => {
    expect(validatePhone('0712 345 678')).toBe('');
  });
});

describe('validateReason', () => {
  it('rejects an empty reason', () => {
    expect(validateReason('')).toBe('Tell us briefly why you are visiting.');
  });

  it('rejects a reason that is too short', () => {
    expect(validateReason('ab')).toBe('Reason must be at least 3 characters.');
  });

  it('rejects a reason that is too long', () => {
    expect(validateReason('x'.repeat(201))).toBe('Reason must be 200 characters or fewer.');
  });

  it('accepts a valid reason', () => {
    expect(validateReason('Cough')).toBe('');
  });
});

describe('validateDate', () => {
  it('accepts today', () => {
    expect(validateDate(TODAY, TODAY)).toBe('');
  });

  it('accepts a future date', () => {
    expect(validateDate('2026-10-30', TODAY)).toBe('');
  });

  it('rejects a past date', () => {
    expect(validateDate('2026-10-22', TODAY)).toBe('Choose a date that is not in the past.');
  });

  it('rejects a missing or malformed date', () => {
    expect(validateDate('', TODAY)).toBe('Choose a date.');
    expect(validateDate('tomorrow', TODAY)).toBe('Choose a date.');
  });
});

describe('validateTime', () => {
  it('accepts a valid time', () => {
    expect(validateTime('10:30')).toBe('');
  });

  it('rejects a missing time', () => {
    expect(validateTime('')).toBe('Choose a time slot.');
  });

  it('rejects a time without a two-digit hour', () => {
    expect(validateTime('9:30')).toBe('Choose a time slot.');
  });
});

describe('validateBooking', () => {
  it('returns no errors for a valid booking', () => {
    const form = {
      name: 'Jane Wanjiru',
      phone: '0712 345 678',
      reason: 'Follow-up visit',
      date: '2026-10-27',
      time: '10:30',
    };
    expect(validateBooking(form, TODAY)).toEqual({});
  });

  it('collects an error for each invalid field', () => {
    const form = { name: '', phone: 'abc', reason: 'Cough', date: '2020-01-01', time: '' };
    const errors = validateBooking(form, TODAY);
    expect(Object.keys(errors).sort()).toEqual(['date', 'name', 'phone', 'time']);
  });
});