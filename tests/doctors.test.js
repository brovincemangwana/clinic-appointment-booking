import { describe, it, expect } from 'vitest';
import { formatDays } from '../src/js/doctors.js';

describe('formatDays', () => {
  it('shows a range for consecutive days', () => {
    expect(formatDays([1, 2, 3, 4, 5])).toBe('Mon – Fri');
  });

  it('lists days that are not consecutive', () => {
    expect(formatDays([1, 3, 5])).toBe('Mon, Wed, Fri');
  });

  it('handles a single day', () => {
    expect(formatDays([2])).toBe('Tue');
  });

  it('sorts days before formatting', () => {
    expect(formatDays([5, 3, 4])).toBe('Wed – Fri');
  });
});