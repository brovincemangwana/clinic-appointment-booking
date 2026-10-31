// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getToken, isLoggedIn, logout, login, requireStaff } from '../src/js/auth.js';

const KEY = 'medibook-staff-token';
const save = (token, expiresAt) =>
  sessionStorage.setItem(KEY, JSON.stringify({ token, expiresAt }));

const reply = (status, body = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

beforeEach(() => sessionStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('stored token', () => {
  it('is empty when nothing is saved', () => {
    expect(getToken()).toBe('');
    expect(isLoggedIn()).toBe(false);
  });

  it('is returned while it is valid', () => {
    save('abc', 5000);
    expect(getToken(1000)).toBe('abc');
    expect(isLoggedIn(1000)).toBe(true);
  });

  it('is ignored once it has expired', () => {
    save('abc', 5000);
    expect(getToken(5000)).toBe('');
    expect(isLoggedIn(6000)).toBe(false);
  });

  it('is ignored when storage holds something unreadable', () => {
    sessionStorage.setItem(KEY, 'not json');
    expect(getToken()).toBe('');
    sessionStorage.setItem(KEY, JSON.stringify({ token: 5, expiresAt: Date.now() + 1000 }));
    expect(getToken()).toBe('');
  });

  it('is removed on logout', () => {
    save('abc', Date.now() + 60000);
    logout();
    expect(isLoggedIn()).toBe(false);
  });
});

describe('login', () => {
  it('saves the token and sends the password', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(200, { token: 'tok', expiresAt: Date.now() + 60000 }));
    vi.stubGlobal('fetch', fetchMock);
    await login('pw');
    expect(getToken()).toBe('tok');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.endsWith('/login')).toBe(true);
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify({ password: 'pw' }));
  });

  it('rejects a wrong password', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(401)));
    await expect(login('bad')).rejects.toThrow('Incorrect password.');
    expect(isLoggedIn()).toBe(false);
  });

  it('reports too many attempts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(429)));
    await expect(login('x')).rejects.toThrow('Too many attempts. Try again in a few minutes.');
  });

  it('reports other failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(500)));
    await expect(login('x')).rejects.toThrow('Could not log in. Try again.');
  });
});

describe('requireStaff', () => {
  it('lets a logged-in user through', () => {
    save('abc', Date.now() + 60000);
    const go = vi.fn();
    expect(requireStaff('admin.html', go)).toBe(true);
    expect(go).not.toHaveBeenCalled();
  });

  it('sends everyone else to the login page', () => {
    const go = vi.fn();
    expect(requireStaff('admin-doctors.html', go)).toBe(false);
    expect(go).toHaveBeenCalledWith('staff-login.html?next=admin-doctors.html');
  });
});