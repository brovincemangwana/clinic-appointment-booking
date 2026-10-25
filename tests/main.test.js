// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadPage, flush } from './helpers.js';

const api = vi.hoisted(() => ({ getDoctors: vi.fn() }));
vi.mock('../src/js/api.js', () => api);

const doctors = [
  { id: 1, name: 'Dr. Amina Odhiambo', specialty: 'General practitioner', workingDays: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00' },
  { id: 2, name: 'Dr. Grace Wanjiku', specialty: 'Dentist', workingDays: [1, 3, 5], startTime: '08:00', endTime: '14:00' },
];

async function openPage() {
  vi.resetModules();
  loadPage('index.html');
  await import('../src/js/main.js');
  await flush();
}

const status = () => document.querySelector('#status');
const cards = () => document.querySelectorAll('#doctors article');

beforeEach(() => {
  api.getDoctors.mockReset();
});

describe('doctors page', () => {
  it('loads and shows every doctor', async () => {
    api.getDoctors.mockResolvedValue(doctors);
    await openPage();
    expect(cards()).toHaveLength(2);
    expect(document.querySelector('#count').textContent).toBe('Showing 2 doctors');
    expect(status().textContent).toBe('');
  });

  it('links each card to its booking page', async () => {
    api.getDoctors.mockResolvedValue(doctors);
    await openPage();
    expect(document.querySelector('#doctors a.btn').getAttribute('href')).toBe('booking.html?doctor=1');
  });

  it('fills the specialty filter', async () => {
    api.getDoctors.mockResolvedValue(doctors);
    await openPage();
    const values = [...document.querySelectorAll('#specialty option')].map((o) => o.value);
    expect(values).toEqual(['', 'Dentist', 'General practitioner']);
  });

  it('uses the singular when there is one doctor', async () => {
    api.getDoctors.mockResolvedValue([doctors[0]]);
    await openPage();
    expect(document.querySelector('#count').textContent).toBe('Showing 1 doctor');
  });

  it('says so when no doctors match', async () => {
    api.getDoctors.mockResolvedValue([]);
    await openPage();
    expect(cards()).toHaveLength(0);
    expect(status().textContent).toBe('No doctors match your search.');
  });

  it('shows an error when the API is down', async () => {
    api.getDoctors.mockRejectedValue(new Error('down'));
    await openPage();
    expect(status().classList.contains('error')).toBe(true);
    expect(status().textContent).toBe('Could not load doctors. Check that the API is running.');
    expect(cards()).toHaveLength(0);
    expect(document.querySelector('#count').textContent).toBe('');
  });

  it('applies the search and specialty filters when the form is submitted', async () => {
    api.getDoctors.mockResolvedValue(doctors);
    await openPage();
    document.querySelector('#search').value = '  Grace ';
    document.querySelector('#specialty').value = 'Dentist';
    const submit = new Event('submit', { cancelable: true });
    document.querySelector('#filters').dispatchEvent(submit);
    await flush();
    expect(submit.defaultPrevented).toBe(true);
    expect(api.getDoctors).toHaveBeenLastCalledWith({ specialty: 'Dentist', search: 'Grace' });
  });

  it('reloads when the specialty changes', async () => {
    api.getDoctors.mockResolvedValue(doctors);
    await openPage();
    const before = api.getDoctors.mock.calls.length;
    const select = document.querySelector('#specialty');
    select.value = 'Dentist';
    select.dispatchEvent(new Event('change'));
    await flush();
    expect(api.getDoctors.mock.calls.length).toBe(before + 1);
    expect(api.getDoctors).toHaveBeenLastCalledWith({ specialty: 'Dentist', search: '' });
  });
});