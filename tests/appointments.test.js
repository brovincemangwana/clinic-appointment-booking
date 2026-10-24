import { describe, it, expect } from 'vitest';
import { buildAppointment } from '../src/js/appointments.js';

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