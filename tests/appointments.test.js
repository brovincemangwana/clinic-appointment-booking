import { describe, it, expect } from 'vitest';
import { buildAppointment, canModify, sortAppointments, buildRescheduled, countByStatus, filterAppointments, sortChronological, nextStatuses, canTransition } from '../src/js/appointments.js';
const now = new Date('2026-10-24T08:00:00Z');
const form = {
  doctorId: '1',
  name: '  Jane Wanjiru ',
  phone: '+254 712 345 678',
  reason: ' Follow-up visit ',
  date: '2026-10-27',
  time: '10:30',
};

describe('buildAppointment', () => {
  it('builds an appointment in the db.json shape', () => {
    expect(buildAppointment(form, now)).toEqual({
      doctorId: 1,
      patientName: 'Jane Wanjiru',
      phone: '0712345678',
      reason: 'Follow-up visit',
      date: '2026-10-27',
      time: '10:30',
      status: 'Booked',
      createdAt: '2026-10-24T08:00:00.000Z',
    });
  });

  it('converts the doctor id to a number', () => {
    expect(buildAppointment(form, now).doctorId).toBe(1);
  });

  it('stores the phone number in local format', () => {
    expect(buildAppointment({ ...form, phone: '0712 345 678' }, now).phone).toBe('0712345678');
  });

  it('always starts with the Booked status', () => {
    expect(buildAppointment(form, now).status).toBe('Booked');
  });
});

describe('canModify', () => {
  const TODAY = '2026-10-24';
  const base = { status: 'Booked', date: '2026-10-27' };

  it('allows a future Booked appointment', () => {
    expect(canModify(base, TODAY)).toBe(true);
  });

  it('allows a Confirmed appointment today', () => {
    expect(canModify({ status: 'Confirmed', date: TODAY }, TODAY)).toBe(true);
  });

  it('blocks Completed appointments', () => {
    expect(canModify({ ...base, status: 'Completed' }, TODAY)).toBe(false);
  });

  it('blocks Cancelled appointments', () => {
    expect(canModify({ ...base, status: 'Cancelled' }, TODAY)).toBe(false);
  });

  it('blocks appointments in the past', () => {
    expect(canModify({ ...base, date: '2026-10-20' }, TODAY)).toBe(false);
  });
});

