// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadPage, flush } from './helpers.js';

const api = vi.hoisted(() => ({
  getAppointments: vi.fn(),
  getDoctors: vi.fn(),
  patchAppointment: vi.fn(),
}));
vi.mock('../src/js/api.js', () => api);

const doctors = [
  { id: 1, name: 'Dr. Amina Odhiambo' },
  { id: 2, name: 'Dr. Peter Kamau' },
];

const make = (overrides) => ({
  id: 1,
  doctorId: 1,
  patientName: 'Jane Wanjiru',
  phone: '0712345678',
  reason: 'Follow-up visit',
  date: '2026-10-27',
  time: '10:30',
  status: 'Confirmed',
  ...overrides,
});

const appointments = [
  make({ id: 1 }),
  make({ id: 2, patientName: 'Brian Kiptoo', time: '09:30', status: 'Booked' }),
  make({ id: 3, doctorId: 2, patientName: 'Lucy Chebet', date: '2026-10-28', time: '14:00', status: 'Booked' }),
  make({ id: 4, patientName: 'Mary Akinyi', date: '2026-10-26', time: '09:00', status: 'Completed' }),
];

async function openPage() {
  vi.resetModules();
  loadPage('admin.html');
  const module = await import('../src/js/admin.js');
  await flush();
  return module;
}

const rows = () => document.querySelectorAll('#rows tr');
const status = () => document.querySelector('#status');
const button = (label) =>
  [...document.querySelectorAll('#rows button')].find((b) => b.textContent === label);
const filterBy = (selector, value) => {
  document.querySelector(selector).value = value;
  document.querySelector('#filters').dispatchEvent(new Event('input'));
};

beforeEach(() => {
  api.getAppointments.mockReset();
  api.getDoctors.mockReset();
  api.patchAppointment.mockReset();
  api.getAppointments.mockResolvedValue(appointments);
  api.getDoctors.mockResolvedValue(doctors);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('admin appointments page', () => {
  it('shows the appointments in date order with the totals', async () => {
    await openPage();
    expect(rows()).toHaveLength(4);
    expect(rows()[0].textContent).toContain('Mary Akinyi');
    const stats = [...document.querySelectorAll('.stat b')].map((b) => b.textContent);
    expect(stats).toEqual(['4', '2', '1', '1']);
    expect(status().textContent).toBe('');
  });

  it('fills the doctor filter', async () => {
    await openPage();
    const values = [...document.querySelectorAll('#f-doctor option')].map((o) => o.value);
    expect(values).toEqual(['', '1', '2']);
  });

  it('shows an error when the API is down', async () => {
    api.getAppointments.mockRejectedValue(new Error('down'));
    await openPage();
    expect(status().classList.contains('error')).toBe(true);
    expect(status().textContent).toBe('Could not load appointments. Check that the API is running.');
    expect(rows()).toHaveLength(0);
  });

  it('filters by status', async () => {
    await openPage();
    filterBy('#f-status', 'Booked');
    expect(rows()).toHaveLength(2);
  });

  it('filters by date', async () => {
    await openPage();
    filterBy('#f-date', '2026-10-28');
    expect(rows()).toHaveLength(1);
    expect(rows()[0].textContent).toContain('Lucy Chebet');
  });

  it('filters by doctor', async () => {
    await openPage();
    filterBy('#f-doctor', '2');
    expect(rows()).toHaveLength(1);
  });

  it('says so when no appointment matches', async () => {
    await openPage();
    filterBy('#f-status', 'Cancelled');
    expect(rows()).toHaveLength(1);
    expect(rows()[0].textContent).toBe('No appointments match these filters.');
  });

  it('clears the filters with Reset', async () => {
    await openPage();
    filterBy('#f-status', 'Booked');
    expect(rows()).toHaveLength(2);
    document.querySelector('#clear-filters').click();
    expect(rows()).toHaveLength(4);
    expect(document.querySelector('#f-status').value).toBe('');
  });
});

describe('changing a status', () => {
  it('confirms a Booked appointment', async () => {
    api.patchAppointment.mockResolvedValue({ ...appointments[1], status: 'Confirmed' });
    await openPage();
    button('Confirm').click();
    await flush();
    expect(api.patchAppointment).toHaveBeenCalledWith(2, { status: 'Confirmed' });
    expect(status().classList.contains('success')).toBe(true);
    expect(status().textContent).toBe("Brian Kiptoo's appointment is now Confirmed.");
    const stats = [...document.querySelectorAll('.stat b')].map((b) => b.textContent);
    expect(stats).toEqual(['4', '1', '2', '1']);
  });

  it('does nothing when the admin declines to cancel', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await openPage();
    button('Cancel').click();
    await flush();
    expect(confirm).toHaveBeenCalledWith("Cancel Brian Kiptoo's appointment?");
    expect(api.patchAppointment).not.toHaveBeenCalled();
  });

  it('cancels an appointment after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.patchAppointment.mockResolvedValue({ ...appointments[1], status: 'Cancelled' });
    await openPage();
    button('Cancel').click();
    await flush();
    expect(api.patchAppointment).toHaveBeenCalledWith(2, { status: 'Cancelled' });
    expect(status().textContent).toBe("Brian Kiptoo's appointment is now Cancelled.");
  });

  it('shows an error when the update fails', async () => {
    api.patchAppointment.mockRejectedValue(new Error('down'));
    await openPage();
    button('Confirm').click();
    await flush();
    expect(status().classList.contains('error')).toBe(true);
    expect(status().textContent).toBe('Could not update the status. Check that the API is running and try again.');
    expect(rows()).toHaveLength(4);
  });

  it('refuses a status change that is not allowed', async () => {
    const { changeStatus } = await openPage();
    await changeStatus(make({ status: 'Completed' }), 'Booked');
    expect(status().textContent).toBe('A Completed appointment cannot be changed to Booked.');
    expect(api.patchAppointment).not.toHaveBeenCalled();
  });
});