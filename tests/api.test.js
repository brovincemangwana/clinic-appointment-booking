import { describe, it, expect, vi, afterEach } from 'vitest';
import * as api from '../src/js/api.js';
import { API_URL } from '../src/js/config.js';

function mockFetch(body = {}, { ok = true, status = 200 } = {}) {
  const fn = vi.fn().mockResolvedValue({ ok, status, json: async () => body });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('request', () => {
  it('returns the parsed JSON response', async () => {
    mockFetch([{ id: 1 }]);
    expect(await api.request('/doctors')).toEqual([{ id: 1 }]);
  });

  it('sends the API url and a JSON content type', async () => {
    const fetchMock = mockFetch([]);
    await api.request('/doctors');
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/doctors`,
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
    );
  });

  it('throws when the response is not ok', async () => {
    mockFetch({}, { ok: false, status: 404 });
    await expect(api.request('/doctors/999')).rejects.toThrow('Request failed (404)');
  });

  it('returns null for a 204 response', async () => {
    mockFetch({}, { status: 204 });
    expect(await api.request('/doctors/1', { method: 'DELETE' })).toBeNull();
  });
});

describe('GET requests', () => {
  it('gets all doctors', async () => {
    const fetchMock = mockFetch([]);
    await api.getDoctors();
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/doctors`);
  });

  it('filters doctors by specialty and name', async () => {
    const fetchMock = mockFetch([]);
    await api.getDoctors({ specialty: 'Dentist', search: 'Grace' });
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/doctors?specialty=Dentist&name_like=Grace`);
  });

  it('gets one doctor', async () => {
    const fetchMock = mockFetch({ id: 3 });
    expect(await api.getDoctor(3)).toEqual({ id: 3 });
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/doctors/3`);
  });

  it('gets all appointments', async () => {
    const fetchMock = mockFetch([]);
    await api.getAppointments();
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/appointments`);
  });

  it('filters appointments with query parameters', async () => {
    const fetchMock = mockFetch([]);
    await api.getAppointments({ doctorId: 1, date: '2026-10-27' });
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/appointments?doctorId=1&date=2026-10-27`);
  });
});

describe('write requests', () => {
  const data = { name: 'Test' };
  const cases = [
    ['createAppointment', () => api.createAppointment(data), 'POST', '/appointments'],
    ['updateAppointment', () => api.updateAppointment(5, data), 'PUT', '/appointments/5'],
    ['patchAppointment', () => api.patchAppointment(5, data), 'PATCH', '/appointments/5'],
    ['createDoctor', () => api.createDoctor(data), 'POST', '/doctors'],
    ['updateDoctor', () => api.updateDoctor(2, data), 'PUT', '/doctors/2'],
  ];

  it.each(cases)('%s sends the right method, url and body', async (_name, call, method, path) => {
    const fetchMock = mockFetch({ id: 1 });
    await call();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}${path}`);
    expect(options.method).toBe(method);
    expect(options.body).toBe(JSON.stringify(data));
  });

  it('deleteDoctor sends DELETE and returns null', async () => {
    const fetchMock = mockFetch({}, { status: 204 });
    expect(await api.deleteDoctor(4)).toBeNull();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/doctors/4`);
    expect(options.method).toBe('DELETE');
  });
});