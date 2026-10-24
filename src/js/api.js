import { API_URL } from './config.js';

export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

export function getDoctors({ specialty = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (specialty) params.set('specialty', specialty);
  if (search) params.set('name_like', search);
  const query = params.toString();
  return request(`/doctors${query ? `?${query}` : ''}`);
}

export function getDoctor(id) {
  return request(`/doctors/${id}`);
}

export function getAppointments(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/appointments${query ? `?${query}` : ''}`);
}
export function createAppointment(data) {
  return request('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}