describe('sortAppointments', () => {
  const TODAY = '2026-10-24';
  const list = [
    { id: 'a', date: '2026-10-20', time: '10:00' },
    { id: 'b', date: '2026-10-27', time: '09:00' },
    { id: 'c', date: '2026-10-25', time: '11:00' },
    { id: 'd', date: '2026-10-22', time: '08:00' },
  ];

  it('lists upcoming first (soonest first), then past (latest first)', () => {
    expect(sortAppointments(list, TODAY).map((a) => a.id)).toEqual(['c', 'b', 'd', 'a']);
  });

  it('does not change the original array', () => {
    sortAppointments(list, TODAY);
    expect(list.map((a) => a.id)).toEqual(['a', 'b', 'c', 'd']);
  });
});
describe('buildRescheduled', () => {
  const now = new Date('2026-10-24T08:00:00Z');
  const original = {
    id: 1,
    doctorId: 1,
    patientName: 'Jane Wanjiru',
    phone: '0712345678',
    reason: 'Follow-up visit',
    date: '2026-10-27',
    time: '10:30',
    status: 'Confirmed',
    createdAt: '2026-10-22T08:00:00Z',
  };

  it('changes the date and time', () => {
    const result = buildRescheduled(original, { date: '2026-10-28', time: '09:00' }, now);
    expect(result.date).toBe('2026-10-28');
    expect(result.time).toBe('09:00');
  });

  it('keeps the id and patient details', () => {
    const result = buildRescheduled(original, { date: '2026-10-28', time: '09:00' }, now);
    expect(result.id).toBe(1);
    expect(result.patientName).toBe('Jane Wanjiru');
    expect(result.phone).toBe('0712345678');
    expect(result.reason).toBe('Follow-up visit');
  });

  it('resets the status to Booked so staff can confirm again', () => {
    expect(buildRescheduled(original, { date: '2026-10-28', time: '09:00' }, now).status).toBe('Booked');
  });

  it('records when it was updated', () => {
    expect(buildRescheduled(original, { date: '2026-10-28', time: '09:00' }, now).updatedAt).toBe('2026-10-24T08:00:00.000Z');
  });

  it('does not change the original appointment', () => {
    buildRescheduled(original, { date: '2026-10-28', time: '09:00' }, now);
    expect(original.date).toBe('2026-10-27');
    expect(original.status).toBe('Confirmed');
  });
});
describe('admin helpers', () => {
  const list = [
    { id: 1, doctorId: 1, date: '2026-10-27', time: '10:30', status: 'Confirmed' },
    { id: 2, doctorId: 1, date: '2026-10-27', time: '09:30', status: 'Booked' },
    { id: 3, doctorId: 3, date: '2026-10-28', time: '11:00', status: 'Booked' },
    { id: 4, doctorId: 2, date: '2026-10-26', time: '09:00', status: 'Completed' },
    { id: 5, doctorId: 4, date: '2026-10-28', time: '11:30', status: 'Cancelled' },
  ];
  const ids = (items) => items.map((a) => a.id);

  it('counts appointments by status', () => {
    expect(countByStatus(list)).toEqual({
      total: 5,
      Booked: 2,
      Confirmed: 1,
      Completed: 1,
      Cancelled: 1,
    });
  });

  it('filters by date', () => {
    expect(ids(filterAppointments(list, { date: '2026-10-27' }))).toEqual([1, 2]);
  });

  it('filters by doctor', () => {
    expect(ids(filterAppointments(list, { doctorId: '1' }))).toEqual([1, 2]);
  });

  it('filters by status', () => {
    expect(ids(filterAppointments(list, { status: 'Booked' }))).toEqual([2, 3]);
  });

  it('combines filters', () => {
    expect(ids(filterAppointments(list, { date: '2026-10-27', doctorId: '1', status: 'Booked' }))).toEqual([2]);
  });

  it('returns everything when no filters are set', () => {
    expect(ids(filterAppointments(list))).toEqual([1, 2, 3, 4, 5]);
  });

  it('sorts by date and time', () => {
    expect(ids(sortChronological(list))).toEqual([4, 2, 1, 3, 5]);
  });

  it('does not change the original list when sorting', () => {
    sortChronological(list);
    expect(ids(list)).toEqual([1, 2, 3, 4, 5]);
  });
});
describe('status transitions', () => {
  it('lets a Booked appointment be confirmed or cancelled', () => {
    expect(nextStatuses('Booked')).toEqual(['Confirmed', 'Cancelled']);
  });

  it('lets a Confirmed appointment be completed or cancelled', () => {
    expect(nextStatuses('Confirmed')).toEqual(['Completed', 'Cancelled']);
  });

  it('allows no changes once Completed or Cancelled', () => {
    expect(nextStatuses('Completed')).toEqual([]);
    expect(nextStatuses('Cancelled')).toEqual([]);
  });

  it('returns nothing for an unknown status', () => {
    expect(nextStatuses('Pending')).toEqual([]);
  });

  it('returns a copy so callers cannot change the rules', () => {
    nextStatuses('Booked').push('Completed');
    expect(nextStatuses('Booked')).toEqual(['Confirmed', 'Cancelled']);
  });

  it('allows valid transitions', () => {
    expect(canTransition('Booked', 'Confirmed')).toBe(true);
    expect(canTransition('Confirmed', 'Completed')).toBe(true);
  });

  it('blocks moving backwards', () => {
    expect(canTransition('Completed', 'Booked')).toBe(false);
    expect(canTransition('Cancelled', 'Confirmed')).toBe(false);
  });

  it('blocks skipping a step', () => {
    expect(canTransition('Booked', 'Completed')).toBe(false);
  });
});