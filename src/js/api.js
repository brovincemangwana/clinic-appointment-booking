import { API_URL } from "./config.js";
import { getToken, logout } from "./auth.js";

export async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!response.ok) {
    if (response.status === 401 && token) {
      logout();
      if (typeof window !== "undefined")
        window.location.replace("staff-login.html");
    }
    const error = new Error(`Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

export function getDoctors({ specialty = "", search = "" } = {}) {
  const params = new URLSearchParams();
  if (specialty) params.set("specialty", specialty);
  if (search) params.set("name_like", search);
  const query = params.toString();
  return request(`/doctors${query ? `?${query}` : ""}`);
}

export function getDoctor(id) {
  return request(`/doctors/${id}`);
}

export function getAppointments(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/appointments${query ? `?${query}` : ""}`);
}
export function createAppointment(data) {
  return request("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export function updateAppointment(id, data) {
  return request(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function patchAppointment(id, data) {
  return request(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
export function createDoctor(data) {
  return request("/doctors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDoctor(id, data) {
  return request(`/doctors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteDoctor(id) {
  return request(`/doctors/${id}`, { method: "DELETE" });
}
