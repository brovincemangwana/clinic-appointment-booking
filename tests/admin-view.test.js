// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderStats, fillDoctorOptions, renderRows } from '../src/js/admin-view.js';

const doctors = [
  { id: 1, name: 'Dr. Amina Odhiambo' },
  { id: 2, name: 'Dr. Peter Kamau' },
];

const appointment = (overrides) => ({
  id: 1,
  doctorId: 1,
  patientName: 'Jane Wanjiru',
  phone: '0712345678',
  reason: 'Follow-up visit',
  date: '2026-10-27',
  time: '10:30',
  status: 'Booked',
  ...overrides,
});

describe('renderStats', () => {
  it('renders four stat cards with the counts', () => {
    const container = document.createElement('div');
    renderStats(container, { total: 6, Booked: 2, Confirmed: 1, Completed: 2, Cancelled: 1 });
    const cards = container.querySelectorAll('.stat');
    expect(cards).toHaveLength(4);
    expect([...cards].map((c) => c.querySelector('b').textContent)).toEqual(['6', '2', '1', '2']);
    expect(cards[0].textContent).toContain('Total');
  });
});

describe('fillDoctorOptions', () => {
  it('adds an option for each doctor', () => {
    const select = document.createElement('select');
    select.append(new Option('All doctors', ''));
    fillDoctorOptions(select, doctors);
    expect([...select.options].map((o) => o.value)).toEqual(['', '1', '2']);
    expect(select.options[1].textContent).toBe('Dr. Amina Odhiambo');
  });
});

describe('renderRows', () => {
  it('shows a message when there are no appointments', () => {
    const tbody = document.createElement('tbody');
    renderRows(tbody, [], doctors, () => {});
    expect(tbody.textContent).toBe('No appointments match these filters.');
    expect(tbody.querySelector('td').colSpan).toBe(7);
  });

  it('renders one row per appointment with all the details', () => {
    const tbody = document.createElement('tbody');
    renderRows(tbody, [appointment()], doctors, () => {});
    const cells = [...tbody.querySelectorAll('td')].map((c) => c.textContent);
    expect(tbody.querySelectorAll('tr')).toHaveLength(1);
    expect(cells[0]).toBe('Tue, 27 Oct · 10:30 AM');
    expect(cells.slice(1, 5)).toEqual(['Jane Wanjiru', '0712345678', 'Dr. Amina Odhiambo', 'Follow-up visit']);
    expect(cells[5]).toBe('Booked');
  });

  it('shows Unknown when the doctor is missing', () => {
    const tbody = document.createElement('tbody');
    renderRows(tbody, [appointment({ doctorId: 99 })], doctors, () => {});
    expect(tbody.querySelectorAll('td')[3].textContent).toBe('Unknown');
  });

  it('shows Confirm and Cancel for a Booked appointment', () => {
    const tbody = document.createElement('tbody');
    renderRows(tbody, [appointment({ status: 'Booked' })], doctors, () => {});
    const labels = [...tbody.querySelectorAll('button')].map((b) => b.textContent);
    expect(labels).toEqual(['Confirm', 'Cancel']);
  });

  it('shows Complete and Cancel for a Confirmed appointment', () => {
    const tbody = document.createElement('tbody');
    renderRows(tbody, [appointment({ status: 'Confirmed' })], doctors, () => {});
    const labels = [...tbody.querySelectorAll('button')].map((b) => b.textContent);
    expect(labels).toEqual(['Complete', 'Cancel']);
  });

  it('shows no buttons for Completed and Cancelled appointments', () => {
    const tbody = document.createElement('tbody');
    renderRows(
      tbody,
      [appointment({ status: 'Completed' }), appointment({ id: 2, status: 'Cancelled' })],
      doctors,
      () => {}
    );
    expect(tbody.querySelectorAll('button')).toHaveLength(0);
  });

  it('calls the handler with the appointment and new status, then disables the buttons', () => {
    const onStatus = vi.fn();
    const item = appointment({ status: 'Booked' });
    const tbody = document.createElement('tbody');
    renderRows(tbody, [item], doctors, onStatus);
    const [confirm, cancel] = tbody.querySelectorAll('button');
    confirm.click();
    expect(onStatus).toHaveBeenCalledWith(item, 'Confirmed');
    expect(confirm.disabled).toBe(true);
    expect(cancel.disabled).toBe(true);
  });

  it('styles the Cancel button as dangerous', () => {
    const tbody = document.createElement('tbody');
    renderRows(tbody, [appointment({ status: 'Booked' })], doctors, () => {});
    const cancel = tbody.querySelectorAll('button')[1];
    expect(cancel.classList.contains('danger')).toBe(true);
  });
});