import { describe, it, expect } from 'vitest';
import { buildAppointment, canModify, sortAppointments } from '../src/js/appointments.js';

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