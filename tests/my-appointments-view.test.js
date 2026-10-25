// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { statusBadge, renderAppointments } from '../src/js/my-appointments-view.js';

const doctors = [{ id: 1, name: 'Dr. Amina Odhiambo' }];
const future = '2099-01-05';
const past = '2020-01-05';

const appointment = (overrides) => ({
  id: 1,
  doctorId: 1,
  date: future,
  time: '10:30',
  reason: 'Follow-up visit',
  status: 'Booked',
  ...overrides,
});

describe('statusBadge', () => {
  it('shows the status with a matching class', () => {
    const badge = statusBadge('Confirmed');
    expect(badge.textContent).toBe('Confirmed');
    expect(badge.className).toBe('badge badge-confirmed');
  });
});

describe('renderAppointments', () => {
  it('renders one card per appointment', () => {
    const container = document.createElement('div');
    renderAppointments(container, [appointment(), appointment({ id: 2 })], doctors);
    expect(container.querySelectorAll('article')).toHaveLength(2);
  });

  it('shows the doctor, time and reason', () => {
    const container = document.createElement('div');
    renderAppointments(container, [appointment()], doctors);
    expect(container.textContent).toContain('Dr. Amina Odhiambo');
    expect(container.textContent).toContain('10:30 AM');
    expect(container.textContent).toContain('Reason: Follow-up visit');
  });

  it('uses a fallback name when the doctor is not found', () => {
    const container = document.createElement('div');
    renderAppointments(container, [appointment({ doctorId: 99 })], doctors);
    expect(container.querySelector('h3').textContent).toBe('Doctor');
  });

  it('does not show buttons without handlers', () => {
    const container = document.createElement('div');
    renderAppointments(container, [appointment()], doctors);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('shows Reschedule and Cancel for an upcoming appointment', () => {
    const container = document.createElement('div');
    renderAppointments(container, [appointment()], doctors, {
      onReschedule: () => {},
      onCancel: () => {},
    });
    const labels = [...container.querySelectorAll('button')].map((b) => b.textContent);
    expect(labels).toEqual(['Reschedule', 'Cancel']);
  });

  it('hides the buttons for completed, cancelled and past appointments', () => {
    const container = document.createElement('div');
    const handlers = { onReschedule: () => {}, onCancel: () => {} };
    renderAppointments(
      container,
      [appointment({ status: 'Completed' }), appointment({ status: 'Cancelled' }), appointment({ date: past })],
      doctors,
      handlers
    );
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('calls the handlers with the appointment when clicked', () => {
    const onReschedule = vi.fn();
    const onCancel = vi.fn();
    const item = appointment();
    const container = document.createElement('div');
    renderAppointments(container, [item], doctors, { onReschedule, onCancel });
    const [reschedule, cancel] = container.querySelectorAll('button');
    reschedule.click();
    cancel.click();
    expect(onReschedule).toHaveBeenCalledWith(item);
    expect(onCancel).toHaveBeenCalledWith(item);
  });
});