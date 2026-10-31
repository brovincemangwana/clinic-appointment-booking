import { API_URL } from './config.js';

const KEY = 'medibook-staff-token';

function read() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(now = Date.now()) {
  const saved = read();
  if (!saved || typeof saved.token !== 'string' || !(saved.expiresAt > now)) return '';
  return saved.token;
}

export function isLoggedIn(now = Date.now()) {
  return getToken(now) !== '';
}

export function logout() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // storage unavailable: nothing to clear
  }
}

export async function login(password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (response.status === 401) throw new Error('Incorrect password.');
  if (response.status === 429) throw new Error('Too many attempts. Try again in a few minutes.');
  if (!response.ok) throw new Error('Could not log in. Try again.');
  const { token, expiresAt } = await response.json();
  sessionStorage.setItem(KEY, JSON.stringify({ token, expiresAt }));
}

export function requireStaff(target = 'admin.html', go = (url) => window.location.replace(url)) {
  if (isLoggedIn()) return true;
  go(`staff-login.html?next=${encodeURIComponent(target)}`);
  return false;
}